// scripts/createPackages.js - MongoDB'de test paketleri oluştur
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import process from 'process';
import Package from '../src/models/Package.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI environment variable is required');
  process.exit(1);
}

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Test packages data
const testPackages = [
  {
    title: {
      tr: 'Temel Beslenme Paketi',
      en: 'Basic Nutrition Package'
    },
    description: {
      tr: 'Beslenme yolculuğuna başlayanlar için ideal paket',
      en: 'Perfect package for those starting their nutrition journey'
    },
    price: 299,
    originalPrice: 399,
    duration: {
      tr: '1 Ay',
      en: '1 Month'
    },
    features: {
      tr: [
        'İlk konsültasyon (60 dakika)',
        'Kişiselleştirilmiş beslenme planı',
        'Haftalık takip',
        'WhatsApp desteği',
        'Temel tarif koleksiyonu'
      ],
      en: [
        'Initial consultation (60 minutes)',
        'Personalized nutrition plan',
        'Weekly follow-up',
        'WhatsApp support',
        'Basic recipe collection'
      ]
    },
    isPopular: false,
    isActive: true,
    icon: 'bi-heart',
    category: 'basic',
    orderIndex: 1,
    maxClients: 20,
    currentClients: 0,
    tags: ['beginner', 'consultation', 'nutrition'],
    seoTitle: {
      tr: 'Temel Beslenme Paketi - Diyetisyen Oğuz Yolyapan',
      en: 'Basic Nutrition Package - Dietitian Oğuz Yolyapan'
    },
    seoDescription: {
      tr: 'Beslenme yolculuğunuza başlamak için ideal temel paket. Profesyonel diyetisyen desteği ile sağlıklı yaşam.',
      en: 'Ideal basic package to start your nutrition journey. Healthy living with professional dietitian support.'
    }
  },
  {
    title: {
      tr: 'Premium Beslenme Paketi',
      en: 'Premium Nutrition Package'
    },
    description: {
      tr: 'Kapsamlı beslenme desteği ve sürdürülebilir sonuçlar',
      en: 'Comprehensive nutrition support and sustainable results'
    },
    price: 599,
    originalPrice: 799,
    duration: {
      tr: '3 Ay',
      en: '3 Months'
    },
    features: {
      tr: [
        'Detaylı konsültasyon (90 dakika)',
        'Kapsamlı beslenme planı',
        'Günlük takip',
        'Öncelikli WhatsApp desteği',
        'Tarif koleksiyonu + meal prep rehberi',
        'Supplement önerileri',
        'İlerleme takip araçları'
      ],
      en: [
        'Detailed consultation (90 minutes)',
        'Comprehensive nutrition plan',
        'Daily follow-up',
        'Priority WhatsApp support',
        'Recipe collection + meal prep guide',
        'Supplement recommendations',
        'Progress tracking tools'
      ]
    },
    isPopular: true,
    isActive: true,
    icon: 'bi-star',
    category: 'premium',
    orderIndex: 2,
    maxClients: 15,
    currentClients: 0,
    tags: ['premium', 'comprehensive', 'tracking'],
    seoTitle: {
      tr: 'Premium Beslenme Paketi - En Popüler - Diyetisyen Oğuz Yolyapan',
      en: 'Premium Nutrition Package - Most Popular - Dietitian Oğuz Yolyapan'
    },
    seoDescription: {
      tr: 'En popüler premium beslenme paketi. Kapsamlı destek ve sürdürülebilir sonuçlar için ideal seçim.',
      en: 'Most popular premium nutrition package. Ideal choice for comprehensive support and sustainable results.'
    }
  },
  {
    title: {
      tr: 'VIP Beslenme Paketi',
      en: 'VIP Nutrition Package'
    },
    description: {
      tr: 'Özel özellikler ve öncelikli destek ile premium hizmet',
      en: 'Premium service with exclusive features and priority support'
    },
    price: 1199,
    originalPrice: 1599,
    duration: {
      tr: '6 Ay',
      en: '6 Months'
    },
    features: {
      tr: [
        'Kapsamlı sağlık ve yaşam tarzı değerlendirmesi',
        'Kişiselleştirilmiş beslenme ve fitness programı',
        'Haftalık birebir konsültasyonlar',
        'Gelişmiş vücut kompozisyon takibi',
        'Öncelikli 7/24 destek',
        'Özel tarif koleksiyonu',
        'Aylık ilerleme raporları',
        'Takviye protokol tasarımı',
        'Yemek teslimat koordinasyonu',
        'Aile beslenme rehberliği'
      ],
      en: [
        'Comprehensive health & lifestyle assessment',
        'Personalized nutrition & fitness program',
        'Weekly one-on-one consultations',
        'Advanced body composition tracking',
        'Priority 24/7 support',
        'Exclusive recipe collection',
        'Monthly progress reports',
        'Supplement protocol design',
        'Meal delivery coordination',
        'Family nutrition guidance'
      ]
    },
    isPopular: false,
    isActive: true,
    icon: 'bi-gem',
    category: 'vip',
    orderIndex: 3,
    maxClients: 5,
    currentClients: 0,
    tags: ['vip', 'exclusive', 'family', 'premium'],
    seoTitle: {
      tr: 'VIP Beslenme Paketi - Özel Hizmet - Diyetisyen Oğuz Yolyapan',
      en: 'VIP Nutrition Package - Exclusive Service - Dietitian Oğuz Yolyapan'
    },
    seoDescription: {
      tr: 'VIP beslenme paketi ile özel hizmet alın. Aile beslenme rehberliği ve 7/24 öncelikli destek.',
      en: 'Get exclusive service with VIP nutrition package. Family nutrition guidance and 24/7 priority support.'
    }
  }
];

// Create packages
const createPackages = async () => {
  try {
    console.log('🗑️ Clearing existing packages...');
    await Package.deleteMany({});

    console.log('📦 Creating test packages...');
    const createdPackages = await Package.insertMany(testPackages);

    console.log('✅ Successfully created packages:');
    createdPackages.forEach((pkg, index) => {
      console.log(`${index + 1}. ${pkg.title.tr} (${pkg.title.en})`);
      console.log(`   Price: ₺${pkg.price} (Original: ₺${pkg.originalPrice})`);
      console.log(`   Category: ${pkg.category}`);
      console.log(`   Popular: ${pkg.isPopular ? 'Yes' : 'No'}`);
      console.log(`   Features TR: ${pkg.features.tr.length} items`);
      console.log(`   Features EN: ${pkg.features.en.length} items`);
      console.log('');
    });

    console.log(`✅ Total packages created: ${createdPackages.length}`);
  } catch (error) {
    console.error('❌ Error creating packages:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Database connection closed');
  }
};

// Run the script
const main = async () => {
  await connectDB();
  await createPackages();
};

main().catch(console.error);
