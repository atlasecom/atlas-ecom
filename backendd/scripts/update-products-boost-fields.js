const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

const Product = require('../models/Product');
const Event = require('../models/Event');

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

const updateProductsBoostFields = async () => {
  try {
    console.log('🔧 Updating products boost fields...\n');

    // Update all products to ensure they have isBoosted and boostPriority fields
    const products = await Product.find({});
    console.log(`Found ${products.length} products to update`);

    for (const product of products) {
      let needsUpdate = false;
      const updateData = {};

      // Set isBoosted to false if not defined
      if (product.isBoosted === undefined) {
        updateData.isBoosted = false;
        needsUpdate = true;
      }

      // Set boostPriority to 0 if not defined
      if (product.boostPriority === undefined) {
        updateData.boostPriority = 0;
        needsUpdate = true;
      }

      // Set isActive and isApproved to true if not defined
      if (product.isActive === undefined) {
        updateData.isActive = true;
        needsUpdate = true;
      }

      if (product.isApproved === undefined) {
        updateData.isApproved = true;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Product.updateOne(
          { _id: product._id },
          { $set: updateData }
        );
        console.log(`✅ Updated product: ${product.name}`);
      }
    }

    // Update all events to ensure they have isBoosted and boostPriority fields
    const events = await Event.find({});
    console.log(`\nFound ${events.length} events to update`);

    for (const event of events) {
      let needsUpdate = false;
      const updateData = {};

      // Set isBoosted to false if not defined
      if (event.isBoosted === undefined) {
        updateData.isBoosted = false;
        needsUpdate = true;
      }

      // Set boostPriority to 0 if not defined
      if (event.boostPriority === undefined) {
        updateData.boostPriority = 0;
        needsUpdate = true;
      }

      // Set isActive to true if not defined
      if (event.isActive === undefined) {
        updateData.isActive = true;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await Event.updateOne(
          { _id: event._id },
          { $set: updateData }
        );
        console.log(`✅ Updated event: ${event.name}`);
      }
    }

    console.log('\n🎉 All products and events updated!');

  } catch (error) {
    console.error('❌ Error updating products:', error);
  } finally {
    mongoose.disconnect();
  }
};

connectDB().then(() => updateProductsBoostFields());
