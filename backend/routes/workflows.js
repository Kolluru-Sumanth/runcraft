const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const Workflow = require('../models/Workflow');
const workflowAnalysisService = require('../services/workflowAnalysisService');
const llmWorkflowService = require('../services/llmWorkflowService');
const path = require('path');
const fs = require('fs').promises;

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/json' || file.originalname.endsWith('.json')) {
      cb(null, true);
    } else {
      cb(new Error('Only JSON files are allowed'), false);
    }
  }
});

// @desc    Upload and analyze workflow
// @route   POST /api/workflows/upload
// @access  Private
router.post('/upload', protect, upload.single('workflow'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No workflow file provided'
      });
    }

    // Extract project name from request
    const projectName = req.body.projectName || 'default-project';
    console.log('🏗️ Project name received:', projectName);

    // Parse the JSON file
    let workflowData;
    try {
      workflowData = JSON.parse(req.file.buffer.toString());
    } catch (parseError) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid JSON file format'
      });
    }

    // Validate workflow structure
    if (!workflowData.nodes || !Array.isArray(workflowData.nodes)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid workflow format: missing or invalid nodes array'
      });
    }

    // Analyze workflow for credentials and triggers
    const initialCredentialRequirements = workflowAnalysisService.detectCredentialRequirements(workflowData);
    const triggerInfo = workflowAnalysisService.analyzeTriggers(workflowData, null, projectName);

    // Check if detected credentials actually exist in n8n server
    console.log(`🔍 Checking ${initialCredentialRequirements.length} credential requirements...`);
    const credentialRequirements = await workflowAnalysisService.checkCredentialsExistence(initialCredentialRequirements);
    
    // Count unconfigured credentials
    const unconfiguredCredentials = credentialRequirements.filter(cred => !cred.isConfigured);
    console.log(`📊 Credential check results: ${credentialRequirements.length} total, ${unconfiguredCredentials.length} missing`);
    
    // Log detailed credential status
    if (credentialRequirements.length > 0) {
      console.log('🔑 Credential status details:');
      credentialRequirements.forEach(cred => {
        console.log(`  - ${cred.nodeName} (${cred.credentialType}): ${cred.isConfigured ? '✅ Configured' : '❌ Missing'}`);
      });
    }

    // Create workflow record first to get the ID
    const workflow = new Workflow({
      name: workflowData.name || req.file.originalname.replace('.json', ''),
      description: workflowData.meta?.description || '',
      userId: req.user._id,
      originalFilename: req.file.originalname,
      workflowData,
      credentialRequirements,
      triggerInfo,
      status: unconfiguredCredentials.length > 0 ? 'credentials_pending' : 'ready_to_deploy'
    });

    await workflow.save();

    // Perform LLM analysis with the workflow ID
    let llmAnalysis = null;
    try {
      console.log('🤖 Starting LLM analysis...');
      llmAnalysis = await llmWorkflowService.analyzeWorkflowWithLLM(
        workflowData, 
        workflow._id.toString(), 
        req.user._id.toString()
      );
      console.log('🤖 LLM analysis completed successfully');
      console.log('🤖 LLM analysis type check:', typeof llmAnalysis);
      console.log('🤖 Webhook URLs type:', typeof llmAnalysis?.webhookUrls);
      console.log('🤖 Webhook URLs:', JSON.stringify(llmAnalysis?.webhookUrls, null, 2));
      
      // Create a clean llmAnalysis object WITHOUT webhookUrls first
      const cleanLLMAnalysis = {
        purpose: llmAnalysis.purpose || '',
        inputMethods: Array.isArray(llmAnalysis.inputMethods) ? llmAnalysis.inputMethods : [],
        dataFlow: llmAnalysis.dataFlow || '',
        integrations: Array.isArray(llmAnalysis.integrations) ? llmAnalysis.integrations : [],
        webhookSuggestions: Array.isArray(llmAnalysis.webhookSuggestions) ? llmAnalysis.webhookSuggestions : [],
        urlPatterns: Array.isArray(llmAnalysis.urlPatterns) ? llmAnalysis.urlPatterns : [],
        insights: Array.isArray(llmAnalysis.insights) ? llmAnalysis.insights : [],
        confidence: llmAnalysis.confidence || 'medium',
        generatedAt: new Date(),
        llmModel: llmAnalysis.llmModel || '',
        fallback: Boolean(llmAnalysis.fallback || false),
        // TEMPORARILY EXCLUDE webhookUrls to test schema
        webhookUrls: []
      };
      
      console.log('🔧 Testing save without webhook URLs data...');
      
      // Set the entire llmAnalysis object at once
      workflow.llmAnalysis = cleanLLMAnalysis;
      await workflow.save();
      
      console.log('✅ Save succeeded without webhookUrls! Schema is working for other fields.');
      console.log('🔧 Now testing webhookUrls schema specifically...');
      
      // Try to add just one webhook URL to test the schema
      if (llmAnalysis.webhookUrls && Array.isArray(llmAnalysis.webhookUrls) && llmAnalysis.webhookUrls.length > 0) {
        const testUrl = {
          id: String(llmAnalysis.webhookUrls[0].id || 'test'),
          type: String(llmAnalysis.webhookUrls[0].type || 'test'),
          method: String(llmAnalysis.webhookUrls[0].method || 'POST'),
          url: String(llmAnalysis.webhookUrls[0].url || ''),
          description: String(llmAnalysis.webhookUrls[0].description || ''),
          expectedPayload: String(llmAnalysis.webhookUrls[0].expectedPayload || ''),
          generated: Boolean(llmAnalysis.webhookUrls[0].generated !== undefined ? llmAnalysis.webhookUrls[0].generated : true),
          source: String(llmAnalysis.webhookUrls[0].source || 'system')
        };
        
        console.log('🔧 Testing single webhook URL:', JSON.stringify(testUrl, null, 2));
        
        try {
          workflow.llmAnalysis.webhookUrls = [testUrl];
          await workflow.save();
          console.log('✅ Single webhook URL save succeeded!');
          
          // Now try all webhook URLs
          const allUrls = llmAnalysis.webhookUrls.map(url => ({
            id: String(url.id || ''),
            type: String(url.type || ''),
            method: String(url.method || 'POST'),
            url: String(url.url || ''),
            description: String(url.description || ''),
            expectedPayload: String(url.expectedPayload || ''),
            generated: Boolean(url.generated !== undefined ? url.generated : true),
            source: String(url.source || 'system')
          }));
          
          workflow.llmAnalysis.webhookUrls = allUrls;
          await workflow.save();
          console.log('✅ All webhook URLs saved successfully!');
          
        } catch (webhookError) {
          console.error('❌ Webhook URL schema error:', webhookError.message);
          console.error('❌ This confirms the schema issue is specifically with webhookUrls');
        }
      }
    } catch (llmError) {
      console.error('🤖 LLM analysis failed:', llmError.message);
      console.error('🤖 LLM error stack:', llmError.stack);
      console.warn('⚠️ Continuing with basic analysis (LLM unavailable)');
      // Don't throw error, continue with basic analysis
    }

    // Add to deployment history
    await workflow.addDeploymentHistory('uploaded', 'Workflow uploaded and analyzed');

    // Always deploy to n8n, but only activate if credentials are complete
    let deploymentResult = null;
    
    console.log('🚀 Attempting deployment to n8n server...');
    
    try {
      console.log('📤 Calling workflowAnalysisService.uploadWorkflowToN8n...');
      const deployResult = await workflowAnalysisService.uploadWorkflowToN8n(
        workflow.workflowData,
        `user_${req.user._id}`, // Use user ID as identifier
        req.user, // Pass user info for folder naming
        projectName // Pass custom project name for webhook URLs
      );

      console.log('📥 Deploy result received:', deployResult);

      if (deployResult.success) {
        console.log('✅ Deployment to n8n successful!');
        
        // Update workflow with n8n ID and status
        workflow.n8nWorkflowId = deployResult.workflowId;
        workflow.status = 'deployed';
        workflow.lastDeployment = new Date();

        // Only auto-activate if ALL credentials are configured
        const shouldActivate = unconfiguredCredentials.length === 0;
        
        if (shouldActivate) {
          console.log('� All credentials configured - attempting auto-activation...');
          const activationResult = await workflowAnalysisService.activateWorkflow(deployResult.workflowId);
          if (activationResult.success) {
            // Use model-level activation to set isActive, lastActivation and record history
            await workflow.activate();
            console.log('✅ Workflow auto-activated successfully!');
            
            // Get live webhook URLs from the activated workflow
            console.log('🔗 Retrieving live webhook URLs from activated workflow...');
            try {
              const webhookResult = await workflowAnalysisService.getWorkflowWebhookUrls(deployResult.workflowId);
              
              if (webhookResult.success && webhookResult.webhookUrls.length > 0) {
                console.log(`🔗 Found ${webhookResult.webhookUrls.length} live webhook URLs`);
                
                // Update workflow with live webhook URLs  
                const liveWebhookTriggers = webhookResult.webhookUrls.map(webhook => ({
                  type: 'webhook',
                  nodeId: webhook.nodeId,
                  nodeName: webhook.nodeName,
                  webhookUrl: webhook.webhookUrl,
                  testUrl: webhook.testUrl,
                  method: webhook.method,
                  active: webhook.active,
                  communicationMethod: 'HTTP POST requests to webhook URL',
                  details: `Production: ${webhook.webhookUrl}\nTest: ${webhook.testUrl}`
                }));
                
                // Merge with existing trigger info, avoiding duplicates
                workflow.triggerInfo = workflow.triggerInfo.concat(liveWebhookTriggers);
                
                console.log('📍 Updated with live webhook URLs from n8n');
                console.log('📍 Updated with live webhook URLs:', JSON.stringify(liveWebhookTriggers, null, 2));
                
                // Regenerate webhook usage description with the correct live URLs
                try {
                  console.log('🔤 Regenerating webhook usage description with live URLs...');
                  const updatedWebhookDescription = await llmWorkflowService.generateWebhookUsageDescription(
                    workflow.workflowData, 
                    workflow.triggerInfo
                  );
                  workflow.webhookUsageDescription = updatedWebhookDescription;
                  console.log('✅ Regenerated webhook usage description with live URLs');
                } catch (descriptionError) {
                  console.error('❌ Failed to regenerate webhook description with live URLs:', descriptionError.message);
                }
              }
            } catch (webhookError) {
              console.error('⚠️ Failed to retrieve webhook URLs:', webhookError.message);
              // Don't fail the whole process, just log the error
            }
            
          } else {
            console.log('⚠️ Auto-activation failed:', activationResult.error);
          }
        } else {
          console.log('⏸️ Workflow deployed but not activated - missing credentials:');
          unconfiguredCredentials.forEach(cred => {
            console.log(`  - ${cred.nodeName} requires ${cred.credentialType} credential`);
          });
          workflow.status = 'credentials_pending';
        }

        // Update trigger URLs with the actual n8n workflow ID and project-based paths
        console.log('🔄 Updating trigger info with deployed workflow details...');
        workflow.triggerInfo = workflowAnalysisService.analyzeTriggers(
          workflow.workflowData, 
          deployResult.workflowId,
          projectName
        );
        console.log('🔄 Updated trigger info:', JSON.stringify(workflow.triggerInfo, null, 2));

        // Store live webhook URLs in the Workflow model
        const liveWebhookUrls = workflow.triggerInfo
          .filter(w => w.webhookUrl)
          .map(w => ({
            id: w.nodeId,
            type: w.type,
            method: w.httpMethods || 'POST',
            url: w.webhookUrl,
            description: w.details,
            expectedPayload: '',
            generated: true,
            source: 'n8n'
          }));
        workflow.webhookUrls = liveWebhookUrls;
        await workflow.save();
        await workflow.addDeploymentHistory('deployed', `Deployed with ID: ${deployResult.workflowId}`);

        // Generate webhook usage description if webhooks are available and not already generated with live URLs
        if (workflow.triggerInfo && workflow.triggerInfo.length > 0 && !workflow.webhookUsageDescription) {
          try {
            console.log('🔤 Generating webhook usage description for initial upload (fallback)...');
            const webhookDescription = await llmWorkflowService.generateWebhookUsageDescription(
              workflow.workflowData, 
              workflow.triggerInfo
            );
            workflow.webhookUsageDescription = webhookDescription;
            await workflow.save();
            console.log('✅ Generated webhook usage description for initial upload (fallback)');
          } catch (descriptionError) {
            console.error('❌ Failed to generate webhook description for initial upload:', descriptionError.message);
          }
        }

        deploymentResult = {
          deployed: true,
          workflowId: deployResult.workflowId,
          activated: workflow.status === 'active',
          triggerInfo: workflow.triggerInfo,
          webhookUrls: liveWebhookUrls,
          needsCredentials: unconfiguredCredentials.length > 0,
          missingCredentials: unconfiguredCredentials.map(cred => ({
            nodeName: cred.nodeName,
            credentialType: cred.credentialType,
            credentialName: cred.credentialName
          }))
        };
        
        console.log('📍 Updated trigger URLs:', workflow.triggerInfo);
      } else {
        console.error('❌ Deployment failed:', deployResult.error);
        workflow.status = 'upload_failed';
        deploymentResult = {
          deployed: false,
          error: deployResult.error
        };
      }
    } catch (deployError) {
      console.error('❌ Deployment error:', deployError.message);
      console.error('❌ Full error:', deployError);
      workflow.status = 'upload_failed';
      deploymentResult = {
        deployed: false,
        error: deployError.message
      };
    }

    res.status(201).json({
      status: 'success',
      message: 'Workflow uploaded and analyzed successfully',
      data: {
        workflow: workflow.summary,
        credentialRequirements,
        missingCredentials: unconfiguredCredentials,
        triggerInfo: workflow.triggerInfo,
        llmAnalysis,
        needsCredentials: credentialRequirements.length > 0,
        needsMissingCredentials: unconfiguredCredentials.length > 0,
  webhookUrls: workflow.webhookUrls || [],
        deployment: deploymentResult,
        webhookUsageDescription: workflow.webhookUsageDescription
      }
    });

  } catch (error) {
    console.error('❌ Workflow upload error:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // More specific error messages based on error type
    let errorMessage = 'Error uploading workflow';
    if (error.name === 'ValidationError') {
      errorMessage = 'Validation error: ' + error.message;
    } else if (error.name === 'MongoError') {
      errorMessage = 'Database error occurred';
    } else if (error.message.includes('LLM')) {
      errorMessage = 'AI analysis failed, but workflow was saved';
    }
    
    res.status(500).json({
      status: 'error',
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { 
        errorDetails: error.message,
        errorType: error.name 
      })
    });
  }
});

// @desc    Get user's workflows
// @route   GET /api/workflows
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, active } = req.query;
    
    const options = {};
    if (status) options.status = status;
    if (active !== undefined) options.isActive = active === 'true';

    const workflows = await Workflow.findByUser(req.user._id, options);

    res.json({
      status: 'success',
      data: {
        workflows: workflows.map(w => w.summary),
        count: workflows.length
      }
    });

  } catch (error) {
    console.error('Get workflows error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving workflows'
    });
  }
});

// @desc    Get specific workflow details
// @route   GET /api/workflows/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const workflow = await Workflow.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!workflow) {
      return res.status(404).json({
        status: 'fail',
        message: 'Workflow not found'
      });
    }

    res.json({
      status: 'success',
      data: { workflow }
    });

  } catch (error) {
    console.error('Get workflow error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error retrieving workflow'
    });
  }
});

// @desc    Deploy workflow to n8n
// @route   POST /api/workflows/:id/deploy
// @access  Private
router.post('/:id/deploy', protect, async (req, res) => {
  try {
    const workflow = await Workflow.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!workflow) {
      return res.status(404).json({
        status: 'fail',
        message: 'Workflow not found'
      });
    }

    // Check if credentials are configured
    const unconfiguredCredentials = workflow.credentialRequirements.filter(c => !c.isConfigured);
    if (unconfiguredCredentials.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Cannot deploy workflow: some credentials are not configured',
        data: { unconfiguredCredentials }
      });
    }

    // Get user's n8n configuration
    if (!req.user.n8nConfig?.isConnected) {
      return res.status(400).json({
        status: 'fail',
        message: 'User n8n configuration not found or not connected'
      });
    }

    // Extract project name from existing workflow or use default
    const projectName = req.body.projectName || 
      workflowAnalysisService.extractProjectNameFromWorkflow(workflow.workflowData.name) ||
      'default-project';
    
    console.log('🏗️ Deploy using project name:', projectName);

    // Deploy to n8n
    const deployResult = await workflowAnalysisService.uploadWorkflowToN8n(
      workflow.workflowData,
      req.user.n8nConfig.userId,
      req.user, // Pass user info for folder naming
      projectName // Pass project name for webhook URLs
    );

    if (!deployResult.success) {
      await workflow.addDeploymentHistory('deployed', 'Deployment failed', false, deployResult.error);
      
      return res.status(500).json({
        status: 'fail',
        message: `Deployment failed: ${deployResult.error}`
      });
    }

    // Update workflow with n8n ID and status
    workflow.n8nWorkflowId = deployResult.workflowId;
    workflow.status = 'deployed';
    workflow.lastDeployment = new Date();

    // Update trigger URLs with the actual n8n workflow ID
    workflow.triggerInfo = workflowAnalysisService.analyzeTriggers(
      workflow.workflowData, 
      deployResult.workflowId,
      projectName
    );

    await workflow.save();
    await workflow.addDeploymentHistory('deployed', `Deployed successfully with ID: ${deployResult.workflowId}`);

    res.json({
      status: 'success',
      message: 'Workflow deployed successfully',
      data: {
        workflow: workflow.summary,
        n8nWorkflowId: deployResult.workflowId,
        triggerInfo: workflow.triggerInfo
      }
    });

  } catch (error) {
    console.error('Deploy workflow error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deploying workflow'
    });
  }
});

// @desc    Deactivate workflow in n8n
// @route   POST /api/workflows/:id/deactivate
// @access  Private
router.post('/:id/deactivate', protect, async (req, res) => {
  try {
    const workflow = await Workflow.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!workflow) {
      return res.status(404).json({
        status: 'fail',
        message: 'Workflow not found'
      });
    }

    if (!workflow.n8nWorkflowId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Workflow not deployed'
      });
    }

    // Deactivate in n8n
    const deactivateResult = await workflowAnalysisService.deactivateWorkflow(workflow.n8nWorkflowId);

    if (!deactivateResult.success) {
      await workflow.addDeploymentHistory('deactivated', 'Deactivation failed', false, deactivateResult.error);
      
      return res.status(500).json({
        status: 'fail',
        message: `Deactivation failed: ${deactivateResult.error}`
      });
    }

    // Update workflow status
    await workflow.deactivate();

    res.json({
      status: 'success',
      message: 'Workflow deactivated successfully',
      data: {
        workflow: workflow.summary
      }
    });

  } catch (error) {
    console.error('Deactivate workflow error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deactivating workflow'
    });
  }
});

// @desc    Create credential for workflow
// @route   POST /api/workflows/:id/credentials
// @access  Private
router.post('/:id/credentials', protect, async (req, res) => {
  try {
    const { credentials } = req.body; // Array of credentials

    const workflow = await Workflow.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!workflow) {
      return res.status(404).json({
        status: 'fail',
        message: 'Workflow not found'
      });
    }

    if (!credentials || !Array.isArray(credentials)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Credentials array is required'
      });
    }

    const results = [];
    const errors = [];

    // Process each credential
    for (const cred of credentials) {
      try {
        const { name, type, data } = cred;

        if (!name || !type || !data) {
          errors.push(`Invalid credential data: ${JSON.stringify(cred)}`);
          continue;
        }

        // Create credential in n8n
        let credentialPayload = {
          name,
          type,
          data
        };

        // Special handling for OpenAI credentials - n8n expects both apiKey and header format
        if (type === 'openAiApi') {
          if (data.apiKey) {
            // Provide both formats as required by n8n's allOf schema
            credentialPayload = {
              name,
              type: 'openAiApi',
              data: {
                apiKey: data.apiKey,
                headerName: 'Authorization',
                headerValue: `Bearer ${data.apiKey}`
              }
            };
          }
        }

        console.log(`🔑 Creating credential "${name}" of type "${type}"...`);
        console.log(`📝 Credential data being sent:`, credentialPayload);
        const createResult = await workflowAnalysisService.createCredential(credentialPayload);

        if (createResult.success) {
          results.push({
            name,
            type,
            credentialId: createResult.credentialId,
            success: true
          });
          console.log(`✅ Credential "${name}" created successfully with ID: ${createResult.credentialId}`);
        } else {
          errors.push(`Failed to create credential "${name}": ${createResult.error}`);
          console.log(`❌ Failed to create credential "${name}": ${createResult.error}`);
        }
      } catch (credError) {
        errors.push(`Error processing credential: ${credError.message}`);
        console.error(`❌ Error processing credential:`, credError);
      }
    }

    // If we have successful credential creations and the workflow is deployed, assign them
    const successfulCredentials = results.filter(r => r.success);
    if (successfulCredentials.length > 0 && workflow.n8nWorkflowId) {
      console.log(`🔗 Assigning ${successfulCredentials.length} credentials to workflow ${workflow.n8nWorkflowId}...`);
      
      try {
        // Create credential mappings
        const credentialMappings = [];
        
        for (const result of successfulCredentials) {
          // Find the corresponding credential requirement to get node info
          const credReq = workflow.credentialRequirements.find(req => 
            req.credentialType === result.type
          );
          
          if (credReq) {
            credentialMappings.push({
              credentialId: result.credentialId,
              credentialType: result.type,
              credentialName: result.name,
              nodeName: credReq.nodeName,
              nodeId: credReq.nodeId || null
            });
          }
        }

        if (credentialMappings.length > 0) {
          const assignResult = await workflowAnalysisService.assignCredentialsToWorkflow(
            workflow.n8nWorkflowId,
            credentialMappings
          );

          if (assignResult.success) {
            console.log(`✅ Successfully assigned ${assignResult.credentialsAssigned} credentials to workflow`);
            await workflow.addDeploymentHistory('updated', 
              `Assigned ${assignResult.credentialsAssigned} credentials to workflow`);

            // Update workflow credentialRequirements to mark the assigned credentials as configured
            try {
              credentialMappings.forEach(mapping => {
                const req = workflow.credentialRequirements.find(r => (
                  r.credentialType === mapping.credentialType && (r.nodeId === mapping.nodeId || r.nodeName === mapping.nodeName)
                ));
                if (req) {
                  req.isConfigured = true;
                  req.n8nCredentialId = mapping.credentialId;
                }
              });
              await workflow.save();
              console.log('✅ Workflow credentialRequirements updated with configured credentials');
            } catch (updateErr) {
              console.error('❌ Failed to update workflow credentialRequirements after assignment:', updateErr.message);
            }

            // Auto-activate workflow after successful credential assignment
            console.log(`🚀 Attempting to activate workflow ${workflow.n8nWorkflowId}...`);
            try {
              const activationResult = await workflowAnalysisService.activateWorkflow(workflow.n8nWorkflowId);
              
              if (activationResult.success) {
                console.log(`✅ Workflow activated successfully!`);
                // Use the model method to set isActive, lastActivation, status and record history
                await workflow.activate();
                
                // Get webhook URLs from the activated workflow
                console.log(`🔗 Retrieving webhook URLs...`);
                const webhookResult = await workflowAnalysisService.getWorkflowWebhookUrls(workflow.n8nWorkflowId);
                
                if (webhookResult.success && webhookResult.webhookUrls.length > 0) {
                  console.log(`🔗 Found ${webhookResult.webhookUrls.length} webhook URLs`);
                  
                  // Update workflow with live webhook URLs
                  workflow.triggerInfo = webhookResult.webhookUrls.map(webhook => ({
                    type: 'webhook',
                    nodeId: webhook.nodeId,
                    nodeName: webhook.nodeName,
                    webhookUrl: webhook.webhookUrl,
                    testUrl: webhook.testUrl,
                    method: webhook.method,
                    active: webhook.active,
                    communicationMethod: 'HTTP POST requests to webhook URL',
                    details: `Production: ${webhook.webhookUrl}\nTest: ${webhook.testUrl}`
                  }));
                  
                  console.log(`📍 Updated with live webhook URLs:`, workflow.triggerInfo);
                  
                  // Generate webhook usage description using LLM
                  try {
                    console.log('🔤 Generating webhook usage description...');
                    const llmWorkflowService = require('../services/llmWorkflowService');
                    const webhookDescription = await llmWorkflowService.generateWebhookUsageDescription(
                      workflow.workflowData, 
                      workflow.triggerInfo
                    );
                    workflow.webhookUsageDescription = webhookDescription;
                    console.log('✅ Generated webhook usage description:', webhookDescription);
                  } catch (descriptionError) {
                    console.error('❌ Failed to generate webhook description:', descriptionError.message);
                    workflow.webhookUsageDescription = `This workflow provides ${workflow.triggerInfo.length} webhook endpoint${workflow.triggerInfo.length > 1 ? 's' : ''} for triggering automation workflows.`;
                  }
                }
              } else {
                console.log(`⚠️ Workflow activation failed: ${activationResult.error}`);
                workflow.status = 'credentials_pending';
              }
            } catch (activationError) {
              console.error(`❌ Error during workflow activation:`, activationError);
              workflow.status = 'credentials_pending';
            }
            
          } else {
            console.error(`❌ Failed to assign credentials to workflow: ${assignResult.error}`);
            errors.push(`Failed to assign credentials to workflow: ${assignResult.error}`);
          }
        }
      } catch (assignError) {
        console.error(`❌ Error assigning credentials to workflow:`, assignError);
        errors.push(`Error assigning credentials to workflow: ${assignError.message}`);
      }
    }

    // Re-check credential requirements after adding new ones
    console.log('🔍 Re-checking credential requirements after adding credentials...');
    const initialCredentialRequirements = workflowAnalysisService.detectCredentialRequirements(workflow.workflowData);
    const updatedCredentialRequirements = await workflowAnalysisService.checkCredentialsExistence(initialCredentialRequirements);
    
    // Update workflow with new credential status
    workflow.credentialRequirements = updatedCredentialRequirements;
    const unconfiguredCredentials = updatedCredentialRequirements.filter(cred => !cred.isConfigured);
    
    // Update workflow status based on credential availability
    if (unconfiguredCredentials.length === 0 && workflow.status === 'credentials_pending') {
      // All credentials are now configured, attempt auto-deployment
      console.log('🚀 All credentials configured - attempting auto-deployment...');
      
      try {
        // Extract project name from existing workflow or use default
        const projectName = workflowAnalysisService.extractProjectNameFromWorkflow(workflow.workflowData.name) || 
          'default-project';
        
        console.log('🏗️ Auto-deploy using project name:', projectName);
        
        const deployResult = await workflowAnalysisService.uploadWorkflowToN8n(
          workflow.workflowData,
          `user_${workflow.userId}`,
          req.user, // Pass user info for folder naming
          projectName // Pass project name for webhook URLs
        );

        if (deployResult.success) {
          workflow.n8nWorkflowId = deployResult.workflowId;
          workflow.status = 'deployed';
          workflow.lastDeployment = new Date();

          // Try to auto-activate
          if (updatedCredentialRequirements.length === 0) {
            console.log('🔄 Attempting auto-activation...');
            const activationResult = await workflowAnalysisService.activateWorkflow(deployResult.workflowId);
            if (activationResult.success) {
              // Ensure model-level activation updates (isActive, lastActivation) and history are applied
              await workflow.activate();
            }
          }

          // Update trigger URLs with actual n8n workflow ID
          workflow.triggerInfo = workflowAnalysisService.analyzeTriggers(
            workflow.workflowData, 
            deployResult.workflowId,
            projectName
          );

          await workflow.addDeploymentHistory('deployed', `Auto-deployed after credentials configuration with ID: ${deployResult.workflowId}`);
        }
      } catch (deployError) {
        console.error('❌ Auto-deployment failed after credential configuration:', deployError);
        errors.push(`Auto-deployment failed: ${deployError.message}`);
      }
    }

    await workflow.save();

    res.status(200).json({
      status: 'success',
      message: `Processed ${credentials.length} credentials. ${results.length} successful, ${errors.length} failed.`,
      data: {
        workflow: workflow.summary,
        credentialsAdded: results,
        errors: errors.length > 0 ? errors : undefined,
        deployed: workflow.status === 'deployed' || workflow.status === 'active',
        activated: workflow.status === 'active',
        triggerInfo: workflow.triggerInfo,
        webhookUsageDescription: workflow.webhookUsageDescription
      }
    });

  } catch (error) {
    console.error('❌ Error processing credentials:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error processing credentials'
    });
  }
});

// @desc    Activate workflow in n8n and get webhook URLs
// @route   POST /api/workflows/:id/activate
// @access  Private
router.post('/:id/activate', protect, async (req, res) => {
  try {
    const workflow = await Workflow.findById(req.params.id);
    
    if (!workflow) {
      return res.status(404).json({
        status: 'fail',
        message: 'Workflow not found'
      });
    }

    if (!workflow.n8nWorkflowId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Workflow is not deployed to n8n server yet'
      });
    }

    console.log(`🚀 Activating workflow ${workflow.n8nWorkflowId}...`);

    // Activate the workflow
    const activationResult = await workflowAnalysisService.activateWorkflow(workflow.n8nWorkflowId);
    
    if (!activationResult.success) {
      return res.status(400).json({
        status: 'fail',
        message: `Failed to activate workflow: ${activationResult.error}`
      });
    }

    console.log(`✅ Workflow activated successfully!`);
    
    // Update workflow status
  // Use model method to ensure isActive, lastActivation and history are set
  await workflow.activate();

    // Get webhook URLs
    console.log(`🔗 Retrieving webhook URLs...`);
    const webhookResult = await workflowAnalysisService.getWorkflowWebhookUrls(workflow.n8nWorkflowId);
    
    let webhookUrls = [];
    if (webhookResult.success) {
      webhookUrls = webhookResult.webhookUrls;
      console.log(`🔗 Found ${webhookUrls.length} webhook URLs`);
      
      // Update workflow with live webhook URLs
      workflow.triggerInfo = webhookUrls.map(webhook => ({
        type: 'webhook',
        nodeId: webhook.nodeId,
        nodeName: webhook.nodeName,
        webhookUrl: webhook.webhookUrl,
        testUrl: webhook.testUrl,
        method: webhook.method,
        active: webhook.active,
        communicationMethod: 'HTTP POST requests to webhook URL',
        details: `Production: ${webhook.webhookUrl}\nTest: ${webhook.testUrl}`
      }));
    }

    await workflow.save();

    res.status(200).json({
      status: 'success',
      message: 'Workflow activated successfully',
      data: {
        workflow: workflow.summary,
        webhookUrls: webhookUrls,
        triggerInfo: workflow.triggerInfo,
        activated: true
      }
    });

  } catch (error) {
    console.error('❌ Error activating workflow:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error activating workflow'
    });
  }
});

// @desc    Delete workflow
// @route   DELETE /api/workflows/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const workflow = await Workflow.findOne({ 
      _id: req.params.id, 
      userId: req.user._id 
    });

    if (!workflow) {
      return res.status(404).json({
        status: 'fail',
        message: 'Workflow not found'
      });
    }

    // If deployed, deactivate first
    if (workflow.n8nWorkflowId && workflow.isActive) {
      await workflowAnalysisService.deactivateWorkflow(workflow.n8nWorkflowId);
    }

    await Workflow.findByIdAndDelete(req.params.id);

    res.json({
      status: 'success',
      message: 'Workflow deleted successfully'
    });

  } catch (error) {
    console.error('Delete workflow error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting workflow'
    });
  }
});

module.exports = router;