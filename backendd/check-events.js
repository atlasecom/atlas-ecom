const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

// Import models
const Event = require('./models/Event');

// Connect to MongoDB
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

const checkEvents = async () => {
  try {
    console.log('🔍 Checking events...\n');

    // Check all events
    const allEvents = await Event.find({});
    console.log(`Total events in database: ${allEvents.length}`);

    // Check boosted events
    const boostedEvents = await Event.find({ isBoosted: true });
    console.log(`\nBoosted events: ${boostedEvents.length}`);
    boostedEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.name}`);
      console.log(`   - isActive: ${event.isActive}`);
      console.log(`   - start_Date: ${event.start_Date}`);
      console.log(`   - boostPriority: ${event.boostPriority}`);
      console.log('');
    });

    // Check active events
    const activeEvents = await Event.find({ isActive: true });
    console.log(`\nActive events: ${activeEvents.length}`);
    activeEvents.forEach((event, index) => {
      console.log(`${index + 1}. ${event.name}`);
      console.log(`   - isBoosted: ${event.isBoosted}`);
      console.log(`   - start_Date: ${event.start_Date}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error checking events:', error);
  }
};

const main = async () => {
  await connectDB();
  await checkEvents();
  process.exit(0);
};

main();
