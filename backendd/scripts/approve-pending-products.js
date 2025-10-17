const mongoose = require('mongoose');
const Product = require('../models/Product');
const User = require('../models/User');

// Load environment variables
require('dotenv').config({ path: './config.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function approvePendingProducts() {
  try {
    console.log('✅ Approving Pending Products...\n');
    
    // Get an admin user for approval
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      console.log('❌ No admin user found');
      return;
    }
    
    console.log(`👤 Using admin: ${adminUser.name} (${adminUser.email})`);
    
    // Get pending products
    const pendingProducts = await Product.find({ 
      approvalStatus: 'pending',
      isApproved: false 
    });
    
    console.log(`📊 Found ${pendingProducts.length} pending products\n`);
    
    if (pendingProducts.length === 0) {
      console.log('ℹ️ No pending products to approve');
      return;
    }
    
    // Approve the first 10 products as an example
    const productsToApprove = pendingProducts.slice(0, 10);
    
    console.log('🔧 Approving products:');
    for (const product of productsToApprove) {
      product.approvalStatus = 'approved';
      product.isApproved = true;
      product.approvedBy = adminUser._id;
      product.approvedAt = new Date();
      
      await product.save();
      console.log(`   ✅ ${product.name}`);
    }
    
    // Check final status
    const totalProducts = await Product.countDocuments();
    const approvedProducts = await Product.countDocuments({ isApproved: true, approvalStatus: 'approved' });
    const pendingProductsAfter = await Product.countDocuments({ isApproved: false, approvalStatus: 'pending' });
    
    console.log('\n📊 Final Product Status:');
    console.log(`Total products: ${totalProducts}`);
    console.log(`Approved: ${approvedProducts}`);
    console.log(`Pending: ${pendingProductsAfter}`);
    
    console.log('\n✅ Products approved successfully!');
    console.log('🌐 These products should now appear on the home page');
    
  } catch (error) {
    console.error('❌ Error approving products:', error);
  } finally {
    mongoose.connection.close();
  }
}

approvePendingProducts();
