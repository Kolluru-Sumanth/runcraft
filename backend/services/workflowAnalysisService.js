const axios = require('axios');

class WorkflowAnalysisService {
  constructor() {
    this.n8nServerUrl = process.env.N8N_SERVER_URL;
    this.n8nAdminApiKey = process.env.N8N_ADMIN_API_KEY;
    this.timeout = 30000; // 30 seconds timeout
  }

  /**
   * Analyze a workflow to detect credential requirements
   * @param {Object} workflowData - The n8n workflow JSON data
   * @returns {Array} Array of credential requirements
   */
  detectCredentialRequirements(workflowData) {
    const credentialRequirements = [];
    
    for (const node of workflowData.nodes || []) {
      if (node.credentials && Object.keys(node.credentials).length > 0) {
        for (const [credentialType, credentialInfo] of Object.entries(node.credentials)) {
          credentialRequirements.push({
            nodeId: node.id,
            nodeName: node.name,
            credentialType,
            credentialName: credentialInfo.name || 'Unnamed Credential',
            isConfigured: false,
            n8nCredentialId: credentialInfo.id || null
          });
        }
      }
    }
    
    return credentialRequirements;
  }

  /**
   * Analyze a workflow to detect trigger information and generate URLs
   * @param {Object} workflowData - The n8n workflow JSON data
   * @param {string} n8nWorkflowId - The n8n workflow ID (if deployed)
   * @returns {Array} Array of trigger information
   */
  analyzeTriggers(workflowData, n8nWorkflowId = null) {
    const triggers = [];
    const baseUrl = this.n8nServerUrl.endsWith('/') ? this.n8nServerUrl : `${this.n8nServerUrl}/`;
    
    for (const node of workflowData.nodes || []) {
      const nodeType = node.type || '';
      const nodeParameters = node.parameters || {};
      const webhookId = node.webhookId;
      
      // Detect different trigger types
      if (this.isWebhookTrigger(node)) {
        const triggerInfo = this.analyzeWebhookTrigger(node, baseUrl);
        triggers.push(triggerInfo);
      } else if (this.isChatTrigger(node)) {
        const triggerInfo = this.analyzeChatTrigger(node, baseUrl);
        triggers.push(triggerInfo);
      } else if (this.isScheduleTrigger(node)) {
        const triggerInfo = this.analyzeScheduleTrigger(node);
        triggers.push(triggerInfo);
      } else if (this.isManualTrigger(node)) {
        const triggerInfo = this.analyzeManualTrigger(node);
        triggers.push(triggerInfo);
      }
    }
    
    return triggers;
  }

  /**
   * Check if a node is a webhook trigger
   */
  isWebhookTrigger(node) {
    const nodeType = node.type.toLowerCase();
    return nodeType.includes('webhook') || 
           nodeType.includes('http') || 
           node.webhookId ||
           (nodeType.includes('trigger') && !this.isChatTrigger(node));
  }

  /**
   * Check if a node is a chat trigger
   */
  isChatTrigger(node) {
    const nodeType = node.type.toLowerCase();
    const nodeName = (node.name || '').toLowerCase();
    return nodeType.includes('chat') || 
           nodeType.includes('chatgpt') ||
           nodeType.includes('ai chat') ||
           nodeName.includes('chat');
  }

  /**
   * Check if a node is a schedule trigger
   */
  isScheduleTrigger(node) {
    const nodeType = node.type.toLowerCase();
    return nodeType.includes('schedule') || 
           nodeType.includes('cron') ||
           nodeType.includes('interval');
  }

  /**
   * Check if a node is a manual trigger
   */
  isManualTrigger(node) {
    const nodeType = node.type.toLowerCase();
    return nodeType.includes('manual') || nodeType === 'n8n-nodes-base.manualTrigger';
  }

  /**
   * Analyze webhook trigger node
   */
  analyzeWebhookTrigger(node, baseUrl) {
    const webhookId = node.webhookId;
    const path = node.parameters?.path || '';
    
    let webhookUrl = null;
    if (webhookId) {
      webhookUrl = `${baseUrl}webhook/${webhookId}`;
      if (path) {
        webhookUrl += `/${path}`;
      }
    }

    return {
      type: 'webhook',
      nodeId: node.id,
      nodeName: node.name,
      webhookId,
      webhookUrl,
      communicationMethod: 'HTTP POST requests to webhook URL',
      details: webhookUrl ? 
        `Send HTTP requests to: ${webhookUrl}` : 
        'Webhook URL will be generated after deployment',
      httpMethods: node.parameters?.httpMethod || ['POST'],
      path: path || null
    };
  }

  /**
   * Analyze chat trigger node
   */
  analyzeChatTrigger(node, baseUrl) {
    const webhookId = node.webhookId;
    
    let chatUrl = null;
    let webhookUrl = null;
    
    if (webhookId) {
      chatUrl = `${baseUrl}webhook/${webhookId}/chat`;
      webhookUrl = `${baseUrl}webhook/${webhookId}`;
    }

    return {
      type: 'chat',
      nodeId: node.id,
      nodeName: node.name,
      webhookId,
      webhookUrl,
      chatUrl,
      communicationMethod: 'Chat interface',
      details: chatUrl ? 
        `Chat interface available at: ${chatUrl}` : 
        'Chat URL will be generated after deployment'
    };
  }

  /**
   * Analyze schedule trigger node
   */
  analyzeScheduleTrigger(node) {
    const rule = node.parameters?.rule || {};
    const interval = node.parameters?.interval || null;
    
    let scheduleDescription = 'Runs on a schedule';
    if (rule.hour !== undefined && rule.minute !== undefined) {
      scheduleDescription = `Runs daily at ${rule.hour}:${rule.minute.toString().padStart(2, '0')}`;
    } else if (interval) {
      scheduleDescription = `Runs every ${interval} minutes`;
    }

    return {
      type: 'schedule',
      nodeId: node.id,
      nodeName: node.name,
      communicationMethod: 'Automatic execution based on schedule',
      details: scheduleDescription,
      schedule: rule,
      interval
    };
  }

  /**
   * Analyze manual trigger node
   */
  analyzeManualTrigger(node) {
    return {
      type: 'manual',
      nodeId: node.id,
      nodeName: node.name,
      communicationMethod: 'Manual execution from n8n UI',
      details: 'This workflow must be manually triggered from the n8n interface'
    };
  }

  /**
   * Upload workflow to n8n server
   * @param {Object} workflowData - The workflow data to upload
   * @param {string} userId - The user's n8n user ID
   * @returns {Promise<Object>} Upload result
   */
  async uploadWorkflowToN8n(workflowData, userId) {
    try {
      if (!this.n8nServerUrl || !this.n8nAdminApiKey) {
        throw new Error('n8n server configuration not found');
      }

      const headers = {
        'X-N8N-API-KEY': this.n8nAdminApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      // Prepare workflow for upload
      const workflowPayload = {
        name: workflowData.name,
        nodes: workflowData.nodes,
        connections: workflowData.connections,
        active: false, // Start inactive
        settings: workflowData.settings || {},
        staticData: workflowData.staticData || {}
      };

      const response = await axios.post(
        `${this.n8nServerUrl}/api/v1/workflows`,
        workflowPayload,
        { headers, timeout: this.timeout }
      );

      return {
        success: true,
        data: response.data,
        workflowId: response.data.id
      };

    } catch (error) {
      console.error('Error uploading workflow to n8n:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status
      };
    }
  }

  /**
   * Activate workflow in n8n
   * @param {string} workflowId - The n8n workflow ID
   * @returns {Promise<Object>} Activation result
   */
  async activateWorkflow(workflowId) {
    try {
      if (!this.n8nServerUrl || !this.n8nAdminApiKey) {
        throw new Error('n8n server configuration not found');
      }

      const headers = {
        'X-N8N-API-KEY': this.n8nAdminApiKey,
        'Accept': 'application/json'
      };

      const response = await axios.post(
        `${this.n8nServerUrl}/api/v1/workflows/${workflowId}/activate`,
        {},
        { headers, timeout: this.timeout }
      );

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('Error activating workflow:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status
      };
    }
  }

  /**
   * Deactivate workflow in n8n
   * @param {string} workflowId - The n8n workflow ID
   * @returns {Promise<Object>} Deactivation result
   */
  async deactivateWorkflow(workflowId) {
    try {
      if (!this.n8nServerUrl || !this.n8nAdminApiKey) {
        throw new Error('n8n server configuration not found');
      }

      const headers = {
        'X-N8N-API-KEY': this.n8nAdminApiKey,
        'Accept': 'application/json'
      };

      const response = await axios.post(
        `${this.n8nServerUrl}/api/v1/workflows/${workflowId}/deactivate`,
        {},
        { headers, timeout: this.timeout }
      );

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('Error deactivating workflow:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status
      };
    }
  }

  /**
   * Create credential in n8n
   * @param {Object} credentialData - Credential data
   * @returns {Promise<Object>} Creation result
   */
  async createCredential(credentialData) {
    try {
      if (!this.n8nServerUrl || !this.n8nAdminApiKey) {
        throw new Error('n8n server configuration not found');
      }

      const headers = {
        'X-N8N-API-KEY': this.n8nAdminApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      const response = await axios.post(
        `${this.n8nServerUrl}/api/v1/credentials`,
        credentialData,
        { headers, timeout: this.timeout }
      );

      return {
        success: true,
        data: response.data,
        credentialId: response.data.id
      };

    } catch (error) {
      console.error('Error creating credential:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status
      };
    }
  }

  /**
   * Get workflow from n8n server
   * @param {string} workflowId - The n8n workflow ID
   * @returns {Promise<Object>} Workflow data
   */
  async getWorkflowFromN8n(workflowId) {
    try {
      if (!this.n8nServerUrl || !this.n8nAdminApiKey) {
        throw new Error('n8n server configuration not found');
      }

      const headers = {
        'X-N8N-API-KEY': this.n8nAdminApiKey,
        'Accept': 'application/json'
      };

      const response = await axios.get(
        `${this.n8nServerUrl}/api/v1/workflows/${workflowId}`,
        { headers, timeout: this.timeout }
      );

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('Error getting workflow from n8n:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status
      };
    }
  }
}

module.exports = new WorkflowAnalysisService();