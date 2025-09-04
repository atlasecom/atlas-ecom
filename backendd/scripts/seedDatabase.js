const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '../config.env' });

// Import models
const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Event = require('../models/Event');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected for seeding');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

// Seed data
const seedData = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Shop.deleteMany({});
    await Product.deleteMany({});
    await Event.deleteMany({});

    console.log('🧹 Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@atlasecom.com',
      password: 'Admin@123',
      phoneNumber: '+1234567890',
      address: '123 Admin Street, Admin City, AC 12345',
      role: 'admin',
      isVerified: true
    });

    console.log('👑 Created admin user');

    // Create seller user
    const sellerUser = await User.create({
      name: 'John Seller',
      email: 'seller@atlasecom.com',
      password: 'Seller@123',
      phoneNumber: '+1234567891',
      address: '456 Seller Street, Seller City, SC 67890',
      role: 'seller',
      isVerified: true
    });

    console.log('🏪 Created seller user');

    // Create customer user
    const customerUser = await User.create({
      name: 'Jane Customer',
      email: 'customer@atlasecom.com',
      password: 'Customer@123',
      phoneNumber: '+1234567892',
      address: '789 Customer Street, Customer City, CC 11111',
      role: 'user',
      isVerified: true
    });

    console.log('🛒 Created customer user');

    // Create shop for seller
    const shop = await Shop.create({
      name: 'TechMart Electronics',
      owner: sellerUser._id,
      description: 'Your one-stop shop for all things tech and electronics',
      address: '123 Tech Street, Digital City, DC 22222',
      phoneNumber: '+1234567893',
      zipCode: 22222,
      telegram: 'techmart_group',
      isApproved: true,
      ratings: 4.5,
      numOfReviews: 25
    });

    console.log('🏪 Created shop');

    // Update seller user with shop reference
    await User.findByIdAndUpdate(sellerUser._id, { shop: shop._id });

    // Create products
    const products = await Product.create([
      {
        name: 'Premium Wireless Headphones',
        description: 'High-quality wireless headphones with noise cancellation technology. Perfect for music lovers and professionals who need clear audio quality.',
        category: 'Electronics',
        tags: 'wireless, noise-cancelling, premium, audio',
        originalPrice: 199.99,
        discountPrice: 149.99,
        stock: 50,
        minOrderQuantity: 1,
        shop: shop._id,
        images: [{
          public_id: 'headphones-1',
          url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'
        }, {
          public_id: 'headphones-2',
          url: 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=500&h=500&fit=crop'
        }],
        ratings: 4.5,
        numOfReviews: 89
      },
      {
        name: 'Smart Fitness Watch',
        description: 'Advanced fitness tracking with heart rate monitor, GPS, and sleep tracking. Stay healthy and monitor your fitness goals.',
        category: 'Electronics',
        tags: 'fitness, smartwatch, health, tracking',
        originalPrice: 299.99,
        discountPrice: 249.99,
        stock: 30,
        minOrderQuantity: 1,
        shop: shop._id,
        images: [{
          public_id: 'watch-1',
          url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop'
        }, {
          public_id: 'watch-2',
          url: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=500&h=500&fit=crop'
        }],
        ratings: 4.8,
        numOfReviews: 156
      },
      {
        name: 'Professional Camera Lens',
        description: 'High-quality camera lens for professional photography. Perfect for portraits, landscapes, and creative photography.',
        category: 'Electronics',
        tags: 'camera, lens, professional, photography',
        originalPrice: 899.99,
        discountPrice: 799.99,
        stock: 15,
        minOrderQuantity: 1,
        shop: shop._id,
        images: [{
          public_id: 'lens-1',
          url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&h=500&fit=crop'
        }, {
          public_id: 'lens-2',
          url: 'https://images.unsplash.com/photo-1510127034890-ba32a02e1f9e?w=500&h=500&fit=crop'
        }],
        ratings: 4.9,
        numOfReviews: 234
      }
    ]);

    console.log('📦 Created products');

    // Create events
    const events = await Event.create([
      {
        name: 'Summer Tech Sale 2025',
        description: 'Get up to 70% off on selected electronics during our biggest summer sale of the year! Limited time offer.',
        category: 'Electronics',
        tags: 'summer, sale, tech, electronics',
        start_Date: new Date('2025-06-01'),
        Finish_Date: new Date('2025-06-30'),
        originalPrice: 299.99,
        discountPrice: 199.99,
        stock: 100,
        shopId: shop._id.toString(),
        shop: shop._id,
        ratings: 4.6,
        numOfReviews: 45
      },
      {
        name: 'Tech Week Special',
        description: 'Exclusive deals on electronics and gadgets with amazing discounts. Don\'t miss out on these incredible offers!',
        category: 'Electronics',
        tags: 'tech week, special, deals, gadgets',
        start_Date: new Date('2025-07-01'),
        Finish_Date: new Date('2025-07-07'),
        originalPrice: 399.99,
        discountPrice: 299.99,
        stock: 50,
        shopId: shop._id.toString(),
        shop: shop._id,
        ratings: 4.8,
        numOfReviews: 67
      }
    ]);

    console.log('🎉 Created events');

    // Add some reviews to products
    const product1 = products[0];
    product1.reviews.push({
      user: customerUser._id,
      rating: 5,
      comment: 'Excellent headphones! The noise cancellation is amazing and the sound quality is superb.'
    });
    await product1.save();

    const product2 = products[1];
    product2.reviews.push({
      user: customerUser._id,
      rating: 4,
      comment: 'Great fitness watch with accurate tracking. Battery life could be better but overall satisfied.'
    });
    await product2.save();

    console.log('⭐ Added product reviews');

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Created Data Summary:');
    console.log(`   👑 Admin User: ${adminUser.email}`);
    console.log(`   🏪 Seller User: ${sellerUser.email}`);
    console.log(`   🛒 Customer User: ${customerUser.email}`);
    console.log(`   🏪 Shop: ${shop.name}`);
    console.log(`   📦 Products: ${products.length}`);
    console.log(`   🎉 Events: ${events.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    // Close database connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seeding
connectDB().then(() => {
  seedData();
});
