import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const Terms = () => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  return (
    <>
      <Helmet>
        <title>{isEnglish ? 'Terms of Service - Oğuz Yolyapan' : 'Kullanım Şartları - Oğuz Yolyapan'}</title>
        <meta name="description" content={isEnglish ? 
          "Terms of service for Oğuz Yolyapan nutrition and diet services. Read our service conditions and user responsibilities." : 
          "Oğuz Yolyapan beslenme ve diyet hizmetleri kullanım şartları. Hizmet koşullarımızı ve kullanıcı sorumluluklarını okuyun."
        } />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h1 className="display-6 fw-bold text-center mb-4">
              {isEnglish ? 'Terms of Service' : 'Kullanım Şartları'}
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
                      <h2 className="h4 text-success mb-3">1. Acceptance of Terms</h2>
                      <p>By accessing and using our services, you accept and agree to be bound by the terms and provision of this agreement.</p>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">2. Services Description</h2>
                      <p>Oğuz Yolyapan provides professional nutrition and diet consulting services, including:</p>
                      <ul>
                        <li>Personalized nutrition plans</li>
                        <li>Diet consultations and follow-ups</li>
                        <li>Online appointments and coaching</li>
                        <li>Educational content and resources</li>
                        <li>Health calculators and tools</li>
                      </ul>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">3. User Responsibilities</h2>
                      <p>You agree to:</p>
                      <ul>
                        <li>Provide accurate and complete information</li>
                        <li>Maintain the confidentiality of your account</li>
                        <li>Use services only for lawful purposes</li>
                        <li>Not interfere with the proper functioning of the services</li>
                        <li>Respect intellectual property rights</li>
                      </ul>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">4. Payment and Billing</h2>
                      <p>All fees are due in advance unless otherwise stated. We accept major credit cards and bank transfers. Refunds are subject to our refund policy.</p>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">5. Professional Disclaimer</h2>
                      <p>Our services are for informational purposes and should not replace professional medical advice. Always consult with a healthcare provider before making significant dietary changes.</p>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">6. Limitation of Liability</h2>
                      <p>Our liability is limited to the amount paid for the services. We are not liable for any indirect, incidental, or consequential damages.</p>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">7. Termination</h2>
                      <p>We may terminate or suspend your account for violations of these terms. You may cancel your account at any time.</p>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">8. Changes to Terms</h2>
                      <p>We reserve the right to modify these terms at any time. Changes will be posted on this page with an updated effective date.</p>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">9. Contact Information</h2>
                      <p>For questions about these terms, contact us at:</p>
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
                      <h2 className="h4 text-success mb-3">1. Şartların Kabulü</h2>
                      <p>Hizmetlerimize erişerek ve kullanarak, bu sözleşmenin hüküm ve koşullarını kabul etmiş ve bunlara uymayı kabul etmiş olursunuz.</p>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">2. Hizmet Tanımı</h2>
                      <p>Oğuz Yolyapan şunları içeren profesyonel beslenme ve diyet danışmanlığı hizmetleri sağlar:</p>
                      <ul>
                        <li>Kişiselleştirilmiş beslenme planları</li>
                        <li>Diyet danışmanlığı ve takipleri</li>
                        <li>Online randevular ve koçluk</li>
                        <li>Eğitici içerik ve kaynaklar</li>
                        <li>Sağlık hesaplayıcıları ve araçlar</li>
                      </ul>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">3. Kullanıcı Sorumlulukları</h2>
                      <p>Şunları kabul edersiniz:</p>
                      <ul>
                        <li>Doğru ve eksiksiz bilgi sağlamak</li>
                        <li>Hesabınızın gizliliğini korumak</li>
                        <li>Hizmetleri sadece yasal amaçlar için kullanmak</li>
                        <li>Hizmetlerin düzgün çalışmasına müdahale etmemek</li>
                        <li>Fikri mülkiyet haklarına saygı göstermek</li>
                      </ul>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">4. Ödeme ve Faturalandırma</h2>
                      <p>Aksi belirtilmedikçe tüm ücretler peşin ödenir. Büyük kredi kartlarını ve banka transferlerini kabul ediyoruz. İadeler, iade politikamıza tabidir.</p>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">5. Profesyonel Sorumluluk Reddi</h2>
                      <p>Hizmetlerimiz bilgilendirme amaçlıdır ve profesyonel tıbbi tavsiyenin yerini alamaz. Önemli diyet değişiklikleri yapmadan önce her zaman bir sağlık uzmanına danışın.</p>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">6. Sorumluluk Sınırı</h2>
                      <p>Sorumluluğumuz hizmetler için ödenen tutarla sınırlıdır. Dolaylı, arızi veya sonuç olarak ortaya çıkan zararlardan sorumlu değiliz.</p>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">7. Fesih</h2>
                      <p>Bu şartların ihlali durumunda hesabınızı feshedebilir veya askıya alabiliriz. Hesabınızı istediğiniz zaman iptal edebilirsiniz.</p>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">8. Şartlarda Değişiklik</h2>
                      <p>Bu şartları istediğimiz zaman değiştirme hakkını saklı tutuyoruz. Değişiklikler güncellenmiş yürürlük tarihi ile bu sayfada yayınlanacaktır.</p>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">9. İletişim Bilgileri</h2>
                      <p>Bu şartlar hakkında sorularınız için bizimle iletişime geçin:</p>
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



export default Terms;
