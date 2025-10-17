require('dotenv').config({ path: './config.env.local' });
const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const assignCategoriesToProducts = async () => {
  await connectDB();
  
  try {
    console.log('🔍 Fetching products without categories...');
    const products = await Product.find({
      $or: [
        { category: { $exists: false } },
        { category: null },
        { subcategory: { $exists: false } },
        { subcategory: null }
      ]
    });
    
    console.log(`📦 Found ${products.length} products without categories`);
    
    if (products.length === 0) {
      console.log('✅ All products already have categories assigned');
      return;
    }
    
    // Get the first available category and subcategory
    const firstCategory = await Category.findOne({ isActive: true });
    const firstSubcategory = await SubCategory.findOne({ isActive: true });
    
    if (!firstCategory || !firstSubcategory) {
      console.log('❌ No categories or subcategories found. Please create some first.');
      return;
    }
    
    console.log(`📁 Using category: ${firstCategory.name}`);
    console.log(`📂 Using subcategory: ${firstSubcategory.name}`);
    
    // Update all products to use the first category and subcategory
    const updateResult = await Product.updateMany(
      {
        $or: [
          { category: { $exists: false } },
          { category: null },
          { subcategory: { $exists: false } },
          { subcategory: null }
        ]
      },
      {
        $set: {
          category: firstCategory._id,
          subcategory: firstSubcategory._id
        }
      }
    );
    
    console.log(`✅ Updated ${updateResult.modifiedCount} products with categories`);
    console.log('🎉 Category assignment completed successfully!');
    
  } catch (error) {
    console.error('❌ Error assigning categories:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed.');
  }
};

assignCategoriesToProducts();
