import React from 'react';

function DashboardPage({ workflow, user, onFileUpload, onGenerateUI, isGenerating }) {
  if (!workflow) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
          <div style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>
            <svg style={{ margin: '0 auto', height: '4rem', width: '4rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            color: '#111827', 
            margin: '0 0 1rem 0' 
          }}>
            Welcome to Runcraft, {user?.name || 'User'}!
          </h2>
          <p style={{ 
            color: '#4b5563', 
            fontSize: '1rem', 
            margin: '0 0 1.5rem 0' 
          }}>
            Transform your n8n workflows into beautiful, functional React applications. 
            Get started by uploading a workflow JSON file.
          </p>
        </div>
      </div>
    );
  }

  if (isGenerating) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
          <div style={{
            animation: 'spin 1s linear infinite',
            borderRadius: '50%',
            height: '4rem',
            width: '4rem',
            border: '2px solid #e5e7eb',
            borderTopColor: '#667eea',
            margin: '0 auto 1.5rem auto'
          }}></div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            color: '#111827', 
            margin: '0 0 1rem 0' 
          }}>
            Generating Your App
          </h2>
          <p style={{ 
            color: '#4b5563', 
            fontSize: '1rem', 
            margin: 0 
          }}>
            Please wait while we transform your workflow into a React application...
          </p>
        </div>
      </div>
    );
  }

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

export default DashboardPage;