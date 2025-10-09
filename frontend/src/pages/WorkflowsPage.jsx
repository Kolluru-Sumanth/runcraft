import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

function WorkflowsPage({ user }) {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
              key={workflow._id}
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
                <span style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: workflow.status === 'active' ? '#dcfce7' : 
                                   workflow.status === 'deployed' ? '#dbeafe' : '#fef3c7',
                  color: workflow.status === 'active' ? '#166534' : 
                         workflow.status === 'deployed' ? '#1e40af' : '#92400e',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  {workflow.status}
                </span>
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
                    Nodes
                  </p>
                  <p style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: '600', 
                    color: '#111827', 
                    margin: 0 
                  }}>
                    {workflow.nodeCount}
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
                    Updated
                  </p>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#111827', 
                    margin: 0 
                  }}>
                    {workflow.updatedAt ? new Date(workflow.updatedAt).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </p>
                </div>
              </div>
              <div style={{
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                justifyContent: 'center'
              }}>
                <span style={{
                  display: 'inline-block',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '0.375rem',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: workflow.missingCredentials && workflow.missingCredentials.length > 0 ? '#b91c1c' : '#166534',
                  background: workflow.missingCredentials && workflow.missingCredentials.length > 0 ? '#fee2e2' : '#dcfce7',
                  border: workflow.missingCredentials && workflow.missingCredentials.length > 0 ? '1px solid #fca5a5' : '1px solid #6ee7b7'
                }}>
                  {workflow.missingCredentials && workflow.missingCredentials.length > 0 ? 'Pending' : 'Completed'}
                </span>
                {workflow.missingCredentials && workflow.missingCredentials.length > 0 && (
                  <span style={{ fontSize: '0.85rem', color: '#b91c1c', fontWeight: 500 }}>
                    Missing: {workflow.missingCredentials.join(', ')}
                  </span>
                )}
              </div>

              <div style={{ 
                display: 'flex', 
                gap: '0.5rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e5e7eb'
              }}>
                <button style={{
                  flex: 1,
                  padding: '0.5rem 1rem',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
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
    </div>
  );
}

export default WorkflowsPage;