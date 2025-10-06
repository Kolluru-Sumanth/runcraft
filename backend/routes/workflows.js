const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth');
const Workflow = require('../models/Workflow');
const workflowAnalysisService = require('../services/workflowAnalysisService');
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

    // Create workflow record
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

    // Add to deployment history
    await workflow.addDeploymentHistory('uploaded', 'Workflow uploaded and analyzed');

    res.status(201).json({
      status: 'success',
      message: 'Workflow uploaded and analyzed successfully',
      data: {
        workflow: workflow.summary,
        credentialRequirements,
        triggerInfo,
        needsCredentials: credentialRequirements.length > 0
      }
    });

  } catch (error) {
    console.error('Workflow upload error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error uploading workflow'
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

    res.json({
      status: 'success',
      message: 'Credential created successfully',
      data: {
        credentialId: createResult.credentialId,
        workflow: workflow.summary
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