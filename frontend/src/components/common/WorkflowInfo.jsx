import React from 'react';

function WorkflowInfo({ workflow, isMobile }) {
  if (!workflow) {
    return (
      <div style={{ marginBottom: isMobile ? '1rem' : '1.5rem' }}>
        <h3 style={{ 
          fontSize: isMobile ? '0.875rem' : '1rem', 
          fontWeight: '500', 
          color: '#374151', 
          margin: '0 0 0.75rem 0' 
        }}>
          Workflow Information
        </h3>
        <div style={{
          backgroundColor: '#f9fafb',
          borderRadius: '0.5rem',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ color: '#9ca3af', marginBottom: '0.5rem' }}>
            <svg style={{ 
              margin: '0 auto', 
              height: isMobile ? '2rem' : '3rem', 
              width: isMobile ? '2rem' : '3rem' 
            }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p style={{ 
            color: '#4b5563', 
            fontSize: isMobile ? '0.75rem' : '0.875rem',
            margin: 0 
          }}>
            Upload a workflow to see details
          </p>
        </div>
      </div>
    );
  }

  const nodes = workflow.nodes || [];
  const name = workflow.name || "Untitled Workflow";

  return (
    <div style={{ marginBottom: isMobile ? '1rem' : '1.5rem', flex: 1 }}>
      <h3 style={{ 
        fontSize: isMobile ? '0.875rem' : '1rem', 
        fontWeight: '500', 
        color: '#374151', 
        margin: '0 0 0.75rem 0' 
      }}>
        Workflow Information
      </h3>
      
      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '0.5rem',
        overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(to right, #eff6ff, #e0e7ff)',
          padding: isMobile ? '0.75rem' : '1rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h4 style={{ 
            fontSize: isMobile ? '0.875rem' : '1rem', 
            fontWeight: '600', 
            color: '#111827', 
            margin: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }} title={name}>
            {name}
          </h4>
        </div>

        <div style={{ padding: isMobile ? '0.75rem' : '1rem' }}>
          <div style={{
            backgroundColor: '#f9fafb',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: isMobile ? '1rem' : '1.25rem', marginBottom: '0.25rem' }}>⚙️</div>
            <div style={{ 
              fontSize: isMobile ? '0.875rem' : '1rem', 
              fontWeight: '600', 
              color: '#111827' 
            }}>
              {nodes.length}
            </div>
            <div style={{ 
              fontSize: '0.75rem', 
              color: '#4b5563' 
            }}>
              Nodes
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkflowInfo;