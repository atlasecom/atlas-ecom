const mongoose = require('mongoose');
const Product = require('../models/Product');

// Load environment variables
require('dotenv').config({ path: './config.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixProductApprovalStatus() {
  try {
    console.log('🔧 Fixing Product Approval Status...\n');
    
    // Find products without approvalStatus
    const productsWithoutStatus = await Product.find({
      $or: [
        { approvalStatus: { $exists: false } },
        { approvalStatus: null }
      ]
    });
    
    console.log(`📊 Found ${productsWithoutStatus.length} products without approval status`);
    
    if (productsWithoutStatus.length > 0) {
      // Update products based on isApproved field
      const updateResult = await Product.updateMany(
        {
          $or: [
            { approvalStatus: { $exists: false } },
            { approvalStatus: null }
          ]
        },
        {
          $set: {
            approvalStatus: 'approved' // Set all existing products as approved
          }
        }
      );
      
      console.log(`✅ Updated ${updateResult.modifiedCount} products with approval status`);
    }
    
    // Check final status
    const totalProducts = await Product.countDocuments();
    const approvedProducts = await Product.countDocuments({ approvalStatus: 'approved' });
    const pendingProducts = await Product.countDocuments({ approvalStatus: 'pending' });
    const rejectedProducts = await Product.countDocuments({ approvalStatus: 'rejected' });
    
    console.log('\n📊 Final Product Status:');
    console.log(`Total products: ${totalProducts}`);
    console.log(`Approved: ${approvedProducts}`);
    console.log(`Pending: ${pendingProducts}`);
    console.log(`Rejected: ${rejectedProducts}`);
    
    console.log('\n✅ Product approval status fixed successfully!');
    
  } catch (error) {
    console.error('❌ Error fixing product approval status:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixProductApprovalStatus();
