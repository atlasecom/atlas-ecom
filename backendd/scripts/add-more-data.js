const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Event = require('../models/Event');
const Shop = require('../models/Shop');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');

async function addMoreData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get existing data
    const categories = await Category.find();
    const subcategories = await SubCategory.find();
    const shops = await Shop.find();
    const users = await User.find({ role: 'user' });

    console.log(`📊 Current data: ${users.length} users, ${shops.length} shops, ${categories.length} categories`);

    // Add more products
    console.log('📦 Adding more products...');
    const additionalProducts = [
      { name: 'Samsung Galaxy S24 Ultra', category: 'Electronics', subcategory: 'Smartphones', price: 1200, originalPrice: 1400 },
      { name: 'iPhone 15 Pro Max', category: 'Electronics', subcategory: 'Smartphones', price: 1300, originalPrice: 1500 },
      { name: 'MacBook Air M3', category: 'Electronics', subcategory: 'Laptops', price: 1100, originalPrice: 1300 },
      { name: 'Dell XPS 15', category: 'Electronics', subcategory: 'Laptops', price: 1500, originalPrice: 1800 },
      { name: 'Sony WH-1000XM5', category: 'Electronics', subcategory: 'Headphones', price: 350, originalPrice: 400 },
      { name: 'AirPods Pro 2', category: 'Electronics', subcategory: 'Headphones', price: 250, originalPrice: 300 },
      { name: 'Nike Air Max 270', category: 'Fashion', subcategory: 'Shoes', price: 150, originalPrice: 180 },
      { name: 'Adidas Ultraboost 22', category: 'Fashion', subcategory: 'Shoes', price: 180, originalPrice: 220 },
      { name: 'Levi\'s 501 Jeans', category: 'Fashion', subcategory: 'Men\'s Clothing', price: 80, originalPrice: 100 },
      { name: 'Zara Blazer', category: 'Fashion', subcategory: 'Women\'s Clothing', price: 120, originalPrice: 150 },
      { name: 'H&M Summer Dress', category: 'Fashion', subcategory: 'Women\'s Clothing', price: 60, originalPrice: 80 },
      { name: 'IKEA Office Chair', category: 'Home & Garden', subcategory: 'Furniture', price: 200, originalPrice: 250 },
      { name: 'Kitchen Knife Set', category: 'Home & Garden', subcategory: 'Kitchen', price: 80, originalPrice: 100 },
      { name: 'Garden Hose 50ft', category: 'Home & Garden', subcategory: 'Garden Tools', price: 40, originalPrice: 50 },
      { name: 'Coffee Maker Deluxe', category: 'Home & Garden', subcategory: 'Kitchen', price: 150, originalPrice: 200 },
      { name: 'Gaming Laptop RTX 4080', category: 'Electronics', subcategory: 'Laptops', price: 2000, originalPrice: 2500 },
      { name: 'Wireless Gaming Mouse', category: 'Electronics', subcategory: 'Headphones', price: 80, originalPrice: 100 },
      { name: 'Mechanical Keyboard', category: 'Electronics', subcategory: 'Headphones', price: 120, originalPrice: 150 },
      { name: 'Running Shoes Nike', category: 'Fashion', subcategory: 'Shoes', price: 100, originalPrice: 130 },
      { name: 'Casual T-Shirt', category: 'Fashion', subcategory: 'Men\'s Clothing', price: 25, originalPrice: 35 }
    ];

    for (const productData of additionalProducts) {
      const category = categories.find(cat => cat.name === productData.category);
      const subcategory = subcategories.find(sub => sub.name === productData.subcategory);
      const randomShop = shops[Math.floor(Math.random() * shops.length)];
      
      const discountPrice = productData.originalPrice - productData.price;
      
      const product = new Product({
        name: productData.name,
        description: `High-quality ${productData.name.toLowerCase()} with excellent features and performance.`,
        price: productData.price,
        originalPrice: productData.originalPrice,
        discountPrice: discountPrice,
        stock: Math.floor(Math.random() * 100) + 10,
        images: [{
          url: `https://picsum.photos/400/400?random=${Math.floor(Math.random() * 10000)}`,
          public_id: `product_${Date.now()}_${Math.random()}`
        }],
        category: category._id,
        subcategory: subcategory._id,
        shop: {
          _id: randomShop._id,
          name: randomShop.name,
          seller: randomShop.seller
        },
        ratings: Math.random() * 2 + 3, // 3-5 stars
        numOfReviews: Math.floor(Math.random() * 50) + 5,
        isActive: Math.random() > 0.1, // 90% active
        viewCount: Math.floor(Math.random() * 1000) + 10,
        whatsappClicks: Math.floor(Math.random() * 100) + 1,
        favoritesCount: Math.floor(Math.random() * 50) + 1,
        tags: {
          en: ['premium', 'quality', 'popular'],
          ar: ['متميز', 'جودة', 'شائع'],
          fr: ['premium', 'qualité', 'populaire']
        }
      });
      
      await product.save();
    }
    console.log(`✅ Added ${additionalProducts.length} products`);

    // Add more events
    console.log('🎉 Adding more events...');
    const additionalEvents = [
      { name: 'Black Friday Sale 2024', category: 'Electronics', subcategory: 'Smartphones', price: 50, originalPrice: 100 },
      { name: 'Summer Fashion Week', category: 'Fashion', subcategory: 'Women\'s Clothing', price: 30, originalPrice: 50 },
      { name: 'Tech Expo 2024', category: 'Electronics', subcategory: 'Laptops', price: 75, originalPrice: 100 },
      { name: 'Home Decor Fair', category: 'Home & Garden', subcategory: 'Furniture', price: 40, originalPrice: 60 },
      { name: 'Sports Equipment Sale', category: 'Fashion', subcategory: 'Shoes', price: 25, originalPrice: 40 },
      { name: 'Electronics Clearance', category: 'Electronics', subcategory: 'Headphones', price: 20, originalPrice: 35 },
      { name: 'Fashion Show 2024', category: 'Fashion', subcategory: 'Men\'s Clothing', price: 45, originalPrice: 70 },
      { name: 'Garden Tools Expo', category: 'Home & Garden', subcategory: 'Garden Tools', price: 15, originalPrice: 25 }
    ];

    for (const eventData of additionalEvents) {
      const category = categories.find(cat => cat.name === eventData.category);
      const subcategory = subcategories.find(sub => sub.name === eventData.subcategory);
      const randomShop = shops[Math.floor(Math.random() * shops.length)];
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 7) + 1);
      
      const eventDiscountPrice = eventData.originalPrice - eventData.price;
      
      const event = new Event({
        name: eventData.name,
        description: `Join us for ${eventData.name.toLowerCase()} with amazing deals and offers!`,
        price: eventData.price,
        originalPrice: eventData.originalPrice,
        discountPrice: eventDiscountPrice,
        stock: Math.floor(Math.random() * 50) + 5,
        images: [{
          url: `https://picsum.photos/600/400?random=${Math.floor(Math.random() * 10000)}`,
          public_id: `event_${Date.now()}_${Math.random()}`
        }],
        category: category._id,
        subcategory: subcategory._id,
        shop: {
          _id: randomShop._id,
          name: randomShop.name,
          seller: randomShop.seller
        },
        start_Date: startDate,
        Finish_Date: endDate,
        ratings: Math.random() * 2 + 3,
        numOfReviews: Math.floor(Math.random() * 30) + 3,
        isActive: Math.random() > 0.1,
        viewCount: Math.floor(Math.random() * 500) + 5,
        whatsappClicks: Math.floor(Math.random() * 50) + 1,
        favoritesCount: Math.floor(Math.random() * 25) + 1,
        tags: 'event, special, limited'
      });
      
      await event.save();
    }
    console.log(`✅ Added ${additionalEvents.length} events`);

    // Add wishlist data to users
    console.log('❤️ Adding wishlist data...');
    const allProducts = await Product.find();
    
    for (const user of users) {
      const randomProducts = allProducts.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 8) + 1);
      user.wishlist = randomProducts.map(product => product._id);
      await user.save();
    }
    console.log(`✅ Added wishlist data to ${users.length} users`);

    // Final statistics
    const finalStats = {
      users: await User.countDocuments(),
      products: await Product.countDocuments(),
      events: await Event.countDocuments(),
      shops: await Shop.countDocuments(),
      categories: await Category.countDocuments(),
      subcategories: await SubCategory.countDocuments()
    };

    console.log('\n🎉 Database enhanced successfully!');
    console.log(`📊 Final Statistics:`);
    console.log(`   - Users: ${finalStats.users}`);
    console.log(`   - Products: ${finalStats.products}`);
    console.log(`   - Events: ${finalStats.events}`);
    console.log(`   - Shops: ${finalStats.shops}`);
    console.log(`   - Categories: ${finalStats.categories}`);
    console.log(`   - Subcategories: ${finalStats.subcategories}`);

  } catch (error) {
    console.error('❌ Error enhancing database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
addMoreData();



