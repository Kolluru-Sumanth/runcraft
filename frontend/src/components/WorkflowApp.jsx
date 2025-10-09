import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';

// Import extracted components
import EnhancedSidebar from './sidebar/EnhancedSidebar';
import MobileHeader from './sidebar/MobileHeader';
import MainContent from './common/MainContent';

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
  if (path.includes('/generate-ui')) return 'generateui';
  if (path.includes('/templates')) return 'templates';
  if (path.includes('/executions')) return 'executions';
  if (path.includes('/credentials')) return 'credentials';
  if (path.includes('/settings')) return 'settings';
  return 'dashboard';
  };
  
  const activeMenu = propActiveMenu || getActiveMenuFromPath();
  
  // Auto-collapse sidebar when on upload page or UI generate page
  useEffect(() => {
    if (activeMenu === 'upload' || activeMenu === 'generateui') {
      setIsSidebarCollapsed(true);
    }
  }, [activeMenu]);

  // Expose the collapse callback globally
  useEffect(() => {
    window.collapseCallback = () => setIsSidebarCollapsed(true);
    return () => {
      window.collapseCallback = undefined;
    };
  }, []);
  
  const setActiveMenu = (menu) => {
    const routeMap = {
      dashboard: '/dashboard',
      upload: '/upload-workflow',
      workflows: '/workflows',
      generateui: '/generate-ui',
      templates: '/templates',
      executions: '/executions',
      credentials: '/credentials',
      settings: '/settings'
    };
    navigate(routeMap[menu] || '/dashboard');
  };

  const handleFileUpload = (workflowData) => {
    console.log('📝 Debug: File uploaded, setting workflow data:', workflowData);
    setWorkflow(workflowData);
  };

  const handleGenerateUI = async () => {
    if (!workflow) {
      console.log('❌ Debug: No workflow available for UI generation');
      return;
    }

    console.log('🚀 Debug: Generating UI for workflow:', workflow.name);
    setIsGenerating(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 3000));
      alert(`✅ React app generated for workflow: ${workflow.name}`);
    } catch (error) {
      console.error('Error generating UI:', error);
      alert('Error generating UI: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Test function to check backend connection
  const testBackendConnection = async () => {
    try {
      const token = localStorage.getItem('runcraft_token');
      const backendURL = import.meta.env.DEV ? 'http://localhost:5000/api' : '/api';
      
      const response = await fetch(`${backendURL}/test`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Backend connection successful:', data);
      } else {
        console.log('❌ Backend connection failed:', response.status);
      }
    } catch (error) {
      console.log('❌ Backend connection error:', error);
    }
  };

  // Test connection on component mount
  useEffect(() => {
    testBackendConnection();
  }, []);

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

// Responsive Styles Component
export default function WorkflowAppWithStyles() {
  return (
    <>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @media (max-width: 768px) {
            .desktop-sidebar {
              display: none !important;
            }
            .mobile-header {
              display: flex !important;
            }
            .mobile-overlay {
              display: block !important;
            }
          }
          
          @media (min-width: 769px) {
            .desktop-sidebar {
              display: flex !important;
            }
            .mobile-header {
              display: none !important;
            }
            .mobile-overlay {
              display: none !important;
            }
          }
        `}
      </style>
      <WorkflowApp />
    </>
  );
}