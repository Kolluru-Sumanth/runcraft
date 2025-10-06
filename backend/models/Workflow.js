const mongoose = require('mongoose');

const workflowSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Workflow name is required'],
    trim: true,
    maxlength: [100, 'Workflow name cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  n8nWorkflowId: {
    type: String,
    required: false, // Will be set after successful upload to n8n
    trim: true
  },
  originalFilename: {
    type: String,
    required: [true, 'Original filename is required'],
    trim: true
  },
  workflowData: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'Workflow data is required']
  },
  status: {
    type: String,
    enum: ['uploaded', 'analyzed', 'credentials_pending', 'ready_to_deploy', 'deployed', 'active', 'error'],
    default: 'uploaded'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  credentialRequirements: [{
    nodeId: {
      type: String,
      required: true
    },
    nodeName: {
      type: String,
      required: true
    },
    credentialType: {
      type: String,
      required: true
    },
    credentialName: {
      type: String,
      required: true
    },
    isConfigured: {
      type: Boolean,
      default: false
    },
    n8nCredentialId: {
      type: String,
      required: false
    }
  }],
  triggerInfo: [{
    type: {
      type: String,
      enum: ['webhook', 'chat', 'schedule', 'manual'],
      required: true
    },
    nodeId: {
      type: String,
      required: true
    },
    nodeName: {
      type: String,
      required: true
    },
    webhookId: {
      type: String,
      required: false
    },
    webhookUrl: {
      type: String,
      required: false
    },
    chatUrl: {
      type: String,
      required: false
    },
    communicationMethod: {
      type: String,
      required: true
    },
    details: {
      type: String,
      required: true
    }
  }],
  deploymentHistory: [{
    action: {
      type: String,
      enum: ['uploaded', 'deployed', 'activated', 'deactivated', 'updated', 'deleted'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: {
      type: String,
      required: false
    },
    success: {
      type: Boolean,
      default: true
    },
    errorMessage: {
      type: String,
      required: false
    }
  }],
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters']
  }],
  lastDeployment: {
    type: Date,
    required: false
  },
  lastActivation: {
    type: Date,
    required: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for workflow summary
workflowSchema.virtual('summary').get(function() {
  return {
    id: this._id,
    name: this.name,
    status: this.status,
    isActive: this.isActive,
    triggerCount: this.triggerInfo.length,
    credentialCount: this.credentialRequirements.length,
    credentialsConfigured: this.credentialRequirements.filter(c => c.isConfigured).length,
    lastUpdated: this.updatedAt
  };
});

// Index for better query performance
workflowSchema.index({ userId: 1, createdAt: -1 });
workflowSchema.index({ status: 1 });
workflowSchema.index({ isActive: 1 });
workflowSchema.index({ n8nWorkflowId: 1 });

// Pre-save middleware to update status based on credentials
workflowSchema.pre('save', function(next) {
  if (this.credentialRequirements.length === 0) {
    this.status = 'ready_to_deploy';
  } else {
    const allConfigured = this.credentialRequirements.every(c => c.isConfigured);
    if (allConfigured && this.status === 'credentials_pending') {
      this.status = 'ready_to_deploy';
    } else if (!allConfigured && this.status !== 'uploaded' && this.status !== 'analyzed') {
      this.status = 'credentials_pending';
    }
  }
  next();
});

// Method to add deployment history
workflowSchema.methods.addDeploymentHistory = function(action, details, success = true, errorMessage = null) {
  this.deploymentHistory.push({
    action,
    details,
    success,
    errorMessage
  });
  return this.save();
};

// Method to update credential status
workflowSchema.methods.updateCredentialStatus = function(nodeId, isConfigured, n8nCredentialId = null) {
  const credential = this.credentialRequirements.find(c => c.nodeId === nodeId);
  if (credential) {
    credential.isConfigured = isConfigured;
    if (n8nCredentialId) {
      credential.n8nCredentialId = n8nCredentialId;
    }
  }
  return this.save();
};

// Method to set workflow as active
workflowSchema.methods.activate = function() {
  this.isActive = true;
  this.lastActivation = new Date();
  this.status = 'active';
  return this.addDeploymentHistory('activated', 'Workflow activated successfully');
};

// Method to set workflow as inactive
workflowSchema.methods.deactivate = function() {
  this.isActive = false;
  this.status = 'deployed';
  return this.addDeploymentHistory('deactivated', 'Workflow deactivated');
};

// Static method to find workflows by user
workflowSchema.statics.findByUser = function(userId, options = {}) {
  const query = this.find({ userId });
  
  if (options.status) {
    query.where('status', options.status);
  }
  
  if (options.isActive !== undefined) {
    query.where('isActive', options.isActive);
  }
  
  return query.sort({ updatedAt: -1 });
};

// Static method to find workflows by n8n workflow ID
workflowSchema.statics.findByN8nId = function(n8nWorkflowId) {
  return this.findOne({ n8nWorkflowId });
};

module.exports = mongoose.model('Workflow', workflowSchema);