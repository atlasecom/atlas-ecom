const mongoose = require("mongoose");

const tutorialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter tutorial title"],
    trim: true
  },
  titleAr: {
    type: String,
    trim: true
  },
  titleFr: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    required: [true, "Please enter tutorial description"]
  },
  descriptionAr: {
    type: String
  },
  descriptionFr: {
    type: String
  },
  videoUrl: {
    type: String,
    required: [true, "Please enter video URL"]
  },
  thumbnail: {
    public_id: {
      type: String
    },
    url: {
      type: String
    }
  },
  category: {
    type: String,
    enum: ['getting-started', 'create-product', 'manage-orders', 'analytics', 'marketing', 'settings', 'other'],
    default: 'other'
  },
  duration: {
    type: String, // e.g., "5:30" for 5 minutes 30 seconds
    default: "0:00"
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
tutorialSchema.index({ category: 1, order: 1 });
tutorialSchema.index({ isActive: 1 });

module.exports = mongoose.model("Tutorial", tutorialSchema);

