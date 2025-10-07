const axios = require('axios');

class LLMWorkflowService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || process.env.GROQ_API_KEY;
    this.apiBase = process.env.LLM_API_BASE || 'https://api.openai.com/v1';
    this.model = process.env.LLM_MODEL || 'gpt-4o-mini';
    this.n8nServerUrl = process.env.N8N_SERVER_URL || 'http://localhost:5678';
  }

  /**
   * Analyze a workflow using LLM and generate intelligent webhook URLs
   * @param {Object} workflowData - The n8n workflow JSON data
   * @param {string} workflowId - The workflow ID
   * @param {string} userId - The user ID
   * @returns {Object} Analysis results with webhook URLs and insights
   */
  async analyzeWorkflowWithLLM(workflowData, workflowId, userId) {
    try {
      // Extract relevant workflow information for LLM analysis
      const workflowSummary = this.extractWorkflowSummary(workflowData);
      
      // Create LLM prompt for workflow analysis
      const prompt = this.createAnalysisPrompt(workflowSummary);
      
      // Call LLM API
      const llmResponse = await this.callLLM(prompt);
      
      // Parse LLM response and generate webhook URLs
      const analysis = this.parseLLMResponse(llmResponse, workflowId, userId);
      
      // Generate specific webhook URLs based on analysis
      const webhookUrls = this.generateWebhookUrls(analysis, workflowId, userId);
      
      console.log('🔧 LLM Service Debug - webhookUrls type:', typeof webhookUrls);
      console.log('🔧 LLM Service Debug - webhookUrls isArray:', Array.isArray(webhookUrls));
      console.log('🔧 LLM Service Debug - webhookUrls content:', JSON.stringify(webhookUrls, null, 2));
      
      const result = {
        ...analysis,
        webhookUrls,
        generatedAt: new Date().toISOString(),
        llmModel: this.model
      };
      
      console.log('🔧 LLM Service Debug - final result webhookUrls:', typeof result.webhookUrls);
      
      return result;
      
    } catch (error) {
      console.error('LLM workflow analysis error:', error);
      // Fallback to basic analysis if LLM fails
      return this.fallbackAnalysis(workflowData, workflowId, userId);
    }
  }

  /**
   * Extract relevant workflow information for LLM analysis
   * @param {Object} workflowData - The n8n workflow JSON data
   * @returns {Object} Simplified workflow summary
   */
  extractWorkflowSummary(workflowData) {
    const nodes = workflowData.nodes || [];
    const connections = workflowData.connections || {};
    
    return {
      workflowName: workflowData.name || 'Unnamed Workflow',
      nodeCount: nodes.length,
      nodes: nodes.map(node => ({
        id: node.id,
        name: node.name,
        type: node.type,
        position: node.position,
        parameters: this.sanitizeParameters(node.parameters || {}),
        webhookId: node.webhookId,
        disabled: node.disabled || false
      })),
      connections: this.simplifyConnections(connections),
      triggers: nodes.filter(node => 
        node.type?.includes('Trigger') || 
        node.type?.includes('Webhook') ||
        node.type === 'n8n-nodes-base.webhook'
      ),
      hasWebhooks: nodes.some(node => 
        node.type === 'n8n-nodes-base.webhook' || 
        node.type?.includes('Webhook')
      ),
      hasApiTriggers: nodes.some(node => 
        node.type?.includes('ApiTrigger') ||
        node.type?.includes('HttpTrigger')
      )
    };
  }

  /**
   * Create LLM prompt for workflow analysis
   * @param {Object} workflowSummary - Simplified workflow data
   * @returns {string} LLM prompt
   */
  createAnalysisPrompt(workflowSummary) {
    return `Analyze this n8n workflow and provide intelligent insights and webhook URL suggestions.

Workflow Details:
- Name: ${workflowSummary.workflowName}
- Node Count: ${workflowSummary.nodeCount}
- Has Webhooks: ${workflowSummary.hasWebhooks}
- Has API Triggers: ${workflowSummary.hasApiTriggers}

Nodes:
${workflowSummary.nodes.map(node => 
  `- ${node.name} (${node.type})${node.disabled ? ' [DISABLED]' : ''}`
).join('\n')}

Trigger Nodes:
${workflowSummary.triggers.map(trigger => 
  `- ${trigger.name} (${trigger.type})`
).join('\n')}

Please analyze this workflow and provide:

1. **Workflow Purpose**: A 2-3 sentence description of what this workflow does
2. **Input Methods**: How data enters this workflow (webhooks, triggers, etc.)
3. **Expected Webhook URLs**: Suggest appropriate webhook endpoint names based on the workflow's function
4. **Data Flow**: Brief description of how data flows through the workflow
5. **Integration Points**: What external services this workflow interacts with
6. **Recommended URL Patterns**: Suggest REST API-style URL patterns for triggering this workflow

Format your response as JSON:
{
  "purpose": "Description of workflow purpose",
  "inputMethods": ["webhook", "schedule", "manual", etc.],
  "dataFlow": "Brief data flow description",
  "integrations": ["service1", "service2", etc.],
  "webhookSuggestions": [
    {
      "endpoint": "/webhook/suggested-name",
      "method": "POST",
      "description": "Purpose of this webhook",
      "expectedPayload": "Description of expected data"
    }
  ],
  "urlPatterns": [
    {
      "pattern": "/api/v1/workflow-action",
      "description": "When to use this pattern"
    }
  ],
  "insights": ["insight1", "insight2", etc.]
}`;
  }

  /**
   * Call LLM API
   * @param {string} prompt - The analysis prompt
   * @returns {string} LLM response
   */
  async callLLM(prompt) {
    const response = await axios.post(`${this.apiBase}/chat/completions`, {
      model: this.model,
      messages: [
        {
          role: 'system',
          content: 'You are an expert n8n workflow analyst. Analyze workflows and provide intelligent insights about their purpose, data flow, and optimal webhook configurations. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    return response.data.choices[0].message.content;
  }

  /**
   * Parse LLM response
   * @param {string} llmResponse - Raw LLM response
   * @param {string} workflowId - Workflow ID
   * @param {string} userId - User ID
   * @returns {Object} Parsed analysis
   */
  parseLLMResponse(llmResponse, workflowId, userId) {
    try {
      // Clean response (remove markdown code blocks if present)
      const cleanResponse = llmResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const analysis = JSON.parse(cleanResponse);
      
      return {
        purpose: analysis.purpose || 'Workflow purpose could not be determined',
        inputMethods: analysis.inputMethods || ['webhook'],
        dataFlow: analysis.dataFlow || 'Data flow analysis unavailable',
        integrations: analysis.integrations || [],
        webhookSuggestions: analysis.webhookSuggestions || [],
        urlPatterns: analysis.urlPatterns || [],
        insights: analysis.insights || [],
        confidence: 'high'
      };
    } catch (error) {
      console.error('Error parsing LLM response:', error);
      return this.createFallbackAnalysis();
    }
  }

  /**
   * Generate webhook URLs based on analysis
   * @param {Object} analysis - LLM analysis results
   * @param {string} workflowId - Workflow ID
   * @param {string} userId - User ID
   * @returns {Array} Generated webhook URLs
   */
  generateWebhookUrls(analysis, workflowId, userId) {
    const baseUrl = this.n8nServerUrl.endsWith('/') ? this.n8nServerUrl : `${this.n8nServerUrl}/`;
    const webhookUrls = [];

    // Generate URLs from LLM suggestions
    analysis.webhookSuggestions.forEach((suggestion, index) => {
      const cleanEndpoint = suggestion.endpoint.replace(/^\/+/, '');
      webhookUrls.push({
        id: `llm-${index + 1}`,
        type: 'llm-suggested',
        method: suggestion.method || 'POST',
        url: `${baseUrl}webhook/${workflowId}/${cleanEndpoint}`,
        description: suggestion.description,
        expectedPayload: suggestion.expectedPayload,
        generated: true,
        source: 'llm'
      });
    });

    // Generate standard webhook URLs
    webhookUrls.push({
      id: 'standard',
      type: 'standard',
      method: 'POST',
      url: `${baseUrl}webhook/${workflowId}`,
      description: 'Standard webhook endpoint for this workflow',
      generated: true,
      source: 'system'
    });

    // Generate test webhook URLs
    webhookUrls.push({
      id: 'test',
      type: 'test',
      method: 'POST',
      url: `${baseUrl}webhook-test/${workflowId}`,
      description: 'Test webhook endpoint (does not execute workflow)',
      generated: true,
      source: 'system'
    });

    return webhookUrls;
  }

  /**
   * Fallback analysis when LLM is unavailable
   * @param {Object} workflowData - The n8n workflow JSON data
   * @param {string} workflowId - Workflow ID
   * @param {string} userId - User ID
   * @returns {Object} Basic analysis
   */
  fallbackAnalysis(workflowData, workflowId, userId) {
    const nodes = workflowData.nodes || [];
    const webhookNodes = nodes.filter(node => 
      node.type === 'n8n-nodes-base.webhook' || 
      node.type?.includes('Webhook')
    );

    const webhookUrls = this.generateWebhookUrls({
      webhookSuggestions: [{
        endpoint: '/webhook/trigger',
        method: 'POST',
        description: 'Main workflow trigger endpoint'
      }]
    }, workflowId, userId);
    
    console.log('🔧 Fallback Analysis Debug - webhookUrls type:', typeof webhookUrls);
    console.log('🔧 Fallback Analysis Debug - webhookUrls isArray:', Array.isArray(webhookUrls));
    
    return {
      purpose: 'Automated workflow for data processing and integration',
      inputMethods: webhookNodes.length > 0 ? ['webhook'] : ['manual'],
      dataFlow: 'Data flows through connected nodes for processing',
      integrations: [...new Set(nodes.map(node => node.type?.split('.')[1]).filter(Boolean))],
      webhookSuggestions: [{
        endpoint: '/webhook/trigger',
        method: 'POST',
        description: 'Main workflow trigger endpoint',
        expectedPayload: 'JSON payload with workflow data'
      }],
      urlPatterns: [{
        pattern: '/api/v1/workflow/execute',
        description: 'RESTful workflow execution endpoint'
      }],
      insights: [
        `Workflow contains ${nodes.length} nodes`,
        webhookNodes.length > 0 ? 'Webhook-triggered workflow' : 'Manual or scheduled workflow',
        'Ready for deployment and testing'
      ],
      webhookUrls,
      confidence: 'low',
      fallback: true
    };
  }

  /**
   * Create fallback analysis when LLM parsing fails
   * @returns {Object} Basic analysis structure
   */
  createFallbackAnalysis() {
    return {
      purpose: 'Workflow analysis unavailable',
      inputMethods: ['webhook'],
      dataFlow: 'Analysis unavailable',
      integrations: [],
      webhookSuggestions: [],
      urlPatterns: [],
      insights: ['LLM analysis failed, using basic configuration'],
      confidence: 'low'
    };
  }

  /**
   * Sanitize node parameters for LLM analysis
   * @param {Object} parameters - Node parameters
   * @returns {Object} Sanitized parameters
   */
  sanitizeParameters(parameters) {
    // Remove sensitive information and simplify for LLM
    const sanitized = {};
    for (const [key, value] of Object.entries(parameters)) {
      if (typeof value === 'string' && value.length > 100) {
        sanitized[key] = '[LONG_TEXT]';
      } else if (key.toLowerCase().includes('password') || key.toLowerCase().includes('secret')) {
        sanitized[key] = '[REDACTED]';
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  /**
   * Simplify connections for LLM analysis
   * @param {Object} connections - Node connections
   * @returns {Object} Simplified connections
   */
  simplifyConnections(connections) {
    const simplified = {};
    for (const [nodeId, outputs] of Object.entries(connections)) {
      simplified[nodeId] = Object.keys(outputs || {}).length;
    }
    return simplified;
  }
}

module.exports = new LLMWorkflowService();