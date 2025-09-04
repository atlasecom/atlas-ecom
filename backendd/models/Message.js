const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true,
    maxLength: [1000, 'Message cannot exceed 1000 characters']
  },
  sender: {
    type: String,
    required: true
  },
  images: [{
    public_id: {
      type: String
    },
    url: {
      type: String
    }
  }],
  isRead: {
    type: Boolean,
    default: false
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes
messageSchema.index({ conversationId: 1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ createdAt: 1 });
messageSchema.index({ isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);
