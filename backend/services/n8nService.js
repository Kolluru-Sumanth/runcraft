const axios = require('axios');

class N8nService {
  constructor() {
    this.timeout = 10000; // 10 seconds timeout
  }

  /**
   * Create a new user on n8n server
   * @param {Object} params - User creation parameters
   * @param {string} params.serverUrl - n8n server URL
   * @param {string} params.email - User email
   * @param {string} params.password - User password
   * @param {string} params.firstName - User first name
   * @param {string} params.lastName - User last name (optional)
   * @param {string} params.adminApiKey - Admin API key for user creation
   * @returns {Promise<Object>} Created user data
   */
  async createUser({ serverUrl, email, password, firstName, lastName = '', adminApiKey }) {
    try {
      const response = await axios.post(
        `${serverUrl}/api/v1/users`,
        {
          email,
          password,
          firstName,
          lastName,
          role: 'member' // Default role for new users
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-N8N-API-KEY': adminApiKey
          },
          timeout: this.timeout
        }
      );

      return {
        success: true,
        data: response.data,
        userId: response.data.id
      };
    } catch (error) {
      console.error('N8n user creation error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status
      };
    }
  }

  /**
   * Get user information from n8n server
   * @param {Object} params - Parameters
   * @param {string} params.serverUrl - n8n server URL
   * @param {string} params.userId - n8n user ID
   * @param {string} params.apiKey - API key for authentication
   * @returns {Promise<Object>} User data
   */
  async getUser({ serverUrl, userId, apiKey }) {
    try {
      const response = await axios.get(
        `${serverUrl}/api/v1/users/${userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-N8N-API-KEY': apiKey
          },
          timeout: this.timeout
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('N8n get user error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status
      };
    }
  }

  /**
   * Update user information on n8n server
   * @param {Object} params - Parameters
   * @param {string} params.serverUrl - n8n server URL
   * @param {string} params.userId - n8n user ID
   * @param {Object} params.updateData - Data to update
   * @param {string} params.apiKey - API key for authentication
   * @returns {Promise<Object>} Updated user data
   */
  async updateUser({ serverUrl, userId, updateData, apiKey }) {
    try {
      const response = await axios.patch(
        `${serverUrl}/api/v1/users/${userId}`,
        updateData,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-N8N-API-KEY': apiKey
          },
          timeout: this.timeout
        }
      );

      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('N8n update user error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status
      };
    }
  }

  /**
   * Delete user from n8n server
   * @param {Object} params - Parameters
   * @param {string} params.serverUrl - n8n server URL
   * @param {string} params.userId - n8n user ID
   * @param {string} params.apiKey - API key for authentication
   * @returns {Promise<Object>} Deletion result
   */
  async deleteUser({ serverUrl, userId, apiKey }) {
    try {
      await axios.delete(
        `${serverUrl}/api/v1/users/${userId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-N8N-API-KEY': apiKey
          },
          timeout: this.timeout
        }
      );

      return {
        success: true,
        message: 'User deleted successfully'
      };
    } catch (error) {
      console.error('N8n delete user error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status
      };
    }
  }

  /**
   * Test connection to n8n server
   * @param {Object} params - Parameters
   * @param {string} params.serverUrl - n8n server URL
   * @param {string} params.apiKey - API key for authentication
   * @returns {Promise<Object>} Connection test result
   */
  async testConnection({ serverUrl, apiKey }) {
    try {
      const response = await axios.get(
        `${serverUrl}/api/v1/users`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-N8N-API-KEY': apiKey
          },
          timeout: this.timeout
        }
      );

      return {
        success: true,
        message: 'Connection successful',
        data: response.data
      };
    } catch (error) {
      console.error('N8n connection test error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status
      };
    }
  }

  /**
   * Generate API token for user (if supported by n8n version)
   * @param {Object} params - Parameters
   * @param {string} params.serverUrl - n8n server URL
   * @param {string} params.userId - n8n user ID
   * @param {string} params.adminApiKey - Admin API key
   * @returns {Promise<Object>} API token result
   */
  async generateUserApiToken({ serverUrl, userId, adminApiKey }) {
    try {
      const response = await axios.post(
        `${serverUrl}/api/v1/users/${userId}/api-keys`,
        {
          label: 'Runcraft Integration'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-N8N-API-KEY': adminApiKey
          },
          timeout: this.timeout
        }
      );

      return {
        success: true,
        data: response.data,
        apiKey: response.data.apiKey
      };
    } catch (error) {
      console.error('N8n API token generation error:', error.response?.data || error.message);
      
      return {
        success: false,
        error: error.response?.data?.message || error.message,
        statusCode: error.response?.status
      };
    }
  }
}

module.exports = new N8nService();