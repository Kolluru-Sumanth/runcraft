import React from 'react';
import EmptyState from './EmptyState';
import GeneratingState from './GeneratingState';
import WorkflowPreview from './WorkflowPreview';
import UploadView from '../upload/UploadView';
import GenerateUI from '../GenerateUI';

// Import page components
import DashboardPage from '../../pages/DashboardPage';
import WorkflowsPage from '../../pages/WorkflowsPage';
import TemplatesPage from '../../pages/TemplatesPage';
import ExecutionsPage from '../../pages/ExecutionsPage';
import CredentialsPage from '../../pages/CredentialsPage';
import SettingsPage from '../../pages/SettingsPage';

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
      case 'generateui':
        return <GenerateUI onFileUpload={onFileUpload} user={user} isMobile={false} />;
      case 'workflows':
        return <WorkflowsPage workflow={workflow} user={user} />;
      case 'templates':
        return <TemplatesPage user={user} />;
      case 'executions':
        return <ExecutionsPage user={user} />;
      case 'credentials':
        return <CredentialsPage user={user} />;
      case 'settings':
        return <SettingsPage user={user} />;
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
          maxWidth: (activeMenu === 'upload' || activeMenu === 'generateui') ? 'none' : '64rem',
          margin: '0 auto',
          padding: (activeMenu === 'upload' || activeMenu === 'generateui') ? '1rem' : '2rem',
          height: (activeMenu === 'upload' || activeMenu === 'generateui') ? '100%' : 'auto'
        }} className="content-container">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

export default MainContent;