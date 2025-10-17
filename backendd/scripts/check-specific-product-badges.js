const mongoose = require('mongoose');
const Product = require('../models/Product');
const Shop = require('../models/Shop');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');

// Load environment variables
require('dotenv').config({ path: './config.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkSpecificProductBadges() {
  try {
    console.log('🔍 Checking Specific Product Badges...\n');
    
    const productId = '68ef79dce25030ec96b64e35';
    const shopId = '68ef79dce25030ec96b64e22';
    
    // Check product
    const product = await Product.findById(productId)
      .populate('shop', 'name owner verifiedBadge')
      .populate('category', 'name nameAr nameFr image')
      .populate('subcategory', 'name nameAr nameFr image tags');
    
    if (!product) {
      console.log(`❌ Product with ID ${productId} not found`);
      return;
    }
    
    console.log(`✅ Product found: ${product.name}`);
    console.log(`📊 Product badges:`);
    console.log(`   - isBoosted: ${product.isBoosted}`);
    console.log(`   - boostPriority: ${product.boostPriority}`);
    console.log(`   - Shop verifiedBadge: ${product.shop?.verifiedBadge}`);
    console.log(`   - Shop name: ${product.shop?.name}`);
    
    // Check shop
    const shop = await Shop.findById(shopId);
    if (shop) {
      console.log(`\n🏪 Shop found: ${shop.name}`);
      console.log(`📊 Shop badges:`);
      console.log(`   - verifiedBadge: ${shop.verifiedBadge}`);
      console.log(`   - Owner: ${shop.owner}`);
    } else {
      console.log(`❌ Shop with ID ${shopId} not found`);
    }
    
  } catch (error) {
    console.error('❌ Error checking product badges:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkSpecificProductBadges();
