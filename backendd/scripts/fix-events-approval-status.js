const mongoose = require('mongoose');
const Event = require('../models/Event');

require('dotenv').config({ path: './config.env' });

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixEventsApprovalStatus() {
  try {
    console.log('🔧 Fixing Events Approval Status...');

    // Set isApproved to true for all events
    const updateResult = await Event.updateMany(
      {},
      { $set: { isApproved: true } }
    );
    console.log(`✅ Updated ${updateResult.modifiedCount} events with approval status`);

    // Set isActive to true for all events
    const activeUpdateResult = await Event.updateMany(
      {},
      { $set: { isActive: true } }
    );
    console.log(`✅ Updated ${activeUpdateResult.modifiedCount} events with active status`);

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

fixEventsApprovalStatus();
