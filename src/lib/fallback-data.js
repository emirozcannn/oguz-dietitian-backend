// Fallback data for when backend is unavailable

export const fallbackBlogPosts = [
  {
    _id: 'fallback-post-1',
    title: 'Sağlıklı Beslenme İpuçları',
    title_tr: 'Sağlıklı Beslenme İpuçları',
    title_en: 'Healthy Eating Tips',
    slug: 'saglikli-beslenme-ipuclari',
    slug_tr: 'saglikli-beslenme-ipuclari',
    slug_en: 'healthy-eating-tips',
    excerpt: 'Günlük yaşamınızda sağlıklı beslenme alışkanlıkları kazanmanın yolları...',
    excerpt_tr: 'Günlük yaşamınızda sağlıklı beslenme alışkanlıkları kazanmanın yolları...',
    excerpt_en: 'Ways to develop healthy eating habits in your daily life...',
    content: 'Sağlıklı beslenme, yaşam kalitenizi artıran en önemli faktörlerden biridir...',
    imageUrl: '/assets/blog-placeholder.jpg',
    publishedAt: new Date('2024-12-01'),
    readTime: 5,
    views: 234
  },
  {
    _id: 'fallback-post-2',
    title: 'Kilo Verme Rehberi',
    title_tr: 'Kilo Verme Rehberi',
    title_en: 'Weight Loss Guide',
    slug: 'kilo-verme-rehberi',
    slug_tr: 'kilo-verme-rehberi',
    slug_en: 'weight-loss-guide',
    excerpt: 'Bilimsel yöntemlerle sağlıklı kilo verme stratejileri...',
    excerpt_tr: 'Bilimsel yöntemlerle sağlıklı kilo verme stratejileri...',
    excerpt_en: 'Scientific and healthy weight loss strategies...',
    content: 'Kilo vermek sadece estetik bir kaygı değil, aynı zamanda sağlık açısından da önemlidir...',
    imageUrl: '/assets/blog-placeholder.jpg',
    publishedAt: new Date('2024-11-28'),
    readTime: 8,
    views: 456
  },
  {
    _id: 'fallback-post-3',
    title: 'Spor ve Beslenme',
    title_tr: 'Spor ve Beslenme',
    title_en: 'Sports and Nutrition',
    slug: 'spor-ve-beslenme',
    slug_tr: 'spor-ve-beslenme',
    slug_en: 'sports-and-nutrition',
    excerpt: 'Spor performansınızı artıracak beslenme önerileri...',
    excerpt_tr: 'Spor performansınızı artıracak beslenme önerileri...',
    excerpt_en: 'Nutrition recommendations to improve your athletic performance...',
    content: 'Spor yaparken doğru beslenme, performansınızı maksimize etmenin anahtarıdır...',
    imageUrl: '/assets/blog-placeholder.jpg',
    publishedAt: new Date('2024-11-25'),
    readTime: 6,
    views: 123
  }
];

export const fallbackPackages = [
  {
    _id: 'fallback-package-1',
    title: 'Temel Beslenme Paketi',
    title_tr: 'Temel Beslenme Paketi',
    title_en: 'Basic Nutrition Package',
    description: 'Sağlıklı yaşam için temel beslenme danışmanlığı',
    description_tr: 'Sağlıklı yaşam için temel beslenme danışmanlığı',
    description_en: 'Basic nutrition counseling for healthy living',
    features: [
      'İlk değerlendirme seansı',
      'Kişisel diyet planı',
      'Haftalık takip',
      'WhatsApp desteği'
    ],
    features_tr: [
      'İlk değerlendirme seansı',
      'Kişisel diyet planı',
      'Haftalık takip',
      'WhatsApp desteği'
    ],
    features_en: [
      'Initial assessment session',
      'Personal diet plan',
      'Weekly follow-up',
      'WhatsApp support'
    ],
    price: 1500,
    originalPrice: 2000,
    currency: 'TRY',
    duration: '1 Ay',
    duration_tr: '1 Ay',
    duration_en: '1 Month',
    sessionCount: 4,
    type: 'individual',
    isPopular: false,
    isHomeFeatured: true,
    icon: 'bi-heart',
    color: '#28a745',
    discountPercentage: 25,
    rating: 4.8
  },
  {
    _id: 'fallback-package-2',
    title: 'Premium Diyetisyen Paketi',
    title_tr: 'Premium Diyetisyen Paketi',
    title_en: 'Premium Dietitian Package',
    description: 'Kapsamlı beslenme danışmanlığı ve sürekli takip',
    description_tr: 'Kapsamlı beslenme danışmanlığı ve sürekli takip',
    description_en: 'Comprehensive nutrition counseling with continuous follow-up',
    features: [
      'Detaylı sağlık analizi',
      'Özel diyet planı',
      'Günlük takip',
      '7/24 destek',
      'Tarifler ve öneriler',
      'Aylık vücut analizi'
    ],
    features_tr: [
      'Detaylı sağlık analizi',
      'Özel diyet planı',
      'Günlük takip',
      '7/24 destek',
      'Tarifler ve öneriler',
      'Aylık vücut analizi'
    ],
    features_en: [
      'Detailed health analysis',
      'Custom diet plan',
      'Daily follow-up',
      '24/7 support',
      'Recipes and recommendations',
      'Monthly body analysis'
    ],
    price: 3500,
    originalPrice: 4500,
    currency: 'TRY',
    duration: '3 Ay',
    duration_tr: '3 Ay',
    duration_en: '3 Months',
    sessionCount: 12,
    type: 'premium',
    isPopular: true,
    isHomeFeatured: true,
    icon: 'bi-star',
    color: '#ffc107',
    discountPercentage: 22,
    rating: 4.9
  },
  {
    _id: 'fallback-package-3',
    title: 'Online Grup Koçluğu',
    title_tr: 'Online Grup Koçluğu',
    title_en: 'Online Group Coaching',
    description: 'Grup halinde motivasyon ve beslenme eğitimi',
    description_tr: 'Grup halinde motivasyon ve beslenme eğitimi',
    description_en: 'Group motivation and nutrition education',
    features: [
      'Grup seansları',
      'Ortak hedefler',
      'Motivasyon desteği',
      'Eğitim materyalleri'
    ],
    features_tr: [
      'Grup seansları',
      'Ortak hedefler',
      'Motivasyon desteği',
      'Eğitim materyalleri'
    ],
    features_en: [
      'Group sessions',
      'Common goals',
      'Motivation support',
      'Educational materials'
    ],
    price: 750,
    originalPrice: 1000,
    currency: 'TRY',
    duration: '1 Ay',
    duration_tr: '1 Ay',
    duration_en: '1 Month',
    sessionCount: 4,
    type: 'group',
    isPopular: false,
    isHomeFeatured: true,
    icon: 'bi-people',
    color: '#17a2b8',
    discountPercentage: 25,
    rating: 4.6
  }
];

export const fallbackTestimonials = [
  {
    _id: 'fallback-testimonial-1',
    name: 'Ayşe K.',
    content: {
      tr: 'Oğuz Bey sayesinde 6 ayda 15 kilo verdim. Hem sağlığım düzeldi hem de özgüvenim arttı. Çok teşekkür ederim!',
      en: 'Thanks to Mr. Oğuz, I lost 15 kg in 6 months. Both my health improved and my self-confidence increased. Thank you so much!'
    },
    rating: 5,
    position: 'Öğretmen',
    location: 'İstanbul',
    avatarUrl: null,
    approvedAt: new Date('2024-11-20')
  },
  {
    _id: 'fallback-testimonial-2',
    name: 'Mehmet D.',
    content: {
      tr: 'Beslenme alışkanlıklarımı tamamen değiştirdim. Artık çok daha enerjik ve sağlıklıyım. Herkese tavsiye ederim.',
      en: 'I completely changed my eating habits. Now I am much more energetic and healthy. I recommend it to everyone.'
    },
    rating: 5,
    position: 'Mühendis',
    location: 'Ankara',
    avatarUrl: null,
    approvedAt: new Date('2024-11-18')
  },
  {
    _id: 'fallback-testimonial-3',
    name: 'Fatma S.',
    content: {
      tr: 'Diyet programı çok profesyonel ve kişiselleştirilmişti. İnanılmaz sonuçlar aldım!',
      en: 'The diet program was very professional and personalized. I got incredible results!'
    },
    rating: 5,
    position: 'Avukat',
    location: 'İzmir',
    avatarUrl: null,
    approvedAt: new Date('2024-11-15')
  },
  {
    _id: 'fallback-testimonial-4',
    name: 'Can Y.',
    content: {
      tr: 'Spor beslenmesi konusunda aldığım danışmanlık sayesinde performansım ciddi şekilde arttı.',
      en: 'Thanks to the sports nutrition consultancy I received, my performance increased significantly.'
    },
    rating: 5,
    position: 'Sporcu',
    location: 'Bursa',
    avatarUrl: null,
    approvedAt: new Date('2024-11-12')
  },
  {
    _id: 'fallback-testimonial-5',
    name: 'Zeynep A.',
    content: {
      tr: 'Hamilelik döneminde beslenme konusunda çok yardımcı oldu. Bebeğim ve ben çok sağlıklıyız.',
      en: 'It was very helpful with nutrition during pregnancy. My baby and I are very healthy.'
    },
    rating: 5,
    position: 'Hemşire',
    location: 'Adana',
    avatarUrl: null,
    approvedAt: new Date('2024-11-10')
  },
  {
    _id: 'fallback-testimonial-6',
    name: 'Emre K.',
    content: {
      tr: 'Metabolizma hızlandırma programı gerçekten işe yaradı. Artık daha hızlı kilo veriyorum.',
      en: 'The metabolism boosting program really worked. Now I lose weight faster.'
    },
    rating: 4,
    position: 'Öğrenci',
    location: 'Eskişehir',
    avatarUrl: null,
    approvedAt: new Date('2024-11-08')
  }
];

export const fallbackFAQ = [
  {
    _id: 'fallback-faq-category-1',
    name: 'Genel Sorular',
    description: 'Sıkça sorulan genel sorular',
    icon: 'bi-question-circle',
    color: '#007bff',
    items: [
      {
        _id: 'fallback-faq-1',
        question: 'Online danışmanlık nasıl çalışır?',
        answer: 'Online danışmanlığımız video görüşme, WhatsApp ve mail desteği ile gerçekleşir. İlk görüşmede size özel bir plan hazırlanır ve düzenli takipler yapılır.',
        viewCount: 234
      },
      {
        _id: 'fallback-faq-2',
        question: 'Kaç zamanda sonuç alırım?',
        answer: 'Her kişi farklıdır ancak genellikle 2-4 hafta içinde ilk sonuçları görmeye başlarsınız. Kalıcı sonuçlar için 3-6 aylık bir süreç önerilir.',
        viewCount: 189
      }
    ]
  },
  {
    _id: 'fallback-faq-category-2',
    name: 'Diyet ve Beslenme',
    description: 'Diyet ve beslenme ile ilgili sorular',
    icon: 'bi-heart',
    color: '#28a745',
    items: [
      {
        _id: 'fallback-faq-3',
        question: 'Hangi diyeti uygularsınız?',
        answer: 'Kişiye özel beslenme planları hazırlarız. Yaşam tarzınıza, sağlık durumunuza ve hedeflerinize göre en uygun beslenme programını oluştururuz.',
        viewCount: 156
      },
      {
        _id: 'fallback-faq-4',
        question: 'Takviye kullanmam gerekir mi?',
        answer: 'Takviye ihtiyacı kişiye göre değişir. Kan tahlillerinize göre eksik olan vitamin ve mineraller tespit edilir ve gerekirse takviye önerilir.',
        viewCount: 142
      }
    ]
  }
];

export const fallbackContactInfo = {
  phone: '+90 532 123 45 67',
  email: 'info@oguzyolyapan.com',
  address: 'Örnek Mahallesi, Sağlık Sokak No:1, Çankaya/Ankara',
  workingHours: 'Pazartesi - Cuma: 09:00 - 18:00',
  social: {
    instagram: 'https://instagram.com/oguzyolyapan',
    linkedin: 'https://linkedin.com/in/oguzyolyapan',
    facebook: 'https://facebook.com/oguzyolyapan'
  }
};
