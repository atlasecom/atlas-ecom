const express = require('express');
const { body, validationResult } = require('express-validator');
const path = require('path');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const { protect, authorize, checkOwnership } = require('../middleware/auth');
const { upload } = require('../config/cloudinary');
const { getImageUrlFromFile } = require('../utils/imageUtils');

const router = express.Router();

// @desc    Track WhatsApp/Telegram clicks for products
// @route   POST /api/products/:id/track-click
// @access  Public
router.post('/:id/track-click', async (req, res) => {
  try {
    const { type } = req.body; // 'whatsapp' or 'telegram'
    
    if (!type || !['whatsapp', 'telegram'].includes(type)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid click type. Must be "whatsapp" or "telegram"' 
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Initialize click tracking if not exists
    if (!product.clickTracking) {
      product.clickTracking = {
        whatsapp: 0,
        telegram: 0,
        total: 0
      };
    }

    // Increment click count in nested clickTracking object
    product.clickTracking[type]++;
    product.clickTracking.total++;
    
    // Also increment the top-level fields for analytics
    if (type === 'whatsapp') {
      product.whatsappClicks = (product.whatsappClicks || 0) + 1;
    } else if (type === 'telegram') {
      product.telegramClicks = (product.telegramClicks || 0) + 1;
    }

    // Check if boost clicks are exhausted
    if (product.isBoosted && product.boostClicksRemaining) {
      product.boostClicksRemaining--;
      
      // If clicks exhausted, remove boost
      if (product.boostClicksRemaining <= 0) {
        product.isBoosted = false;
        product.boostPriority = 0;
        product.boostExpiresAt = null;
        product.boostClicksRemaining = 0;
      }
    }

    await product.save();

    res.json({ 
      success: true, 
      message: 'Click tracked successfully',
      clicksRemaining: product.boostClicksRemaining || 0,
      isBoosted: product.isBoosted
    });

  } catch (error) {
    console.error('Error tracking click:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Debug endpoint to check product images
router.get('/debug/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    
    res.json({
      success: true,
      product: {
        name: product.name,
        images: product.images
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// @desc    Create product
// @route   POST /api/products/:shopId
// @access  Private (Shop owner)
router.post('/:shopId', protect, authorize('seller'), upload.array('images', 10), [
  body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
  body('description').isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('category').notEmpty().withMessage('Please select a category'),
  body('subcategory').notEmpty().withMessage('Please select a subcategory'),
  body('originalPrice').isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
  body('discountPrice').isFloat({ min: 0 }).withMessage('Discount price must be a positive number'),
  body('stock').isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('minOrderQuantity').isInt({ min: 1 }).withMessage('Minimum order quantity must be at least 1')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { shopId } = req.params;
    const { name, description, category, subcategory, originalPrice, discountPrice, stock, minOrderQuantity } = req.body;

    // Check if shop exists and user owns it
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    if (shop.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to create products for this shop'
      });
    }

    // Check if images were uploaded
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'At least one product image is required'
      });
    }

    // Check if shop has approved product (first product needs approval)
    const needsApproval = !shop.hasApprovedProduct;
    
    // Prepare product data
    const productData = {
      name,
      description,
      category,
      subcategory,
      originalPrice: parseFloat(originalPrice),
      discountPrice: parseFloat(discountPrice),
      stock: parseInt(stock),
      minOrderQuantity: parseInt(minOrderQuantity),
      shop: shopId,
      isApproved: !needsApproval, // Auto-approve if shop has approved product
      approvalStatus: needsApproval ? 'pending' : 'approved',
      approvedAt: needsApproval ? undefined : new Date()
    };

    // Add images (Cloudinary or local storage)
    productData.images = req.files.map(file => {
      console.log('🔍 Processing file in product creation:', {
        public_id: file.public_id,
        secure_url: file.secure_url,
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype
      });
      
      const imageUrl = getImageUrlFromFile(req, file, 'products');
      console.log('🔍 Generated image URL:', imageUrl);
      
      return {
        public_id: file.public_id || file.filename,
        url: imageUrl
      };
    });

    // Create product
    const product = await Product.create(productData);

    // Populate shop information
    await product.populate('shop', 'name avatar phoneNumber telegram');

    res.status(201).json({
      success: true,
      message: needsApproval 
        ? 'Product created successfully! It is pending admin approval.' 
        : 'Product created successfully!',
      product,
      needsApproval
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

// @desc    Get all products
// @route   GET /api/products
// @access  Public
router.get('/', async (req, res) => {
  try {
    const SubCategory = require('../models/SubCategory');
    const { page = 1, limit = 12, category, search, minPrice, maxPrice, selectedSeller, sortBy = 'createdAt', order = 'desc' } = req.query;
    
    const query = { 
      isActive: true, 
      isApproved: true
    }; // Only show approved products
    
    if (category) {
      query.category = category;
    }
    
    if (selectedSeller) {
      query.shop = selectedSeller;
    }
    
    if (search) {
      // Search in product name, description, tags, and subcategory tags
      const searchRegex = new RegExp(search, 'i');
      
      // Find subcategories that have matching tags
      const matchingSubcategories = await SubCategory.find({
        tags: searchRegex
      }).select('_id');
      
      const subcategoryIds = matchingSubcategories.map(sub => sub._id);
      
      // Search in product fields OR in matching subcategories
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { searchTags: searchRegex },
        { subcategory: { $in: subcategoryIds } }
      ];
    }
    
    if (minPrice || maxPrice) {
      query.discountPrice = {};
      if (minPrice) query.discountPrice.$gte = parseFloat(minPrice);
      if (maxPrice) query.discountPrice.$lte = parseFloat(maxPrice);
    }

    const sortOptions = {};
    sortOptions[sortBy] = order === 'desc' ? -1 : 1;

    // Get all products first to implement dynamic sorting
    const allProducts = await Product.find(query)
      .populate('shop', 'name avatar phoneNumber telegram verifiedBadge')
      .populate('category', 'name nameAr nameFr image')
      .populate('subcategory', 'name nameAr nameFr image tags');

    // Filter out products with null shops
    const validProducts = allProducts.filter(product => product.shop != null);

    // Separate boosted and normal products
    const boostedProducts = validProducts.filter(product => product.isBoosted);
    const normalProducts = validProducts.filter(product => !product.isBoosted);

    // Sort boosted products by priority (highest first)
    boostedProducts.sort((a, b) => {
      if (a.boostPriority !== b.boostPriority) {
        return b.boostPriority - a.boostPriority;
      }
      // If same priority, sort by original criteria
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      if (order === 'desc') {
        return bValue > aValue ? 1 : -1;
      } else {
        return aValue > bValue ? 1 : -1;
      }
    });

    // Sort normal products randomly for dynamic ordering using Fisher-Yates shuffle
    for (let i = normalProducts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [normalProducts[i], normalProducts[j]] = [normalProducts[j], normalProducts[i]];
    }

    // Combine: boosted first, then normal products
    const sortedProducts = [...boostedProducts, ...normalProducts];

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const products = sortedProducts.slice(startIndex, endIndex);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// @desc    Search products by name, tags, or category
// @route   GET /api/products/search
// @access  Public
router.get('/search', async (req, res) => {
  try {
    const SubCategory = require('../models/SubCategory');
    const { term, category, limit = 10 } = req.query;
    
    if (!term && !category) {
      return res.status(400).json({
        success: false,
        message: 'Search term or category is required'
      });
    }

    const query = { isActive: true, isApproved: true }; // Only show approved products
    
    // If search term is provided, search in name, description, tags, and subcategory tags
    if (term) {
      const searchRegex = new RegExp(term, 'i');
      
      // Find subcategories that have matching tags
      const matchingSubcategories = await SubCategory.find({
        tags: searchRegex
      }).select('_id');
      
      const subcategoryIds = matchingSubcategories.map(sub => sub._id);
      
      // Search in product fields OR in matching subcategories
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { searchTags: searchRegex },
        { subcategory: { $in: subcategoryIds } }
      ];
    }
    
    // If category is provided, filter by category
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate('shop', 'name avatar phoneNumber telegram')
      .populate('category', 'name nameAr nameFr image')
      .populate('subcategory', 'name nameAr nameFr image tags')
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products,
      total: products.length
    });
  } catch (error) {
    console.error('Search products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
});

// @desc    Get product by ID
// @route   GET /api/products/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('shop', 'name avatar description address phoneNumber')
      .populate('category', 'name nameAr nameFr image')
      .populate('subcategory', 'name nameAr nameFr image')
      .populate('reviews.user', 'name avatar');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      product
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Product owner or Admin)
router.put('/:id', protect, upload.array('images', 10), [
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Product name must be between 2 and 100 characters'),
  body('description').optional().isLength({ min: 10, max: 2000 }).withMessage('Description must be between 10 and 2000 characters'),
  body('category').optional().isMongoId().withMessage('Please select a valid category'),
  body('subcategory').optional().isMongoId().withMessage('Please select a valid subcategory'),
  body('originalPrice').optional().isFloat({ min: 0 }).withMessage('Original price must be a positive number'),
  body('discountPrice').optional().isFloat({ min: 0 }).withMessage('Discount price must be a positive number'),
  body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be a non-negative integer'),
  body('minOrderQuantity').optional().isInt({ min: 1 }).withMessage('Minimum order quantity must be at least 1')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.shop.toString() !== req.user.shop?._id?.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this product'
      });
    }

    const updateData = { ...req.body };
    
    // Convert numeric fields
    if (updateData.originalPrice) updateData.originalPrice = parseFloat(updateData.originalPrice);
    if (updateData.discountPrice) updateData.discountPrice = parseFloat(updateData.discountPrice);
    if (updateData.stock) updateData.stock = parseInt(updateData.stock);
    if (updateData.minOrderQuantity) updateData.minOrderQuantity = parseInt(updateData.minOrderQuantity);

    // Handle image updates
    console.log('🔍 Image update debug:', {
      hasFiles: req.files && req.files.length > 0,
      filesCount: req.files ? req.files.length : 0,
      hasImagesToKeep: !!updateData.imagesToKeep,
      imagesToKeepValue: updateData.imagesToKeep,
      currentImagesCount: product.images ? product.images.length : 0
    });

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => ({
        public_id: file.public_id || file.filename,
        url: getImageUrlFromFile(req, file, 'products')
      }));
      
      console.log('🔍 New images to add:', newImages);
      
      // If imagesToKeep is provided, use it; otherwise keep all existing images and add new ones
      if (updateData.imagesToKeep) {
        try {
          const imagesToKeep = JSON.parse(updateData.imagesToKeep);
          console.log('🔍 Images to keep:', imagesToKeep);
          
          const existingImages = (product.images || []).filter(img => 
            imagesToKeep.some(keepImg => keepImg.public_id === img.public_id)
          );
          
          console.log('🔍 Filtered existing images:', existingImages);
          updateData.images = [...existingImages, ...newImages];
        } catch (error) {
          console.error('Error parsing imagesToKeep:', error);
          // Fallback: keep all existing images and add new ones
          updateData.images = [...(product.images || []), ...newImages];
        }
      } else {
        // Keep all existing images and add new ones
        updateData.images = [...(product.images || []), ...newImages];
      }
    } else if (updateData.imagesToKeep) {
      // No new images uploaded, but images were removed
      try {
        const imagesToKeep = JSON.parse(updateData.imagesToKeep);
        console.log('🔍 No new files, images to keep:', imagesToKeep);
        
        const existingImages = (product.images || []).filter(img => 
          imagesToKeep.some(keepImg => keepImg.public_id === img.public_id)
        );
        
        console.log('🔍 Final images after removal:', existingImages);
        updateData.images = existingImages;
      } catch (error) {
        console.error('Error parsing imagesToKeep:', error);
        // Keep existing images if parsing fails
        updateData.images = product.images || [];
      }
    } else {
      // No new images and no imagesToKeep - keep existing images
      console.log('🔍 No image changes, keeping existing images');
      updateData.images = product.images || [];
    }
    
    console.log('🔍 Final updateData.images:', updateData.images);
    
    // Remove imagesToKeep from updateData as it's not a product field
    delete updateData.imagesToKeep;

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('shop', 'name avatar phoneNumber telegram')
     .populate('category', 'name nameAr nameFr image')
     .populate('subcategory', 'name nameAr nameFr image');

    res.json({
      success: true,
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Product owner or Admin)
router.delete('/:id', protect, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check ownership
    if (product.shop.toString() !== req.user.shop?._id?.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this product'
      });
    }

    // Hard delete - remove from database
    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
});

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private (Authenticated users)
router.post('/:id/reviews', protect, [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').trim().isLength({ min: 10, max: 500 }).withMessage('Comment must be between 10 and 500 characters')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check if user already reviewed this product
    const existingReview = product.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Add review
    product.reviews.push({
      user: req.user._id,
      rating: parseInt(rating),
      comment
    });

    await product.save();

    // Populate review user info
    await product.populate('reviews.user', 'name avatar');

    res.json({
      success: true,
      message: 'Review added successfully',
      product
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding review',
      error: error.message
    });
  }
});

// @desc    Track product view
// @route   POST /api/products/:id/view
// @access  Public
router.post('/:id/view', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment view count
    product.viewCount = (product.viewCount || 0) + 1;
    await product.save();

    res.json({
      success: true,
      message: 'View tracked successfully'
    });
  } catch (error) {
    console.error('Track view error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking view',
      error: error.message
    });
  }
});

// @desc    Track WhatsApp click
// @route   POST /api/products/:id/whatsapp-click
// @access  Public
router.post('/:id/whatsapp-click', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment WhatsApp clicks
    product.whatsappClicks = (product.whatsappClicks || 0) + 1;
    await product.save();

    res.json({
      success: true,
      message: 'WhatsApp click tracked successfully'
    });
  } catch (error) {
    console.error('Track WhatsApp click error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking WhatsApp click',
      error: error.message
    });
  }
});

// @desc    Track product favorite
// @route   POST /api/products/:id/favorite
// @access  Public
router.post('/:id/favorite', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Increment favorites count
    product.favoritesCount = (product.favoritesCount || 0) + 1;
    await product.save();

    res.json({
      success: true,
      message: 'Favorite tracked successfully'
    });
  } catch (error) {
    console.error('Track favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Error tracking favorite',
      error: error.message
    });
  }
});

module.exports = router;
