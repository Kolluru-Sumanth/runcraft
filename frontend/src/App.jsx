import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import WorkflowApp from './components/WorkflowApp';

function AppContent() {
  const { user, currentView, setCurrentView } = useAuth();

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0f172a' }}>
        {currentView === 'signUp' ? (
          <SignUp />
        ) : (
          <SignIn />
        )}
      </div>
    );
  }

  return <WorkflowApp />;
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
