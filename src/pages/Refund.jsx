import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const Refund = () => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  return (
    <>
      <Helmet>
        <title>{isEnglish ? 'Refund Policy - Oğuz Yolyapan' : 'İade Politikası - Oğuz Yolyapan'}</title>
        <meta name="description" content={isEnglish ? 
          "Refund policy for Oğuz Yolyapan nutrition services. Learn about our refund conditions and process." : 
          "Oğuz Yolyapan beslenme hizmetleri iade politikası. İade koşullarımızı ve sürecimizi öğrenin."
        } />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h1 className="display-6 fw-bold text-center mb-4">
              {isEnglish ? 'Refund Policy' : 'İade Politikası'}
            </h1>
            
            <div className="text-muted text-center mb-5">
              <small>
                {isEnglish ? 'Last Updated: July 16, 2025' : 'Son Güncelleme: 16 Temmuz 2025'}
              </small>
            </div>

            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                {isEnglish ? (
                  <>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">1. Refund Eligibility</h2>
                      <p>We want you to be completely satisfied with our services. Refunds are available under the following conditions:</p>
                      <ul>
                        <li>Request made within 14 days of purchase</li>
                        <li>Service has not been extensively used or completed</li>
                        <li>Valid reason for dissatisfaction is provided</li>
                        <li>No violation of our terms of service</li>
                      </ul>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">2. Services Covered</h2>
                      
                      <div className="mb-3">
                        <h3 className="h5 text-dark mb-2">Consultation Services</h3>
                        <p>Full refund if cancelled at least 24 hours before the appointment. 50% refund if cancelled within 24 hours.</p>
                      </div>

                      <div className="mb-3">
                        <h3 className="h5 text-dark mb-2">Nutrition Plans</h3>
                        <p>Full refund available within 7 days if the plan hasn't been started. Partial refund may be available for unused portions.</p>
                      </div>

                      <div className="mb-3">
                        <h3 className="h5 text-dark mb-2">Online Courses</h3>
                        <p>Full refund available within 14 days if less than 25% of the course has been completed.</p>
                      </div>

                      <div className="mb-3">
                        <h3 className="h5 text-dark mb-2">Subscription Services</h3>
                        <p>Pro-rated refund for unused subscription periods. Monthly subscriptions can be cancelled anytime.</p>
                      </div>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">3. Non-Refundable Items</h2>
                      <p>The following items are not eligible for refunds:</p>
                      <ul>
                        <li>Completed consultation sessions</li>
                        <li>Downloaded digital content</li>
                        <li>Customized nutrition plans that have been delivered</li>
                        <li>Services used for more than 30 days</li>
                        <li>Gift certificates or promotional codes</li>
                      </ul>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">4. Refund Process</h2>
                      <p>To request a refund:</p>
                      <ol>
                        <li>Contact our support team at refunds@oguzyolyapan.com</li>
                        <li>Provide your order number and reason for refund</li>
                        <li>We will review your request within 2-3 business days</li>
                        <li>If approved, refund will be processed within 5-7 business days</li>
                        <li>Refunds are issued to the original payment method</li>
                      </ol>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">5. Partial Refunds</h2>
                      <p>Partial refunds may be granted in the following situations:</p>
                      <ul>
                        <li>Service was partially completed</li>
                        <li>Technical issues prevented full service delivery</li>
                        <li>Mutual agreement between client and provider</li>
                        <li>Extenuating circumstances on a case-by-case basis</li>
                      </ul>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">6. Cancellation Policy</h2>
                      <p>You can cancel your services at any time by contacting us. Cancellation terms vary by service type and will be clearly communicated at the time of purchase.</p>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">7. Contact Information</h2>
                      <p>For refund requests or questions about this policy:</p>
                      <ul className="list-unstyled">
                        <li><strong>Email:</strong> info@oguzyolyapan.com</li>
                        <li><strong>Phone:</strong> 0501 013 8188</li>
                        <li><strong>Address:</strong> Barbaros Mah. Sahilkent Sokak. B Kısım No:20. Süleymanpaşa/Tekirdağ</li>
                      </ul>
                    </section>
                  </>
                ) : (
                  <>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">1. İade Hakkı</h2>
                      <p>Hizmetlerimizden tamamen memnun olmanızı istiyoruz. İadeler aşağıdaki koşullar altında yapılabilir:</p>
                      <ul>
                        <li>Satın alımdan sonra 14 gün içinde talep edilmesi</li>
                        <li>Hizmetin yoğun olarak kullanılmamış veya tamamlanmamış olması</li>
                        <li>Memnuniyetsizlik için geçerli bir sebep sunulması</li>
                        <li>Hizmet şartlarımızın ihlal edilmemesi</li>
                      </ul>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">2. Kapsanan Hizmetler</h2>
                      
                      <div className="mb-3">
                        <h3 className="h5 text-dark mb-2">Danışmanlık Hizmetleri</h3>
                        <p>Randevudan en az 24 saat önce iptal edilirse tam iade. 24 saat içinde iptal edilirse %50 iade.</p>
                      </div>

                      <div className="mb-3">
                        <h3 className="h5 text-dark mb-2">Beslenme Planları</h3>
                        <p>Plan başlatılmamışsa 7 gün içinde tam iade. Kullanılmayan bölümler için kısmi iade mümkün olabilir.</p>
                      </div>

                      <div className="mb-3">
                        <h3 className="h5 text-dark mb-2">Online Kurslar</h3>
                        <p>Kursun %25'inden azı tamamlanmışsa 14 gün içinde tam iade mümkündür.</p>
                      </div>

                      <div className="mb-3">
                        <h3 className="h5 text-dark mb-2">Abonelik Hizmetleri</h3>
                        <p>Kullanılmayan abonelik dönemleri için orantılı iade. Aylık abonelikler her zaman iptal edilebilir.</p>
                      </div>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">3. İade Edilmeyen Hizmetler</h2>
                      <p>Aşağıdaki öğeler iade için uygun değildir:</p>
                      <ul>
                        <li>Tamamlanmış danışmanlık seansları</li>
                        <li>İndirilmiş dijital içerik</li>
                        <li>Teslim edilmiş özel beslenme planları</li>
                        <li>30 günden fazla kullanılmış hizmetler</li>
                        <li>Hediye çekleri veya promosyon kodları</li>
                      </ul>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">4. İade Süreci</h2>
                      <p>İade talebinde bulunmak için:</p>
                      <ol>
                        <li>Destek ekibimizle iletişime geçin: iade@oguzyolyapan.com</li>
                        <li>Sipariş numaranızı ve iade sebebinizi belirtin</li>
                        <li>Talebinizi 2-3 iş günü içinde inceleyeceğiz</li>
                        <li>Onaylanırsa, iade 5-7 iş günü içinde işleme alınır</li>
                        <li>İadeler orijinal ödeme yöntemine yapılır</li>
                      </ol>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">5. Kısmi İadeler</h2>
                      <p>Aşağıdaki durumlarda kısmi iade verilebilir:</p>
                      <ul>
                        <li>Hizmet kısmen tamamlanmış</li>
                        <li>Teknik sorunlar tam hizmet sunumunu engellemiş</li>
                        <li>Müşteri ve sağlayıcı arasında karşılıklı anlaşma</li>
                        <li>Vaka bazında özel durumlar</li>
                      </ul>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">6. İptal Politikası</h2>
                      <p>Hizmetlerinizi istediğiniz zaman bizimle iletişime geçerek iptal edebilirsiniz. İptal koşulları hizmet türüne göre değişir ve satın alma sırasında açıkça belirtilir.</p>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">7. İletişim Bilgileri</h2>
                      <p>İade talepleri veya bu politika hakkında sorular için:</p>
                      <ul className="list-unstyled">
                        <li><strong>E-posta:</strong> info@oguzyolyapan.com</li>
                        <li><strong>Telefon:</strong> 0501 013 8188</li>
                        <li><strong>Adres:</strong> Barbaros Mah. Sahilkent Sokak. B Kısım No:20. Süleymanpaşa/Tekirdağ</li>
                      </ul>
                    </section>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};


export default Refund;
