const mongoose = require('mongoose');
const Event = require('../models/Event');

require('dotenv').config({ path: './config.env' });

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixEventsApprovalManual() {
  try {
    console.log('🔧 Manually fixing events approval status...');

    // Find all events
    const events = await Event.find({});
    console.log(`Found ${events.length} events`);

    // Update each event individually
    for (const event of events) {
      await Event.findByIdAndUpdate(event._id, {
        $set: {
          isApproved: true,
          isActive: true
        }
      });
      console.log(`✅ Updated ${event.name}`);
    }

    // Verify the update
    const totalEvents = await Event.countDocuments();
    const approvedEvents = await Event.countDocuments({ isApproved: true });
    const activeEvents = await Event.countDocuments({ isActive: true });

    console.log('\n📊 Final Events Status:');
    console.log(`Total events: ${totalEvents}`);
    console.log(`Approved: ${approvedEvents}`);
    console.log(`Active: ${activeEvents}`);

    console.log('\n✅ Events approval status fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing events approval status:', error);
  } finally {
    mongoose.disconnect();
  }
}

fixEventsApprovalManual();
