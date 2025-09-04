const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

// Import User model
const User = require('../models/User');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Show all admin accounts
const showAdminAccounts = async () => {
  try {
    const adminUsers = await User.find({ role: 'admin' }).select('-password');
    
    console.log('👑 ADMIN ACCOUNTS IN DATABASE:');
    console.log('=====================================');
    
    if (adminUsers.length === 0) {
      console.log('❌ No admin accounts found');
      return;
    }
    
    adminUsers.forEach((admin, index) => {
      console.log(`\n${index + 1}. Admin Account:`);
      console.log(`   Name: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   Verified: ${admin.isVerified ? '✅ Yes' : '❌ No'}`);
      console.log(`   Phone: ${admin.phoneNumber || 'Not set'}`);
      console.log(`   Address: ${admin.address || 'Not set'}`);
      console.log(`   Created: ${admin.createdAt.toLocaleDateString()}`);
    });
    
    console.log('\n🔐 LOGIN INSTRUCTIONS:');
    console.log('=====================================');
    console.log('1. Go to: http://localhost:3000/login');
    console.log('2. Use any of the admin email addresses above');
    console.log('3. Use the corresponding password');
    console.log('\n⚠️ NOTE: Passwords are hashed in database for security');
    console.log('   Use the passwords from the creation scripts');
    
  } catch (error) {
    console.error('❌ Error fetching admin accounts:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await showAdminAccounts();
  
  // Close connection
  mongoose.connection.close();
  console.log('\n🔌 Database connection closed');
};

// Run the script
main().catch(console.error);
