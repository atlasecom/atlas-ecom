const express = require('express');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const passport = require('../config/passport');
const User = require('../models/User');
const Shop = require('../models/Shop');
const { protect, authorize } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const { getImageUrlFromFile } = require('../utils/imageUtils');

const router = express.Router();

// Cloudinary upload is configured in ../config/cloudinary.js

// @desc    Test Google OAuth configuration
// @route   GET /auth/google/test
// @access  Public
router.get('/google/test', (req, res) => {
  res.json({
    success: true,
    message: 'Google OAuth Configuration Test',
    config: {
      clientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set',
      callbackUrl: process.env.GOOGLE_CALLBACK_URL,
      frontendUrl: process.env.FRONTEND_URL,
      environment: process.env.NODE_ENV
    }
  });
});

// @desc    Google OAuth routes - MUST BE BEFORE /:id route to avoid conflicts
// @route   GET /auth/google
// @access  Public
router.get('/google', (req, res) => {
  console.log('🔍 Google OAuth route accessed');
  console.log('🔍 GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
  console.log('🔍 GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'Set' : 'Not set');
  console.log('🔍 CLIENT_ID value:', process.env.GOOGLE_CLIENT_ID);
  console.log('🔍 CLIENT_SECRET starts with GOCSPX:', process.env.GOOGLE_CLIENT_SECRET ? process.env.GOOGLE_CLIENT_SECRET.startsWith('GOCSPX-') : false);
  
  // Check if Google OAuth credentials are configured (use mock if invalid)
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || 
      process.env.GOOGLE_CLIENT_ID === 'your-google-client-id' || 
      process.env.GOOGLE_CLIENT_SECRET === 'your-google-client-secret' ||
      process.env.GOOGLE_CLIENT_ID === 'your-actual-google-client-id' ||
      process.env.GOOGLE_CLIENT_SECRET === 'your-actual-google-client-secret') {
    
    // Mock Google OAuth for testing - redirect to callback with mock data
    console.log('Using mock Google OAuth for testing');
    
    // Generate random user data for testing
    const randomNames = ['John Doe', 'Jane Smith', 'Ahmed Hassan', 'Maria Garcia', 'David Wilson'];
    const randomEmails = ['john@example.com', 'jane@example.com', 'ahmed@example.com', 'maria@example.com', 'david@example.com'];
    const randomIndex = Math.floor(Math.random() * randomNames.length);
    
    const mockUser = {
      _id: 'mock-user-id-' + Date.now(),
      name: randomNames[randomIndex],
      email: randomEmails[randomIndex],
      avatar: {
        public_id: 'mock-avatar-' + Date.now(),
        url: `https://via.placeholder.com/100x100/4F46E5/FFFFFF?text=${randomNames[randomIndex].charAt(0)}`
      },
      role: 'user',
      isGoogleUser: true,
      phoneNumber: '',
      address: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Generate a mock JWT token
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: mockUser._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRE
    });
    
    // Redirect to frontend OAuth callback route with mock data
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/oauth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify(mockUser))}`;
    
    console.log('Mock redirecting to:', redirectUrl);
    return res.redirect(redirectUrl);
  }
  
  console.log('Redirecting to Google OAuth...');
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })(req, res);
});

// @desc    Register user (with file upload support) - PRIMARY ROUTE
// @route   POST /api/auth/register
// @access  Public
router.post('/register', upload.single('image'), [
  body('name').trim().isLength({ min: 2, max: 30 }).withMessage('Name must be between 2 and 30 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('phoneNumber').optional().isString().withMessage('Phone number must be a string'),
  body('address').optional().isString().withMessage('Address must be a string')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password, role = 'user' } = req.body;
    const phoneNumber = req.body.phoneNumber || '';
    const address = req.body.address || '';

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Prepare user data
    const userData = {
      name,
      email,
      password,
      role,
      phoneNumber,
      address
    };

    // Add avatar if uploaded
    if (req.file) {
      userData.avatar = {
        public_id: req.file.public_id,
        url: req.file.secure_url
      };
    }

    // Create user
    const user = await User.create(userData);

    // Generate token
    const token = user.getJwtToken();

    // Remove password from response
    user.password = undefined;

    // Add fallback avatar to response - PRIMARY ROUTE
    const userResponse = user.toObject();
    userResponse.fallbackAvatar = user.fallbackAvatar;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});

// @desc    Register user (alternative route for frontend compatibility)
// @route   POST /
// @access  Public
router.post('/', upload.single('image'), [
  body('name').trim().isLength({ min: 2, max: 30 }).withMessage('Name must be between 2 and 30 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
  body('phoneNumber').optional().isString().withMessage('Phone number must be a string'),
  body('address').optional().isString().withMessage('Address must be a string')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, email, password, role = 'user' } = req.body;
    const phoneNumber = req.body.phoneNumber || '';
    const address = req.body.address || '';

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Prepare user data
    const userData = {
      name,
      email,
      password,
      role,
      phoneNumber,
      address
    };

    // Add avatar if uploaded
    if (req.file) {
      userData.avatar = {
        public_id: req.file.public_id,
        url: req.file.secure_url
      };
    }

    // Create user
    const user = await User.create(userData);

    // Generate token
    const token = user.getJwtToken();

    // Remove password from response
    user.password = undefined;

    // Add fallback avatar to response - ALTERNATIVE ROUTE
    const userResponse = user.toObject();
    userResponse.fallbackAvatar = user.fallbackAvatar;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message
    });
  }
});

// @desc    Get all users (admin only)
// @route   GET /
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    
    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// @desc    Get current user profile
// @route   GET /me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('shop');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Add fallback avatar to response
    const userResponse = user.toObject();
    userResponse.fallbackAvatar = user.fallbackAvatar;
    
    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// @desc    Get current user (alternative route)
// @route   GET /users/me
// @access  Private
router.get('/users/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('shop');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Add fallback avatar to response
    const userResponse = user.toObject();
    userResponse.fallbackAvatar = user.fallbackAvatar;
    
    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// @desc    Get user by ID (admin only)
// @route   GET /:id
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('shop');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// @desc    Get user by ID (public - for reviews)
// @route   GET /users/:id
// @access  Public
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email avatar role phoneNumber');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Add fallback avatar to response
    const userResponse = user.toObject();
    userResponse.fallbackAvatar = user.fallbackAvatar;
    
    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// @desc    Delete user (admin only)
// @route   DELETE /:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    await User.findByIdAndDelete(req.params.id);
    
    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check password
    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Generate token
    const token = user.getJwtToken();

    // Remove password from response
    user.password = undefined;

    // Add fallback avatar to response
    const userResponse = user.toObject();
    userResponse.fallbackAvatar = user.fallbackAvatar;

    // Populate shop if user is a seller
    if (user.role === 'seller' && user.shop) {
      await user.populate('shop');
    }

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: userResponse
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during login',
      error: error.message
    });
  }
});

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('shop');
    
    // Add fallback avatar to response
    const userResponse = user.toObject();
    userResponse.fallbackAvatar = user.fallbackAvatar;
    
    res.json({
      success: true,
      user: userResponse
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, [
  body('name').optional().trim().isLength({ min: 2, max: 30 }).withMessage('Name must be between 2 and 30 characters'),
  body('phoneNumber').optional().isString().withMessage('Phone number must be a string'),
  body('address').optional().isString().withMessage('Address must be a string')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, phoneNumber, address } = req.body;

    // Update user
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phoneNumber, address },
      { new: true, runValidators: true }
    ).populate('shop');

    // Add fallback avatar to response
    const userResponse = user.toObject();
    userResponse.fallbackAvatar = user.fallbackAvatar;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
});

// @desc    Update user avatar
// @route   PUT /api/auth/avatar
// @access  Private
router.put('/avatar', protect, upload.single('image'), async (req, res) => {
  try {
    console.log('Avatar upload request received');
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    console.log('Request headers:', req.headers);
    
    let avatarData = null;

    // Check if it's a file upload or JSON reset
    if (req.file) {
      console.log('File upload detected:', req.file);
      // File upload case
      const imageUrl = getImageUrlFromFile(req, req.file, 'avatars');
      console.log('🔍 Generated avatar URL:', imageUrl);
      
      avatarData = {
        public_id: req.file.public_id || req.file.filename,
        url: imageUrl
      };
    } else if (req.body.avatar) {
      console.log('JSON reset detected:', req.body.avatar);
      // JSON reset case
      avatarData = req.body.avatar;
    } else {
      console.log('No file or avatar data provided');
      return res.status(400).json({
        success: false,
        message: 'No image file or avatar data provided'
      });
    }

    // Update user avatar
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarData },
      { new: true, runValidators: true }
    ).populate('shop');

    // Add fallback avatar to response
    const userResponse = user.toObject();
    userResponse.fallbackAvatar = user.fallbackAvatar;

    res.json({
      success: true,
      message: 'Avatar updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update avatar error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating avatar',
      error: error.message
    });
  }
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters long')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findById(req.user._id).select('+password');

    // Check current password
    const isPasswordMatch = await user.comparePassword(currentPassword);
    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error changing password',
      error: error.message
    });
  }
});



// @desc    Google OAuth callback
// @route   GET /auth/google/callback
// @access  Public
router.get('/google/callback', passport.authenticate('google', { session: false }), async (req, res) => {
  try {
    console.log('🔍 Google OAuth callback received');
    console.log('🔍 User:', req.user ? 'Found' : 'Not found');
    console.log('🔍 FRONTEND_URL:', process.env.FRONTEND_URL);
    
    const user = req.user;
    
    if (!user) {
      console.error('❌ No user found in OAuth callback');
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      console.log('❌ Redirecting to login with error:', `${frontendUrl}/login?error=oauth_failed`);
      return res.redirect(`${frontendUrl}/login?error=oauth_failed`);
    }
    
    console.log('✅ User found:', user.email);
    
    // Generate JWT token
    const token = user.getJwtToken();
    console.log('✅ JWT token generated');
    
    // Remove password from response
    user.password = undefined;
    
    // Add fallback avatar to response
    const userResponse = user.toObject();
    userResponse.fallbackAvatar = user.fallbackAvatar;
    
    // Populate shop if user is a seller
    if (user.role === 'seller' && user.shop) {
      await user.populate('shop');
      console.log('✅ Shop populated for seller');
    }
    
    // Redirect to frontend OAuth callback route with token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/oauth-callback?token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}`;
    
    console.log('🚀 Redirecting to:', redirectUrl);
    console.log('🚀 Frontend URL:', frontendUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Google OAuth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    console.log('❌ Redirecting to error page:', `${frontendUrl}/oauth-callback?error=oauth_failed`);
    res.redirect(`${frontendUrl}/oauth-callback?error=oauth_failed`);
  }
});

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { email } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      });
    }

    // Generate reset token
    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    // For now, we'll show the reset URL in console and response
    // TODO: Configure email service properly
    console.log('🔑 Password Reset URL Generated:');
    console.log('📧 Email:', email);
    console.log('🔗 Reset URL:', resetUrl);
    console.log('⏰ Expires in: 10 minutes');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Try to send email (optional)
    try {
      const emailService = require('../utils/alternativeEmailService');
      const emailResult = await emailService.sendPasswordResetEmail(email, resetUrl);
      
      if (emailResult.success) {
        console.log('✅ Email sent successfully via', emailResult.provider);
      } else {
        console.log('⚠️ Email sending failed, but reset link is available above');
      }
    } catch (error) {
      console.log('⚠️ Email service error, but reset link is available above');
    }

    res.json({
      success: true,
      message: 'Password reset link generated successfully!',
      resetUrl: resetUrl, // Always show in development
      note: 'Check the server console for the reset URL if email is not received'
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing forgot password request',
      error: error.message
    });
  }
});

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
// @access  Public
router.put('/reset-password/:token', [
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { password } = req.body;
    const resetToken = req.params.token;

    // Hash the reset token to compare with database
    const crypto = require('crypto');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Find user with this reset token and check if it's not expired
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordTime: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Update password
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordTime = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting password',
      error: error.message
    });
  }
});

module.exports = router;
