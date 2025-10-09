import PreviewPanel from './upload/PreviewPanel';
import React, { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';

function GenerateUI({ onFileUpload, user, workflow, isGenerating }) {
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState('');
  const [prompt, setPrompt] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [chatId, setChatId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isThinking, setIsThinking] = useState(false);

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

  const handleWorkflowChange = async (e) => {
    const workflowId = e.target.value;
    setSelectedWorkflow(workflowId);
    setChatId(null);
    setChatHistory([]);
    // clear preview while we fetch
    setPreviewUrl('');
    // Fetch previous chats for this workflow and user
    if (user?._id && workflowId) {
      try {
        const token = localStorage.getItem('runcraft_token');
        const response = await fetch(`${API_BASE_URL}/chat/user/${user._id}/workflow/${workflowId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          const chats = await response.json();
          console.log('Fetched chats for workflow', workflowId, chats);
          if (chats.length > 0) {
            // Use the most recent chat
            const latestChat = chats[0];
            setChatId(latestChat._id);
            // support both url and preview_url
            const possibleUrl = latestChat.url || latestChat.preview_url || latestChat.url_preview || '';
            console.log('Latest chat preview url candidate:', possibleUrl);
            if (possibleUrl) {
              setPreviewUrl(possibleUrl);
            } else {
              // fallback: try to extract URL from messages
              const urlRegex = /(https?:\/\/[^\s]+)/i;
              const found = latestChat.messages.map(m => m.content).join('\n').match(urlRegex);
              if (found && found[0]) setPreviewUrl(found[0]);
            }
            // Filter out code-like content from messages
            const codePatterns = [/^\s*<\/?\w+>/, /^\s*\w+\s*=\s*['"].*['"]/, /^\s*function\s+/, /^\s*\w+\s*\(/, /^\s*\d+\./, /^\s*\//, /^\s*\*/];
            const filteredMessages = latestChat.messages.filter(msg => {
              if (!msg.content) return false;
              if (msg.content.includes('```')) return false;
              return !codePatterns.some(pat => pat.test(msg.content));
            });
            setChatHistory(filteredMessages.map(msg => ({ role: msg.role, content: msg.content })));
          }
        }
      } catch (err) {
        console.warn('Failed to fetch previous chats:', err);
      }
    }
  };

  const handlePromptChange = (e) => {
    setPrompt(e.target.value);
  };

  // Removed duplicate handleSendPrompt, keeping the debug version below
    const handleSendPrompt = async () => {
      console.log('handleSendPrompt called', { prompt, selectedWorkflow, user, chatId });
      if (!prompt.trim() || !selectedWorkflow || !user?._id) {
        console.warn('Missing required values:', { prompt, selectedWorkflow, user });
        return;
      }
        setChatHistory(prev => [...prev, { role: 'user', content: prompt }]);
        setIsThinking(true);
      try {
        const token = localStorage.getItem('runcraft_token');
        let response, data;
        if (!chatId) {
          // First message, create chat
          response = await fetch(`${API_BASE_URL}/chat`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              userId: user._id,
              workflow: selectedWorkflow,
              message: prompt
            })
          });
        } else {
          // Subsequent messages, add to chat
          response = await fetch(`${API_BASE_URL}/chat/${chatId}/message`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              message: prompt
            })
          });
        }
        if (!response.ok) {
          throw new Error('Failed to send message');
        }
        data = await response.json();
        // Set chatId if new chat created
        if (data && data._id) {
          setChatId(data._id);
        }
        // Filter out code-like content from messages
  if (data && Array.isArray(data.messages)) {
          const codePatterns = [/^\s*<\/?\w+>/, /^\s*\w+\s*=\s*['"].*['"]/, /^\s*function\s+/, /^\s*\w+\s*\(/, /^\s*\d+\./, /^\s*\//, /^\s*\*/];
          const filteredMessages = data.messages.filter(msg => {
            if (!msg.content) return false;
            if (msg.content.includes('```')) return false;
            return !codePatterns.some(pat => pat.test(msg.content));
          });
          setChatHistory(filteredMessages.map(msg => ({ role: msg.role, content: msg.content })));
          // set preview url if backend returned one
          const possibleUrl = data.url || data.preview_url || data.url_preview || '';
          console.log('API response preview url candidate:', possibleUrl);
          if (possibleUrl) {
            setPreviewUrl(possibleUrl);
          } else {
            const urlRegex = /(https?:\/\/[^\s]+)/i;
            const found = data.messages.map(m => m.content).join('\n').match(urlRegex);
            if (found && found[0]) setPreviewUrl(found[0]);
          }
        } else if (data && data.message) {
          setChatHistory(prev => [...prev, { role: 'assistant', content: data.message }]);
        }
      } catch (err) {
        setChatHistory(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }]);
      }
      finally {
        setIsThinking(false);
      }
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
  minWidth: '20rem',
  maxWidth: '26rem',
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
          maxHeight: '24rem',
          minHeight: '12rem',
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
            rows={3}
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid #d1d5db',
              fontSize: '1rem',
              background: '#f9fafb',
              color: '#374151',
              resize: 'vertical',
              marginBottom: '1rem',
              minHeight: '2.5rem'
            }}
            disabled={isThinking}
          />
          <button
            onClick={handleSendPrompt}
            disabled={isThinking}
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
            {isThinking ? (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" strokeOpacity="0.4" />
                  <path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Thinking...
              </span>
            ) : (
              'Send Prompt'
            )}
          </button>
        </div>
      </div>
      {/* Right Preview Panel */}
  <PreviewPanel workflow={workflow} isGenerating={isGenerating} previewUrl={previewUrl} />
    </div>
  );
}

export default GenerateUI;
