import React, { useState } from 'react';

function UserMenu({ user, onSignOut, isMobile = false }) {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Theme toggle button always visible above user chip */}
      <button
        onClick={handleThemeToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          backgroundColor: darkMode ? '#1f2937' : '#f3f4f6',
          border: 'none',
          cursor: 'pointer',
          color: darkMode ? '#f3f4f6' : '#1f2937',
          fontWeight: '500',
          marginBottom: '0.5rem',
          width: '90%'
        }}
        title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        )}
        {darkMode ? 'Dark Mode' : 'Light Mode'}
      </button>

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
            {/* User info section */}
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
              
              {/* Role badge */}
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

            {/* Stats section */}
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

            {/* Sign out section */}
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

export default UserMenu;