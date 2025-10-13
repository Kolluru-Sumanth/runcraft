const express = require('express');
const { protect, createSendToken } = require('../middleware/auth');
const { 
  validateRegister, 
  validateLogin, 
  handleValidationErrors 
} = require('../middleware/validation');
const User = require('../models/User');
const n8nService = require('../services/n8nService');

const router = express.Router();

const crypto = require('crypto');
const { sendPasswordResetEmail } = require('../utils/mailer');

// @desc    Test endpoint
// @route   GET /api/test
// @access  Private
router.get('/test', protect, async (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Backend connection successful',
    user: req.user ? req.user.name : 'Unknown',
    timestamp: new Date().toISOString()
  });
});

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', validateRegister, handleValidationErrors, async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'User with this email already exists'
      });
    }

    let n8nUserData = null;
    let n8nApiToken = null;

    // Try to create user on the centralized n8n server
    const n8nServerUrl = process.env.N8N_SERVER_URL;
    const n8nAdminApiKey = process.env.N8N_ADMIN_API_KEY;

    if (n8nServerUrl && n8nAdminApiKey) {
      try {
        console.log('Creating user on n8n server:', n8nServerUrl);

        // Test connection first
        const connectionTest = await n8nService.testConnection({
          serverUrl: n8nServerUrl,
          apiKey: n8nAdminApiKey
        });

        if (!connectionTest.success) {
          console.warn('n8n server connection failed:', connectionTest.error);
          // Continue with registration even if n8n fails
        } else {
          // Create user on n8n server
          const nameParts = name.split(' ');
          const firstName = nameParts[0] || name;
          const lastName = nameParts.slice(1).join(' ') || '';

          const n8nResult = await n8nService.createUser({
            serverUrl: n8nServerUrl,
            email,
            password,
            firstName,
            lastName,
            adminApiKey: n8nAdminApiKey
          });

          if (n8nResult.success) {
            n8nUserData = n8nResult.data;
            console.log('Successfully created n8n user:', n8nResult.userId);

            // Try to generate API token for the user
            const tokenResult = await n8nService.generateUserApiToken({
              serverUrl: n8nServerUrl,
              userId: n8nResult.userId,
              adminApiKey: n8nAdminApiKey
            });

            if (tokenResult.success) {
              n8nApiToken = tokenResult.apiKey;
              console.log('Generated n8n API token for user');
            } else {
              console.warn('Failed to generate n8n API token:', tokenResult.error);
            }
          } else {
            console.warn('Failed to create n8n user:', n8nResult.error);
            // Continue with registration even if n8n user creation fails
          }
        }
      } catch (n8nError) {
        console.error('n8n integration error:', n8nError);
        // Continue with registration even if n8n integration fails
      }
    } else {
      console.warn('n8n server configuration not found - skipping n8n user creation');
    }

    // Create new user in MongoDB
    const userData = {
      name,
      email,
      password
    };

    // Add n8n configuration if user was created on n8n server
    if (n8nUserData && n8nServerUrl) {
      userData.n8nConfig = {
        serverUrl: n8nServerUrl,
        userId: n8nUserData.id,
        apiToken: n8nApiToken,
        isConnected: true,
        lastSync: new Date()
      };
    }

    const user = await User.create(userData);

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Create and send token
    const responseData = {
      n8nIntegration: n8nUserData ? {
        connected: true,
        userId: n8nUserData.id,
        serverUrl: n8nServerUrl
      } : {
        connected: false,
        message: 'n8n integration skipped or failed'
      }
    };

    createSendToken(user, 201, res, 'User registered successfully', responseData);

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already exists'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Error creating user account'
    });
  }
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
router.post('/login', validateLogin, handleValidationErrors, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email and include password
    const user = await User.findByEmailWithPassword(email);

    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password'
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({
        status: 'fail',
        message: 'Account temporarily locked due to too many failed login attempts. Please try again later.'
      });
    }

    // Check password
    const isPasswordCorrect = await user.correctPassword(password, user.password);

    if (!isPasswordCorrect) {
      // Increment login attempts
      await user.incLoginAttempts();
      
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid email or password'
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts && user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Create and send token
    createSendToken(user, 200, res, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error during login'
    });
  }
});

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ status: 'fail', message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Don't reveal whether the email exists
      return res.status(200).json({ status: 'success', message: 'If an account exists for that email, a reset link has been sent.' });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = token;
    user.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save({ validateBeforeSave: false });

    // Build reset URL
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}&email=${encodeURIComponent(user.email)}`;

    // Send email (best-effort)
    try {
      await sendPasswordResetEmail({ to: user.email, resetUrl, name: user.name || 'User' });
    } catch (mailErr) {
      console.warn('Failed to send password reset email:', mailErr.message || mailErr);
    }

    return res.status(200).json({ status: 'success', message: 'If an account exists for that email, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ status: 'error', message: 'Error processing password reset request' });
  }
});

// @desc    Reset password using token
// @route   POST /api/auth/reset-password
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, email, password } = req.body;
    if (!token || !email || !password) return res.status(400).json({ status: 'fail', message: 'Token, email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase().trim(), passwordResetToken: token }).select('+passwordResetToken +passwordResetExpires');
    if (!user) return res.status(400).json({ status: 'fail', message: 'Invalid token or email' });

    if (user.passwordResetExpires && user.passwordResetExpires < Date.now()) {
      return res.status(400).json({ status: 'fail', message: 'Reset token has expired' });
    }

    // Update password and clear reset fields
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return res.status(200).json({ status: 'success', message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ status: 'error', message: 'Error resetting password' });
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching user data'
    });
  }
});

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
router.post('/logout', protect, (req, res) => {
  // In a stateless JWT system, logout is handled on the client side
  // by removing the token. We just send a success response.
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
router.post('/refresh', protect, async (req, res) => {
  try {
    // Generate new token for the current user
    createSendToken(req.user, 200, res, 'Token refreshed successfully');
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error refreshing token'
    });
  }
});

module.exports = router;