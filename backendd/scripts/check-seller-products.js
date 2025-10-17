const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');
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

async function checkSellerProducts() {
  try {
    console.log('🔍 Checking Seller Products...\n');
    
    // Get all products with their shop and approval status
    const products = await Product.find({})
      .populate('shop', 'name owner')
      .populate('category', 'name')
      .populate('subcategory', 'name')
      .sort({ createdAt: -1 });
    
    console.log(`📊 Total products found: ${products.length}\n`);
    
    // Group by approval status
    const statusCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      undefined: 0
    };
    
    products.forEach(product => {
      if (!product.approvalStatus) {
        statusCounts.undefined++;
      } else {
        statusCounts[product.approvalStatus]++;
      }
    });
    
    console.log('📈 Products by approval status:');
    console.log(`   Pending: ${statusCounts.pending}`);
    console.log(`   Approved: ${statusCounts.approved}`);
    console.log(`   Rejected: ${statusCounts.rejected}`);
    console.log(`   Undefined: ${statusCounts.undefined}\n`);
    
    // Show recent products
    console.log('🆕 Recent products (last 10):');
    products.slice(0, 10).forEach((product, index) => {
      console.log(`${index + 1}. ${product.name}`);
      console.log(`   Shop: ${product.shop?.name || 'Unknown'}`);
      console.log(`   Status: ${product.approvalStatus || 'undefined'}`);
      console.log(`   Active: ${product.isActive}`);
      console.log(`   Approved: ${product.isApproved}`);
      console.log(`   Created: ${product.createdAt}`);
      console.log('');
    });
    
    // Check for products without approval status
    const productsWithoutStatus = products.filter(p => !p.approvalStatus);
    if (productsWithoutStatus.length > 0) {
      console.log('⚠️  Products without approval status:');
      productsWithoutStatus.forEach(product => {
        console.log(`   - ${product.name} (${product.shop?.name || 'Unknown shop'})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking seller products:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkSellerProducts();
