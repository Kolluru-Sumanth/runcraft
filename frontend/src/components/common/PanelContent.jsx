import React from 'react';
import WorkflowInfo from './WorkflowInfo';

function PanelContent({ workflow, onFileUpload, onGenerateUI, isGenerating, onClose, isMobile, user, onSignOut }) {
  return (
    <div style={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column', 
      padding: isMobile ? '1rem' : '1.5rem' 
    }}>
      {/* Header */}
      <div style={{ marginBottom: isMobile ? '1.5rem' : '2rem' }}>
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>Runcraft</h1>
              <p style={{ color: '#4b5563', fontSize: '0.75rem', margin: '0.25rem 0 0 0' }}>Transform n8n workflows</p>
            </div>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem',
                color: '#6b7280',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer'
              }}
            >
              <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        
        {!isMobile && (
          <div style={{ marginBottom: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1f2937', margin: '0 0 0.5rem 0' }}>Runcraft</h1>
            <p style={{ color: '#4b5563', fontSize: '0.875rem', margin: 0 }}>Transform n8n workflows into React applications</p>
          </div>
        )}
      </div>

      {/* Workflow Info */}
      <WorkflowInfo workflow={workflow} isMobile={isMobile} />

      {/* Generate Button */}
      <div style={{ marginTop: '1.5rem' }}>
        <button
          onClick={onGenerateUI}
          disabled={!workflow || isGenerating}
          style={{
            width: '100%',
            backgroundColor: workflow && !isGenerating ? '#667eea' : '#9ca3af',
            color: 'white',
            fontWeight: '500',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: workflow && !isGenerating ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'background-color 0.15s'
          }}
        >
          {isGenerating ? (
            <>
              <span>⏳</span>
              Generating...
            </>
          ) : (
            <>
              🚀 Generate Business App
            </>
          )}
        </button>
      </div>

      {/* User Profile */}
      <div style={{ 
        marginTop: 'auto', 
        paddingTop: '1.5rem', 
        borderTop: '1px solid #e5e7eb' 
      }}>
        <h4 style={{ fontWeight: '500', color: '#1f2937', margin: '0 0 1rem 0' }}>👤 Profile</h4>
        
        {/* Profile Details */}
        <div style={{
          backgroundColor: '#f8fafc',
          borderRadius: '0.5rem',
          padding: '0.75rem',
          marginBottom: '1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              backgroundColor: '#667eea',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ 
                fontSize: '0.875rem', 
                fontWeight: '600', 
                color: '#1f2937', 
                margin: 0,
                lineHeight: 1.2
              }}>
                {user?.name || 'User'}
              </p>
              <p style={{ 
                fontSize: '0.75rem', 
                color: '#6b7280', 
                margin: 0,
                lineHeight: 1.2
              }}>
                {user?.email || 'user@example.com'}
              </p>
            </div>
            <button
              onClick={onSignOut}
              style={{
                padding: '0.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626',
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              title="Sign Out"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16,17 21,12 16,7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PanelContent;