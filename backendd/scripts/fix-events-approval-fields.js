const mongoose = require('mongoose');
const Event = require('../models/Event');

require('dotenv').config({ path: './config.env' });

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixEventsApprovalFields() {
  try {
    console.log('🔧 Fixing Events Approval Fields...');

    // Find events without approvalStatus
    const eventsWithoutStatus = await Event.find({ approvalStatus: { $exists: false } });
    console.log(`📊 Found ${eventsWithoutStatus.length} events without approval status`);

    if (eventsWithoutStatus.length > 0) {
      // Set approvalStatus to 'approved' for existing events
      const updateResult = await Event.updateMany(
        { approvalStatus: { $exists: false } },
        { 
          $set: { 
            approvalStatus: 'approved',
            isApproved: true
          } 
        }
      );
      console.log(`✅ Updated ${updateResult.modifiedCount} events with approval status`);
    }

    // Check final counts
    const totalEvents = await Event.countDocuments();
    const approvedEvents = await Event.countDocuments({ approvalStatus: 'approved' });
    const pendingEvents = await Event.countDocuments({ approvalStatus: 'pending' });
    const rejectedEvents = await Event.countDocuments({ approvalStatus: 'rejected' });

    console.log('\n📊 Final Events Status:');
    console.log(`Total events: ${totalEvents}`);
    console.log(`Approved: ${approvedEvents}`);
    console.log(`Pending: ${pendingEvents}`);
    console.log(`Rejected: ${rejectedEvents}`);

    console.log('\n✅ Events approval fields fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing events approval fields:', error);
  } finally {
    mongoose.disconnect();
  }
}

fixEventsApprovalFields();
