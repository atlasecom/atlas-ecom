const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

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

const fixShopBadgesManual = async () => {
  try {
    console.log('🔧 Manually fixing shop badges...\n');

    // Get all shops
    const shops = await Shop.find();
    console.log(`Found ${shops.length} shops`);

    // Get all verified sellers
    const verifiedSellers = await User.find({ role: 'seller', verifiedBadge: true });
    console.log(`Found ${verifiedSellers.length} verified sellers`);

    // Update shops for verified sellers
    for (const seller of verifiedSellers) {
      const shop = await Shop.findOne({ owner: seller._id });
      if (shop) {
        // Update the shop to have verified badge
        await Shop.updateOne(
          { _id: shop._id },
          { $set: { verifiedBadge: true } }
        );
        console.log(`✅ Updated shop: ${shop.name} - Verified: true`);
      }
    }

    // Also update specific shops by name
    const shopNamesToVerify = [
      'Tech Solutions Store',
      'Fashion World Boutique',
      'Verified Shop 1',
      'Verified Shop 2',
      'Verified Shop 3',
      'Verified Shop 4',
      'Verified Shop 5'
    ];

    for (const shopName of shopNamesToVerify) {
      await Shop.updateOne(
        { name: shopName },
        { $set: { verifiedBadge: true } }
      );
      console.log(`✅ Updated shop by name: ${shopName} - Verified: true`);
    }

    // Verify the changes
    const verifiedShops = await Shop.find({ verifiedBadge: true });
    console.log(`\n✅ Total verified shops: ${verifiedShops.length}`);
    verifiedShops.forEach(shop => {
      console.log(`   - ${shop.name} (Verified: ${shop.verifiedBadge})`);
    });

  } catch (error) {
    console.error('❌ Error fixing shop badges:', error);
  } finally {
    mongoose.disconnect();
  }
};

connectDB().then(() => fixShopBadgesManual());
