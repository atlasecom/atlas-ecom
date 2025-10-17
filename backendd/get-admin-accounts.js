// Script to get admin account details from database
const mongoose = require('mongoose');

// Connect to your production database
const MONGODB_URI = 'mongodb+srv://atlasecom0:G8VONsBmS20Pnvqq@cluster0.kyajpzg.mongodb.net/?retryWrites=true&w=majority&appName=B2B';

const getAdminAccounts = async () => {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to database successfully!');
    
    // Get the User model
    const User = require('./models/User');
    
    // Find all admin users
    const adminUsers = await User.find({ role: 'admin' }).select('name email role isVerified createdAt');
    
    console.log('\n👑 Admin Accounts Found:');
    console.log('========================');
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin accounts found in the database.');
    } else {
      adminUsers.forEach((admin, index) => {
        console.log(`\n${index + 1}. Admin Account:`);
        console.log(`   Name: ${admin.name}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Role: ${admin.role}`);
        console.log(`   Verified: ${admin.isVerified}`);
        console.log(`   Created: ${admin.createdAt}`);
      });
    }
    
    // Also check for any users with admin-like emails
    console.log('\n🔍 Checking for other potential admin accounts...');
    const potentialAdmins = await User.find({
      $or: [
        { email: { $regex: /admin/i } },
        { name: { $regex: /admin/i } }
      ]
    }).select('name email role isVerified createdAt');
    
    if (potentialAdmins.length > 0) {
      console.log('\n👤 Potential Admin Accounts:');
      console.log('============================');
      potentialAdmins.forEach((user, index) => {
        console.log(`\n${index + 1}. Account:`);
        console.log(`   Name: ${user.name}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Verified: ${user.isVerified}`);
        console.log(`   Created: ${user.createdAt}`);
      });
    }
    
    console.log('\n✅ Database query completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed.');
  }
};

// Run the script
getAdminAccounts();