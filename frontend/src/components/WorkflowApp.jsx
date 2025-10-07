import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

function WorkflowApp({ activeMenu: propActiveMenu }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [workflow, setWorkflow] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  
  // Determine active menu from route or prop
  const getActiveMenuFromPath = () => {
    const path = location.pathname;
    if (path.includes('/upload-workflow')) return 'upload';
    if (path.includes('/workflows')) return 'workflows';
    if (path.includes('/templates')) return 'templates';
    if (path.includes('/executions')) return 'executions';
    if (path.includes('/credentials')) return 'credentials';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };
  
  const activeMenu = propActiveMenu || getActiveMenuFromPath();
  
  const setActiveMenu = (menu) => {
    const routeMap = {
      dashboard: '/dashboard',
      upload: '/upload-workflow',
      workflows: '/workflows',
      templates: '/templates',
      executions: '/executions',
      credentials: '/credentials',
      settings: '/settings'
    };
    navigate(routeMap[menu] || '/dashboard');
  };

  const handleFileUpload = (workflowData) => {
    setWorkflow(workflowData);
    setIsMobileSidebarOpen(false);
  };

  const handleGenerateUI = async () => {
    if (!workflow) return;
    
    setIsGenerating(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('UI Generated Successfully!');
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Failed to generate UI. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Test function to check backend connection
  const testBackendConnection = async () => {
    try {
      const backendURL = import.meta.env.DEV 
        ? 'http://localhost:5000/api'
        : '/api';
      
      console.log('🔧 Testing connection to:', `${backendURL}/health`);
      
      const response = await fetch(`${backendURL}/health`);
      console.log('🔧 Health check response:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('🔧 Health check data:', data);
        alert('✅ Backend connection successful!');
      } else {
        alert('❌ Backend connection failed!');
      }
    } catch (error) {
      console.error('🔧 Connection test failed:', error);
      alert(`❌ Connection error: ${error.message}`);
    }
  };

  const handleSignOut = () => {
    signOut();
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#f6f8fa' }}>
      {/* Mobile Header */}
      <MobileHeader 
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        workflow={workflow}
        user={user}
        onSignOut={handleSignOut}
      />

      {/* Enhanced Sidebar */}
      <EnhancedSidebar
        isCollapsed={isSidebarCollapsed}
        isMobileOpen={isMobileSidebarOpen}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        user={user}
        onSignOut={handleSignOut}
        workflow={workflow}
        onFileUpload={handleFileUpload}
        onGenerateUI={handleGenerateUI}
        isGenerating={isGenerating}
      />

      {/* Main Content */}
      <MainContent 
        workflow={workflow}
        isGenerating={isGenerating}
        user={user}
        isSidebarCollapsed={isSidebarCollapsed}
        activeMenu={activeMenu}
        onFileUpload={handleFileUpload}
        onGenerateUI={handleGenerateUI}
      />
    </div>
  );
}

function EnhancedSidebar({ 
  isCollapsed, 
  isMobileOpen, 
  onToggleCollapse, 
  onCloseMobile, 
  activeMenu, 
  setActiveMenu, 
  user, 
  onSignOut,
  workflow,
  onFileUpload,
  onGenerateUI,
  isGenerating
}) {
  const menuItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'workflows', icon: '🔄', label: 'Workflows' },
    { id: 'upload', icon: '📤', label: 'Upload' },
    { id: 'templates', icon: '📋', label: 'Templates' },
    { id: 'executions', icon: '⚡', label: 'Executions' },
    { id: 'credentials', icon: '🔐', label: 'Credentials' },
    { id: 'settings', icon: '⚙️', label: 'Settings' }
  ];

  const sidebarWidth = isCollapsed ? '4rem' : '16rem';

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 50,
          display: 'block'
        }} className="mobile-overlay" onClick={onCloseMobile} />
      )}

      {/* Sidebar Container */}
      <div style={{
        position: isMobileOpen ? 'fixed' : 'relative',
        left: isMobileOpen ? 0 : 'auto',
        top: isMobileOpen ? 0 : 'auto',
        width: isMobileOpen ? '16rem' : sidebarWidth,
        height: '100vh',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e1e5e9',
        transition: 'width 0.3s ease, transform 0.3s ease',
        transform: isMobileOpen ? 'translateX(0)' : 'translateX(0)',
        zIndex: isMobileOpen ? 60 : 10,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isMobileOpen ? '0 10px 25px rgba(0, 0, 0, 0.15)' : 'none'
      }} className={isMobileOpen ? 'mobile-sidebar' : 'desktop-sidebar'}>
        
        {/* Header */}
        <div style={{
          padding: isCollapsed ? '1rem 0.75rem' : '1rem 1.5rem',
          borderBottom: '1px solid #e1e5e9',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          minHeight: '4rem',
          position: 'relative'
        }}>
          {/* Expanded Logo */}
          {!isCollapsed && !isMobileOpen && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem',
              transition: 'all 0.3s ease'
            }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                backgroundColor: '#667eea',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '700',
                fontSize: '1.25rem',
                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
                transition: 'all 0.3s ease'
              }}>
                R
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#1a1a1a', 
                  margin: 0,
                  transition: 'all 0.3s ease'
                }}>
                  Runcraft
                </h1>
              </div>
            </div>
          )}
          
          {/* Collapsed Logo */}
          {isCollapsed && !isMobileOpen && (
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              backgroundColor: '#667eea',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: '700',
              fontSize: '1.25rem',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onClick={onToggleCollapse}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
              e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)';
            }}
            title="Click to expand sidebar"
            >
              R
            </div>
          )}

          {/* Mobile Close Button */}
          {isMobileOpen && (
            <button
              onClick={onCloseMobile}
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
          )}

          {/* Desktop Collapse Toggle - Only show when expanded */}
          {!isMobileOpen && !isCollapsed && (
            <button
              onClick={onToggleCollapse}
              style={{
                padding: '0.5rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                color: '#6b7280',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2rem',
                height: '2rem'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.color = '#374151';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#6b7280';
                e.target.style.transform = 'scale(1)';
              }}
              title="Collapse sidebar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <nav style={{
          flex: 1,
          padding: '1rem 0',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '0 0.75rem' }}>
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveMenu(item.id);
                  // Auto-collapse sidebar when upload is selected
                  if (item.id === 'upload' && !isCollapsed) {
                    onToggleCollapse();
                  }
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: isCollapsed ? 0 : '0.75rem',
                  padding: isCollapsed ? '0.75rem' : '0.75rem 1rem',
                  marginBottom: '0.25rem',
                  backgroundColor: activeMenu === item.id ? '#f0f4ff' : 'transparent',
                  border: activeMenu === item.id ? '1px solid #c7d2fe' : '1px solid transparent',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: activeMenu === item.id ? '500' : '400',
                  color: activeMenu === item.id ? '#4338ca' : '#4b5563',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (activeMenu !== item.id) {
                    e.target.style.backgroundColor = '#f9fafb';
                  }
                }}
                onMouseLeave={(e) => {
                  if (activeMenu !== item.id) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
                title={isCollapsed ? item.label : ''}
              >
                <span style={{ fontSize: '1.125rem' }}>{item.icon}</span>
                {!isCollapsed && <span>{item.label}</span>}
              </button>
            ))}
          </div>
        </nav>

        {/* Content Area based on active menu */}
        {activeMenu === 'dashboard' && !isCollapsed && workflow && (
          <div style={{ 
            padding: '1rem',
            borderTop: '1px solid #e1e5e9',
            backgroundColor: '#f8fafc'
          }}>
            <WorkflowInfo workflow={workflow} isMobile={isMobileOpen} />
            <div style={{ marginTop: '1rem' }}>
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
                  fontSize: '0.875rem'
                }}
              >
                {isGenerating ? '⏳ Generating...' : '🚀 Generate App'}
              </button>
            </div>
          </div>
        )}

        {/* User Profile Section */}
        <div style={{
          padding: isCollapsed ? '1rem 0.75rem' : '1rem 1.5rem',
          borderTop: '1px solid #e1e5e9',
          backgroundColor: '#fafbfc'
        }}>
          {isCollapsed ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                backgroundColor: '#667eea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
              }}
              title={`${user?.name || 'User'} - Click to expand sidebar`}
              onClick={onToggleCollapse}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#5a67d8';
                e.target.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#667eea';
                e.target.style.transform = 'scale(1)';
              }}
              >
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: '50%',
                backgroundColor: '#667eea',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ 
                  fontSize: '0.875rem', 
                  fontWeight: '500', 
                  color: '#1f2937', 
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                  {user?.name || 'User'}
                </p>
                <p style={{ 
                  fontSize: '0.75rem', 
                  color: '#6b7280', 
                  margin: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
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
                  color: '#dc2626',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                title="Sign Out"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16,17 21,12 16,7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Expand Button for Collapsed State */}
        {isCollapsed && !isMobileOpen && (
          <button
            onClick={onToggleCollapse}
            style={{
              position: 'absolute',
              top: '50%',
              right: '-0.875rem',
              transform: 'translateY(-50%)',
              width: '1.75rem',
              height: '1.75rem',
              backgroundColor: '#ffffff',
              border: '1px solid #e1e5e9',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6b7280',
              fontSize: '0.75rem',
              zIndex: 20,
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.transform = 'translateY(-50%) scale(1.1)';
              e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
              e.target.style.borderColor = '#d1d5db';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.transform = 'translateY(-50%) scale(1)';
              e.target.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
              e.target.style.borderColor = '#e1e5e9';
            }}
            title="Expand sidebar"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
        )}
      </div>
    </>
  );
}

function MobileHeader({ onToggleSidebar, workflow, user, onSignOut }) {
  return (
    <div style={{
      display: 'none',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 40,
      backgroundColor: 'white',
      borderBottom: '1px solid #e5e7eb',
      padding: '0.75rem 1rem'
    }} className="mobile-header">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={onToggleSidebar}
            style={{
              padding: '0.5rem',
              borderRadius: '0.375rem',
              color: '#4b5563',
              backgroundColor: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#1f2937', margin: 0 }}>
            Runcraft
          </h1>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {workflow && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.25rem 0.5rem',
              borderRadius: '9999px',
              fontSize: '0.75rem',
              fontWeight: '500',
              backgroundColor: '#dcfce7',
              color: '#166534'
            }}>
              ✓ Loaded
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function UserMenu({ user, onSignOut, isMobile = false }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem',
          borderRadius: '0.5rem',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          color: '#374151'
        }}
      >
        <div style={{
          width: '2rem',
          height: '2rem',
          borderRadius: '50%',
          backgroundColor: '#667eea',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '0.875rem',
          fontWeight: '600'
        }}>
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
        {!isMobile && (
          <span style={{ fontSize: '0.875rem', fontWeight: '500' }}>
            {user?.name || 'User'}
          </span>
        )}
        {!isMobile && (
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="6,9 12,15 18,9" />
          </svg>
        )}
      </button>

      {isOpen && (
        <>
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 10
            }}
            onClick={() => setIsOpen(false)}
          />
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.5rem',
            backgroundColor: 'white',
            borderRadius: '0.75rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #e5e7eb',
            minWidth: '16rem',
            zIndex: 20
          }}>
            {/* Profile Header */}
            <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{
                  width: '3rem',
                  height: '3rem',
                  borderRadius: '50%',
                  backgroundColor: '#667eea',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.25rem',
                  fontWeight: '600'
                }}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p style={{ fontSize: '1rem', fontWeight: '600', color: '#111827', margin: 0 }}>
                    {user?.name || 'User'}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: '#6b7280', margin: 0 }}>
                    {user?.email || 'user@example.com'}
                  </p>
                </div>
              </div>
              
              {/* User Role Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.25rem 0.5rem',
                backgroundColor: user?.role === 'admin' ? '#fef3c7' : '#e0f2fe',
                color: user?.role === 'admin' ? '#92400e' : '#0369a1',
                borderRadius: '0.375rem',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                {user?.role === 'admin' ? '👑 Admin' : '👤 User'}
              </div>
            </div>

            {/* Profile Stats */}
            <div style={{ padding: '0.75rem' }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.75rem',
                marginBottom: '0.75rem'
              }}>
                <div style={{ 
                  textAlign: 'center',
                  padding: '0.5rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.375rem'
                }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                  </p>
                  <p style={{ fontSize: '0.6875rem', color: '#6b7280', margin: 0 }}>Member Since</p>
                </div>
                <div style={{ 
                  textAlign: 'center',
                  padding: '0.5rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.375rem'
                }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937', margin: 0 }}>
                    {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Today'}
                  </p>
                  <p style={{ fontSize: '0.6875rem', color: '#6b7280', margin: 0 }}>Last Login</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ padding: '0.5rem', borderTop: '1px solid #e5e7eb' }}>
              <button
                onClick={onSignOut}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: '#dc2626',
                  fontWeight: '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#fef2f2'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16,17 21,12 16,7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function LeftPanel({ workflow, onFileUpload, onGenerateUI, isGenerating, isOpen, onClose, user, onSignOut }) {
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          display: 'block'
        }} className="mobile-overlay">
          <div 
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)'
            }}
            onClick={onClose}
          />
          <div style={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            width: '20rem',
            backgroundColor: 'white',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <PanelContent 
              workflow={workflow}
              onFileUpload={onFileUpload}
              onGenerateUI={onGenerateUI}
              isGenerating={isGenerating}
              onClose={onClose}
              isMobile={true}
              user={user}
              onSignOut={onSignOut}
            />
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div style={{
        display: 'flex',
        width: '25%',
        minWidth: '20rem',
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb',
        flexDirection: 'column'
      }} className="desktop-sidebar">
        <PanelContent 
          workflow={workflow}
          onFileUpload={onFileUpload}
          onGenerateUI={onGenerateUI}
          isGenerating={isGenerating}
          isMobile={false}
          user={user}
          onSignOut={onSignOut}
        />
      </div>
    </>
  );
}

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
        <h4 style={{ fontWeight: '500', color: '#1f2937', margin: '0 0 1rem 0' }}>� Profile</h4>
        
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

// Import the existing components from the original App.jsx
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

function MainContent({ workflow, isGenerating, user, isSidebarCollapsed, activeMenu, onFileUpload, onGenerateUI }) {
  const renderContent = () => {
    switch (activeMenu) {
      case 'dashboard':
        return !workflow ? (
          <EmptyState user={user} />
        ) : isGenerating ? (
          <GeneratingState />
        ) : (
          <WorkflowPreview workflow={workflow} />
        );
      
      case 'upload':
        return <UploadView onFileUpload={onFileUpload} user={user} workflow={workflow} isGenerating={isGenerating} onGenerateUI={onGenerateUI} />;
      
      case 'workflows':
        return <WorkflowsView workflow={workflow} user={user} />;
      
      case 'templates':
        return <TemplatesView user={user} />;
      
      case 'executions':
        return <ExecutionsView user={user} />;
      
      case 'credentials':
        return <CredentialsView user={user} />;
      
      case 'settings':
        return <SettingsView user={user} />;
      
      default:
        return <EmptyState user={user} />;
    }
  };

  return (
    <div style={{ 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column',
      paddingTop: '0',
      marginLeft: isSidebarCollapsed ? '0' : '0',
      transition: 'margin-left 0.3s ease'
    }} className="main-content">
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ 
          maxWidth: activeMenu === 'upload' ? 'none' : '64rem', 
          margin: '0 auto', 
          padding: activeMenu === 'upload' ? '1rem' : '2rem',
          height: activeMenu === 'upload' ? '100%' : 'auto'
        }} className="content-container">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ user }) {
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

function GeneratingState() {
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

// Upload View Component
// Upload View Component with Two-Panel Layout
function UploadView({ onFileUpload, user, workflow, isGenerating, onGenerateUI }) {
  return (
    <div style={{ 
      display: 'flex', 
      height: 'calc(100vh - 4rem)', 
      gap: '1rem',
      padding: '0'
    }}>
      {/* Left Upload Panel */}
      <UploadPanel onFileUpload={onFileUpload} user={user} workflow={workflow} />
      
      {/* Right Preview Panel */}
      <PreviewPanel workflow={workflow} isGenerating={isGenerating} onGenerateUI={onGenerateUI} user={user} />
    </div>
  );
}

// Left Upload Panel Component
function UploadPanel({ onFileUpload, user, workflow }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

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
      
      // Extract workflow data and LLM analysis
      const workflowWithAnalysis = {
        name: result.data.workflow.name,
        nodeCount: result.data.workflow.nodeCount,
        llmAnalysis: result.data.llmAnalysis,
        webhookUrls: result.data.webhookUrls,
        credentialRequirements: result.data.credentialRequirements,
        triggerInfo: result.data.triggerInfo,
        workflowId: result.data.workflow._id,
        status: result.data.workflow.status,
        uploadedAt: new Date().toISOString()
      };

      onFileUpload(workflowWithAnalysis);
      
      // Show success message
      if (result.data.llmAnalysis) {
        alert(`Workflow uploaded successfully! AI analysis completed with ${result.data.llmAnalysis.confidence} confidence.`);
      } else {
        alert('Workflow uploaded successfully! Basic analysis completed (AI analysis unavailable).');
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
    </div>
  );
}

// Right Preview Panel Component with LLM Analysis
function PreviewPanel({ workflow, isGenerating, onGenerateUI, user }) {
  const [activeTab, setActiveTab] = useState('analysis');
  
  if (!workflow) {
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

  if (isGenerating) {
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
        <div style={{
          width: '4rem',
          height: '4rem',
          border: '3px solid #e5e7eb',
          borderTopColor: '#667eea',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          marginBottom: '2rem'
        }} />
        <h3 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '600', 
          color: '#111827', 
          margin: '0 0 1rem 0' 
        }}>
          Analyzing Workflow...
        </h3>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '1rem' 
        }}>
          AI is analyzing your workflow and generating webhook URLs
        </p>
      </div>
    );
  }

  const llmAnalysis = workflow.llmAnalysis;
  const webhookUrls = llmAnalysis?.webhookUrls || [];
  
  return (
    <div style={{ 
      flex: 1,
      backgroundColor: '#ffffff',
      borderRadius: '0.75rem',
      border: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{ 
        padding: '1.5rem',
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h3 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#111827', 
            margin: '0 0 0.25rem 0' 
          }}>
            {workflow.name}
          </h3>
          <p style={{ 
            color: '#6b7280', 
            fontSize: '0.875rem',
            margin: 0 
          }}>
            {workflow.nodeCount} nodes • {llmAnalysis ? `Analyzed with ${llmAnalysis.confidence} confidence` : 'Basic analysis'}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {llmAnalysis?.confidence && (
            <span style={{
              backgroundColor: llmAnalysis.confidence === 'high' ? '#10b981' : 
                             llmAnalysis.confidence === 'medium' ? '#f59e0b' : '#ef4444',
              color: 'white',
              fontSize: '0.75rem',
              fontWeight: '500',
              padding: '0.25rem 0.5rem',
              borderRadius: '0.375rem'
            }}>
              {llmAnalysis.confidence.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex',
        borderBottom: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb'
      }}>
        {['analysis', 'webhooks', 'insights'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: activeTab === tab ? '#ffffff' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab ? '2px solid #667eea' : '2px solid transparent',
              color: activeTab === tab ? '#667eea' : '#6b7280',
              fontWeight: activeTab === tab ? '600' : '500',
              fontSize: '0.875rem',
              cursor: 'pointer',
              textTransform: 'capitalize',
              transition: 'all 0.2s ease'
            }}
          >
            {tab === 'webhooks' ? 'Webhook URLs' : tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ 
        flex: 1,
        padding: '1.5rem',
        overflow: 'auto'
      }}>
        {activeTab === 'analysis' && (
          <AnalysisTab llmAnalysis={llmAnalysis} workflow={workflow} />
        )}
        {activeTab === 'webhooks' && (
          <WebhooksTab webhookUrls={webhookUrls} llmAnalysis={llmAnalysis} />
        )}
        {activeTab === 'insights' && (
          <InsightsTab llmAnalysis={llmAnalysis} workflow={workflow} />
        )}
      </div>
    </div>
  );
}

// Analysis Tab Component
function AnalysisTab({ llmAnalysis, workflow }) {
  if (!llmAnalysis) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
          LLM analysis not available. Upload the workflow again to get AI-powered insights.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Purpose */}
      <div>
        <h4 style={{ 
          fontSize: '1rem', 
          fontWeight: '600', 
          color: '#111827', 
          margin: '0 0 0.5rem 0' 
        }}>
          Workflow Purpose
        </h4>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '0.875rem', 
          lineHeight: '1.5',
          margin: 0,
          backgroundColor: '#f9fafb',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          {llmAnalysis.purpose}
        </p>
      </div>

      {/* Data Flow */}
      <div>
        <h4 style={{ 
          fontSize: '1rem', 
          fontWeight: '600', 
          color: '#111827', 
          margin: '0 0 0.5rem 0' 
        }}>
          Data Flow
        </h4>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '0.875rem', 
          lineHeight: '1.5',
          margin: 0,
          backgroundColor: '#f9fafb',
          padding: '0.75rem',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb'
        }}>
          {llmAnalysis.dataFlow}
        </p>
      </div>

      {/* Input Methods */}
      <div>
        <h4 style={{ 
          fontSize: '1rem', 
          fontWeight: '600', 
          color: '#111827', 
          margin: '0 0 0.5rem 0' 
        }}>
          Input Methods
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {llmAnalysis.inputMethods?.map((method, index) => (
            <span
              key={index}
              style={{
                backgroundColor: '#e0e7ff',
                color: '#3730a3',
                fontSize: '0.75rem',
                fontWeight: '500',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.375rem'
              }}
            >
              {method}
            </span>
          ))}
        </div>
      </div>

      {/* Integrations */}
      {llmAnalysis.integrations?.length > 0 && (
        <div>
          <h4 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: '#111827', 
            margin: '0 0 0.5rem 0' 
          }}>
            Integrations
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {llmAnalysis.integrations.map((integration, index) => (
              <span
                key={index}
                style={{
                  backgroundColor: '#f0fdf4',
                  color: '#166534',
                  fontSize: '0.75rem',
                  fontWeight: '500',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '0.375rem',
                  border: '1px solid #bbf7d0'
                }}
              >
                {integration}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Webhooks Tab Component
function WebhooksTab({ webhookUrls, llmAnalysis }) {
  const [copiedUrl, setCopiedUrl] = useState(null);

  const copyToClipboard = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(url);
      setTimeout(() => setCopiedUrl(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!webhookUrls || webhookUrls.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ color: '#d1d5db', marginBottom: '1rem' }}>
          <svg style={{ margin: '0 auto', height: '3rem', width: '3rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
          No webhook URLs generated. The workflow may not contain webhook triggers.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p style={{ 
        color: '#6b7280', 
        fontSize: '0.875rem',
        margin: '0 0 1rem 0',
        padding: '0.75rem',
        backgroundColor: '#eff6ff',
        borderRadius: '0.5rem',
        border: '1px solid #dbeafe'
      }}>
        💡 Use these webhook URLs to trigger your workflow from external services or applications.
      </p>

      {webhookUrls.map((webhook) => (
        <div
          key={webhook.id}
          style={{
            border: '1px solid #e5e7eb',
            borderRadius: '0.5rem',
            padding: '1rem',
            backgroundColor: '#ffffff'
          }}
        >
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{
                backgroundColor: webhook.method === 'POST' ? '#10b981' : '#f59e0b',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: '500',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.375rem'
              }}>
                {webhook.method || 'POST'}
              </span>
              <span style={{
                backgroundColor: webhook.source === 'llm' ? '#8b5cf6' : '#6b7280',
                color: 'white',
                fontSize: '0.75rem',
                fontWeight: '500',
                padding: '0.25rem 0.5rem',
                borderRadius: '0.375rem'
              }}>
                {webhook.source === 'llm' ? 'AI Generated' : 'System'}
              </span>
            </div>
            <button
              onClick={() => copyToClipboard(webhook.url)}
              style={{
                backgroundColor: copiedUrl === webhook.url ? '#10b981' : '#667eea',
                color: 'white',
                border: 'none',
                padding: '0.5rem',
                borderRadius: '0.375rem',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              {copiedUrl === webhook.url ? (
                <>
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  Copied!
                </>
              ) : (
                <>
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </>
              )}
            </button>
          </div>
          
          <div style={{
            backgroundColor: '#f8fafc',
            padding: '0.75rem',
            borderRadius: '0.375rem',
            border: '1px solid #e2e8f0',
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            color: '#374151',
            wordBreak: 'break-all',
            marginBottom: '0.5rem'
          }}>
            {webhook.url}
          </div>
          
          {webhook.description && (
            <p style={{ 
              color: '#6b7280', 
              fontSize: '0.875rem',
              margin: '0.5rem 0 0 0',
              lineHeight: '1.4'
            }}>
              {webhook.description}
            </p>
          )}
          
          {webhook.expectedPayload && (
            <div style={{ marginTop: '0.5rem' }}>
              <span style={{ 
                color: '#9ca3af', 
                fontSize: '0.75rem',
                fontWeight: '500'
              }}>
                Expected Payload: 
              </span>
              <span style={{ 
                color: '#6b7280', 
                fontSize: '0.75rem',
                marginLeft: '0.25rem'
              }}>
                {webhook.expectedPayload}
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Insights Tab Component
function InsightsTab({ llmAnalysis, workflow }) {
  if (!llmAnalysis) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p style={{ color: '#9ca3af', fontSize: '0.875rem' }}>
          AI insights not available. Upload the workflow again to get intelligent recommendations.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* AI Insights */}
      {llmAnalysis.insights?.length > 0 && (
        <div>
          <h4 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: '#111827', 
            margin: '0 0 1rem 0' 
          }}>
            AI Insights
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {llmAnalysis.insights.map((insight, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.5rem',
                  border: '1px solid #e2e8f0'
                }}
              >
                <div style={{
                  backgroundColor: '#667eea',
                  color: 'white',
                  borderRadius: '50%',
                  width: '1.5rem',
                  height: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  flexShrink: 0
                }}>
                  {index + 1}
                </div>
                <p style={{ 
                  color: '#374151', 
                  fontSize: '0.875rem',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  {insight}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* URL Patterns */}
      {llmAnalysis.urlPatterns?.length > 0 && (
        <div>
          <h4 style={{ 
            fontSize: '1rem', 
            fontWeight: '600', 
            color: '#111827', 
            margin: '0 0 1rem 0' 
          }}>
            Recommended URL Patterns
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {llmAnalysis.urlPatterns.map((pattern, index) => (
              <div
                key={index}
                style={{
                  padding: '0.75rem',
                  backgroundColor: '#ffffff',
                  borderRadius: '0.5rem',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{
                  fontFamily: 'monospace',
                  fontSize: '0.875rem',
                  color: '#667eea',
                  fontWeight: '600',
                  marginBottom: '0.25rem'
                }}>
                  {pattern.pattern}
                </div>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '0.75rem',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                  {pattern.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analysis Metadata */}
      <div style={{
        marginTop: '1rem',
        padding: '1rem',
        backgroundColor: '#f9fafb',
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb'
      }}>
        <h4 style={{ 
          fontSize: '0.875rem', 
          fontWeight: '600', 
          color: '#6b7280', 
          margin: '0 0 0.5rem 0' 
        }}>
          Analysis Details
        </h4>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            Model: {llmAnalysis.llmModel || 'Standard Analysis'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            Generated: {llmAnalysis.generatedAt ? new Date(llmAnalysis.generatedAt).toLocaleString() : 'Unknown'}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
            Confidence: {llmAnalysis.confidence || 'Unknown'}
          </div>
          {llmAnalysis.fallback && (
            <div style={{ fontSize: '0.75rem', color: '#f59e0b' }}>
              ⚠️ Fallback analysis used (LLM unavailable)
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Placeholder Views
function WorkflowsView({ workflow, user }) {
  return (
    <div style={{ padding: '2rem 0' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: '0 0 2rem 0' }}>
        My Workflows
      </h2>
      {workflow ? (
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '0.75rem', 
          padding: '1.5rem', 
          border: '1px solid #e5e7eb' 
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: '600', margin: '0 0 0.5rem 0' }}>
            {workflow.name}
          </h3>
          <p style={{ color: '#6b7280', margin: '0 0 1rem 0' }}>
            {workflow.nodeCount} nodes
          </p>
          <button style={{
            backgroundColor: '#667eea',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            border: 'none',
            cursor: 'pointer'
          }}>
            View Details
          </button>
        </div>
      ) : (
        <p style={{ color: '#6b7280' }}>No workflows uploaded yet.</p>
      )}
    </div>
  );
}

function TemplatesView({ user }) {
  return (
    <div style={{ padding: '2rem 0' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: '0 0 1rem 0' }}>
        Workflow Templates
      </h2>
      <p style={{ color: '#6b7280', margin: '0 0 2rem 0' }}>
        Browse pre-built workflow templates to get started quickly.
      </p>
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '0.75rem', 
        padding: '3rem', 
        border: '1px solid #e5e7eb',
        textAlign: 'center' 
      }}>
        <p style={{ color: '#9ca3af' }}>Templates coming soon...</p>
      </div>
    </div>
  );
}

function ExecutionsView({ user }) {
  return (
    <div style={{ padding: '2rem 0' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: '0 0 1rem 0' }}>
        Workflow Executions
      </h2>
      <p style={{ color: '#6b7280', margin: '0 0 2rem 0' }}>
        Monitor and review your workflow execution history.
      </p>
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '0.75rem', 
        padding: '3rem', 
        border: '1px solid #e5e7eb',
        textAlign: 'center' 
      }}>
        <p style={{ color: '#9ca3af' }}>No executions yet...</p>
      </div>
    </div>
  );
}

function CredentialsView({ user }) {
  return (
    <div style={{ padding: '2rem 0' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: '0 0 1rem 0' }}>
        Credentials
      </h2>
      <p style={{ color: '#6b7280', margin: '0 0 2rem 0' }}>
        Manage your API keys, tokens, and other credentials.
      </p>
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '0.75rem', 
        padding: '3rem', 
        border: '1px solid #e5e7eb',
        textAlign: 'center' 
      }}>
        <p style={{ color: '#9ca3af' }}>No credentials configured...</p>
      </div>
    </div>
  );
}

function SettingsView({ user }) {
  const [n8nConfig, setN8nConfig] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    userId: '',
    apiKey: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load n8n configuration
  useEffect(() => {
    loadN8nConfig();
  }, []);

  const loadN8nConfig = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/users/n8n-config`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setN8nConfig(data.data.n8nConfig);
        if (data.data.n8nConfig) {
          setFormData({
            userId: data.data.n8nConfig.userId || '',
            apiKey: '' // Don't show API key for security
          });
        }
      }
    } catch (error) {
      console.error('Error loading n8n config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveN8nConfig = async () => {
    if (!formData.userId || !formData.apiKey) {
      alert('Please fill in all fields');
      return;
    }

    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/users/n8n-config`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setN8nConfig(data.data.n8nConfig);
        setIsEditing(false);
        alert('n8n configuration saved successfully!');
      } else {
        alert(data.message || 'Failed to save n8n configuration');
      }
    } catch (error) {
      console.error('Error saving n8n config:', error);
      alert('Error saving n8n configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteN8nConfig = async () => {
    if (!confirm('Are you sure you want to remove n8n configuration?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/users/n8n-config`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setN8nConfig(null);
        setFormData({ userId: '', apiKey: '' });
        setIsEditing(false);
        alert('n8n configuration removed successfully!');
      }
    } catch (error) {
      console.error('Error deleting n8n config:', error);
      alert('Error removing n8n configuration');
    }
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <h2 style={{ fontSize: '2rem', fontWeight: '700', color: '#111827', margin: '0 0 1rem 0' }}>
        Settings
      </h2>
      <p style={{ color: '#6b7280', margin: '0 0 2rem 0' }}>
        Configure your account and application preferences.
      </p>

      {/* Account Information */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '0.75rem', 
        padding: '2rem', 
        border: '1px solid #e5e7eb',
        marginBottom: '2rem'
      }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: '0 0 1rem 0' }}>
          Account Information
        </h3>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
            Name
          </label>
          <p style={{ color: '#6b7280', margin: 0 }}>{user?.name || 'Not set'}</p>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
            Email
          </label>
          <p style={{ color: '#6b7280', margin: 0 }}>{user?.email || 'Not set'}</p>
        </div>
      </div>

      {/* n8n Configuration */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '0.75rem', 
        padding: '2rem', 
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: '600', margin: 0 }}>
            n8n Configuration
          </h3>
          {n8nConfig && !isEditing && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Edit
              </button>
              <button
                onClick={handleDeleteN8nConfig}
                style={{
                  padding: '0.5rem 1rem',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer'
                }}
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          Configure your n8n user credentials to enable automatic workflow deployment.
        </p>

        {isLoading ? (
          <p style={{ color: '#6b7280' }}>Loading n8n configuration...</p>
        ) : !n8nConfig && !isEditing ? (
          <div>
            <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
              No n8n configuration found. Add your n8n user credentials to enable automatic workflow deployment.
            </p>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Add n8n Configuration
            </button>
          </div>
        ) : isEditing ? (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                User ID
              </label>
              <input
                type="text"
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                placeholder="your-n8n-user-id"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                API Key
              </label>
              <input
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                placeholder="your-n8n-api-key"
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={handleSaveN8nConfig}
                disabled={isSaving}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: isSaving ? '#9ca3af' : '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
              >
                {isSaving ? 'Saving...' : 'Save Configuration'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem',
                  cursor: isSaving ? 'not-allowed' : 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                User ID
              </label>
              <p style={{ color: '#6b7280', margin: 0 }}>{n8nConfig.userId}</p>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                Status
              </label>
              <p style={{ 
                color: n8nConfig.isConnected ? '#10b981' : '#ef4444', 
                margin: 0, 
                fontWeight: '500' 
              }}>
                {n8nConfig.isConnected ? '✅ Connected' : '❌ Disconnected'}
              </p>
            </div>
            {n8nConfig.lastConnected && (
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                  Last Connected
                </label>
                <p style={{ color: '#6b7280', margin: 0 }}>
                  {new Date(n8nConfig.lastConnected).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Add responsive styles
const ResponsiveStyles = () => (
  <style jsx global>{`
    @media (max-width: 768px) {
      .desktop-sidebar {
        display: none !important;
      }
      
      .mobile-header {
        display: flex !important;
      }
      
      .main-content {
        padding-top: 4rem !important;
      }
      
      .mobile-sidebar {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 16rem !important;
        height: 100vh !important;
        z-index: 60 !important;
      }
    }
    
    @media (min-width: 769px) {
      .mobile-header {
        display: none !important;
      }
      
      .mobile-overlay {
        display: none !important;
      }
      
      .desktop-sidebar {
        display: flex !important;
      }
    }
    
    /* Smooth transitions */
    .desktop-sidebar {
      transition: width 0.3s ease !important;
    }
    
    /* Hover effects */
    .desktop-sidebar button:hover {
      transform: translateY(-1px);
    }
    
    /* Custom scrollbar */
    .desktop-sidebar nav::-webkit-scrollbar {
      width: 4px;
    }
    
    .desktop-sidebar nav::-webkit-scrollbar-track {
      background: transparent;
    }
    
    .desktop-sidebar nav::-webkit-scrollbar-thumb {
      background: #d1d5db;
      border-radius: 2px;
    }
    
    .desktop-sidebar nav::-webkit-scrollbar-thumb:hover {
      background: #9ca3af;
    }
    
    /* Spin animation for loading indicators */
    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }
  `}</style>
);

export default function WorkflowAppWithStyles() {
  return (
    <>
      <WorkflowApp />
      <ResponsiveStyles />
    </>
  );
}