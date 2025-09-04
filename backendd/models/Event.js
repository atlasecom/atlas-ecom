const mongoose = require('mongoose');

const eventReviewSchema = new mongoose.Schema({
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
  productId: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const eventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter event name'],
    maxLength: [100, 'Event name cannot exceed 100 characters'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please enter event description'],
    maxLength: [2000, 'Event description cannot exceed 2000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select category for this event'],
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
  start_Date: {
    type: Date,
    required: [true, 'Please enter event start date']
  },
  Finish_Date: {
    type: Date,
    required: [true, 'Please enter event end date']
  },
  status: {
    type: String,
    enum: ['Running', 'Ended', 'Upcoming'],
    default: 'Upcoming'
  },
  tags: {
    type: String,
    trim: true
  },
  originalPrice: {
    type: Number,
    required: [true, 'Please enter original price']
  },
  discountPrice: {
    type: Number,
    required: [true, 'Please enter event price']
  },
  stock: {
    type: Number,
    required: [true, 'Please enter event stock'],
    min: [0, 'Stock cannot be negative'],
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
  reviews: [eventReviewSchema],
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
  sold_out: {
    type: Number,
    default: 0
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
eventSchema.pre('save', function(next) {
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.ratings = totalRating / this.reviews.length;
    this.numOfReviews = this.reviews.length;
  }
  
  // Update status based on dates
  const now = new Date();
  if (this.start_Date <= now && this.Finish_Date >= now) {
    this.status = 'Running';
  } else if (this.Finish_Date < now) {
    this.status = 'Ended';
  } else {
    this.status = 'Upcoming';
  }
  
  next();
});

// Create indexes
eventSchema.index({ shopId: 1 });
eventSchema.index({ category: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ start_Date: 1 });
eventSchema.index({ Finish_Date: 1 });
eventSchema.index({ isActive: 1 });
eventSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Event', eventSchema);
