const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Shop = require('../models/Shop');
const User = require('../models/User');
const { protect, authorize, checkOwnership } = require('../middleware/auth');

const router = express.Router();

// Function to automatically delete expired events
const deleteExpiredEvents = async () => {
  try {
    const now = new Date();
    const Event = require('../models/Event');
    const expiredEvents = await Event.find({
      Finish_Date: { $lt: now },
      isActive: true
    });

    if (expiredEvents.length > 0) {
      console.log(`Found ${expiredEvents.length} expired events to delete`);
      
      // Delete expired events
      const deleteResult = await Event.deleteMany({
        Finish_Date: { $lt: now },
        isActive: true
      });

      console.log(`Successfully deleted ${deleteResult.deletedCount} expired events`);
      return deleteResult.deletedCount;
    }
    return 0;
  } catch (error) {
    console.error('Error deleting expired events:', error);
    return 0;
  }
};

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = './uploads/shops';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// @desc    Create shop (for existing sellers)
// @route   POST /api/shops
// @access  Private (Seller)
router.post('/', protect, authorize('seller'), upload.single('image'), [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Shop name must be between 2 and 50 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('address').notEmpty().withMessage('Address is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('zipCode').isNumeric().withMessage('Zip code must be numeric')
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

    const { name, description, address, phoneNumber, zipCode, telegram } = req.body;

    // Check if user already has a shop
    const existingShop = await Shop.findOne({ owner: req.user._id });
    if (existingShop) {
      return res.status(400).json({
        success: false,
        message: 'You already have a shop'
      });
    }

    // Prepare shop data
    const shopData = {
      name,
      description,
      address,
      phoneNumber,
      zipCode: parseInt(zipCode),
      telegram,
      owner: req.user._id
    };

    // Add banner if uploaded
    if (req.file) {
      shopData.banner = {
        public_id: req.file.filename,
        url: `https://${req.get('host')}/uploads/shops/${req.file.filename}`
      };
    }

    // Create shop
    const shop = await Shop.create(shopData);

    // Update user with shop reference
    await User.findByIdAndUpdate(req.user._id, { shop: shop._id });

    // Populate shop owner
    await shop.populate('owner', 'name email');

    res.status(201).json({
      success: true,
      message: 'Shop created successfully',
      shop
    });
  } catch (error) {
    console.error('Create shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating shop',
      error: error.message
    });
  }
});

// @desc    Become a seller and create shop
// @route   POST /api/shops/become-seller
// @access  Private (User)
router.post('/become-seller', protect, upload.single('image'), [
  body('name').trim().isLength({ min: 2, max: 50 }).withMessage('Shop name must be between 2 and 50 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('address').notEmpty().withMessage('Address is required'),
  body('phoneNumber').notEmpty().withMessage('Phone number is required'),
  body('zipCode').isNumeric().withMessage('Zip code must be numeric')
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

    const { name, description, address, phoneNumber, zipCode, telegram } = req.body;

    // Check if user already has a shop
    const existingShop = await Shop.findOne({ owner: req.user._id });
    if (existingShop) {
      return res.status(400).json({
        success: false,
        message: 'You already have a shop'
      });
    }

    // Check if user is already a seller
    if (req.user.role === 'seller') {
      return res.status(400).json({
        success: false,
        message: 'You are already a seller'
      });
    }

    // Prepare shop data
    const shopData = {
      name,
      description,
      address,
      phoneNumber,
      zipCode: parseInt(zipCode),
      telegram,
      owner: req.user._id,
      isApproved: false // New shops need approval
    };

    // Add banner if uploaded
    if (req.file) {
      shopData.banner = {
        public_id: req.file.filename,
        url: `https://${req.get('host')}/uploads/shops/${req.file.filename}`
      };
    }

    // Create shop
    const shop = await Shop.create(shopData);

    // Update user role to seller and add shop reference
    await User.findByIdAndUpdate(req.user._id, { 
      role: 'seller',
      shop: shop._id 
    });

    // Populate shop owner
    await shop.populate('owner', 'name email');

    res.status(201).json({
      success: true,
      message: 'Shop created successfully! You are now a seller. Your shop is pending approval.',
      shop,
      userRole: 'seller'
    });
  } catch (error) {
    console.error('Become seller error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating shop',
      error: error.message
    });
  }
});

// @desc    Get all shops
// @route   GET /api/shops
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    
    const query = { isApproved: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const shops = await Shop.find(query)
      .populate('owner', 'name email avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Shop.countDocuments(query);

    res.json({
      success: true,
      shops,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get shops error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shops',
      error: error.message
    });
  }
});

// @desc    Get shop by ID
// @route   GET /api/shops/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id)
      .populate('owner', 'name email avatar');

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    res.json({
      success: true,
      shop
    });
  } catch (error) {
    console.error('Get shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shop',
      error: error.message
    });
  }
});

// @desc    Update shop
// @route   PUT /api/shops/:id
// @access  Private (Shop owner or Admin)
router.put('/:id', protect, upload.single('image'), [
  body('name').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Shop name must be between 2 and 50 characters'),
  body('description').optional().isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  body('address').optional().notEmpty().withMessage('Address is required'),
  body('phoneNumber').optional().notEmpty().withMessage('Phone number is required'),
  body('zipCode').optional().isNumeric().withMessage('Zip code must be numeric')
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

    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Check ownership
    if (shop.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this shop'
      });
    }

    const updateData = { ...req.body };
    if (updateData.zipCode) {
      updateData.zipCode = parseInt(updateData.zipCode);
    }

    // Add banner if uploaded
    if (req.file) {
      updateData.banner = {
        public_id: req.file.filename,
        url: `https://${req.get('host')}/uploads/shops/${req.file.filename}`
      };
    }

    const updatedShop = await Shop.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('owner', 'name email');

    res.json({
      success: true,
      message: 'Shop updated successfully',
      shop: updatedShop
    });
  } catch (error) {
    console.error('Update shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating shop',
      error: error.message
    });
  }
});

// @desc    Get shop products
// @route   GET /api/shops/:id/products
// @access  Public
router.get('/:id/products', async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    
    const query = { shop: req.params.id, isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const products = await require('../models/Product').find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await require('../models/Product').countDocuments(query);

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get shop products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shop products',
      error: error.message
    });
  }
});

// @desc    Get shop events
// @route   GET /api/shops/:id/events
// @access  Public
router.get('/:id/events', async (req, res) => {
  try {
    // First, automatically delete expired events
    const deletedCount = await deleteExpiredEvents();
    if (deletedCount > 0) {
      console.log(`Automatically deleted ${deletedCount} expired events`);
    }

    const { page = 1, limit = 10, status } = req.query;
    
    const query = { shop: req.params.id, isActive: true };
    
    if (status) {
      query.status = status;
    }

    const events = await require('../models/Event').find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ start_Date: 1 });

    const total = await require('../models/Event').countDocuments(query);

    res.json({
      success: true,
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      deletedExpiredEvents: deletedCount
    });
  } catch (error) {
    console.error('Get shop events error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shop events',
      error: error.message
    });
  }
});

// @desc    Get seller information (for current user)
// @route   GET /shop/getSeller
// @access  Private (Seller)
router.get('/shop/getSeller', protect, async (req, res) => {
  try {
    // Check if user has a shop
    if (!req.user.shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found for this user'
      });
    }

    // Get shop details
    const shop = await Shop.findById(req.user.shop);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Get user with shop populated
    const user = await User.findById(req.user._id).populate('shop');
    
    res.json({
      success: true,
      seller: user
    });
  } catch (error) {
    console.error('Get seller error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching seller information',
      error: error.message
    });
  }
});

// @desc    Get seller dashboard statistics
// @route   GET /shop/dashboard/stats
// @access  Private (Seller)
router.get('/shop/dashboard/stats', protect, async (req, res) => {
  try {
    // Check if user has a shop
    if (!req.user.shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found for this user'
      });
    }

    const shopId = req.user.shop;

    // Get products count
    const Product = require('../models/Product');
    const totalProducts = await Product.countDocuments({ shop: shopId, isActive: true });
    const lowStockProducts = await Product.countDocuments({ 
      shop: shopId, 
      isActive: true, 
      stock: { $lt: 10 } 
    });

    // Get events count
    const Event = require('../models/Event');
    const totalEvents = await Event.countDocuments({ shop: shopId, isActive: true });
    const activeEvents = await Event.countDocuments({ 
      shop: shopId, 
      isActive: true, 
      start_Date: { $gte: new Date() } 
    });

    // Get orders count (if Order model exists)
    let totalOrders = 0;
    let pendingOrders = 0;
    try {
      const Order = require('../models/Order');
      totalOrders = await Order.countDocuments({ shop: shopId });
      pendingOrders = await Order.countDocuments({ 
        shop: shopId, 
        status: { $in: ['Processing', 'Pending'] } 
      });
    } catch (error) {
      // Order model might not exist yet
      console.log('Order model not available for dashboard stats');
    }

    res.json({
      success: true,
      stats: {
        totalProducts,
        lowStockProducts,
        totalEvents,
        activeEvents,
        totalOrders,
        pendingOrders
      }
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard statistics',
      error: error.message
    });
  }
});

// @desc    Get seller's shop information
// @route   GET /shop/my-shop
// @access  Private (Seller)
router.get('/shop/my-shop', protect, async (req, res) => {
  try {
    // Check if user has a shop
    if (!req.user.shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found for this user'
      });
    }

    // Get shop details with owner populated
    const shop = await Shop.findById(req.user.shop).populate('owner', 'name email');
    
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    res.json({
      success: true,
      shop
    });
  } catch (error) {
    console.error('Get my shop error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shop information',
      error: error.message
    });
  }
});

module.exports = router;
