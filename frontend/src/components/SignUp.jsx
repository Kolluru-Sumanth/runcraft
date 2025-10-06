import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function SignUp() {
  const { signUp, setCurrentView } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});

  const validateField = (name, value, formData) => {
    switch (name) {
      case 'name':
        if (!value) return 'Name is required';
        if (value.length < 2) return 'Name must be at least 2 characters';
        return '';
      case 'email':
        if (!value) return 'Email is required';
        if (!/\S+@\S+\.\S+/.test(value)) return 'Email is invalid';
        return '';
      case 'password':
        if (!value) return 'Password is required';
        if (value.length < 6) return 'Password must be at least 6 characters';
        return '';
      case 'confirmPassword':
        if (!value) return 'Please confirm your password';
        if (value !== formData.password) return 'Passwords do not match';
        return '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = {
      ...formData,
      [name]: value
    };
    setFormData(newFormData);
    
    // Real-time validation for touched fields
    if (touched[name]) {
      const error = validateField(name, value, newFormData);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
    
    // Also validate confirmPassword if password changed
    if (name === 'password' && touched.confirmPassword) {
      const confirmError = validateField('confirmPassword', newFormData.confirmPassword, newFormData);
      setErrors(prev => ({
        ...prev,
        confirmPassword: confirmError
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({
      ...prev,
      [name]: true
    }));
    
    const error = validateField(name, value, formData);
    setErrors(prev => ({
      ...prev,
      [name]: error
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field], formData);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true
    });
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({}); // Clear previous errors
    
    try {
      const result = await signUp({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });

      if (!result.success) {
        setErrors({ submit: result.error });
      }
      // If successful, user will be redirected automatically by the auth context
    } catch (error) {
      console.error('Registration error:', error);
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
        padding: '1.5rem',
        width: '100%',
        maxWidth: '380px'
      }}>
        {/* Compact Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
          <div style={{
            backgroundColor: '#667eea',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            margin: '0 auto 0.75rem auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: 'white', fontSize: '1.25rem', fontWeight: 'bold' }}>R</span>
          </div>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#111827',
            margin: '0 0 0.25rem 0'
          }}>
            Join Runcraft
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '0.8rem',
            margin: 0
          }}>
            Create your account to get started
          </p>
        </div>

        {/* Compact Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          {/* Name Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.375rem'
            }}>
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.625rem',
                border: errors.name ? '2px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: '#f9fafb'
              }}
              placeholder="Enter your full name"
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => {
                handleBlur(e);
                e.target.style.borderColor = errors.name ? '#ef4444' : '#d1d5db';
              }}
            />
            {errors.name && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.7rem',
                margin: '0.2rem 0 0 0'
              }}>
                {errors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.375rem'
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
                padding: '0.625rem',
                border: errors.email ? '2px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
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
                fontSize: '0.7rem',
                margin: '0.2rem 0 0 0'
              }}>
                {errors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.375rem'
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
                padding: '0.625rem',
                border: errors.password ? '2px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: '#f9fafb'
              }}
              placeholder="Create a password"
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => {
                handleBlur(e);
                e.target.style.borderColor = errors.password ? '#ef4444' : '#d1d5db';
              }}
            />
            {errors.password && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.7rem',
                margin: '0.2rem 0 0 0'
              }}>
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password Field */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.8rem',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '0.375rem'
            }}>
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '0.625rem',
                border: errors.confirmPassword ? '2px solid #ef4444' : '1px solid #d1d5db',
                borderRadius: '0.5rem',
                fontSize: '0.8rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                backgroundColor: '#f9fafb'
              }}
              placeholder="Confirm your password"
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => {
                handleBlur(e);
                e.target.style.borderColor = errors.confirmPassword ? '#ef4444' : '#d1d5db';
              }}
            />
            {errors.confirmPassword && (
              <p style={{
                color: '#ef4444',
                fontSize: '0.7rem',
                margin: '0.2rem 0 0 0'
              }}>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '0.5rem',
              padding: '0.5rem',
              textAlign: 'center'
            }}>
              <p style={{
                color: '#dc2626',
                fontSize: '0.75rem',
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
              padding: '0.625rem',
              borderRadius: '0.5rem',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.8rem',
              transition: 'background-color 0.2s',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '0.25rem'
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
                  width: '14px',
                  height: '14px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Compact Footer */}
        <div style={{
          marginTop: '1rem',
          textAlign: 'center',
          padding: '0.75rem 0',
          borderTop: '1px solid #e5e7eb'
        }}>
          <p style={{
            color: '#6b7280',
            fontSize: '0.75rem',
            margin: 0
          }}>
            Already have an account?{' '}
            <button
              onClick={() => setCurrentView('signIn')}
              style={{
                color: '#667eea',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: '0.75rem',
                fontWeight: '500'
              }}
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignUp;