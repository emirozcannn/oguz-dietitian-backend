import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import apiClient from '../lib/api';
import './Home.css';
import '../styles/blog.css';
import { Carousel } from 'react-bootstrap';

import NutritionTestModal from './NutritionTestModal';
import Testimonials from '../components/Testimonials';

// Avatar render fonksiyonu sadeleştirildi ve dosya başına taşındı


const Home = () => {
  const { t, i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const [isVisible, setIsVisible] = useState({});
  const [blogPosts, setBlogPosts] = useState([]);
  // Packages section states
  const [homePackages, setHomePackages] = useState([]);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [showNutritionTest, setShowNutritionTest] = useState(false);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await apiClient.getFeaturedPosts(i18n.language === 'en' ? 'en' : 'tr', 3);
        
        if (response?.success && response?.data?.posts) {
          const formattedPosts = response.data.posts.map(post => ({
            id: post._id || post.id,
            title_tr: post.title_tr || post.title || '',
            title_en: post.title_en || post.title || '',
            excerpt_tr: post.excerpt_tr || post.excerpt || '',
            excerpt_en: post.excerpt_en || post.excerpt || '',
            slug_tr: post.slug_tr || post.slug || '',
            slug_en: post.slug_en || post.slug || '',
            image_url: post.imageUrl || post.image_url || '',
            published_at: post.publishedAt || post.published_at,
            read_time: post.readTime || post.read_time || 3,
            categories: post.categories || []
          }));
          setBlogPosts(formattedPosts);
        } else {
          throw new Error('Invalid API response structure');
        }
      } catch (error) {
        console.error('Blog posts fetch error:', error);
        // Fallback to demo data
        setBlogPosts([
          {
            id: 'sample-1',
            title_tr: 'Sağlıklı Yaz Beslenmesi',
            title_en: 'Healthy Summer Nutrition',
            excerpt_tr: 'Sıcak yaz aylarında optimal beslenmeyi sürdürmek için temel öneriler...',
            excerpt_en: 'Essential tips for maintaining optimal nutrition during hot summer months...',
            slug_tr: 'saglikli-yaz-beslenmesi',
            slug_en: 'healthy-summer-nutrition',
            image_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400&h=250&fit=crop',
            read_time: 3
          },
          {
            id: 'sample-2',
            title_tr: 'Kilo Verme Stratejileri',
            title_en: 'Weight Loss Strategies',
            excerpt_tr: 'Sürdürülebilir kilo yönetimi için kanıta dayalı yaklaşımlar...',
            excerpt_en: 'Evidence-based approaches for sustainable weight management...',
            slug_tr: 'kilo-verme-stratejileri',
            slug_en: 'weight-loss-strategies',
            image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=250&fit=crop',
            read_time: 5
          },
          {
            id: 'sample-3',
            title_tr: 'Spor Beslenmesi Rehberi',
            title_en: 'Sports Nutrition Guide',
            excerpt_tr: 'Doğru beslenme zamanlaması ile atletik performansınızı optimize edin...',
            excerpt_en: 'Optimize your athletic performance with proper nutrition timing...',
            slug_tr: 'spor-beslenmesi-rehberi',
            slug_en: 'sports-nutrition-guide',
            image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=250&fit=crop',
            read_time: 4
          }
        ]);
      }
    };

    fetchBlogPosts();
  }, [i18n.language]);

  // Fetch packages for Home Packages section
  useEffect(() => {
    const fetchHomePackages = async () => {
      try {
        const response = await apiClient.getHomeFeaturedPackages(i18n.language === 'en' ? 'en' : 'tr');
        
        if (response?.success && response?.data?.packages) {
          const normalized = response.data.packages.map(pkg => ({
            ...pkg,
            id: pkg._id || pkg.id,
            popular: pkg.isPopular || false,
            title_tr: pkg.title_tr || pkg.title || '',
            title_en: pkg.title_en || pkg.title || '',
            description_tr: pkg.description_tr || pkg.description || '',
            description_en: pkg.description_en || pkg.description || '',
            duration_tr: pkg.duration_tr || pkg.duration || '',
            duration_en: pkg.duration_en || pkg.duration || ''
          }));
          setHomePackages(normalized);
        } else {
          throw new Error('Invalid packages API response');
        }
      } catch (error) {
        console.error('Error loading packages:', error);
        // Fallback to demo data
        setHomePackages([
          {
            id: 'demo-1',
            title_tr: 'Temel Beslenme Danışmanlığı',
            title_en: 'Basic Nutrition Consultation',
            description_tr: 'Kişiselleştirilmiş beslenme planı ve yaşam tarzı önerileri',
            description_en: 'Personalized nutrition plan and lifestyle recommendations',
            price: 500,
            currency: 'TRY',
            duration_tr: '1 saat',
            duration_en: '1 hour',
            sessionCount: 1,
            popular: false,
            icon: 'bi-person-check',
            color: '#28a745'
          },
          {
            id: 'demo-2',
            title_tr: 'Premium Takip Programı',
            title_en: 'Premium Follow-up Program',
            description_tr: '3 aylık kapsamlı beslenme ve yaşam tarzı koçluğu',
            description_en: '3-month comprehensive nutrition and lifestyle coaching',
            price: 1500,
            originalPrice: 2000,
            currency: 'TRY',
            duration_tr: '3 ay',
            duration_en: '3 months',
            sessionCount: 6,
            popular: true,
            icon: 'bi-trophy',
            color: '#007bff'
          },
          {
            id: 'demo-3',
            title_tr: 'Spor Beslenmesi',
            title_en: 'Sports Nutrition',
            description_tr: 'Atletik performans için özel beslenme protokolleri',
            description_en: 'Special nutrition protocols for athletic performance',
            price: 750,
            currency: 'TRY',
            duration_tr: '1.5 saat',
            duration_en: '1.5 hours',
            sessionCount: 1,
            popular: false,
            icon: 'bi-lightning',
            color: '#fd7e14'
          }
        ]);
      } finally {
        setLoadingPackages(false);
      }
    };
    fetchHomePackages();
  }, [i18n.language]);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await apiClient.getApprovedTestimonials(i18n.language);
        
        if (response?.success && response?.data?.testimonials) {
          // Sadece içeriği ve ismi dolu olanları göster
          const validTestimonials = response.data.testimonials.filter(
            t => t.content && t.name
          );
          setTestimonials(validTestimonials);
        } else {
          throw new Error('Invalid testimonials API response');
        }
      } catch (error) {
        console.error('API testimonials fetch error:', error.message);
        // Fallback to demo data
        setTestimonials([
          {
            id: 'demo-t1',
            name: 'Ayşe K.',
            content: {
              tr: 'Oğuz Bey ile çalışmaya başladıktan sonra hayatım değişti. Sadece kilo vermekle kalmadım, sağlıklı alışkanlıklar edindim.',
              en: 'My life changed after I started working with Oğuz. I not only lost weight but also gained healthy habits.'
            },
            rating: 5,
            position: 'Öğretmen',
            location: 'İstanbul'
          },
          {
            id: 'demo-t2',
            name: 'Mehmet S.',
            content: {
              tr: 'Spor yaparken doğru beslenmenin ne kadar önemli olduğunu öğrendim. Performansım büyük oranda arttı.',
              en: 'I learned how important proper nutrition is while exercising. My performance increased significantly.'
            },
            rating: 5,
            position: 'Sporcu',
            location: 'Ankara'
          },
          {
            id: 'demo-t3',
            name: 'Zeynep A.',
            content: {
              tr: 'Hamilelik dönemimde Oğuz Beyin desteği çok değerliydi. Hem sağlıklı kaldım hem de bebeğim için en iyisini yaptım.',
              en: 'Oğuz\'s support during my pregnancy was very valuable. I stayed healthy and did the best for my baby.'
            },
            rating: 5,
            position: 'Anne',
            location: 'İzmir'
          }
        ]);
      }
    };

    fetchTestimonials();
  }, [i18n.language]);
  

  const getLocalizedPath = (path) => (isEnglish ? `/en${path}` : path);

  const formatImage = (imageUrl) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=250&fit=crop';
    
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    if (imageUrl.startsWith('blog-images/')) {
      return `https://oawgkxekiodaiwtffwzf.supabase.co/storage/v1/object/public/${imageUrl}`;
    }
    
    return `https://oawgkxekiodaiwtffwzf.supabase.co/storage/v1/object/public/blog-images/${imageUrl}`;
  };

  const formatExcerpt = (content, maxLength = 100) => {
    if (!content) return '';
    const plainText = content.replace(/<[^>]*>/g, '');
    return plainText.length > maxLength ? plainText.substring(0, maxLength) + '...' : plainText;
  };

  // Removed the problematic Supabase fetch - using demo data only

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );
    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Buton metni alternatifleri:
  const nutritionTestBtnText = isEnglish
    ? 'Start Health Test' // Alternatifler: 'Discover Your Diet Plan', 'Free Body Analysis'
    : 'Sağlık Testini Başlat'; // Alternatifler: 'Diyet Planını Keşfet', 'Ücretsiz Vücut Analizi'

  return (
    <>
      <Helmet>
        <title>
          {isEnglish
            ? 'Expert Dietitian Oğuz Yolyapan | Professional Nutrition Counseling'
            : 'Uzman Diyetisyen Oğuz Yolyapan | Profesyonel Beslenme Danışmanlığı'}
        </title>
        <meta
          name="description"
          content={
            isEnglish
              ? 'Expert Dietitian Oğuz Yolyapan offers personalized nutrition plans, weight management, and professional dietary counseling services.'
              : 'Uzman Diyetisyen Oğuz Yolyapan kişiselleştirilmiş beslenme planları, kilo yönetimi ve profesyonel diyet danışmanlığı hizmetleri sunar.'
          }
        />
        <meta
          name="keywords"
          content={
            isEnglish
              ? 'dietitian, nutrition, diet, weight loss, health, nutrition counseling, Oğuz Yolyapan'
              : 'diyetisyen, beslenme, diyet, kilo verme, sağlık, beslenme danışmanlığı, Oğuz Yolyapan'
          }
        />
        <link
          rel="canonical"
          href={isEnglish ? 'https://oguzyolyapan.com/en' : 'https://oguzyolyapan.com'}
        />
      </Helmet>

      {/* Hero Section */}
      <section className="hero-section position-relative overflow-hidden">
        <div className="hero-bg"></div>
        <div className="container">
          <div className="row align-items-center min-vh-100 py-5 gx-lg-5 gy-5">
            {/* Left Content */}
            <div className="col-lg-6 d-flex flex-column justify-content-center" data-animate id="hero-content">
              <div className={`hero-content ${isVisible['hero-content'] ? 'animate-slide-in-left' : ''}`}> 
                <span className="badge bg-success-subtle text-success fs-6 px-4 py-2 rounded-pill mb-3 shadow-sm">
                  <i className="bi bi-award me-2"></i>
                  {isEnglish ? 'Expert Dietitian' : 'Uzman Diyetisyen'}
                </span>
                <h1 className="display-3 fw-bold mb-3 lh-sm">
                  {isEnglish ? 'Personalized Nutrition for Better Living' : 'Daha Sağlıklı Bir Yaşam İçin Kişisel Beslenme'}
                </h1>
                <p className="fs-5 text-muted mb-4">
                  {isEnglish 
                    ? 'Work with a trusted expert to create a nutrition plan tailored to your goals.' 
                    : 'Hedeflerinize özel bir beslenme planı oluşturmak için güvenilir bir uzmanla çalışın.'}
                </p>
                <div className="d-flex flex-column flex-sm-row gap-3 mb-4">
                  <Link
                    to={getLocalizedPath(isEnglish ? '/appointment' : '/randevu')}
                    className="btn btn-success btn-lg px-5 py-3 rounded-pill fw-semibold shadow-sm"
                  >
                    <i className="bi bi-calendar-check me-2"></i>
                    {isEnglish ? 'Get Started' : 'Hemen Başla'}
                  </Link>
                  
                  <button
                    className="btn btn-outline-success btn-lg px-5 py-3 rounded-pill fw-semibold shadow-sm"
                    onClick={() => setShowNutritionTest(true)}
                    type="button"
                  >
                    <i className="bi bi-heart-pulse me-2"></i>
                    {nutritionTestBtnText}
                  </button>
                </div>
                {/* Social Proof */}
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center">
                    {[...Array(3)].map((_, i) => (
                      <img 
                        key={i}
                        src={`https://randomuser.me/api/portraits/thumb/men/${30 + i}.jpg`}
                        className="rounded-circle border border-white border-2 shadow-sm"
                        style={{ width: '40px', height: '40px', marginLeft: i !== 0 ? '-10px' : '0' }}
                        alt="Client"
                      />
                    ))}
                    <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center fw-bold shadow-sm" 
                         style={{ width: '40px', height: '40px', marginLeft: '-10px', fontSize: '0.8rem' }}>
                      +500
                    </div>
                  </div>
                  <div className="ms-2 small">
                    <div className="fw-semibold text-dark">
                      {isEnglish ? '500+ clients trust us' : '500+ kişi bize güveniyor'}
                    </div>
                    <div className="text-warning">
                      ★★★★★ <span className="text-muted">4.9/5</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Right Image */}
            <div className="col-lg-6 text-center d-flex justify-content-center align-items-center" data-animate id="hero-image">
              <div className={`hero-image ${isVisible['hero-image'] ? 'animate-slide-in-right' : ''}`}> 
                <img 
                  src="https://images.unsplash.com/photo-1605210055344-330690f6c99d?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0"
                  alt="Dietitian at Work"
                  className="img-fluid rounded-4 shadow-lg"
                  style={{ maxWidth: '450px', width: '100%', transform: 'rotate(180deg)' }}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Packages Section - Modern Design */}
      <section className="py-5" style={{backgroundColor: '#fafafa'}}>
        <div className="container">
          {/* Header */}
          <div className="row">
            <div className="col-lg-10 mx-auto text-center mb-5">
              <div className="d-inline-flex align-items-center bg-white px-4 py-2 rounded-pill shadow-sm mb-4">
                <i className="bi bi-box text-success me-2"></i>
                <span className="fw-medium text-dark">
                  {isEnglish ? 'Our Packages' : 'Paketlerimiz'}
                </span>
              </div>
              <h2 className="display-4 fw-bold mb-4 text-dark">
                {isEnglish ? 'Tailored Nutrition Plans' : 'Size Özel Beslenme Planları'}
              </h2>
              <p className="lead text-muted mx-auto" style={{maxWidth: '600px'}}>
                {isEnglish
                  ? 'Choose the perfect plan that fits your lifestyle and health goals.'
                  : 'Yaşam tarzınıza ve sağlık hedeflerinize uygun mükemmel planı seçin.'}
              </p>
            </div>
          </div>

          {/* Packages Grid */}
          <div className="row g-4 mb-5">
            {loadingPackages ? (
              <div className="col-12 text-center py-5">
                <div className="spinner-border text-success" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : homePackages.length > 0 ? (
              homePackages.slice(0, 3).map((pkg) => (
                <div key={pkg.id} className="col-lg-4 col-md-6">
                  <div 
                    className="package-card h-100"
                    style={{
                      background: pkg.popular ? 
                        'linear-gradient(135deg, #059669 0%, #047857 100%)' : 
                        '#ffffff',
                      borderRadius: '16px',
                      padding: '32px',
                      boxShadow: pkg.popular ? 
                        '0 12px 40px rgba(5, 150, 105, 0.25)' : 
                        '0 4px 20px rgba(0,0,0,0.08)',
                      border: pkg.popular ? 'none' : '1px solid #f3f4f6',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (!pkg.popular) {
                        e.currentTarget.style.transform = 'translateY(-8px)';
                        e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!pkg.popular) {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                      }
                    }}
                  >
                    {/* Popular Badge */}
                    {pkg.popular && (
                      <div 
                        className="position-absolute top-0 start-50 translate-middle"
                        style={{
                          background: '#fbbf24',
                          color: '#78350f',
                          padding: '8px 16px',
                          borderRadius: '20px',
                          fontSize: '0.75rem',
                          fontWeight: '600'
                        }}
                      >
                        {isEnglish ? 'Most Popular' : 'En Popüler'}
                      </div>
                    )}
                    
                    {/* Icon */}
                    <div className="mb-4">
                      <div 
                        className="d-inline-flex align-items-center justify-content-center rounded-circle"
                        style={{
                          width: '64px',
                          height: '64px',
                          backgroundColor: pkg.popular ? 'rgba(255,255,255,0.2)' : '#f0fdf4'
                        }}
                      >
                        <i
                          className={`bi ${pkg.icon || 'bi-heart'}`}
                          style={{ 
                            fontSize: '2rem',
                            color: pkg.popular ? 'white' : '#059669'
                          }}
                        ></i>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <h3 
                      className="h4 fw-bold mb-3"
                      style={{ color: pkg.popular ? 'white' : '#1f2937' }}
                    >
                      {pkg.title}
                    </h3>
                    
                    <div className="mb-3">
                      <span 
                        className="display-6 fw-bold"
                        style={{ color: pkg.popular ? 'white' : '#059669' }}
                      >
                        ₺{pkg.price}
                      </span>
                      <div 
                        className="small mt-1"
                        style={{ color: pkg.popular ? 'rgba(255,255,255,0.8)' : '#6b7280' }}
                      >
                        {pkg.duration}
                      </div>
                    </div>
                    
                    <p 
                      className="mb-4"
                      style={{ 
                        color: pkg.popular ? 'rgba(255,255,255,0.9)' : '#6b7280',
                        lineHeight: 1.6
                      }}
                    >
                      {pkg.description}
                    </p>
                    
                    <Link
                      to={isEnglish ? '/en/packages' : '/paketler'}
                      className="btn btn-lg px-4 py-3 rounded-pill fw-medium w-100"
                      style={{
                        backgroundColor: pkg.popular ? 'white' : '#059669',
                        color: pkg.popular ? '#059669' : 'white',
                        border: 'none',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        if (pkg.popular) {
                          e.target.style.backgroundColor = '#f3f4f6';
                        } else {
                          e.target.style.backgroundColor = '#047857';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (pkg.popular) {
                          e.target.style.backgroundColor = 'white';
                        } else {
                          e.target.style.backgroundColor = '#059669';
                        }
                      }}
                    >
                      {isEnglish ? 'Get Started' : 'Başlayın'}
                      <i className="bi bi-arrow-right ms-2"></i>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-12 text-center">
                <p className="text-muted">
                  {isEnglish ? 'No packages available.' : 'Paket bulunamadı.'}
                </p>
              </div>
            )}
          </div>

          {/* View All Button */}
          <div className="row">
            <div className="col-12 text-center">
              <Link
                to={isEnglish ? '/packages' : '/paketler'}
                className="btn btn-outline-success btn-lg px-5 py-3 rounded-pill fw-medium"
                style={{ transition: 'all 0.3s ease' }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#059669';
                  e.target.style.color = 'white';
                  e.target.style.borderColor = '#059669';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#059669';
                  e.target.style.borderColor = '#059669';
                }}
              >
                {isEnglish ? 'View All Packages' : 'Tüm Paketleri Görüntüle'}
                <i className="bi bi-arrow-right ms-2"></i>
              </Link>
            </div>
          </div>
        </div>
      </section>




      {/* Why Choose Us Section - Focused & Impactful */}
      <section className="py-5 bg-white">
        <div className="container">
          {/* Header */}
       <div className="row">
            <div className="col-lg-10 mx-auto text-center mb-5">
              <div className="d-inline-flex align-items-center bg-white px-4 py-2 rounded-pill shadow-sm mb-4">
                <i className="bi bi-award-fill text-success me-2"></i>
                <span className="fw-medium text-dark">
                  {isEnglish ? 'Why Choose Us' : 'Neden Bizi Seçmelisiniz'}
                </span>
              </div>
              <h2 className="display-4 fw-bold mb-4 text-dark">
                {isEnglish ? 'Your Success is Our Priority' : 'Başarınız Bizim Önceliğimiz'}
              </h2>
              <p className="lead text-muted mx-auto" style={{maxWidth: '600px'}}>
                {isEnglish
                  ? 'We combine science, empathy, and technology to help you achieve lasting results.'
                  : 'Bilimi, empatiyi ve teknolojiyi birleştirerek kalıcı sonuçlar elde etmenizi sağlıyoruz.'}
              </p>
            </div>
          </div>

          {/* Features - Only 3 Most Important */}
          <div className="row g-5">
            {/* Feature 1 - Personalized Approach */}
            <div className="col-lg-4">
              <div className="text-center">
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    boxShadow: '0 8px 32px rgba(5, 150, 105, 0.3)'
                  }}
                >
                  <i className="bi bi-person-heart text-white" style={{ fontSize: '2.5rem' }}></i>
                </div>
                <h3 className="h4 fw-bold mb-3 text-dark">
                  {isEnglish ? 'Personalized Plans' : 'Kişiselleştirilmiş Planlar'}
                </h3>
                <p className="text-muted" style={{ lineHeight: 1.6 }}>
                  {isEnglish
                    ? 'Every plan is uniquely crafted based on your lifestyle, preferences, and health goals for maximum effectiveness.'
                    : 'Her plan, maksimum etkinlik için yaşam tarzınıza, tercihlerinize ve sağlık hedeflerinize göre benzersiz şekilde hazırlanır.'}
                </p>
              </div>
            </div>

            {/* Feature 2 - Scientific Approach */}
            <div className="col-lg-4">
              <div className="text-center">
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
                    boxShadow: '0 8px 32px rgba(14, 165, 233, 0.3)'
                  }}
                >
                  <i className="bi bi-graph-up-arrow text-white" style={{ fontSize: '2.5rem' }}></i>
                </div>
                <h3 className="h4 fw-bold mb-3 text-dark">
                  {isEnglish ? 'Evidence-Based Results' : 'Kanıta Dayalı Sonuçlar'}
                </h3>
                <p className="text-muted" style={{ lineHeight: 1.6 }}>
                  {isEnglish
                    ? 'Our methods are backed by the latest nutritional science and proven strategies that deliver real, measurable results.'
                    : 'Yöntemlerimiz en güncel beslenme bilimi ve gerçek, ölçülebilir sonuçlar veren kanıtlanmış stratejilerle desteklenir.'}
                </p>
              </div>
            </div>

            {/* Feature 3 - Ongoing Support */}
            <div className="col-lg-4">
              <div className="text-center">
                <div 
                  className="d-inline-flex align-items-center justify-content-center rounded-circle mb-4"
                  style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                    boxShadow: '0 8px 32px rgba(245, 158, 11, 0.3)'
                  }}
                >
                  <i className="bi bi-headset text-white" style={{ fontSize: '2.5rem' }}></i>
                </div>
                <h3 className="h4 fw-bold mb-3 text-dark">
                  {isEnglish ? '24/7 Expert Support' : '7/24 Uzman Desteği'}
                </h3>
                <p className="text-muted" style={{ lineHeight: 1.6 }}>
                  {isEnglish
                    ? 'Get continuous guidance and motivation from our nutrition experts whenever you need it, ensuring you stay on track.'
                    : 'İhtiyacınız olduğunda beslenme uzmanlarımızdan sürekli rehberlik ve motivasyon alın, yolda kalmanızı sağlayın.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

   
      

      {/* Blog Preview Section - Modern Design */}
      <section className="py-5" style={{backgroundColor: '#fafafa'}}>
        <div className="container">
          {/* Header Section */}
          <div className="row">
            <div className="col-lg-10 mx-auto text-center mb-5" data-animate id="blog-header">
              <div className={`section-header ${isVisible['blog-header'] ? 'animate-fade-in-up' : ''}`}>
                <div className="d-inline-flex align-items-center bg-white px-4 py-2 rounded-pill shadow-sm mb-4">
                  <i className="bi bi-journal-text text-success me-2"></i>
                  <span className="fw-medium text-dark">
                    {isEnglish ? 'Latest Articles' : 'Son Yazılar'}
                  </span>
                </div>
                <h2 className="display-4 fw-bold mb-4 text-dark">
                  {isEnglish ? 'Nutrition Insights & Tips' : 'Beslenme İçgörüleri ve İpuçları'}
                </h2>
                <p className="lead text-muted mx-auto" style={{maxWidth: '600px'}}>
                  {isEnglish
                    ? 'Discover evidence-based nutrition advice and practical tips to enhance your wellbeing.'
                    : 'Kanıta dayalı beslenme tavsiyeleri ve refahınızı artıracak pratik ipuçlarını keşfedin.'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Blog Grid */}
          <div className="row g-4 mb-5" data-animate id="blog-grid">
            {blogPosts.length > 0 ? (
              blogPosts.map((post, index) => (
                <div key={post.id} className="col-lg-4 col-md-6">
                  <article 
                    className={`blog-card h-100 ${isVisible['blog-grid'] ? 'animate-fade-in-up' : ''}`}
                    style={{ 
                      animationDelay: `${index * 0.15}s`,
                      background: '#ffffff',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                      border: 'none',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-8px)';
                      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                    }}
                  >
                    {/* Image Container */}
                    <div 
                      className="position-relative overflow-hidden"
                      style={{height: '240px'}}
                    >
                      <img
                        src={formatImage(post.image_url)}
                        className="w-100 h-100 object-fit-cover"
                        alt={post.image_alt_text || (isEnglish ? (post.title_en || post.title) : (post.title_tr || post.title))}
                        loading="lazy"
                        style={{
                          transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      />
                      
                      {/* Category Badge */}
                      <div className="position-absolute top-0 start-0 m-3">
                        <span 
                          className="badge px-3 py-2 rounded-pill fw-medium"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            color: '#059669',
                            backdropFilter: 'blur(10px)',
                            fontSize: '0.75rem'
                          }}
                        >
                          {post.categories ? 
                            (isEnglish ? post.categories.name_en : post.categories.name_tr) :
                            (isEnglish ? 'Nutrition' : 'Beslenme')
                          }
                        </span>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      {/* Meta Info */}
                      <div className="d-flex align-items-center mb-3">
                        {post.published_at && (
                          <span className="text-muted small d-flex align-items-center">
                            <i className="bi bi-calendar3 me-1" style={{fontSize: '0.75rem'}}></i>
                            {new Date(post.published_at).toLocaleDateString(
                              isEnglish ? 'en-US' : 'tr-TR',
                              { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              }
                            )}
                          </span>
                        )}
                        <span className="mx-2 text-muted">•</span>
                        <span className="text-muted small d-flex align-items-center">
                          <i className="bi bi-clock me-1" style={{fontSize: '0.75rem'}}></i>
                          {post.read_time ? 
                            (isEnglish ? `${post.read_time} min` : `${post.read_time} dk`) :
                            (isEnglish ? '3 min' : '3 dk')
                          }
                        </span>
                      </div>
                      
                      {/* Title */}
                      <h3 className="h5 fw-bold mb-3 lh-sm">
                        <Link 
                          to={getLocalizedPath(`/blog/${isEnglish ? (post.slug_en || post.slug) : (post.slug_tr || post.slug)}`)}
                          className="text-decoration-none text-dark stretched-link"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden'
                          }}
                        >
                          {isEnglish ? (post.title_en || post.title) : (post.title_tr || post.title)}
                        </Link>
                      </h3>
                      
                      {/* Excerpt */}
                      <p 
                        className="text-muted mb-0 small lh-base"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {formatExcerpt(
                          isEnglish ? (post.excerpt_en || post.excerpt) : (post.excerpt_tr || post.excerpt),
                          140
                        )}
                      </p>
                    </div>
                  </article>
                </div>
              ))
            ) : (
              // Loading Skeleton
              Array.from({ length: 3 }, (_, index) => (
                <div key={`skeleton-${index}`} className="col-lg-4 col-md-6">
                  <div 
                    className="h-100 placeholder-glow"
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      overflow: 'hidden',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
                    }}
                  >
                    <div className="placeholder bg-light" style={{height: '240px'}}></div>
                    <div className="p-4">
                      <div className="d-flex mb-3">
                        <div className="placeholder bg-light me-2" style={{height: '16px', width: '80px'}}></div>
                        <div className="placeholder bg-light" style={{height: '16px', width: '60px'}}></div>
                      </div>
                      <div className="placeholder bg-light mb-3" style={{height: '24px', width: '90%'}}></div>
                      <div className="placeholder bg-light mb-2" style={{height: '16px', width: '100%'}}></div>
                      <div className="placeholder bg-light mb-2" style={{height: '16px', width: '85%'}}></div>
                      <div className="placeholder bg-light" style={{height: '16px', width: '70%'}}></div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* CTA Section */}
          <div className="row">
            <div className="col-12 text-center">
              <Link 
                to={getLocalizedPath('/blog')} 
                className="btn btn-lg px-5 py-3 rounded-pill fw-medium text-white border-0"
                style={{
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  boxShadow: '0 4px 20px rgba(5, 150, 105, 0.3)',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 8px 30px rgba(5, 150, 105, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 20px rgba(5, 150, 105, 0.3)';
                }}
              >
                {isEnglish ? 'Explore All Articles' : 'Tüm Makaleleri Keşfet'}
                <i className="bi bi-arrow-right ms-2"></i>
              </Link>
              <p className="text-muted mt-4 mb-0 small">
                {isEnglish 
                  ? `${blogPosts.length} expert-curated articles` 
                  : `${blogPosts.length} uzman seçimi makale`}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-5 bg-white">
        <div className="container">
          <div className="row">
            <div className="col-lg-10 mx-auto text-center mb-5">
              <div className="d-inline-flex align-items-center bg-white px-4 py-2 rounded-pill shadow-sm mb-4">
                <i className="bi bi-chat-quote text-success me-2"></i>
                <span className="fw-medium text-dark">
                  {isEnglish ? 'Client Testimonials' : 'Danışan Yorumları'}
                </span>
              </div>
              <h2 className="display-4 fw-bold mb-4 text-dark">
                {isEnglish ? 'What Our Clients Say' : 'Danışanlarımız Ne Diyor?'}
              </h2>
              <p className="lead text-muted mx-auto" style={{maxWidth: '600px'}}>
                {isEnglish
                  ? 'Real stories and feedback from people who achieved their goals with us.'
                  : 'Hedeflerine bizimle ulaşan danışanlarımızdan gerçek hikayeler ve geri bildirimler.'}
              </p>
            </div>
          </div>
          <Testimonials testimonials={testimonials} />
        </div>
      </section>

      {/* Nutrition Test Modal */}
      <NutritionTestModal
        show={showNutritionTest}
        onHide={() => setShowNutritionTest(false)}
        isEnglish={isEnglish}
      />
    </>
  );
};

export default Home;