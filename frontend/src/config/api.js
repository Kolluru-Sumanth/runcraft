// API configuration for different environments
const API_CONFIG = {
  development: {
    baseURL: '/api', // Use proxy in development
    timeout: 30000
  },
  production: {
    baseURL: '/api',
    timeout: 30000
  }
};

const environment = process.env.NODE_ENV || 'development';
export const API_BASE_URL = API_CONFIG[environment].baseURL;
export const API_TIMEOUT = API_CONFIG[environment].timeout;

// Helper function for making API requests
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions = {
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  };

  // Add auth token if available
  const token = localStorage.getItem('runcraft_token');
  if (token) {
    defaultOptions.headers.Authorization = `Bearer ${token}`;
  }

  // Merge options
  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };

  try {
    const response = await fetch(url, finalOptions);
    return response;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

export default {
  API_BASE_URL,
  API_TIMEOUT,
  apiRequest
};