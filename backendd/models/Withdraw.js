const mongoose = require('mongoose');

const withdrawSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Please enter withdrawal amount'],
    min: [1, 'Withdrawal amount must be at least 1']
  },
  status: {
    type: String,
    enum: ['Processing', 'Completed', 'Failed'],
    default: 'Processing'
  },
  withdrawMethod: {
    type: {
      type: String,
      enum: ['bank', 'paypal', 'stripe'],
      required: true
    },
    accountNumber: String,
    accountName: String,
    bankName: String,
    paypalEmail: String,
    stripeAccountId: String
  },
  transactionId: {
    type: String
  },
  notes: {
    type: String,
    maxLength: [500, 'Notes cannot exceed 500 characters']
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes
withdrawSchema.index({ seller: 1 });
withdrawSchema.index({ status: 1 });
withdrawSchema.index({ createdAt: 1 });
withdrawSchema.index({ processedBy: 1 });

module.exports = mongoose.model('Withdraw', withdrawSchema);
