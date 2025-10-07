const express = require('express');
const { protect, restrictTo } = require('../middleware/auth');
const { 
  validateProfileUpdate, 
  validatePasswordUpdate, 
  handleValidationErrors 
} = require('../middleware/validation');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Protect all routes after this middleware
router.use(protect);

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching profile'
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
router.put('/profile', validateProfileUpdate, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, preferences } = req.body;
    
    // Create update object with only provided fields
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (preferences) updateData.preferences = { ...req.user.preferences, ...preferences };

    // Check if email is being changed and if it already exists
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          status: 'fail',
          message: 'Email already in use'
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already exists'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error updating profile'
    });
  }
});

// @desc    Update user password
// @route   PUT /api/users/password
// @access  Private
router.put('/password', validatePasswordUpdate, handleValidationErrors, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user.id).select('+password');

    // Check current password
    const isCurrentPasswordCorrect = await user.correctPassword(currentPassword, user.password);
    
    if (!isCurrentPasswordCorrect) {
      return res.status(400).json({
        status: 'fail',
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating password'
    });
  }
});

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
router.delete('/account', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);

    res.status(200).json({
      status: 'success',
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error deleting account'
    });
  }
});

// @desc    Update n8n configuration
// @route   PUT /api/users/n8n-config
// @access  Private
router.put('/n8n-config', async (req, res) => {
  try {
    const { userId, apiKey } = req.body;

    if (!userId || !apiKey) {
      return res.status(400).json({
        status: 'fail',
        message: 'User ID and API key are required'
      });
    }

    // Use server URL from environment variables for security
    const serverUrl = process.env.N8N_SERVER_URL;
    
    if (!serverUrl) {
      return res.status(500).json({
        status: 'error',
        message: 'n8n server configuration not available'
      });
    }

    // Test n8n connection before saving
    const axios = require('axios');
    try {
      const testResponse = await axios.get(`${serverUrl}/api/v1/workflows`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'X-N8N-API-KEY': apiKey
        }
      });
      
      console.log('✅ n8n connection test successful for user:', userId);
    } catch (testError) {
      console.error('❌ n8n connection test failed:', testError.message);
      return res.status(400).json({
        status: 'fail',
        message: 'Failed to connect to n8n. Please check your credentials.',
        error: testError.response?.data?.message || testError.message
      });
    }

    // Update user with n8n configuration (serverUrl from env)
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        n8nConfig: {
          serverUrl, // From environment variable
          userId,
          apiKey,
          isConnected: true,
          lastConnected: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'n8n configuration updated successfully',
      data: {
        n8nConfig: {
          userId: user.n8nConfig.userId,
          isConnected: user.n8nConfig.isConnected,
          lastConnected: user.n8nConfig.lastConnected
          // Note: serverUrl and apiKey not exposed for security
        }
      }
    });
  } catch (error) {
    console.error('Update n8n config error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error updating n8n configuration'
    });
  }
});

// @desc    Get n8n configuration
// @route   GET /api/users/n8n-config
// @access  Private
router.get('/n8n-config', async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.n8nConfig) {
      return res.status(200).json({
        status: 'success',
        data: {
          n8nConfig: null
        }
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        n8nConfig: {
          userId: user.n8nConfig.userId,
          isConnected: user.n8nConfig.isConnected,
          lastConnected: user.n8nConfig.lastConnected
          // Note: serverUrl and apiKey not exposed for security
        }
      }
    });
  } catch (error) {
    console.error('Get n8n config error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching n8n configuration'
    });
  }
});

// @desc    Delete n8n configuration
// @route   DELETE /api/users/n8n-config
// @access  Private
router.delete('/n8n-config', async (req, res) => {
  try {
    await User.findByIdAndUpdate(
      req.user.id,
      { $unset: { n8nConfig: 1 } },
      { new: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'n8n configuration removed successfully'
    });
  } catch (error) {
    console.error('Delete n8n config error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error removing n8n configuration'
    });
  }
});

// Admin only routes
// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
router.get('/', restrictTo('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments();

    res.status(200).json({
      status: 'success',
      results: users.length,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: {
        users
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching users'
    });
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
router.get('/:id', restrictTo('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching user'
    });
  }
});

module.exports = router;