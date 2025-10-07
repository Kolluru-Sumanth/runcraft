// Test script for LLM Workflow Service
const llmWorkflowService = require('./services/llmWorkflowService');

// Sample n8n workflow for testing
const sampleWorkflow = {
  "name": "Contact Form Processor",
  "nodes": [
    {
      "id": "webhook-1",
      "name": "Contact Form Webhook",
      "type": "n8n-nodes-base.webhook",
      "position": [250, 300],
      "parameters": {
        "httpMethod": "POST",
        "path": "contact-form",
        "responseMode": "responseNode"
      },
      "webhookId": "contact-form-webhook"
    },
    {
      "id": "email-1", 
      "name": "Send Email Notification",
      "type": "n8n-nodes-base.emailSend",
      "position": [450, 300],
      "parameters": {
        "fromEmail": "noreply@example.com",
        "toEmail": "admin@example.com",
        "subject": "New Contact Form Submission"
      },
      "credentials": {
        "smtp": {
          "id": "1",
          "name": "SMTP Account"
        }
      }
    },
    {
      "id": "database-1",
      "name": "Save to Database", 
      "type": "n8n-nodes-base.postgres",
      "position": [650, 300],
      "parameters": {
        "operation": "insert",
        "table": "contacts"
      },
      "credentials": {
        "postgres": {
          "id": "2", 
          "name": "PostgreSQL Database"
        }
      }
    }
  ],
  "connections": {
    "webhook-1": {
      "main": [
        [
          {
            "node": "email-1",
            "type": "main",
            "index": 0
          },
          {
            "node": "database-1", 
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
};

async function testLLMAnalysis() {
  console.log('🧪 Testing LLM Workflow Analysis...\n');
  
  try {
    const workflowId = 'test-workflow-123';
    const userId = 'test-user-456';
    
    console.log('📊 Sample Workflow:');
    console.log(`- Name: ${sampleWorkflow.name}`);
    console.log(`- Nodes: ${sampleWorkflow.nodes.length}`);
    console.log(`- Node Types: ${sampleWorkflow.nodes.map(n => n.type).join(', ')}`);
    console.log('');
    
    console.log('🤖 Analyzing with LLM...');
    const analysis = await llmWorkflowService.analyzeWorkflowWithLLM(
      sampleWorkflow,
      workflowId, 
      userId
    );
    
    console.log('\n✅ Analysis Results:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    console.log('\n📝 Purpose:');
    console.log(analysis.purpose);
    
    console.log('\n🔄 Data Flow:');
    console.log(analysis.dataFlow);
    
    console.log('\n📥 Input Methods:');
    console.log(analysis.inputMethods.join(', '));
    
    console.log('\n🔗 Integrations:');
    console.log(analysis.integrations.join(', '));
    
    console.log('\n🌐 Generated Webhook URLs:');
    analysis.webhookUrls?.forEach((webhook, index) => {
      console.log(`${index + 1}. [${webhook.method}] ${webhook.url}`);
      console.log(`   Description: ${webhook.description}`);
      console.log(`   Source: ${webhook.source}`);
      console.log('');
    });
    
    console.log('💡 AI Insights:');
    analysis.insights?.forEach((insight, index) => {
      console.log(`${index + 1}. ${insight}`);
    });
    
    console.log('\n📈 Analysis Metadata:');
    console.log(`- Confidence: ${analysis.confidence}`);
    console.log(`- Model: ${analysis.llmModel}`);
    console.log(`- Generated: ${analysis.generatedAt}`);
    console.log(`- Fallback: ${analysis.fallback ? 'Yes' : 'No'}`);
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
if (require.main === module) {
  testLLMAnalysis();
}

module.exports = { testLLMAnalysis, sampleWorkflow };