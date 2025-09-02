import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';

const OrderSuccess = () => {
  const { t, i18n } = useTranslation();
  const { clearCart } = useCart();
  const isEnglish = i18n.language === 'en';
  const orderProcessedRef = useRef(false);

  // Mock order data (in real app, this would come from the checkout process)
  const orderNumber = 'ORD-2025-001234';
  const orderData = {
    orderNumber,
    orderDate: new Date().toLocaleDateString(),
    total: 750,
    items: [
      {
        id: 1,
        name: t('appointment.appointmentTypes.firstConsultation'),
        price: 350,
        quantity: 1
      },
      {
        id: 2,
        name: t('appointment.appointmentTypes.nutritionPlan'),
        price: 400,
        quantity: 1
      }
    ],
    paymentMethod: 'Kredi Kartı',
    status: 'Onaylandı'
  };

  useEffect(() => {
    // Prevent duplicate order processing
    if (orderProcessedRef.current) {
      return;
    }
    
    // Mark as processed
    orderProcessedRef.current = true;
    
    // Clear cart on successful order - now clearCart is stable with useCallback
    clearCart();
    console.log('Order completed:', orderNumber);
  }, [clearCart]); // Now safe to include clearCart

  const handlePrintReceipt = () => {
    window.print();
  };

  const handleAddToCalendar = () => {
    // Google Calendar integration
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Tomorrow
    startDate.setHours(10, 0, 0, 0); // 10:00 AM
    
    const endDate = new Date(startDate);
    endDate.setHours(10, 45, 0, 0); // 10:45 AM
    
    const title = encodeURIComponent(t('appointment.appointmentTypes.firstConsultation'));
    const details = encodeURIComponent('Online randevu - Oğuz Yolyapan');
    
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}/${endDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}&details=${details}`;
    
    window.open(googleCalendarUrl, '_blank');
  };

  return (
    <>
      <Helmet>
        <title>{t('checkout.success.title')} - Oğuz Yolyapan</title>
      </Helmet>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Success Header */}
            <div className="text-center mb-5">
              <div className="mb-4">
                <i className="bi bi-check-circle-fill text-success display-1"></i>
              </div>
              <h1 className="h2 text-success mb-3">{t('checkout.success.title')}</h1>
              <p className="lead text-muted">{t('checkout.success.message')}</p>
            </div>

            {/* Order Details */}
            <div className="card shadow-sm mb-4">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="bi bi-receipt me-2"></i>
                  {t('checkout.confirmation.title')}
                </h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  <div className="col-md-6">
                    <strong>{t('checkout.confirmation.orderNumber')}:</strong>
                    <br />
                    <span className="text-muted">{orderData.orderNumber}</span>
                  </div>
                  <div className="col-md-6">
                    <strong>{t('checkout.confirmation.orderDate')}:</strong>
                    <br />
                    <span className="text-muted">{orderData.orderDate}</span>
                  </div>
                  <div className="col-md-6">
                    <strong>{t('checkout.confirmation.paymentMethod')}:</strong>
                    <br />
                    <span className="text-muted">{orderData.paymentMethod}</span>
                  </div>
                  <div className="col-md-6">
                    <strong>{t('checkout.confirmation.status')}:</strong>
                    <br />
                    <span className="badge bg-success">{orderData.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="card shadow-sm mb-4">
              <div className="card-header">
                <h5 className="mb-0">{t('checkout.orderSummary.items')}</h5>
              </div>
              <div className="card-body">
                {orderData.items.map(item => (
                  <div key={item.id} className="d-flex justify-content-between align-items-center mb-3 last:mb-0">
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0 me-3">
                        <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ width: '50px', height: '50px' }}>
                          <i className="bi bi-calendar-check text-primary"></i>
                        </div>
                      </div>
                      <div>
                        <h6 className="mb-1">{item.name}</h6>
                        <small className="text-muted">{t('cart.quantity')}: {item.quantity}</small>
                      </div>
                    </div>
                    <div className="text-end">
                      <span className="fw-semibold">₺{item.price}</span>
                    </div>
                  </div>
                ))}
                <hr />
                <div className="d-flex justify-content-between">
                  <strong>{t('checkout.orderSummary.total')}</strong>
                  <strong className="text-success">₺{orderData.total}</strong>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="card shadow-sm mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-list-check me-2"></i>
                  {t('checkout.success.nextSteps')}
                </h5>
              </div>
              <div className="card-body">
                <ul className="list-unstyled mb-0">
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Randevu detayları e-posta adresinize gönderildi
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Randevu öncesinde size WhatsApp üzerinden bilgilendirme yapılacak
                  </li>
                  <li className="mb-2">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Randevu linki randevu saatinden 30 dakika önce gönderilecek
                  </li>
                  <li className="mb-0">
                    <i className="bi bi-check-circle text-success me-2"></i>
                    Danışan panelinizden randevu detaylarını takip edebilirsiniz
                  </li>
                </ul>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="row g-3 mb-4">
              <div className="col-md-6">
                <button 
                  className="btn btn-outline-primary w-100"
                  onClick={handlePrintReceipt}
                >
                  <i className="bi bi-printer me-2"></i>
                  {t('checkout.confirmation.printReceipt')}
                </button>
              </div>
              <div className="col-md-6">
                <button 
                  className="btn btn-outline-success w-100"
                  onClick={handleAddToCalendar}
                >
                  <i className="bi bi-calendar-plus me-2"></i>
                  {t('checkout.confirmation.calendarButton')}
                </button>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="text-center">
              <div className="btn-group" role="group">
                <Link 
                  to={isEnglish ? '/en/client-panel' : '/danisan-paneli'} 
                  className="btn btn-success"
                >
                  <i className="bi bi-house me-2"></i>
                  {t('checkout.confirmation.dashboardButton')}
                </Link>
                <Link 
                  to={isEnglish ? '/en/appointment' : '/randevu'} 
                  className="btn btn-outline-primary"
                >
                  <i className="bi bi-calendar-plus me-2"></i>
                  Yeni Randevu Al
                </Link>
                <Link 
                  to={isEnglish ? '/en/packages' : '/paketler'} 
                  className="btn btn-outline-secondary"
                >
                  <i className="bi bi-box me-2"></i>
                  Paketleri İncele
                </Link>
              </div>
            </div>

            {/* Support */}
            <div className="text-center mt-4">
              <p className="text-muted mb-2">
                <strong>{t('checkout.success.support')}</strong>
              </p>
              <div className="d-flex justify-content-center gap-3">
                <Link to={isEnglish ? '/en/contact' : '/iletisim'} className="text-decoration-none">
                  <i className="bi bi-envelope me-1"></i>
                  {t('nav.contact')}
                </Link>
                <a href="https://wa.me/905551234567" className="text-decoration-none" target="_blank" rel="noopener noreferrer">
                  <i className="bi bi-whatsapp me-1"></i>
                  WhatsApp
                </a>
                <a href="tel:+905551234567" className="text-decoration-none">
                  <i className="bi bi-telephone me-1"></i>
                  +90 555 123 45 67
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderSuccess;
