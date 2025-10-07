import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import WorkflowApp from './components/WorkflowApp';

function AppContent() {
  const { user, currentView, setCurrentView } = useAuth();

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
        <Routes>
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="*" element={
            currentView === 'signUp' ? <SignUp /> : <SignIn />
          } />
        </Routes>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/dashboard" element={<WorkflowApp activeMenu="dashboard" />} />
      <Route path="/upload-workflow" element={<WorkflowApp activeMenu="upload" />} />
      <Route path="/workflows" element={<WorkflowApp activeMenu="workflows" />} />
      <Route path="/templates" element={<WorkflowApp activeMenu="templates" />} />
      <Route path="/executions" element={<WorkflowApp activeMenu="executions" />} />
      <Route path="/credentials" element={<WorkflowApp activeMenu="credentials" />} />
      <Route path="/settings" element={<WorkflowApp activeMenu="settings" />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
