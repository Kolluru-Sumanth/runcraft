import React from 'react';
import PanelContent from './PanelContent';

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

export default LeftPanel;