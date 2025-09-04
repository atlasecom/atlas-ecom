const mongoose = require('mongoose');

const shopSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter your shop name'],
    maxLength: [50, 'Shop name cannot exceed 50 characters'],
    trim: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  telegram: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  address: {
    type: String,
    required: [true, 'Please enter your shop address']
  },
  phoneNumber: {
    type: String,
    required: [true, 'Please enter your shop phone number']
  },
  banner: {
    public_id: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      default: 'https://res.cloudinary.com/atlas-ecom/image/upload/v1/default-shop-banner'
    }
  },
  zipCode: {
    type: Number,
    required: [true, 'Please enter your zip code']
  },
  withdrawMethod: {
    type: {
      type: String,
      enum: ['bank', 'paypal', 'stripe'],
      default: 'bank'
    },
    accountNumber: String,
    accountName: String,
    bankName: String,
    paypalEmail: String,
    stripeAccountId: String
  },
  availableBalance: {
    type: Number,
    default: 0
  },
  transections: [{
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['Processing', 'Completed', 'Failed'],
      default: 'Processing'
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  ratings: {
    type: Number,
    default: 0
  },
  numOfReviews: {
    type: Number,
    default: 0
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes
shopSchema.index({ owner: 1 }, { unique: true });
shopSchema.index({ name: 1 });
shopSchema.index({ phoneNumber: 1 });
shopSchema.index({ isApproved: 1 });

module.exports = mongoose.model('Shop', shopSchema);
