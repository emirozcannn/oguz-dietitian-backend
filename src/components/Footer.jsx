import React from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";
import "bootstrap-icons/font/bootstrap-icons.css";

const Footer = () => {
  const { i18n } = useTranslation();
  const location = useLocation();
  const currentYear = new Date().getFullYear();
  const isEnglish = i18n.language === 'en';
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState(''); // loading, success, error
  const [newsletterMessage, setNewsletterMessage] = useState('');

  // Newsletter aboneliği fonksiyonu (şimdilik devre dışı)
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();

    if (!newsletterEmail.includes("@")) {
      setNewsletterStatus('error');
      setNewsletterMessage(isEnglish ? "Please enter a valid email address" : "Lütfen geçerli bir e-posta adresi girin");
      return;
    }

    setNewsletterStatus('loading');
    setNewsletterMessage('');

    try {
      // Şimdilik simülasyon - daha sonra backend entegrasyonu yapılacak
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setNewsletterStatus('success');
      setNewsletterMessage(isEnglish ? "Thank you for your interest! Coming soon..." : "İlginiz için teşekkürler! Yakında aktif olacak...");
      setNewsletterEmail("");

      // 3 saniye sonra mesajı temizle
      setTimeout(() => {
        setNewsletterStatus('');
        setNewsletterMessage('');
      }, 3000);

    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setNewsletterStatus('error');
      setNewsletterMessage(isEnglish ? "Service temporarily unavailable" : "Servis geçici olarak kullanılamıyor");
    }
  };

  // Dil değiştirici fonksiyonu
 

  const getLocalizedPath = (path) => {
    return isEnglish ? `/en${path}` : path;
  };

  return (
    <>
      {/* Floating WhatsApp Button */}
      <div className="floating-whatsapp">
        <a
          href="https://wa.me/05010138188"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-success rounded-circle shadow-lg position-fixed"
          style={{ bottom: '20px', right: '20px', zIndex: 1000, width: '60px', height: '60px' }}
          title={isEnglish ? "WhatsApp Support" : "WhatsApp Destek"}
        >
          <i className="bi bi-whatsapp fs-3"></i>
        </a>
      </div>

      {/* Newsletter Section - Enhanced CTA */}
      <section className="newsletter-section bg-gradient-success text-white py-5">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-6 col-md-7 mb-4 mb-md-0">
              <div className="newsletter-content">
                <div className="d-flex align-items-center mb-3">
                  <div className="newsletter-icon me-3">
                    <i className="bi bi-envelope-heart fs-1"></i>
                  </div>
                  <div>
                    <h3 className="mb-1 fw-bold">
                      {isEnglish ? 'Transform Your Health Journey' : 'Sağlık Yolculuğunuzu Dönüştürün'}
                    </h3>
                    <p className="mb-0 opacity-90 fs-5">
                      {isEnglish ? 'Join 10,000+ people getting expert nutrition insights weekly' : '10.000+ kişiye katılın, haftalık uzman beslenme ipuçları alın'}
                    </p>
                  </div>
                </div>
                
                {/* Trust Indicators */}
                <div className="d-flex flex-wrap gap-3 mb-3">
                  <div className="trust-item">
                    <i className="bi bi-shield-check me-1"></i>
                    <small>{isEnglish ? 'No Spam' : 'Spam Yok'}</small>
                  </div>
                  <div className="trust-item">
                    <i className="bi bi-gift me-1"></i>
                    <small>{isEnglish ? 'Free Resources' : 'Ücretsiz Kaynaklar'}</small>
                  </div>
                  <div className="trust-item">
                    <i className="bi bi-star-fill me-1"></i>
                    <small>{isEnglish ? 'Expert Tips' : 'Uzman İpuçları'}</small>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-6 col-md-5">
              <div className="newsletter-form">
                <div className="card border-0 shadow-lg bg-white text-dark">
                  <div className="card-body p-4">
                    <h5 className="text-success mb-3 fw-bold">
                      <i className="bi bi-gift me-2"></i>
                      {isEnglish ? 'Get Your FREE Nutrition Guide' : 'ÜCRETSİZ Beslenme Rehberinizi Alın'}
                    </h5>
                    
                    <form className="newsletter-form-inner" onSubmit={handleNewsletterSubmit}>
                      <div className="mb-3">
                        <input 
                          type="email" 
                          className="form-control form-control-lg border-0 bg-light" 
                          placeholder={isEnglish ? 'Enter your email address' : 'E-posta adresinizi girin'}
                          value={newsletterEmail}
                          onChange={(e) => setNewsletterEmail(e.target.value)}
                          required
                        />
                      </div>
                      
                      <button 
                        className="btn btn-success btn-lg w-100 fw-bold shadow-sm newsletter-btn" 
                        type="submit"
                        disabled={newsletterStatus === 'loading'}
                      >
                        {newsletterStatus === 'loading' ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {isEnglish ? 'Subscribing...' : 'Abone oluyor...'}
                          </>
                        ) : (
                          <>
                            <i className="bi bi-download me-2"></i>
                            {isEnglish ? 'Get Free Guide + Weekly Tips' : 'Ücretsiz Rehber + Haftalık İpuçları Al'}
                            <i className="bi bi-arrow-right ms-2"></i>
                          </>
                        )}
                      </button>
                    </form>

                    {/* Status Message */}
                    {newsletterMessage && (
                      <div className={`alert mt-3 ${newsletterStatus === 'success' ? 'alert-success' : 'alert-danger'}`}>
                        <i className={`bi ${newsletterStatus === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                        {newsletterMessage}
                      </div>
                    )}
                    
                    <div className="text-center mt-3">
                      <small className="text-muted">
                        <i className="bi bi-people-fill me-1"></i>
                        {isEnglish ? 'Join 10,000+ subscribers' : '10.000+ aboneye katılın'}
                      </small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Footer - Enhanced */}
      <footer className="main-footer bg-dark text-light py-5">
        <div className="container">
          <div className="row gy-4">
            {/* Brand & About - Enhanced */}
            <div className="col-lg-4 col-md-6">
              <div className="footer-brand">
                <div className="d-flex align-items-center mb-4">
                  <div className="brand-icon me-3">
                    <i className="bi bi-heart-pulse text-success fs-1"></i>
                  </div>
                  <div>
                    <h3 className="text-success mb-1 fw-bold">Oğuz Yolyapan</h3>
                    <p className="text-muted mb-0">{isEnglish ? "Expert Nutritionist & Wellness Coach" : "Uzman Diyetisyen & Wellness Koçu"}</p>
                  </div>
                </div>
                
                <p className="text-light mb-4 lh-lg">
                  {isEnglish
                    ? "Transform your health with personalized nutrition plans backed by science. Join thousands who've achieved lasting results with our proven approach."
                    : "Bilimsel temelli kişisel beslenme planlarıyla sağlığınızı dönüştürün. Kanıtlanmış yaklaşımımızla kalıcı sonuçlar elde eden binlerce kişiye katılın."}
                </p>

                {/* Enhanced Trust Badges */}
                <div className="trust-badges mb-4">
                  <div className="row g-2">
                    <div className="col-sm-6">
                      <div className="trust-badge">
                        <i className="bi bi-shield-check text-success me-2"></i>
                        <span>{isEnglish ? 'Licensed Professional' : 'Lisanslı Uzman'}</span>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="trust-badge">
                        <i className="bi bi-award text-success me-2"></i>
                        <span>{isEnglish ? 'M.Sc. Certified' : 'Y.L. Sertifikalı'}</span>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="trust-badge">
                        <i className="bi bi-people text-success me-2"></i>
                        <span>{isEnglish ? '500+ Success Stories' : '500+ Başarı Hikayesi'}</span>
                      </div>
                    </div>
                    <div className="col-sm-6">
                      <div className="trust-badge">
                        <i className="bi bi-clock text-success me-2"></i>
                        <span>{isEnglish ? '5+ Years Experience' : '5+ Yıl Deneyim'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Social Media */}
                <div className="social-media">
                  <h6 className="text-success mb-3 fw-bold">
                    {isEnglish ? 'Follow My Journey' : 'Yolculuğumu Takip Et'}
                  </h6>
                  <div className="d-flex gap-3">
                    <a href="https://www.instagram.com/diyetisyenoguz/" className="social-link instagram" target="_blank" rel="noopener noreferrer">
                      <i className="bi bi-instagram"></i>
                    </a>
                    <a href="https://tr.linkedin.com/in/oguz-yolyapan-43961622a" className="social-link linkedin" target="_blank" rel="noopener noreferrer">
                      <i className="bi bi-linkedin"></i>
                    </a>
                    
                    
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links - Enhanced */}
            <div className="col-lg-2 col-md-6">
              <div className="footer-section">
                <h6 className="section-title">
                  <i className="bi bi-lightning me-2"></i>
                  {isEnglish ? 'Quick Start' : 'Hızlı Başlangıç'}
                </h6>
                <ul className="footer-links">
                  <li>
                    <Link to={getLocalizedPath(isEnglish ? '/about' : '/hakkimda')} className="footer-link">
                      <i className="bi bi-person me-2"></i>
                      {isEnglish ? 'About Me' : 'Hakkımda'}
                    </Link>
                  </li>
                  <li>
                    <Link to={getLocalizedPath(isEnglish ? '/packages' : '/paketler')} className="footer-link popular">
                      <i className="bi bi-box me-2"></i>
                      {isEnglish ? 'Packages' : 'Paketler'}
                      <span className="badge bg-success ms-2">Popular</span>
                    </Link>
                  </li>
                  <li>
                    <Link to={getLocalizedPath(isEnglish ? '/appointment' : '/randevu')} className="footer-link cta">
                      <i className="bi bi-calendar-check me-2"></i>
                      {isEnglish ? 'Book Consultation' : 'Konsültasyon Al'}
                    </Link>
                  </li>
                  <li>
                    <Link to={getLocalizedPath(isEnglish ? '/calculators' : '/hesaplayicilar')} className="footer-link">
                      <i className="bi bi-calculator me-2"></i>
                      {isEnglish ? 'Health Tools' : 'Sağlık Araçları'}
                    </Link>
                  </li>
                  <li>
                    <Link to={getLocalizedPath(isEnglish ? '/blog' : '/blog')} className="footer-link">
                      <i className="bi bi-journal-text me-2"></i>
                      {isEnglish ? 'Blog' : 'Blog'}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Support - Enhanced */}
            <div className="col-lg-2 col-md-6">
              <div className="footer-section">
                <h6 className="section-title">
                  <i className="bi bi-headset me-2"></i>
                  {isEnglish ? 'Get Help' : 'Yardım Al'}
                </h6>
                <ul className="footer-links">
                  <li>
                    <Link to={getLocalizedPath(isEnglish ? '/faq' : '/sss')} className="footer-link">
                      <i className="bi bi-question-circle me-2"></i>
                      {isEnglish ? 'FAQ' : 'Sık Sorulan Sorular'}
                    </Link>
                  </li>
                  <li>
                    <Link to={getLocalizedPath(isEnglish ? '/contact' : '/iletisim')} className="footer-link">
                      <i className="bi bi-envelope me-2"></i>
                      {isEnglish ? 'Contact Support' : 'Destek İletişim'}
                    </Link>
                  </li>
                  <li>
                    <Link to={getLocalizedPath(isEnglish ? '/client-panel' : '/danisan-paneli')} className="footer-link">
                      <i className="bi bi-person-badge me-2"></i>
                      {isEnglish ? 'Client Portal' : 'Danışan Portalı'}
                    </Link>
                  </li>
                  <li>
                    <a href="https://wa.me/05010138188" className="footer-link whatsapp" target="_blank" rel="noopener noreferrer">
                      <i className="bi bi-whatsapp me-2"></i>
                      {isEnglish ? 'WhatsApp Chat' : 'WhatsApp Sohbet'}
                      <span className="badge bg-success ms-2">Online</span>
                    </a>
                  </li>
                  <li>
                    <a href="mailto:info@oguzyolyapan.com" className="footer-link">
                      <i className="bi bi-envelope-fill me-2"></i>
                      {isEnglish ? 'Email Support' : 'Email Destek'}
                    </a>
                  </li>
                </ul>
              </div>
            </div>

            {/* Legal - Enhanced */}
            <div className="col-lg-2 col-md-6">
              <div className="footer-section">
                <h6 className="section-title">
                  <i className="bi bi-shield-check me-2"></i>
                  {isEnglish ? 'Legal & Privacy' : 'Yasal & Gizlilik'}
                </h6>
                <ul className="footer-links">
                  <li>
                    <Link to={getLocalizedPath(isEnglish ? '/privacy-policy' : '/gizlilik-politikasi')} className="footer-link">
                      <i className="bi bi-file-lock me-2"></i>
                      {isEnglish ? 'Privacy Policy' : 'Gizlilik Politikası'}
                    </Link>
                  </li>
                  <li>
                    <Link to={getLocalizedPath(isEnglish ? '/terms-of-service' : '/kullanim-sartlari')} className="footer-link">
                      <i className="bi bi-file-text me-2"></i>
                      {isEnglish ? 'Terms of Service' : 'Kullanım Şartları'}
                    </Link>
                  </li>
                  <li>
                    <Link to={getLocalizedPath(isEnglish ? '/cookie-policy' : '/cerez-politikasi')} className="footer-link">
                      <i className="bi bi-cookie me-2"></i>
                      {isEnglish ? 'Cookie Policy' : 'Çerez Politikası'}
                    </Link>
                  </li>
                  <li>
                    <Link to={getLocalizedPath(isEnglish ? '/delivery' : '/kargo-teslimat')} className="footer-link">
                      <i className="bi bi-truck me-2"></i>
                      {isEnglish ? 'Delivery & Shipping' : 'Kargo & Teslimat'}
                    </Link>
                  </li>
                  <li>
                    <Link to={getLocalizedPath(isEnglish ? '/refund-policy' : '/iade-politikasi')} className="footer-link">
                      <i className="bi bi-arrow-return-left me-2"></i>
                      {isEnglish ? 'Refund Policy' : 'İade Politikası'}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Contact & CTA - Enhanced */}
            <div className="col-lg-2 col-md-6">
              <div className="footer-section">
                <h6 className="section-title">
                  <i className="bi bi-geo-alt me-2"></i>
                  {isEnglish ? 'Get In Touch' : 'İletişime Geç'}
                </h6>
                
                <div className="contact-info mb-4">
                  <div className="contact-item">
                    <i className="bi bi-geo-alt-fill text-success"></i>
                    <span>Barbaros Mah. Sahilkent Sokak. B Kısım No:20. Süleymanpaşa/Tekirdağ</span>
                  </div>
                  <div className="contact-item">
                    <i className="bi bi-phone-fill text-success"></i>
                    <a href="tel:+90 501 013 8188" className="footer-link">+90 501 013 8188</a>
                  </div>
                  <div className="contact-item">
                    <i className="bi bi-envelope-fill text-success"></i>
                    <a href="mailto:info@oguzyolyapan.com" className="footer-link">info@oguzyolyapan.com</a>
                  </div>
                  <div className="contact-item">
                    <i className="bi bi-clock-fill text-success"></i>
                    <span>{isEnglish ? 'Mon-Fri: 9AM-6PM' : 'Pzt-Cum: 09:00-18:00'}</span>
                  </div>
                </div>

                {/* Emergency CTA */}
                <div className="emergency-cta">
                  <Link 
                    to={getLocalizedPath(isEnglish ? '/appointment' : '/randevu')}
                    className="btn btn-success btn-sm w-100 fw-bold mb-2"
                  >
                    <i className="bi bi-calendar-plus me-1"></i>
                    {isEnglish ? 'Book Now' : 'Hemen Randevu'}
                  </Link>
                  <a 
                    href="https://wa.me/+90 501 013 8188"
                    className="btn btn-outline-success btn-sm w-100"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="bi bi-whatsapp me-1"></i>
                    {isEnglish ? 'Quick Chat' : 'Hızlı Sohbet'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Footer */}
      <div className="bg-black text-light py-3">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start">
              <p className="mb-0 small">
                © {currentYear} <strong>Oğuz Yolyapan</strong> - {isEnglish ? 'All rights reserved' : 'Tüm hakları saklıdır'}
              </p>
            </div>
            <div className="col-md-6 text-center text-md-end">
              <div className="d-flex justify-content-center justify-content-md-end align-items-center gap-3">
                <span className="small text-muted">
                  {isEnglish ? 'Language:' : 'Dil:'}
                </span>
                
                  
                
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Footer;
