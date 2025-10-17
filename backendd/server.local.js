const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config({ path: './config.env.local' });

// Import database connection
const connectDB = require('./config/database');

// Import passport configuration
const passport = require('./config/passport');

// Import routes
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shops');
const productRoutes = require('./routes/products');
const eventRoutes = require('./routes/events');
const categoryRoutes = require('./routes/categories');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');
const trackingRoutes = require('./routes/analyticsTracking');
const tutorialRoutes = require('./routes/tutorials');
const paymentRoutes = require('./routes/payments');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Initialize Passport
app.use(passport.initialize());

// Compression middleware
app.use(compression());

// Enable CORS for local frontend
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "http://localhost:3001",
    "http://localhost:5000",
    "https://atlas-ecom-1.onrender.com",
    "https://atlas-ecom-frontend.onrender.com"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Global CORS headers for all responses (excluding Access-Control-Allow-Origin to avoid conflicts with credentials)
app.use((req, res, next) => {
  // Don't set Access-Control-Allow-Origin here - let the cors() middleware handle it
  // res.header('Access-Control-Allow-Origin', '*'); // ❌ REMOVED - conflicts with credentials: true
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  res.header('Cross-Origin-Opener-Policy', 'unsafe-none');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create avatars subdirectory
const avatarsDir = path.join(uploadsDir, 'avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}

// Serve static files with CORS headers (for images, wildcard is OK since no credentials needed)
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*'); // OK for static files
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Atlas Ecom Local Testing Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    port: PORT,
    testing_mode: process.env.TESTING_MODE || false,
    production_db: process.env.ALLOW_PRODUCTION_DB || false
  });
});

// Test database connection endpoint
app.get('/test-db', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const User = require('./models/User');
    
    // Test database connection
    const connectionState = mongoose.connection.readyState;
    const connectionStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    // Get some basic stats
    const userCount = await User.countDocuments();
    const dbName = mongoose.connection.db.databaseName;
    
    res.json({
      success: true,
      message: 'Database connection test successful',
      database: {
        name: dbName,
        state: connectionStates[connectionState],
        userCount: userCount,
        host: mongoose.connection.host,
        port: mongoose.connection.port
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database connection test failed',
      error: error.message
    });
  }
});

// Test email endpoint
app.get('/test-email', async (req, res) => {
  try {
    console.log('🧪 Testing email service...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER);
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'SET' : 'NOT SET');
    
    const emailService = require('./utils/emailService');
    const testResult = await emailService.sendContactEmail({
      name: 'Test User (Local)',
      email: 'test@example.com',
      subject: 'Test Email from Atlas Ecom Local Server',
      message: 'This is a test email from your local development server.'
    });
    
    if (testResult.success) {
      res.json({
        success: true,
        message: 'Test email sent successfully! Check atlasecom0@gmail.com inbox.',
        messageId: testResult.messageId
      });
    } else {
      res.json({
        success: false,
        message: 'Test email failed',
        error: testResult.error
      });
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.json({
      success: false,
      message: 'Test email error',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/v2/shops', shopRoutes); // V2 route for frontend compatibility
app.use('/api/products', productRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/track', trackingRoutes);
app.use('/api/tutorials', tutorialRoutes);
app.use('/api/payments', paymentRoutes);

// Legacy routes for backward compatibility
app.use('/auth', authRoutes);
app.use('/shops', shopRoutes);
app.use('/products', productRoutes);
app.use('/events', eventRoutes);
app.use('/users', authRoutes);
app.use('/admin', adminRoutes);
app.use('/', categoryRoutes);

// Public endpoint for best-selling products (sorted by engagement)
app.get('/api/public/best-products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const { sortBy = 'engagement', limit = 100 } = req.query;
    
    const sortOptions = {
      views: { viewCount: -1 },
      favorites: { favoritesCount: -1 },
      whatsapp: { whatsappClicks: -1 },
      telegram: { telegramClicks: -1 },
      engagement: { viewCount: -1, whatsappClicks: -1, telegramClicks: -1, favoritesCount: -1 }
    };
    
    const products = await Product.find({ isActive: true, isApproved: true })
      .populate('shop', 'name avatar')
      .populate('category', 'name nameAr nameFr')
      .populate('subcategory', 'name nameAr nameFr')
      .sort(sortOptions[sortBy] || sortOptions.engagement)
      .limit(parseInt(limit))
      .select('name images viewCount whatsappClicks telegramClicks favoritesCount ratings sold_out stock originalPrice discountPrice createdAt category subcategory');
    
    const productsWithEngagement = products.map(product => ({
      ...product.toObject(),
      totalEngagement: (product.viewCount || 0) + (product.whatsappClicks || 0) + (product.telegramClicks || 0) + (product.favoritesCount || 0),
      conversionRate: ((product.sold_out || 0) / Math.max(product.viewCount || 1, 1) * 100).toFixed(2),
      whatsappRate: ((product.whatsappClicks || 0) / Math.max(product.viewCount || 1, 1) * 100).toFixed(2),
      telegramRate: ((product.telegramClicks || 0) / Math.max(product.viewCount || 1, 1) * 100).toFixed(2),
      favoriteRate: ((product.favoritesCount || 0) / Math.max(product.viewCount || 1, 1) * 100).toFixed(2)
    }));
    
    // Sort by totalEngagement if sortBy is 'engagement'
    if (sortBy === 'engagement') {
      productsWithEngagement.sort((a, b) => b.totalEngagement - a.totalEngagement);
    }
    
    res.json({ success: true, products: productsWithEngagement, total: productsWithEngagement.length });
  } catch (error) {
    console.error('Error fetching best products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Include all the same routes as the main server.js
// Copy all the routes from server.js here for testing

// Legacy endpoints for backward compatibility
app.get('/products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const products = await Product.find({ isActive: true, isApproved: true })
      .populate('shop', 'name avatar phoneNumber telegram')
      .populate('category', 'name nameAr nameFr')
      .populate('subcategory', 'name nameAr nameFr')
      .limit(20)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      products: products.map(product => ({
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.discountPrice,
        discountPrice: product.discountPrice,
        originalPrice: product.originalPrice,
        images: product.images.map(img => img.url),
        category: product.category, // Already populated
        subcategory: product.subcategory, // Already populated
        stock: product.stock,
        sold: product.sold_out,
        sold_out: product.sold_out,
        ratings: product.ratings,
        numOfReviews: product.numOfReviews,
        shop: {
          _id: product.shop._id,
          name: product.shop.name,
          avatar: product.shop.avatar?.url,
          phoneNumber: product.shop.phoneNumber,
          telegram: product.shop.telegram
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

app.get('/api/v2/products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const SubCategory = require('./models/SubCategory');
    const { page = 1, limit = 12, category, search } = req.query;
    
    const query = { isActive: true, isApproved: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      // Search in product name, description, and subcategory tags
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

    const products = await Product.find(query)
      .populate('shop', 'name avatar phoneNumber telegram')
      .populate('category', 'name nameAr nameFr image')
      .populate('subcategory', 'name nameAr nameFr image tags')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments(query);

    res.json({
      success: true,
      products: products.map(product => ({
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.discountPrice,
        discountPrice: product.discountPrice,
        originalPrice: product.originalPrice,
        images: product.images.map(img => img.url),
        category: product.category, // Already populated
        subcategory: product.subcategory, // Already populated
        stock: product.stock,
        sold: product.sold_out,
        sold_out: product.sold_out,
        ratings: product.ratings,
        numOfReviews: product.numOfReviews,
        shop: {
          _id: product.shop._id,
          name: product.shop.name,
          avatar: product.shop.avatar?.url,
          phoneNumber: product.shop.phoneNumber,
          telegram: product.shop.telegram
        }
      })),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

app.get('/events', async (req, res) => {
  try {
    const Event = require('./models/Event');
    const { limit = 50 } = req.query;
    
    // Get all active and approved events (including future events)
    const events = await Event.find({ 
      isActive: true,
      isApproved: true
    })
      .populate('shop', 'name avatar phoneNumber telegram verifiedBadge')
      .populate('category', 'name nameAr nameFr image')
      .populate('subcategory', 'name nameAr nameFr image tags')
      .limit(parseInt(limit))
      .sort({ 
        isBoosted: -1,        // Boosted events first
        boostPriority: -1,    // Higher priority first
        createdAt: -1         // Then by creation date
      });

    res.json({
      success: true,
      events: events.map(event => ({
        _id: event._id,
        name: event.name,
        description: event.description,
        category: event.category,
        subcategory: event.subcategory,
        start_Date: event.start_Date,
        Finish_Date: event.Finish_Date,
        status: event.status,
        tags: event.tags,
        originalPrice: event.originalPrice,
        discountPrice: event.discountPrice,
        stock: event.stock,
        images: event.images.map(img => img.url),
        reviews: event.reviews,
        ratings: event.ratings,
        isBoosted: event.isBoosted,
        boostPriority: event.boostPriority,
        shop: {
          _id: event.shop._id,
          name: event.shop.name,
          avatar: event.shop.avatar?.url,
          phoneNumber: event.shop.phoneNumber,
          telegram: event.shop.telegram,
          verifiedBadge: event.shop.verifiedBadge
        },
        sold_out: event.sold_out
      }))
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
});

app.get('/api/v2/events', async (req, res) => {
  try {
    const Event = require('./models/Event');
    const events = await Event.find({ isActive: true })
      .populate('shop', 'name avatar phoneNumber telegram')
      .limit(20)
      .sort({ start_Date: 1 });

    res.json({
      success: true,
      events: events.map(event => ({
        _id: event._id,
        name: event.name,
        description: event.description,
        category: event.category,
        start_Date: event.start_Date,
        Finish_Date: event.Finish_Date,
        status: event.status,
        tags: event.tags,
        originalPrice: event.originalPrice,
        discountPrice: event.discountPrice,
        stock: event.stock,
        images: event.images.map(img => img.url),
        reviews: event.reviews,
        ratings: event.ratings,
        shop: {
          _id: event.shop._id,
          name: event.shop.name,
          avatar: event.shop.avatar?.url,
          phoneNumber: event.shop.phoneNumber,
          telegram: event.shop.telegram
        },
        sold_out: event.sold_out
      }))
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
});

app.get('/api/v2/shops', async (req, res) => {
  try {
    const Shop = require('./models/Shop');
    const shops = await Shop.find({ isApproved: true })
      .populate('owner', 'name email avatar')
      .limit(20)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      shops: shops.map(shop => ({
        _id: shop._id,
        name: shop.name,
        owner: {
          _id: shop.owner._id,
          name: shop.owner.name,
          email: shop.owner.email
        },
        telegram: shop.telegram,
        description: shop.description,
        address: shop.address,
        phoneNumber: shop.phoneNumber,
        banner: shop.banner?.url,
        zipCode: shop.zipCode,
        withdrawMethod: shop.withdrawMethod,
        availableBalance: shop.availableBalance,
        transections: shop.transections,
        ratings: shop.ratings,
        numOfReviews: shop.numOfReviews,
        isApproved: shop.isApproved,
        createdAt: shop.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching shops:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shops',
      error: error.message
    });
  }
});

app.get('/product/search', async (req, res) => {
  try {
    const { term } = req.query;
    if (!term) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    const Product = require('./models/Product');
    const products = await Product.find({
      $text: { $search: term },
      isActive: true
    }).populate('shop', 'name avatar phoneNumber telegram');

    res.json({
      success: true,
      products: products.map(product => ({
        _id: product._id,
        name: product.name,
        description: product.description,
        price: product.discountPrice,
        discountPrice: product.discountPrice,
        originalPrice: product.originalPrice,
        images: product.images.map(img => img.url),
        category: product.category,
        stock: product.stock,
        sold: product.sold_out,
        ratings: product.ratings,
        numOfReviews: product.numOfReviews,
        shop: {
          _id: product.shop._id,
          name: product.shop.name,
          avatar: product.shop.avatar?.url,
          phoneNumber: product.shop.phoneNumber,
          telegram: product.shop.telegram
        }
      }))
    });
  } catch (error) {
    console.error('Error searching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching products',
      error: error.message
    });
  }
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000", 
      "http://localhost:3001",
      "http://localhost:5000",
      "https://atlas-ecom-1.onrender.com",
      "https://atlas-ecom-frontend.onrender.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected to local server:', socket.id);

  socket.on('addUser', (userId) => {
    socket.join(userId);
    console.log('User added to room:', userId);
  });

  socket.on('sendMessage', (data) => {
    const { receiverId, senderId, text } = data;
    socket.to(receiverId).emit('getMessage', {
      senderId,
      text,
      createdAt: new Date()
    });
  });

  socket.on('updateLastMessage', (data) => {
    const { lastMessage, lastMessageId } = data;
    socket.emit('getLastMessage', {
      lastMessage,
      lastMessageId,
      createdAt: new Date()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from local server:', socket.id);
  });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`🧪 Atlas Ecom Local Testing Server running on http://localhost:${PORT}`);
  console.log(`📱 Frontend can connect to: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`🗄️ Database test: http://localhost:${PORT}/test-db`);
  console.log(`📧 Email test: http://localhost:${PORT}/test-email`);
  console.log(`🔐 Auth: POST /api/auth/login, POST /api/auth/register`);
  console.log(`🗄️ Database: MongoDB connected successfully`);
  console.log(`🔑 JWT Secret loaded: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);
  console.log(`🔑 JWT Expire: ${process.env.JWT_EXPIRE || 'Not set'}`);
  console.log(`🔌 Socket.IO server running on port ${PORT}`);
  console.log(`⚠️  WARNING: This is a LOCAL TESTING server with production database access!`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down local testing server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down local testing server gracefully...');
  process.exit(0);
});
