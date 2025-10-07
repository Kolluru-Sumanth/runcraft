import React, { useState } from 'react';

function SettingsPage({ user }) {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    general: {
      siteName: 'RunCraft',
      defaultTimeout: 30,
      autoSave: true,
      notifications: true
    },
    n8n: {
      serverUrl: process.env.REACT_APP_N8N_SERVER_URL || 'http://localhost:5678',
      authMethod: 'basic',
      username: '',
      password: '',
      apiKey: '',
      testConnection: false
    },
    workflows: {
      defaultExecutionMode: 'main',
      logLevel: 'info',
      retryAttempts: 3,
      retryDelay: 1000,
      enableWebhooks: true,
      webhookUrl: ''
    },
    security: {
      enableEncryption: true,
      sessionTimeout: 480,
      requirePasswordChange: false,
      twoFactorAuth: false
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'n8n', label: 'n8n Connection', icon: '🔗' },
    { id: 'workflows', label: 'Workflows', icon: '⚡' },
    { id: 'security', label: 'Security', icon: '🔒' }
  ];

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        setSaveMessage('Settings saved successfully!');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveMessage('Error saving settings');
    } finally {
      setIsSaving(false);
    }
  };

  const testN8nConnection = async () => {
    setSettings(prev => ({
      ...prev,
      n8n: { ...prev.n8n, testConnection: true }
    }));

    try {
      const response = await fetch('/api/settings/test-n8n', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings.n8n)
      });
      
      const result = await response.json();
      alert(result.success ? 'Connection successful!' : `Connection failed: ${result.error}`);
    } catch (error) {
      alert('Connection test failed');
    } finally {
      setSettings(prev => ({
        ...prev,
        n8n: { ...prev.n8n, testConnection: false }
      }));
    }
  };

  const renderGeneralSettings = () => (
    <div>
      <h3 style={{ 
        fontSize: '1.125rem', 
        fontWeight: '600', 
        margin: '0 0 1.5rem 0' 
      }}>
        General Settings
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500',
            fontSize: '0.875rem'
          }}>
            Site Name
          </label>
          <input
            type="text"
            value={settings.general.siteName}
            onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500',
            fontSize: '0.875rem'
          }}>
            Default Timeout (seconds)
          </label>
          <input
            type="number"
            value={settings.general.defaultTimeout}
            onChange={(e) => handleSettingChange('general', 'defaultTimeout', parseInt(e.target.value))}
            style={{
              width: '100%',
              maxWidth: '150px',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={settings.general.autoSave}
              onChange={(e) => handleSettingChange('general', 'autoSave', e.target.checked)}
              style={{ transform: 'scale(1.1)' }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
              Auto-save workflows
            </span>
          </label>
        </div>

        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={settings.general.notifications}
              onChange={(e) => handleSettingChange('general', 'notifications', e.target.checked)}
              style={{ transform: 'scale(1.1)' }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
              Enable notifications
            </span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderN8nSettings = () => (
    <div>
      <h3 style={{ 
        fontSize: '1.125rem', 
        fontWeight: '600', 
        margin: '0 0 1.5rem 0' 
      }}>
        n8n Connection Settings
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500',
            fontSize: '0.875rem'
          }}>
            n8n Server URL
          </label>
          <input
            type="url"
            value={settings.n8n.serverUrl}
            onChange={(e) => handleSettingChange('n8n', 'serverUrl', e.target.value)}
            placeholder="http://localhost:5678"
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500',
            fontSize: '0.875rem'
          }}>
            Authentication Method
          </label>
          <select
            value={settings.n8n.authMethod}
            onChange={(e) => handleSettingChange('n8n', 'authMethod', e.target.value)}
            style={{
              width: '100%',
              maxWidth: '200px',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          >
            <option value="basic">Basic Auth</option>
            <option value="apiKey">API Key</option>
          </select>
        </div>

        {settings.n8n.authMethod === 'basic' ? (
          <>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                fontSize: '0.875rem'
              }}>
                Username
              </label>
              <input
                type="text"
                value={settings.n8n.username}
                onChange={(e) => handleSettingChange('n8n', 'username', e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: '500',
                fontSize: '0.875rem'
              }}>
                Password
              </label>
              <input
                type="password"
                value={settings.n8n.password}
                onChange={(e) => handleSettingChange('n8n', 'password', e.target.value)}
                style={{
                  width: '100%',
                  maxWidth: '300px',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </>
        ) : (
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              fontSize: '0.875rem'
            }}>
              API Key
            </label>
            <input
              type="password"
              value={settings.n8n.apiKey}
              onChange={(e) => handleSettingChange('n8n', 'apiKey', e.target.value)}
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem'
              }}
            />
          </div>
        )}

        <div>
          <button
            onClick={testN8nConnection}
            disabled={settings.n8n.testConnection}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: settings.n8n.testConnection ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '0.5rem',
              fontSize: '0.875rem',
              cursor: settings.n8n.testConnection ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            {settings.n8n.testConnection ? (
              <>
                <div style={{
                  width: '1rem',
                  height: '1rem',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                Testing...
              </>
            ) : (
              <>
                🔗 Test Connection
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderWorkflowSettings = () => (
    <div>
      <h3 style={{ 
        fontSize: '1.125rem', 
        fontWeight: '600', 
        margin: '0 0 1.5rem 0' 
      }}>
        Workflow Settings
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500',
            fontSize: '0.875rem'
          }}>
            Default Execution Mode
          </label>
          <select
            value={settings.workflows.defaultExecutionMode}
            onChange={(e) => handleSettingChange('workflows', 'defaultExecutionMode', e.target.value)}
            style={{
              width: '100%',
              maxWidth: '200px',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          >
            <option value="main">Main</option>
            <option value="manual">Manual</option>
            <option value="webhook">Webhook</option>
          </select>
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500',
            fontSize: '0.875rem'
          }}>
            Log Level
          </label>
          <select
            value={settings.workflows.logLevel}
            onChange={(e) => handleSettingChange('workflows', 'logLevel', e.target.value)}
            style={{
              width: '100%',
              maxWidth: '200px',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          >
            <option value="error">Error</option>
            <option value="warn">Warning</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
          </select>
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500',
            fontSize: '0.875rem'
          }}>
            Retry Attempts
          </label>
          <input
            type="number"
            min="0"
            max="10"
            value={settings.workflows.retryAttempts}
            onChange={(e) => handleSettingChange('workflows', 'retryAttempts', parseInt(e.target.value))}
            style={{
              width: '100%',
              maxWidth: '150px',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500',
            fontSize: '0.875rem'
          }}>
            Retry Delay (ms)
          </label>
          <input
            type="number"
            min="100"
            step="100"
            value={settings.workflows.retryDelay}
            onChange={(e) => handleSettingChange('workflows', 'retryDelay', parseInt(e.target.value))}
            style={{
              width: '100%',
              maxWidth: '150px',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={settings.workflows.enableWebhooks}
              onChange={(e) => handleSettingChange('workflows', 'enableWebhooks', e.target.checked)}
              style={{ transform: 'scale(1.1)' }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
              Enable webhooks
            </span>
          </label>
        </div>

        {settings.workflows.enableWebhooks && (
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: '500',
              fontSize: '0.875rem'
            }}>
              Webhook URL
            </label>
            <input
              type="url"
              value={settings.workflows.webhookUrl}
              onChange={(e) => handleSettingChange('workflows', 'webhookUrl', e.target.value)}
              placeholder="https://your-domain.com/webhook"
              style={{
                width: '100%',
                maxWidth: '400px',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div>
      <h3 style={{ 
        fontSize: '1.125rem', 
        fontWeight: '600', 
        margin: '0 0 1.5rem 0' 
      }}>
        Security Settings
      </h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={settings.security.enableEncryption}
              onChange={(e) => handleSettingChange('security', 'enableEncryption', e.target.checked)}
              style={{ transform: 'scale(1.1)' }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
              Enable credential encryption
            </span>
          </label>
          <p style={{ 
            fontSize: '0.75rem', 
            color: '#6b7280', 
            margin: '0.5rem 0 0 1.5rem' 
          }}>
            Encrypt stored credentials for additional security
          </p>
        </div>

        <div>
          <label style={{ 
            display: 'block', 
            marginBottom: '0.5rem', 
            fontWeight: '500',
            fontSize: '0.875rem'
          }}>
            Session Timeout (minutes)
          </label>
          <input
            type="number"
            min="60"
            max="1440"
            value={settings.security.sessionTimeout}
            onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
            style={{
              width: '100%',
              maxWidth: '150px',
              padding: '0.75rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              fontSize: '0.875rem'
            }}
          />
        </div>

        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={settings.security.requirePasswordChange}
              onChange={(e) => handleSettingChange('security', 'requirePasswordChange', e.target.checked)}
              style={{ transform: 'scale(1.1)' }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
              Require password change every 90 days
            </span>
          </label>
        </div>

        <div>
          <label style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={settings.security.twoFactorAuth}
              onChange={(e) => handleSettingChange('security', 'twoFactorAuth', e.target.checked)}
              style={{ transform: 'scale(1.1)' }}
            />
            <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
              Enable two-factor authentication
            </span>
          </label>
          <p style={{ 
            fontSize: '0.75rem', 
            color: '#6b7280', 
            margin: '0.5rem 0 0 1.5rem' 
          }}>
            Requires app restart to take effect
          </p>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'n8n':
        return renderN8nSettings();
      case 'workflows':
        return renderWorkflowSettings();
      case 'security':
        return renderSecuritySettings();
      default:
        return renderGeneralSettings();
    }
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
            Settings
          </h1>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '1rem', 
            margin: 0 
          }}>
            Configure your RunCraft installation and preferences
          </p>
        </div>
        
        <button 
          onClick={handleSave}
          disabled={isSaving}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: isSaving ? '#9ca3af' : '#667eea',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
            fontWeight: '500',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {isSaving ? (
            <>
              <div style={{
                width: '1rem',
                height: '1rem',
                border: '2px solid transparent',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
              Saving...
            </>
          ) : (
            <>
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save Settings
            </>
          )}
        </button>
      </div>

      {saveMessage && (
        <div style={{
          padding: '0.75rem 1rem',
          backgroundColor: saveMessage.includes('successfully') ? '#dcfce7' : '#fee2e2',
          color: saveMessage.includes('successfully') ? '#166534' : '#dc2626',
          borderRadius: '0.5rem',
          marginBottom: '2rem',
          fontSize: '0.875rem'
        }}>
          {saveMessage}
        </div>
      )}

      <div style={{ display: 'flex', gap: '2rem' }}>
        {/* Sidebar */}
        <div style={{ 
          width: '200px',
          flexShrink: 0
        }}>
          <nav style={{
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
            padding: '1rem'
          }}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  backgroundColor: activeTab === tab.id ? '#667eea' : 'transparent',
                  color: activeTab === tab.id ? 'white' : '#6b7280',
                  border: 'none',
                  borderRadius: '0.5rem',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  cursor: 'pointer',
                  marginBottom: '0.25rem',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '0.75rem',
            border: '1px solid #e5e7eb',
            padding: '2rem'
          }}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;