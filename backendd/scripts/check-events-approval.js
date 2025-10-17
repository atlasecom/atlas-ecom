const mongoose = require('mongoose');
const Event = require('../models/Event');
const Shop = require('../models/Shop');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');

require('dotenv').config({ path: './config.env' });

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkEventsApproval() {
  try {
    console.log('🔍 Checking Events Approval Status...\n');

    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ isActive: true });
    const approvedEvents = await Event.countDocuments({ isApproved: true });
    const boostedEvents = await Event.countDocuments({ isBoosted: true });

    console.log(`📊 Total events: ${totalEvents}`);
    console.log(`✅ Active events: ${activeEvents}`);
    console.log(`✅ Approved events: ${approvedEvents}`);
    console.log(`🚀 Boosted events: ${boostedEvents}`);

    console.log('\n📅 Recent events (last 10):');
    const recentEvents = await Event.find()
      .populate('shop', 'name')
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    recentEvents.forEach((event, i) => {
      console.log(`${i + 1}. ${event.name}`);
      console.log(`   Shop: ${event.shop?.name || 'N/A'}`);
      console.log(`   Active: ${event.isActive}`);
      console.log(`   Approved: ${event.isApproved}`);
      console.log(`   Boosted: ${event.isBoosted}`);
      console.log(`   Created: ${event.createdAt}`);
      console.log('');
    });

    // Fix events that are not approved
    const unapprovedEvents = await Event.find({ isApproved: { $ne: true } });
    if (unapprovedEvents.length > 0) {
      console.log(`\n🔧 Found ${unapprovedEvents.length} events that need approval...`);
      
      for (const event of unapprovedEvents) {
        event.isApproved = true;
        event.isActive = true;
        await event.save();
        console.log(`✅ Fixed: ${event.name}`);
      }
      
      console.log('\n📊 Updated status:');
      const newApprovedEvents = await Event.countDocuments({ isApproved: true });
      const newActiveEvents = await Event.countDocuments({ isActive: true });
      console.log(`✅ Active events: ${newActiveEvents}`);
      console.log(`✅ Approved events: ${newApprovedEvents}`);
    } else {
      console.log('\n✅ All events are already approved!');
    }

  } catch (error) {
    console.error('❌ Error checking events approval:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkEventsApproval();
