const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

async function checkAllCollections() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all collections
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log('\n📋 All Collections in Database:');
    for (const collection of collections) {
      const count = await db.collection(collection.name).countDocuments();
      console.log(`   - ${collection.name}: ${count} documents`);
    }

    // Check if there are any other databases
    const admin = db.admin();
    const dbs = await admin.listDatabases();
    
    console.log('\n🗄️ All Databases:');
    for (const database of dbs.databases) {
      console.log(`   - ${database.name}: ${(database.sizeOnDisk / 1024 / 1024).toFixed(2)} MB`);
    }

  } catch (error) {
    console.error('❌ Error checking collections:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
checkAllCollections();



