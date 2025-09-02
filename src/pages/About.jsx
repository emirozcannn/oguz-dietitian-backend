import React from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import '../styles/about.css';
import oguzImage from '../assets/oguzyolyapan.png';


const About = () => {
  const { t, i18n } = useTranslation();

  // Helper for language-based routes if needed in future
  const isEnglish = i18n.language === 'en';

  return (
    <div className="about-page">
      <Helmet>
        <title>{t('aboutPage.seo.title')}</title>
        <meta name="description" content={t('aboutPage.seo.description')} />
      </Helmet>

      {/* Hero Section */}
      <section className="bg-success text-white py-5">
        <div className="container">
          <div className="row align-items-center min-vh-50">
            <div className="col-lg-6">
              <h1 className="display-4 fw-bold mb-4">
                {t('aboutPage.hero.title')}
              </h1>
              <p className="lead mb-4 fs-3">
                {t('aboutPage.hero.subtitle')}
              </p>
              <div className="d-flex flex-wrap gap-2">
                <span className="badge bg-light text-success fs-6 px-3 py-2 rounded-pill">
                  <i className="bi bi-award me-2"></i>
                  {t('aboutPage.hero.badge1')}
                </span>
                <span className="badge bg-light text-success fs-6 px-3 py-2 rounded-pill">
                  <i className="bi bi-mortarboard me-2"></i>
                  {t('aboutPage.hero.badge2')}
                </span>
                <span className="badge bg-light text-success fs-6 px-3 py-2 rounded-pill">
                  <i className="bi bi-person-heart me-2"></i>
                  {t('aboutPage.hero.badge3')}
                </span>
              </div>
            </div>
            <div className="col-lg-6 text-center">
              <div className="position-relative">
                <img 
                  src={oguzImage}
                  alt={t('aboutPage.hero.imageAlt')}
                  className="profile-image img-fluid"
                  style={{ width: '300px', height: '300px', objectFit: 'cover' }}
                />
                <div className="position-absolute bottom-0 end-0 bg-warning text-white rounded-circle d-flex align-items-center justify-content-center" 
                     style={{width: '60px', height: '60px', transform: 'translate(10px, 10px)'}}>
                  <i className="bi bi-award fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="section-spacing">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 mx-auto">
              <div className="card shadow border-0">
                <div className="card-body p-5">
                  <h2 className="h3 fw-bold text-success mb-4">
                    <i className="bi bi-person-circle me-2"></i>
                    {t('aboutPage.intro.title')}
                  </h2>
                  <p className="lead text-muted mb-4">
                    {t('aboutPage.intro.lead')}
                  </p>
                  <div className="row">
                    <div className="col-md-6">
                      <p className="text-muted mb-4">
                        {t('aboutPage.intro.detail1')}
                      </p>
                    </div>
                    <div className="col-md-6">
                      <p className="text-muted mb-0">
                        {t('aboutPage.intro.detail2')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quote Section */}
      <section className="py-5" style={{
        background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
        position: 'relative'
      }}>
        <div className="container">
          <div className="row">
            <div className="col-lg-10 mx-auto">
              <div className="card border-0 shadow-lg">
                <div className="card-body p-5">
                  <div className="row align-items-center">
                    <div className="col-lg-3 text-center mb-4 mb-lg-0">
                      <div className="position-relative">
                        <img 
                          src={oguzImage}
                          alt={t('aboutPage.quote.imageAlt')}
                          className="rounded-circle shadow"
                          style={{width: '150px', height: '150px', objectFit: 'cover'}}
                        />
                        <div className="position-absolute top-0 start-0 text-success" 
                             style={{fontSize: '3rem', transform: 'translate(-15px, -15px)'}}>
                          <i className="bi bi-quote"></i>
                        </div>
                      </div>
                    </div>
                    <div className="col-lg-9">
                      <blockquote className="blockquote mb-0">
                        <p className="fs-3 fw-bold text-dark mb-4 fst-italic">
                          {t('aboutPage.quote.text')}
                        </p>
                        <div className="text-end mt-4">
                          <div className="fw-bold text-success fs-4 mb-1">{t('aboutPage.quote.author')}</div>
                          <div className="text-muted fs-6">{t('aboutPage.quote.role')}</div>
                        </div>
                      </blockquote>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Simple decorative elements - fixed position */}
        <div className="position-absolute top-0 end-0 text-success opacity-15" 
             style={{fontSize: '4rem', right: '2rem', top: '2rem'}}>
          <i className="bi bi-heart"></i>
        </div>
        <div className="position-absolute bottom-0 start-0 text-success opacity-15" 
             style={{fontSize: '3rem', left: '2rem', bottom: '2rem'}}>
          <i className="bi bi-leaf"></i>
        </div>
      </section>

      {/* Experience Section */}
      <section className="section-spacing">
        <div className="container">
          <div className="row mb-5">
            <div className="col-lg-8 mx-auto text-center">
              <h2 className="h3 fw-bold text-success mb-3">
                {t('aboutPage.experience.title')}
              </h2>
              <p className="lead text-muted">
                {t('aboutPage.experience.lead')}
              </p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-lg-4">
              <div className="card h-100 shadow border-0">
                <img 
                   src="https://plus.unsplash.com/premium_photo-1667511010926-549af1b3499d?q=80&w=1169&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  className="card-img-top"
                  alt={t('aboutPage.experience.card1.imageAlt')}
                  style={{height: '200px', objectFit: 'cover'}}
                />
                <div className="card-body">
                  <h5 className="card-title text-success">
                    <i className="bi bi-hospital me-2"></i>
                    {t('aboutPage.experience.card1.title')}
                  </h5>
                  <p className="card-text text-muted">
                    {t('aboutPage.experience.card1.text')}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card h-100 shadow border-0">
                <img 
                  src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  className="card-img-top"
                  alt={t('aboutPage.experience.card2.imageAlt')}
                  style={{height: '200px', objectFit: 'cover'}}
                />
                <div className="card-body">
                  <h5 className="card-title text-success">
                    <i className="bi bi-book me-2"></i>
                    {t('aboutPage.experience.card2.title')}
                  </h5>
                  <p className="card-text text-muted">
                    {t('aboutPage.experience.card2.text')}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="card h-100 shadow border-0">
                <img 
                  src="https://images.unsplash.com/photo-1533042789716-e9a9c97cf4ee?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  className="card-img-top"
                  alt={t('aboutPage.experience.card3.imageAlt')}
                  style={{height: '200px', objectFit: 'cover'}}
                />
                <div className="card-body">
                  <h5 className="card-title text-success">
                    <i className="bi bi-microscope me-2"></i>
                    {t('aboutPage.experience.card3.title')}
                  </h5>
                  <p className="card-text text-muted">
                    {t('aboutPage.experience.card3.text')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section className="bg-light section-spacing">
        <div className="container">
          <div className="row mb-5">
            <div className="col-lg-8 mx-auto text-center">
              <h2 className="h3 fw-bold text-success mb-3">
                {t('aboutPage.education.title')}
              </h2>
              <p className="lead text-muted">
                {t('aboutPage.education.lead')}
              </p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card h-100 shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  className="card-img-top"
                  alt={t('aboutPage.education.card1.imageAlt')}
                  style={{height: '200px', objectFit: 'cover'}}
                />
                <div className="card-body">
                  <h5 className="card-title text-success">
                    <i className="bi bi-mortarboard me-2"></i>
                    {t('aboutPage.education.card1.title')}
                  </h5>
                  <p className="card-text text-muted mb-2">
                    <strong>{t('aboutPage.education.card1.university')}</strong>
                  </p>
                  <p className="card-text text-muted mb-2">
                    <strong>{t('aboutPage.education.card1.fieldLabel')}</strong> {t('aboutPage.education.card1.field')}
                  </p>
                  <p className="card-text text-muted mb-2">
                    <strong>{t('aboutPage.education.card1.yearLabel')}</strong> {t('aboutPage.education.card1.year')}
                  </p>
                  <p className="card-text text-muted">
                    <strong>{t('aboutPage.education.card1.thesisLabel')}</strong> {t('aboutPage.education.card1.thesis')}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card h-100 shadow-sm">
                <img 
                  src="https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=1176&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                  className="card-img-top"
                  alt={t('aboutPage.education.card2.imageAlt')}
                  style={{height: '200px', objectFit: 'cover'}}
                />
                <div className="card-body">
                  <h5 className="card-title text-success">
                    <i className="bi bi-award me-2"></i>
                    {t('aboutPage.education.card2.title')}
                  </h5>
                  <p className="card-text text-muted mb-2">
                    <strong>{t('aboutPage.education.card2.university')}</strong>
                  </p>
                  <p className="card-text text-muted mb-2">
                    <strong>{t('aboutPage.education.card2.fieldLabel')}</strong> {t('aboutPage.education.card2.field')}
                  </p>
                  <p className="card-text text-muted mb-2">
                    <strong>{t('aboutPage.education.card2.yearLabel')}</strong> {t('aboutPage.education.card2.year')}
                  </p>
                  <p className="card-text text-muted">
                    <strong>{t('aboutPage.education.card2.thesisLabel')}</strong> {t('aboutPage.education.card2.thesis')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

        {/* Thesis Section - Enhanced */}
        <section className="section-spacing position-relative" style={{background: 'linear-gradient(135deg, #e9f7ef 0%, #f8f9fa 100%)'}}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <div className="card shadow-lg border-0">
                  <div className="card-body p-5 text-center">
                    <div className="mb-4">
                      <span className="bg-success bg-gradient text-white rounded-circle d-inline-flex align-items-center justify-content-center shadow" style={{width: '70px', height: '70px'}}>
                        <i className="bi bi-file-earmark-text fs-1"></i>
                      </span>
                    </div>
                    <h2 className="h3 fw-bold text-success mb-3">
                      {t('aboutPage.thesis.title')}
                    </h2>
                    <p className="lead text-muted mb-4">
                      {t('aboutPage.thesis.lead')}
                    </p>
                    <div className="border p-4 rounded mb-4 bg-light shadow-sm">
                      <h5 className="fw-bold text-dark mb-3">
                        <i className="bi bi-journal-richtext me-2 text-success"></i>
                        {t('aboutPage.thesis.thesisTitle')}
                      </h5>
                      <p className="text-muted mb-0">
                        {t('aboutPage.thesis.downloadText')}
                      </p>
                    </div>
                    <a href="/thesis/oguz-yolyapan-thesis.pdf" 
                      className="btn btn-gradient-success btn-lg px-5 py-3 fw-bold shadow"
                      style={{background: 'linear-gradient(90deg, #28a745 0%, #218838 100%)', color: '#fff', border: 'none'}}
                      download>
                      <i className="bi bi-download me-2"></i>
                      {t('aboutPage.thesis.downloadBtn')}
                    </a>
                    <div className="mt-4">
                      <span className="badge bg-warning text-dark px-3 py-2 rounded-pill shadow-sm">
                        <i className="bi bi-lightbulb me-2"></i>
                        {t('aboutPage.thesis.highlight')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Decorative icons */}
          <div className="position-absolute top-0 end-0 opacity-10" style={{fontSize: '5rem', right: '2rem', top: '1rem'}}>
            <i className="bi bi-book text-success"></i>
          </div>
          <div className="position-absolute bottom-0 start-0 opacity-10" style={{fontSize: '4rem', left: '2rem', bottom: '1rem'}}>
            <i className="bi bi-award text-success"></i>
          </div>
        </section>

      {/* Vision & Mission Section */}
      <section className="bg-light section-spacing">
        <div className="container">
          <div className="row mb-5">
            <div className="col-lg-8 mx-auto text-center">
              <h2 className="h3 fw-bold text-success mb-3">
                {t('aboutPage.visionMission.title')}
              </h2>
              <p className="lead text-muted">
                {t('aboutPage.visionMission.lead')}
              </p>
            </div>
          </div>
          <div className="row g-4">
            <div className="col-lg-6">
              <div className="card h-100 shadow border-0">
                <div className="card-body p-5 text-center">
                  <div className="mb-4">
                    <img 
                      src="https://images.unsplash.com/photo-1501621667575-af81f1f0bacc?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                      alt={t('aboutPage.visionMission.card1.imageAlt')}
                      className="rounded-circle shadow"
                      style={{width: '120px', height: '120px', objectFit: 'cover'}}
                    />
                  </div>
                  <h5 className="card-title text-success fw-bold mb-3 fs-4">
                    <i className="bi bi-eye me-2"></i>
                    {t('aboutPage.visionMission.card1.title')}
                  </h5>
                  <p className="card-text text-muted">
                    {t('aboutPage.visionMission.card1.text')}
                  </p>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card h-100 shadow border-0">
                <div className="card-body p-5 text-center">
                  <div className="mb-4">
                    <img 
                      src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
                      alt={t('aboutPage.visionMission.card2.imageAlt')}
                      className="rounded-circle shadow"
                      style={{width: '120px', height: '120px', objectFit: 'cover'}}
                    />
                  </div>
                  <h5 className="card-title text-success fw-bold mb-3 fs-4">
                    <i className="bi bi-target me-2"></i>
                    {t('aboutPage.visionMission.card2.title')}
                  </h5>
                  <p className="card-text text-muted">
                    {t('aboutPage.visionMission.card2.text')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Enhanced */}
      
    </div>
  );
};

export default About;
