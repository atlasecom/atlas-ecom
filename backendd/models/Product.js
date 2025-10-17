const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    maxLength: [500, 'Review comment cannot exceed 500 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter product name'],
    maxLength: [100, 'Product name cannot exceed 100 characters'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please enter product description'],
    maxLength: [2000, 'Product description cannot exceed 2000 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please select category for this product']
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory',
    required: [true, 'Please select subcategory for this product']
  },
  // Legacy category field for backward compatibility
  legacyCategory: {
    type: String,
    trim: true
  },
  // Enhanced tags system
  tags: {
    en: [{
      type: String,
      trim: true,
      maxLength: [30, 'English tag cannot exceed 30 characters']
    }],
    ar: [{
      type: String,
      trim: true,
      maxLength: [30, 'Arabic tag cannot exceed 30 characters']
    }],
    fr: [{
      type: String,
      trim: true,
      maxLength: [30, 'French tag cannot exceed 30 characters']
    }]
  },
  // Combined search tags (all languages combined for text search)
  searchTags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  originalPrice: {
    type: Number,
    required: [true, 'Please enter product price']
  },
  discountPrice: {
    type: Number,
    required: [true, 'Please enter product discount price']
  },
  stock: {
    type: Number,
    required: [true, 'Please enter product stock'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  sold_out: {
    type: Number,
    default: 0
  },
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  reviews: [reviewSchema],
  ratings: {
    type: Number,
    default: 0
  },
  numOfReviews: {
    type: Number,
    default: 0
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop',
    required: true
  },
  minOrderQuantity: {
    type: Number,
    default: 1,
    min: [1, 'Minimum order quantity must be at least 1']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Product approval system
  isApproved: {
    type: Boolean,
    default: false
  },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  rejectionReason: {
    type: String,
    default: ''
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: {
    type: Date
  },
  // Boost system
  isBoosted: {
    type: Boolean,
    default: false
  },
  boostPriority: {
    type: Number,
    default: 0
  },
  boostExpiresAt: Date,
  boostClicksRemaining: {
    type: Number,
    default: 0
  },
  // Click tracking for boost system
  clickTracking: {
    whatsapp: {
      type: Number,
      default: 0
    },
    telegram: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      default: 0
    }
  },
  // Analytics tracking fields
  viewCount: {
    type: Number,
    default: 0
  },
  whatsappClicks: {
    type: Number,
    default: 0
  },
  telegramClicks: {
    type: Number,
    default: 0
  },
  favoritesCount: {
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

// Calculate average rating before saving
productSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.ratings = totalRating / this.reviews.length;
    this.numOfReviews = this.reviews.length;
  }
  next();
});

// Pre-save middleware to update searchTags
productSchema.pre('save', function(next) {
  // Combine all tags from all languages for search
  const allTags = [
    ...(this.tags.en || []),
    ...(this.tags.ar || []),
    ...(this.tags.fr || []),
    this.name,
    this.description
  ].map(tag => tag.toLowerCase().trim()).filter(tag => tag.length > 0);
  
  this.searchTags = [...new Set(allTags)]; // Remove duplicates
  next();
});

// Create indexes
productSchema.index({ shop: 1 });
productSchema.index({ category: 1 });
productSchema.index({ subcategory: 1 });
productSchema.index({ discountPrice: 1 });
productSchema.index({ ratings: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ searchTags: 'text' }); // Text search index for multilingual tags
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
