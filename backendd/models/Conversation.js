const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  groupTitle: {
    type: String,
    trim: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  lastMessage: {
    type: String,
    trim: true
  },
  lastMessageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  isGroupChat: {
    type: Boolean,
    default: false
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes
conversationSchema.index({ members: 1 });
conversationSchema.index({ updatedAt: -1 });
conversationSchema.index({ isGroupChat: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
