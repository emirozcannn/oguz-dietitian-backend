import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../src/models/Category.js';

dotenv.config();

const categories = [
  {
    name: { tr: 'Beslenme Temelleri', en: 'Nutrition Basics' },
    slug: { tr: 'beslenme-temelleri', en: 'nutrition-basics' },
    description: { 
      tr: 'Temel beslenme bilgileri ve sağlıklı yaşam', 
      en: 'Basic nutrition information and healthy living' 
    },
    color: '#28a745',
    icon: 'fas fa-apple-alt',
    orderIndex: 1
  },
  {
    name: { tr: 'Kilo Verme', en: 'Weight Loss' },
    slug: { tr: 'kilo-verme', en: 'weight-loss' },
    description: { 
      tr: 'Sağlıklı kilo verme stratejileri ve ipuçları', 
      en: 'Healthy weight loss strategies and tips' 
    },
    color: '#dc3545',
    icon: 'fas fa-weight',
    orderIndex: 2
  },
  {
    name: { tr: 'Kilo Alma', en: 'Weight Gain' },
    slug: { tr: 'kilo-alma', en: 'weight-gain' },
    description: { 
      tr: 'Sağlıklı kilo alma ve kas yapımı', 
      en: 'Healthy weight gain and muscle building' 
    },
    color: '#17a2b8',
    icon: 'fas fa-dumbbell',
    orderIndex: 3
  },
  {
    name: { tr: 'Spor Beslenmesi', en: 'Sports Nutrition' },
    slug: { tr: 'spor-beslenmesi', en: 'sports-nutrition' },
    description: { 
      tr: 'Atletler ve aktif yaşam için beslenme', 
      en: 'Nutrition for athletes and active lifestyle' 
    },
    color: '#fd7e14',
    icon: 'fas fa-running',
    orderIndex: 4
  },
  {
    name: { tr: 'Çocuk Beslenmesi', en: 'Child Nutrition' },
    slug: { tr: 'cocuk-beslenmesi', en: 'child-nutrition' },
    description: { 
      tr: 'Çocuklar için özel beslenme tavsiyeleri', 
      en: 'Special nutrition advice for children' 
    },
    color: '#e83e8c',
    icon: 'fas fa-child',
    orderIndex: 5
  },
  {
    name: { tr: 'Hamilelik Beslenmesi', en: 'Pregnancy Nutrition' },
    slug: { tr: 'hamilelik-beslenmesi', en: 'pregnancy-nutrition' },
    description: { 
      tr: 'Hamilelik döneminde beslenme', 
      en: 'Nutrition during pregnancy' 
    },
    color: '#6f42c1',
    icon: 'fas fa-baby',
    orderIndex: 6
  },
  {
    name: { tr: 'Hastalık Diyetleri', en: 'Medical Diets' },
    slug: { tr: 'hastalik-diyetleri', en: 'medical-diets' },
    description: { 
      tr: 'Diyabet, kalp hastalığı gibi durumlar için diyet', 
      en: 'Diets for diabetes, heart disease and other conditions' 
    },
    color: '#20c997',
    icon: 'fas fa-heartbeat',
    orderIndex: 7
  },
  {
    name: { tr: 'Tarifeler', en: 'Recipes' },
    slug: { tr: 'tarifeler', en: 'recipes' },
    description: { 
      tr: 'Sağlıklı ve lezzetli tarifler', 
      en: 'Healthy and delicious recipes' 
    },
    color: '#ffc107',
    icon: 'fas fa-utensils',
    orderIndex: 8
  },
  {
    name: { tr: 'Besin Önerileri', en: 'Food Recommendations' },
    slug: { tr: 'besin-onerileri', en: 'food-recommendations' },
    description: { 
      tr: 'Önerilen besinler ve alternatifleri', 
      en: 'Recommended foods and alternatives' 
    },
    color: '#6c757d',
    icon: 'fas fa-carrot',
    orderIndex: 9
  },
  {
    name: { tr: 'Yaşam Tarzı', en: 'Lifestyle' },
    slug: { tr: 'yasam-tarzi', en: 'lifestyle' },
    description: { 
      tr: 'Sağlıklı yaşam tarzı ipuçları', 
      en: 'Healthy lifestyle tips' 
    },
    color: '#007bff',
    icon: 'fas fa-leaf',
    orderIndex: 10
  }
];

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Mevcut kategorileri temizle
    await Category.deleteMany({});
    console.log('🧹 Existing categories cleared');

    // Yeni kategorileri ekle
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ ${createdCategories.length} categories created successfully`);

    // Kategorileri listele
    console.log('\n📋 Created Categories:');
    createdCategories.forEach(cat => {
      console.log(`- ${cat.name.tr} (${cat.name.en}) - ${cat.color}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Database disconnected');
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
