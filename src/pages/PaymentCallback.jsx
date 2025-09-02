import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useCart } from '../context/CartContext';

const PaymentCallback = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [orderData, setOrderData] = useState(null);
  const [error, setError] = useState('');
  const isEnglish = i18n.language === 'en';

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        // URL parametrelerini al
        const status = searchParams.get('status');
        const orderId = searchParams.get('merchant_oid') || searchParams.get('order_id');
        const amount = searchParams.get('total_amount') || searchParams.get('amount');

        if (status === 'success' || status === '1') {
          // Ödeme başarılı
          setStatus('success');
          setOrderData({
            orderNumber: orderId || Date.now().toString(),
            amount: amount || '0'
          });

          // Sepeti temizle
          clearCart();

          // 3 saniye sonra success sayfasına yönlendir
          setTimeout(() => {
            navigate(isEnglish ? '/en/order-success' : '/siparis-basarili');
          }, 3000);
        } else {
          // Ödeme başarısız
          setStatus('error');
          setError(isEnglish ? 'Payment was not successful' : 'Ödeme başarısız oldu');
        }
      } catch (error) {
        console.error('Payment callback error:', error);
        setStatus('error');
        setError(error.message || (isEnglish ? 'Payment verification failed' : 'Ödeme doğrulama başarısız'));
      }
    };

    handlePaymentCallback();
  }, [searchParams, navigate, clearCart, isEnglish]);

  return (
    <>
      <Helmet>
        <title>{isEnglish ? 'Payment Processing' : 'Ödeme İşleniyor'} - Oğuz Yolyapan</title>
      </Helmet>

      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="row justify-content-center w-100">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg border-0">
              <div className="card-body text-center p-5">
                {status === 'loading' && (
                  <>
                    <div className="spinner-border text-primary mb-4" role="status" style={{ width: '4rem', height: '4rem' }}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <h4 className="mb-3">
                      {isEnglish ? 'Processing Payment...' : 'Ödeme İşleniyor...'}
                    </h4>
                    <p className="text-muted">
                      {isEnglish ? 'Please wait while we verify your payment.' : 'Ödemeniz doğrulanırken lütfen bekleyiniz.'}
                    </p>
                  </>
                )}

                {status === 'success' && (
                  <>
                    <div className="text-success mb-4">
                      <i className="bi bi-check-circle-fill" style={{ fontSize: '4rem' }}></i>
                    </div>
                    <h4 className="text-success mb-3">
                      {isEnglish ? 'Payment Successful!' : 'Ödeme Başarılı!'}
                    </h4>
                    <p className="text-muted mb-4">
                      {isEnglish ? 'Your payment has been processed successfully.' : 'Ödemeniz başarıyla işlendi.'}
                    </p>
                    {orderData && (
                      <div className="bg-light p-3 rounded mb-4">
                        <small className="text-muted">
                          {isEnglish ? 'Order Number:' : 'Sipariş No:'} <strong>{orderData.orderNumber}</strong>
                        </small>
                      </div>
                    )}
                    <p className="small text-muted">
                      {isEnglish ? 'Redirecting to order details...' : 'Sipariş detaylarına yönlendiriliyorsunuz...'}
                    </p>
                  </>
                )}

                {status === 'error' && (
                  <>
                    <div className="text-danger mb-4">
                      <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '4rem' }}></i>
                    </div>
                    <h4 className="text-danger mb-3">
                      {isEnglish ? 'Payment Failed' : 'Ödeme Başarısız'}
                    </h4>
                    <p className="text-muted mb-4">{error}</p>
                    <div className="d-flex gap-2 justify-content-center">
                      <button 
                        className="btn btn-primary"
                        onClick={() => navigate(isEnglish ? '/en/checkout' : '/odeme')}
                      >
                        {isEnglish ? 'Try Again' : 'Tekrar Dene'}
                      </button>
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={() => navigate(isEnglish ? '/en' : '/')}
                      >
                        {isEnglish ? 'Go Home' : 'Ana Sayfa'}
                      </button>
                    </div>
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

export default PaymentCallback;
