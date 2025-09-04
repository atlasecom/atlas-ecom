const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
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

// Create admin user
const createAdmin = async () => {
  try {
    console.log('👑 Creating admin account...');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@atlasecom.com' });
    if (existingAdmin) {
      console.log('⚠️ Admin account already exists!');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Role: ${existingAdmin.role}`);
      return;
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash('Admin@123', saltRounds);
    
    // Create admin user
    const adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@atlasecom.com',
      password: hashedPassword,
      phoneNumber: '+1234567890',
      address: '123 Admin Street, Admin City, AC 12345',
      role: 'admin',
      isVerified: true
    });
    
    console.log('✅ Admin account created successfully!');
    console.log('=====================================');
    console.log('📧 Email: admin@atlasecom.com');
    console.log('🔑 Password: Admin@123');
    console.log('👑 Role: admin');
    console.log('✅ Verified: Yes');
    console.log('=====================================');
    console.log('🌐 Login at: http://localhost:3000/login');
    
  } catch (error) {
    console.error('❌ Error creating admin account:', error);
  }
};

// Main function
const main = async () => {
  await connectDB();
  await createAdmin();
  
  // Close connection
  mongoose.connection.close();
  console.log('\n🔌 Database connection closed');
};

// Run the script
main().catch(console.error);
