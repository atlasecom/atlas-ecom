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
    type: String,
    required: [true, 'Please select category for this product'],
    enum: [
      'Electronics',
      'Fashion & Apparel',
      'Home & Garden',
      'Sports & Outdoors',
      'Health & Beauty',
      'Books & Media',
      'Automotive',
      'Toys & Games',
      'Food & Beverages',
      'Jewelry & Accessories',
      'Pet Supplies'
    ]
  },
  tags: {
    type: String,
    trim: true
  },
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

// Create indexes
productSchema.index({ shop: 1 });
productSchema.index({ category: 1 });
productSchema.index({ discountPrice: 1 });
productSchema.index({ ratings: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
