const mongoose = require('mongoose');
const Product = require('../models/Product');
const Event = require('../models/Event');

// Load environment variables
require('dotenv').config({ path: './config.env' });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function updateClickTracking() {
  try {
    console.log('🔄 Updating products with click tracking fields...');
    
    // Update products
    const productResult = await Product.updateMany(
      { 
        $or: [
          { clickTracking: { $exists: false } },
          { boostClicksRemaining: { $exists: false } }
        ]
      },
      {
        $set: {
          clickTracking: {
            whatsapp: 0,
            telegram: 0,
            total: 0
          },
          boostClicksRemaining: 0
        }
      }
    );
    
    console.log(`✅ Updated ${productResult.modifiedCount} products`);
    
    console.log('🔄 Updating events with click tracking fields...');
    
    // Update events
    const eventResult = await Event.updateMany(
      { 
        $or: [
          { clickTracking: { $exists: false } },
          { boostClicksRemaining: { $exists: false } }
        ]
      },
      {
        $set: {
          clickTracking: {
            whatsapp: 0,
            telegram: 0,
            total: 0
          },
          boostClicksRemaining: 0
        }
      }
    );
    
    console.log(`✅ Updated ${eventResult.modifiedCount} events`);
    
    console.log('🎉 Click tracking fields updated successfully!');
    
  } catch (error) {
    console.error('❌ Error updating click tracking fields:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateClickTracking();
