import React from 'react';

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

export default MobileHeader;