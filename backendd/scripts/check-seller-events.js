const mongoose = require('mongoose');
const Event = require('../models/Event');
const Shop = require('../models/Shop');
const User = require('../models/User');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');

require('dotenv').config({ path: './config.env' });

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkSellerEvents() {
  try {
    console.log('🔍 Checking Seller Events...\n');

    // Get all events created by sellers (non-admin users)
    const sellerUsers = await User.find({ role: { $ne: 'admin' } });
    const sellerUserIds = sellerUsers.map(user => user._id);
    
    console.log(`👥 Found ${sellerUserIds.length} seller users`);

    // Get shops owned by sellers
    const sellerShops = await Shop.find({ owner: { $in: sellerUserIds } });
    const sellerShopIds = sellerShops.map(shop => shop._id);
    
    console.log(`🏪 Found ${sellerShopIds.length} seller shops`);

    // Get events created by sellers
    const sellerEvents = await Event.find({ shop: { $in: sellerShopIds } })
      .populate('shop', 'name owner')
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .sort({ createdAt: -1 });

    console.log(`\n📊 Seller Events (${sellerEvents.length} total):`);
    
    sellerEvents.forEach((event, i) => {
      console.log(`${i + 1}. ${event.name}`);
      console.log(`   Shop: ${event.shop?.name || 'N/A'}`);
      console.log(`   Owner: ${event.shop?.owner || 'N/A'}`);
      console.log(`   Active: ${event.isActive}`);
      console.log(`   Approved: ${event.isApproved}`);
      console.log(`   Boosted: ${event.isBoosted}`);
      console.log(`   Status: ${event.status}`);
      console.log(`   Created: ${event.createdAt}`);
      console.log('');
    });

    // Check which events would appear in API
    const apiEvents = await Event.find({ 
      isActive: true,
      isApproved: true,
      shop: { $in: sellerShopIds }
    });

    console.log(`\n🌐 Events that would appear in API: ${apiEvents.length}`);
    apiEvents.forEach((event, i) => {
      console.log(`${i + 1}. ${event.name} - ${event.isBoosted ? 'Boosted' : 'Normal'}`);
    });

    // Fix events that are not approved or active
    const unapprovedEvents = await Event.find({ 
      shop: { $in: sellerShopIds },
      $or: [
        { isActive: { $ne: true } },
        { isApproved: { $ne: true } }
      ]
    });

    if (unapprovedEvents.length > 0) {
      console.log(`\n🔧 Found ${unapprovedEvents.length} events that need approval...`);
      
      const updateResult = await Event.updateMany(
        { 
          shop: { $in: sellerShopIds },
          $or: [
            { isActive: { $ne: true } },
            { isApproved: { $ne: true } }
          ]
        },
        { $set: { isActive: true, isApproved: true } }
      );
      
      console.log(`✅ Updated ${updateResult.modifiedCount} seller events`);
      
      // Check final counts
      const finalApiEvents = await Event.find({ 
        isActive: true,
        isApproved: true,
        shop: { $in: sellerShopIds }
      });
      
      console.log(`\n📊 Final API Events: ${finalApiEvents.length}`);
      finalApiEvents.forEach((event, i) => {
        console.log(`${i + 1}. ${event.name} - ${event.isBoosted ? 'Boosted' : 'Normal'}`);
      });
    } else {
      console.log('\n✅ All seller events are already approved and active!');
    }

  } catch (error) {
    console.error('❌ Error checking seller events:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkSellerEvents();
