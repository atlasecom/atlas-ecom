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
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const whatsappService = require('../services/whatsappService');

const router = express.Router();

// Email verification storage (in production, use Redis or database)
const emailVerificationCodes = new Map();

// WhatsApp phone verification storage (in production, use Redis or database)
const phoneVerificationCodes = new Map();

// Email transporter configuration
const createEmailTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Cloudinary upload is configured in ../config/cloudinary.js

// @desc    Send verification code to email
// @route   POST /users/send-verification-code
// @access  Public
router.post('/send-verification-code', async (req, res) => {
  try {
    const { email, type } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Generate 6-digit verification code
    const verificationCode = crypto.randomInt(100000, 999999).toString();

    // Store code with expiration (10 minutes)
    emailVerificationCodes.set(email, {
      code: verificationCode,
      type: type || 'customer',
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

          // Send email
          try {
            const transporter = createEmailTransporter();
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Email Verification Code - Atlas Ecommerce',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Email Verification - Atlas Ecommerce</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
              
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #f97316, #ea580c); padding: 30px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Atlas Ecommerce</h1>
                <p style="color: white; margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Email Verification</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 40px 30px;">
                <h2 style="color: #333; text-align: center; margin-bottom: 30px; font-size: 24px;">Verify Your Email Address</h2>
                
                <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                  Thank you for signing up! To complete your registration, please use the verification code below:
                </p>
                
                <!-- Verification Code Box -->
                <div style="background-color: #f8f9fa; border: 2px dashed #f97316; padding: 30px; border-radius: 10px; margin: 30px 0; text-align: center;">
                  <p style="font-size: 18px; color: #333; margin-bottom: 15px; font-weight: 500;">Your verification code is:</p>
                  <div style="background-color: #ffffff; border: 2px solid #f97316; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h1 style="color: #f97316; text-align: center; font-size: 36px; letter-spacing: 8px; margin: 0; font-weight: bold; font-family: 'Courier New', monospace;">${verificationCode}</h1>
                  </div>
                  <p style="color: #666; font-size: 14px; margin: 0;">Enter this code in the verification field</p>
                </div>
                
                <!-- Instructions -->
                <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 20px; margin: 30px 0; border-radius: 0 8px 8px 0;">
                  <h3 style="color: #1976d2; margin: 0 0 10px 0; font-size: 16px;">Important Instructions:</h3>
                  <ul style="color: #666; font-size: 14px; line-height: 1.6; margin: 0; padding-left: 20px;">
                    <li>This code will expire in <strong>10 minutes</strong></li>
                    <li>Enter the code exactly as shown above</li>
                    <li>If you didn't request this code, please ignore this email</li>
                    <li>Check your spam folder if you don't see this email</li>
                  </ul>
                </div>
                
                <p style="color: #666; font-size: 14px; text-align: center; margin: 30px 0 0 0;">
                  If you have any questions, please contact our support team.
                </p>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
                <p style="color: #999; font-size: 12px; margin: 0;">
                  © 2024 Atlas Ecommerce Platform. All rights reserved.
                </p>
                <p style="color: #999; font-size: 12px; margin: 5px 0 0 0;">
                  This email was sent to ${email} at ${new Date().toLocaleString()}
                </p>
              </div>
              
            </div>
          </body>
          </html>
        `,
        text: `
Atlas Ecommerce - Email Verification

Hello,

Thank you for signing up! To complete your registration, please use the verification code below:

VERIFICATION CODE: ${verificationCode}

Important Instructions:
- This code will expire in 10 minutes
- Enter the code exactly as shown above
- If you didn't request this code, please ignore this email
- Check your spam folder if you don't see this email

If you have any questions, please contact our support team.

Best regards,
Atlas Ecommerce Team

This email was sent to ${email} at ${new Date().toLocaleString()}
        `
            });
            
            res.status(200).json({
              success: true,
              message: 'Verification code sent successfully to your email'
            });
            
          } catch (emailError) {
            console.error('Email sending error:', emailError);
            
            // Fallback: return code in response if email fails
            res.status(200).json({
              success: true,
              message: 'Email sending failed, but verification code is available. Check console or try again.',
              code: verificationCode,
              error: 'Email sending failed, but code is valid',
              fallback: true
            });
          }

  } catch (error) {
    console.error('Send verification code error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code'
    });
  }
});

// @desc    Verify email with code
// @route   POST /users/verify-email
// @access  Public
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code, type } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
    }

    // Check if code exists and is valid
    const storedData = emailVerificationCodes.get(email);
    
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'No verification code found for this email'
      });
    }

    // Check if code is expired
    if (Date.now() > storedData.expiresAt) {
      emailVerificationCodes.delete(email);
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired'
      });
    }

    // Check if code matches
    if (storedData.code !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Mark email as verified
    emailVerificationCodes.set(email, {
      ...storedData,
      verified: true
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });

  } catch (error) {
    console.error('Verify email error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify email'
    });
  }
});

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

    // Check email verification for customer and seller accounts
    if (role === 'user' || role === 'seller' || !role) {
      const storedData = emailVerificationCodes.get(email);
      if (!storedData || !storedData.verified) {
        return res.status(400).json({
          success: false,
          message: 'Email must be verified before registration'
        });
      }
    }

    // Check phone verification for seller accounts
    if (role === 'seller') {
      const shopPhone = req.body.shopPhone || '';
      if (shopPhone) {
        // Clean phone number
        const cleanPhone = shopPhone.replace(/\D/g, '');
        let formattedPhone;
        if (cleanPhone.startsWith('212')) {
          formattedPhone = cleanPhone;
        } else if (cleanPhone.startsWith('0')) {
          formattedPhone = '212' + cleanPhone.substring(1);
        } else if (cleanPhone.length === 9 && /^(6|7)[0-9]{8}$/.test(cleanPhone)) {
          formattedPhone = '212' + cleanPhone;
        }

        if (formattedPhone) {
          const phoneData = phoneVerificationCodes.get(formattedPhone);
          if (!phoneData || !phoneData.verified) {
            return res.status(400).json({
              success: false,
              message: 'Shop phone must be verified before registration'
            });
          }
        }
      }
    }

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
      const { getImageUrlFromFile } = require('../utils/imageUtils');
      const avatarUrl = getImageUrlFromFile(req, req.file, 'avatars');
      
      console.log('🔍 Avatar upload details:', {
        public_id: req.file.public_id,
        secure_url: req.file.secure_url,
        filename: req.file.filename,
        generatedUrl: avatarUrl
      });
      
      userData.avatar = {
        public_id: req.file.public_id || req.file.filename,
        url: avatarUrl
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

    console.log('✅ User registered successfully:', {
      email: userResponse.email,
      role: userResponse.role,
      hasAvatar: !!userResponse.avatar,
      avatarUrl: userResponse.avatar?.url
    });

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
// @route   GET /user/:id
// @access  Private/Admin
router.get('/user/:id', protect, authorize('admin'), async (req, res) => {
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

// @desc    Delete current user's account
// @route   DELETE /delete-account
// @access  Private
router.delete('/delete-account', protect, async (req, res) => {
  try {
    console.log('Delete account request received for user:', req.user._id);
    console.log('User role:', req.user.role);
    
    const userId = req.user.id || req.user._id; // Use id from token, fallback to _id
    
    // Find the user
    const user = await User.findById(userId).populate('shop');
    
    if (!user) {
      console.log('User not found:', userId);
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log('Found user:', user.email, 'with shop:', user.shop ? 'Yes' : 'No');

    // If user has a shop, delete all associated data
    if (user.shop) {
      const Product = require('../models/Product');
      const Event = require('../models/Event');
      
      // Delete all products associated with this shop
      const deletedProducts = await Product.deleteMany({ shop: user.shop._id });
      console.log(`Deleted ${deletedProducts.deletedCount} products for shop:`, user.shop._id);
      
      // Delete all events associated with this shop
      const deletedEvents = await Event.deleteMany({ shop: user.shop._id });
      console.log(`Deleted ${deletedEvents.deletedCount} events for shop:`, user.shop._id);
      
      // Delete the shop
      await Shop.findByIdAndDelete(user.shop._id);
      console.log('Shop deleted for user:', userId);
    }

    // Delete the user
    await User.findByIdAndDelete(userId);
    console.log('User account deleted:', userId);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

// @desc    Delete user (admin only)
// @route   DELETE /:id
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('shop');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // If user has a shop (is a seller), delete all associated data
    if (user.shop) {
      const Product = require('../models/Product');
      const Event = require('../models/Event');
      
      // Delete all products associated with this shop
      const deletedProducts = await Product.deleteMany({ shop: user.shop._id });
      console.log(`Admin deleted ${deletedProducts.deletedCount} products for shop:`, user.shop._id);
      
      // Delete all events associated with this shop
      const deletedEvents = await Event.deleteMany({ shop: user.shop._id });
      console.log(`Admin deleted ${deletedEvents.deletedCount} events for shop:`, user.shop._id);
      
      // Delete the shop
      await Shop.findByIdAndDelete(user.shop._id);
      console.log('Admin deleted shop:', user.shop._id);
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

// @desc    Change user password
// @route   PUT /change-password
// @access  Private
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
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
    const userId = req.user.id;

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await User.findByIdAndUpdate(userId, { password: hashedNewPassword });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
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
    
    // Redirect to frontend login page with success message and token
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendUrl}/login?google_success=true&token=${token}&user=${encodeURIComponent(JSON.stringify(userResponse))}`;
    
    console.log('🚀 Redirecting to:', redirectUrl);
    console.log('🚀 Frontend URL:', frontendUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Google OAuth callback error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    console.log('❌ Redirecting to error page:', `${frontendUrl}/login?error=oauth_failed`);
    res.redirect(`${frontendUrl}/login?error=oauth_failed`);
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

// @desc    Add product to wishlist
// @route   POST /wishlist/:productId
// @access  Private
router.post('/wishlist/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Check if product exists
    const Product = require('../models/Product');
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Find user and check if product is already in wishlist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if product is already in wishlist
    if (user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product already in wishlist'
      });
    }

    // Add product to wishlist
    user.wishlist.push(productId);
    await user.save();

    res.json({
      success: true,
      message: 'Product added to wishlist',
      wishlist: user.wishlist
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to wishlist',
      error: error.message
    });
  }
});

// @desc    Remove product from wishlist
// @route   DELETE /wishlist/:productId
// @access  Private
router.delete('/wishlist/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if product is in wishlist
    if (!user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Product not in wishlist'
      });
    }

    // Remove product from wishlist
    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();

    res.json({
      success: true,
      message: 'Product removed from wishlist',
      wishlist: user.wishlist
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing from wishlist',
      error: error.message
    });
  }
});

// @desc    Check if product is in wishlist
// @route   GET /wishlist/:productId
// @access  Private
router.get('/wishlist/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const isInWishlist = user.wishlist.includes(productId);

    res.json({
      success: true,
      isInWishlist
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking wishlist',
      error: error.message
    });
  }
});

// @desc    Get user wishlist
// @route   GET /wishlist
// @access  Private
router.get('/wishlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      populate: {
        path: 'shop',
        select: 'name avatar'
      }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      wishlist: user.wishlist || []
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching wishlist',
      error: error.message
    });
  }
});

// Send WhatsApp verification code
router.post('/users/send-phone-verification', [
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('type').isIn(['customer', 'seller']).withMessage('Type must be customer or seller')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { phone, type } = req.body;

    // Clean phone number (remove non-digits)
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Validate Moroccan phone number
    let formattedPhone;
    if (cleanPhone.startsWith('212')) {
      formattedPhone = cleanPhone;
    } else if (cleanPhone.startsWith('0')) {
      formattedPhone = '212' + cleanPhone.substring(1);
    } else if (cleanPhone.length === 9 && /^(6|7)[0-9]{8}$/.test(cleanPhone)) {
      formattedPhone = '212' + cleanPhone;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid Moroccan phone number format'
      });
    }

    // Generate 6-digit verification code
    const code = crypto.randomInt(100000, 999999).toString();
    
    // Store verification code with expiration (10 minutes)
    phoneVerificationCodes.set(formattedPhone, {
      code,
      timestamp: Date.now(),
      type,
      verified: false
    });

    // Clean up expired codes
    for (const [phoneNumber, data] of phoneVerificationCodes.entries()) {
      if (Date.now() - data.timestamp > 10 * 60 * 1000) {
        phoneVerificationCodes.delete(phoneNumber);
      }
    }

    // Send verification code via WhatsApp
    try {
      const whatsappResult = await whatsappService.sendVerificationCode(formattedPhone, code);
      
      if (whatsappResult.success) {
        res.json({
          success: true,
          message: 'Verification code sent to WhatsApp',
          phone: formattedPhone
        });
      } else {
        console.error(`Failed to send WhatsApp code to ${formattedPhone}:`, whatsappResult.error);
        
        res.json({
          success: true,
          message: 'WhatsApp service unavailable. Code logged to console.',
          code: code, // Include code in response as fallback
          phone: formattedPhone
        });
      }
    } catch (error) {
      console.error('WhatsApp service error:', error);
      
      res.json({
        success: true,
        message: 'WhatsApp service error. Code logged to console.',
        code: code, // Include code in response as fallback
        phone: formattedPhone
      });
    }

  } catch (error) {
    console.error('Send phone verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send verification code',
      error: error.message
    });
  }
});

// Verify WhatsApp code
router.post('/users/verify-phone', [
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('Code must be 6 digits'),
  body('type').isIn(['customer', 'seller']).withMessage('Type must be customer or seller')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { phone, code, type } = req.body;

    // Clean phone number
    const cleanPhone = phone.replace(/\D/g, '');
    let formattedPhone;
    if (cleanPhone.startsWith('212')) {
      formattedPhone = cleanPhone;
    } else if (cleanPhone.startsWith('0')) {
      formattedPhone = '212' + cleanPhone.substring(1);
    } else if (cleanPhone.length === 9 && /^(6|7)[0-9]{8}$/.test(cleanPhone)) {
      formattedPhone = '212' + cleanPhone;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid Moroccan phone number format'
      });
    }

    // Check if code exists and is not expired
    const storedData = phoneVerificationCodes.get(formattedPhone);
    
    if (!storedData) {
      return res.status(400).json({
        success: false,
        message: 'No verification code found for this phone number'
      });
    }

    // Check if code is expired (10 minutes)
    if (Date.now() - storedData.timestamp > 10 * 60 * 1000) {
      phoneVerificationCodes.delete(formattedPhone);
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired'
      });
    }

    // Check if code matches
    if (storedData.code !== code) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code'
      });
    }

    // Mark as verified
    phoneVerificationCodes.set(formattedPhone, {
      ...storedData,
      verified: true
    });

    res.json({
      success: true,
      message: 'Phone number verified successfully',
      phone: formattedPhone
    });

  } catch (error) {
    console.error('Verify phone error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify phone number',
      error: error.message
    });
  }
});

module.exports = router;
