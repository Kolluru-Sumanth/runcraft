const axios = require('axios');
const crypto = require('crypto');

class WorkflowAnalysisService {
  constructor() {
    this.n8nServerUrl = process.env.N8N_SERVER_URL;
    this.n8nAdminApiKey = process.env.N8N_ADMIN_API_KEY;
    this.timeout = 30000; // 30 seconds timeout
  }

  /**
   * Generate a unique workflow ID using crypto
   * @returns {string} Unique workflow ID
   */
  generateUniqueWorkflowId() {
    return crypto.randomUUID();
  }

  /**
   * Validate workflow structure
   * @param {Object} workflowData - The n8n workflow JSON data
   * @returns {Object} Validation result
   */
  validateWorkflowStructure(workflowData) {
    const errors = [];
    
    if (!workflowData) {
      errors.push('Workflow data is required');
    }
    
    if (!workflowData.nodes || !Array.isArray(workflowData.nodes)) {
      errors.push('Workflow must contain a valid nodes array');
    }
    
    if (!workflowData.name || typeof workflowData.name !== 'string') {
      errors.push('Workflow must have a valid name');
    }
    
    if (workflowData.nodes && workflowData.nodes.length === 0) {
      errors.push('Workflow must contain at least one node');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
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
   * Check if credentials exist in n8n server
   * @param {Array} credentialRequirements - Array of credential requirements
   * @returns {Promise<Array>} Enhanced credential requirements with existence status
   */
  async checkCredentialsExistence(credentialRequirements) {
    try {
      if (!this.n8nServerUrl || !this.n8nAdminApiKey) {
        console.log('⚠️ n8n server configuration not found, marking all credentials as not configured');
        return credentialRequirements.map(cred => ({ ...cred, isConfigured: false, exists: false }));
      }

      // Get all credentials from n8n server
      let existingCredentials = [];
      try {
        existingCredentials = await this.getAllCredentials();
      } catch (error) {
        console.log('⚠️ Could not fetch credentials from n8n server, assuming none exist');
        return credentialRequirements.map(cred => ({ ...cred, isConfigured: false, exists: false }));
      }
      
      // Check each requirement against existing credentials
      const enhancedRequirements = credentialRequirements.map(requirement => {
        let isConfigured = false;
        let exists = false;
        let matchedCredential = null;

        // Check if credential exists by ID first (most reliable)
        if (requirement.n8nCredentialId) {
          matchedCredential = existingCredentials.find(cred => cred.id === requirement.n8nCredentialId);
          if (matchedCredential) {
            isConfigured = true;
            exists = true;
          }
        }

        // If not found by ID, check by type and name
        if (!matchedCredential) {
          matchedCredential = existingCredentials.find(cred => 
            cred.type === requirement.credentialType && 
            cred.name === requirement.credentialName
          );
          if (matchedCredential) {
            isConfigured = true;
            exists = true;
          }
        }

        return {
          ...requirement,
          isConfigured,
          exists,
          matchedCredentialId: matchedCredential?.id || null
        };
      });

      return enhancedRequirements;
    } catch (error) {
      console.error('❌ Error checking credentials existence:', error.message);
      // Return original requirements with isConfigured: false on error
      return credentialRequirements.map(cred => ({ ...cred, isConfigured: false, exists: false }));
    }
  }

  /**
   * Get all credentials from n8n server
   * @returns {Promise<Array>} Array of credentials
   */
  async getAllCredentials() {
    try {
      if (!this.n8nServerUrl || !this.n8nAdminApiKey) {
        throw new Error('n8n server configuration not found');
      }

      console.log(`🔍 Fetching credentials from: ${this.n8nServerUrl}/api/v1/credentials`);
      const response = await axios.get(`${this.n8nServerUrl}/api/v1/credentials`, {
        headers: {
          'X-N8N-API-KEY': this.n8nAdminApiKey,
          'Content-Type': 'application/json'
        },
        timeout: this.timeout
      });

      console.log(`📋 Found ${response.data.data?.length || 0} credentials in n8n server`);
      return response.data.data || [];
    } catch (error) {
      if (error.response?.status === 405) {
        console.log('⚠️ n8n credentials endpoint does not support GET method, assuming no credentials exist');
        return [];
      }
      console.error('❌ Error fetching credentials from n8n:', error.response?.data || { message: error.message });
      throw error;
    }
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
      const webhookId = node.webhookId || n8nWorkflowId;
      
      // Detect different trigger types and pass workflow ID for URL generation
      if (this.isWebhookTrigger(node)) {
        const triggerInfo = this.analyzeWebhookTrigger(node, baseUrl, n8nWorkflowId);
        triggers.push(triggerInfo);
      } else if (this.isChatTrigger(node)) {
        const triggerInfo = this.analyzeChatTrigger(node, baseUrl, n8nWorkflowId);
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
   * Generate comprehensive webhook URLs including test and production variants
   * @param {string} workflowId - The workflow ID or webhook ID
   * @param {string} baseUrl - The n8n server base URL
   * @param {Object} node - The webhook node
   * @returns {Object} Webhook URL information
   */
  generateWebhookUrls(workflowId, baseUrl, node = null) {
    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }

    const urls = {
      production: `${baseUrl}webhook/${workflowId}`,
      test: `${baseUrl}webhook-test/${workflowId}`,
      chat: null
    };

    // Add path if specified
    if (node?.parameters?.path) {
      urls.production += `/${node.parameters.path}`;
      urls.test += `/${node.parameters.path}`;
    }

    // Check if this is a chat trigger
    if (this.isChatTrigger(node)) {
      urls.chat = `${baseUrl}webhook/${workflowId}/chat`;
    }

    return urls;
  }

  /**
   * Analyze webhook trigger node with comprehensive URL generation
   */
  analyzeWebhookTrigger(node, baseUrl, workflowId = null) {
    const webhookId = node.webhookId || workflowId;
    const path = node.parameters?.path || '';
    
    // Generate all webhook URL variants
    const webhookUrls = this.generateWebhookUrls(webhookId, baseUrl, node);

    return {
      type: 'webhook',
      nodeId: node.id,
      nodeName: node.name,
      webhookId,
      webhookUrl: webhookUrls.production,
      testUrl: webhookUrls.test,
      communicationMethod: 'HTTP POST requests to webhook URL',
      details: webhookUrls.production ? 
        `Production: ${webhookUrls.production}\nTest: ${webhookUrls.test}` : 
        'Webhook URLs will be generated after deployment',
      httpMethods: node.parameters?.httpMethod || ['POST'],
      path: path || null,
      urls: webhookUrls
    };
  }

  /**
   * Analyze chat trigger node with comprehensive URL generation
   */
  analyzeChatTrigger(node, baseUrl, workflowId = null) {
    const webhookId = node.webhookId || workflowId;
    
    // Generate all webhook URL variants
    const webhookUrls = this.generateWebhookUrls(webhookId, baseUrl, node);

    return {
      type: 'chat',
      nodeId: node.id,
      nodeName: node.name,
      webhookId,
      webhookUrl: webhookUrls.production,
      chatUrl: webhookUrls.chat,
      testUrl: webhookUrls.test,
      communicationMethod: 'Chat interface and HTTP requests',
      details: webhookUrls.chat ? 
        `Chat: ${webhookUrls.chat}\nWebhook: ${webhookUrls.production}\nTest: ${webhookUrls.test}` : 
        'Chat and webhook URLs will be generated after deployment',
      urls: webhookUrls
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
   * Upload workflow to n8n server with enhanced validation
   * @param {Object} workflowData - The workflow data to upload
   * @param {string} userId - The user's n8n user ID
   * @returns {Promise<Object>} Upload result
   */
  async uploadWorkflowToN8n(workflowData, userId) {
    try {
      if (!this.n8nServerUrl || !this.n8nAdminApiKey) {
        throw new Error('n8n server configuration not found');
      }

      // Validate workflow structure first
      const validation = this.validateWorkflowStructure(workflowData);
      if (!validation.isValid) {
        return {
          success: false,
          error: `Workflow validation failed: ${validation.errors.join(', ')}`,
          statusCode: 400
        };
      }

      const headers = {
        'X-N8N-API-KEY': this.n8nAdminApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      // Generate unique workflow name if needed
      const uniqueId = this.generateUniqueWorkflowId();
      const workflowName = workflowData.name.includes('(') ? 
        workflowData.name : 
        `${workflowData.name} (${uniqueId.substring(0, 8)})`;

      // Prepare workflow for upload - only include properties that n8n accepts
      const workflowPayload = {
        name: workflowName,
        nodes: workflowData.nodes || [],
        connections: workflowData.connections || {},
        settings: workflowData.settings || {},
        staticData: workflowData.staticData || {}
        // Note: Removed 'active' and 'meta' properties as n8n API doesn't accept them during creation
      };

      console.log(`📤 Uploading workflow "${workflowName}" to n8n...`);

      const response = await axios.post(
        `${this.n8nServerUrl}/api/v1/workflows`,
        workflowPayload,
        { headers, timeout: this.timeout }
      );

      console.log(`✅ Workflow uploaded successfully with ID: ${response.data.id}`);

      return {
        success: true,
        data: response.data,
        workflowId: response.data.id,
        workflowName: workflowName
      };

    } catch (error) {
      console.error('❌ Error uploading workflow to n8n:', error.response?.data || error.message);
      
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
   * Get webhook URLs from an active workflow in n8n
   * @param {string} workflowId - The n8n workflow ID
   * @returns {Promise<Object>} Webhook URLs and workflow data
   */
  async getWorkflowWebhookUrls(workflowId) {
    try {
      if (!this.n8nServerUrl || !this.n8nAdminApiKey) {
        throw new Error('n8n server configuration not found');
      }

      console.log(`🔗 Fetching webhook URLs for workflow ${workflowId}...`);

      const headers = {
        'X-N8N-API-KEY': this.n8nAdminApiKey,
        'Accept': 'application/json'
      };

      // Get the workflow details from n8n
      const response = await axios.get(
        `${this.n8nServerUrl}/api/v1/workflows/${workflowId}`,
        { headers, timeout: this.timeout }
      );

      const workflowData = response.data;
      const webhookUrls = [];

      // Extract webhook URLs from webhook nodes
      if (workflowData.nodes) {
        for (const node of workflowData.nodes) {
          if (node.type === 'n8n-nodes-base.webhook' || 
              node.type === 'n8n-nodes-base.formTrigger' ||
              node.type === 'n8n-nodes-base.chatTrigger') {
            
            let webhookUrl = '';
            let webhookId = '';
            
            // Get webhook ID from node parameters
            if (node.webhookId) {
              webhookId = node.webhookId;
            } else if (node.parameters?.webhookId) {
              webhookId = node.parameters.webhookId;
            } else {
              // Generate webhook ID based on node ID or use workflow ID
              webhookId = node.id || workflowId;
            }

            // Construct webhook URL
            if (node.type === 'n8n-nodes-base.webhook') {
              const path = node.parameters?.path || webhookId;
              webhookUrl = `${this.n8nServerUrl}/webhook/${path}`;
            } else if (node.type === 'n8n-nodes-base.chatTrigger') {
              webhookUrl = `${this.n8nServerUrl}/webhook/${workflowId}/chat`;
            } else if (node.type === 'n8n-nodes-base.formTrigger') {
              webhookUrl = `${this.n8nServerUrl}/form/${webhookId}`;
            }

            if (webhookUrl) {
              webhookUrls.push({
                nodeId: node.id,
                nodeName: node.name,
                nodeType: node.type,
                webhookUrl: webhookUrl,
                testUrl: webhookUrl.replace('/webhook/', '/webhook-test/'),
                method: node.parameters?.httpMethod || 'POST',
                active: workflowData.active || false
              });
              
              console.log(`🔗 Found webhook: ${node.name} -> ${webhookUrl}`);
            }
          }
        }
      }

      return {
        success: true,
        workflowId: workflowId,
        active: workflowData.active,
        webhookUrls: webhookUrls,
        workflowName: workflowData.name
      };

    } catch (error) {
      console.error('Error getting webhook URLs:', error.response?.data || error.message);
      
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

      console.log('🔍 Attempting credential creation with data:', credentialData);

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
      
      // If it's a schema validation error, try to get more details
      if (error.response?.status === 400 && error.response?.data?.message?.includes('schema')) {
        console.log('🔍 Schema validation failed, checking available credential types...');
        try {
          const typesResponse = await axios.get(
            `${this.n8nServerUrl}/api/v1/credential-types`,
            { 
              headers: {
                'X-N8N-API-KEY': this.n8nAdminApiKey,
                'Accept': 'application/json'
              }, 
              timeout: this.timeout 
            }
          );
          console.log('📋 Available credential types:', typesResponse.data);
        } catch (typesError) {
          console.log('⚠️ Could not fetch credential types:', typesError.message);
        }
      }
      
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

  /**
   * Check if workflow is ready for activation (all credentials configured)
   * @param {Object} workflow - The workflow document
   * @returns {boolean} Whether workflow is ready for activation
   */
  isWorkflowReadyForActivation(workflow) {
    if (!workflow.n8nWorkflowId) {
      return false;
    }

    const unconfiguredCredentials = workflow.credentialRequirements.filter(c => !c.isConfigured);
    return unconfiguredCredentials.length === 0;
  }

  /**
   * Auto-activate workflow if all credentials are configured
   * @param {Object} workflow - The workflow document
   * @returns {Promise<Object>} Activation result
   */
  async autoActivateWorkflowIfReady(workflow) {
    try {
      if (!this.isWorkflowReadyForActivation(workflow)) {
        return {
          success: false,
          message: 'Workflow not ready for activation - missing credentials or not deployed',
          shouldActivate: false
        };
      }

      console.log(`🚀 Auto-activating workflow ${workflow.name} (ID: ${workflow.n8nWorkflowId})...`);
      
      const activateResult = await this.activateWorkflow(workflow.n8nWorkflowId);
      
      if (activateResult.success) {
        console.log(`✅ Workflow ${workflow.name} activated successfully`);
        return {
          success: true,
          message: 'Workflow activated automatically',
          shouldActivate: true,
          data: activateResult.data
        };
      } else {
        console.error(`❌ Failed to auto-activate workflow ${workflow.name}:`, activateResult.error);
        return {
          success: false,
          message: `Auto-activation failed: ${activateResult.error}`,
          shouldActivate: true,
          error: activateResult.error
        };
      }

    } catch (error) {
      console.error('Error in auto-activation:', error.message);
      return {
        success: false,
        message: `Auto-activation error: ${error.message}`,
        shouldActivate: true,
        error: error.message
      };
    }
  }

  /**
   * Get workflow details including trigger URLs after activation
   * @param {string} workflowId - The n8n workflow ID
   * @returns {Promise<Object>} Workflow details with trigger URLs
   */
  async getWorkflowWithTriggerUrls(workflowId) {
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

      const workflowData = response.data;
      
      // Analyze triggers with the actual workflow ID
      const triggerInfo = this.analyzeTriggers(workflowData, workflowId);

      return {
        success: true,
        data: workflowData,
        triggerInfo
      };

    } catch (error) {
      console.error('Error getting workflow details:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status
      };
    }
  }

  /**
   * Assign credentials to workflow nodes and update the workflow in n8n
   * @param {string} workflowId - The n8n workflow ID
   * @param {Array} credentialMappings - Array of {credentialId, nodeName, nodeId}
   * @returns {Promise<Object>} Update result
   */
  async assignCredentialsToWorkflow(workflowId, credentialMappings) {
    try {
      if (!this.n8nServerUrl || !this.n8nAdminApiKey) {
        throw new Error('n8n server configuration not found');
      }

      console.log(`🔗 Assigning credentials to workflow ${workflowId}...`);

      // First, get the current workflow
      const workflowResult = await this.getWorkflowFromN8n(workflowId);
      if (!workflowResult.success) {
        throw new Error(`Failed to get workflow: ${workflowResult.error}`);
      }

      const workflowData = workflowResult.data;
      console.log(`📥 Retrieved workflow data for credential assignment`);

      // Update nodes with credential assignments
      let credentialsAssigned = 0;
      
      if (workflowData.nodes) {
        for (const node of workflowData.nodes) {
          const mapping = credentialMappings.find(m => 
            m.nodeName === node.name || m.nodeId === node.id
          );
          
          if (mapping) {
            console.log(`🔗 Assigning credential ${mapping.credentialId} to node ${node.name}`);
            
            // Assign credential to the node using n8n API format
            if (!node.credentials) {
              node.credentials = {};
            }
            
            // Find the credential type for this node
            const credentialType = mapping.credentialType || this.getNodeCredentialType(node.type);
            if (credentialType) {
              // Use the format from n8n API documentation
              node.credentials[credentialType] = {
                id: mapping.credentialId,
                name: mapping.credentialName || `credential_${mapping.credentialId}`
              };
              credentialsAssigned++;
              console.log(`✅ Credential assigned to ${node.name} (${credentialType})`);
            }
          }
        }
      }

      if (credentialsAssigned === 0) {
        console.log(`⚠️ No credentials were assigned to workflow nodes`);
        return {
          success: true,
          credentialsAssigned: 0,
          message: 'No matching nodes found for credential assignment'
        };
      }

      // Update the workflow in n8n using the format from API docs
      const headers = {
        'X-N8N-API-KEY': this.n8nAdminApiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };

      // Prepare the update payload in the format n8n expects
      const updatePayload = {
        name: workflowData.name,
        nodes: workflowData.nodes,
        connections: workflowData.connections,
        settings: workflowData.settings || {},
        staticData: workflowData.staticData || {}
      };

      const response = await axios.put(
        `${this.n8nServerUrl}/api/v1/workflows/${workflowId}`,
        updatePayload,
        { headers, timeout: this.timeout }
      );

      console.log(`✅ Workflow updated successfully with ${credentialsAssigned} credential assignments`);

      return {
        success: true,
        data: response.data,
        credentialsAssigned,
        workflowId: workflowId
      };

    } catch (error) {
      console.error('Error assigning credentials to workflow:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status
      };
    }
  }

  /**
   * Get the credential type for a specific node type
   * @param {string} nodeType - The n8n node type
   * @returns {string} The credential type
   */
  getNodeCredentialType(nodeType) {
    const credentialTypeMap = {
      'n8n-nodes-base.openAi': 'openAiApi',
      'n8n-nodes-base.discord': 'discordApi',
      'n8n-nodes-base.telegram': 'telegramApi',
      'n8n-nodes-base.notion': 'notionApi',
      'n8n-nodes-base.airtable': 'airtableTokenApi',
      'n8n-nodes-base.httpRequest': 'httpBasicAuth',
      'n8n-nodes-base.webhook': null, // Webhooks don't need credentials
      // Add more mappings as needed
    };

    return credentialTypeMap[nodeType] || null;
  }
}

module.exports = new WorkflowAnalysisService();