import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function SignIn() {
  const { signIn, setCurrentView } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const validateField = (name, value) => {
    switch (name) {
      case 'email':
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Email is invalid';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Real-time validation for touched fields
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    setTouched({
      email: true,
      password: true
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({}); // Clear previous errors
    
    try {
      const result = await signIn({
        email: formData.email,
        password: formData.password
      });

      if (!result.success) {
        setErrors({ submit: result.error });
      }
      // If successful, user will be redirected automatically by the auth context
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '1rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        padding: '2rem',
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            backgroundColor: '#667eea',
            borderRadius: '50%',
            width: '60px',
            height: '60px',
            margin: '0 auto 1rem auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>R</span>
          </div>
          <h1 style={{
            fontSize: '1.75rem',
            fontWeight: '700',
            color: '#111827',
            margin: '0 0 0.5rem 0'
          }}>
            Welcome to Runcraft
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '0.875rem',
            margin: 0
          }}>
            Sign in to your account to continue
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Email Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: errors.email ? '2px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: '#f9fafb'
              }}
              placeholder="Enter your email"
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => {
                handleBlur(e);
                e.target.style.borderColor = errors.email ? '#ef4444' : '#d1d5db';
              }}
            />
            {errors.email && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.75rem',
                margin: '0.25rem 0 0 0'
              }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.5rem'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: errors.password ? '2px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: '#f9fafb'
              }}
              placeholder="Enter your password"
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => {
                handleBlur(e);
                e.target.style.borderColor = errors.password ? '#ef4444' : '#d1d5db';
              }}
            />
            {errors.password && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.75rem',
                margin: '0.25rem 0 0 0'
              }}>
                {errors.password}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              padding: '0.75rem',
              textAlign: 'center'
            }}>
              <p style={{
                color: '#dc2626',
                fontSize: '0.875rem',
                margin: 0
              }}>
                {errors.submit}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: isLoading ? '#9ca3af' : '#667eea',
              color: 'white',
              fontWeight: '600',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem'
            }}
            onMouseEnter={(e) => {
              if (!isLoading) e.target.style.backgroundColor = '#5a67d8';
            }}
            onMouseLeave={(e) => {
              if (!isLoading) e.target.style.backgroundColor = '#667eea';
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          padding: '1rem 0',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{
            color: '#6b7280',
            fontSize: '0.875rem',
            margin: 0
          }}>
            Don't have an account?{' '}
            <button
              onClick={() => setCurrentView('signUp')}
              style={{
                color: '#667eea',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;