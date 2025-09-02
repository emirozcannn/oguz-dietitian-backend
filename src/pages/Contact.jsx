import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import apiClient from '../lib/api';

const Contact = () => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    category_id: ''
  });
  const [categories, setCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState(null);

  const isEnglish = i18n.language === 'en';

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await apiClient.get('/categories?type=public');
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      const response = await apiClient.post('/contact', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
        category_id: formData.category_id || null
      });

      if (!response.success) throw new Error(response.error || 'Message could not be sent');

      setShowSuccess(true);
      setFormData({ 
        name: '', 
        email: '', 
        phone: '', 
        subject: '', 
        message: '', 
        category_id: '' 
      });
      
      // Hide success message after 5 seconds
      setTimeout(() => setShowSuccess(false), 5000);
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: 'bi-geo-alt-fill',
      title: t('contact.info.address'),
      content: isEnglish
        ? 'Barbaros Mah. Sahilkent Sokak. B Block No:20. Süleymanpaşa/Tekirdağ'
        : 'Barbaros Mah. Sahilkent Sokak. B Kısım No:20. Süleymanpaşa/Tekirdağ',
      color: 'primary'
    },
    {
      icon: 'bi-telephone-fill',
      title: t('contact.info.phone'),
      content: '+90 501 013 8188',
      color: 'success'
    },
    {
      icon: 'bi-envelope-fill',
      title: t('contact.info.email'),
      content: 'info@oguzyolyapan.com',
      color: 'info'
    },
    {
      icon: 'bi-clock-fill',
      title: t('contact.info.hours'),
      content: isEnglish ? 'Mon-Fri: 09:00-18:00' : 'Pzt-Cum: 09:00-18:00',
      color: 'warning'
    }
  ];

  return (
    <>
      <Helmet>
        <title>{t('contact.title')} - Oğuz Yolyapan</title>
        <meta name="description" content={t('contact.subtitle')} />
      </Helmet>

      <div className="container py-5">
        {/* Header Section */}
        <div className="row mb-5">
          <div className="col-lg-8 mx-auto text-center">
            <h1 className="display-4 fw-bold mb-4">{t('contact.title')}</h1>
            <p className="lead text-muted mb-4">{t('contact.subtitle')}</p>
          </div>
        </div>

        {/* Contact Info Cards */}
        <div className="row mb-5">
          {contactInfo.map((info, index) => (
            <div key={index} className="col-lg-3 col-md-6 mb-4">
              <div className="card border-0 shadow-sm h-100 text-center">
                <div className="card-body p-4">
                  <div className="mb-3">
                    <i className={`${info.icon} text-${info.color}`} style={{ fontSize: '2.5rem' }}></i>
                  </div>
                  <h5 className="card-title mb-3">{info.title}</h5>
                  <p className="card-text text-muted">{info.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form & Map Section */}
        <div className="row">
          {/* Contact Form */}
          <div className="col-lg-8 mb-5">
            <div className="card border-0 shadow-lg">
              <div className="card-body p-5">
                <h3 className="card-title mb-4">
                  <i className="bi bi-envelope me-2 text-primary"></i>
                  {isEnglish ? 'Send Message' : 'Mesaj Gönder'}
                </h3>
                
                {/* Success Alert */}
                {showSuccess && (
                  <div className="alert alert-success alert-dismissible fade show" role="alert">
                    <i className="bi bi-check-circle me-2"></i>
                    {isEnglish ? 'Your message has been sent successfully!' : 'Mesajınız başarıyla gönderildi!'}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setShowSuccess(false)}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                {/* Error Alert */}
                {error && (
                  <div className="alert alert-danger alert-dismissible fade show" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    {error}
                    <button 
                      type="button" 
                      className="btn-close" 
                      onClick={() => setError(null)}
                      aria-label="Close"
                    ></button>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="name" className="form-label">
                        {t('contact.form.name')} <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder={t('contact.form.name')}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="email" className="form-label">
                        {t('contact.form.email')} <span className="text-danger">*</span>
                      </label>
                      <input
                        type="email"
                        className="form-control form-control-lg"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        placeholder={t('contact.form.email')}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label htmlFor="phone" className="form-label">
                        {t('contact.form.phone')}
                      </label>
                      <input
                        type="tel"
                        className="form-control form-control-lg"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder={t('contact.form.phone')}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label htmlFor="category_id" className="form-label">
                        {isEnglish ? 'Category' : 'Kategori'}
                      </label>
                      <select
                        className="form-select form-select-lg"
                        id="category_id"
                        name="category_id"
                        value={formData.category_id}
                        onChange={handleInputChange}
                      >
                        <option value="">
                          {isEnglish ? 'Select category' : 'Kategori seçin'}
                        </option>
                        {categories.map(category => (
                          <option key={category.id} value={category.id}>
                            {isEnglish ? category.name_en : category.name_tr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="subject" className="form-label">
                      {isEnglish ? 'Subject' : 'Konu'} <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      placeholder={isEnglish ? 'Subject' : 'Konu'}
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="message" className="form-label">
                      {t('contact.form.message')} <span className="text-danger">*</span>
                    </label>
                    <textarea
                      className="form-control form-control-lg"
                      id="message"
                      name="message"
                      rows="5"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      placeholder={t('contact.form.message')}
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-lg px-5"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {isEnglish ? 'Sending...' : 'Gönderiliyor...'}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-send me-2"></i>
                        {t('contact.form.send')}
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Quick Contact & Map Placeholder */}
          <div className="col-lg-4">
            {/* Quick Contact */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4 text-center">
                <h5 className="card-title mb-3">
                  <i className="bi bi-chat-dots me-2 text-success"></i>
                  {isEnglish ? 'Quick Contact' : 'Hızlı İletişim'}
                </h5>
                <p className="text-muted mb-4">
                  {isEnglish ? 'For urgent inquiries, contact us directly:' : 'Acil sorularınız için direkt iletişim:'}
                </p>
                <div className="d-grid gap-2">
                  <a 
                    href="https://wa.me/905010138188" 
                    className="btn btn-success btn-lg"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="bi bi-whatsapp me-2"></i>
                    WhatsApp
                  </a>
                  <a 
                    href="tel:+905010138188" 
                    className="btn btn-outline-primary btn-lg"
                  >
                    <i className="bi bi-telephone me-2"></i>
                    {isEnglish ? 'Call Now' : 'Hemen Ara'}
                  </a>
                </div>
              </div>
            </div>

            {/* Map Placeholder */}
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h5 className="card-title mb-3">
                  <i className="bi bi-geo-alt me-2 text-primary"></i>
                  {isEnglish ? 'Location' : 'Konum'}
                </h5>
                <div className="bg-light rounded p-2 text-center">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d96415.70890718793!2d27.47562947318294!3d40.95977811747507!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x14b4601d4c18e4e5%3A0xc572e1c0c57cb1b!2zVGVraXJkYcSfLCBTw7xsZXltYW5wYcWfYS9UZWtpcmRhxJ8!5e0!3m2!1str!2str!4v1753255698589!5m2!1str!2str"
                    width="100%"
                    height="250"
                    style={{ border: 0, borderRadius: '0.5rem', minHeight: '200px' }}
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Tekirdağ Süleymanpaşa Konum"
                  ></iframe>
                </div>
                <div className="mt-3 text-center">
                  <a 
                    href="https://www.google.com/maps/place/Tekirdağ+Süleymanpaşa" 
                    className="btn btn-outline-primary btn-sm"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="bi bi-map me-2"></i>
                    {isEnglish ? 'View on Google Maps' : 'Google Maps\'te Görüntüle'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Office Hours & Additional Info */}
        <div className="row mt-5">
          <div className="col-lg-8 mx-auto">
            <div className="card border-0 shadow-sm bg-light">
              <div className="card-body p-5 text-center">
                <h4 className="mb-4">
                  <i className="bi bi-info-circle me-2 text-info"></i>
                  {isEnglish ? 'Important Information' : 'Önemli Bilgiler'}
                </h4>
                <div className="row">
                  <div className="col-md-3 mb-3">
                    <i className="bi bi-calendar-check text-success mb-2" style={{ fontSize: '1.5rem' }}></i>
                    <h6>{isEnglish ? 'Appointments' : 'Randevular'}</h6>
                    <p className="text-muted small">
                      {isEnglish ? 'By appointment only' : 'Sadece randevu ile'}
                    </p>
                  </div>
                  <div className="col-md-3 mb-3">
                    <i className="bi bi-shield-check text-primary mb-2" style={{ fontSize: '1.5rem' }}></i>
                    <h6>{isEnglish ? 'Privacy' : 'Gizlilik'}</h6>
                    <p className="text-muted small">
                      {isEnglish ? 'Your data is secure' : 'Verileriniz güvendedir'}
                    </p>
                  </div>
                  <div className="col-md-3 mb-3">
                    <i className="bi bi-clock text-warning mb-2" style={{ fontSize: '1.5rem' }}></i>
                    <h6>{isEnglish ? 'Response Time' : 'Yanıt Süresi'}</h6>
                    <p className="text-muted small">
                      {isEnglish ? 'Within 24 hours' : '24 saat içinde'}
                    </p>
                  </div>
                  <div className="col-md-3 mb-3">
                    <i className="bi bi-credit-card-2-front text-info mb-2" style={{ fontSize: '1.5rem' }}></i>
                    <h6>{isEnglish ? 'Payment Security' : 'Ödeme Güvenliği'}</h6>
                    <p className="text-muted small">
                      {isEnglish
                        ? 'All payments are securely processed via PAYTR infrastructure.'
                        : 'Tüm ödemeler PAYTR altyapısı ile güvenli şekilde alınır.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;
