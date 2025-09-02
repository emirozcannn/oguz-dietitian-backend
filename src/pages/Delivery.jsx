import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

const Delivery = () => {
const { i18n } = useTranslation();
  const lang = i18n.language || 'tr';
  const isEnglish = lang.startsWith('en');

  return (
    <>
      <Helmet>
        <title>{isEnglish ? 'Delivery & Shipping Information - Oğuz Yolyapan' : 'Kargo ve Teslimat Bilgileri - Oğuz Yolyapan'}</title>
        <meta name="description" content={isEnglish ?
          'Information about delivery, shipping, and digital product access for Oğuz Yolyapan nutrition and diet services.' :
          'Oğuz Yolyapan beslenme ve diyet hizmetleri için kargo, teslimat ve dijital ürün erişimi hakkında bilgiler.'
        } />
        <meta name="robots" content="index, follow" />
      </Helmet>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <h1 className="display-6 fw-bold text-center mb-4">
              {isEnglish ? 'Delivery & Shipping Information' : 'Kargo ve Teslimat Bilgileri'}
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
                      <h2 className="h4 text-success mb-3">1. Digital Product Delivery</h2>
                      <p>All nutrition and diet services are delivered digitally. After your purchase, you will receive access details via email and/or your client panel. No physical shipment is required for digital products.</p>
                    </section>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">2. Physical Product Shipping</h2>
                      <p>Physical products (if offered) are shipped via contracted cargo companies to the address you provide. Shipping is currently not available, but may be activated in the future.</p>
                      <ul>
                        <li><strong>Shipping Fee:</strong> Displayed at checkout before payment.</li>
                        <li><strong>Delivery Time:</strong> Usually 2-5 business days after payment confirmation.</li>
                        <li><strong>Tracking:</strong> You will receive a tracking number via email when your order is shipped.</li>
                        <li><strong>Returns:</strong> You may return physical products within 14 days, subject to our refund policy.</li>
                      </ul>
                    </section>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">3. Delivery Time</h2>
                      <p>Access to digital products and services is typically provided within 24 hours after payment confirmation. Appointment bookings are confirmed instantly or within business hours.</p>
                    </section>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">4. Contact for Delivery Issues</h2>
                      <p>If you have any questions or issues regarding delivery or shipping, please contact us:</p>
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
                      <h2 className="h4 text-success mb-3">1. Dijital Ürün Teslimatı</h2>
                      <p>Tüm beslenme ve diyet hizmetleri dijital olarak sunulmaktadır. Satın alma işleminizden sonra erişim bilgileri e-posta ve/veya danışan paneliniz üzerinden iletilir. Dijital ürünler için fiziksel gönderim yapılmaz.</p>
                    </section>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">2. Fiziksel Ürün Kargo</h2>
                      <p>Fiziksel ürünler (sunulursa) anlaşmalı kargo firmaları ile belirttiğiniz adrese gönderilir. Şu anda fiziksel ürün gönderimi yapılmamaktadır, ancak ileride aktif edilebilir.</p>
                      <ul>
                        <li><strong>Kargo Ücreti:</strong> Ödeme öncesi sepet ekranında gösterilir.</li>
                        <li><strong>Teslimat Süresi:</strong> Ödeme onayından sonra genellikle 2-5 iş günü içinde teslim edilir.</li>
                        <li><strong>Kargo Takibi:</strong> Siparişiniz kargoya verildiğinde e-posta ile takip numarası gönderilir.</li>
                        <li><strong>İade:</strong> Fiziksel ürünleri 14 gün içinde iade edebilirsiniz, iade politikamıza tabidir.</li>
                      </ul>
                    </section>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">3. Teslimat Süresi</h2>
                      <p>Dijital ürün ve hizmetlere erişim genellikle ödeme onayından sonraki 24 saat içinde sağlanır. Randevu rezervasyonları anında veya mesai saatleri içinde onaylanır.</p>
                    </section>
                    <section className="mb-4">
                      <h2 className="h4 text-success mb-3">4. Teslimat/Kargo Soruları İçin İletişim</h2>
                      <p>Teslimat veya kargo ile ilgili sorularınız için bizimle iletişime geçebilirsiniz:</p>
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



export default Delivery;
