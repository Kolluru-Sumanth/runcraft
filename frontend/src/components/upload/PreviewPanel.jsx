import React, { useState } from 'react';

// Empty State Component
function EmptyState() {
  return (
    <div style={{
      flex: 1,
      backgroundColor: '#ffffff',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      padding: '3rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }}>
      <div style={{ color: '#d1d5db', marginBottom: '1.5rem' }}>
        <svg style={{ margin: '0 auto', height: '5rem', width: '5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <h3 style={{ 
        fontSize: '1.5rem', 
        fontWeight: '600', 
        color: '#9ca3af', 
        margin: '0 0 1rem 0' 
      }}>
        Workflow Analysis
      </h3>
      <p style={{ 
        color: '#9ca3af', 
        fontSize: '1rem', 
        maxWidth: '24rem' 
      }}>
        Upload a workflow to see AI-powered analysis, webhook URLs, and intelligent insights about your n8n workflow.
      </p>
    </div>
  );
}

// Generating State Component
function GeneratingState() {
  return (
    <div style={{ 
      flex: 1,
      backgroundColor: '#ffffff',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      padding: '3rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    }}>
      <div style={{
        width: '4rem',
        height: '4rem',
        border: '3px solid #e5e7eb',
        borderTopColor: '#667eea',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '2rem'
      }} />
      <h3 style={{ 
        fontSize: '1.5rem', 
        fontWeight: '600', 
        color: '#111827', 
        margin: '0 0 1rem 0' 
      }}>
        Analyzing Workflow...
      </h3>
      <p style={{ 
        color: '#6b7280', 
        fontSize: '1rem' 
      }}>
        AI is analyzing your workflow and generating webhook URLs
      </p>
    </div>
  );
}

// Analysis Tab Component
function AnalysisTab({ llmAnalysis, workflow }) {
  if (!llmAnalysis) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
          LLM analysis not available. Upload the workflow again to get AI-powered insights.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Purpose */}
      <div>
        <h4 style={{ 
          fontSize: '1rem', 
          fontWeight: '600', 
          color: '#111827', 
          margin: '0 0 0.5rem 0' 
        }}>
          Workflow Purpose
        </h4>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '0.875rem', 
          lineHeight: '1.5',
          margin: 0,
          backgroundColor: '#f9fafb',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          {llmAnalysis.purpose}
        </p>
      </div>

      {/* Data Flow */}
      <div>
        <h4 style={{ 
          fontSize: '1rem', 
          fontWeight: '600', 
          color: '#111827', 
          margin: '0 0 0.5rem 0' 
        }}>
          Data Flow
        </h4>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '0.875rem', 
          lineHeight: '1.5',
          margin: 0,
          backgroundColor: '#f9fafb',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          {llmAnalysis.dataFlow}
        </p>
      </div>

      {/* Input Methods */}
      <div>
        <h4 style={{ 
          fontSize: '1rem', 
          fontWeight: '600', 
          color: '#111827', 
          margin: '0 0 0.5rem 0' 
        }}>
          Input Methods
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {llmAnalysis.inputMethods?.map((method, index) => (
            <span
              key={index}
              style={{
                backgroundColor: '#e0e7ff',
                color: '#3730a3',
                fontSize: '0.75rem',
                fontWeight: '500',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.375rem'
              }}
            >
              {method}
            </span>
          ))}
        </div>
      </div>

      {/* Integrations */}
      {llmAnalysis.integrations?.length > 0 && (
        <div>
          <h4 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: '#111827', 
            margin: '0 0 0.5rem 0' 
          }}>
            Integrations
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {llmAnalysis.integrations.map((integration, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: '#f0fdf4',
                  color: '#166534',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #bbf7d0'
                }}
              >
                {integration}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Webhooks Tab Component
function WebhooksTab({ webhookUrls, llmAnalysis, webhookUsageDescription }) {
  const [copiedUrl, setCopiedUrl] = useState(null);

  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!webhookUrls || webhookUrls.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ color: '#d1d5db', marginBottom: '1rem' }}>
          <svg style={{ margin: '0 auto', height: '3rem', width: '3rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
          No webhook URLs generated. The workflow may not contain webhook triggers.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ 
        color: '#6b7280', 
        fontSize: '0.875rem',
        margin: '0 0 1rem 0',
        padding: '0.75rem',
        backgroundColor: '#eff6ff',
        borderRadius: '0.5rem',
        border: '1px solid #dbeafe'
      }}>
        💡 Use these webhook URLs to trigger your workflow from external services or applications.
      </p>

      {webhookUsageDescription && (
        <div style={{
          padding: '1rem',
          backgroundColor: '#f0fdf4',
          borderRadius: '0.5rem',
          border: '1px solid #bbf7d0',
          marginBottom: '1rem'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '1rem' }}>🤖</span>
            <span style={{
              fontSize: '0.875rem',
              fontWeight: '600',
              color: '#166534'
            }}>
              AI-Generated Integration Guide
            </span>
          </div>
          <p style={{
            color: '#166534',
            fontSize: '0.875rem',
            lineHeight: '1.5',
            margin: 0
          }}>
            {webhookUsageDescription}
          </p>
        </div>
      )}

      {webhookUrls.map((webhook, index) => (
        <div
          key={webhook.id || webhook.nodeId || index}
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1rem',
            backgroundColor: '#ffffff'
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                backgroundColor: webhook.method === 'POST' ? '#10b981' : '#f59e0b',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: '500',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.375rem'
              }}>
                {webhook.method || 'POST'}
              </span>
              <span style={{
                backgroundColor: (webhook.webhookUrl ? '#10b981' : '#8b5cf6'),
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: '500',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.375rem'
              }}>
                {webhook.webhookUrl ? 'Live URL' : 'AI Generated'}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(webhook.webhookUrl || webhook.url)}
              style={{
                backgroundColor: copiedUrl === (webhook.webhookUrl || webhook.url) ? '#10b981' : '#667eea',
                color: 'white',
                border: 'none',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              {copiedUrl === (webhook.webhookUrl || webhook.url) ? (
                <>
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid #e2e8f0',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            color: '#374151',
            wordBreak: 'break-all',
            marginBottom: '0.5rem'
          }}>
            {webhook.webhookUrl || webhook.url}
          </div>
          
          {(webhook.description || webhook.details || webhook.nodeName) && (
            <p style={{ 
              color: '#6b7280', 
              fontSize: '0.875rem',
              margin: '0.5rem 0 0 0',
              lineHeight: '1.4'
            }}>
              {webhook.description || (webhook.nodeName && `Webhook node: ${webhook.nodeName}`) || webhook.details}
            </p>
          )}
          
          {webhook.expectedPayload && (
            <div style={{ marginTop: '0.5rem' }}>
              <span style={{ 
                color: '#9ca3af', 
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                Expected Payload: 
              </span>
              <span style={{ 
                color: '#6b7280', 
                fontSize: '0.75rem',
                marginLeft: '0.25rem'
              }}>
                {webhook.expectedPayload}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Insights Tab Component
function InsightsTab({ llmAnalysis, workflow }) {
  if (!llmAnalysis) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
          AI insights not available. Upload the workflow again to get intelligent recommendations.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* AI Insights */}
      {llmAnalysis.insights?.length > 0 && (
        <div>
          <h4 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: '#111827', 
            margin: '0 0 1rem 0' 
          }}>
            AI Insights
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {llmAnalysis.insights.map((insight, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{
                  backgroundColor: '#667eea',
                  color: 'white',
                  borderRadius: '50%',
                  width: '1.5rem',
                  height: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  flexShrink: 0
                }}>
                  {index + 1}
                </div>
                <p style={{ 
                  color: '#374151', 
                  fontSize: '0.875rem',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  {insight}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* URL Patterns */}
      {llmAnalysis.urlPatterns?.length > 0 && (
        <div>
          <h4 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: '#111827', 
            margin: '0 0 1rem 0' 
          }}>
            Recommended URL Patterns
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {llmAnalysis.urlPatterns.map((pattern, index) => (
              <div
                key={index}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb',
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  color: '#374151'
                }}
              >
                {pattern}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {llmAnalysis.recommendations?.length > 0 && (
        <div>
          <h4 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: '#111827', 
            margin: '0 0 1rem 0' 
          }}>
            Recommendations
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {llmAnalysis.recommendations.map((recommendation, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: '#fef3c7',
                  borderRadius: '0.5rem',
                  border: '1px solid #fde68a'
                }}
              >
                <span style={{ fontSize: '1rem' }}>💡</span>
                <p style={{ 
                  color: '#92400e', 
                  fontSize: '0.875rem',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  {recommendation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Main Preview Panel Component
function PreviewPanel({ workflow, isGenerating }) {
  const [activeTab, setActiveTab] = useState('analysis');

  if (!workflow) {
    return <EmptyState />;
  }

  if (isGenerating) {
    return <GeneratingState />;
  }

  const llmAnalysis = workflow.llmAnalysis;
  
  // Prioritize real webhook URLs from deployment over LLM analysis
  // triggerInfo is directly an array of webhook objects, not {webhookUrls: [...]}
  const realWebhookUrls = workflow.triggerInfo || [];
  const llmWebhookUrls = llmAnalysis?.webhookUrls || [];
  
  // Use real URLs if available, otherwise fall back to LLM generated URLs
  const webhookUrls = realWebhookUrls.length > 0 ? realWebhookUrls : llmWebhookUrls;
  
  return (
    <div style={{ 
      flex: 1,
      backgroundColor: '#ffffff',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '1.5rem',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#111827', 
            margin: '0 0 0.25rem 0' 
          }}>
            {workflow.name}
          </h3>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '0.875rem',
            margin: 0 
          }}>
            {workflow.nodeCount} nodes • {llmAnalysis ? `Analyzed with ${llmAnalysis.confidence} confidence` : 'Basic analysis'}
            {workflow.credentialRequirements && workflow.credentialRequirements.length > 0 && (
              <span style={{ margin: '0 0.5rem' }}>•</span>
            )}
            {workflow.credentialRequirements && workflow.credentialRequirements.length > 0 && (
              <span style={{
                color: workflow.missingCredentials && workflow.missingCredentials.length > 0 ? '#ef4444' : '#10b981'
              }}>
                {workflow.credentialRequirements.length} credential{workflow.credentialRequirements.length !== 1 ? 's' : ''} 
                {workflow.missingCredentials && workflow.missingCredentials.length > 0 
                  ? ` (${workflow.missingCredentials.length} missing)` 
                  : ' (all configured)'}
              </span>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {llmAnalysis?.confidence && (
            <span style={{
              backgroundColor: llmAnalysis.confidence === 'high' ? '#10b981' : 
                             llmAnalysis.confidence === 'medium' ? '#f59e0b' : '#ef4444',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: '500',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem'
            }}>
              {llmAnalysis.confidence.toUpperCase()}
            </span>
          )}
          {workflow.credentialRequirements && workflow.credentialRequirements.length > 0 && (
            <span style={{
              backgroundColor: workflow.missingCredentials && workflow.missingCredentials.length > 0 ? '#ef4444' : '#10b981',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: '500',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem'
            }}>
              {workflow.missingCredentials && workflow.missingCredentials.length > 0 
                ? `${workflow.missingCredentials.length} MISSING` 
                : 'CREDENTIALS OK'}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb'
      }}>
        {['analysis', 'webhooks', 'insights'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: activeTab === tab ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #667eea' : '2px solid transparent',
              color: activeTab === tab ? '#667eea' : '#6b7280',
              fontWeight: activeTab === tab ? '600' : '500',
              fontSize: '0.875rem',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s ease'
            }}
          >
            {tab === 'webhooks' ? 'Webhook URLs' : tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ 
        flex: 1,
        padding: '1.5rem',
        overflow: 'auto'
      }}>
        {activeTab === 'analysis' && (
          <AnalysisTab llmAnalysis={llmAnalysis} workflow={workflow} />
        )}
        {activeTab === 'webhooks' && (
          <WebhooksTab 
            webhookUrls={webhookUrls} 
            llmAnalysis={llmAnalysis} 
            webhookUsageDescription={workflow.webhookUsageDescription}
          />
        )}
        {activeTab === 'insights' && (
          <InsightsTab llmAnalysis={llmAnalysis} workflow={workflow} />
        )}
      </div>
    </div>
  );
}

export default PreviewPanel;