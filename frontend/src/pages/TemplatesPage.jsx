import React from 'react';

function TemplatesPage({ user }) {
  const templates = [
    {
      id: 1,
      name: 'Contact Form Handler',
      description: 'Process contact form submissions with email notifications',
      nodes: 5,
      category: 'Forms',
      preview: '📧'
    },
    {
      id: 2,
      name: 'Data Synchronizer',
      description: 'Sync data between multiple databases and services',
      nodes: 8,
      category: 'Data',
      preview: '🔄'
    },
    {
      id: 3,
      name: 'Social Media Monitor',
      description: 'Monitor mentions across social platforms',
      nodes: 12,
      category: 'Social',
      preview: '📱'
    },
    {
      id: 4,
      name: 'E-commerce Order Processor',
      description: 'Automated order processing and inventory management',
      nodes: 15,
      category: 'E-commerce',
      preview: '🛒'
    }
  ];

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontSize: '2rem', 
          fontWeight: '700', 
          color: '#111827', 
          margin: '0 0 0.5rem 0' 
        }}>
          Workflow Templates
        </h1>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '1rem', 
          margin: 0 
        }}>
          Pre-built workflow templates to get you started quickly
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
        gap: '1.5rem' 
      }}>
        {templates.map((template) => (
          <div 
            key={template.id}
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '0.75rem',
              border: '1px solid #e5e7eb',
              padding: '1.5rem',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = '#c7d2fe';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = '#e5e7eb';
            }}
          >
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{
                width: '3rem',
                height: '3rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem'
              }}>
                {template.preview}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  fontSize: '1.125rem', 
                  fontWeight: '600', 
                  color: '#111827', 
                  margin: '0 0 0.25rem 0'
                }}>
                  {template.name}
                </h3>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  backgroundColor: '#eff6ff',
                  color: '#2563eb',
                  borderRadius: '0.375rem',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}>
                  {template.category}
                </span>
              </div>
            </div>

            <p style={{ 
              color: '#6b7280', 
              fontSize: '0.875rem',
              margin: '0 0 1rem 0',
              lineHeight: '1.5'
            }}>
              {template.description}
            </p>

            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '1rem',
              borderTop: '1px solid #e5e7eb'
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#6b7280' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span style={{ 
                  fontSize: '0.875rem', 
                  color: '#6b7280' 
                }}>
                  {template.nodes} nodes
                </span>
              </div>
              <button style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#667eea',
                color: 'white',
                border: 'none',
                borderRadius: '0.375rem',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ 
        marginTop: '3rem',
        padding: '2rem',
        backgroundColor: '#f9fafb',
        borderRadius: '0.75rem',
        border: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <h3 style={{ 
          fontSize: '1.25rem', 
          fontWeight: '600', 
          color: '#111827', 
          margin: '0 0 0.5rem 0' 
        }}>
          Need a custom template?
        </h3>
        <p style={{ 
          color: '#6b7280', 
          margin: '0 0 1rem 0' 
        }}>
          Can't find what you're looking for? Create your own workflow template.
        </p>
        <button style={{
          padding: '0.75rem 1.5rem',
          backgroundColor: '#667eea',
          color: 'white',
          border: 'none',
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          fontWeight: '500',
          cursor: 'pointer'
        }}>
          Request Custom Template
        </button>
      </div>
    </div>
  );
}

export default TemplatesPage;