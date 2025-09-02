import React, { useEffect, useState } from 'react';
import Slider from 'react-slick';
import { useTranslation } from 'react-i18next';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

/**
 * Testimonials component
 * Bootstrap 5 grid/kart ve react-slick ile responsive carousel.
 * Sadece parent'tan gelen testimonials prop'unu kullanır.
 */
const Testimonials = ({ testimonials: propTestimonials = [] }) => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  // Prop değişirse state'i güncelle
  const [testimonials, setTestimonials] = useState(propTestimonials);

  useEffect(() => {
    setTestimonials(propTestimonials);
  }, [propTestimonials]);

  if (!testimonials || testimonials.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-chat-quote display-4 text-muted mb-3"></i>
        <p className="lead text-muted mb-0">
          {isEnglish ? 'No testimonials yet.' : 'Henüz danışan yorumu yok.'}
        </p>
      </div>
    );
  }

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    swipe: true,
    draggable: true,
    adaptiveHeight: true,
  };

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <Slider {...settings}>
          {testimonials.map((t) => (
            <div key={t.id}>
              <div className="card shadow-sm border-0 my-4">
                <div className="card-body text-center px-4 py-5">
                  <i className="bi bi-quote display-4 text-success mb-3"></i>
                  <blockquote className="blockquote mb-4">
                    <p className="mb-0 fs-5">
                      {isEnglish ? t.content_en : t.content_tr}
                    </p>
                  </blockquote>
                  <figcaption className="blockquote-footer mb-0">
                    <span className="fw-semibold">{t.name}</span>
                    {t.title && <> <span className="text-muted">|</span> <span>{t.title}</span></>}
                    {t.city && <> <span className="text-muted">|</span> <span>{t.city}</span></>}
                  </figcaption>
                  <div className="mt-3">
                    {[...Array(5)].map((_, i) => (
                      <i
                        key={i}
                        className={`bi bi-star${i < t.rating ? '-fill text-warning' : ' text-secondary'}`}
                        style={{ fontSize: '1.1rem', marginRight: 2 }}
                        aria-label={i < t.rating ? 'Yıldızlı' : 'Boş yıldız'}
                      />
                    ))}
                  </div>
                  {t.program_type && (
                    <div className="mt-2">
                      <span className="badge bg-info text-dark">
                        {isEnglish
                          ? t.program_type === 'Kilo Verme Programı'
                            ? 'Weight Loss'
                            : t.program_type === 'Sporcu Beslenmesi'
                            ? 'Sports Nutrition'
                            : t.program_type === 'Hamilelik Beslenmesi'
                            ? 'Pregnancy Nutrition'
                            : t.program_type === 'Hastalıklarda Beslenme'
                            ? 'Medical Nutrition'
                            : t.program_type
                          : t.program_type}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default Testimonials;