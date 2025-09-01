import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Models
import User from '../models/User.js';
import Category from '../models/Category.js';
import Post from '../models/Post.js';
import Package from '../models/Package.js';
import Testimonial from '../models/Testimonial.js';
import { FAQCategory, FAQItem } from '../models/FAQ.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Category.deleteMany({}),
      Post.deleteMany({}),
      Package.deleteMany({}),
      Testimonial.deleteMany({}),
      FAQCategory.deleteMany({}),
      FAQItem.deleteMany({})
    ]);

    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      firstName: 'Oğuz',
      lastName: 'Yolyapan',
      email: 'admin@oguzyolyapan.com',
      password: 'admin123456',
      role: 'super_admin',
      isActive: true,
      isEmailVerified: true
    });

    console.log('👤 Created admin user');

    // Create categories
    const categories = await Category.insertMany([
      {
        name_tr: 'Beslenme',
        name_en: 'Nutrition',
        slug_tr: 'beslenme',
        slug_en: 'nutrition',
        description_tr: 'Genel beslenme tavsiyeleri ve rehberleri',
        description_en: 'General nutrition advice and guides',
        color: '#059669',
        icon: 'bi-apple'
      },
      {
        name_tr: 'Kilo Yönetimi',
        name_en: 'Weight Management',
        slug_tr: 'kilo-yonetimi',
        slug_en: 'weight-management',
        description_tr: 'Sağlıklı kilo verme ve alma stratejileri',
        description_en: 'Healthy weight loss and gain strategies',
        color: '#0ea5e9',
        icon: 'bi-graph-up'
      },
      {
        name_tr: 'Spor Beslenmesi',
        name_en: 'Sports Nutrition',
        slug_tr: 'spor-beslenmesi',
        slug_en: 'sports-nutrition',
        description_tr: 'Atletik performans için beslenme',
        description_en: 'Nutrition for athletic performance',
        color: '#f59e0b',
        icon: 'bi-lightning'
      }
    ]);

    console.log('📂 Created categories');

    // Create blog posts
    const posts = await Post.insertMany([
      {
        title_tr: 'Sağlıklı Yaz Beslenmesi İçin 10 İpucu',
        title_en: '10 Tips for Healthy Summer Nutrition',
        slug_tr: 'saglikli-yaz-beslenmesi-ipuclari',
        slug_en: 'healthy-summer-nutrition-tips',
        excerpt_tr: 'Sıcak yaz aylarında sağlıklı beslenmeyi sürdürmek için pratik öneriler.',
        excerpt_en: 'Practical suggestions for maintaining healthy nutrition during hot summer months.',
        content_tr: '<p>Yaz ayları geldiğinde vücudumuzun beslenme ihtiyaçları değişir. İşte sağlıklı bir yaz geçirmek için beslenme önerileri...</p>',
        content_en: '<p>When summer arrives, our body\'s nutritional needs change. Here are nutrition recommendations for a healthy summer...</p>',
        imageUrl: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop',
        category: categories[0]._id,
        author: adminUser._id,
        status: 'published',
        isFeatured: true,
        publishedAt: new Date()
      },
      {
        title_tr: 'Etkili Kilo Verme Stratejileri',
        title_en: 'Effective Weight Loss Strategies',
        slug_tr: 'etkili-kilo-verme-stratejileri',
        slug_en: 'effective-weight-loss-strategies',
        excerpt_tr: 'Sürdürülebilir kilo kaybı için bilimsel yaklaşımlar ve pratik yöntemler.',
        excerpt_en: 'Scientific approaches and practical methods for sustainable weight loss.',
        content_tr: '<p>Kilo verme sadece diyet yapmak değildir. Sürdürülebilir sonuçlar için doğru yaklaşımları öğrenin...</p>',
        content_en: '<p>Weight loss is not just about dieting. Learn the right approaches for sustainable results...</p>',
        imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
        category: categories[1]._id,
        author: adminUser._id,
        status: 'published',
        isFeatured: true,
        publishedAt: new Date()
      },
      {
        title_tr: 'Sporcular İçin Beslenme Rehberi',
        title_en: 'Nutrition Guide for Athletes',
        slug_tr: 'sporcular-icin-beslenme-rehberi',
        slug_en: 'nutrition-guide-for-athletes',
        excerpt_tr: 'Atletik performansı artırmak için doğru beslenme zamanlaması ve besin seçimi.',
        excerpt_en: 'Proper nutrition timing and food selection to enhance athletic performance.',
        content_tr: '<p>Spor performansında beslenme kritik rol oynar. Doğru besinleri doğru zamanda alarak performansınızı artırın...</p>',
        content_en: '<p>Nutrition plays a critical role in sports performance. Boost your performance by consuming the right nutrients at the right time...</p>',
        imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=600&fit=crop',
        category: categories[2]._id,
        author: adminUser._id,
        status: 'published',
        isFeatured: true,
        publishedAt: new Date()
      }
    ]);

    console.log('📝 Created blog posts');

    // Create packages
    const packages = await Package.insertMany([
      {
        title_tr: 'Temel Beslenme Paketi',
        title_en: 'Basic Nutrition Package',
        description_tr: 'Sağlıklı yaşam için temel beslenme danışmanlığı',
        description_en: 'Basic nutrition counseling for healthy living',
        features_tr: [
          'İlk değerlendirme görüşmesi',
          'Kişisel beslenme planı',
          '1 ay takip',
          'WhatsApp desteği'
        ],
        features_en: [
          'Initial assessment consultation',
          'Personal nutrition plan',
          '1 month follow-up',
          'WhatsApp support'
        ],
        price: 800,
        originalPrice: 1000,
        currency: 'TRY',
        duration_tr: '1 Ay',
        duration_en: '1 Month',
        sessionCount: 2,
        type: 'basic',
        category: categories[0]._id,
        isActive: true,
        isHomeFeatured: true,
        icon: 'bi-heart'
      },
      {
        title_tr: 'Standart Takip Paketi',
        title_en: 'Standard Follow-up Package',
        description_tr: 'Kapsamlı beslenme takibi ve destek',
        description_en: 'Comprehensive nutrition monitoring and support',
        features_tr: [
          'Detaylı beslenme analizi',
          'Kişiselleştirilmiş plan',
          '3 ay takip',
          '24/7 WhatsApp desteği',
          'Aylık kontrol görüşmeleri'
        ],
        features_en: [
          'Detailed nutrition analysis',
          'Personalized plan',
          '3 months follow-up',
          '24/7 WhatsApp support',
          'Monthly check-up sessions'
        ],
        price: 1800,
        originalPrice: 2200,
        currency: 'TRY',
        duration_tr: '3 Ay',
        duration_en: '3 Months',
        sessionCount: 6,
        type: 'standard',
        category: categories[0]._id,
        isActive: true,
        isHomeFeatured: true,
        isPopular: true,
        icon: 'bi-star',
        color: '#0ea5e9'
      },
      {
        title_tr: 'Premium Dönüşüm Paketi',
        title_en: 'Premium Transformation Package',
        description_tr: 'Tam yaşam tarzı değişimi için premium hizmet',
        description_en: 'Premium service for complete lifestyle transformation',
        features_tr: [
          'Komple sağlık değerlendirmesi',
          'Kişisel antrenman planı dahil',
          '6 ay takip',
          '7/24 uzman desteği',
          'Haftalık kontrol görüşmeleri',
          'Supplement önerileri',
          'Yaşam tarzı koçluğu'
        ],
        features_en: [
          'Complete health assessment',
          'Personal training plan included',
          '6 months follow-up',
          '24/7 expert support',
          'Weekly check-up sessions',
          'Supplement recommendations',
          'Lifestyle coaching'
        ],
        price: 3500,
        originalPrice: 4500,
        currency: 'TRY',
        duration_tr: '6 Ay',
        duration_en: '6 Months',
        sessionCount: 12,
        type: 'premium',
        category: categories[0]._id,
        isActive: true,
        isHomeFeatured: true,
        icon: 'bi-trophy',
        color: '#f59e0b'
      }
    ]);

    console.log('📦 Created packages');

    // Create testimonials
    const testimonials = await Testimonial.insertMany([
      {
        name: 'Ayşe Demir',
        content: {
          tr: 'Oğuz hocam sayesinde 3 ayda 12 kilo verdim. Hem sağlıklı hem de sürdürülebilir bir program hazırladı.',
          en: 'Thanks to Oğuz, I lost 12 kg in 3 months. He prepared a program that is both healthy and sustainable.'
        },
        rating: 5,
        position: 'Öğretmen',
        location: 'İstanbul',
        packageUsed: packages[1]._id,
        status: 'approved',
        isVisible: true,
        approvedAt: new Date()
      },
      {
        name: 'Mehmet Kaya',
        content: {
          tr: 'Spor performansım için aldığım beslenme desteği mükemmeldi. Antrenmanlarımda büyük fark gördüm.',
          en: 'The nutritional support I received for my sports performance was excellent. I saw a big difference in my training.'
        },
        rating: 5,
        position: 'Sporcu',
        location: 'Ankara',
        packageUsed: packages[2]._id,
        status: 'approved',
        isVisible: true,
        approvedAt: new Date()
      },
      {
        name: 'Zeynep Yılmaz',
        content: {
          tr: 'Sağlıklı kilo almak için başvurdum. Çok profesyonel yaklaşım ve sürekli destek aldım.',
          en: 'I applied to gain weight healthily. I received a very professional approach and continuous support.'
        },
        rating: 5,
        position: 'Mühendis',
        location: 'İzmir',
        packageUsed: packages[0]._id,
        status: 'approved',
        isVisible: true,
        approvedAt: new Date()
      }
    ]);

    console.log('💬 Created testimonials');

    // Create FAQ categories
    const faqCategories = await FAQCategory.insertMany([
      {
        name_tr: 'Genel Sorular',
        name_en: 'General Questions',
        description_tr: 'Sık sorulan genel sorular',
        description_en: 'Frequently asked general questions',
        icon: 'bi-question-circle',
        color: '#059669'
      },
      {
        name_tr: 'Randevu ve Süreç',
        name_en: 'Appointment and Process',
        description_tr: 'Randevu alma ve süreç hakkında sorular',
        description_en: 'Questions about appointments and the process',
        icon: 'bi-calendar',
        color: '#0ea5e9'
      },
      {
        name_tr: 'Beslenme Planları',
        name_en: 'Nutrition Plans',
        description_tr: 'Beslenme planları hakkında sorular',
        description_en: 'Questions about nutrition plans',
        icon: 'bi-clipboard-data',
        color: '#f59e0b'
      }
    ]);

    // Create FAQ items
    const faqItems = await FAQItem.insertMany([
      {
        question_tr: 'İlk görüşme nasıl yapılır?',
        question_en: 'How is the initial consultation conducted?',
        answer_tr: 'İlk görüşme detaylı bir değerlendirme ile başlar. Sağlık geçmişiniz, yaşam tarzınız ve hedefleriniz konuşulur.',
        answer_en: 'The initial consultation begins with a detailed assessment. Your health history, lifestyle, and goals are discussed.',
        category: faqCategories[1]._id,
        isActive: true
      },
      {
        question_tr: 'Beslenme planları ne kadar sürede hazırlanır?',
        question_en: 'How long does it take to prepare nutrition plans?',
        answer_tr: 'Kişiselleştirilmiş beslenme planınız ilk görüşmeden sonra 2-3 iş günü içinde hazırlanır.',
        answer_en: 'Your personalized nutrition plan is prepared within 2-3 business days after the initial consultation.',
        category: faqCategories[2]._id,
        isActive: true
      },
      {
        question_tr: 'Online danışmanlık hizmeti var mı?',
        question_en: 'Is online counseling service available?',
        answer_tr: 'Evet, online görüşmeler ve WhatsApp üzerinden sürekli destek sağlanmaktadır.',
        answer_en: 'Yes, online consultations and continuous support via WhatsApp are provided.',
        category: faqCategories[0]._id,
        isActive: true
      }
    ]);

    console.log('❓ Created FAQ items');

    console.log('✅ Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: 1 (admin)`);
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Posts: ${posts.length}`);
    console.log(`   - Packages: ${packages.length}`);
    console.log(`   - Testimonials: ${testimonials.length}`);
    console.log(`   - FAQ Categories: ${faqCategories.length}`);
    console.log(`   - FAQ Items: ${faqItems.length}`);
    console.log('');
    console.log('🔑 Admin Login:');
    console.log('   Email: admin@oguzyolyapan.com');
    console.log('   Password: admin123456');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    process.exit(0);
  }
};

// Run seeding
const runSeed = async () => {
  await connectDB();
  await seedDatabase();
};

runSeed();
