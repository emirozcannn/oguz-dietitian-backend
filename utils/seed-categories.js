const mongoose = require('mongoose');
const Category = require('../models/Category.js');

// MongoDB connection string
const MONGODB_URI = 'mongodb+srv://emirus1214:alper1emir@cluster0.vhvvowo.mongodb.net/oguz-dietitian?retryWrites=true&w=majority&appName=Cluster0';

const categories = [
  {
    name_tr: 'Genel Beslenme',
    name_en: 'General Nutrition',
    slug_tr: 'genel-beslenme',
    slug_en: 'general-nutrition',
    description_tr: 'Sağlıklı beslenme ve genel beslenme önerileri',
    description_en: 'Healthy eating and general nutrition recommendations',
    color: '#059669',
    icon: 'leaf',
    sortOrder: 1
  },
  {
    name_tr: 'Kilo Yönetimi',
    name_en: 'Weight Management',
    slug_tr: 'kilo-yonetimi',
    slug_en: 'weight-management',
    description_tr: 'Kilo verme, kilo alma ve kilo kontrolü',
    description_en: 'Weight loss, weight gain, and weight control',
    color: '#3B82F6',
    icon: 'speedometer2',
    sortOrder: 2
  },
  {
    name_tr: 'Özel Diyetler',
    name_en: 'Special Diets',
    slug_tr: 'ozel-diyetler',
    slug_en: 'special-diets',
    description_tr: 'Glutensiz, vegan, ketojenik gibi özel beslenme programları',
    description_en: 'Gluten-free, vegan, ketogenic and other special dietary programs',
    color: '#F59E0B',
    icon: 'heart',
    sortOrder: 3
  },
  {
    name_tr: 'Spor Beslenme',
    name_en: 'Sports Nutrition',
    slug_tr: 'spor-beslenme',
    slug_en: 'sports-nutrition',
    description_tr: 'Atletler ve aktif bireyler için beslenme önerileri',
    description_en: 'Nutrition recommendations for athletes and active individuals',
    color: '#EF4444',
    icon: 'trophy',
    sortOrder: 4
  },
  {
    name_tr: 'Hastalık Beslenme',
    name_en: 'Medical Nutrition',
    slug_tr: 'hastalik-beslenme',
    slug_en: 'medical-nutrition',
    description_tr: 'Diyabet, kalp hastalığı gibi medikal durumlar için beslenme',
    description_en: 'Nutrition for medical conditions like diabetes, heart disease',
    color: '#8B5CF6',
    icon: 'heart-pulse',
    sortOrder: 5
  },
  {
    name_tr: 'Çocuk Beslenme',
    name_en: 'Child Nutrition',
    slug_tr: 'cocuk-beslenme',
    slug_en: 'child-nutrition',
    description_tr: 'Bebek ve çocuklar için beslenme rehberi',
    description_en: 'Nutrition guide for infants and children',
    color: '#EC4899',
    icon: 'person-hearts',
    sortOrder: 6
  },
  {
    name_tr: 'Yaşlı Beslenme',
    name_en: 'Elderly Nutrition',
    slug_tr: 'yasli-beslenme',
    slug_en: 'elderly-nutrition',
    description_tr: 'Yaşlı bireyler için özel beslenme önerileri',
    description_en: 'Special nutrition recommendations for elderly individuals',
    color: '#06B6D4',
    icon: 'person-walking',
    sortOrder: 7
  },
  {
    name_tr: 'Tarifler',
    name_en: 'Recipes',
    slug_tr: 'tarifler',
    slug_en: 'recipes',
    description_tr: 'Sağlıklı ve besleyici yemek tarifleri',
    description_en: 'Healthy and nutritious recipes',
    color: '#10B981',
    icon: 'cup-hot',
    sortOrder: 8
  }
];

async function seedCategories() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing categories
    console.log('Clearing existing categories...');
    await Category.deleteMany({});

    // Insert new categories
    console.log('Inserting new categories...');
    const insertedCategories = await Category.insertMany(categories);
    
    console.log(`Successfully inserted ${insertedCategories.length} categories:`);
    insertedCategories.forEach(cat => {
      console.log(`- ${cat.name_tr} (${cat.name_en}) - ID: ${cat._id}`);
    });

    console.log('\nCategories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  seedCategories();
}

module.exports = { seedCategories, categories };
