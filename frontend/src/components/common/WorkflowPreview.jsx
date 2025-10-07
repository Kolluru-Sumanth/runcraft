import React from 'react';

function WorkflowPreview({ workflow }) {
  const nodeCount = workflow.nodes?.length || 0;
  const name = workflow.name || "Untitled Workflow";

  return (
    <div style={{ textAlign: 'center', padding: '3rem 0' }}>
      <div style={{ maxWidth: '32rem', margin: '0 auto' }}>
        <div style={{
          backgroundColor: '#dcfce7',
          borderRadius: '50%',
          padding: '1rem',
          width: '4rem',
          height: '4rem',
          margin: '0 auto 1.5rem auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <svg style={{ width: '2rem', height: '2rem', color: '#16a34a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '700', 
          color: '#111827', 
          margin: '0 0 1rem 0' 
        }}>
          Workflow Ready!
        </h2>
        <p style={{ 
          color: '#4b5563', 
          fontSize: '1rem', 
          margin: '0 0 1.5rem 0' 
        }}>
          <strong>{name}</strong> has been loaded with {nodeCount} nodes. 
          Ready to generate your React application.
        </p>
      </div>
    </div>
  );
}

export default WorkflowPreview;