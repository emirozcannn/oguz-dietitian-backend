// Sitemap generator for both Turkish and English versions
export const generateSitemap = () => {
  const baseUrl = 'https://oguzyolyapan.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  const routes = {
    tr: [
      { path: '/', priority: '1.0' },
      { path: '/hakkimda', priority: '0.9' },
      { path: '/blog', priority: '0.8' },
      { path: '/paketler', priority: '0.9' },
      { path: '/sss', priority: '0.7' },
      { path: '/iletisim', priority: '0.8' },
      { path: '/randevu', priority: '0.9' },
      { path: '/hesaplayicilar', priority: '0.7' },
      { path: '/giris', priority: '0.5' },
    ],
    en: [
      { path: '/en', priority: '1.0' },
      { path: '/en/about', priority: '0.9' },
      { path: '/en/blog', priority: '0.8' },
      { path: '/en/packages', priority: '0.9' },
      { path: '/en/faq', priority: '0.7' },
      { path: '/en/contact', priority: '0.8' },
      { path: '/en/appointment', priority: '0.9' },
      { path: '/en/calculators', priority: '0.7' },
      { path: '/en/login', priority: '0.5' },
    ]
  };

  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
`;

  // Add Turkish routes
  routes.tr.forEach(route => {
    sitemap += `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route.priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}/en${route.path === '/' ? '' : route.path.replace('/', '')}" />
    <xhtml:link rel="alternate" hreflang="tr" href="${baseUrl}${route.path}" />
  </url>
`;
  });

  // Add English routes
  routes.en.forEach(route => {
    sitemap += `  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${route.priority}</priority>
    <xhtml:link rel="alternate" hreflang="tr" href="${baseUrl}${route.path.replace('/en', '') || '/'}" />
    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}${route.path}" />
  </url>
`;
  });

  sitemap += `</urlset>`;
  
  return sitemap;
};

// SEO Meta Tags for different pages
export const getPageMeta = (page, language = 'tr') => {
  const isEnglish = language === 'en';
  const baseUrl = 'https://oguzyolyapan.com';
  
  const meta = {
    home: {
      title: isEnglish ? 
        'Expert Dietitian Oğuz Yolyapan | Professional Nutrition Counseling' : 
        'Uzman Diyetisyen Oğuz Yolyapan | Profesyonel Beslenme Danışmanlığı',
      description: isEnglish ? 
        'Expert Dietitian Oğuz Yolyapan offers personalized nutrition plans, weight management, and professional dietary counseling services.' : 
        'Uzman Diyetisyen Oğuz Yolyapan kişiselleştirilmiş beslenme planları, kilo yönetimi ve profesyonel diyet danışmanlığı hizmetleri sunar.',
      keywords: isEnglish ? 
        'dietitian, nutrition, diet, weight loss, health, nutrition counseling, Oğuz Yolyapan' : 
        'diyetisyen, beslenme, diyet, kilo verme, sağlık, beslenme danışmanlığı, Oğuz Yolyapan',
      url: isEnglish ? `${baseUrl}/en` : baseUrl
    },
    about: {
      title: isEnglish ? 
        'About Me - Expert Dietitian Oğuz Yolyapan' : 
        'Hakkımda - Uzman Diyetisyen Oğuz Yolyapan',
      description: isEnglish ? 
        'Learn about Expert Dietitian Oğuz Yolyapan\'s education, experience, and approach to nutrition counseling.' : 
        'Uzman Diyetisyen Oğuz Yolyapan\'ın eğitimi, deneyimi ve beslenme danışmanlığı yaklaşımı hakkında bilgi edinin.',
      keywords: isEnglish ? 
        'about dietitian, nutrition education, professional experience, Oğuz Yolyapan' : 
        'diyetisyen hakkında, beslenme eğitimi, profesyonel deneyim, Oğuz Yolyapan',
      url: isEnglish ? `${baseUrl}/en/about` : `${baseUrl}/hakkimda`
    },
    // Add more pages as needed
  };

  return meta[page] || meta.home;
};

// Structured Data (JSON-LD) for SEO
export const getStructuredData = (type, language = 'tr') => {
  const isEnglish = language === 'en';
  const baseUrl = 'https://oguzyolyapan.com';
  
  const structuredData = {
    organization: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Oğuz Yolyapan",
      "url": baseUrl,
      "logo": `${baseUrl}/images/logo.png`,
      "description": isEnglish ? 
        "Expert Dietitian providing professional nutrition counseling and personalized diet plans." : 
        "Profesyonel beslenme danışmanlığı ve kişiselleştirilmiş diyet planları sunan uzman diyetisyen.",
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+90-5xx-xxx-xx-xx",
        "contactType": "customer service"
      },
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "TR",
        "addressLocality": "Istanbul"
      }
    },
    person: {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": "Oğuz Yolyapan",
      "jobTitle": isEnglish ? "Expert Dietitian" : "Uzman Diyetisyen",
      "description": isEnglish ? 
        "Master's degree in Nutrition and Dietetics. Specialized in weight management and medical nutrition therapy." : 
        "Beslenme ve Diyet Yüksek Lisans. Kilo yönetimi ve medikal beslenme tedavisinde uzman.",
      "url": baseUrl,
      "image": `${baseUrl}/images/profile.jpg`,
      "sameAs": [
        "https://facebook.com/oguzyolyapan",
        "https://instagram.com/oguzyolyapan",
        "https://linkedin.com/in/oguzyolyapan"
      ]
    },
    service: {
      "@context": "https://schema.org",
      "@type": "Service",
      "name": isEnglish ? "Nutrition Counseling" : "Beslenme Danışmanlığı",
      "description": isEnglish ? 
        "Professional nutrition counseling services including personalized diet plans, weight management, and health optimization." : 
        "Kişiselleştirilmiş diyet planları, kilo yönetimi ve sağlık optimizasyonu dahil profesyonel beslenme danışmanlığı hizmetleri.",
      "provider": {
        "@type": "Person",
        "name": "Oğuz Yolyapan"
      },
      "serviceType": isEnglish ? "Nutrition Counseling" : "Beslenme Danışmanlığı",
      "availableLanguage": ["tr", "en"]
    }
  };

  return structuredData[type] || structuredData.organization;
};
