const mongoose = require('mongoose');
const Event = require('../models/Event');

require('dotenv').config({ path: './config.env' });

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixNormalEventsApproval() {
  try {
    console.log('🔧 Fixing Normal Events Approval...\n');

    // Find normal events that might not be approved
    const normalEvents = await Event.find({ isBoosted: false });
    console.log(`📊 Found ${normalEvents.length} normal events`);

    for (const event of normalEvents) {
      console.log(`Event: ${event.name}`);
      console.log(`  isActive: ${event.isActive}`);
      console.log(`  isApproved: ${event.isApproved}`);
      console.log(`  isBoosted: ${event.isBoosted}`);
      console.log('');
    }

    // Update all normal events to be approved and active
    const updateResult = await Event.updateMany(
      { isBoosted: false },
      { $set: { isActive: true, isApproved: true } }
    );
    console.log(`✅ Updated ${updateResult.modifiedCount} normal events`);

    // Check final counts
    const totalEvents = await Event.countDocuments();
    const boostedEvents = await Event.countDocuments({ isBoosted: true, isActive: true, isApproved: true });
    const normalEventsCount = await Event.countDocuments({ isBoosted: false, isActive: true, isApproved: true });

    console.log('\n📊 Final Event Counts:');
    console.log(`Total events: ${totalEvents}`);
    console.log(`Boosted events (active & approved): ${boostedEvents}`);
    console.log(`Normal events (active & approved): ${normalEventsCount}`);

    console.log('\n✅ Normal events approval fixed!');

  } catch (error) {
    console.error('❌ Error fixing normal events approval:', error);
  } finally {
    mongoose.disconnect();
  }
}

fixNormalEventsApproval();
