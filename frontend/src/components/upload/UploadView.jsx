import React from 'react';
import UploadPanel from './UploadPanel';
import PreviewPanel from './PreviewPanel';

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
      <PreviewPanel workflow={workflow} isGenerating={isGenerating} />
    </div>
  );
}

export default UploadView;