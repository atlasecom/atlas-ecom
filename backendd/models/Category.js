const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Category name is required'],
    unique: true,
    trim: true,
    maxLength: [50, 'Category name cannot exceed 50 characters']
  },
  nameAr: {
    type: String,
    required: [true, 'Arabic category name is required'],
    trim: true,
    maxLength: [50, 'Arabic category name cannot exceed 50 characters']
  },
  nameFr: {
    type: String,
    required: [true, 'French category name is required'],
    trim: true,
    maxLength: [50, 'French category name cannot exceed 50 characters']
  },
  description: {
    type: String,
    maxLength: [200, 'Description cannot exceed 200 characters']
  },
  descriptionAr: {
    type: String,
    maxLength: [200, 'Arabic description cannot exceed 200 characters']
  },
  descriptionFr: {
    type: String,
    maxLength: [200, 'French description cannot exceed 200 characters']
  },
  image: {
    public_id: {
      type: String,
      required: false
    },
    url: {
      type: String,
      required: false,
      default: 'https://picsum.photos/500/500?random=' + Math.floor(Math.random() * 1000)
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  subcategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubCategory'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Create indexes for better performance
categorySchema.index({ name: 1 });
categorySchema.index({ nameAr: 1 });
categorySchema.index({ nameFr: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });

module.exports = mongoose.model('Category', categorySchema);
