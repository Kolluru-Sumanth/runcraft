import React, { useState } from 'react';

function UploadPanel({ onFileUpload, user, workflow }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [missingCredentials, setMissingCredentials] = useState([]);
  const [currentWorkflow, setCurrentWorkflow] = useState(null);
  const [credentialInputs, setCredentialInputs] = useState({});
  const [isSubmittingCredentials, setIsSubmittingCredentials] = useState(false);

  const showMissingCredentialsModal = (missing, workflowData) => {
    console.log('🔧 Debug: showMissingCredentialsModal called with:', { missing, workflowData });
    console.log('🔧 Debug: workflowData.workflowId:', workflowData?.workflowId);
    
    setMissingCredentials(missing);
    setCurrentWorkflow(workflowData);
    // Initialize credential inputs
    const inputs = {};
    missing.forEach((cred, index) => {
      inputs[index] = {
        name: cred.credentialName || `${cred.credentialType}_credential`,
        type: cred.credentialType,
        data: getDefaultCredentialFields(cred.credentialType)
      };
    });
    setCredentialInputs(inputs);
    setShowCredentialsModal(true);
  };

  const getDefaultCredentialFields = (credentialType) => {
    // Return default fields based on credential type
    const commonFields = {
      'googleSheetsOAuth2Api': {
        clientId: '',
        clientSecret: '',
        refreshToken: '',
        accessToken: ''
      },
      'slackOAuth2Api': {
        clientId: '',
        clientSecret: '',
        accessToken: ''
      },
      'gmailOAuth2': {
        clientId: '',
        clientSecret: '',
        refreshToken: '',
        accessToken: ''
      },
      'discordApi': {
        botToken: ''
      },
      'telegramApi': {
        accessToken: ''
      },
      'notionApi': {
        apiKey: ''
      },
      'airtableTokenApi': {
        apiKey: ''
      },
      'openAiApi': {
        apiKey: ''
      },
      'httpBasicAuth': {
        user: '',
        password: ''
      },
      'httpHeaderAuth': {
        name: '',
        value: ''
      }
    };

    return commonFields[credentialType] || {
      apiKey: ''
    };
  };

  const handleCredentialInputChange = (credIndex, field, value) => {
    setCredentialInputs(prev => ({
      ...prev,
      [credIndex]: {
        ...prev[credIndex],
        data: {
          ...prev[credIndex].data,
          [field]: value
        }
      }
    }));
  };

  const handleCredentialsModalClose = () => {
    setShowCredentialsModal(false);
    setMissingCredentials([]);
    setCurrentWorkflow(null);
    setCredentialInputs({});
  };

  const handleSubmitCredentials = async () => {
    setIsSubmittingCredentials(true);
    try {
      const token = localStorage.getItem('runcraft_token');
      const backendURL = import.meta.env.DEV ? 'http://localhost:5000/api' : '/api';
      
      // Debug: Check workflowId
      console.log('🔧 Debug: currentWorkflow:', currentWorkflow);
      console.log('🔧 Debug: workflowId:', currentWorkflow?.workflowId);
      
      if (!currentWorkflow?.workflowId) {
        // Fallback: try to use workflow prop if currentWorkflow is missing ID
        console.log('🔧 Debug: currentWorkflow missing ID, checking workflow prop:', workflow);
        const workflowId = currentWorkflow?.workflowId || workflow?.workflowId;
        if (!workflowId) {
          throw new Error('Workflow ID is missing. Please re-upload the workflow.');
        }
        // Update currentWorkflow with the ID
        const updatedWorkflow = { ...currentWorkflow, workflowId };
        setCurrentWorkflow(updatedWorkflow);
      }
      
      // Submit credentials to backend
      const credentialsToSubmit = Object.values(credentialInputs).map(input => ({
        name: input.name,
        type: input.type,
        data: input.data
      }));

      const response = await fetch(`${backendURL}/workflows/${currentWorkflow.workflowId}/credentials`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ credentials: credentialsToSubmit })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add credentials');
      }

      const result = await response.json();
      
      handleCredentialsModalClose();
      alert('✅ Credentials added successfully! The workflow will now be deployed automatically.');
      
      // Refresh the workflow data to show updated status
      if (result.data?.workflow) {
        onFileUpload({
          ...currentWorkflow,
          credentialRequirements: result.data.workflow.credentialRequirements,
          missingCredentials: result.data.workflow.missingCredentials || [],
          status: result.data.workflow.status
        });
      }

    } catch (error) {
      console.error('Error submitting credentials:', error);
      alert(`❌ Error adding credentials: ${error.message}`);
    } finally {
      setIsSubmittingCredentials(false);
    }
  };

  const handleProceedWithoutCredentials = () => {
    handleCredentialsModalClose();
    alert('ℹ️ Workflow uploaded successfully! You can configure the missing credentials in your n8n server and then deploy the workflow.');
  };

  const handleFileUpload = async (file) => {
    console.log('🔧 Debug: Starting file upload process...');
    
    if (!file || !file.name.endsWith('.json')) {
      alert('Please select a valid JSON file.');
      return;
    }

    setIsUploading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('workflow', file);

      // Get auth token (using correct key)
      const token = localStorage.getItem('runcraft_token');
      console.log('🔧 Debug: Token exists:', !!token);
      
      // Upload to backend with LLM analysis - explicit URL for debugging
      const backendURL = import.meta.env.DEV 
        ? 'http://localhost:5000/api'
        : '/api';
      
      console.log('🔧 Debug: Environment DEV:', import.meta.env.DEV);
      console.log('🔧 Debug: Backend URL:', backendURL);
      console.log('🔧 Debug: Full URL:', `${backendURL}/workflows/upload`);
      
      const response = await fetch(`${backendURL}/workflows/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      console.log('🔧 Debug: Response status:', response.status);
      console.log('🔧 Debug: Response headers:', response.headers);

      if (!response.ok) {
        console.log('🔧 Debug: Response not OK, attempting to read error...');
        const errorText = await response.text();
        console.log('🔧 Debug: Error response text:', errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          errorData = { message: errorText || `HTTP ${response.status}` };
        }
        throw new Error(errorData.message || 'Upload failed');
      }

      const result = await response.json();
      console.log('🔧 Debug: Upload response result:', result);
      console.log('🔧 Debug: result.data.workflow._id:', result.data?.workflow?._id);
      
      // Extract workflow data and LLM analysis
      const workflowWithAnalysis = {
        name: result.data.workflow.name,
        nodeCount: result.data.workflow.nodeCount,
        llmAnalysis: result.data.llmAnalysis,
        webhookUrls: result.data.webhookUrls,
        credentialRequirements: result.data.credentialRequirements,
        missingCredentials: result.data.missingCredentials,
        needsMissingCredentials: result.data.needsMissingCredentials,
        triggerInfo: result.data.triggerInfo,
        workflowId: result.data.workflow.id,  // This is the MongoDB ObjectId from summary
        status: result.data.workflow.status,
        uploadedAt: new Date().toISOString(),
        deployment: result.data.deployment
      };

      console.log('🔧 Debug: workflowWithAnalysis:', workflowWithAnalysis);
      console.log('🔧 Debug: workflowWithAnalysis.workflowId:', workflowWithAnalysis.workflowId);

      onFileUpload(workflowWithAnalysis);
      
      // Check for missing credentials and show modal if needed
      if (result.data.needsMissingCredentials && result.data.missingCredentials?.length > 0) {
        // Show missing credentials modal
        showMissingCredentialsModal(result.data.missingCredentials, workflowWithAnalysis);
      } else if (result.data.deployment?.deployed) {
        // Show success message for deployed workflow
        alert(`✅ Workflow uploaded and deployed successfully! ${result.data.llmAnalysis ? 'AI analysis completed.' : 'Basic analysis completed.'}`);
      } else {
        // Show success message for upload only
        alert(`✅ Workflow uploaded successfully! ${result.data.llmAnalysis ? 'AI analysis completed.' : 'Basic analysis completed.'} ${result.data.deployment?.reason === 'credentials_missing' ? 'Deployment skipped due to missing credentials.' : ''}`);
      }

    } catch (error) {
      console.error('Error uploading workflow:', error);
      alert(`Error uploading workflow: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
  };

  return (
    <div style={{ 
      flex: '0 0 400px',
      backgroundColor: '#ffffff',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      padding: '2rem',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '700', 
          color: '#111827', 
          margin: '0 0 0.5rem 0' 
        }}>
          Upload Workflow
        </h2>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '0.875rem', 
          margin: 0 
        }}>
          Upload your n8n workflow JSON file to generate a React frontend.
        </p>
      </div>

      {/* Upload Area */}
      <div
        style={{
          border: isDragOver ? '2px dashed #667eea' : '2px dashed #d1d5db',
          borderRadius: '0.75rem',
          padding: '3rem 2rem',
          backgroundColor: isDragOver ? '#f0f4ff' : '#f9fafb',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center'
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('workflow-upload-new').click()}
      >
        <div style={{ color: isDragOver ? '#667eea' : '#9ca3af', marginBottom: '1rem' }}>
          <svg style={{ margin: '0 auto', height: '4rem', width: '4rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        
        {isUploading ? (
          <div>
            <div style={{
              width: '2rem',
              height: '2rem',
              border: '2px solid #e5e7eb',
              borderTopColor: '#667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1rem auto'
            }} />
            <p style={{ fontSize: '1.125rem', fontWeight: '600', color: '#667eea', margin: '0 0 0.5rem 0' }}>
              Processing...
            </p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
              Analyzing your workflow
            </p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: '1.25rem', fontWeight: '600', color: '#111827', margin: '0 0 0.5rem 0' }}>
              Drop your workflow here
            </p>
            <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: '0 0 1rem 0' }}>
              or click to browse files
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#667eea',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Choose File
            </div>
          </div>
        )}

        <input
          id="workflow-upload-new"
          type="file"
          accept=".json"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={isUploading}
        />
      </div>

      <div style={{ marginTop: '1rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem' }}>
        <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '0 0 0.25rem 0', fontWeight: '500' }}>
          Supported formats:
        </p>
        <p style={{ fontSize: '0.75rem', color: '#9ca3af', margin: 0 }}>
          JSON files exported from n8n workflows
        </p>
      </div>

      {/* Workflow Status Section */}
      {workflow && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#ffffff', 
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            minWidth: 0
          }}>
            <h3 style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#111827', 
              margin: 0 
            }}>
              Workflow Status
            </h3>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}>
              <div style={{ 
                width: '0.5rem', 
                height: '0.5rem', 
                backgroundColor: '#10b981', 
                borderRadius: '50%' 
              }} />
              <span style={{ 
                fontSize: '0.75rem', 
                color: '#10b981', 
                fontWeight: '500' 
              }}>
                Ready
              </span>
            </div>
          </div>

          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '0.75rem',
            marginBottom: '0.75rem'
          }}>
            <div style={{ 
              padding: '0.75rem', 
              backgroundColor: '#f0f9ff', 
              borderRadius: '0.375rem',
              border: '1px solid #e0f2fe'
            }}>
              <p style={{ 
                fontSize: '0.65rem', 
                color: '#0369a1', 
                fontWeight: '600', 
                margin: '0 0 0.25rem 0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Workflow
              </p>
              <p style={{ 
                fontSize: '0.8rem', 
                fontWeight: '600', 
                color: '#0c4a6e', 
                margin: 0,
                wordBreak: 'break-word',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '100%'
              }}>
                {workflow.name}
              </p>
            </div>
            
            <div style={{ 
              padding: '0.75rem', 
              backgroundColor: '#f0f9ff', 
              borderRadius: '0.375rem',
              border: '1px solid #e0f2fe'
            }}>
              <p style={{ 
                fontSize: '0.65rem', 
                color: '#0369a1', 
                fontWeight: '600', 
                margin: '0 0 0.25rem 0',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Nodes
              </p>
              <p style={{ 
                fontSize: '1.25rem', 
                fontWeight: '700', 
                color: '#0c4a6e', 
                margin: 0 
              }}>
                {workflow.nodeCount}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* No Workflow Status */}
      {!workflow && (
        <div style={{ 
          marginTop: '1rem', 
          padding: '1rem', 
          backgroundColor: '#f9fafb', 
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            marginBottom: '0.5rem'
          }}>
            <span style={{ fontSize: '0.875rem' }}>⏳</span>
            <h3 style={{ 
              fontSize: '0.875rem', 
              fontWeight: '600', 
              color: '#6b7280', 
              margin: 0 
            }}>
              Waiting for Upload
            </h3>
          </div>
          <p style={{ 
            fontSize: '0.7rem', 
            color: '#9ca3af', 
            margin: 0,
            lineHeight: '1.3'
          }}>
            Upload a workflow file to see analysis results and generation options.
          </p>
        </div>
      )}

      {/* Missing Credentials Modal */}
      {showCredentialsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '24px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '20px',
                backgroundColor: '#fef3c7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '12px'
              }}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
              </div>
              <div>
                <h3 style={{
                  margin: 0,
                  fontSize: '18px',
                  fontWeight: '600',
                  color: '#111827'
                }}>
                  Missing Credentials Detected
                </h3>
                <p style={{
                  margin: '4px 0 0 0',
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  Your workflow requires credentials that aren't configured in the n8n server
                </p>
              </div>
            </div>

            <div style={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              padding: '16px',
              marginBottom: '20px'
            }}>
              <h4 style={{
                margin: '0 0 16px 0',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Configure Missing Credentials:
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {missingCredentials.map((cred, index) => (
                  <div key={index} style={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    padding: '16px'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '12px'
                    }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '4px',
                        backgroundColor: '#3b82f6',
                        marginRight: '8px'
                      }}></span>
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: '#111827',
                          marginBottom: '2px'
                        }}>
                          {cred.nodeName}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: '#6b7280'
                        }}>
                          Type: {cred.credentialType}
                        </div>
                      </div>
                    </div>

                    {/* Credential Name Input */}
                    <div style={{ marginBottom: '12px' }}>
                      <label style={{
                        display: 'block',
                        fontSize: '12px',
                        fontWeight: '500',
                        color: '#374151',
                        marginBottom: '4px'
                      }}>
                        Credential Name:
                      </label>
                      <input
                        type="text"
                        value={credentialInputs[index]?.name || ''}
                        onChange={(e) => setCredentialInputs(prev => ({
                          ...prev,
                          [index]: {
                            ...prev[index],
                            name: e.target.value
                          }
                        }))}
                        style={{
                          width: '100%',
                          padding: '6px 8px',
                          border: '1px solid #d1d5db',
                          borderRadius: '4px',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                        placeholder="Enter credential name"
                      />
                    </div>

                    {/* Dynamic Fields Based on Credential Type */}
                    {credentialInputs[index]?.data && Object.entries(credentialInputs[index].data).map(([field, value]) => (
                      <div key={field} style={{ marginBottom: '8px' }}>
                        <label style={{
                          display: 'block',
                          fontSize: '12px',
                          fontWeight: '500',
                          color: '#374151',
                          marginBottom: '4px'
                        }}>
                          {field.charAt(0).toUpperCase() + field.slice(1).replace(/([A-Z])/g, ' $1')}:
                        </label>
                        <input
                          type={field.toLowerCase().includes('password') || field.toLowerCase().includes('secret') || field.toLowerCase().includes('token') ? 'password' : 'text'}
                          value={value}
                          onChange={(e) => handleCredentialInputChange(index, field, e.target.value)}
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            border: '1px solid #d1d5db',
                            borderRadius: '4px',
                            fontSize: '13px',
                            boxSizing: 'border-box'
                          }}
                          placeholder={`Enter ${field.toLowerCase()}`}
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div style={{
              backgroundColor: '#eff6ff',
              border: '1px solid #dbeafe',
              borderRadius: '6px',
              padding: '12px',
              marginBottom: '20px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'flex-start'
              }}>
                <span style={{
                  fontSize: '16px',
                  marginRight: '8px'
                }}>💡</span>
                <div>
                  <p style={{
                    margin: '0 0 8px 0',
                    fontSize: '13px',
                    fontWeight: '500',
                    color: '#1e40af'
                  }}>
                    Configure credentials below:
                  </p>
                  <ul style={{
                    margin: 0,
                    padding: '0 0 0 16px',
                    fontSize: '12px',
                    color: '#1e40af'
                  }}>
                    <li>Enter the required credentials for each node</li>
                    <li>Credentials will be securely stored in your n8n server</li>
                    <li>Your workflow will deploy automatically once submitted</li>
                  </ul>
                </div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleProceedWithoutCredentials}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#6b7280',
                  backgroundColor: 'white',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Skip for Now
              </button>
              <button
                onClick={handleSubmitCredentials}
                disabled={isSubmittingCredentials}
                style={{
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: 'white',
                  backgroundColor: isSubmittingCredentials ? '#9ca3af' : '#10b981',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: isSubmittingCredentials ? 'not-allowed' : 'pointer'
                }}
              >
                {isSubmittingCredentials ? 'Adding Credentials...' : 'Add Credentials & Deploy'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadPanel;