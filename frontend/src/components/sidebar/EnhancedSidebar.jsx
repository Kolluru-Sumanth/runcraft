import React, { useState } from 'react';

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
  const [darkMode, setDarkMode] = useState(() => document.body.classList.contains('dark-mode'));

  const handleThemeToggle = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.body.classList.add('dark-mode');
      } else {
        document.body.classList.remove('dark-mode');
      }
      return next;
    });
  };
  const menuItems = [
    { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
    { id: 'workflows', icon: '🔄', label: 'Workflows' },
    { id: 'upload', icon: '📤', label: 'Upload' },
    { id: 'generateui', icon: '🛠️', label: 'Generate UI' },
    { id: 'templates', icon: '📋', label: 'Templates' },
    { id: 'executions', icon: '⚡', label: 'Executions' },
    { id: 'credentials', icon: '🔐', label: 'Credentials' },
    { id: 'settings', icon: '⚙️', label: 'Settings' }
  ];

  const sidebarWidth = isCollapsed ? '4rem' : '16rem';

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 50,
          display: 'block'
        }} className="mobile-overlay" onClick={onCloseMobile} />
      )}

      {/* Sidebar */}
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
          {/* Expanded logo */}
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
                A
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#1a1a1a', 
                  margin: 0,
                  transition: 'all 0.3s ease'
                }}>
                  Astraflow
                </h1>
              </div>
            </div>
          )}
          
          {/* Collapsed logo */}
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
              e.target.style.backgroundColor = '#5a67d8';
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#667eea';
              e.target.style.transform = 'scale(1)';
            }}
            title="Click to expand sidebar"
            >
                A
            </div>
          )}

          {/* Mobile close button */}
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

          {/* Collapse button */}
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
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = '#6b7280';
              }}
              title="Collapse sidebar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
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
                  if (isMobileOpen) {
                    onCloseMobile();
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

        {/* Workflow info in sidebar for dashboard */}
        {activeMenu === 'dashboard' && !isCollapsed && workflow && (
          <div style={{ 
            padding: '1rem',
            borderTop: '1px solid #e1e5e9',
            backgroundColor: '#f8fafc'
          }}>
            <div style={{ marginBottom: '1rem' }}>
              <h4 style={{ 
                fontSize: '0.875rem', 
                fontWeight: '500', 
                color: '#374151', 
                margin: '0 0 0.5rem 0' 
              }}>
                Current Workflow
              </h4>
              <p style={{ 
                fontSize: '0.75rem', 
                color: '#6b7280', 
                margin: 0 
              }}>
                {workflow.name} • {workflow.nodeCount} nodes
              </p>
            </div>
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
        )}

        {/* User Profile Section with Theme Toggle */}
        <div style={{
          padding: isCollapsed ? '1rem 0.75rem' : '1rem 1.5rem',
          borderTop: '1px solid #e1e5e9',
          backgroundColor: '#fafbfc',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isCollapsed ? 'center' : 'flex-start'
        }}>
          {/* Animated theme toggle switch above user chip */}
          <div
            onClick={handleThemeToggle}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              marginBottom: isCollapsed ? '1.25rem' : '0.75rem',
              width: '100%',
              userSelect: 'none',
              minHeight: '48px',
              paddingLeft: 0,
              paddingRight: 0
            }}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <div style={{
              width: '100%',
              maxWidth: '220px',
              height: '40px',
              borderRadius: '20px',
              background: darkMode ? 'linear-gradient(90deg,#1f2937 60%,#374151 100%)' : 'linear-gradient(90deg,#f3f4f6 60%,#e5e7eb 100%)',
              position: 'relative',
              transition: 'background 0.3s',
              boxShadow: '0 2px 12px rgba(0,0,0,0.10)',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 500,
              fontSize: '1rem',
              color: darkMode ? '#fbbf24' : '#374151',
              letterSpacing: '0.02em',
              overflow: 'hidden'
            }}>
              <span style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                zIndex: 1,
                pointerEvents: 'none',
                transition: 'color 0.3s',
                color: darkMode ? '#fbbf24' : '#374151',
                fontWeight: 600,
                fontSize: '1rem',
                whiteSpace: 'nowrap'
              }}>
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </span>
              <div style={{
                position: 'absolute',
                top: '10px',
                left: darkMode ? 'calc(100% - 30px)' : '10px',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: darkMode ? '#374151' : '#fff',
                boxShadow: '0 1px 6px rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'left 0.3s, background 0.3s'
              }}>
                {darkMode ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fbbf24" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e42" strokeWidth="2"><circle cx="12" cy="12" r="7"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="5.22" y1="5.22" x2="7.64" y2="7.64"/><line x1="16.36" y1="16.36" x2="18.78" y2="18.78"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/><line x1="5.22" y1="18.78" x2="7.64" y2="16.36"/><line x1="16.36" y1="7.64" x2="18.78" y2="5.22"/></svg>
                )}
              </div>
            </div>
          </div>

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

        {/* Expand button for collapsed sidebar */}
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
              e.target.style.backgroundColor = '#f9fafb';
              e.target.style.borderColor = '#d1d5db';
              e.target.style.color = '#374151';
              e.target.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#ffffff';
              e.target.style.borderColor = '#e1e5e9';
              e.target.style.color = '#6b7280';
              e.target.style.transform = 'translateY(-50%) scale(1)';
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

export default EnhancedSidebar;