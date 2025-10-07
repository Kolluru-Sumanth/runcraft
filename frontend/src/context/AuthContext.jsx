import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState('signIn');

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('runcraft_token');
        console.log('🔍 Checking authentication state...');
        console.log('🔑 Token found:', !!token);
        console.log('🔑 Token length:', token?.length || 0);
        
        if (token) {
          console.log('Found stored token, verifying...');
          // Verify token is still valid by getting current user
          const response = await apiService.getCurrentUser();
          if (response.status === 'success' && response.data.user) {
            console.log('✅ Token is valid, user authenticated');
            setUser(response.data.user);
          } else {
            console.log('❌ Invalid response from getCurrentUser');
            throw new Error('Invalid token response');
          }
        } else {
          console.log('📝 No stored token found');
        }
      } catch (error) {
        console.log('🚨 Authentication initialization failed:', error.message);
        // Clear invalid token and user state
        localStorage.removeItem('runcraft_token');
        apiService.setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (credentials) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(credentials);
      
      if (response.status === 'success' && response.data.user) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { 
        success: false, 
        error: error.message || 'Login failed. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (userData) => {
    try {
      setIsLoading(true);
      const response = await apiService.register(userData);
      
      if (response.status === 'success' && response.data.user) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        throw new Error(response.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Sign up error:', error);
      return { 
        success: false, 
        error: error.message || 'Registration failed. Please try again.' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      // Clear all auth data
      clearSession();
    }
  };

  const clearSession = () => {
    // Clear user state
    setUser(null);
    setCurrentView('signIn');
    
    // Clear all possible token storage keys
    localStorage.removeItem('runcraft_token');
    localStorage.removeItem('token'); // fallback key
    
    // Clear API service token
    apiService.setToken(null);
    
    console.log('Session cleared completely');
  };

  const updateUser = async (userData) => {
    try {
      const response = await apiService.updateUserProfile(userData);
      if (response.status === 'success' && response.data.user) {
        setUser(response.data.user);
        return { success: true, user: response.data.user };
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (error) {
      console.error('Update user error:', error);
      return { 
        success: false, 
        error: error.message || 'Update failed. Please try again.' 
      };
    }
  };

  const value = {
    user,
    isLoading,
    currentView,
    setCurrentView,
    signIn,
    signUp,
    signOut,
    clearSession,
    updateUser,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;