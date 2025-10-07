import React from 'react';

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

export default GeneratingState;