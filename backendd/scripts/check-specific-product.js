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

async function checkSpecificProduct() {
  try {
    console.log('🔍 Checking Specific Product...\n');
    
    const productId = '68eb90e33b35213c2c6fa8bb';
    
    const product = await Product.findById(productId)
      .populate('shop', 'name owner verifiedBadge')
      .populate('category', 'name nameAr nameFr image')
      .populate('subcategory', 'name nameAr nameFr image tags');
    
    if (!product) {
      console.log(`❌ Product with ID ${productId} not found`);
      return;
    }
    
    console.log(`✅ Product found: ${product.name}`);
    console.log(`📊 Product details:`);
    console.log(`   - ID: ${product._id}`);
    console.log(`   - Name: ${product.name}`);
    console.log(`   - Description: ${product.description?.substring(0, 100)}...`);
    console.log(`   - Price: ${product.originalPrice} - ${product.discountPrice}`);
    console.log(`   - Stock: ${product.stock}`);
    console.log(`   - isActive: ${product.isActive}`);
    console.log(`   - isApproved: ${product.isApproved}`);
    console.log(`   - approvalStatus: ${product.approvalStatus}`);
    console.log(`   - isBoosted: ${product.isBoosted}`);
    console.log(`   - Shop: ${product.shop?.name || 'N/A'}`);
    console.log(`   - Category: ${product.category?.name || 'N/A'}`);
    console.log(`   - Subcategory: ${product.subcategory?.name || 'N/A'}`);
    console.log(`   - Images: ${product.images?.length || 0} images`);
    console.log(`   - Created: ${product.createdAt}`);
    
    // Check if product should be visible
    const isVisible = product.isActive && product.isApproved;
    console.log(`\n👁️ Product visibility: ${isVisible ? 'VISIBLE' : 'NOT VISIBLE'}`);
    
    if (!isVisible) {
      console.log(`   - isActive: ${product.isActive} (should be true)`);
      console.log(`   - isApproved: ${product.isApproved} (should be true)`);
    }
    
  } catch (error) {
    console.error('❌ Error checking specific product:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkSpecificProduct();
