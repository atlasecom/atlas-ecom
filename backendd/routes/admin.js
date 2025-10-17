const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Event = require('../models/Event');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');

// @desc    Get all sellers
// @route   GET /api/admin/sellers
// @access  Private/Admin
router.get('/sellers', protect, authorize('admin'), async (req, res) => {
  try {
    const sellers = await User.find({ role: 'seller' })
      .populate('shop')
      .select('-password')
      .sort({ createdAt: -1 });

    console.log('📊 GET /sellers - Found sellers:', sellers.length);
    console.log('📊 Sellers approval status:', sellers.map(s => ({
      id: s._id,
      name: s.name,
      isApproved: s.isApproved,
      shopApproved: s.shop?.isApproved
    })));

    // Filter out sellers with null shop references and format the response
    const formattedSellers = sellers.map(seller => ({
      _id: seller._id,
      name: seller.name,
      email: seller.email,
      role: seller.role,
      phoneNumber: seller.phoneNumber,
      address: seller.address,
      avatar: seller.avatar,
      isApproved: seller.isApproved,
      isVerified: seller.isVerified,
      createdAt: seller.createdAt,
      shop: seller.shop || null
    }));

    res.json({
      success: true,
      sellers: formattedSellers
    });
  } catch (error) {
    console.error('Get sellers error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sellers',
      error: error.message
    });
  }
});

// @desc    Approve seller
// @route   POST /api/admin/sellers/:id/approve
// @access  Private/Admin
router.post('/sellers/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const seller = await User.findById(req.params.id).populate('shop');
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    if (seller.role !== 'seller') {
      return res.status(400).json({
        success: false,
        message: 'User is not a seller'
      });
    }

    // Approve the seller user
    seller.isApproved = true;
    await seller.save();

    // Approve the seller's shop if it exists
    if (seller.shop) {
      await Shop.findByIdAndUpdate(seller.shop._id, {
        isApproved: true
      });
      console.log(`✅ Shop approved for seller: ${seller._id}`);
    }

    // Reload the complete seller with updated shop data
    const updatedSeller = await User.findById(seller._id).populate('shop');

    res.json({
      success: true,
      message: 'Seller approved successfully',
      seller: updatedSeller
    });
  } catch (error) {
    console.error('Approve seller error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving seller',
      error: error.message
    });
  }
});

// @desc    Reject seller
// @route   POST /api/admin/sellers/:id/reject
// @access  Private/Admin
router.post('/sellers/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const seller = await User.findById(req.params.id).populate('shop');
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    if (seller.role !== 'seller') {
      return res.status(400).json({
        success: false,
        message: 'User is not a seller'
      });
    }

    // Reject the seller user
    seller.isApproved = false;
    await seller.save();

    // Reject the seller's shop if it exists
    if (seller.shop) {
      await Shop.findByIdAndUpdate(seller.shop._id, {
        isApproved: false
      });
      console.log(`❌ Shop rejected for seller: ${seller._id}`);
    }

    // Reload the complete seller with updated shop data
    const updatedSeller = await User.findById(seller._id).populate('shop');

    res.json({
      success: true,
      message: 'Seller rejected successfully',
      seller: updatedSeller
    });
  } catch (error) {
    console.error('Reject seller error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting seller',
      error: error.message
    });
  }
});

// @desc    Delete seller
// @route   DELETE /api/admin/sellers/:id
// @access  Private/Admin
router.delete('/sellers/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const seller = await User.findById(req.params.id).populate('shop');
    
    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found'
      });
    }

    if (seller.role !== 'seller') {
      return res.status(400).json({
        success: false,
        message: 'User is not a seller'
      });
    }

    // Delete associated shop and all products/events if exists
    if (seller.shop) {
      const Product = require('../models/Product');
      const Event = require('../models/Event');
      
      // Delete all products associated with this shop
      const deletedProducts = await Product.deleteMany({ shop: seller.shop._id });
      console.log(`Admin deleted ${deletedProducts.deletedCount} products for seller:`, req.params.id);
      
      // Delete all events associated with this shop
      const deletedEvents = await Event.deleteMany({ shop: seller.shop._id });
      console.log(`Admin deleted ${deletedEvents.deletedCount} events for seller:`, req.params.id);
      
      // Delete the shop
      await Shop.findByIdAndDelete(seller.shop._id);
      console.log('Admin deleted shop for seller:', req.params.id);
    }

    // Delete seller
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Seller deleted successfully'
    });
  } catch (error) {
    console.error('Delete seller error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting seller',
      error: error.message
    });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const users = await User.find()
      .populate('shop')
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If user is a seller, delete associated shop and products
    if (user.role === 'seller' && user.shop) {
      // Delete all products from this shop
      await Product.deleteMany({ shop: user.shop });
      
      // Delete all events from this shop
      await Event.deleteMany({ shop: user.shop });
      
      // Delete the shop
      await Shop.findByIdAndDelete(user.shop);
    }

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// @desc    Create admin account
// @route   POST /api/admin/create-admin
// @access  Private/Admin
router.post('/create-admin', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role = 'admin' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }

    // Create new admin user
    const admin = new User({
      name,
      email,
      password,
      role,
      isApproved: true,
      isVerified: true
    });

    await admin.save();

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating admin account',
      error: error.message
    });
  }
});

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
router.get('/analytics', protect, authorize('admin'), async (req, res) => {
  try {
    // Get counts
    const totalUsers = await User.countDocuments();
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalProducts = await Product.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalShops = await Shop.countDocuments();

    // Get products with analytics data
    const productsWithAnalytics = await Product.find({}, 'name viewCount whatsappClicks favoritesCount')
      .sort({ viewCount: -1 })
      .limit(10);

    // Get events with analytics data
    const eventsWithAnalytics = await Event.find({}, 'name viewCount whatsappClicks favoritesCount')
      .sort({ viewCount: -1 })
      .limit(10);

    // Get top sellers by product count
    const topSellers = await User.aggregate([
      { $match: { role: 'seller' } },
      { $lookup: { from: 'products', localField: '_id', foreignField: 'shop', as: 'products' } },
      { $lookup: { from: 'shops', localField: '_id', foreignField: 'owner', as: 'shop' } },
      { $addFields: { productCount: { $size: '$products' } } },
      { $sort: { productCount: -1 } },
      { $limit: 10 },
      { $project: { name: 1, email: 1, productCount: 1, shop: { $arrayElemAt: ['$shop', 0] } } }
    ]);

    res.json({
      success: true,
      analytics: {
        counts: {
          totalUsers,
          totalSellers,
          totalProducts,
          totalEvents,
          totalShops
        },
        topProducts: productsWithAnalytics,
        topEvents: eventsWithAnalytics,
        topSellers
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

// @desc    Approve product
// @route   POST /api/admin/products/:id/approve
// @access  Private/Admin
router.post('/products/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const Product = require('../models/Product');
    const Shop = require('../models/Shop');
    
    const product = await Product.findById(req.params.id).populate('shop');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update product approval status
    product.isApproved = true;
    product.approvalStatus = 'approved';
    product.approvedBy = req.user._id;
    product.approvedAt = new Date();
    product.rejectionReason = ''; // Clear any previous rejection reason
    await product.save();

    // Update shop's hasApprovedProduct flag (first product approval)
    if (!product.shop.hasApprovedProduct) {
      await Shop.findByIdAndUpdate(product.shop._id, {
        hasApprovedProduct: true
      });
    }

    res.json({
      success: true,
      message: 'Product approved successfully',
      product
    });
  } catch (error) {
    console.error('Approve product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving product',
      error: error.message
    });
  }
});

// @desc    Reject product
// @route   POST /api/admin/products/:id/reject
// @access  Private/Admin
router.post('/products/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const Product = require('../models/Product');
    const { reason } = req.body;
    
    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rejection reason'
      });
    }

    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Update product approval status
    product.isApproved = false;
    product.approvalStatus = 'rejected';
    product.rejectionReason = reason;
    product.approvedBy = req.user._id;
    product.approvedAt = undefined;
    await product.save();

    res.json({
      success: true,
      message: 'Product rejected successfully',
      product
    });
  } catch (error) {
    console.error('Reject product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting product',
      error: error.message
    });
  }
});

// @desc    Get all products (including pending approval)
// @route   GET /api/admin/products
// @access  Private/Admin
router.get('/products', protect, authorize('admin'), async (req, res) => {
  try {
    const Product = require('../models/Product');
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    // Filter by approval status
    if (status) {
      query.approvalStatus = status;
    }
    
    const products = await Product.find(query)
      .populate('shop', 'name owner verifiedBadge')
      .populate('category', 'name nameAr nameFr image')
      .populate('subcategory', 'name nameAr nameFr image tags')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get admin products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// @desc    Get all events for admin
// @route   GET /api/admin/events
// @access  Private/Admin
router.get('/events', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};

    // Filter by approval status
    if (status) {
      query.approvalStatus = status;
    }

    const events = await Event.find(query)
      .populate('shop', 'name owner verifiedBadge')
      .populate('category', 'name nameAr nameFr image')
      .populate('subcategory', 'name nameAr nameFr image tags')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    res.json({
      success: true,
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching admin events:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch events', error: error.message });
  }
});

// @desc    Approve an event
// @route   POST /api/admin/events/:id/approve
// @access  Private/Admin
router.post('/events/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    event.approvalStatus = 'approved';
    event.isApproved = true;
    event.approvedBy = req.user.id;
    event.approvedAt = new Date();
    await event.save();

    res.json({
      success: true,
      message: 'Event approved successfully',
      event
    });
  } catch (error) {
    console.error('Error approving event:', error);
    res.status(500).json({ success: false, message: 'Failed to approve event', error: error.message });
  }
});

// @desc    Reject an event
// @route   POST /api/admin/events/:id/reject
// @access  Private/Admin
router.post('/events/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const { rejectionReason } = req.body;
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    event.approvalStatus = 'rejected';
    event.isApproved = false;
    event.rejectionReason = rejectionReason || '';
    event.approvedBy = req.user.id;
    event.approvedAt = new Date();
    await event.save();

    res.json({
      success: true,
      message: 'Event rejected successfully',
      event
    });
  } catch (error) {
    console.error('Error rejecting event:', error);
    res.status(500).json({ success: false, message: 'Failed to reject event', error: error.message });
  }
});

// @desc    Delete an event
// @route   DELETE /api/admin/events/:id
// @access  Private/Admin
router.delete('/events/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({ success: false, message: 'Failed to delete event', error: error.message });
  }
});

module.exports = router;
