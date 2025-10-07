// API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// API service class for handling all backend communication
class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('runcraft_token');
  }

  // Set auth token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('runcraft_token', token);
    } else {
      localStorage.removeItem('runcraft_token');
    }
  }

  // Get auth token
  getToken() {
    return this.token || localStorage.getItem('runcraft_token');
  }

  // Create request headers
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth && this.getToken()) {
      headers.Authorization = `Bearer ${this.getToken()}`;
    }

    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(options.includeAuth !== false),
      ...options,
    };

    try {
      console.log(`API Request: ${config.method || 'GET'} ${url}`);
      
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          // Unauthorized - clear token but don't reload
          this.setToken(null);
          throw new Error('Session expired. Please log in again.');
        }
        
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      console.log('API Response:', data);
      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // GET request
  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      ...options,
    });
  }

  // POST request
  async post(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // PUT request
  async put(endpoint, data = {}, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  // DELETE request
  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options,
    });
  }

  // Health check
  async healthCheck() {
    return this.get('/health', { includeAuth: false });
  }

  // Authentication endpoints
  async register(userData) {
    const response = await this.post('/auth/register', userData, { includeAuth: false });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async login(credentials) {
    const response = await this.post('/auth/login', credentials, { includeAuth: false });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      console.warn('Logout request failed, but clearing local token anyway:', error);
    } finally {
      this.setToken(null);
    }
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  async refreshToken() {
    const response = await this.post('/auth/refresh');
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  // User profile endpoints
  async getUserProfile() {
    return this.get('/users/profile');
  }

  async updateUserProfile(profileData) {
    return this.put('/users/profile', profileData);
  }

  async updatePassword(passwordData) {
    return this.put('/users/password', passwordData);
  }

  async deleteAccount() {
    return this.delete('/users/account');
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;