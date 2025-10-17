const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Event = require('../models/Event');
const Shop = require('../models/Shop');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');

async function checkDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check current data
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const eventCount = await Event.countDocuments();
    const shopCount = await Shop.countDocuments();
    const categoryCount = await Category.countDocuments();
    const subcategoryCount = await SubCategory.countDocuments();

    console.log('\n📊 Current Database Status:');
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Products: ${productCount}`);
    console.log(`   - Events: ${eventCount}`);
    console.log(`   - Shops: ${shopCount}`);
    console.log(`   - Categories: ${categoryCount}`);
    console.log(`   - Subcategories: ${subcategoryCount}`);

    // Show some sample data
    if (userCount > 0) {
      console.log('\n👥 Sample Users:');
      const users = await User.find().limit(3).select('name email role');
      users.forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
      });
    }

    if (productCount > 0) {
      console.log('\n📦 Sample Products:');
      const products = await Product.find().limit(3).select('name price viewCount');
      products.forEach(product => {
        console.log(`   - ${product.name} - $${product.price} - ${product.viewCount} views`);
      });
    }

    if (categoryCount > 0) {
      console.log('\n📁 Categories:');
      const categories = await Category.find().select('name');
      categories.forEach(category => {
        console.log(`   - ${category.name}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
checkDatabase();



