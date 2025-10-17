const mongoose = require('mongoose');
const Event = require('../models/Event');
const Shop = require('../models/Shop');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');

// Load environment variables
require('dotenv').config({ path: './config.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkEventsStatus() {
  try {
    console.log('🔍 Checking Events Status...\n');
    
    const totalEvents = await Event.countDocuments();
    const activeEvents = await Event.countDocuments({ isActive: true });
    const approvedEvents = await Event.countDocuments({ isApproved: true });
    const boostedEvents = await Event.countDocuments({ isBoosted: true });
    
    console.log(`📊 Total events: ${totalEvents}`);
    console.log(`✅ Active events: ${activeEvents}`);
    console.log(`✅ Approved events: ${approvedEvents}`);
    console.log(`🚀 Boosted events: ${boostedEvents}`);
    
    // Check events with dates
    const currentDate = new Date();
    console.log(`\n📅 Current date: ${currentDate.toISOString()}`);
    
    const eventsWithDates = await Event.find({ 
      start_Date: { $exists: true } 
    }).limit(5);
    
    console.log('\n📅 Sample events with dates:');
    eventsWithDates.forEach((event, i) => {
      console.log(`${i + 1}. ${event.name}`);
      console.log(`   Start: ${event.start_Date}`);
      console.log(`   Finish: ${event.Finish_Date}`);
      console.log(`   Active: ${event.isActive}`);
      console.log(`   Approved: ${event.isApproved}`);
      console.log(`   Boosted: ${event.isBoosted}`);
      console.log('');
    });
    
    // Check events that would be returned by the API
    const apiEvents = await Event.find({ 
      isActive: true,
      $or: [
        { start_Date: { $exists: false } },
        { start_Date: { $lte: currentDate } }
      ]
    }).limit(5);
    
    console.log(`\n🌐 Events returned by API: ${apiEvents.length}`);
    apiEvents.forEach((event, i) => {
      console.log(`${i + 1}. ${event.name} - ${event.isBoosted ? 'Boosted' : 'Normal'}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking events status:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkEventsStatus();
