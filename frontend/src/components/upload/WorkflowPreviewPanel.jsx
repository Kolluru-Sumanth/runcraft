// Renamed from PreviewPanel.jsx to WorkflowPreviewPanel.jsx
import React, { useState } from 'react';

// ...existing code from upload/PreviewPanel.jsx...

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

// ...rest of the code from upload/PreviewPanel.jsx...

export default WorkflowPreviewPanel;
