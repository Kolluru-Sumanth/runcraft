import React, { useState } from 'react';
import apiService from '../services/api';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      const res = await apiService.post('/auth/forgot-password', { email }, { includeAuth: false });
      setStatus({ type: 'success', message: res.message || 'If an account exists for that email, a reset link has been sent.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Error sending reset email' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <div style={{ width: '420px', background: 'rgba(255,255,255,0.98)', padding: '32px', borderRadius: '1rem', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
        <h2 style={{ margin: '0 0 12px 0', fontWeight: 700, color: '#111827', fontSize: '1.5rem' }}>Forgot password</h2>
        <p style={{ color: '#6b7280', fontSize: '1rem', marginBottom: '1.5rem' }}>Enter your account email and we'll send a link to reset your password.</p>
        <form onSubmit={handleSubmit} style={{ marginTop: '0', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', fontSize: '1rem', background: '#f9fafb', color: '#374151' }}
          />
          <div style={{ display: 'flex', gap: '10px', marginTop: '2px' }}>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.75rem', background: '#667eea', color: '#fff', border: 'none', borderRadius: '0.5rem', fontWeight: 600, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer' }}>
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
            <button type="button" onClick={() => window.location.href = '/signin'} style={{ flex: 1, padding: '0.75rem', background: '#f3f4f6', color: '#374151', border: 'none', borderRadius: '0.5rem', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }}>
              Cancel
            </button>
          </div>
        </form>
        {status && (
          <div style={{ marginTop: '18px', color: status.type === 'success' ? '#065f46' : '#b91c1c', fontWeight: 500, fontSize: '1rem' }}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default ForgotPassword;
