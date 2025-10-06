// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import NewChat from "./pages/NewChat";
import ChatPreview from "./pages/ChatPreview";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route redirect */}
        <Route path="/" element={<Navigate to="/new-chat" replace />} />
        
        {/* Routes */}
        <Route path="/new-chat" element={<NewChat />} />
        <Route path="/chat/:id" element={<ChatPreview />} />

        {/* Optional 404 fallback */}
        <Route path="*" element={<div className="p-8 text-center">404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
