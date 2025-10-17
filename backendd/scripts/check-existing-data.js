const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');
const Product = require('../models/Product');
const Event = require('../models/Event');
const User = require('../models/User');
const Shop = require('../models/Shop');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const checkExistingData = async () => {
  try {
    console.log('🔍 Checking existing data...\n');

    // Check categories
    const categories = await Category.find();
    console.log('📂 CATEGORIES:');
    categories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat._id})`);
    });

    // Check subcategories
    const subcategories = await SubCategory.find();
    console.log('\n📁 SUBCATEGORIES:');
    subcategories.forEach(sub => {
      console.log(`   - ${sub.name} (${sub._id}) - Category: ${sub.category}`);
    });

    // Check products
    const products = await Product.find().populate('shop', 'name verifiedBadge');
    console.log('\n📦 PRODUCTS:');
    products.forEach(prod => {
      console.log(`   - ${prod.name} - Boosted: ${prod.isBoosted} - Shop: ${prod.shop?.name} (Verified: ${prod.shop?.verifiedBadge})`);
    });

    // Check events
    const events = await Event.find().populate('shop', 'name verifiedBadge');
    console.log('\n🎉 EVENTS:');
    events.forEach(event => {
      console.log(`   - ${event.name} - Boosted: ${event.isBoosted} - Shop: ${event.shop?.name} (Verified: ${event.shop?.verifiedBadge})`);
    });

    // Check sellers
    const sellers = await User.find({ role: 'seller' });
    console.log('\n👤 SELLERS:');
    sellers.forEach(seller => {
      console.log(`   - ${seller.name} - Verified: ${seller.verifiedBadge}`);
    });

    // Check shops
    const shops = await Shop.find();
    console.log('\n🏪 SHOPS:');
    shops.forEach(shop => {
      console.log(`   - ${shop.name} - Verified: ${shop.verifiedBadge}`);
    });

  } catch (error) {
    console.error('❌ Error checking data:', error);
  } finally {
    mongoose.disconnect();
  }
};

connectDB().then(() => checkExistingData());
