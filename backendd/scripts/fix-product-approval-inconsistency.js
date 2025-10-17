const mongoose = require('mongoose');
const Product = require('../models/Product');

// Load environment variables
require('dotenv').config({ path: './config.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixProductApprovalInconsistency() {
  try {
    console.log('🔧 Fixing Product Approval Inconsistency...\n');
    
    // Find products with inconsistent approval status
    const inconsistentProducts = await Product.find({
      $or: [
        { approvalStatus: 'pending', isApproved: true },
        { approvalStatus: 'approved', isApproved: false },
        { approvalStatus: 'rejected', isApproved: true }
      ]
    });
    
    console.log(`📊 Found ${inconsistentProducts.length} products with inconsistent approval status\n`);
    
    if (inconsistentProducts.length > 0) {
      console.log('🔍 Inconsistent products:');
      inconsistentProducts.forEach((product, index) => {
        console.log(`${index + 1}. ${product.name}`);
        console.log(`   approvalStatus: ${product.approvalStatus}`);
        console.log(`   isApproved: ${product.isApproved}`);
        console.log(`   isActive: ${product.isActive}`);
        console.log('');
      });
      
      // Fix the inconsistency
      console.log('🔧 Fixing inconsistency...\n');
      
      // Set isApproved based on approvalStatus
      const updateResult = await Product.updateMany(
        { approvalStatus: 'approved' },
        { $set: { isApproved: true } }
      );
      console.log(`✅ Updated ${updateResult.modifiedCount} products: approved → isApproved: true`);
      
      const updateResult2 = await Product.updateMany(
        { approvalStatus: 'pending' },
        { $set: { isApproved: false } }
      );
      console.log(`✅ Updated ${updateResult2.modifiedCount} products: pending → isApproved: false`);
      
      const updateResult3 = await Product.updateMany(
        { approvalStatus: 'rejected' },
        { $set: { isApproved: false } }
      );
      console.log(`✅ Updated ${updateResult3.modifiedCount} products: rejected → isApproved: false`);
    }
    
    // Check final status
    const totalProducts = await Product.countDocuments();
    const approvedProducts = await Product.countDocuments({ isApproved: true, approvalStatus: 'approved' });
    const pendingProducts = await Product.countDocuments({ isApproved: false, approvalStatus: 'pending' });
    const rejectedProducts = await Product.countDocuments({ isApproved: false, approvalStatus: 'rejected' });
    
    console.log('\n📊 Final Product Status:');
    console.log(`Total products: ${totalProducts}`);
    console.log(`Approved (isApproved: true, approvalStatus: approved): ${approvedProducts}`);
    console.log(`Pending (isApproved: false, approvalStatus: pending): ${pendingProducts}`);
    console.log(`Rejected (isApproved: false, approvalStatus: rejected): ${rejectedProducts}`);
    
    console.log('\n✅ Product approval inconsistency fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing product approval inconsistency:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixProductApprovalInconsistency();
