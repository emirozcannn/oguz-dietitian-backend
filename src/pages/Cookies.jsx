import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const Cookies = () => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  return (
    <>
      <Helmet>
        <title>{isEnglish ? 'Cookie Policy - Oğuz Yolyapan' : 'Çerez Politikası - Oğuz Yolyapan'}</title>
        <meta name="description" content={isEnglish ? 
          "Cookie policy for Oğuz Yolyapan website. Learn about how we use cookies and similar technologies." : 
          "Oğuz Yolyapan web sitesi çerez politikası. Çerezleri ve benzer teknolojileri nasıl kullandığımızı öğrenin."
        } />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h1 className="display-6 fw-bold text-center mb-4">
              {isEnglish ? 'Cookie Policy' : 'Çerez Politikası'}
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
                      <h2 className="h4 text-success mb-3">What Are Cookies?</h2>
                      <p>Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better browsing experience by remembering your preferences and improving our services.</p>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">Types of Cookies We Use</h2>
                      
                      <div className="mb-3">
                        <h3 className="h5 text-dark mb-2">Essential Cookies</h3>
                        <p>These cookies are necessary for the website to function properly. They enable basic features like page navigation and access to secure areas.</p>
                      </div>

                      <div className="mb-3">
                        <h3 className="h5 text-dark mb-2">Performance Cookies</h3>
                        <p>These cookies collect information about how you use our website, such as which pages you visit most often. This data helps us improve our website's performance.</p>
                      </div>

                      <div className="mb-3">
                        <h3 className="h5 text-dark mb-2">Functionality Cookies</h3>
                        <p>These cookies remember your preferences and choices to provide you with a more personalized experience, such as your language preference.</p>
                      </div>

                      <div className="mb-3">
                        <h3 className="h5 text-dark mb-2">Analytics Cookies</h3>
                        <p>We use Google Analytics to understand how visitors interact with our website. These cookies help us analyze website traffic and improve our services.</p>
                      </div>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">Third-Party Cookies</h2>
                      <p>We may use third-party services that set cookies on your device:</p>
                      <ul>
                        <li><strong>Google Analytics:</strong> For website analytics and performance tracking</li>
                        <li><strong>Social Media Plugins:</strong> For social media integration</li>
                        <li><strong>Payment Processors:</strong> For secure payment processing</li>
                      </ul>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">Managing Cookies</h2>
                      <p>You can control and manage cookies in several ways:</p>
                      <ul>
                        <li>Most browsers allow you to block or delete cookies</li>
                        <li>You can adjust your browser settings to refuse cookies</li>
                        <li>You can opt out of Google Analytics tracking</li>
                        <li>Some features may not work properly if you disable cookies</li>
                      </ul>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">Your Consent</h2>
                      <p>By using our website, you consent to our use of cookies as described in this policy. You can withdraw your consent at any time by adjusting your browser settings.</p>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">Contact Us</h2>
                      <p>If you have any questions about our cookie policy, please contact us at:</p>
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
                      <h2 className="h4 text-success mb-3">Çerez Nedir?</h2>
                      <p>Çerezler, web sitemizi ziyaret ettiğinizde cihazınıza yerleştirilen küçük metin dosyalarıdır. Tercihlerinizi hatırlayarak ve hizmetlerimizi geliştirerek size daha iyi bir tarama deneyimi sunmamıza yardımcı olurlar.</p>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">Kullandığımız Çerez Türleri</h2>
                      
                      <div className="mb-3">
                        <h3 className="h5 text-dark mb-2">Gerekli Çerezler</h3>
                        <p>Bu çerezler web sitesinin düzgün çalışması için gereklidir. Sayfa navigasyonu ve güvenli alanlara erişim gibi temel özellikleri sağlarlar.</p>
                      </div>

                      <div className="mb-3">
                        <h3 className="h5 text-dark mb-2">Performans Çerezleri</h3>
                        <p>Bu çerezler, hangi sayfaları en sık ziyaret ettiğiniz gibi web sitemizi nasıl kullandığınız hakkında bilgi toplar. Bu veriler web sitemizin performansını geliştirmemize yardımcı olur.</p>
                      </div>

                      <div className="mb-3">
                        <h3 className="h5 text-dark mb-2">İşlevsellik Çerezleri</h3>
                        <p>Bu çerezler, dil tercihiniz gibi tercihlerinizi ve seçimlerinizi hatırlayarak size daha kişiselleştirilmiş bir deneyim sunar.</p>
                      </div>

                      <div className="mb-3">
                        <h3 className="h5 text-dark mb-2">Analitik Çerezler</h3>
                        <p>Ziyaretçilerin web sitemizle nasıl etkileşime girdiğini anlamak için Google Analytics kullanıyoruz. Bu çerezler web sitesi trafiğini analiz etmemize ve hizmetlerimizi geliştirmemize yardımcı olur.</p>
                      </div>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">Üçüncü Taraf Çerezleri</h2>
                      <p>Cihazınızda çerez yerleştiren üçüncü taraf hizmetleri kullanabiliriz:</p>
                      <ul>
                        <li><strong>Google Analytics:</strong> Web sitesi analitikleri ve performans takibi için</li>
                        <li><strong>Sosyal Medya Eklentileri:</strong> Sosyal medya entegrasyonu için</li>
                        <li><strong>Ödeme İşlemcileri:</strong> Güvenli ödeme işleme için</li>
                      </ul>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">Çerezleri Yönetme</h2>
                      <p>Çerezleri çeşitli şekillerde kontrol edebilir ve yönetebilirsiniz:</p>
                      <ul>
                        <li>Çoğu tarayıcı çerezleri engellemenize veya silmenize izin verir</li>
                        <li>Tarayıcı ayarlarınızı çerezleri reddetmek için ayarlayabilirsiniz</li>
                        <li>Google Analytics takibinden çıkabilirsiniz</li>
                        <li>Çerezleri devre dışı bırakırsanız bazı özellikler düzgün çalışmayabilir</li>
                      </ul>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">Onayınız</h2>
                      <p>Web sitemizi kullanarak, bu politikada açıklandığı gibi çerez kullanımımızı onaylamış olursunuz. Tarayıcı ayarlarınızı değiştirerek istediğiniz zaman onayınızı geri çekebilirsiniz.</p>
                    </section>

                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">Bize Ulaşın</h2>
                      <p>Çerez politikamız hakkında sorularınız varsa, lütfen bizimle iletişime geçin:</p>
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

export default Cookies;
