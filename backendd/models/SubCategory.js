const mongoose = require('mongoose');

const subCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'SubCategory name is required'],
    trim: true,
    maxLength: [50, 'SubCategory name cannot exceed 50 characters']
  },
  nameAr: {
    type: String,
    required: [true, 'Arabic subcategory name is required'],
    trim: true,
    maxLength: [50, 'Arabic subcategory name cannot exceed 50 characters']
  },
  nameFr: {
    type: String,
    required: [true, 'French subcategory name is required'],
    trim: true,
    maxLength: [50, 'French subcategory name cannot exceed 50 characters']
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
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  tags: [{
    type: String,
    trim: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
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

// Create indexes for better performance
subCategorySchema.index({ name: 1 });
subCategorySchema.index({ nameAr: 1 });
subCategorySchema.index({ nameFr: 1 });
subCategorySchema.index({ category: 1 });
subCategorySchema.index({ isActive: 1 });
subCategorySchema.index({ sortOrder: 1 });
subCategorySchema.index({ tags: 1 }); // Index for tag search

module.exports = mongoose.model('SubCategory', subCategorySchema);


