const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

// Import models
const Product = require('./models/Product');
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

const fixBoostedProducts = async () => {
  try {
    console.log('🔧 Fixing boosted products...\n');

    // Fix boosted products - set them as approved and active
    const boostedProducts = await Product.find({ isBoosted: true });
    console.log(`Found ${boostedProducts.length} boosted products`);

    for (const product of boostedProducts) {
      await Product.findByIdAndUpdate(product._id, {
        isApproved: true,
        isActive: true
      });
      console.log(`✅ Fixed product: ${product.name}`);
    }

    // Fix boosted events - set them as active
    const boostedEvents = await Event.find({ isBoosted: true });
    console.log(`\nFound ${boostedEvents.length} boosted events`);

    for (const event of boostedEvents) {
      await Event.findByIdAndUpdate(event._id, {
        isActive: true
      });
      console.log(`✅ Fixed event: ${event.name}`);
    }

    console.log('\n🎉 All boosted products and events are now active and approved!');

  } catch (error) {
    console.error('❌ Error fixing data:', error);
  }
};

const main = async () => {
  await connectDB();
  await fixBoostedProducts();
  process.exit(0);
};

main();
