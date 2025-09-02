import React ,{ useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';

// Import AuthWrapper component


// ✅ Sadece mevcut dosyaları import et
import {
  AdminLayout,
  Dashboard,
  ComingSoon,
  PackageManager,
  BlogManager,
  FAQManager,
  ContactManager,
  NutritionTestManager,
  TestimonialsManager
} from '../admin';


const AdminPanel = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const isEnglish = i18n.language === 'en';

  useEffect(() => {
    const path = location.pathname;
    if (path === '/admin' || path === '/yonetici-paneli' || path === '/en/admin-panel') {
      document.title = isEnglish ? 'Admin Panel - Oğuz Yolyapan' : 'Yönetici Paneli - Oğuz Yolyapan';
    }
  }, [location.pathname, isEnglish]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard isEnglish={isEnglish} />;
      case 'clients':
        return <ComingSoon isEnglish={isEnglish} />;
      case 'packages':
        return <PackageManager isEnglish={isEnglish} />;
      case 'nutrition-tests':
        return <NutritionTestManager isEnglish={isEnglish} />;
      case 'blog':
        return <BlogManager isEnglish={isEnglish} />;
      case 'faq':
        return <FAQManager isEnglish={isEnglish} />;
      case 'contact':
        return <ContactManager isEnglish={isEnglish} />;
      case 'testimonials':
        return <TestimonialsManager isEnglish={isEnglish} />;
      // Mevcut olmayan sayfalar için ComingSoon
      case 'appointments':
      case 'orders':
      case 'analytics':
      case 'settings':
      default:
        return <ComingSoon activeTab={activeTab} isEnglish={isEnglish} />;
    }
};

  return (
    <>
      <Helmet>
        <title>{isEnglish ? 'Admin Panel' : 'Yönetici Paneli'} - Oğuz Yolyapan</title>
        <meta name="description" content={isEnglish ? 'Admin management panel' : 'Yönetici paneli'} />
      </Helmet>

     
        <AdminLayout 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
        >
          {renderContent()}
        </AdminLayout>
    
    </>
  );
};

export default AdminPanel;