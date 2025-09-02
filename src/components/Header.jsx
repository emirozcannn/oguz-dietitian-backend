import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import * as AuthContext from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const Header = () => {
  const { t, i18n } = useTranslation();
  const { user, signOut } = AuthContext.useAuth();
  const { cartCount } = useCart();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isEnglish = i18n.language === 'en';

  const getLocalizedPath = (path) => {
    return isEnglish ? `/en${path}` : path;
  };

  // Admin kontrolü
  const isAdmin = user && (
    user.user_metadata?.role === 'admin' || 
    user.email === 'admin@oguzyolyapan.com' ||
    user.email === 'admin@oguz.com'
  );

  // Kullanıcının doğru paneline yönlendirme
  const getUserPanelPath = () => {
    if (isAdmin) {
      return getLocalizedPath(isEnglish ? '/admin-panel' : '/admin');
    } else {
      return getLocalizedPath(isEnglish ? '/client-panel' : '/danisan-paneli');
    }
  };

  const getUserPanelText = () => {
    if (isAdmin) {
      return isEnglish ? 'Admin Panel' : 'Yönetici Paneli';
    } else {
      return isEnglish ? 'My Panel' : 'Panelim';
    }
  };

  const toggleLanguage = () => {
    const newLang = isEnglish ? 'tr' : 'en';

    const pathMap = {
      '/': '/',
      '/en': '/',
      '/en/about': '/hakkimda',
      '/hakkimda': '/about',
      '/en/blog': '/blog',
      '/blog': '/blog',
      '/en/packages': '/paketler',
      '/paketler': '/packages',
      '/en/faq': '/sss',
      '/sss': '/faq',
      '/en/contact': '/iletisim',
      '/iletisim': '/contact',
      '/en/appointment': '/randevu',
      '/randevu': '/appointment',
      '/en/calculators': '/hesaplayicilar',
      '/hesaplayicilar': '/calculators',
      '/en/login': '/giris',
      '/giris': '/login',
      '/en/signup': '/kayit',
      '/kayit': '/signup',
      '/en/reset-password': '/sifre-sifirla',
      '/sifre-sifirla': '/reset-password',
      '/en/client-panel': '/danisan-paneli',
      '/danisan-paneli': '/client-panel',
      '/en/admin-panel': '/yonetici-paneli',
      '/yonetici-paneli': '/admin-panel',
      '/en/cart': '/sepet',
      '/sepet': '/cart',
      '/en/checkout': '/odeme',
      '/odeme': '/checkout',
      '/en/order-success': '/siparis-basarili',
      '/siparis-basarili': '/order-success',
      '/en/privacy-policy': '/gizlilik-politikasi',
      '/gizlilik-politikasi': '/privacy-policy',
      '/en/terms-of-service': '/kullanim-sartlari',
      '/kullanim-sartlari': '/terms-of-service',
      '/en/cookie-policy': '/cerez-politikasi',
      '/cerez-politikasi': '/cookie-policy',
      '/en/refund-policy': '/iade-politikasi',
      '/iade-politikasi': '/refund-policy'
    };

    const currentPath = location.pathname;
    let newPath = pathMap[currentPath];

    if (!newPath) {
      // If no mapping found, handle it manually
      if (newLang === 'en' && !currentPath.startsWith('/en')) {
        newPath = '/en' + currentPath;
      } else if (newLang === 'tr' && currentPath.startsWith('/en')) {
        newPath = currentPath.replace('/en', '') || '/';
      } else {
        newPath = currentPath;
      }
    }

    // Ensure proper path structure
    if (newLang === 'en' && !newPath.startsWith('/en')) {
      newPath = '/en' + newPath;
    } else if (newLang === 'tr' && newPath.startsWith('/en')) {
      newPath = newPath.replace('/en', '') || '/';
    }

    i18n.changeLanguage(newLang);
    navigate(newPath);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Redirect to home page after logout
      navigate(getLocalizedPath('/'));
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <Helmet>
        <html lang={isEnglish ? 'en' : 'tr'} />
        <meta name="description" content={isEnglish ? 
          "Expert Dietitian Oğuz Yolyapan - Master's in Nutrition and Dietetics. Personalized nutrition plans and professional consulting services." : 
          "Uzman Diyetisyen Oğuz Yolyapan - Beslenme ve Diyet Yüksek Lisans. Kişiselleştirilmiş beslenme planları ve profesyonel danışmanlık hizmetleri."
        } />
        <meta name="keywords" content={isEnglish ? 
          "dietitian, nutrition, diet, health, weight loss, nutrition counseling, Oğuz Yolyapan" : 
          "diyetisyen, beslenme, diyet, sağlık, kilo verme, beslenme danışmanlığı, Oğuz Yolyapan"
        } />
        <title>{isEnglish ? 
          "Expert Dietitian Oğuz Yolyapan | Nutrition & Diet Counseling" : 
          "Uzman Diyetisyen Oğuz Yolyapan | Beslenme ve Diyet Danışmanlığı"
        }</title>
      </Helmet>

      <header className="sticky-top">
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm border-bottom">
          <div className="container">
            {/* Brand */}
            <Link className="navbar-brand fw-bold text-success d-flex align-items-center" to={getLocalizedPath('/')}>
              <i className="bi bi-heart-pulse me-2 fs-4"></i>
              <div className="d-flex flex-column">
                <span className="fs-5 lh-1">Oğuz Yolyapan</span>
                <small className="text-muted fw-normal">{isEnglish ? 'Nutritionist' : 'Diyetisyen'}</small>
              </div>
            </Link>

            {/* Mobile Actions */}
            <div className="d-flex align-items-center d-lg-none">
              <button
                className="btn btn-sm me-2 border-0 bg-light"
                onClick={toggleLanguage}
                title={isEnglish ? 'Türkçe' : 'English'}
              >
                {isEnglish ? '🇹🇷' : '🇬🇧'}
              </button>
              
              <button
                className="navbar-toggler border-0 p-1"
                type="button"
                onClick={() => setIsNavOpen(!isNavOpen)}
                aria-expanded={isNavOpen}
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>
            </div>

            {/* Main Navigation */}
            <div className={`collapse navbar-collapse ${isNavOpen ? 'show' : ''}`}>
              {/* Navigation Links */}
              <ul className="navbar-nav mx-auto">
                <li className="nav-item">
                  <Link className="nav-link px-3 py-2 text-dark" to={getLocalizedPath('/')}>
                    {t('nav.home')}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link px-3 py-2 text-dark" to={getLocalizedPath(isEnglish ? '/about' : '/hakkimda')}>
                    {t('nav.about')}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link px-3 py-2 text-dark" to={getLocalizedPath(isEnglish ? '/packages' : '/paketler')}>
                    {t('nav.packages')}
                  </Link>
                </li>
                {/* BLOG NAV ITEM - NEW */}
                <li className="nav-item">
                  <Link className="nav-link px-3 py-2 text-dark" to={getLocalizedPath('/blog')}>
                   
                    {t('nav.blog', 'Blog')}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link px-3 py-2 text-dark" to={getLocalizedPath(isEnglish ? '/faq' : '/sss')}>
                    {t('nav.faq')}
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link px-3 py-2 text-dark" to={getLocalizedPath(isEnglish ? '/contact' : '/iletisim')}>
                    {t('nav.contact')}
                  </Link>
                </li>
              </ul>

              {/* Desktop Actions */}
              <div className="d-none d-lg-flex align-items-center">
                {/* Language Toggle */}
                <div className="me-3">
                  <button
                    className="btn btn-sm border-0 bg-light px-3"
                    onClick={toggleLanguage}
                    title={isEnglish ? 'Türkçe' : 'English'}
                  >
                    {isEnglish ? '🇹🇷 TR' : '🇬🇧 EN'}
                  </button>
                </div>

                {/* Cart Icon */}
                <Link
                  to={getLocalizedPath(isEnglish ? '/cart' : '/sepet')}
                  className="btn btn-outline-secondary position-relative me-3"
                  title={t('nav.cart')}
                >
                  <i className="bi bi-cart3"></i>
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-success">
                    {cartCount}
                    <span className="visually-hidden">items in cart</span>
                  </span>
                </Link>
                
                {/* Primary Action - Online Appointment */}
                <Link
                  to={getLocalizedPath(isEnglish ? '/appointment' : '/randevu')}
                  className="btn btn-success px-4 py-2 me-2"
                >
                  <i className="bi bi-calendar-check me-2"></i>
                  {isEnglish ? 'Online Appointment' : 'Online Randevu'}
                </Link>
                
                {/* Auth Actions */}
                {user ? (
                  // Logged in user menu
                  <div className="dropdown">
                    <button
                      className="btn btn-outline-secondary dropdown-toggle px-3 py-2"
                      type="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      <i className="bi bi-person-circle me-1"></i>
                      {user.user_metadata?.first_name || user.email}
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                      <li>
                        <Link
                          className="dropdown-item"
                          to={getUserPanelPath()}
                        >
                          <i className="bi bi-person me-2"></i>
                          {getUserPanelText()}
                        </Link>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item" onClick={handleLogout}>
                          <i className="bi bi-box-arrow-right me-2"></i>
                          {isEnglish ? 'Logout' : 'Çıkış'}
                        </button>
                      </li>
                    </ul>
                  </div>
                ) : (
                  // Not logged in - show login/register buttons
                  <div className="btn-group" role="group">
                    <Link
                      to={getLocalizedPath(isEnglish ? '/login' : '/giris')}
                      className="btn btn-outline-secondary px-3 py-2"
                    >
                      <i className="bi bi-person me-1"></i>
                      {t('nav.login')}
                    </Link>

                    <Link
                      to={getLocalizedPath(isEnglish ? '/signup' : '/kayit')}
                      className="btn btn-outline-success px-3 py-2"
                    >
                      <i className="bi bi-person-plus me-1"></i>
                      {t('nav.register')}
                    </Link>
                  </div>
                )}
              </div>

              {/* Mobile Actions */}
              <div className="d-lg-none mt-3 pt-3 border-top">
                <div className="d-grid gap-2">
                  <Link
                    to={getLocalizedPath(isEnglish ? '/appointment' : '/randevu')}
                    className="btn btn-success"
                  >
                    <i className="bi bi-calendar-check me-2"></i>
                    {isEnglish ? 'Online Appointment' : 'Online Randevu'}
                  </Link>
                  
                  <Link
                    to={getLocalizedPath(isEnglish ? '/cart' : '/sepet')}
                    className="btn btn-outline-secondary"
                  >
                    <i className="bi bi-cart3 me-2"></i>
                    {t('nav.cart')} <span className="badge bg-success">{cartCount}</span>
                  </Link>
                  
                  {user ? (
                    // Logged in user actions
                    <div className="row g-2">
                      <div className="col-6">
                        <Link
                          to={getUserPanelPath()}
                          className="btn btn-outline-primary w-100"
                        >
                          <i className="bi bi-person-circle me-1"></i>
                          {isAdmin ? (isEnglish ? 'Admin' : 'Yönetici') : (isEnglish ? 'Panel' : 'Panel')}
                        </Link>
                      </div>
                      <div className="col-6">
                        <button
                          onClick={handleLogout}
                          className="btn btn-outline-secondary w-100"
                        >
                          <i className="bi bi-box-arrow-right me-1"></i>
                          {isEnglish ? 'Logout' : 'Çıkış'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Not logged in - show login/register buttons
                    <div className="row g-2">
                      <div className="col-6">
                        <Link
                          to={getLocalizedPath(isEnglish ? '/login' : '/giris')}
                          className="btn btn-outline-secondary w-100"
                        >
                          <i className="bi bi-person me-1"></i>
                          {t('nav.login')}
                        </Link>
                      </div>
                      <div className="col-6">
                        <Link
                          to={getLocalizedPath(isEnglish ? '/signup' : '/kayit')}
                          className="btn btn-outline-success w-100"
                        >
                          <i className="bi bi-person-plus me-1"></i>
                          {t('nav.register')}
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};

export default Header;
