// Migration script to create default categories and subcategories
const mongoose = require('mongoose');
require('dotenv').config({ path: './config.env.local' });

const Category = require('../models/Category');
const SubCategory = require('../models/SubCategory');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://atlasecom0:G8VONsBmS20Pnvqq@cluster0.kyajpzg.mongodb.net/?retryWrites=true&w=majority&appName=B2B';

const defaultCategories = [
  {
    name: 'Electronics',
    nameAr: 'إلكترونيات',
    nameFr: 'Électronique',
    description: 'Electronic devices and gadgets',
    descriptionAr: 'الأجهزة الإلكترونية والأدوات',
    descriptionFr: 'Appareils électroniques et gadgets',
    sortOrder: 1,
    image: {
      public_id: 'default-electronics',
      url: 'https://via.placeholder.com/500x500/4F46E5/FFFFFF?text=Electronics'
    }
  },
  {
    name: 'Fashion & Apparel',
    nameAr: 'الموضة والملابس',
    nameFr: 'Mode et Vêtements',
    description: 'Clothing, shoes, and fashion accessories',
    descriptionAr: 'الملابس والأحذية والإكسسوارات',
    descriptionFr: 'Vêtements, chaussures et accessoires de mode',
    sortOrder: 2,
    image: {
      public_id: 'default-fashion',
      url: 'https://via.placeholder.com/500x500/EC4899/FFFFFF?text=Fashion'
    }
  },
  {
    name: 'Home & Garden',
    nameAr: 'المنزل والحديقة',
    nameFr: 'Maison et Jardin',
    description: 'Home improvement and garden supplies',
    descriptionAr: 'لوازم تحسين المنزل والحديقة',
    descriptionFr: 'Fournitures pour la maison et le jardin',
    sortOrder: 3,
    image: {
      public_id: 'default-home',
      url: 'https://via.placeholder.com/500x500/10B981/FFFFFF?text=Home'
    }
  },
  {
    name: 'Sports & Outdoors',
    nameAr: 'الرياضة والهواء الطلق',
    nameFr: 'Sports et Plein Air',
    description: 'Sports equipment and outdoor gear',
    descriptionAr: 'معدات رياضية ومعدات الهواء الطلق',
    descriptionFr: 'Équipement sportif et matériel de plein air',
    sortOrder: 4,
    image: {
      public_id: 'default-sports',
      url: 'https://via.placeholder.com/500x500/F59E0B/FFFFFF?text=Sports'
    }
  },
  {
    name: 'Health & Beauty',
    nameAr: 'الصحة والجمال',
    nameFr: 'Santé et Beauté',
    description: 'Health and beauty products',
    descriptionAr: 'منتجات الصحة والجمال',
    descriptionFr: 'Produits de santé et beauté',
    sortOrder: 5,
    image: {
      public_id: 'default-health',
      url: 'https://via.placeholder.com/500x500/EF4444/FFFFFF?text=Health'
    }
  }
];

const defaultSubCategories = [
  // Electronics subcategories
  {
    name: 'Smartphones',
    nameAr: 'الهواتف الذكية',
    nameFr: 'Smartphones',
    description: 'Mobile phones and accessories',
    descriptionAr: 'الهواتف المحمولة والإكسسوارات',
    descriptionFr: 'Téléphones portables et accessoires',
    tags: {
      en: ['phone', 'mobile', 'smartphone', 'android', 'ios', 'camera', 'battery'],
      ar: ['هاتف', 'موبايل', 'ذكي', 'كاميرا', 'بطارية'],
      fr: ['téléphone', 'mobile', 'smartphone', 'caméra', 'batterie']
    },
    sortOrder: 1,
    image: {
      public_id: 'default-smartphones',
      url: 'https://via.placeholder.com/500x500/10B981/FFFFFF?text=Smartphones'
    }
  },
  {
    name: 'Laptops',
    nameAr: 'أجهزة الكمبيوتر المحمولة',
    nameFr: 'Ordinateurs Portables',
    description: 'Laptops and notebooks',
    descriptionAr: 'أجهزة الكمبيوتر المحمولة والمفكرات',
    descriptionFr: 'Ordinateurs portables et notebooks',
    tags: {
      en: ['laptop', 'computer', 'notebook', 'gaming', 'work', 'student'],
      ar: ['لابتوب', 'كمبيوتر', 'مفكرة', 'ألعاب', 'عمل', 'طالب'],
      fr: ['ordinateur', 'portable', 'gaming', 'travail', 'étudiant']
    },
    sortOrder: 2,
    image: {
      public_id: 'default-laptops',
      url: 'https://via.placeholder.com/500x500/10B981/FFFFFF?text=Laptops'
    }
  },
  // Fashion subcategories
  {
    name: 'Men\'s Clothing',
    nameAr: 'ملابس رجالية',
    nameFr: 'Vêtements Hommes',
    description: 'Clothing for men',
    descriptionAr: 'ملابس للرجال',
    descriptionFr: 'Vêtements pour hommes',
    tags: {
      en: ['men', 'shirt', 'pants', 'jacket', 'casual', 'formal'],
      ar: ['رجال', 'قميص', 'بنطلون', 'جاكيت', 'عادي', 'رسمي'],
      fr: ['homme', 'chemise', 'pantalon', 'veste', 'décontracté', 'formel']
    },
    sortOrder: 1,
    image: {
      public_id: 'default-mens-clothing',
      url: 'https://via.placeholder.com/500x500/10B981/FFFFFF?text=Men+Clothing'
    }
  },
  {
    name: 'Women\'s Clothing',
    nameAr: 'ملابس نسائية',
    nameFr: 'Vêtements Femmes',
    description: 'Clothing for women',
    descriptionAr: 'ملابس للنساء',
    descriptionFr: 'Vêtements pour femmes',
    tags: {
      en: ['women', 'dress', 'blouse', 'skirt', 'casual', 'elegant'],
      ar: ['نساء', 'فستان', 'بلوزة', 'تنورة', 'عادي', 'أنيق'],
      fr: ['femme', 'robe', 'chemisier', 'jupe', 'décontracté', 'élégant']
    },
    sortOrder: 2,
    image: {
      public_id: 'default-womens-clothing',
      url: 'https://via.placeholder.com/500x500/10B981/FFFFFF?text=Women+Clothing'
    }
  }
];

const migrateCategories = async () => {
  try {
    console.log('🔍 Connecting to database...');
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to database successfully!');
    
    // Clear existing categories and subcategories
    console.log('🗑️ Clearing existing categories and subcategories...');
    await SubCategory.deleteMany({});
    await Category.deleteMany({});
    
    // Create categories
    console.log('📁 Creating categories...');
    const createdCategories = [];
    for (const categoryData of defaultCategories) {
      const category = await Category.create(categoryData);
      createdCategories.push(category);
      console.log(`✅ Created category: ${category.name}`);
    }
    
    // Create subcategories
    console.log('📂 Creating subcategories...');
    for (let i = 0; i < defaultSubCategories.length; i++) {
      const subcategoryData = defaultSubCategories[i];
      
      // Assign to appropriate category
      let categoryId;
      if (i < 2) {
        // First 2 subcategories go to Electronics
        categoryId = createdCategories[0]._id;
      } else {
        // Next 2 subcategories go to Fashion
        categoryId = createdCategories[1]._id;
      }
      
      subcategoryData.category = categoryId;
      const subcategory = await SubCategory.create(subcategoryData);
      
      // Add subcategory to category's subcategories array
      await Category.findByIdAndUpdate(categoryId, {
        $push: { subcategories: subcategory._id }
      });
      
      console.log(`✅ Created subcategory: ${subcategory.name} in ${createdCategories.find(c => c._id.toString() === categoryId.toString()).name}`);
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log(`📊 Created ${createdCategories.length} categories and ${defaultSubCategories.length} subcategories`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed.');
  }
};

// Run migration
migrateCategories();
