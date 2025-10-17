const mongoose = require('mongoose');
const Product = require('../models/Product');

// Load environment variables
require('dotenv').config({ path: './config.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkProductBoostStatus() {
  try {
    console.log('🔍 Checking Product Boost Status...\n');
    
    const totalProducts = await Product.countDocuments();
    const boostedProducts = await Product.countDocuments({ isBoosted: true });
    const nonBoostedProducts = await Product.countDocuments({ isBoosted: false });
    const approvedProducts = await Product.countDocuments({ isApproved: true });
    const pendingProducts = await Product.countDocuments({ isApproved: false });
    
    console.log(`📊 Total products: ${totalProducts}`);
    console.log(`🚀 Boosted products: ${boostedProducts}`);
    console.log(`📦 Non-boosted products: ${nonBoostedProducts}`);
    console.log(`✅ Approved products: ${approvedProducts}`);
    console.log(`⏳ Pending products: ${pendingProducts}`);
    
    // Check approved non-boosted products
    const approvedNonBoosted = await Product.countDocuments({ 
      isApproved: true, 
      isBoosted: false 
    });
    console.log(`✅📦 Approved non-boosted products: ${approvedNonBoosted}`);
    
    // Show some examples
    console.log('\n📋 Sample non-boosted products:');
    const sampleNonBoosted = await Product.find({ 
      isApproved: true, 
      isBoosted: false 
    }).limit(5).select('name isBoosted isApproved');
    
    sampleNonBoosted.forEach((product, index) => {
      console.log(`${index + 1}. ${product.name} - Boosted: ${product.isBoosted}, Approved: ${product.isApproved}`);
    });
    
  } catch (error) {
    console.error('❌ Error checking product boost status:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkProductBoostStatus();
