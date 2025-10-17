const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

async function checkOtherDatabases() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Check the 'test' database which might contain your original data
    const testDb = mongoose.connection.useDb('test');
    const testCollections = await testDb.db.listCollections().toArray();
    
    console.log('\n📋 Collections in "test" database:');
    for (const collection of testCollections) {
      const count = await testDb.db.collection(collection.name).countDocuments();
      console.log(`   - ${collection.name}: ${count} documents`);
      
      // If there are users or products, show some samples
      if ((collection.name === 'users' || collection.name === 'products') && count > 0) {
        const sample = await testDb.db.collection(collection.name).findOne();
        console.log(`     Sample: ${JSON.stringify(sample, null, 2).substring(0, 200)}...`);
      }
    }

  } catch (error) {
    console.error('❌ Error checking other databases:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
checkOtherDatabases();



