const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');
const { protect, authorize } = require('../middleware/auth');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'atlas-ecom/categories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
    resource_type: 'image'
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// ==================== CATEGORY ROUTES ====================

// Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('subcategories')
      .sort({ sortOrder: 1, createdAt: -1 });

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// Get all categories (Admin)
router.get('/admin/categories', protect, authorize('admin'), async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('subcategories')
      .sort({ sortOrder: 1, createdAt: -1 });

    res.json({
      success: true,
      categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// Create category
router.post('/admin/categories', protect, authorize('admin'), (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err);
      return res.status(400).json({
        success: false,
        message: 'File upload error: ' + err.message
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('📝 Creating category...');
    console.log('📋 Request body:', req.body);
    console.log('📸 File info:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      public_id: req.file.public_id,
      url: req.file.secure_url
    } : 'No file uploaded');

    const { name, nameAr, nameFr, description, descriptionAr, descriptionFr, sortOrder } = req.body;

    // Check if category already exists
    const existingCategory = await Category.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, 'i') } },
        { nameAr: { $regex: new RegExp(`^${nameAr}$`, 'i') } },
        { nameFr: { $regex: new RegExp(`^${nameFr}$`, 'i') } }
      ]
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const categoryData = {
      name,
      nameAr,
      nameFr,
      description,
      descriptionAr,
      descriptionFr,
      sortOrder: sortOrder || 0
    };

    if (req.file) {
      console.log('📸 File received:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        public_id: req.file.public_id,
        url: req.file.secure_url,
        path: req.file.path,
        buffer: req.file.buffer ? 'Buffer present' : 'No buffer'
      });
      
      if (req.file.public_id && req.file.secure_url) {
        categoryData.image = {
          public_id: req.file.public_id,
          url: req.file.secure_url
        };
        console.log('✅ Image uploaded successfully:', categoryData.image);
      } else {
        console.log('⚠️ Cloudinary upload failed - missing public_id or url');
        console.log('File object:', JSON.stringify(req.file, null, 2));
        
        // Try manual upload as fallback
        try {
          const uploadResult = await cloudinary.uploader.upload(req.file.path || req.file.buffer, {
            folder: 'atlas-ecom/categories',
            public_id: `category-${Date.now()}`,
            transformation: [{ width: 500, height: 500, crop: 'limit' }]
          });
          
          categoryData.image = {
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url
          };
          console.log('✅ Manual upload successful:', categoryData.image);
        } catch (manualError) {
          console.log('❌ Manual upload also failed:', manualError.message);
          categoryData.image = {
            public_id: 'default-category',
            url: `https://picsum.photos/500/500?random=${Date.now()}`
          };
        }
      }
    } else {
      console.log('⚠️ No image provided, using default');
      categoryData.image = {
        public_id: 'default-category',
        url: `https://picsum.photos/500/500?random=${Date.now()}`
      };
    }

    const category = await Category.create(categoryData);
    console.log('✅ Category created:', category._id);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('❌ Error creating category:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
});

// Update category
router.put('/admin/categories/:id', protect, authorize('admin'), (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err);
      return res.status(400).json({
        success: false,
        message: 'File upload error: ' + err.message
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { name, nameAr, nameFr, description, descriptionAr, descriptionFr, sortOrder, isActive } = req.body;
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if name conflicts with other categories
    const existingCategory = await Category.findOne({
      _id: { $ne: categoryId },
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, 'i') } },
        { nameAr: { $regex: new RegExp(`^${nameAr}$`, 'i') } },
        { nameFr: { $regex: new RegExp(`^${nameFr}$`, 'i') } }
      ]
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: 'Category with this name already exists'
      });
    }

    const updateData = {
      name,
      nameAr,
      nameFr,
      description,
      descriptionAr,
      descriptionFr,
      sortOrder: sortOrder || category.sortOrder,
      isActive: isActive !== undefined ? isActive : category.isActive
    };

    if (req.file) {
      console.log('📸 File received for update:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        public_id: req.file.public_id,
        url: req.file.secure_url,
        path: req.file.path,
        buffer: req.file.buffer ? 'Buffer present' : 'No buffer'
      });
      
      // Delete old image from Cloudinary
      if (category.image.public_id) {
        try {
          await cloudinary.uploader.destroy(category.image.public_id);
          console.log('✅ Old image deleted:', category.image.public_id);
        } catch (error) {
          console.log('⚠️ Could not delete old image:', error.message);
        }
      }
      
      if (req.file.public_id && req.file.secure_url) {
        updateData.image = {
          public_id: req.file.public_id,
          url: req.file.secure_url
        };
        console.log('✅ Image updated successfully:', updateData.image);
      } else {
        console.log('⚠️ Cloudinary upload failed - missing public_id or url');
        console.log('File object:', JSON.stringify(req.file, null, 2));
        
        // Try manual upload as fallback
        try {
          const uploadResult = await cloudinary.uploader.upload(req.file.path || req.file.buffer, {
            folder: 'atlas-ecom/categories',
            public_id: `category-${Date.now()}`,
            transformation: [{ width: 500, height: 500, crop: 'limit' }]
          });
          
          updateData.image = {
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url
          };
          console.log('✅ Manual upload successful:', updateData.image);
        } catch (manualError) {
          console.log('❌ Manual upload also failed:', manualError.message);
          // Keep existing image if upload fails
          console.log('⚠️ Keeping existing image due to upload failure');
        }
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(categoryId, updateData, { new: true });

    res.json({
      success: true,
      message: 'Category updated successfully',
      category: updatedCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating category',
      error: error.message
    });
  }
});

// Delete category
router.delete('/admin/categories/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const categoryId = req.params.id;

    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Find all subcategories of this category
    const subcategories = await SubCategory.find({ category: categoryId });
    console.log(`🗑️ Found ${subcategories.length} subcategories to delete`);

    // Delete all subcategories and their images from Cloudinary
    for (const subcategory of subcategories) {
      if (subcategory.image && subcategory.image.public_id) {
        try {
          await cloudinary.uploader.destroy(subcategory.image.public_id);
          console.log(`✅ Deleted subcategory image: ${subcategory.image.public_id}`);
        } catch (error) {
          console.log(`⚠️ Could not delete subcategory image: ${error.message}`);
        }
      }
    }

    // Delete all subcategories from database
    await SubCategory.deleteMany({ category: categoryId });
    console.log(`✅ Deleted ${subcategories.length} subcategories`);

    // Delete category image from Cloudinary
    if (category.image && category.image.public_id) {
      try {
        await cloudinary.uploader.destroy(category.image.public_id);
        console.log(`✅ Deleted category image: ${category.image.public_id}`);
      } catch (error) {
        console.log(`⚠️ Could not delete category image: ${error.message}`);
      }
    }

    // Delete category from database
    await Category.findByIdAndDelete(categoryId);
    console.log(`✅ Deleted category: ${categoryId}`);

    res.json({
      success: true,
      message: `Category and ${subcategories.length} subcategories deleted successfully`
    });
  } catch (error) {
    console.error('❌ Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting category',
      error: error.message
    });
  }
});

// ==================== SUBCATEGORY ROUTES ====================

// Get all subcategories (Public)
router.get('/subcategories', async (req, res) => {
  try {
    const subcategories = await SubCategory.find({ isActive: true })
      .populate('category', 'name nameAr nameFr image')
      .sort({ sortOrder: 1, createdAt: -1 });
    
    res.json({
      success: true,
      subcategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subcategories',
      error: error.message
    });
  }
});

// Get subcategories by category
router.get('/categories/:categoryId/subcategories', async (req, res) => {
  try {
    const subcategories = await SubCategory.find({ 
      category: req.params.categoryId,
      isActive: true 
    }).sort({ sortOrder: 1, createdAt: -1 });

    res.json({
      success: true,
      subcategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subcategories',
      error: error.message
    });
  }
});

// Get all subcategories (Admin)
router.get('/admin/subcategories', protect, authorize('admin'), async (req, res) => {
  try {
    const subcategories = await SubCategory.find()
      .populate('category', 'name nameAr nameFr')
      .sort({ sortOrder: 1, createdAt: -1 });

    res.json({
      success: true,
      subcategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching subcategories',
      error: error.message
    });
  }
});

// Create subcategory
router.post('/admin/subcategories', protect, authorize('admin'), (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err);
      return res.status(400).json({
        success: false,
        message: 'File upload error: ' + err.message
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    console.log('📝 Creating subcategory...');
    console.log('📋 Request body:', req.body);
    console.log('📸 File info:', req.file ? {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      public_id: req.file.public_id,
      url: req.file.secure_url
    } : 'No file uploaded');

    const { 
      name, nameAr, nameFr, 
      description, descriptionAr, descriptionFr, 
      category, sortOrder,
      tags 
    } = req.body;

    // Parse tags from comma-separated string (all languages mixed)
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    // Check if subcategory already exists in this category
    const existingSubCategory = await SubCategory.findOne({
      category,
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, 'i') } },
        { nameAr: { $regex: new RegExp(`^${nameAr}$`, 'i') } },
        { nameFr: { $regex: new RegExp(`^${nameFr}$`, 'i') } }
      ]
    });

    if (existingSubCategory) {
      return res.status(400).json({
        success: false,
        message: 'SubCategory with this name already exists in this category'
      });
    }

    const subcategoryData = {
      name,
      nameAr,
      nameFr,
      description,
      descriptionAr,
      descriptionFr,
      category,
      tags: tagsArray,
      sortOrder: sortOrder || 0
    };

    if (req.file) {
      console.log('📸 File received:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        public_id: req.file.public_id,
        url: req.file.secure_url,
        path: req.file.path,
        buffer: req.file.buffer ? 'Buffer present' : 'No buffer'
      });
      
      if (req.file.public_id && req.file.secure_url) {
        subcategoryData.image = {
          public_id: req.file.public_id,
          url: req.file.secure_url
        };
        console.log('✅ Image uploaded successfully:', subcategoryData.image);
      } else {
        console.log('⚠️ Cloudinary upload failed - missing public_id or url');
        console.log('File object:', JSON.stringify(req.file, null, 2));
        
        // Try manual upload as fallback
        try {
          const uploadResult = await cloudinary.uploader.upload(req.file.path || req.file.buffer, {
            folder: 'atlas-ecom/subcategories',
            public_id: `subcategory-${Date.now()}`,
            transformation: [{ width: 500, height: 500, crop: 'limit' }]
          });
          
          subcategoryData.image = {
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url
          };
          console.log('✅ Manual upload successful:', subcategoryData.image);
        } catch (manualError) {
          console.log('❌ Manual upload also failed:', manualError.message);
          subcategoryData.image = {
            public_id: 'default-subcategory',
            url: `https://picsum.photos/500/500?random=${Date.now()}`
          };
        }
      }
    } else {
      console.log('⚠️ No image provided, using default');
      subcategoryData.image = {
        public_id: 'default-subcategory',
        url: `https://picsum.photos/500/500?random=${Date.now()}`
      };
    }

    const subcategory = await SubCategory.create(subcategoryData);
    console.log('✅ Subcategory created:', subcategory._id);

    // Add subcategory to category's subcategories array
    await Category.findByIdAndUpdate(category, {
      $push: { subcategories: subcategory._id }
    });

    res.status(201).json({
      success: true,
      message: 'SubCategory created successfully',
      subcategory
    });
  } catch (error) {
    console.error('❌ Error creating subcategory:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating subcategory',
      error: error.message
    });
  }
});

// Update subcategory
router.put('/admin/subcategories/:id', protect, authorize('admin'), (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err);
      return res.status(400).json({
        success: false,
        message: 'File upload error: ' + err.message
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { 
      name, nameAr, nameFr, 
      description, descriptionAr, descriptionFr, 
      category, sortOrder, isActive,
      tags 
    } = req.body;
    const subcategoryId = req.params.id;

    const subcategory = await SubCategory.findById(subcategoryId);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'SubCategory not found'
      });
    }

    // Parse tags from comma-separated string (all languages mixed)
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : subcategory.tags || [];

    // Check if name conflicts with other subcategories in the same category
    const existingSubCategory = await SubCategory.findOne({
      _id: { $ne: subcategoryId },
      category,
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, 'i') } },
        { nameAr: { $regex: new RegExp(`^${nameAr}$`, 'i') } },
        { nameFr: { $regex: new RegExp(`^${nameFr}$`, 'i') } }
      ]
    });

    if (existingSubCategory) {
      return res.status(400).json({
        success: false,
        message: 'SubCategory with this name already exists in this category'
      });
    }

    const updateData = {
      name,
      nameAr,
      nameFr,
      description,
      descriptionAr,
      descriptionFr,
      category,
      tags: tagsArray,
      sortOrder: sortOrder || subcategory.sortOrder,
      isActive: isActive !== undefined ? isActive : subcategory.isActive
    };

    if (req.file) {
      console.log('📸 File received for subcategory update:', {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        public_id: req.file.public_id,
        url: req.file.secure_url,
        path: req.file.path,
        buffer: req.file.buffer ? 'Buffer present' : 'No buffer'
      });
      
      // Delete old image from Cloudinary
      if (subcategory.image.public_id) {
        try {
          await cloudinary.uploader.destroy(subcategory.image.public_id);
          console.log('✅ Old subcategory image deleted:', subcategory.image.public_id);
        } catch (error) {
          console.log('⚠️ Could not delete old subcategory image:', error.message);
        }
      }
      
      if (req.file.public_id && req.file.secure_url) {
        updateData.image = {
          public_id: req.file.public_id,
          url: req.file.secure_url
        };
        console.log('✅ Subcategory image updated successfully:', updateData.image);
      } else {
        console.log('⚠️ Cloudinary upload failed - missing public_id or url');
        console.log('File object:', JSON.stringify(req.file, null, 2));
        
        // Try manual upload as fallback
        try {
          const uploadResult = await cloudinary.uploader.upload(req.file.path || req.file.buffer, {
            folder: 'atlas-ecom/subcategories',
            public_id: `subcategory-${Date.now()}`,
            transformation: [{ width: 500, height: 500, crop: 'limit' }]
          });
          
          updateData.image = {
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url
          };
          console.log('✅ Manual subcategory upload successful:', updateData.image);
        } catch (manualError) {
          console.log('❌ Manual subcategory upload also failed:', manualError.message);
          // Keep existing image if upload fails
          console.log('⚠️ Keeping existing subcategory image due to upload failure');
        }
      }
    }

    const updatedSubCategory = await SubCategory.findByIdAndUpdate(subcategoryId, updateData, { new: true });

    res.json({
      success: true,
      message: 'SubCategory updated successfully',
      subcategory: updatedSubCategory
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating subcategory',
      error: error.message
    });
  }
});

// Delete subcategory
router.delete('/admin/subcategories/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const subcategoryId = req.params.id;

    const subcategory = await SubCategory.findById(subcategoryId);
    if (!subcategory) {
      return res.status(404).json({
        success: false,
        message: 'SubCategory not found'
      });
    }

    console.log(`🗑️ Deleting subcategory: ${subcategory.name}`);

    // Delete image from Cloudinary
    if (subcategory.image && subcategory.image.public_id) {
      try {
        await cloudinary.uploader.destroy(subcategory.image.public_id);
        console.log(`✅ Deleted subcategory image: ${subcategory.image.public_id}`);
      } catch (error) {
        console.log(`⚠️ Could not delete subcategory image: ${error.message}`);
      }
    }

    // Remove subcategory from category's subcategories array
    await Category.findByIdAndUpdate(subcategory.category, {
      $pull: { subcategories: subcategoryId }
    });
    console.log(`✅ Removed subcategory from category's subcategories array`);

    // Delete subcategory from database
    await SubCategory.findByIdAndDelete(subcategoryId);
    console.log(`✅ Deleted subcategory: ${subcategoryId}`);

    res.json({
      success: true,
      message: 'SubCategory deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting subcategory:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting subcategory',
      error: error.message
    });
  }
});

module.exports = router;
