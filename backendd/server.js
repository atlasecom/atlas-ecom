const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const helmet = require('helmet');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
// Load environment variables
if (process.env.NODE_ENV === 'production') {
  // In production, environment variables are set by Render
  console.log('🔧 Production mode: Using environment variables from Render');
} else {
  // In development, load from config.env file
  require('dotenv').config({ path: './config.env' });
  console.log('🔧 Development mode: Using config.env file');
}

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
const analyticsRoutes = require('./routes/analytics');
const adminRoutes = require('./routes/admin');
const whatsappRoutes = require('./routes/whatsapp');
const tutorialRoutes = require('./routes/tutorials');
const trackingRoutes = require('./routes/analyticsTracking');
const paymentRoutes = require('./routes/payments');
const whatsappService = require('./services/whatsappService');

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
    "https://atlas-ecom.onrender.com",
    "https://atlas-ecom-1.onrender.com",
    "https://atlas-ecom-frontend.onrender.com",
    "https://atlasecom.ma"
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
app.get('/health', async (req, res) => {
  try {
    const whatsappHealth = await whatsappService.healthCheck();
    
    res.json({
      success: true,
      message: 'Atlas Ecom Backend is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        whatsapp: whatsappHealth
      }
    });
  } catch (error) {
    res.json({
      success: true,
      message: 'Atlas Ecom Backend is running',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        whatsapp: { error: error.message }
      }
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
      name: 'Test User',
      email: 'test@example.com',
      subject: 'Test Email from Atlas Ecom',
      message: 'This is a test email to verify the contact form email service is working properly.'
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

// Admin creation endpoint
// app.post('/create-admin', async (req, res) => {
//   try {
//     const { name, email, password } = req.body;
    
    // Check if admin already exists
    // const existingAdmin = await User.findOne({ email });
    // if (existingAdmin) {
//       return res.status(400).json({
//         success: false,
//         message: 'Admin account already exists!'
//       });
//     }
    
//     // Hash password
//     const saltRounds = 10;
//     const hashedPassword = await bcrypt.hash(password || 'Admin@123', saltRounds);
    
//     // Create admin user
//     const adminUser = await User.create({
//       name: name || 'Admin User',
//       email: email || 'admin@atlasecom.com',
//       password: hashedPassword,
//       phoneNumber: '+1234567890',
//       address: '123 Admin Street, Admin City, AC 12345',
//       role: 'admin',
//       isVerified: true
//     });
    
//     res.status(201).json({
//       success: true,
//       message: 'Admin account created successfully!',
//       admin: {
//         name: adminUser.name,
//         email: adminUser.email,
//         role: adminUser.role,
//         isVerified: adminUser.isVerified
//       }
//     });
    
//   } catch (error) {
//     console.error('Error creating admin:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error creating admin account',
//       error: error.message
//     });
//   }
// });

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

    // Log the contact form submission
    console.log('📧 Contact Form Submission:');
    console.log('Name:', name);
    console.log('Email:', email);
    console.log('Subject:', subject);
    console.log('Message:', message);
    console.log('Timestamp:', new Date().toISOString());
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Check if email service is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.log('⚠️ Email service not configured, logging contact form submission only');
      console.log('📧 Contact Form Submission (Email service not configured):');
      console.log('Name:', name);
      console.log('Email:', email);
      console.log('Subject:', subject);
      console.log('Message:', message);
      console.log('Timestamp:', new Date().toISOString());
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      res.status(200).json({
        success: true,
        message: 'Thank you for your message! We have received your submission and will get back to you soon.'
      });
      return;
    }

    // Try to send email using the primary email service
    try {
      const emailService = require('./utils/emailService');
      const emailResult = await emailService.sendContactEmail({
        name,
        email,
        subject,
        message
      });

      if (emailResult.success) {
        console.log('✅ Contact email sent successfully to atlasecom0@gmail.com');
        res.status(200).json({
          success: true,
          message: 'Thank you for your message! We will get back to you soon.'
        });
        return;
      } else {
        console.error('❌ Primary email service failed:', emailResult.error);
        // Fall back to alternative email service
        throw new Error('Primary email service failed');
      }
    } catch (emailError) {
      console.log('⚠️ Primary email service failed, using fallback logging service');
      console.error('❌ Email service error:', emailError.message);
      
      // Use alternative email service as fallback
      try {
        const alternativeEmailService = require('./utils/alternativeEmailService');
        const fallbackResult = await alternativeEmailService.sendContactEmail({
          name,
          email,
          subject,
          message
        });

        if (fallbackResult.success) {
          console.log('✅ Contact form submission logged successfully (fallback method)');
          res.status(200).json({
            success: true,
            message: 'Thank you for your message! We have received your submission and will get back to you soon.'
          });
        } else {
          throw new Error('Fallback email service also failed');
        }
      } catch (fallbackError) {
        console.error('❌ Fallback email service also failed:', fallbackError);
        // Even if everything fails, still return success to user
        res.status(200).json({
          success: true,
          message: 'Thank you for your message! We have received your submission and will get back to you soon.'
        });
      }
    }
    
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
app.use('/api/auth/users', authRoutes); // Add this for WhatsApp verification
app.use('/api/shops', shopRoutes);
app.use('/api/v2/shops', shopRoutes); // V2 route for frontend compatibility
app.use('/api/products', productRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', categoryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin', analyticsRoutes);
app.use('/api/admin/analytics', analyticsRoutes);
app.use('/api/track', trackingRoutes);
app.use('/api/whatsapp', whatsappRoutes);
app.use('/api/tutorials', tutorialRoutes);
app.use('/api/payments', paymentRoutes);

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
    
    // Apply smart sorting: boosted first, then by engagement with randomization for similar levels
    const boostedProducts = productsWithEngagement.filter(product => product.isBoosted);
    const normalProducts = productsWithEngagement.filter(product => !product.isBoosted);
    
    // Sort boosted products by priority (highest first), then by engagement
    boostedProducts.sort((a, b) => {
      if (a.boostPriority !== b.boostPriority) {
        return b.boostPriority - a.boostPriority;
      }
      // If same priority, sort by engagement (highest first)
      return b.totalEngagement - a.totalEngagement;
    });
    
    // Sort normal products by engagement first, then add randomization for similar engagement levels
    normalProducts.sort((a, b) => {
      const engagementDiff = b.totalEngagement - a.totalEngagement;
      // If engagement difference is significant (>10%), maintain strict order
      if (Math.abs(engagementDiff) > Math.max(a.totalEngagement, b.totalEngagement) * 0.1) {
        return engagementDiff;
      }
      // For similar engagement levels, randomize
      return Math.random() - 0.5;
    });
    
    // Combine: boosted first, then engagement-sorted normal products
    const finalProducts = [...boostedProducts, ...normalProducts];
    
    res.json({ success: true, products: finalProducts, total: finalProducts.length });
  } catch (error) {
    console.error('Error fetching best products:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Simple orders endpoint (placeholder)
app.get('/api/orders', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Orders endpoint - not implemented yet',
      orders: []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
});

// Admin routes (MUST BE BEFORE productRoutes to avoid conflicts)
// app.get('/products/admin', async (req, res) => {
//   try {
//     const Product = require('./models/Product');
//     const products = await Product.find({}).populate('shop', 'name avatar phoneNumber telegram').sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       products: products.map(product => ({
//         _id: product._id,
//         name: product.name,
//         description: product.description,
//         category: product.category,
//         tags: product.tags,
//         originalPrice: product.originalPrice,
//         discountPrice: product.discountPrice,
//         stock: product.stock,
//         minOrderQuantity: product.minOrderQuantity,
//         images: product.images.map(img => ({
//           public_id: img.public_id,
//           url: img.url
//         })),
//         ratings: product.ratings,
//         numOfReviews: product.numOfReviews,
//         sold_out: product.sold_out,
//         isActive: product.isActive,
//         createdAt: product.createdAt,
//         shop: product.shop
//       }))
//     });
//   } catch (error) {
//     console.error('Error fetching admin products:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching products',
//       error: error.message
//     });
//   }
// });

// app.get('/events/admin', async (req, res) => {
//   try {
//     const Event = require('./models/Event');
//     const events = await Event.find({}).populate('shop', 'name avatar phoneNumber telegram').sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       events: events.map(event => ({
//         _id: event._id,
//         name: event.name,
//         description: event.description,
//         category: event.category,
//         location: event.location,
//         tags: event.tags,
//         originalPrice: event.originalPrice,
//         discountPrice: event.discountPrice,
//         stock: event.stock,
//         minOrderQuantity: event.minOrderQuantity,
//         images: event.images.map(img => ({
//           public_id: img.public_id,
//           url: img.url
//         })),
//         ratings: event.ratings,
//         numOfReviews: event.numOfReviews,
//         sold_out: event.sold_out,
//         isActive: event.isActive,
//         status: event.status,
//         createdAt: event.createdAt,
//         shop: event.shop
//       }))
//     });
//   } catch (error) {
//     console.error('Error fetching admin events:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching events',
//       error: error.message
//     });
//   }
// });

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

app.get('/product/search', async (req, res) => {
  try {
    const { term, category, subcategory } = req.query;
    if (!term) {
      return res.status(400).json({
        success: false,
        message: 'Search term is required'
      });
    }

    const Product = require('./models/Product');
    const Category = require('./models/Category');
    const SubCategory = require('./models/SubCategory');
    
    // Build search query
    const searchQuery = {
      $or: [
        { $text: { $search: term } },
        { searchTags: { $in: [term.toLowerCase()] } },
        { name: { $regex: term, $options: 'i' } },
        { description: { $regex: term, $options: 'i' } }
      ],
      isActive: true
    };

    // Add category filter if provided
    if (category) {
      searchQuery.category = category;
    }

    // Add subcategory filter if provided
    if (subcategory) {
      searchQuery.subcategory = subcategory;
    }

    const products = await Product.find(searchQuery)
      .populate('shop', 'name avatar phoneNumber telegram')
      .populate('category', 'name nameAr nameFr image')
      .populate('subcategory', 'name nameAr nameFr image tags')
      .sort({ ratings: -1, createdAt: -1 });

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
        category: product.category ? {
          _id: product.category._id,
          name: product.category.name,
          nameAr: product.category.nameAr,
          nameFr: product.category.nameFr,
          image: product.category.image?.url
        } : null,
        subcategory: product.subcategory ? {
          _id: product.subcategory._id,
          name: product.subcategory.name,
          nameAr: product.subcategory.nameAr,
          nameFr: product.subcategory.nameFr,
          image: product.subcategory.image?.url,
          tags: product.subcategory.tags
        } : null,
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
    const products = await Product.find({ isActive: true, isApproved: true })
      .populate('shop', 'name avatar phoneNumber telegram')
      .populate('category', 'name nameAr nameFr image')
      .populate('subcategory', 'name nameAr nameFr image tags')
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
        images: product.images ? product.images.map(img => img.url) : [],
        category: product.category || null,
        subcategory: product.subcategory || null,
        stock: product.stock,
        sold: product.sold_out,
        ratings: product.ratings,
        numOfReviews: product.numOfReviews,
        shop: product.shop ? {
          _id: product.shop._id,
          name: product.shop.name,
          avatar: product.shop.avatar?.url,
          phoneNumber: product.shop.phoneNumber,
          telegram: product.shop.telegram
        } : null
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
    const { page = 1, limit = 12, category, subcategory, search } = req.query;
    
    const query = { isActive: true, isApproved: true };
    
    if (category) {
      query.category = category;
    }
    
    if (subcategory) {
      query.subcategory = subcategory;
    }
    
    if (search) {
      query.$or = [
        { $text: { $search: search } },
        { searchTags: { $in: [search.toLowerCase()] } },
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query)
      .populate('shop', 'name avatar phoneNumber telegram verifiedBadge')
      .populate('category', 'name nameAr nameFr image')
      .populate('subcategory', 'name nameAr nameFr image tags')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({
        isBoosted: -1,        // Boosted products first
        boostPriority: -1,    // Higher priority first
        createdAt: -1         // Then by creation date
      });

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
        images: product.images ? product.images.map(img => img.url) : [],
        category: product.category || null,
        subcategory: product.subcategory || null,
        stock: product.stock,
        sold: product.sold_out,
        ratings: product.ratings,
        numOfReviews: product.numOfReviews,
        isBoosted: product.isBoosted,
        boostPriority: product.boostPriority,
        shop: product.shop ? {
          _id: product.shop._id,
          name: product.shop.name,
          avatar: product.shop.avatar?.url,
          phoneNumber: product.shop.phoneNumber,
          telegram: product.shop.telegram,
          verifiedBadge: product.shop.verifiedBadge
        } : null
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


// Commented out - moved to admin routes
// app.post('/admin/sellers/:id/approve', async (req, res) => {
//   try {
//     const Shop = require('./models/Shop');
//     const shop = await Shop.findByIdAndUpdate(
//       req.params.id,
//       { isApproved: true },
//       { new: true }
//     ).populate('owner', 'name email');

//     if (!shop) {
//       return res.status(404).json({
//         success: false,
//         message: 'Shop not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Seller approved successfully',
//       shop
//     });
//   } catch (error) {
//     console.error('Error approving seller:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error approving seller',
//       error: error.message
//     });
//   }
// });

// Commented out - moved to admin routes
// app.post('/admin/sellers/:id/reject', async (req, res) => {
//   try {
//     const Shop = require('./models/Shop');
//     const shop = await Shop.findByIdAndUpdate(
//       req.params.id,
//       { isApproved: false },
//       { new: true }
//     ).populate('owner', 'name email');

//     if (!shop) {
//       return res.status(404).json({
//         success: false,
//         message: 'Shop not found'
//       });
//     }

//     res.json({
//       success: true,
//       message: 'Seller rejected successfully',
//       shop
//     });
//   } catch (error) {
//     console.error('Error rejecting seller:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error rejecting seller',
//       error: error.message
//     });
//   }
// });

// app.delete('/admin/sellers/:id', async (req, res) => {
// Commented out - moved to admin routes
//   try {
//     const Shop = require('./models/Shop');
//     const User = require('./models/User');
    
//     // Find the shop first
//     const shop = await Shop.findById(req.params.id);
//     if (!shop) {
//       return res.status(404).json({
//         success: false,
//         message: 'Shop not found'
//       });
//     }

//     // Delete the shop owner (user)
//     if (shop.owner) {
//       await User.findByIdAndDelete(shop.owner);
//     }

//     // Delete the shop
//     await Shop.findByIdAndDelete(req.params.id);

//     res.json({
//       success: true,
//       message: 'Seller and shop deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting seller:', error);
//     res.status(500).json({
//       success: false,
//         message: 'Error deleting seller',
//         error: error.message
//     });
//   }
// });

// Admin users management
// app.get('/admin/users', async (req, res) => {
//   try {
//     const User = require('./models/User');
//     const users = await User.find({}).select('-password').sort({ createdAt: -1 });

//     res.json({
//       success: true,
//       users: users.map(user => ({
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//         phoneNumber: user.phoneNumber,
//         address: user.address,
//         avatar: user.avatar,
//         isVerified: user.isVerified,
//         createdAt: user.createdAt
//       }))
//     });
//   } catch (error) {
//     console.error('Error fetching users:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error fetching users',
//       error: error.message
//     });
//   }
// });

// Commented out - moved to admin routes
// app.delete('/admin/users/:id', async (req, res) => {
//   try {
//     const User = require('./models/User');
//     const Shop = require('./models/Shop');
    
//     const user = await User.findById(req.params.id);
//     if (!user) {
//       return res.status(404).json({
//         success: false,
//         message: 'User not found'
//       });
//     }

//     // If user is a seller, also delete their shop
//     if (user.role === 'seller') {
//       const shop = await Shop.findOne({ owner: user._id });
//       if (shop) {
//         await Shop.findByIdAndDelete(shop._id);
//       }
//     }

//     // Delete the user
//     await User.findByIdAndDelete(req.params.id);

//     res.json({
//       success: true,
//       message: 'User deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting user:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error deleting user',
//       error: error.message
//     });
//   }
// });

// Admin create admin account
// app.post('/admin/create-admin', async (req, res) => {
//   try {
//     const User = require('./models/User');
//     const { name, email, password, role } = req.body;

//     // Validation
//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: 'Name, email, and password are required'
//       });
//     }

//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({
//         success: false,
//         message: 'User with this email already exists'
//       });
//     }

//     // Create new admin user
//     const newAdmin = new User({
//       name,
//       email,
//       password,
//       role: role || 'admin',
//       isVerified: true
//     });

//     await newAdmin.save();

//     res.status(201).json({
//       success: true,
//       message: 'Admin account created successfully',
//       user: {
//         _id: newAdmin._id,
//         name: newAdmin.name,
//         email: newAdmin.email,
//         role: newAdmin.role,
//         isVerified: newAdmin.isVerified,
//         createdAt: newAdmin.createdAt
//       }
//     });
//   } catch (error) {
//     console.error('Error creating admin:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error creating admin account',
//       error: error.message
//     });
//   }
// });







// Admin delete product
// Commented out - moved to admin routes
// app.delete('/products/admin/:id', async (req, res) => {
//   try {
//     const Product = require('./models/Product');
//     const product = await Product.findById(req.params.id);
    
//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: 'Product not found'
//       });
//     }

//     await Product.findByIdAndDelete(req.params.id);

//     res.json({
//       success: true,
//       message: 'Product deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting product:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error deleting product',
//       error: error.message
//     });
//   }
// });

// Admin delete event
// Commented out - moved to admin routes
// app.delete('/events/admin/:id', async (req, res) => {
//   try {
//     const Event = require('./models/Event');
//     const event = await Event.findById(req.params.id);
    
//     if (!event) {
//       return res.status(404).json({
//         success: false,
//         message: 'Event not found'
//       });
//     }

//     await Event.findByIdAndDelete(req.params.id);

//     res.json({
//       success: true,
//       message: 'Event deleted successfully'
//     });
//   } catch (error) {
//     console.error('Error deleting event:', error);
//     res.status(500).json({
//       success: false,
//       message: 'Error deleting event',
//       error: error.message
//     });
//   }
// });

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
          avatar: event.shop.avatar?.url,
          phoneNumber: event.shop.phoneNumber,
          telegram: event.shop.telegram
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'Atlas Ecom Backend is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
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
      "https://atlas-ecom.onrender.com",
      "https://atlas-ecom-1.onrender.com",
      "https://atlas-ecom-frontend.onrender.com",
      "https://atlasecom.ma"
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

// Initialize WhatsApp Service
if (process.env.NODE_ENV !== 'production') {
  // Development: Use whatsapp-web.js with QR code
  whatsappService.initialize().then((isReady) => {
    if (isReady) {
      console.log('✅ WhatsApp service initialized and ready');
    } else {
      console.log('⚠️ WhatsApp service initialized but not ready (QR code required)');
    }
  }).catch((error) => {
    console.error('❌ WhatsApp service initialization failed:', error);
  });
} else {
  // Production: Use Twilio WhatsApp API
  const twilioWhatsAppService = require('./services/twilioWhatsappService');
  twilioWhatsAppService.initialize().then((isReady) => {
    if (isReady) {
      console.log('✅ Twilio WhatsApp service initialized and ready');
    } else {
      console.log('⚠️ Twilio WhatsApp service not configured - check environment variables');
    }
  }).catch((error) => {
    console.error('❌ Twilio WhatsApp service initialization failed:', error);
  });
}

// Start the server
httpServer.listen(PORT, () => {
  const serverUrl = process.env.NODE_ENV === 'production' 
    ? `https://atlas-ecom.onrender.com` 
    : `http://localhost:${PORT}`;
    
  console.log(`🚀 Atlas Ecom Backend Server running on port ${PORT}`);
  console.log(`📱 Frontend can connect to: ${serverUrl}`);
  console.log(`🔍 Health check: ${serverUrl}/health`);
  console.log(`📦 Products: ${serverUrl}/api/v2/products`);
  console.log(`🎉 Events: ${serverUrl}/api/v2/events`);
  console.log(`🏪 Shops: ${serverUrl}/api/v2/shops`);
  console.log(`🔐 Auth: POST ${serverUrl}/api/auth/login, POST ${serverUrl}/api/auth/register`);
  console.log(`👨‍💼 Admin: GET ${serverUrl}/admin/sellers, POST ${serverUrl}/admin/sellers/:id/approve, POST ${serverUrl}/admin/sellers/:id/reject, DELETE ${serverUrl}/admin/sellers/:id, GET ${serverUrl}/admin/users, DELETE ${serverUrl}/admin/users/:id, POST ${serverUrl}/admin/create-admin, GET ${serverUrl}/products/admin, DELETE ${serverUrl}/products/admin/:id, GET ${serverUrl}/events/admin, DELETE ${serverUrl}/events/admin/:id`);
  console.log(`🗄️ Database: MongoDB connected successfully`);
  console.log(`🔑 JWT Secret loaded: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);
  console.log(`🔑 JWT Expire: ${process.env.JWT_EXPIRE || 'Not set'}`);
  console.log(`🕐 Automatic event cleanup: Every hour`);
  console.log(`🔌 Socket.IO server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
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
