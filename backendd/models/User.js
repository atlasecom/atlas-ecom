const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your name'],
    maxLength: [30, 'Your name cannot exceed 30 characters'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please enter your email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please enter a valid email'
    ]
  },
  password: {
    type: String,
    required: function() {
      return !this.isGoogleUser;
    },
    minLength: [8, 'Your password must be at least 8 characters long'],
    select: false
  },
  phoneNumber: {
    type: String,
    required: false,
    default: ''
  },
  address: {
    type: String,
    required: false,
    default: ''
  },
  avatar: {
    public_id: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: 'https://res.cloudinary.com/atlas-ecom/image/upload/v1/default-avatar'
    }
  },
  role: {
    type: String,
    default: 'user',
    enum: ['user', 'seller', 'admin']
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop'
  },
  federatedCredentials: {
    provider: {
      type: String,
      enum: ['google', 'facebook', 'github']
    },
    subject: String
  },
  isGoogleUser: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordToken: String,
  resetPasswordTime: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Encrypt password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || this.isGoogleUser) {
    next();
  }
  this.password = await bcrypt.hash(this.password, parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
});

// Compare password method
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.getJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function() {
  const crypto = require('crypto');
  
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');
  
  // Hash token and set to resetPasswordToken field
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
  // Set expire time (10 minutes)
  this.resetPasswordTime = Date.now() + 10 * 60 * 1000;
  
  return resetToken;
};

// Virtual for fallback avatar (first letter of name)
userSchema.virtual('fallbackAvatar').get(function() {
  if (this.avatar && this.avatar.url && this.avatar.url !== 'https://res.cloudinary.com/atlas-ecom/image/upload/v1/default-avatar') {
    return this.avatar.url;
  }
  
  // Generate fallback avatar with first letter
  const firstLetter = this.name ? this.name.charAt(0).toUpperCase() : 'U';
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
  ];
  const colorIndex = this.name ? this.name.charCodeAt(0) % colors.length : 0;
  
  return `data:image/svg+xml;base64,${btoa(`
    <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="${colors[colorIndex]}" rx="50"/>
      <text x="50" y="65" font-family="Arial, sans-serif" font-size="40" font-weight="bold" text-anchor="middle" fill="white">${firstLetter}</text>
    </svg>
  `)}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

// Create indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ role: 1 });
userSchema.index({ shop: 1 });

module.exports = mongoose.model('User', userSchema);
