import PreviewPanel from './upload/PreviewPanel';
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

function GenerateUI({ onFileUpload, user, workflow, isGenerating }) {
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('runcraft_token');
        const response = await fetch(`${API_BASE_URL}/workflows`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch workflows');
        }
        const data = await response.json();
        let workflowsData = [];
        if (data.data?.workflows && Array.isArray(data.data.workflows)) {
          workflowsData = data.data.workflows;
        } else if (data.data && Array.isArray(data.data)) {
          workflowsData = data.data;
        } else if (Array.isArray(data)) {
          workflowsData = data;
        }
        setWorkflows(workflowsData);
        setSelectedWorkflow(workflowsData[0]?.id || '');
      } catch (err) {
        setError(err.message);
        setWorkflows([]);
      } finally {
        setLoading(false);
      }
    };
    fetchWorkflows();
  }, []);

  const handleWorkflowChange = (e) => {
    setSelectedWorkflow(e.target.value);
    // Optionally, trigger workflow change logic here
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  const handleSendPrompt = () => {
    if (!prompt.trim()) return;
    // Add user prompt to chat history
    setChatHistory(prev => [...prev, { role: 'user', content: prompt }]);
    // Simulate assistant response (replace with real API call)
    setTimeout(() => {
      setChatHistory(prev => [...prev, { role: 'assistant', content: `Assistant response to: ${prompt}` }]);
    }, 800);
    setPrompt('');
  };

  return (
    <div style={{ 
      display: 'flex', 
      height: 'calc(100vh - 4rem)', 
      gap: '1rem',
      padding: '0'
    }}>
      {/* Left Panel: Workflow dropdown, chat history, and prompt box */}
      <div style={{
        flex: 1,
        background: '#fff',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
        padding: '2rem 1.2rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        minWidth: '16rem',
        maxWidth: '20rem',
        justifyContent: 'flex-start'
      }}>
        <div>
          <label htmlFor="workflow-select" style={{ fontWeight: 500, color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
            Select Workflow
          </label>
          {loading ? (
            <div>Loading workflows...</div>
          ) : error ? (
            <div style={{ color: 'red' }}>Error: {error}</div>
          ) : (
            <div style={{ position: 'relative', width: '100%', marginBottom: '1.5rem' }}>
              <select
                id="workflow-select"
                value={selectedWorkflow}
                onChange={handleWorkflowChange}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  borderRadius: '0.5rem',
                  border: '1px solid #d1d5db',
                  fontSize: '1rem',
                  background: '#f9fafb',
                  color: '#374151',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  MozAppearance: 'none',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                {workflows.length === 0 ? (
                  <option value="" disabled>No workflows found</option>
                ) : (
                  workflows.map(wf => (
                    <option key={wf.id || wf._id} value={wf.id || wf._id}>{wf.name || wf.title || 'Untitled Workflow'}</option>
                  ))
                )}
              </select>
              {/* Custom arrow */}
              <span style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                pointerEvents: 'none',
                zIndex: 3
              }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 8L10 12L14 8" stroke="#667eea" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </span>
            </div>
          )}
        </div>
        {/* Chat history container */}
        <div style={{
          flex: '1 1 auto',
          background: '#f9fafb',
          borderRadius: '0.5rem',
          border: '1px solid #e5e7eb',
          padding: '1rem',
          marginBottom: '1rem',
          overflowY: 'auto',
          maxHeight: '16rem',
          minHeight: '8rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}>
          {chatHistory.length === 0 ? (
            <div style={{ color: '#9ca3af', textAlign: 'center', fontSize: '1rem' }}>
              No messages yet. Start the conversation!
            </div>
          ) : (
            chatHistory.map((msg, idx) => (
              <div key={idx} style={{
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                background: msg.role === 'user' ? '#e0e7ff' : '#fff',
                color: msg.role === 'user' ? '#3730a3' : '#374151',
                borderRadius: '0.5rem',
                padding: '0.75rem 1rem',
                maxWidth: '80%',
                boxShadow: '0 1px 4px rgba(102,126,234,0.06)',
                fontSize: '1rem'
              }}>
                <span style={{ fontWeight: 500 }}>{msg.role === 'user' ? 'You' : 'Assistant'}:</span> {msg.content}
              </div>
            ))
          )}
        </div>
        <div>
          <label htmlFor="prompt-box" style={{ fontWeight: 500, color: '#374151', marginBottom: '0.5rem', display: 'block' }}>
            Prompt
          </label>
          <textarea
            id="prompt-box"
            value={prompt}
            onChange={handlePromptChange}
            rows={4}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid #d1d5db',
              fontSize: '1rem',
              background: '#f9fafb',
              color: '#374151',
              resize: 'vertical',
              marginBottom: '1rem'
            }}
          />
          <button
            onClick={handleSendPrompt}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#667eea',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              fontWeight: 500,
              fontSize: '1rem',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(102,126,234,0.08)'
            }}
          >
            Send Prompt
          </button>
        </div>
      </div>
      {/* Right Preview Panel */}
      <PreviewPanel workflow={workflow} isGenerating={isGenerating} />
    </div>
  );
}

export default GenerateUI;
