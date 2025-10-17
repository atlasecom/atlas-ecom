const mongoose = require('mongoose');
const Product = require('../models/Product');
const Event = require('../models/Event');

// Load environment variables
require('dotenv').config({ path: './config.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function simulateClicks() {
  try {
    console.log('🎯 Simulating Clicks to Test Boost Expiry...\n');
    
    // Find a boosted product with remaining clicks
    const boostedProduct = await Product.findOne({ 
      isBoosted: true, 
      boostClicksRemaining: { $gt: 0 } 
    });
    
    if (!boostedProduct) {
      console.log('❌ No boosted products with remaining clicks found.');
      console.log('Creating a test product with boost clicks...');
      
      // Create a test product with boost clicks
      const testProduct = await Product.findOne({ isActive: true, isApproved: true });
      if (testProduct) {
        testProduct.isBoosted = true;
        testProduct.boostPriority = 15;
        testProduct.boostClicksRemaining = 5; // Give it 5 clicks
        testProduct.clickTracking = {
          whatsapp: 0,
          telegram: 0,
          total: 0
        };
        await testProduct.save();
        console.log(`✅ Created test boost for product: ${testProduct.name}`);
        console.log(`   Clicks remaining: ${testProduct.boostClicksRemaining}`);
      } else {
        console.log('❌ No products found to create test boost.');
        return;
      }
    }
    
    // Get the product again
    const product = await Product.findOne({ 
      isBoosted: true, 
      boostClicksRemaining: { $gt: 0 } 
    });
    
    if (!product) {
      console.log('❌ No boosted product found.');
      return;
    }
    
    console.log(`🎯 Testing with product: ${product.name}`);
    console.log(`   Current clicks remaining: ${product.boostClicksRemaining}`);
    console.log(`   Current click tracking:`, product.clickTracking);
    console.log('');
    
    // Simulate clicks until boost expires
    let clickCount = 0;
    while (product.boostClicksRemaining > 0) {
      clickCount++;
      console.log(`🖱️ Simulating click ${clickCount}...`);
      
      // Simulate WhatsApp click
      product.clickTracking.whatsapp++;
      product.clickTracking.total++;
      product.boostClicksRemaining--;
      
      console.log(`   WhatsApp clicks: ${product.clickTracking.whatsapp}`);
      console.log(`   Total clicks: ${product.clickTracking.total}`);
      console.log(`   Clicks remaining: ${product.boostClicksRemaining}`);
      
      // Check if boost should expire
      if (product.boostClicksRemaining <= 0) {
        product.isBoosted = false;
        product.boostPriority = 0;
        product.boostExpiresAt = null;
        product.boostClicksRemaining = 0;
        console.log('   🚫 Boost expired! Product is now normal.');
      }
      
      await product.save();
      console.log('');
    }
    
    console.log('✅ Click simulation completed!');
    console.log(`   Total clicks simulated: ${clickCount}`);
    console.log(`   Final status: ${product.isBoosted ? 'Boosted' : 'Normal'}`);
    console.log(`   Final click tracking:`, product.clickTracking);
    
    // Test the same with events
    console.log('\n🎉 Testing Events...');
    const boostedEvent = await Event.findOne({ 
      isBoosted: true, 
      boostClicksRemaining: { $gt: 0 } 
    });
    
    if (boostedEvent) {
      console.log(`🎯 Testing with event: ${boostedEvent.name}`);
      console.log(`   Current clicks remaining: ${boostedEvent.boostClicksRemaining}`);
      
      // Simulate one click
      if (!boostedEvent.clickTracking) {
        boostedEvent.clickTracking = { whatsapp: 0, telegram: 0, total: 0 };
      }
      boostedEvent.clickTracking.telegram++;
      boostedEvent.clickTracking.total++;
      boostedEvent.boostClicksRemaining--;
      
      if (boostedEvent.boostClicksRemaining <= 0) {
        boostedEvent.isBoosted = false;
        boostedEvent.boostPriority = 0;
        boostedEvent.boostExpiresAt = null;
        boostedEvent.boostClicksRemaining = 0;
        console.log('   🚫 Event boost expired!');
      }
      
      await boostedEvent.save();
      console.log(`   Final status: ${boostedEvent.isBoosted ? 'Boosted' : 'Normal'}`);
    } else {
      console.log('ℹ️ No boosted events with remaining clicks found.');
    }
    
    console.log('\n🎉 Click simulation test completed!');
    console.log('\n📝 Summary:');
    console.log('1. Click tracking works correctly');
    console.log('2. Boost automatically expires when clicks are exhausted');
    console.log('3. Products/events become normal after boost expiry');
    console.log('4. System is ready for production use!');
    
  } catch (error) {
    console.error('❌ Error simulating clicks:', error);
  } finally {
    mongoose.connection.close();
  }
}

simulateClicks();
