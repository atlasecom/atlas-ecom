const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter coupon name'],
    unique: true,
    trim: true
  },
  value: {
    type: Number,
    required: [true, 'Please enter coupon value']
  },
  minAmount: {
    type: Number,
    required: [true, 'Please enter minimum order amount']
  },
  maxAmount: {
    type: Number,
    required: [true, 'Please enter maximum discount amount']
  },
  shopId: {
    type: String
  },
  selectedProduct: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiryDate: {
    type: Date,
    required: [true, 'Please enter coupon expiry date']
  },
  usageLimit: {
    type: Number,
    default: -1 // -1 means unlimited
  },
  usedCount: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Check if coupon is valid
couponSchema.methods.isValid = function() {
  const now = new Date();
  return this.isActive && 
         this.expiryDate > now && 
         (this.usageLimit === -1 || this.usedCount < this.usageLimit);
};

// Create indexes
couponSchema.index({ name: 1 }, { unique: true });
couponSchema.index({ shopId: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ expiryDate: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
