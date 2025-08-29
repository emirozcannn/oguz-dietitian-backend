import mongoose from 'mongoose';
import dotenv from 'dotenv';
import process from 'process';
import FAQCategory from '../src/models/FAQCategory.js';

dotenv.config();

const sampleCategories = [
  {
    name_tr: 'Genel Sorular',
    name_en: 'General Questions',
    icon: 'bi-question-circle',
    color: '#0d6efd',
    order_index: 1,
    is_active: true
  },
  {
    name_tr: 'Beslenme Programları',
    name_en: 'Nutrition Programs',
    icon: 'bi-clipboard-heart',
    color: '#28a745',
    order_index: 2,
    is_active: true
  },
  {
    name_tr: 'Randevu Sistemi',
    name_en: 'Appointment System',
    icon: 'bi-calendar-check',
    color: '#ffc107',
    order_index: 3,
    is_active: true
  },
  {
    name_tr: 'Ödeme İşlemleri',
    name_en: 'Payment Process',
    icon: 'bi-credit-card',
    color: '#17a2b8',
    order_index: 4,
    is_active: true
  },
  {
    name_tr: 'Teknik Destek',
    name_en: 'Technical Support',
    icon: 'bi-tools',
    color: '#6f42c1',
    order_index: 5,
    is_active: true
  }
];

async function createCategories() {
  try {
    // MongoDB bağlantısı
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB bağlantısı başarılı');

    // Mevcut kategorileri temizle
    await FAQCategory.deleteMany({});
    console.log('Mevcut kategoriler temizlendi');

    // Yeni kategorileri ekle
    const categories = await FAQCategory.insertMany(sampleCategories);
    console.log('Sample kategoriler oluşturuldu:', categories.length);
    
    categories.forEach(cat => {
      console.log(`- ${cat.name_tr} (${cat.name_en})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Hata:', error);
    process.exit(1);
  }
}

createCategories();
