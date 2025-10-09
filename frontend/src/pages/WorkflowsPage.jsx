import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

function WorkflowsPage({ user }) {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [detailsWorkflow, setDetailsWorkflow] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('runcraft_token');
        const response = await fetch(`${API_BASE_URL}/workflows`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch workflows');
        }

        const data = await response.json();
        
        // Handle different possible response structures
        let workflowsData = [];
        if (data.data?.workflows && Array.isArray(data.data.workflows)) {
          workflowsData = data.data.workflows;
        } else if (data.data && Array.isArray(data.data)) {
          workflowsData = data.data;
        } else if (Array.isArray(data)) {
          workflowsData = data;
        }
        
        setWorkflows(workflowsData);
      } catch (err) {
        console.error('Error fetching workflows:', err);
        setError(err.message);
        setWorkflows([]); // Ensure workflows is always an array
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <div style={{
          width: '2rem',
          height: '2rem',
          border: '2px solid #e5e7eb',
          borderTopColor: '#667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem auto'
        }} />
        <p>Loading workflows...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <div style={{ color: '#ef4444' }}>
          <h3>Error loading workflows</h3>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '700', 
          color: '#111827', 
          margin: 0 
        }}>
          My Workflows
        </h1>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          padding: '0.5rem 1rem',
          backgroundColor: '#f3f4f6',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          color: '#6b7280'
        }}>
          {workflows.length} workflow{workflows.length !== 1 ? 's' : ''}
        </div>
      </div>

      {!Array.isArray(workflows) || workflows.length === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '4rem 2rem',
          backgroundColor: '#f9fafb',
          borderRadius: '0.75rem',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ color: '#9ca3af', marginBottom: '1rem' }}>
            <svg style={{ margin: '0 auto', height: '3rem', width: '3rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#6b7280', 
            margin: '0 0 0.5rem 0' 
          }}>
            No workflows yet
          </h3>
          <p style={{ 
            color: '#9ca3af', 
            margin: 0 
          }}>
            Upload your first n8n workflow to get started.
          </p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
          gap: '1.5rem' 
        }}>
          {Array.isArray(workflows) && workflows.map((workflow) => (
            <div 
              key={workflow.id || workflow._id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '0.75rem',
                border: '1px solid #e5e7eb',
                padding: '1.5rem',
                transition: 'all 0.2s ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = '#c7d2fe';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = '#e5e7eb';
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  color: '#111827', 
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '70%'
                }}>
                  {workflow.name}
                </h3>
                {(() => {
                  // Prefer isActive boolean to show Active/Inactive across the app
                  const isActive = !!workflow.isActive;
                  const info = isActive
                    ? { bg: '#dcfce7', color: '#166534', label: 'Active' }
                    : { bg: '#f3f4f6', color: '#6b7280', label: 'Inactive' };
                  return (
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: info.bg,
                      color: info.color,
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {info.label}
                    </span>
                  );
                })()}
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '1rem',
                marginBottom: '1rem'
              }}>
                <div>
                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: '#6b7280', 
                    margin: '0 0 0.25rem 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Triggers
                  </p>
                  <p style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600', 
                    color: '#111827', 
                    margin: 0 
                  }}>
                    {workflow.triggerCount ?? workflow.nodeCount ?? 0}
                  </p>
                </div>
                <div>
                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: '#6b7280', 
                    margin: '0 0 0.25rem 0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                  }}>
                    Created
                  </p>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#111827', 
                    margin: 0 
                  }}>
                    {workflow.createdAt ? new Date(workflow.createdAt).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : (workflow.created ? new Date(workflow.created).toLocaleString() : 'N/A')}
                  </p>
                </div>
              </div>
              {/* credential badge removed here to avoid duplicate status display; top-right badge now drives the status UI */}

              <div style={{ 
                display: 'flex', 
                gap: '0.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    // Fetch workflow details from API
                    try {
                      setDetailsLoading(true);
                      setDetailsOpen(true);
                      const token = localStorage.getItem('runcraft_token');
                      const resp = await fetch(`${API_BASE_URL}/workflows/${workflow.id || workflow._id}`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                      });
                      if (!resp.ok) {
                        throw new Error('Failed to fetch workflow details');
                      }
                      const data = await resp.json();
                      setDetailsWorkflow(data.data?.workflow || data.workflow || data);
                    } catch (err) {
                      console.error('Error fetching workflow details:', err);
                      setDetailsWorkflow({ error: err.message });
                    } finally {
                      setDetailsLoading(false);
                    }
                  }
                  }
                  style={{
                    flex: 1,
                    padding: '0.5rem 1rem',
                    backgroundColor: '#667eea',
                    color: 'white',
                    border: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  View Details
                </button>
                <button style={{
                  padding: '0.5rem',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280',
                  border: 'none',
                  borderRadius: '0.375rem',
                  cursor: 'pointer'
                }}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Slide-out details panel */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        height: '100%',
        width: detailsOpen ? '480px' : '0px',
        backgroundColor: '#ffffff',
        boxShadow: detailsOpen ? '-24px 0 40px rgba(2,6,23,0.2)' : 'none',
        overflow: 'hidden',
        transition: 'width 300ms ease',
        zIndex: 1000
      }}>
        <div style={{ width: '100%', height: '100%', display: detailsOpen ? 'block' : 'none' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
            <h3 style={{ margin: 0, fontSize: '1.125rem' }}>Workflow Details</h3>
            <button onClick={() => { setDetailsOpen(false); setDetailsWorkflow(null); }} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
          </div>
          <div style={{ padding: '1rem', overflowY: 'auto', height: 'calc(100% - 64px)' }}>
            {detailsLoading ? (
              <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
            ) : detailsWorkflow ? (
              detailsWorkflow.error ? (
                <div style={{ color: '#dc2626' }}>Error: {detailsWorkflow.error}</div>
              ) : (
                <div style={{ fontSize: '0.95rem', color: '#111827', lineHeight: 1.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '1.125rem', fontWeight: 600 }}>{detailsWorkflow.name}</div>
                      <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>{detailsWorkflow._id || detailsWorkflow.id}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.375rem', background: detailsWorkflow.isActive ? '#dcfce7' : '#f3f4f6', color: detailsWorkflow.isActive ? '#166534' : '#6b7280', fontWeight: 600 }}>{detailsWorkflow.isActive ? 'Active' : 'Inactive'}</span>
                        <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{detailsWorkflow.status.replace('_',' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '0.75rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                    <div style={{ color: '#6b7280' }}>Created</div>
                    <div style={{ color: '#111827', textAlign: 'right' }}>{detailsWorkflow.createdAt ? new Date(detailsWorkflow.createdAt).toLocaleString() : (detailsWorkflow.created ? new Date(detailsWorkflow.created).toLocaleString() : 'N/A')}</div>
                  </div>

                  <hr style={{ margin: '1rem 0', borderColor: '#eef2f7' }} />

                  <h4 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Credentials</h4>
                  {Array.isArray(detailsWorkflow.credentialRequirements) && detailsWorkflow.credentialRequirements.length > 0 ? (
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {detailsWorkflow.credentialRequirements.map((c, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', background: '#fbfbfd', borderRadius: '0.375rem', border: '1px solid #f3f4f6' }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{c.nodeName}</div>
                            <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>{c.credentialType}</div>
                          </div>
                          <div>
                            <span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.375rem', background: c.isConfigured ? '#dcfce7' : '#fee2e2', color: c.isConfigured ? '#166534' : '#b91c1c', fontWeight: 600 }}>{c.isConfigured ? 'Configured' : 'Missing'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (<p style={{ color: '#6b7280' }}>No credential requirements found.</p>)}

                  <h4 style={{ marginTop: '1rem' }}>Triggers</h4>
                  {Array.isArray(detailsWorkflow.triggerInfo) && detailsWorkflow.triggerInfo.length > 0 ? (
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {detailsWorkflow.triggerInfo.map((t, i) => (
                        <div key={i} style={{ padding: '0.5rem', borderRadius: '0.375rem', background: '#fbfbfd', border: '1px solid #f3f4f6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontWeight: 600 }}>{t.nodeName}</div>
                            <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>{t.type}</div>
                          </div>
                          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <a href={t.webhookUrl || t.testUrl || '#'} target="_blank" rel="noreferrer" style={{ color: '#3b82f6', textDecoration: 'none', fontSize: '0.9rem' }}>{t.webhookUrl ? 'Open' : (t.testUrl ? 'Test' : 'N/A')}</a>
                            <button onClick={() => { navigator.clipboard?.writeText(t.webhookUrl || t.testUrl || ''); }} style={{ padding: '0.25rem 0.5rem', background: '#f3f4f6', border: 'none', borderRadius: '0.375rem', cursor: 'pointer' }}>Copy</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (<p style={{ color: '#6b7280' }}>No triggers detected.</p>)}

                  <h4 style={{ marginTop: '1rem' }}>Deployment History</h4>
                  {Array.isArray(detailsWorkflow.deploymentHistory) && detailsWorkflow.deploymentHistory.length > 0 ? (
                    <div style={{ display: 'grid', gap: '0.5rem' }}>
                      {detailsWorkflow.deploymentHistory.map((h, i) => (
                        <div key={i} style={{ padding: '0.5rem', borderRadius: '0.375rem', background: '#ffffff', border: '1px solid #f3f4f6' }}>
                          <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>{new Date(h.timestamp).toLocaleString()}</div>
                          <div style={{ fontWeight: 600 }}>{h.action}</div>
                          <div style={{ color: '#374151' }}>{h.details}</div>
                        </div>
                      ))}
                    </div>
                  ) : (<p style={{ color: '#6b7280' }}>No deployment history yet.</p>)}
                </div>
              )
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem' }}>No workflow selected</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkflowsPage;

// Slide-out details panel styles and component are rendered by WorkflowsPage via state