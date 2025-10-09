import React, { useEffect, useState } from 'react';

function DashboardPage({ workflow, user, onFileUpload, onGenerateUI, isGenerating }) {
  const [userWorkflows, setUserWorkflows] = useState(null);
  const [loadingWorkflows, setLoadingWorkflows] = useState(false);

  useEffect(() => {
    // If no single workflow passed in, fetch user's workflows to decide what to render
    if (!workflow) {
      const fetchWorkflows = async () => {
        setLoadingWorkflows(true);
        try {
          const token = localStorage.getItem('runcraft_token');
          const resp = await fetch('/api/workflows', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          });
          if (!resp.ok) {
            setUserWorkflows([]);
            return;
          }
          const data = await resp.json();
          // Try several shapes
          let list = [];
          if (Array.isArray(data)) list = data;
          else if (Array.isArray(data.data)) list = data.data;
          else if (Array.isArray(data.data?.workflows)) list = data.data.workflows;
          setUserWorkflows(list);
        } catch (err) {
          console.warn('Failed fetching workflows for dashboard:', err);
          setUserWorkflows([]);
        } finally {
          setLoadingWorkflows(false);
        }
      };
      fetchWorkflows();
    }
  }, [workflow]);

  // If no workflow prop and userWorkflows hasn't loaded yet, show the original welcome while fetching
  if (!workflow && loadingWorkflows) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 0' }}>
        <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
          <div style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>
            <svg style={{ margin: '0 auto', height: '4rem', width: '4rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: '700', 
            color: '#111827', 
            margin: '0 0 1rem 0' 
          }}>
            Welcome to Astraflow, {user?.name || 'User'}!
          </h2>
          <p style={{ 
            color: '#4b5563', 
            fontSize: '1rem', 
            margin: '0 0 1.5rem 0' 
          }}>
            Transform your n8n workflows into beautiful, functional React applications. 
            Get started by uploading a workflow JSON file.
          </p>
        </div>
      </div>
    );
  }

    // If there's no workflow prop and we haven't started or completed loading user workflows,
    // show the default welcome state so the component doesn't fall through and attempt to
    // render `workflow` (which would be undefined and cause a runtime error).
    if (!workflow && !loadingWorkflows && (userWorkflows === null || (Array.isArray(userWorkflows) && userWorkflows.length === 0))) {
      return (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
            <div style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>
              <svg style={{ margin: '0 auto', height: '4rem', width: '4rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              color: '#111827', 
              margin: '0 0 1rem 0' 
            }}>
              Welcome to Astraflow, {user?.name || 'User'}!
            </h2>
            <p style={{ 
              color: '#4b5563', 
              fontSize: '1rem', 
              margin: '0 0 1.5rem 0' 
            }}>
              Transform your n8n workflows into beautiful, functional React applications. 
              Get started by uploading a workflow JSON file.
            </p>
          </div>
        </div>
      );
    }

  // If no workflow prop but user has workflows, render a small overview instead of the welcome message
  if (!workflow && Array.isArray(userWorkflows) && userWorkflows.length > 0) {
    return (
      <div style={{ padding: '2rem 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>Welcome back, {user?.name || 'User'}</h2>
            <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>{userWorkflows.length} workflows — jump back in</div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => window.location.href = '/workflows'} style={{ padding: '0.5rem 1rem', background: '#667eea', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Open Workflows</button>
            <button onClick={() => window.location.href = '/upload-workflow'} style={{ padding: '0.5rem 1rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Upload</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1rem' }}>
          {userWorkflows.slice(0,8).map((wf) => (
            <div key={wf.id || wf._id} style={{ background: '#fff', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#111827' }}>{wf.name || wf.title || 'Untitled'}</div>
                  <div style={{ color: '#6b7280', fontSize: '0.85rem' }}>{wf.triggerCount ?? wf.nodeCount ?? (wf.nodes?.length || 0)} items</div>
                </div>
                <div>
                  <span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.375rem', background: wf.isActive ? '#dcfce7' : '#f3f4f6', color: wf.isActive ? '#166534' : '#6b7280', fontWeight: 600 }}>{wf.isActive ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
              <div style={{ marginTop: '0.75rem', color: '#6b7280', fontSize: '0.85rem' }}>{wf.createdAt ? new Date(wf.createdAt).toLocaleDateString() : ''}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isGenerating) {
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

  const nodeCount = workflow.nodes?.length || 0;
  const name = workflow.name || "Untitled Workflow";
  // Build some derived stats
  const triggerCount = workflow.triggerCount ?? workflow.nodes?.filter(n => n.type && n.type.toLowerCase().includes('trigger')).length ?? 0;
  const deploymentCount = workflow.deploymentHistory?.length || 0;
  const credentialReqs = workflow.credentialRequirements?.length || 0;

  return (
    <div style={{ padding: '2rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', margin: 0 }}>{name}</h2>
          <div style={{ color: '#6b7280', marginTop: '0.5rem' }}>{nodeCount} nodes • {triggerCount} triggers • {credentialReqs} credentials required</div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => onGenerateUI && onGenerateUI()} style={{ padding: '0.5rem 1rem', background: '#667eea', color: '#fff', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>Generate App</button>
          <button onClick={() => window.location.href = '/workflows'} style={{ padding: '0.5rem 1rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>View Workflow</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>Nodes</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{nodeCount}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>Triggers</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{triggerCount}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>Deployments</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{deploymentCount}</div>
        </div>
        <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #e5e7eb' }}>
          <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '0.5rem' }}>Credentials</div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{credentialReqs}</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
        <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem' }}>Workflow Summary</h3>
          <p style={{ margin: 0, color: '#6b7280' }}><strong>ID:</strong> {workflow.id || workflow._id || 'N/A'}</p>
          <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280' }}><strong>Created:</strong> {workflow.createdAt ? new Date(workflow.createdAt).toLocaleString() : (workflow.created ? new Date(workflow.created).toLocaleString() : 'N/A')}</p>
          <div style={{ marginTop: '1rem' }}>
            <h4 style={{ margin: '0 0 0.5rem 0' }}>Nodes</h4>
            <ul style={{ margin: 0, paddingLeft: '1rem', color: '#374151' }}>
              {Array.isArray(workflow.nodes) && workflow.nodes.slice(0,8).map((n, i) => (
                <li key={i}>{n.name || n.type || `Node ${i+1}`}</li>
              ))}
              {Array.isArray(workflow.nodes) && workflow.nodes.length > 8 && (<li>+{workflow.nodes.length - 8} more</li>)}
            </ul>
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: '0.75rem', padding: '1rem', border: '1px solid #e5e7eb' }}>
          <h3 style={{ margin: '0 0 0.75rem 0', fontSize: '1rem' }}>Recent Deployments</h3>
          {Array.isArray(workflow.deploymentHistory) && workflow.deploymentHistory.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '1rem', color: '#374151' }}>
              {workflow.deploymentHistory.slice(-5).reverse().map((h, i) => (
                <li key={i}><strong>{h.action}</strong> — {h.details || ''} <div style={{ color: '#6b7280', fontSize: '0.75rem' }}>{new Date(h.timestamp).toLocaleString()}</div></li>
              ))}
            </ul>
          ) : (
            <p style={{ color: '#6b7280' }}>No deployments yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;