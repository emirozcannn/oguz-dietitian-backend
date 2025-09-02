import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';


const Privacy = () => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  return (
    <>
      <Helmet>
        <title>{isEnglish ? 'Privacy Policy - Oğuz Yolyapan' : 'Gizlilik ve KVKK Politikası - Oğuz Yolyapan'}</title>
        <meta name="description" content={isEnglish ?
          "Comprehensive privacy and KVKK policy for Oğuz Yolyapan nutrition and diet services. Learn how we protect, process, and secure your personal data." :
          "Oğuz Yolyapan beslenme ve diyet hizmetleri için kapsamlı gizlilik ve KVKK politikası. Kişisel verilerinizi nasıl koruduğumuzu, işlediğimizi ve güvence altına aldığımızı öğrenin."
        } />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h1 className="display-6 fw-bold text-center mb-4">
              {isEnglish ? 'Privacy & KVKK Policy' : 'Gizlilik ve KVKK Politikası'}
            </h1>
            <div className="text-muted text-center mb-5">
              <small>
                {isEnglish ? 'Last Updated: July 19, 2025' : 'Son Güncelleme: 19 Temmuz 2025'}
              </small>
            </div>
            <div className="card shadow-sm border-0">
              <div className="card-body p-4">
                {isEnglish ? (
                  <>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">1. Legal Basis & Scope</h2>
                      <p>This policy is prepared in accordance with the Turkish Personal Data Protection Law (KVKK) and relevant international privacy regulations. It applies to all users of Oğuz Yolyapan nutrition and diet services.</p>
                    </section>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">2. Information We Collect</h2>
                      <ul>
                        <li>Identity and contact information (name, email, phone, address)</li>
                        <li>Health and nutrition data you provide</li>
                        <li>Appointment, order, and payment details</li>
                        <li>Website usage and technical data (IP, browser, cookies)</li>
                      </ul>
                    </section>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">3. Purpose of Data Processing</h2>
                      <ul>
                        <li>To provide personalized nutrition and diet services</li>
                        <li>To fulfill legal obligations and contractual requirements</li>
                        <li>To process payments and manage appointments</li>
                        <li>To send notifications, newsletters, and updates</li>
                        <li>To improve service quality and website experience</li>
                      </ul>
                    </section>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">4. Data Sharing & Third Parties</h2>
                      <p>Your data may be shared with payment providers, hosting services, and legal authorities only when required by law or for service delivery. No data is sold or transferred for marketing purposes without your explicit consent.</p>
                    </section>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">5. Cookies & Tracking</h2>
                      <p>We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content. You can manage cookie preferences via your browser settings.</p>
                    </section>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">6. Data Security</h2>
                      <p>We implement technical and organizational measures to protect your personal data against unauthorized access, alteration, or loss. All payment transactions are processed securely.</p>
                    </section>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">7. Your Rights</h2>
                      <ul>
                        <li>Right to access and request information about your data</li>
                        <li>Right to correct or update inaccurate data</li>
                        <li>Right to request deletion or restriction of processing</li>
                        <li>Right to object to data processing</li>
                        <li>Right to data portability</li>
                        <li>Right to withdraw consent at any time</li>
                      </ul>
                    </section>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">8. How to Exercise Your Rights</h2>
                      <p>You can submit requests regarding your personal data by contacting us via email, phone, or postal address below. We will respond within 30 days as required by law.</p>
                    </section>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">9. Contact Information</h2>
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
                      <h2 className="h4 text-success mb-3">1. Yasal Dayanak ve Kapsam</h2>
                      <p>Bu politika, 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili uluslararası gizlilik düzenlemelerine uygun olarak hazırlanmıştır. Oğuz Yolyapan beslenme ve diyet hizmetlerinin tüm kullanıcılarını kapsar.</p>
                    </section>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">2. Toplanan Bilgiler</h2>
                      <ul>
                        <li>Kimlik ve iletişim bilgileri (ad, e-posta, telefon, adres)</li>
                        <li>Sağlık ve beslenme verileri</li>
                        <li>Randevu, sipariş ve ödeme bilgileri</li>
                        <li>Web sitesi kullanım ve teknik verileri (IP, tarayıcı, çerezler)</li>
                      </ul>
                    </section>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">3. Veri İşleme Amaçları</h2>
                      <ul>
                        <li>Kişiye özel beslenme ve diyet hizmeti sunmak</li>
                        <li>Yasal yükümlülükleri ve sözleşmesel gereklilikleri yerine getirmek</li>
                        <li>Ödeme işlemlerini ve randevu yönetimini sağlamak</li>
                        <li>Bildirim, bülten ve güncellemeleri göndermek</li>
                        <li>Hizmet kalitesini ve web sitesi deneyimini geliştirmek</li>
                      </ul>
                    </section>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">4. Veri Paylaşımı ve Üçüncü Taraflar</h2>
                      <p>Verileriniz, yalnızca yasal zorunluluklar veya hizmet sunumu için ödeme sağlayıcıları, barındırma hizmetleri ve resmi makamlarla paylaşılabilir. Açık rızanız olmadan pazarlama amacıyla veri aktarımı yapılmaz.</p>
                    </section>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">5. Çerezler ve Takip Teknolojileri</h2>
                      <p>Deneyiminizi geliştirmek, kullanım analizi yapmak ve kişiselleştirilmiş içerik sunmak için çerezler ve benzeri teknolojiler kullanılır. Çerez tercihlerinizi tarayıcı ayarlarından yönetebilirsiniz.</p>
                    </section>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">6. Veri Güvenliği</h2>
                      <p>Kişisel verilerinizin yetkisiz erişim, değiştirme veya kayba karşı korunması için teknik ve idari tedbirler uygulanır. Tüm ödeme işlemleri güvenli şekilde gerçekleştirilir.</p>
                    </section>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">7. Haklarınız</h2>
                      <ul>
                        <li>Verilerinize erişim ve bilgi talep etme hakkı</li>
                        <li>Yanlış veya eksik verilerin düzeltilmesini isteme hakkı</li>
                        <li>Verilerinizin silinmesini veya işlenmesinin kısıtlanmasını talep etme hakkı</li>
                        <li>Veri işlenmesine itiraz etme hakkı</li>
                        <li>Veri taşınabilirliği hakkı</li>
                        <li>Her zaman açık rızanızı geri çekme hakkı</li>
                      </ul>
                    </section>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">8. Haklarınızı Nasıl Kullanabilirsiniz?</h2>
                      <p>Kişisel verilerinizle ilgili taleplerinizi aşağıdaki e-posta, telefon veya posta adresi üzerinden iletebilirsiniz. Yasal süre içinde (30 gün) yanıt verilecektir.</p>
                    </section>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">9. İletişim Bilgileri</h2>
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



export default Privacy;
