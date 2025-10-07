import React, { useState } from 'react';

function ExecutionsPage({ user }) {
  const [activeTab, setActiveTab] = useState('recent');

  const executions = [
    {
      id: 1,
      workflowName: 'Contact Form Handler',
      status: 'success',
      startTime: new Date(Date.now() - 1000 * 60 * 15),
      duration: 1.2,
      triggeredBy: 'webhook'
    },
    {
      id: 2,
      workflowName: 'Data Synchronizer',
      status: 'error',
      startTime: new Date(Date.now() - 1000 * 60 * 45),
      duration: 0.8,
      triggeredBy: 'manual',
      error: 'Connection timeout to database'
    },
    {
      id: 3,
      workflowName: 'Social Media Monitor',
      status: 'running',
      startTime: new Date(Date.now() - 1000 * 60 * 5),
      duration: null,
      triggeredBy: 'schedule'
    },
    {
      id: 4,
      workflowName: 'E-commerce Order Processor',
      status: 'success',
      startTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
      duration: 2.5,
      triggeredBy: 'webhook'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'success':
        return { bg: '#dcfce7', color: '#166534' };
      case 'error':
        return { bg: '#fee2e2', color: '#dc2626' };
      case 'running':
        return { bg: '#dbeafe', color: '#2563eb' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'running':
        return '🔄';
      default:
        return '⏸️';
    }
  };

  const formatDuration = (duration) => {
    if (duration === null) return 'Running...';
    return `${duration}s`;
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ago`;
    }
    return `${minutes}m ago`;
  };

  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2rem' 
      }}>
        <div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: '#111827', 
            margin: '0 0 0.5rem 0' 
          }}>
            Workflow Executions
          </h1>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '1rem', 
            margin: 0 
          }}>
            Monitor and track your workflow execution history
          </p>
        </div>
        
        <button style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex',
        borderBottom: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        {['recent', 'successful', 'failed', 'running'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #667eea' : '2px solid transparent',
              color: activeTab === tab ? '#667eea' : '#6b7280',
              fontWeight: activeTab === tab ? '600' : '400',
              fontSize: '0.875rem',
              cursor: 'pointer',
              textTransform: 'capitalize'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          border: '1px solid #e5e7eb',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              backgroundColor: '#dcfce7',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              ✅
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>
                Successful
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                142
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          border: '1px solid #e5e7eb',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              backgroundColor: '#fee2e2',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              ❌
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>
                Failed
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                8
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          border: '1px solid #e5e7eb',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              backgroundColor: '#dbeafe',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              🔄
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>
                Running
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                3
              </p>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          border: '1px solid #e5e7eb',
          padding: '1.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              backgroundColor: '#fef3c7',
              borderRadius: '0.5rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              📊
            </div>
            <div>
              <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 0.25rem 0' }}>
                Avg Duration
              </p>
              <p style={{ fontSize: '1.5rem', fontWeight: '700', color: '#111827', margin: 0 }}>
                1.8s
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Executions List */}
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
        overflow: 'hidden'
      }}>
        <div style={{
          padding: '1.5rem 1.5rem 0 1.5rem'
        }}>
          <h3 style={{
            fontSize: '1.125rem',
            fontWeight: '600',
            color: '#111827',
            margin: '0 0 1.5rem 0'
          }}>
            Recent Executions
          </h3>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e7eb' }}>
                <th style={{ 
                  padding: '0.75rem 1.5rem', 
                  textAlign: 'left', 
                  fontSize: '0.75rem', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Workflow
                </th>
                <th style={{ 
                  padding: '0.75rem 1.5rem', 
                  textAlign: 'left', 
                  fontSize: '0.75rem', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Status
                </th>
                <th style={{ 
                  padding: '0.75rem 1.5rem', 
                  textAlign: 'left', 
                  fontSize: '0.75rem', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Started
                </th>
                <th style={{ 
                  padding: '0.75rem 1.5rem', 
                  textAlign: 'left', 
                  fontSize: '0.75rem', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Duration
                </th>
                <th style={{ 
                  padding: '0.75rem 1.5rem', 
                  textAlign: 'left', 
                  fontSize: '0.75rem', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Trigger
                </th>
                <th style={{ 
                  padding: '0.75rem 1.5rem', 
                  textAlign: 'left', 
                  fontSize: '0.75rem', 
                  fontWeight: '600', 
                  color: '#6b7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {executions.map((execution) => {
                const statusStyle = getStatusColor(execution.status);
                return (
                  <tr key={execution.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div>
                        <p style={{ 
                          fontSize: '0.875rem', 
                          fontWeight: '500', 
                          color: '#111827', 
                          margin: '0 0 0.25rem 0' 
                        }}>
                          {execution.workflowName}
                        </p>
                        {execution.error && (
                          <p style={{ 
                            fontSize: '0.75rem', 
                            color: '#dc2626', 
                            margin: 0 
                          }}>
                            {execution.error}
                          </p>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.875rem' }}>
                          {getStatusIcon(execution.status)}
                        </span>
                        <span style={{
                          padding: '0.25rem 0.5rem',
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.color,
                          borderRadius: '0.375rem',
                          fontSize: '0.75rem',
                          fontWeight: '500',
                          textTransform: 'capitalize'
                        }}>
                          {execution.status}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: '#6b7280', 
                        margin: 0 
                      }}>
                        {formatTime(execution.startTime)}
                      </p>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <p style={{ 
                        fontSize: '0.875rem', 
                        color: '#6b7280', 
                        margin: 0 
                      }}>
                        {formatDuration(execution.duration)}
                      </p>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280',
                        borderRadius: '0.375rem',
                        fontSize: '0.75rem',
                        fontWeight: '500',
                        textTransform: 'capitalize'
                      }}>
                        {execution.triggeredBy}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button style={{
                          padding: '0.375rem',
                          backgroundColor: '#f3f4f6',
                          color: '#6b7280',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer'
                        }}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button style={{
                          padding: '0.375rem',
                          backgroundColor: '#f3f4f6',
                          color: '#6b7280',
                          border: 'none',
                          borderRadius: '0.375rem',
                          cursor: 'pointer'
                        }}>
                          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ExecutionsPage;