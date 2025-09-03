import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import apiClient from '../lib/api.js';

const FAQ = () => {
  const { i18n } = useTranslation();
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFAQ, setFilteredFAQ] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  const isEnglish = i18n.language === 'en';

  // Load FAQ data from Supabase
  useEffect(() => {
    loadFAQData();
  }, []);

  const loadFAQData = async () => {
    try {
      setLoading(true);
      setError(null);

      const faqResponse = await apiClient.getFAQ(i18n.language === 'en' ? 'en' : 'tr');

      if (!faqResponse.success) {
        throw new Error(faqResponse.message || 'FAQ verileri yüklenemedi');
      }

      const faqData = faqResponse.data?.faq || [];
      setFaqData(faqData);
      
      // Extract categories from FAQ data
      const allCategories = faqData.map(category => ({
        _id: category._id,
        name: category.name,
        description: category.description,
        icon: category.icon,
        color: category.color
      }));
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading FAQ data:', error);
      setError(error.message);
      setFaqData([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // Filter FAQ items based on search and category
  useEffect(() => {
    let filtered = faqData;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => {
        // Check both category_id and populated category._id
        return item.category_id === selectedCategory || 
               (item.category && item.category._id === selectedCategory);
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item => {
        const question = isEnglish ? item.question_en : item.question_tr;
        const answer = isEnglish ? item.answer_en : item.answer_tr;
        
        return (
          question.toLowerCase().includes(searchTerm.toLowerCase()) ||
          answer.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    setFilteredFAQ(filtered);
  }, [searchTerm, selectedCategory, faqData, isEnglish]);

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger text-center">
          <h4>{isEnglish ? 'Error Loading FAQ' : 'SSS Yüklenirken Hata'}</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{isEnglish ? 'FAQ - Frequently Asked Questions' : 'SSS - Sık Sorulan Sorular'} - Oğuz Yolyapan</title>
        <meta name="description" content={isEnglish ? 'Find answers to frequently asked questions about nutrition, diet plans, and consultations with professional dietitian Oğuz Yolyapan' : 'Profesyonel diyetisyen Oğuz Yolyapan ile beslenme, diyet planları ve konsültasyonlar hakkında sık sorulan soruların cevaplarını bulun'} />
      </Helmet>

      <div className="container py-5">
        {/* Header Section */}
        <div className="row mb-5">
          <div className="col-lg-8 mx-auto text-center">
            <h1 className="display-4 fw-bold mb-4">
              <i className="bi bi-question-circle text-primary me-3"></i>
              {isEnglish ? 'Frequently Asked Questions' : 'Sık Sorulan Sorular'}
            </h1>
            <p className="lead text-muted mb-4">
              {isEnglish ? 'Find answers to the most common questions about nutrition, diet plans, and my services' : 'Beslenme, diyet planları ve hizmetlerimle ilgili en yaygın soruların cevaplarını bulun'}
            </p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="row mb-5">
          <div className="col-lg-8 mx-auto">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-lg-8">
                    <div className="input-group input-group-lg">
                      <span className="input-group-text">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={isEnglish ? 'Search questions...' : 'Soru ara...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <select
                      className="form-select form-select-lg"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="all">{isEnglish ? 'All Categories' : 'Tüm Kategoriler'}</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {isEnglish ? category.name_en : category.name_tr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Categories Filter */}
        {categories.length > 0 && (
          <div className="row mb-4">
            <div className="col-lg-8 mx-auto">
              <div className="d-flex flex-wrap gap-2 justify-content-center">
                <button
                  className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => setSelectedCategory('all')}
                >
                  <i className="bi bi-list me-1"></i>
                  {isEnglish ? 'All' : 'Tümü'}
                </button>
                {categories.map(category => (
                  <button
                    key={category._id}
                    className={`btn btn-sm ${selectedCategory === category._id ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSelectedCategory(category._id)}
                    style={{ 
                      backgroundColor: selectedCategory === category._id ? category.color : 'transparent',
                      borderColor: category.color,
                      color: selectedCategory === category._id ? 'white' : category.color
                    }}
                  >
                    <i className={`bi ${category.icon} me-1`}></i>
                    {isEnglish ? category.name_en : category.name_tr}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FAQ Results Counter */}
        <div className="row mb-4">
          <div className="col-lg-8 mx-auto">
            <div className="d-flex justify-content-between align-items-center">
              <h3 className="h5 mb-0 text-muted">
                {filteredFAQ.length} {isEnglish ? 'questions found' : 'soru bulundu'}
              </h3>
              {searchTerm && (
                <button 
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  {isEnglish ? 'Clear search' : 'Aramayı temizle'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="row">
          <div className="col-lg-8 mx-auto">
            {filteredFAQ.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-question-circle text-muted" style={{ fontSize: '3rem' }}></i>
                <h4 className="mt-3">
                  {isEnglish ? 'No questions found' : 'Soru bulunamadı'}
                </h4>
                <p className="text-muted">
                  {isEnglish ? 'Try adjusting your search terms or category filter.' : 'Arama terimlerinizi veya kategori filtrenizi ayarlamayı deneyin.'}
                </p>
              </div>
            ) : (
              <div className="accordion" id="faqAccordion">
                {filteredFAQ.map((item, index) => (
                  <div key={item._id} className="accordion-item mb-3 border-0 shadow-sm">
                    <h2 className="accordion-header">
                      <button
                        className="accordion-button collapsed fw-semibold"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse${item._id}`}
                        aria-expanded="false"
                        aria-controls={`collapse${item._id}`}
                        style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}
                      >
                        <div className="d-flex align-items-center w-100">
                          <span className="badge bg-primary rounded-pill me-3">
                            {index + 1}
                          </span>
                          <div className="flex-grow-1">
                            {isEnglish ? item.question_en : item.question_tr}
                          </div>
                          {item.category && (
                            <span 
                              className="badge ms-3"
                              style={{ backgroundColor: item.category.color, color: 'white' }}
                            >
                              <i className={`bi ${item.category.icon} me-1`}></i>
                              {isEnglish ? item.category.name_en : item.category.name_tr}
                            </span>
                          )}
                        </div>
                      </button>
                    </h2>
                    <div
                      id={`collapse${item._id}`}
                      className="accordion-collapse collapse"
                      data-bs-parent="#faqAccordion"
                    >
                      <div className="accordion-body p-4">
                        <p className="mb-0 text-muted lh-lg">
                          {isEnglish ? item.answer_en : item.answer_tr}
                        </p>
                        {item.updated_at && (
                          <small className="text-muted d-block mt-3">
                            <i className="bi bi-clock me-1"></i>
                            {isEnglish ? 'Last updated:' : 'Son güncelleme:'} {new Date(item.updated_at).toLocaleDateString(isEnglish ? 'en-US' : 'tr-TR')}
                          </small>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Contact CTA Section */}
        <div className="row mt-5">
          <div className="col-lg-8 mx-auto">
            <div className="card bg-primary text-white text-center">
              <div className="card-body p-5">
                <h4 className="card-title mb-3">
                  <i className="bi bi-question-circle me-2"></i>
                  {isEnglish ? 'Still have questions?' : 'Hala sorularınız var mı?'}
                </h4>
                <p className="card-text mb-4">
                  {isEnglish ? 
                    'Feel free to reach out! I\'m here to help you on your nutrition journey.' : 
                    'Çekinmeden ulaşın! Beslenme yolculuğunuzda size yardımcı olmak için buradayım.'
                  }
                </p>
                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <a 
                    href="https://wa.me/90 501 013 8188" 
                    className="btn btn-light btn-lg"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className="bi bi-whatsapp me-2"></i>
                    {isEnglish ? 'WhatsApp' : 'WhatsApp'}
                  </a>
                  <a 
                    href={isEnglish ? '/en/contact' : '/iletisim'}
                    className="btn btn-outline-light btn-lg"
                  >
                    <i className="bi bi-envelope me-2"></i>
                    {isEnglish ? 'Contact Form' : 'İletişim Formu'}
                  </a>
                  <a 
                    href={isEnglish ? '/en/appointment' : '/randevu'}
                    className="btn btn-outline-light btn-lg"
                  >
                    <i className="bi bi-calendar-check me-2"></i>
                    {isEnglish ? 'Book Appointment' : 'Randevu Al'}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default FAQ;
