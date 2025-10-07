import React, { useState, useEffect } from 'react';

function CredentialsPage({ user }) {
  const [credentials, setCredentials] = useState([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/workflows/credentials');
      if (response.ok) {
        const data = await response.json();
        setCredentials(data.credentials || []);
      }
    } catch (error) {
      console.error('Error fetching credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const mockCredentials = [
    {
      id: '1',
      name: 'Gmail SMTP',
      type: 'smtpAuth',
      description: 'Email sending credentials for Gmail',
      lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2),
      status: 'active',
      connectedWorkflows: 3
    },
    {
      id: '2',
      name: 'Slack Bot Token',
      type: 'slackApi',
      description: 'Bot token for Slack workspace integration',
      lastUsed: new Date(Date.now() - 1000 * 60 * 30),
      status: 'active',
      connectedWorkflows: 1
    },
    {
      id: '3',
      name: 'Database Connection',
      type: 'postgresDb',
      description: 'PostgreSQL database credentials',
      lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 24),
      status: 'inactive',
      connectedWorkflows: 0
    },
    {
      id: '4',
      name: 'AWS S3 Access',
      type: 'awsS3',
      description: 'Amazon S3 storage access credentials',
      lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 6),
      status: 'active',
      connectedWorkflows: 2
    }
  ];

  const displayCredentials = credentials.length > 0 ? credentials : mockCredentials;

  const filteredCredentials = displayCredentials.filter(cred =>
    cred.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cred.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCredentialIcon = (type) => {
    const iconMap = {
      smtpAuth: '📧',
      slackApi: '💬',
      postgresDb: '🗄️',
      awsS3: '☁️',
      googleDrive: '📁',
      dropbox: '📦',
      github: '🐙',
      twitter: '🐦',
      default: '🔑'
    };
    return iconMap[type] || iconMap.default;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return { bg: '#dcfce7', color: '#166534' };
      case 'inactive':
        return { bg: '#f3f4f6', color: '#6b7280' };
      case 'error':
        return { bg: '#fee2e2', color: '#dc2626' };
      default:
        return { bg: '#f3f4f6', color: '#6b7280' };
    }
  };

  const formatLastUsed = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  };

  const handleCreateCredential = () => {
    setIsCreateModalOpen(true);
  };

  const handleDeleteCredential = async (credentialId) => {
    if (window.confirm('Are you sure you want to delete this credential?')) {
      try {
        const response = await fetch(`/api/workflows/credentials/${credentialId}`, {
          method: 'DELETE'
        });
        if (response.ok) {
          setCredentials(prev => prev.filter(cred => cred.id !== credentialId));
        }
      } catch (error) {
        console.error('Error deleting credential:', error);
      }
    }
  };

  const CreateCredentialModal = () => {
    const [formData, setFormData] = useState({
      name: '',
      type: 'smtpAuth',
      description: '',
      config: {}
    });

    const credentialTypes = [
      { value: 'smtpAuth', label: 'SMTP Email', icon: '📧' },
      { value: 'slackApi', label: 'Slack API', icon: '💬' },
      { value: 'postgresDb', label: 'PostgreSQL', icon: '🗄️' },
      { value: 'awsS3', label: 'AWS S3', icon: '☁️' },
      { value: 'googleDrive', label: 'Google Drive', icon: '📁' },
      { value: 'github', label: 'GitHub', icon: '🐙' }
    ];

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await fetch('/api/workflows/credentials', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        });
        
        if (response.ok) {
          const newCredential = await response.json();
          setCredentials(prev => [...prev, newCredential]);
          setIsCreateModalOpen(false);
          setFormData({ name: '', type: 'smtpAuth', description: '', config: {} });
        }
      } catch (error) {
        console.error('Error creating credential:', error);
      }
    };

    if (!isCreateModalOpen) return null;

    return (
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
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          padding: '2rem',
          width: '90%',
          maxWidth: '500px',
          maxHeight: '80vh',
          overflowY: 'auto'
        }}>
          <h2 style={{ margin: '0 0 1.5rem 0', fontSize: '1.5rem', fontWeight: '600' }}>
            Create New Credential
          </h2>
          
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
                required
              />
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              >
                {credentialTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.icon} {type.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  minHeight: '80px',
                  resize: 'vertical'
                }}
                placeholder="Optional description for this credential"
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Create Credential
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            border: '3px solid #f3f4f6',
            borderTop: '3px solid #667eea',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }}></div>
          <p style={{ color: '#6b7280' }}>Loading credentials...</p>
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
        <div>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: '700', 
            color: '#111827', 
            margin: '0 0 0.5rem 0' 
          }}>
            Credentials
          </h1>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '1rem', 
            margin: 0 
          }}>
            Manage your API keys, tokens, and connection credentials
          </p>
        </div>
        
        <button 
          onClick={handleCreateCredential}
          style={{
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
          }}
        >
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Credential
        </button>
      </div>

      {/* Search and Filter */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <input
            type="text"
            placeholder="Search credentials..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.75rem 0.75rem 0.75rem 2.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          />
          <svg 
            style={{
              position: 'absolute',
              left: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#6b7280'
            }}
            width="16" 
            height="16" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Credentials Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {filteredCredentials.map((credential) => {
          const statusStyle = getStatusColor(credential.status);
          
          return (
            <div key={credential.id} style={{
              backgroundColor: '#ffffff',
              borderRadius: '0.75rem',
              border: '1px solid #e5e7eb',
              padding: '1.5rem'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'flex-start',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: '2.5rem',
                    height: '2.5rem',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.25rem'
                  }}>
                    {getCredentialIcon(credential.type)}
                  </div>
                  <div>
                    <h3 style={{ 
                      fontSize: '1rem', 
                      fontWeight: '600', 
                      color: '#111827',
                      margin: '0 0 0.25rem 0'
                    }}>
                      {credential.name}
                    </h3>
                    <span style={{
                      padding: '0.25rem 0.5rem',
                      backgroundColor: statusStyle.bg,
                      color: statusStyle.color,
                      borderRadius: '0.375rem',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      textTransform: 'capitalize'
                    }}>
                      {credential.status}
                    </span>
                  </div>
                </div>

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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button 
                    onClick={() => handleDeleteCredential(credential.id)}
                    style={{
                      padding: '0.375rem',
                      backgroundColor: '#fee2e2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '0.375rem',
                      cursor: 'pointer'
                    }}
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <p style={{ 
                color: '#6b7280', 
                fontSize: '0.875rem', 
                margin: '0 0 1rem 0',
                lineHeight: '1.5'
              }}>
                {credential.description || 'No description provided'}
              </p>

              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid #f3f4f6'
              }}>
                <div>
                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: '#6b7280', 
                    margin: '0 0 0.25rem 0' 
                  }}>
                    Last used
                  </p>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#111827', 
                    margin: 0 
                  }}>
                    {formatLastUsed(credential.lastUsed)}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ 
                    fontSize: '0.75rem', 
                    color: '#6b7280', 
                    margin: '0 0 0.25rem 0' 
                  }}>
                    Connected workflows
                  </p>
                  <p style={{ 
                    fontSize: '0.875rem', 
                    color: '#111827', 
                    margin: 0,
                    fontWeight: '600'
                  }}>
                    {credential.connectedWorkflows}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCredentials.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '3rem',
          backgroundColor: '#ffffff',
          borderRadius: '0.75rem',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔑</div>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#111827',
            margin: '0 0 0.5rem 0'
          }}>
            No credentials found
          </h3>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '0.875rem',
            margin: '0 0 1.5rem 0'
          }}>
            {searchTerm ? 'Try adjusting your search terms' : 'Create your first credential to get started'}
          </p>
          {!searchTerm && (
            <button 
              onClick={handleCreateCredential}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Create First Credential
            </button>
          )}
        </div>
      )}

      <CreateCredentialModal />
    </div>
  );
}

export default CredentialsPage;