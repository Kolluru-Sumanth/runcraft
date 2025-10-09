import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

function WorkflowManager({ onClose }) {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      const response = await api.get('/workflows');
      setWorkflows(response.data.data.workflows);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      setError('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (uploadData) => {
    setShowUpload(false);
    fetchWorkflows(); // Refresh the list
    if (uploadData.needsCredentials) {
      setSelectedWorkflow(uploadData.workflow);
      setShowCredentials(true);
    }
  };

  const handleDeploy = async (workflowId) => {
    try {
      const response = await api.post(`/workflows/${workflowId}/deploy`);
      if (response.data.status === 'success') {
        fetchWorkflows(); // Refresh the list
        alert('Workflow deployed successfully!');
      }
    } catch (error) {
      console.error('Deploy error:', error);
      alert(error.response?.data?.message || 'Failed to deploy workflow');
    }
  };

  const handleActivate = async (workflowId) => {
    try {
      const response = await api.post(`/workflows/${workflowId}/activate`);
      if (response.data.status === 'success') {
        fetchWorkflows(); // Refresh the list
        alert('Workflow activated successfully!');
      }
    } catch (error) {
      console.error('Activate error:', error);
      alert(error.response?.data?.message || 'Failed to activate workflow');
    }
  };

  const handleDeactivate = async (workflowId) => {
    try {
      const response = await api.post(`/workflows/${workflowId}/deactivate`);
      if (response.data.status === 'success') {
        fetchWorkflows(); // Refresh the list
        alert('Workflow deactivated successfully!');
      }
    } catch (error) {
      console.error('Deactivate error:', error);
      alert(error.response?.data?.message || 'Failed to deactivate workflow');
    }
  };

  if (showUpload) {
    return <WorkflowUploadModal onUploadSuccess={handleUploadSuccess} onClose={() => setShowUpload(false)} />;
  }

  if (showCredentials && selectedWorkflow) {
    return (
      <CredentialManager 
        workflow={selectedWorkflow} 
        onClose={() => setShowCredentials(false)}
        onComplete={() => {
          setShowCredentials(false);
          fetchWorkflows();
        }}
      />
    );
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        maxWidth: '900px',
        width: '90%',
        maxHeight: '80vh',
        overflow: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '1.5rem',
          paddingBottom: '1rem',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '600', 
            color: '#1f2937', 
            margin: 0 
          }}>
            🔄 Workflow Manager
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => setShowUpload(true)}
              style={{
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
              + Upload Workflow
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '0.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                color: '#6b7280'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              border: '3px solid #f3f4f6',
              borderTop: '3px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem'
            }}></div>
            <p style={{ color: '#6b7280' }}>Loading workflows...</p>
          </div>
        ) : error ? (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '0.375rem',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <p style={{ color: '#dc2626', margin: 0 }}>{error}</p>
            <button
              onClick={fetchWorkflows}
              style={{
                marginTop: '0.5rem',
                padding: '0.25rem 0.5rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        ) : workflows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📁</div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}>
              No workflows yet
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
              Upload your first n8n workflow to get started
            </p>
            <button
              onClick={() => setShowUpload(true)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Upload Workflow
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {workflows.map((workflow) => (
              <WorkflowCard 
                key={workflow.id} 
                workflow={workflow} 
                onDeploy={handleDeploy}
                onActivate={handleActivate}
                onDeactivate={handleDeactivate}
                onViewDetails={setSelectedWorkflow}
              />
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function WorkflowCard({ workflow, onDeploy, onActivate, onDeactivate, onViewDetails }) {
  // Use isActive to show Active/Inactive consistently
  const isActive = !!workflow.isActive;
  const statusColors = isActive ? { bg: '#dcfce7', text: '#166534' } : { bg: '#f3f4f6', text: '#374151' };

  return (
    <div style={{
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '1rem',
      backgroundColor: '#f9fafb'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.75rem' }}>
        <div>
          <h3 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: '#1f2937', 
            margin: '0 0 0.25rem 0' 
          }}>
            {workflow.name}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.125rem 0.5rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '500',
              backgroundColor: statusColors.bg,
              color: statusColors.text
            }}>
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {(!workflow.credentialsConfigured || workflow.credentialsConfigured < workflow.credentialCount) ? null : (!isActive && (
            <button
              onClick={() => onDeploy(workflow.id)}
              style={{
                padding: '0.25rem 0.75rem',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Deploy
            </button>
          ))}
          
          {(!isActive && workflow.n8nWorkflowId && (workflow.credentialsConfigured >= workflow.credentialCount)) && (
            <button
              onClick={() => onActivate(workflow.id)}
              style={{
                padding: '0.25rem 0.75rem',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Activate
            </button>
          )}
          
          {workflow.isActive && (
            <button
              onClick={() => onDeactivate(workflow.id)}
              style={{
                padding: '0.25rem 0.75rem',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              Deactivate
            </button>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', fontSize: '0.75rem', color: '#6b7280' }}>
        <div>
          <span style={{ fontWeight: '500' }}>Triggers:</span> {workflow.triggerCount}
        </div>
        <div>
          <span style={{ fontWeight: '500' }}>Credentials:</span> {workflow.credentialsConfigured}/{workflow.credentialCount}
        </div>
        <div>
          <span style={{ fontWeight: '500' }}>Updated:</span> {new Date(workflow.lastUpdated).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}

// Simple upload modal component
function WorkflowUploadModal({ onUploadSuccess, onClose }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'application/json' || selectedFile.name.endsWith('.json'))) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid JSON file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('workflow', file);

      const response = await api.post('/workflows/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'success') {
        onUploadSuccess(response.data.data);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to upload workflow');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        maxWidth: '400px',
        width: '90%'
      }}>
        <h3 style={{ marginBottom: '1rem' }}>Upload n8n Workflow</h3>
        
        <input
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          style={{ marginBottom: '1rem', width: '100%' }}
        />
        
        {error && (
          <div style={{ color: '#dc2626', fontSize: '0.875rem', marginBottom: '1rem' }}>
            {error}
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '0.5rem 1rem' }}>
            Cancel
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem'
            }}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Placeholder for credential manager
function CredentialManager({ workflow, onClose, onComplete }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '0.5rem',
        padding: '1.5rem',
        maxWidth: '500px',
        width: '90%'
      }}>
        <h3 style={{ marginBottom: '1rem' }}>Configure Credentials</h3>
        <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
          This workflow requires credentials to be configured before deployment.
        </p>
        
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '0.5rem 1rem' }}>
            Later
          </button>
          <button
            onClick={onComplete}
            style={{
              padding: '0.5rem 1rem',
              backgroundColor: '#667eea',
              color: 'white',
              border: 'none',
              borderRadius: '0.25rem'
            }}
          >
            Configure
          </button>
        </div>
      </div>
    </div>
  );
}

export default WorkflowManager;