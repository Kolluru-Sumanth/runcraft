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
    const credentialRequirements = workflowAnalysisService.detectCredentialRequirements(workflowData);
    const triggerInfo = workflowAnalysisService.analyzeTriggers(workflowData);

    // Create workflow record first to get the ID
    const workflow = new Workflow({
      name: workflowData.name || req.file.originalname.replace('.json', ''),
      description: workflowData.meta?.description || '',
      userId: req.user._id,
      originalFilename: req.file.originalname,
      workflowData,
      credentialRequirements,
      triggerInfo,
      status: credentialRequirements.length > 0 ? 'credentials_pending' : 'ready_to_deploy'
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

    // Try to automatically deploy to n8n if user has configuration
    let deploymentResult = null;
    console.log('🔍 Checking user n8n config...');
    console.log('User ID:', req.user._id);
    console.log('User n8nConfig exists:', !!req.user.n8nConfig);
    
    if (req.user.n8nConfig) {
      console.log('n8nConfig details:');
      console.log('  - isConnected:', req.user.n8nConfig.isConnected);
      console.log('  - serverUrl:', req.user.n8nConfig.serverUrl);
      console.log('  - userId:', req.user.n8nConfig.userId);
      console.log('  - apiKey exists:', !!req.user.n8nConfig.apiKey);
    }
    
    if (req.user.n8nConfig?.isConnected) {
      console.log('🚀 User has n8n config, attempting auto-deployment...');
      
      try {
        console.log('📤 Calling workflowAnalysisService.uploadWorkflowToN8n...');
        const deployResult = await workflowAnalysisService.uploadWorkflowToN8n(
          workflow.workflowData,
          req.user.n8nConfig.userId
        );

        console.log('📥 Deploy result received:', deployResult);

        if (deployResult.success) {
          console.log('✅ Auto-deployment to n8n successful!');
          
          // Update workflow with n8n ID and status
          workflow.n8nWorkflowId = deployResult.workflowId;
          workflow.status = credentialRequirements.length > 0 ? 'credentials_pending' : 'deployed';
          workflow.lastDeployment = new Date();

          // Update trigger URLs with the actual n8n workflow ID
          workflow.triggerInfo = workflowAnalysisService.analyzeTriggers(
            workflow.workflowData, 
            deployResult.workflowId
          );

          await workflow.save();
          await workflow.addDeploymentHistory('deployed', `Auto-deployed with ID: ${deployResult.workflowId}`);
          
          deploymentResult = {
            deployed: true,
            workflowId: deployResult.workflowId,
            triggerInfo: workflow.triggerInfo
          };
          
          console.log('📍 Updated trigger URLs:', workflow.triggerInfo);
        } else {
          console.error('❌ Auto-deployment failed:', deployResult.error);
          deploymentResult = {
            deployed: false,
            error: deployResult.error
          };
        }
      } catch (deployError) {
        console.error('❌ Auto-deployment error:', deployError.message);
        console.error('❌ Full error:', deployError);
        deploymentResult = {
          deployed: false,
          error: deployError.message
        };
      }
    } else {
      console.log('⚠️ User does not have n8n configuration, skipping auto-deployment');
      deploymentResult = {
        deployed: false,
        reason: 'No n8n configuration found for user'
      };
    }

    res.status(201).json({
      status: 'success',
      message: 'Workflow uploaded and analyzed successfully',
      data: {
        workflow: workflow.summary,
        credentialRequirements,
        triggerInfo: workflow.triggerInfo,
        llmAnalysis,
        needsCredentials: credentialRequirements.length > 0,
        webhookUrls: llmAnalysis?.webhookUrls || [],
        deployment: deploymentResult
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

    // Deploy to n8n
    const deployResult = await workflowAnalysisService.uploadWorkflowToN8n(
      workflow.workflowData,
      req.user.n8nConfig.userId
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
      deployResult.workflowId
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

// @desc    Activate workflow in n8n
// @route   POST /api/workflows/:id/activate
// @access  Private
router.post('/:id/activate', protect, async (req, res) => {
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
        message: 'Workflow must be deployed before activation'
      });
    }

    // Activate in n8n
    const activateResult = await workflowAnalysisService.activateWorkflow(workflow.n8nWorkflowId);

    if (!activateResult.success) {
      await workflow.addDeploymentHistory('activated', 'Activation failed', false, activateResult.error);
      
      return res.status(500).json({
        status: 'fail',
        message: `Activation failed: ${activateResult.error}`
      });
    }

    // Update workflow status
    await workflow.activate();

    res.json({
      status: 'success',
      message: 'Workflow activated successfully',
      data: {
        workflow: workflow.summary,
        triggerInfo: workflow.triggerInfo
      }
    });

  } catch (error) {
    console.error('Activate workflow error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error activating workflow'
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
    const { nodeId, credentialType, credentialName, credentialData } = req.body;

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

    // Find the credential requirement
    const credentialReq = workflow.credentialRequirements.find(c => c.nodeId === nodeId);
    if (!credentialReq) {
      return res.status(404).json({
        status: 'fail',
        message: 'Credential requirement not found for this node'
      });
    }

    // Create credential in n8n
    const credentialPayload = {
      name: credentialName,
      type: credentialType,
      data: credentialData
    };

    const createResult = await workflowAnalysisService.createCredential(credentialPayload);

    if (!createResult.success) {
      return res.status(500).json({
        status: 'fail',
        message: `Failed to create credential: ${createResult.error}`
      });
    }

    // Update workflow credential status
    await workflow.updateCredentialStatus(nodeId, true, createResult.credentialId);

    // Check if all credentials are now configured and auto-activate if ready
    const autoActivateResult = await workflowAnalysisService.autoActivateWorkflowIfReady(workflow);
    
    let responseMessage = 'Credential created successfully';
    let additionalData = {};

    if (autoActivateResult.shouldActivate) {
      if (autoActivateResult.success) {
        responseMessage += ' and workflow activated automatically';
        
        // Update workflow status
        await workflow.activate();
        
        // Get updated trigger URLs
        const triggerResult = await workflowAnalysisService.getWorkflowWithTriggerUrls(workflow.n8nWorkflowId);
        if (triggerResult.success) {
          workflow.triggerInfo = triggerResult.triggerInfo;
          await workflow.save();
          additionalData.triggerInfo = triggerResult.triggerInfo;
        }
        
        additionalData.activated = true;
      } else {
        responseMessage += `, but auto-activation failed: ${autoActivateResult.message}`;
        additionalData.activationError = autoActivateResult.error;
      }
    }

    res.json({
      status: 'success',
      message: responseMessage,
      data: {
        credentialId: createResult.credentialId,
        workflow: workflow.summary,
        ...additionalData
      }
    });

  } catch (error) {
    console.error('Create credential error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error creating credential'
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