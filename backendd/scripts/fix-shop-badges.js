const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

const User = require('../models/User');
const Shop = require('../models/Shop');
const Product = require('../models/Product');
const Event = require('../models/Event');

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

const fixShopBadges = async () => {
  try {
    console.log('🔧 Fixing shop badges...\n');

    // Get all verified sellers
    const verifiedSellers = await User.find({ role: 'seller', verifiedBadge: true });
    console.log(`Found ${verifiedSellers.length} verified sellers`);

    // Update their shops to have verified badges
    for (const seller of verifiedSellers) {
      const shop = await Shop.findOne({ owner: seller._id });
      if (shop) {
        shop.verifiedBadge = true;
        await shop.save();
        console.log(`✅ Updated shop: ${shop.name} - Verified: ${shop.verifiedBadge}`);
      }
    }

    // Update all boosted products to be active and approved
    const boostedProducts = await Product.find({ isBoosted: true });
    console.log(`\nFound ${boostedProducts.length} boosted products`);
    
    for (const product of boostedProducts) {
      product.isActive = true;
      product.isApproved = true;
      await product.save();
      console.log(`✅ Fixed product: ${product.name}`);
    }

    // Update all boosted events to be active
    const boostedEvents = await Event.find({ isBoosted: true });
    console.log(`\nFound ${boostedEvents.length} boosted events`);
    
    for (const event of boostedEvents) {
      event.isActive = true;
      await event.save();
      console.log(`✅ Fixed event: ${event.name}`);
    }

    console.log('\n🎉 All badges and statuses fixed!');

  } catch (error) {
    console.error('❌ Error fixing badges:', error);
  } finally {
    mongoose.disconnect();
  }
};

connectDB().then(() => fixShopBadges());
