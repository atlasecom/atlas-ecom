require('dotenv').config({ path: './config.env' });
const mongoose = require('mongoose');
const Product = require('./models/Product');

async function checkProducts() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find all products
    const products = await Product.find({}).limit(5);
    console.log(`\n📦 Found ${products.length} products:`);

    products.forEach((product, index) => {
      console.log(`\n--- Product ${index + 1}: ${product.name} ---`);
      console.log('Images:', JSON.stringify(product.images, null, 2));
      
      if (product.images && product.images.length > 0) {
        product.images.forEach((img, imgIndex) => {
          console.log(`  Image ${imgIndex + 1}:`);
          console.log(`    URL: ${img.url}`);
          console.log(`    Public ID: ${img.public_id}`);
          console.log(`    Is Cloudinary: ${img.url && img.url.includes('res.cloudinary.com')}`);
          console.log(`    Is Data URI: ${img.url && img.url.startsWith('data:')}`);
        });
      } else {
        console.log('  No images found');
      }
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkProducts();
