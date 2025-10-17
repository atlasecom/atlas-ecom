const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: './config.env' });

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Event = require('../models/Event');
const Shop = require('../models/Shop');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');

async function backupDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const backupData = {
      timestamp: new Date().toISOString(),
      users: await User.find({}),
      products: await Product.find({}),
      events: await Event.find({}),
      shops: await Shop.find({}),
      categories: await Category.find({}),
      subcategories: await SubCategory.find({})
    };

    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Save backup to file
    const backupFile = path.join(backupDir, `backup-${new Date().toISOString().split('T')[0]}.json`);
    fs.writeFileSync(backupFile, JSON.stringify(backupData, null, 2));

    console.log(`✅ Database backed up to: ${backupFile}`);
    console.log(`📊 Backup contains:`);
    console.log(`   - Users: ${backupData.users.length}`);
    console.log(`   - Products: ${backupData.products.length}`);
    console.log(`   - Events: ${backupData.events.length}`);
    console.log(`   - Shops: ${backupData.shops.length}`);
    console.log(`   - Categories: ${backupData.categories.length}`);
    console.log(`   - Subcategories: ${backupData.subcategories.length}`);

  } catch (error) {
    console.error('❌ Error backing up database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
backupDatabase();



