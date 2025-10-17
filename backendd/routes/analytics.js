const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Product = require('../models/Product');
const Event = require('../models/Event');
const User = require('../models/User');
const Shop = require('../models/Shop');
const Category = require('../models/Category');

// Helper function to get time ago
const getTimeAgo = (date) => {
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 2592000)} months ago`;
};

// @desc    Get analytics data
// @route   GET /api/admin/analytics
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    // Get basic counts
    const totalProducts = await Product.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalUsers = await User.countDocuments({ role: 'user' });

    // Get wishlist statistics
    const usersWithWishlist = await User.find({ 
      wishlist: { $exists: true, $not: { $size: 0 } } 
    });
    const totalFavorites = usersWithWishlist.reduce((sum, user) => sum + user.wishlist.length, 0);

    // Get total views and WhatsApp clicks from products and events
    const productStats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$viewCount' },
          totalWhatsAppClicks: { $sum: '$whatsappClicks' }
        }
      }
    ]);

    const eventStats = await Event.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalViews: { $sum: '$viewCount' },
          totalWhatsAppClicks: { $sum: '$whatsappClicks' }
        }
      }
    ]);

    const totalViews = (productStats[0]?.totalViews || 0) + (eventStats[0]?.totalViews || 0);
    const totalWhatsAppClicks = (productStats[0]?.totalWhatsAppClicks || 0) + (eventStats[0]?.totalWhatsAppClicks || 0);

    // Get top products by real metrics
    const topProducts = await Product.find({ isActive: true })
      .populate('shop', 'name')
      .sort({ viewCount: -1, ratings: -1 })
      .limit(10)
      .select('name shop ratings images viewCount whatsappClicks');

    const topProductsWithFavorites = topProducts.map(product => ({
      ...product.toObject(),
      views: product.viewCount || 0,
      whatsappClicks: product.whatsappClicks || 0
    }));

    // Get top sellers by product count
    const topSellers = await User.aggregate([
      { $match: { role: 'seller' } },
      {
        $lookup: {
          from: 'shops',
          localField: 'shop',
          foreignField: '_id',
          as: 'shopData'
        }
      },
      {
        $lookup: {
          from: 'products',
          localField: 'shop',
          foreignField: 'shop',
          as: 'products'
        }
      },
      {
        $project: {
          name: 1,
          shop: { $arrayElemAt: ['$shopData', 0] },
          productsCount: { $size: '$products' }
        }
      },
      { $sort: { productsCount: -1 } },
      { $limit: 10 }
    ]);

    // Get top events by real metrics
    const topEvents = await Event.find({ isActive: true })
      .populate('shop', 'name')
      .sort({ viewCount: -1, ratings: -1 })
      .limit(10)
      .select('name shop ratings images start_Date Finish_Date viewCount whatsappClicks favoritesCount');

    // Get category statistics
    const categoryStats = await Category.aggregate([
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'category',
          as: 'products'
        }
      },
      {
        $project: {
          name: 1,
          nameAr: 1,
          nameFr: 1,
          productsCount: { $size: '$products' }
        }
      },
      { $sort: { productsCount: -1 } }
    ]);

    // Get monthly statistics (last 12 months)
    const monthlyStats = [];
    const currentDate = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const nextDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 1);
      
      const monthProducts = await Product.countDocuments({
        createdAt: { $gte: date, $lt: nextDate }
      });
      
      const monthEvents = await Event.countDocuments({
        createdAt: { $gte: date, $lt: nextDate }
      });
      
      const monthUsers = await User.countDocuments({
        createdAt: { $gte: date, $lt: nextDate }
      });

      // Get monthly engagement metrics
      const monthProductViews = await Product.aggregate([
        { $match: { createdAt: { $gte: date, $lt: nextDate } } },
        { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
      ]);

      const monthEventViews = await Event.aggregate([
        { $match: { createdAt: { $gte: date, $lt: nextDate } } },
        { $group: { _id: null, totalViews: { $sum: '$viewCount' } } }
      ]);

      const monthWhatsAppClicks = await Product.aggregate([
        { $match: { createdAt: { $gte: date, $lt: nextDate } } },
        { $group: { _id: null, totalClicks: { $sum: '$whatsappClicks' } } }
      ]);

      monthlyStats.push({
        month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        products: monthProducts,
        events: monthEvents,
        users: monthUsers,
        views: (monthProductViews[0]?.totalViews || 0) + (monthEventViews[0]?.totalViews || 0),
        whatsappClicks: monthWhatsAppClicks[0]?.totalClicks || 0
      });
    }

    // Get real recent activity from database
    const recentProducts = await Product.find({ isActive: true })
      .populate('shop', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name shop createdAt');

    const recentEvents = await Event.find({ isActive: true })
      .populate('shop', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name shop createdAt');

    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    const recentActivity = [
      ...recentProducts.map(product => ({
        type: 'product',
        description: `New product added: ${product.name}`,
        shop: product.shop?.name,
        timestamp: getTimeAgo(product.createdAt)
      })),
      ...recentEvents.map(event => ({
        type: 'event',
        description: `Event created: ${event.name}`,
        shop: event.shop?.name,
        timestamp: getTimeAgo(event.createdAt)
      })),
      ...recentUsers.map(user => ({
        type: 'user',
        description: `${user.role === 'seller' ? 'Seller' : 'User'} registered: ${user.name}`,
        timestamp: getTimeAgo(user.createdAt)
      }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10);

    // Get performance metrics
    const performanceMetrics = {
      averageProductViews: totalViews / Math.max(totalProducts, 1),
      averageEventViews: totalViews / Math.max(totalEvents, 1),
      conversionRate: totalWhatsAppClicks / Math.max(totalViews, 1) * 100,
      engagementRate: totalFavorites / Math.max(totalUsers, 1) * 100,
      activeSellers: await User.countDocuments({ 
        role: 'seller',
        'shop': { $exists: true, $ne: null }
      }),
      inactiveProducts: await Product.countDocuments({ isActive: false }),
      inactiveEvents: await Event.countDocuments({ isActive: false })
    };

    // Get subcategory statistics
    const subcategoryStats = await Category.aggregate([
      { $unwind: '$subcategories' },
      {
        $lookup: {
          from: 'subcategories',
          localField: 'subcategories',
          foreignField: '_id',
          as: 'subcategoryData'
        }
      },
      { $unwind: '$subcategoryData' },
      {
        $lookup: {
          from: 'products',
          localField: 'subcategoryData._id',
          foreignField: 'subcategory',
          as: 'products'
        }
      },
      {
        $project: {
          categoryName: '$name',
          subcategoryName: '$subcategoryData.name',
          productsCount: { $size: '$products' }
        }
      },
      { $sort: { productsCount: -1 } },
      { $limit: 10 }
    ]);

    // Get total orders (placeholder - you can implement order tracking)
    const totalOrders = 0; // Placeholder for now

    const analytics = {
      overview: {
        totalProducts,
        totalEvents,
        totalSellers,
        totalUsers,
        totalFavorites,
        totalWhatsAppClicks,
        totalViews,
        totalOrders
      },
      topProducts: topProductsWithFavorites,
      topSellers,
      topEvents,
      monthlyStats,
      categoryStats,
      subcategoryStats,
      performanceMetrics,
      recentActivity
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

// @desc    Get detailed product analytics
// @route   GET /api/admin/analytics/products
// @access  Private/Admin
router.get('/products', protect, authorize('admin'), async (req, res) => {
  try {
    const { sortBy = 'views', limit = 50 } = req.query;
    
    const sortOptions = {
      views: { viewCount: -1 },
      favorites: { favoritesCount: -1 },
      whatsapp: { whatsappClicks: -1 },
      telegram: { telegramClicks: -1 },
      engagement: { viewCount: -1, whatsappClicks: -1, telegramClicks: -1, favoritesCount: -1 }
    };

    const products = await Product.find({ isActive: true })
      .populate('shop', 'name avatar')
      .populate('category', 'name nameAr nameFr')
      .populate('subcategory', 'name nameAr nameFr')
      .sort(sortOptions[sortBy] || sortOptions.views)
      .limit(parseInt(limit))
      .select('name images viewCount whatsappClicks telegramClicks favoritesCount ratings sold_out stock originalPrice discountPrice createdAt');

    const productsWithEngagement = products.map(product => ({
      ...product.toObject(),
      totalEngagement: (product.viewCount || 0) + (product.whatsappClicks || 0) + (product.telegramClicks || 0) + (product.favoritesCount || 0),
      conversionRate: ((product.sold_out || 0) / Math.max(product.viewCount || 1, 1) * 100).toFixed(2),
      whatsappRate: ((product.whatsappClicks || 0) / Math.max(product.viewCount || 1, 1) * 100).toFixed(2),
      telegramRate: ((product.telegramClicks || 0) / Math.max(product.viewCount || 1, 1) * 100).toFixed(2),
      favoriteRate: ((product.favoritesCount || 0) / Math.max(product.viewCount || 1, 1) * 100).toFixed(2)
    }));

    res.json({
      success: true,
      products: productsWithEngagement,
      total: productsWithEngagement.length
    });
  } catch (error) {
    console.error('Product analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product analytics',
      error: error.message
    });
  }
});

// @desc    Get detailed event analytics
// @route   GET /api/admin/analytics/events
// @access  Private/Admin
router.get('/events', protect, authorize('admin'), async (req, res) => {
  try {
    const { sortBy = 'views', limit = 50 } = req.query;
    
    const sortOptions = {
      views: { viewCount: -1 },
      favorites: { favoritesCount: -1 },
      whatsapp: { whatsappClicks: -1 },
      telegram: { telegramClicks: -1 },
      engagement: { viewCount: -1, whatsappClicks: -1, telegramClicks: -1, favoritesCount: -1 }
    };

    const events = await Event.find({ isActive: true })
      .populate('shop', 'name avatar')
      .sort(sortOptions[sortBy] || sortOptions.views)
      .limit(parseInt(limit))
      .select('name images viewCount whatsappClicks telegramClicks favoritesCount ratings start_Date Finish_Date status createdAt');

    const eventsWithEngagement = events.map(event => ({
      ...event.toObject(),
      totalEngagement: (event.viewCount || 0) + (event.whatsappClicks || 0) + (event.telegramClicks || 0) + (event.favoritesCount || 0),
      whatsappRate: ((event.whatsappClicks || 0) / Math.max(event.viewCount || 1, 1) * 100).toFixed(2),
      telegramRate: ((event.telegramClicks || 0) / Math.max(event.viewCount || 1, 1) * 100).toFixed(2),
      favoriteRate: ((event.favoritesCount || 0) / Math.max(event.viewCount || 1, 1) * 100).toFixed(2)
    }));

    res.json({
      success: true,
      events: eventsWithEngagement,
      total: eventsWithEngagement.length
    });
  } catch (error) {
    console.error('Event analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching event analytics',
      error: error.message
    });
  }
});

// @desc    Get detailed seller analytics
// @route   GET /api/admin/analytics/sellers
// @access  Private/Admin
router.get('/sellers', protect, authorize('admin'), async (req, res) => {
  try {
    const { sortBy = 'profileViews', limit = 50 } = req.query;

    const sellers = await User.aggregate([
      { $match: { role: 'seller' } },
      {
        $lookup: {
          from: 'shops',
          localField: 'shop',
          foreignField: '_id',
          as: 'shopData'
        }
      },
      { $unwind: { path: '$shopData', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'products',
          localField: 'shop',
          foreignField: 'shop',
          as: 'products'
        }
      },
      {
        $lookup: {
          from: 'events',
          localField: 'shop',
          foreignField: 'shop',
          as: 'events'
        }
      },
      {
        $addFields: {
          totalProductViews: { $sum: '$products.viewCount' },
          totalProductWhatsApp: { $sum: '$products.whatsappClicks' },
          totalProductTelegram: { $sum: '$products.telegramClicks' },
          totalProductFavorites: { $sum: '$products.favoritesCount' },
          totalEventViews: { $sum: '$events.viewCount' },
          totalEventWhatsApp: { $sum: '$events.whatsappClicks' },
          totalEventTelegram: { $sum: '$events.telegramClicks' },
          totalEventFavorites: { $sum: '$events.favoritesCount' },
          productsCount: { $size: '$products' },
          eventsCount: { $size: '$events' }
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          phoneNumber: 1,
          isApproved: 1,
          createdAt: 1,
          shop: {
            _id: '$shopData._id',
            name: '$shopData.name',
            avatar: '$shopData.avatar',
            profileViews: '$shopData.profileViews',
            ratings: '$shopData.ratings'
          },
          productsCount: 1,
          eventsCount: 1,
          totalProductViews: 1,
          totalProductWhatsApp: 1,
          totalProductTelegram: 1,
          totalProductFavorites: 1,
          totalEventViews: 1,
          totalEventWhatsApp: 1,
          totalEventTelegram: 1,
          totalEventFavorites: 1,
          totalEngagement: {
            $add: [
              { $ifNull: ['$shopData.profileViews', 0] },
              { $ifNull: ['$totalProductViews', 0] },
              { $ifNull: ['$totalProductWhatsApp', 0] },
              { $ifNull: ['$totalProductTelegram', 0] },
              { $ifNull: ['$totalProductFavorites', 0] },
              { $ifNull: ['$totalEventViews', 0] },
              { $ifNull: ['$totalEventWhatsApp', 0] },
              { $ifNull: ['$totalEventTelegram', 0] },
              { $ifNull: ['$totalEventFavorites', 0] }
            ]
          }
        }
      },
      {
        $sort: sortBy === 'engagement' ? { totalEngagement: -1 } :
               sortBy === 'products' ? { productsCount: -1 } :
               { 'shop.profileViews': -1 }
      },
      { $limit: parseInt(limit) }
    ]);

    res.json({
      success: true,
      sellers,
      total: sellers.length
    });
  } catch (error) {
    console.error('Seller analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching seller analytics',
      error: error.message
    });
  }
});

// @desc    Get single product analytics
// @route   GET /api/admin/analytics/product/:id
// @access  Private/Admin
router.get('/product/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('shop', 'name avatar phoneNumber telegram')
      .populate('category', 'name nameAr nameFr')
      .populate('subcategory', 'name nameAr nameFr');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      product: {
        ...product.toObject(),
        conversionRate: ((product.sold_out || 0) / Math.max(product.viewCount || 1, 1) * 100).toFixed(2),
        whatsappRate: ((product.whatsappClicks || 0) / Math.max(product.viewCount || 1, 1) * 100).toFixed(2),
        telegramRate: ((product.telegramClicks || 0) / Math.max(product.viewCount || 1, 1) * 100).toFixed(2),
        favoriteRate: ((product.favoritesCount || 0) / Math.max(product.viewCount || 1, 1) * 100).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Product analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product analytics',
      error: error.message
    });
  }
});

module.exports = router;
