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
        if (token) {
          // Verify token is still valid by getting current user
          const response = await apiService.getCurrentUser();
          if (response.status === 'success' && response.data.user) {
            setUser(response.data.user);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        // Clear invalid token
        localStorage.removeItem('runcraft_token');
        apiService.setToken(null);
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
      setUser(null);
      setCurrentView('signIn');
    }
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