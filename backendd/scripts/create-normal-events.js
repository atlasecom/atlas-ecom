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

async function createNormalEvents() {
  try {
    console.log('🎪 Creating Normal (Non-Boosted) Events...\n');

    // Get a shop
    const shop = await Shop.findOne();
    if (!shop) {
      console.error('❌ No shop found. Please create a shop first.');
      return;
    }

    // Get categories and subcategories
    const category = await Category.findOne();
    const subcategory = await SubCategory.findOne();

    if (!category || !subcategory) {
      console.error('❌ No category or subcategory found. Please create them first.');
      return;
    }

    const normalEvents = [
      {
        name: "Weekend Market Sale",
        description: "Join us for our weekly market sale with fresh local products and great deals.",
        category: category._id,
        subcategory: subcategory._id,
        shop: shop._id,
        originalPrice: 100,
        discountPrice: 80,
        stock: 50,
        start_Date: new Date(),
        Finish_Date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: "Running",
        tags: "market, sale, weekend, local",
        images: [{
          public_id: "normal-event-1",
          url: "https://via.placeholder.com/400x300/28a745/FFFFFF?text=Weekend+Market"
        }],
        isActive: true,
        isApproved: true,
        isBoosted: false, // Normal event
        boostPriority: 0
      },
      {
        name: "Community Workshop",
        description: "Learn new skills in our community workshop. All skill levels welcome.",
        category: category._id,
        subcategory: subcategory._id,
        shop: shop._id,
        originalPrice: 50,
        discountPrice: 40,
        stock: 25,
        start_Date: new Date(),
        Finish_Date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: "Running",
        tags: "workshop, community, learning, skills",
        images: [{
          public_id: "normal-event-2",
          url: "https://via.placeholder.com/400x300/17a2b8/FFFFFF?text=Community+Workshop"
        }],
        isActive: true,
        isApproved: true,
        isBoosted: false, // Normal event
        boostPriority: 0
      },
      {
        name: "Local Art Exhibition",
        description: "Discover amazing local artists and their beautiful creations.",
        category: category._id,
        subcategory: subcategory._id,
        shop: shop._id,
        originalPrice: 30,
        discountPrice: 25,
        stock: 100,
        start_Date: new Date(),
        Finish_Date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        status: "Running",
        tags: "art, exhibition, local, culture",
        images: [{
          public_id: "normal-event-3",
          url: "https://via.placeholder.com/400x300/6f42c1/FFFFFF?text=Art+Exhibition"
        }],
        isActive: true,
        isApproved: true,
        isBoosted: false, // Normal event
        boostPriority: 0
      },
      {
        name: "Food Festival",
        description: "Taste delicious local cuisine from various vendors and food trucks.",
        category: category._id,
        subcategory: subcategory._id,
        shop: shop._id,
        originalPrice: 20,
        discountPrice: 15,
        stock: 200,
        start_Date: new Date(),
        Finish_Date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        status: "Running",
        tags: "food, festival, cuisine, local",
        images: [{
          public_id: "normal-event-4",
          url: "https://via.placeholder.com/400x300/fd7e14/FFFFFF?text=Food+Festival"
        }],
        isActive: true,
        isApproved: true,
        isBoosted: false, // Normal event
        boostPriority: 0
      },
      {
        name: "Music Night",
        description: "Enjoy live music performances from talented local musicians.",
        category: category._id,
        subcategory: subcategory._id,
        shop: shop._id,
        originalPrice: 40,
        discountPrice: 35,
        stock: 75,
        start_Date: new Date(),
        Finish_Date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        status: "Running",
        tags: "music, live, performance, entertainment",
        images: [{
          public_id: "normal-event-5",
          url: "https://via.placeholder.com/400x300/dc3545/FFFFFF?text=Music+Night"
        }],
        isActive: true,
        isApproved: true,
        isBoosted: false, // Normal event
        boostPriority: 0
      }
    ];

    console.log('📝 Creating events...');
    for (const eventData of normalEvents) {
      const event = new Event(eventData);
      await event.save();
      console.log(`✅ Created: ${event.name} (Non-Boosted)`);
    }

    // Check final counts
    const totalEvents = await Event.countDocuments();
    const boostedEvents = await Event.countDocuments({ isBoosted: true });
    const normalEventsCount = await Event.countDocuments({ isBoosted: false });

    console.log('\n📊 Final Event Counts:');
    console.log(`Total events: ${totalEvents}`);
    console.log(`Boosted events: ${boostedEvents}`);
    console.log(`Normal events: ${normalEventsCount}`);

    console.log('\n✅ Normal events created successfully!');
    console.log('🌐 Check the homepage to see the mixed display of boosted and normal events.');

  } catch (error) {
    console.error('❌ Error creating normal events:', error);
  } finally {
    mongoose.disconnect();
  }
}

createNormalEvents();
