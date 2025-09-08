const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config({ path: './config.env' });

// Import database connection
const connectDB = require('./config/database');

// Import passport configuration
const passport = require('./config/passport');

// Import routes
const authRoutes = require('./routes/auth');
const shopRoutes = require('./routes/shops');
const productRoutes = require('./routes/products');
const eventRoutes = require('./routes/events');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Initialize Passport
app.use(passport.initialize());

// Disable Helmet completely for development to avoid CORS issues
// app.use(helmet({
//   contentSecurityPolicy: false,
//   crossOriginEmbedderPolicy: false,
//   crossOriginResourcePolicy: false,
//   crossOriginOpenerPolicy: false
// }));

// Compression middleware
app.use(compression());

// Enable CORS for frontend
app.use(cors({
  origin: [
    "http://localhost:3000", 
    "http://localhost:3001",
    "https://atlas-ecom-1.onrender.com",
    "https://atlas-ecom-frontend.onrender.com"
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization']
}));

// Global CORS headers for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
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

// Serve static files with CORS headers
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'unsafe-none');
  next();
}, express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Atlas Ecom Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Admin creation endpoint
app.post('/create-admin', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin account already exists!'
      });
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password || 'Admin@123', saltRounds);
    
    // Create admin user
    const adminUser = await User.create({
      name: name || 'Admin User',
      email: email || 'admin@atlasecom.com',
      password: hashedPassword,
      phoneNumber: '+1234567890',
      address: '123 Admin Street, Admin City, AC 12345',
      role: 'admin',
      isVerified: true
    });
    
    res.status(201).json({
      success: true,
      message: 'Admin account created successfully!',
      admin: {
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        isVerified: adminUser.isVerified
      }
    });
    
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating admin account',
      error: error.message
    });
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address'
      });
    }

    // For now, we'll just log the contact form submission
    // In production, you would integrate with an email service like SendGrid, Nodemailer, etc.
    console.log('📧 Contact Form Submission:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Subject:', subject);
    console.log('Message:', message);
    console.log('Timestamp:', new Date().toISOString());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // TODO: Implement actual email sending to atlasecom0@gmail.com
    // You can use services like:
    // - Nodemailer with Gmail SMTP
    // - SendGrid
    // - AWS SES
    // - EmailJS (client-side)

    res.status(200).json({
      success: true,
      message: 'Thank you for your message! We will get back to you soon.'
    });
    
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing contact form',
      error: error.message
    });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);
app.use('/api/events', eventRoutes);

// Admin routes (MUST BE BEFORE productRoutes to avoid conflicts)
app.get('/products/admin', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const products = await Product.find({}).populate('shop', 'name avatar phoneNumber telegram').sort({ createdAt: -1 });

    res.json({
      success: true,
      products: products.map(product => ({
        _id: product._id,
        name: product.name,
        description: product.description,
        category: product.category,
        tags: product.tags,
        originalPrice: product.originalPrice,
        discountPrice: product.discountPrice,
        stock: product.stock,
        minOrderQuantity: product.minOrderQuantity,
        images: product.images.map(img => ({
          public_id: img.public_id,
          url: img.url
        })),
        ratings: product.ratings,
        numOfReviews: product.numOfReviews,
        sold_out: product.sold_out,
        isActive: product.isActive,
        createdAt: product.createdAt,
        shop: product.shop
      }))
    });
  } catch (error) {
    console.error('Error fetching admin products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

app.get('/events/admin', async (req, res) => {
  try {
    const Event = require('./models/Event');
    const events = await Event.find({}).populate('shop', 'name avatar phoneNumber telegram').sort({ createdAt: -1 });

    res.json({
      success: true,
      events: events.map(event => ({
        _id: event._id,
        name: event.name,
        description: event.description,
        category: event.category,
        location: event.location,
        tags: event.tags,
        originalPrice: event.originalPrice,
        discountPrice: event.discountPrice,
        stock: event.stock,
        minOrderQuantity: event.minOrderQuantity,
        images: event.images.map(img => ({
          public_id: img.public_id,
          url: img.url
        })),
        ratings: event.ratings,
        numOfReviews: event.numOfReviews,
        sold_out: event.sold_out,
        isActive: event.isActive,
        status: event.status,
        createdAt: event.createdAt,
        shop: event.shop
      }))
    });
  } catch (error) {
    console.error('Error fetching admin events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching events',
      error: error.message
    });
  }
});

// Add legacy routes for frontend compatibility
app.use('/auth', authRoutes);
app.use('/shops', shopRoutes);
app.use('/products', productRoutes);
app.use('/events', eventRoutes);
app.use('/users', authRoutes);

// Add missing routes that frontend needs
app.get('/events', async (req, res) => {
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
          avatar: event.shop.avatar?.url
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
          avatar: product.shop.avatar?.url
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



// Legacy endpoints for backward compatibility (will be removed in future)
app.get('/products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const products = await Product.find({ isActive: true })
      .populate('shop', 'name avatar phoneNumber telegram')
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
        category: product.category,
        stock: product.stock,
        sold: product.sold_out,
        ratings: product.ratings,
        numOfReviews: product.numOfReviews,
        shop: {
          _id: product.shop._id,
          name: product.shop.name,
          avatar: product.shop.avatar?.url
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
    const { page = 1, limit = 12, category, search } = req.query;
    
    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const products = await Product.find(query)
      .populate('shop', 'name avatar phoneNumber telegram')
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
        category: product.category,
        stock: product.stock,
        sold: product.sold_out,
        ratings: product.ratings,
        numOfReviews: product.numOfReviews,
        shop: {
          _id: product.shop._id,
          name: product.shop.name,
          avatar: product.shop.avatar?.url
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
          avatar: event.shop.avatar?.url
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

// Admin endpoints
app.get('/admin/sellers', async (req, res) => {
  try {
    const Shop = require('./models/Shop');
    const shops = await Shop.find({})
      .populate('owner', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      sellers: shops.map(shop => ({
        _id: shop._id,
        name: shop.name,
        owner: {
          _id: shop.owner._id,
          name: shop.owner.name,
          email: shop.owner.email
        },
        isApproved: shop.isApproved,
        createdAt: shop.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching sellers:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching sellers',
      error: error.message
    });
  }
});

app.post('/admin/sellers/:id/approve', async (req, res) => {
  try {
    const Shop = require('./models/Shop');
    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    ).populate('owner', 'name email');

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    res.json({
      success: true,
      message: 'Seller approved successfully',
      shop
    });
  } catch (error) {
    console.error('Error approving seller:', error);
    res.status(500).json({
      success: false,
      message: 'Error approving seller',
      error: error.message
    });
  }
});

app.post('/admin/sellers/:id/reject', async (req, res) => {
  try {
    const Shop = require('./models/Shop');
    const shop = await Shop.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      { new: true }
    ).populate('owner', 'name email');

    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    res.json({
      success: true,
      message: 'Seller rejected successfully',
      shop
    });
  } catch (error) {
    console.error('Error rejecting seller:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting seller',
      error: error.message
    });
  }
});

app.delete('/admin/sellers/:id', async (req, res) => {
  try {
    const Shop = require('./models/Shop');
    const User = require('./models/User');
    
    // Find the shop first
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({
        success: false,
        message: 'Shop not found'
      });
    }

    // Delete the shop owner (user)
    if (shop.owner) {
      await User.findByIdAndDelete(shop.owner);
    }

    // Delete the shop
    await Shop.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Seller and shop deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting seller:', error);
    res.status(500).json({
      success: false,
        message: 'Error deleting seller',
        error: error.message
    });
  }
});

// Admin users management
app.get('/admin/users', async (req, res) => {
  try {
    const User = require('./models/User');
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });

    res.json({
      success: true,
      users: users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phoneNumber: user.phoneNumber,
        address: user.address,
        avatar: user.avatar,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

app.delete('/admin/users/:id', async (req, res) => {
  try {
    const User = require('./models/User');
    const Shop = require('./models/Shop');
    
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If user is a seller, also delete their shop
    if (user.role === 'seller') {
      const shop = await Shop.findOne({ owner: user._id });
      if (shop) {
        await Shop.findByIdAndDelete(shop._id);
      }
    }

    // Delete the user
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// Admin create admin account
app.post('/admin/create-admin', async (req, res) => {
  try {
    const User = require('./models/User');
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create new admin user
    const newAdmin = new User({
      name,
      email,
      password,
      role: role || 'admin',
      isVerified: true
    });

    await newAdmin.save();

    res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      user: {
        _id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        isVerified: newAdmin.isVerified,
        createdAt: newAdmin.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating admin account',
      error: error.message
    });
  }
});







// Admin delete product
app.delete('/products/admin/:id', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    await Product.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
});

// Admin delete event
app.delete('/events/admin/:id', async (req, res) => {
  try {
    const Event = require('./models/Event');
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }

    await Event.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Event deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting event:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting event',
      error: error.message
    });
  }
});

// Shop-specific endpoints
app.get('/shops/:id/products', async (req, res) => {
  try {
    const Product = require('./models/Product');
    const products = await Product.find({ 
      shop: req.params.id, 
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
          avatar: product.shop.avatar?.url
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching shop products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shop products',
      error: error.message
    });
  }
});

app.get('/events/get-all-events/:shopId', async (req, res) => {
  try {
    const Event = require('./models/Event');
    const events = await Event.find({ 
      shop: req.params.shopId, 
      isActive: true 
    }).populate('shop', 'name avatar phoneNumber telegram');

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
          avatar: event.shop.avatar?.url
        },
        sold_out: event.sold_out
      }))
    });
  } catch (error) {
    console.error('Error fetching shop events:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching shop events',
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

// Function to automatically delete expired events
const deleteExpiredEvents = async () => {
  try {
    const Event = require('./models/Event');
    const now = new Date();
    const expiredEvents = await Event.find({
      Finish_Date: { $lt: now },
      isActive: true
    });

    if (expiredEvents.length > 0) {
      console.log(`🕐 Found ${expiredEvents.length} expired events to delete`);
      
      // Delete expired events
      const deleteResult = await Event.deleteMany({
        Finish_Date: { $lt: now },
        isActive: true
      });

      console.log(`✅ Successfully deleted ${deleteResult.deletedCount} expired events`);
      return deleteResult.deletedCount;
    }
    return 0;
  } catch (error) {
    console.error('❌ Error deleting expired events:', error);
    return 0;
  }
};

// Schedule automatic cleanup of expired events (every hour)
setInterval(async () => {
  console.log('🕐 Running scheduled cleanup of expired events...');
  await deleteExpiredEvents();
}, 60 * 60 * 1000); // Run every hour

// Initial cleanup on server start
deleteExpiredEvents().then(deletedCount => {
  if (deletedCount > 0) {
    console.log(`🚀 Initial cleanup: Deleted ${deletedCount} expired events on startup`);
  }
});

// Start server
// Create HTTP server and Socket.IO
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: [
      "http://localhost:3000", 
      "http://localhost:3001",
      "https://atlas-ecom-1.onrender.com",
      "https://atlas-ecom-frontend.onrender.com"
    ],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

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
    console.log('User disconnected:', socket.id);
  });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`🚀 Atlas Ecom Backend Server running on http://localhost:${PORT}`);
  console.log(`📱 Frontend can connect to: http://localhost:${PORT}`);
  console.log(`🔍 Health check: http://localhost:${PORT}/health`);
  console.log(`📦 Products: http://localhost:${PORT}/api/v2/products`);
  console.log(`🎉 Events: http://localhost:${PORT}/api/v2/events`);
  console.log(`🏪 Shops: http://localhost:${PORT}/api/v2/shops`);
  console.log(`🔐 Auth: POST /api/auth/login, POST /api/auth/register`);
  console.log(`👨‍💼 Admin: GET /admin/sellers, POST /admin/sellers/:id/approve, POST /admin/sellers/:id/reject, DELETE /admin/sellers/:id, GET /admin/users, DELETE /admin/users/:id, POST /admin/create-admin, GET /products/admin, DELETE /products/admin/:id, GET /events/admin, DELETE /events/admin/:id`);
  console.log(`🗄️ Database: MongoDB connected successfully`);
  console.log(`🔑 JWT Secret loaded: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);
  console.log(`🔑 JWT Expire: ${process.env.JWT_EXPIRE || 'Not set'}`);
  console.log(`🕐 Automatic event cleanup: Every hour`);
  console.log(`🔌 Socket.IO server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down server gracefully...');
  process.exit(0);
});
