const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env' });

// Import models
const User = require('../models/User');
const Product = require('../models/Product');
const Event = require('../models/Event');
const Shop = require('../models/Shop');
const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');

// Sample data
const sampleCategories = [
  {
    name: 'Electronics',
    nameAr: 'إلكترونيات',
    nameFr: 'Électronique',
    description: 'Electronic devices and gadgets',
    descriptionAr: 'الأجهزة الإلكترونية والأدوات',
    descriptionFr: 'Appareils électroniques et gadgets',
    image: {
      url: 'https://picsum.photos/500/500?random=1',
      public_id: 'electronics_cat'
    },
    sortOrder: 1,
    isActive: true
  },
  {
    name: 'Fashion',
    nameAr: 'أزياء',
    nameFr: 'Mode',
    description: 'Clothing and fashion accessories',
    descriptionAr: 'الملابس والإكسسوارات',
    descriptionFr: 'Vêtements et accessoires de mode',
    image: {
      url: 'https://picsum.photos/500/500?random=2',
      public_id: 'fashion_cat'
    },
    sortOrder: 2,
    isActive: true
  },
  {
    name: 'Home & Garden',
    nameAr: 'المنزل والحديقة',
    nameFr: 'Maison et Jardin',
    description: 'Home improvement and garden supplies',
    descriptionAr: 'أدوات تحسين المنزل والحديقة',
    descriptionFr: 'Amélioration de la maison et fournitures de jardin',
    image: {
      url: 'https://picsum.photos/500/500?random=3',
      public_id: 'home_cat'
    },
    sortOrder: 3,
    isActive: true
  }
];

const sampleSubCategories = [
  // Electronics subcategories
  { name: 'Smartphones', nameAr: 'الهواتف الذكية', nameFr: 'Smartphones', category: null, tags: { en: ['phone', 'mobile', 'smartphone'], ar: ['هاتف', 'جوال', 'ذكي'], fr: ['téléphone', 'mobile', 'intelligent'] } },
  { name: 'Laptops', nameAr: 'أجهزة الكمبيوتر المحمولة', nameFr: 'Ordinateurs portables', category: null, tags: { en: ['laptop', 'computer', 'notebook'], ar: ['لابتوب', 'كمبيوتر', 'دفتر'], fr: ['ordinateur', 'portable', 'carnet'] } },
  { name: 'Headphones', nameAr: 'سماعات الرأس', nameFr: 'Casques', category: null, tags: { en: ['headphones', 'audio', 'music'], ar: ['سماعات', 'صوت', 'موسيقى'], fr: ['casques', 'audio', 'musique'] } },
  
  // Fashion subcategories
  { name: 'Men\'s Clothing', nameAr: 'ملابس الرجال', nameFr: 'Vêtements pour hommes', category: null, tags: { en: ['men', 'clothing', 'fashion'], ar: ['رجال', 'ملابس', 'أزياء'], fr: ['hommes', 'vêtements', 'mode'] } },
  { name: 'Women\'s Clothing', nameAr: 'ملابس النساء', nameFr: 'Vêtements pour femmes', category: null, tags: { en: ['women', 'clothing', 'fashion'], ar: ['نساء', 'ملابس', 'أزياء'], fr: ['femmes', 'vêtements', 'mode'] } },
  { name: 'Shoes', nameAr: 'أحذية', nameFr: 'Chaussures', category: null, tags: { en: ['shoes', 'footwear', 'sneakers'], ar: ['أحذية', 'حذاء', 'رياضي'], fr: ['chaussures', 'chaussures', 'baskets'] } },
  
  // Home & Garden subcategories
  { name: 'Furniture', nameAr: 'أثاث', nameFr: 'Meubles', category: null, tags: { en: ['furniture', 'home', 'decor'], ar: ['أثاث', 'منزل', 'ديكور'], fr: ['meubles', 'maison', 'décor'] } },
  { name: 'Kitchen', nameAr: 'مطبخ', nameFr: 'Cuisine', category: null, tags: { en: ['kitchen', 'cooking', 'appliances'], ar: ['مطبخ', 'طبخ', 'أجهزة'], fr: ['cuisine', 'cuisson', 'appareils'] } },
  { name: 'Garden Tools', nameAr: 'أدوات الحديقة', nameFr: 'Outils de jardin', category: null, tags: { en: ['garden', 'tools', 'outdoor'], ar: ['حديقة', 'أدوات', 'خارجي'], fr: ['jardin', 'outils', 'extérieur'] } }
];

const sampleUsers = [
  {
    name: 'John Smith',
    email: 'john@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'user',
    avatar: {
      url: 'https://picsum.photos/100/100?random=10',
      public_id: 'user_avatar_1'
    }
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'user',
    avatar: {
      url: 'https://picsum.photos/100/100?random=11',
      public_id: 'user_avatar_2'
    }
  },
  {
    name: 'Mike Wilson',
    email: 'mike@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'seller',
    avatar: {
      url: 'https://picsum.photos/100/100?random=12',
      public_id: 'seller_avatar_1'
    }
  },
  {
    name: 'Emma Davis',
    email: 'emma@example.com',
    password: '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    role: 'seller',
    avatar: {
      url: 'https://picsum.photos/100/100?random=13',
      public_id: 'seller_avatar_2'
    }
  }
];

const sampleShops = [
  {
    name: 'TechStore Pro',
    description: 'Premium electronics and gadgets',
    address: '123 Tech Street, City',
    zipCode: '12345',
    phoneNumber: '+1234567890',
    email: 'contact@techstore.com',
    avatar: {
      url: 'https://picsum.photos/200/200?random=20',
      public_id: 'shop_avatar_1'
    },
    coverImage: {
      url: 'https://picsum.photos/800/400?random=21',
      public_id: 'shop_cover_1'
    },
    isActive: true
  },
  {
    name: 'Fashion Hub',
    description: 'Trendy clothing and accessories',
    address: '456 Fashion Ave, City',
    zipCode: '54321',
    phoneNumber: '+1234567891',
    email: 'info@fashionhub.com',
    avatar: {
      url: 'https://picsum.photos/200/200?random=22',
      public_id: 'shop_avatar_2'
    },
    coverImage: {
      url: 'https://picsum.photos/800/400?random=23',
      public_id: 'shop_cover_2'
    },
    isActive: true
  }
];

async function populateDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Event.deleteMany({});
    await Shop.deleteMany({});
    await Category.deleteMany({});
    await SubCategory.deleteMany({});

    // Create categories
    console.log('📁 Creating categories...');
    const categories = await Category.insertMany(sampleCategories);
    console.log(`✅ Created ${categories.length} categories`);

    // Create subcategories
    console.log('📂 Creating subcategories...');
    const electronicsCategory = categories.find(cat => cat.name === 'Electronics');
    const fashionCategory = categories.find(cat => cat.name === 'Fashion');
    const homeCategory = categories.find(cat => cat.name === 'Home & Garden');

    sampleSubCategories[0].category = electronicsCategory._id; // Smartphones
    sampleSubCategories[1].category = electronicsCategory._id; // Laptops
    sampleSubCategories[2].category = electronicsCategory._id; // Headphones
    sampleSubCategories[3].category = fashionCategory._id; // Men's Clothing
    sampleSubCategories[4].category = fashionCategory._id; // Women's Clothing
    sampleSubCategories[5].category = fashionCategory._id; // Shoes
    sampleSubCategories[6].category = homeCategory._id; // Furniture
    sampleSubCategories[7].category = homeCategory._id; // Kitchen
    sampleSubCategories[8].category = homeCategory._id; // Garden Tools

    const subcategories = await SubCategory.insertMany(sampleSubCategories);
    console.log(`✅ Created ${subcategories.length} subcategories`);

    // Update categories with subcategories
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const categorySubcategories = subcategories.filter(sub => sub.category.toString() === category._id.toString());
      category.subcategories = categorySubcategories.map(sub => sub._id);
      await category.save();
    }

    // Create users
    console.log('👥 Creating users...');
    const users = await User.insertMany(sampleUsers);
    console.log(`✅ Created ${users.length} users`);

    // Create shops
    console.log('🏪 Creating shops...');
    const sellers = users.filter(user => user.role === 'seller');
    sampleShops[0].seller = sellers[0]._id;
    sampleShops[0].owner = sellers[0]._id;
    sampleShops[1].seller = sellers[1]._id;
    sampleShops[1].owner = sellers[1]._id;
    
    const shops = await Shop.insertMany(sampleShops);
    console.log(`✅ Created ${shops.length} shops`);

    // Update sellers with shop references
    for (let i = 0; i < sellers.length; i++) {
      sellers[i].shop = shops[i]._id;
      await sellers[i].save();
    }

    // Create products with analytics data
    console.log('📦 Creating products...');
    const products = [];
    const productNames = [
      'iPhone 15 Pro', 'Samsung Galaxy S24', 'MacBook Pro M3', 'Dell XPS 13', 'Sony WH-1000XM5',
      'Nike Air Max', 'Adidas Ultraboost', 'Levi\'s 501 Jeans', 'Zara Blazer', 'Converse Chuck Taylor',
      'IKEA Desk Chair', 'Kitchen Knife Set', 'Garden Hose', 'Coffee Maker', 'Bluetooth Speaker'
    ];

    for (let i = 0; i < 15; i++) {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const categorySubcategories = subcategories.filter(sub => sub.category.toString() === randomCategory._id.toString());
      const randomSubcategory = categorySubcategories[Math.floor(Math.random() * categorySubcategories.length)];
      const randomShop = shops[Math.floor(Math.random() * shops.length)];

      const originalPrice = Math.floor(Math.random() * 1200) + 100;
      const price = Math.floor(originalPrice * 0.8); // 20% discount
      const discountPrice = originalPrice - price;
      
      const product = {
        name: productNames[i],
        description: `High-quality ${productNames[i].toLowerCase()} with excellent features and performance.`,
        price: price,
        originalPrice: originalPrice,
        discountPrice: discountPrice,
        stock: Math.floor(Math.random() * 100) + 10,
        images: [
          {
            url: `https://picsum.photos/400/400?random=${30 + i}`,
            public_id: `product_${i}`
          }
        ],
        category: randomCategory._id,
        subcategory: randomSubcategory._id,
        shop: {
          _id: randomShop._id,
          name: randomShop.name,
          seller: randomShop.seller
        },
        ratings: Math.random() * 2 + 3, // 3-5 stars
        numOfReviews: Math.floor(Math.random() * 50) + 5,
        isActive: Math.random() > 0.1, // 90% active
        viewCount: Math.floor(Math.random() * 1000) + 10,
        whatsappClicks: Math.floor(Math.random() * 100) + 1,
        favoritesCount: Math.floor(Math.random() * 50) + 1,
        tags: {
          en: ['premium', 'quality', 'popular'],
          ar: ['متميز', 'جودة', 'شائع'],
          fr: ['premium', 'qualité', 'populaire']
        }
      };

      products.push(product);
    }

    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products`);

    // Create events with analytics data
    console.log('🎉 Creating events...');
    const events = [];
    const eventNames = [
      'Summer Sale 2024', 'Black Friday Deals', 'Tech Week Special', 'Fashion Show 2024',
      'Home Decor Expo', 'Electronics Launch', 'Fashion Week', 'Garden Festival'
    ];

    for (let i = 0; i < 8; i++) {
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const categorySubcategories = subcategories.filter(sub => sub.category.toString() === randomCategory._id.toString());
      const randomSubcategory = categorySubcategories[Math.floor(Math.random() * categorySubcategories.length)];
      const randomShop = shops[Math.floor(Math.random() * shops.length)];

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30)); // Past 30 days
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 7) + 1); // 1-7 days duration

      const eventOriginalPrice = Math.floor(Math.random() * 600) + 50;
      const eventPrice = Math.floor(eventOriginalPrice * 0.8); // 20% discount
      const eventDiscountPrice = eventOriginalPrice - eventPrice;
      
      const event = {
        name: eventNames[i],
        description: `Join us for ${eventNames[i].toLowerCase()} with amazing deals and offers!`,
        price: eventPrice,
        originalPrice: eventOriginalPrice,
        discountPrice: eventDiscountPrice,
        stock: Math.floor(Math.random() * 50) + 5,
        images: [
          {
            url: `https://picsum.photos/600/400?random=${50 + i}`,
            public_id: `event_${i}`
          }
        ],
        category: randomCategory._id,
        subcategory: randomSubcategory._id,
        shop: {
          _id: randomShop._id,
          name: randomShop.name,
          seller: randomShop.seller
        },
        start_Date: startDate,
        Finish_Date: endDate,
        ratings: Math.random() * 2 + 3, // 3-5 stars
        numOfReviews: Math.floor(Math.random() * 30) + 3,
        isActive: Math.random() > 0.1, // 90% active
        viewCount: Math.floor(Math.random() * 500) + 5,
        whatsappClicks: Math.floor(Math.random() * 50) + 1,
        favoritesCount: Math.floor(Math.random() * 25) + 1,
        tags: 'event, special, limited'
      };

      events.push(event);
    }

    const createdEvents = await Event.insertMany(events);
    console.log(`✅ Created ${createdEvents.length} events`);

    // Add some wishlist data to users
    console.log('❤️ Adding wishlist data...');
    const regularUsers = users.filter(user => user.role === 'user');
    for (const user of regularUsers) {
      const randomProducts = createdProducts.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 5) + 1);
      user.wishlist = randomProducts.map(product => product._id);
      await user.save();
    }
    console.log(`✅ Added wishlist data to ${regularUsers.length} users`);

    console.log('\n🎉 Database populated successfully!');
    console.log(`📊 Analytics Summary:`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Subcategories: ${subcategories.length}`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Sellers: ${sellers.length}`);
    console.log(`   - Shops: ${shops.length}`);
    console.log(`   - Products: ${createdProducts.length}`);
    console.log(`   - Events: ${createdEvents.length}`);
    console.log(`   - Total Views: ${createdProducts.reduce((sum, p) => sum + p.viewCount, 0) + createdEvents.reduce((sum, e) => sum + e.viewCount, 0)}`);
    console.log(`   - Total WhatsApp Clicks: ${createdProducts.reduce((sum, p) => sum + p.whatsappClicks, 0) + createdEvents.reduce((sum, e) => sum + e.whatsappClicks, 0)}`);
    console.log(`   - Total Favorites: ${createdProducts.reduce((sum, p) => sum + p.favoritesCount, 0) + createdEvents.reduce((sum, e) => sum + e.favoritesCount, 0)}`);

  } catch (error) {
    console.error('❌ Error populating database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the script
populateDatabase();
