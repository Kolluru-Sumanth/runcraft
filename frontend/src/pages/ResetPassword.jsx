import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import apiService from '../services/api';

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token') || '';
    const e = searchParams.get('email') || '';
    setToken(t);
    setEmail(e);
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);
    if (!token || !email) return setStatus({ type: 'error', message: 'Missing token or email' });
    if (!password || password.length < 6) return setStatus({ type: 'error', message: 'Password must be at least 6 characters' });
    if (password !== confirm) return setStatus({ type: 'error', message: 'Passwords do not match' });

    setLoading(true);
    try {
      const res = await apiService.post('/auth/reset-password', { token, email, password }, { includeAuth: false });
      setStatus({ type: 'success', message: res.message || 'Password reset successful' });
      // Redirect to sign in after a short delay
      setTimeout(() => navigate('/signin'), 1200);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Error resetting password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a' }}>
      <div style={{ width: '420px', background: '#fff', padding: '28px', borderRadius: '12px', boxShadow: '0 6px 24px rgba(2,6,23,0.3)' }}>
        <h2 style={{ margin: '0 0 12px 0' }}>Reset password</h2>
        <p style={{ color: '#6b7280' }}>Set a new password for {email || 'your account'}.</p>

        <form onSubmit={handleSubmit} style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <input type="password" placeholder="New password" value={password} onChange={e=>setPassword(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
          <input type="password" placeholder="Confirm password" value={confirm} onChange={e=>setConfirm(e.target.value)} required style={{ padding: '10px', borderRadius: '8px', border: '1px solid #e5e7eb' }} />
          <button disabled={loading} style={{ padding: '10px', background: '#667eea', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600 }}>
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>
        {status && (
          <div style={{ marginTop: '14px', color: status.type === 'success' ? '#065f46' : '#b91c1c' }}>
            {status.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPassword;
