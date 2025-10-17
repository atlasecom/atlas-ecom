const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

const Product = require('../models/Product');
const Event = require('../models/Event');
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

const checkBoostedProducts = async () => {
  try {
    console.log('🔍 Checking boosted products...\n');

    // Check boosted products
    const boostedProducts = await Product.find({ isBoosted: true })
      .populate('shop', 'name verifiedBadge')
      .sort({ boostPriority: -1, createdAt: -1 })
      .limit(10);

    console.log(`📦 Found ${boostedProducts.length} boosted products:`);
    boostedProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   - Boosted: ${product.isBoosted}`);
      console.log(`   - Priority: ${product.boostPriority}`);
      console.log(`   - Shop: ${product.shop?.name} (Verified: ${product.shop?.verifiedBadge})`);
      console.log(`   - Active: ${product.isActive}, Approved: ${product.isApproved}`);
      console.log('');
    });

    // Check regular products
    const regularProducts = await Product.find({ isBoosted: false })
      .populate('shop', 'name verifiedBadge')
      .sort({ createdAt: -1 })
      .limit(5);

    console.log(`📦 Found ${regularProducts.length} regular products (showing first 5):`);
    regularProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   - Boosted: ${product.isBoosted}`);
      console.log(`   - Shop: ${product.shop?.name} (Verified: ${product.shop?.verifiedBadge})`);
      console.log(`   - Active: ${product.isActive}, Approved: ${product.isApproved}`);
      console.log('');
    });

    // Check boosted events
    const boostedEvents = await Event.find({ isBoosted: true })
      .populate('shop', 'name verifiedBadge')
      .sort({ boostPriority: -1, start_Date: 1 })
      .limit(5);

    console.log(`🎉 Found ${boostedEvents.length} boosted events:`);
    boostedEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.name}`);
      console.log(`   - Boosted: ${event.isBoosted}`);
      console.log(`   - Priority: ${event.boostPriority}`);
      console.log(`   - Shop: ${event.shop?.name} (Verified: ${event.shop?.verifiedBadge})`);
      console.log(`   - Active: ${event.isActive}`);
      console.log('');
    });

    // Check verified shops
    const verifiedShops = await Shop.find({ verifiedBadge: true });
    console.log(`🏪 Found ${verifiedShops.length} verified shops:`);
    verifiedShops.forEach((shop, index) => {
      console.log(`${index + 1}. ${shop.name} (Verified: ${shop.verifiedBadge})`);
    });

  } catch (error) {
    console.error('❌ Error checking products:', error);
  } finally {
    mongoose.disconnect();
  }
};

connectDB().then(() => checkBoostedProducts());
