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

async function checkSpecificEvent() {
  try {
    console.log('🔍 Checking Specific Event...\n');

    const eventId = '68f019f78ef1f2cbab22d180';
    
    // Check if event exists
    const event = await Event.findById(eventId)
      .populate('shop', 'name owner verifiedBadge')
      .populate('category', 'name nameAr nameFr image')
      .populate('subcategory', 'name nameAr nameFr image tags');

    if (!event) {
      console.log('❌ Event not found with ID:', eventId);
      return;
    }

    console.log('✅ Event found:');
    console.log(`   Name: ${event.name}`);
    console.log(`   Active: ${event.isActive}`);
    console.log(`   Approved: ${event.isApproved}`);
    console.log(`   Approval Status: ${event.approvalStatus}`);
    console.log(`   Boosted: ${event.isBoosted}`);
    console.log(`   Priority: ${event.boostPriority}`);
    console.log(`   Status: ${event.status}`);
    console.log(`   Created: ${event.createdAt}`);
    console.log(`   Shop: ${event.shop?.name || 'N/A'}`);
    console.log(`   Category: ${event.category?.name || 'N/A'}`);
    console.log(`   Subcategory: ${event.subcategory?.name || 'N/A'}`);

    // Check if event would appear in API
    const apiEvents = await Event.find({ 
      isActive: true,
      isApproved: true
    })
      .populate('shop', 'name avatar phoneNumber telegram verifiedBadge')
      .populate('category', 'name nameAr nameFr image')
      .populate('subcategory', 'name nameAr nameFr image tags')
      .limit(50)
      .sort({ 
        isBoosted: -1,
        boostPriority: -1,
        createdAt: -1
      });

    const eventInApi = apiEvents.find(e => e._id.toString() === eventId);
    
    if (eventInApi) {
      console.log('\n✅ Event appears in API results');
      console.log(`   Position in API: ${apiEvents.findIndex(e => e._id.toString() === eventId) + 1}`);
    } else {
      console.log('\n❌ Event does NOT appear in API results');
    }

    // Check all events in API
    console.log('\n📊 All events in API:');
    apiEvents.forEach((e, i) => {
      console.log(`${i + 1}. ${e.name} - Boosted: ${e.isBoosted} - ID: ${e._id}`);
    });

  } catch (error) {
    console.error('❌ Error checking specific event:', error);
  } finally {
    mongoose.disconnect();
  }
}

checkSpecificEvent();
