import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import * as AuthContext from '../context/AuthContext';

const Checkout = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();
  const { user } = AuthContext.useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Billing Info - Pre-fill from user if logged in
    firstName: user?.user_metadata?.firstName || '',
    lastName: user?.user_metadata?.lastName || '',
    email: user?.email || '',
    phone: user?.user_metadata?.phone || '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'Turkey',
    company: '',
    taxNumber: '',
    
    // Shipping Info
    shippingMethod: 'digital',
    shippingNotes: '',
    sameAsShipping: true,
    
    // Payment
    paymentMethod: 'creditCard',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardHolder: '',
    saveCard: false,
    installments: 1,
    
    // Terms
    acceptTerms: false,
    acceptPrivacy: false
  });

  const isEnglish = i18n.language === 'en';

  // Redirect if cart is empty
  if (!cart || cart.length === 0) {
    navigate(isEnglish ? '/en/cart' : '/sepet', { replace: true });
    return null;
  }

  // Use cart items instead of mock data
  const orderItems = cart || [];

  const subtotal = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discount = 50; // Applied coupon - TODO: integrate with coupon system
  const tax = (subtotal - discount) * 0.18;
  const total = subtotal - discount + tax;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'installments' ? parseInt(value, 10) : value)
    }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Sipariş verilerini hazırla
      const orderData = {
        subtotal: subtotal,
        tax: tax,
        discount: discount,
        total: total,
        items: orderItems,
        lang: i18n.language
      };

      // Kullanıcı verilerini hazırla
      const userData = {
        id: user?.id,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        address: formData.address
      };

      // PayTR ile ödeme oluştur
      const paymentResult = await createPayTRPayment(orderData, userData);

      if (paymentResult.success) {
        // Sipariş onay bildirimi gönder
        await sendOrderNotification({
          order_number: paymentResult.order_number,
          customer_email: userData.email,
          customer_phone: userData.phone,
          customer_name: `${userData.firstName} ${userData.lastName}`,
          total_amount: total,
          status: 'Onaylandı',
          items: orderItems,
          created_at: new Date().toISOString()
        }, i18n.language === 'en');

        // Sepeti temizle
        clearCart();

        // PayTR ödeme sayfasına yönlendir
        window.location.href = paymentResult.payment_url;
      } else {
        throw new Error(paymentResult.error || 'Ödeme oluşturulamadı');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert(isEnglish ? 
        'Payment processing failed. Please try again.' : 
        'Ödeme işlemi başarısız. Lütfen tekrar deneyin.'
      );
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="row mb-4">
      <div className="col-12">
        <div className="d-flex justify-content-between align-items-center">
          {[1, 2, 3, 4].map(step => (
            <div key={step} className="d-flex flex-column align-items-center flex-fill">
              <div className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${
                step <= currentStep ? 'bg-success text-white' : 'bg-light text-muted'
              }`} style={{ width: '40px', height: '40px' }}>
                {step < currentStep ? (
                  <i className="bi bi-check-lg"></i>
                ) : (
                  <span className="fw-bold">{step}</span>
                )}
              </div>
              <small className={`text-center ${step <= currentStep ? 'text-success fw-semibold' : 'text-muted'}`}>
                {t(`checkout.steps.step${step}`)}
              </small>
              {step < 4 && (
                <div className={`flex-fill mx-3 mt-2 ${step < currentStep ? 'border-success' : 'border-light'}`} 
                     style={{ height: '2px', backgroundColor: step < currentStep ? '#198754' : '#e9ecef' }}>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderOrderSummary = () => (
    <div className="card shadow-sm">
      <div className="card-header bg-light">
        <h5 className="mb-0">{t('checkout.orderSummary.title')}</h5>
      </div>
      <div className="card-body">
        {orderItems.map(item => (
          <div key={item.id} className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h6 className="mb-1">{item.name}</h6>
              <small className="text-muted">{item.duration}</small>
            </div>
            <div className="text-end">
              <span className="fw-semibold">₺{item.price}</span>
            </div>
          </div>
        ))}
        <hr />
        <div className="d-flex justify-content-between mb-2">
          <span>{t('checkout.orderSummary.items')}</span>
          <span>₺{subtotal}</span>
        </div>
        <div className="d-flex justify-content-between mb-2 text-success">
          <span>{t('cart.discount')}</span>
          <span>-₺{discount}</span>
        </div>
        <div className="d-flex justify-content-between mb-2">
          <span>{t('checkout.orderSummary.tax')}</span>
          <span>₺{tax.toFixed(2)}</span>
        </div>
        <hr />
        <div className="d-flex justify-content-between">
          <strong>{t('checkout.orderSummary.total')}</strong>
          <strong className="text-success">₺{total.toFixed(2)}</strong>
        </div>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="card shadow-sm">
      <div className="card-header">
        <h5 className="mb-0">{t('checkout.billingInfo.title')}</h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-md-6">
            <label className="form-label">{t('checkout.billingInfo.firstName')} <span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">{t('checkout.billingInfo.lastName')} <span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">{t('checkout.billingInfo.email')} <span className="text-danger">*</span></label>
            <input
              type="email"
              className="form-control"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">{t('checkout.billingInfo.phone')} <span className="text-danger">*</span></label>
            <input
              type="tel"
              className="form-control"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-12">
            <label className="form-label">{t('checkout.billingInfo.address')} <span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">{t('checkout.billingInfo.city')} <span className="text-danger">*</span></label>
            <input
              type="text"
              className="form-control"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">{t('checkout.billingInfo.zipCode')}</label>
            <input
              type="text"
              className="form-control"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">{t('checkout.billingInfo.company')}</label>
            <input
              type="text"
              className="form-control"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
            />
          </div>
          <div className="col-md-6">
            <label className="form-label">{t('checkout.billingInfo.taxNumber')}</label>
            <input
              type="text"
              className="form-control"
              name="taxNumber"
              value={formData.taxNumber}
              onChange={handleInputChange}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="card shadow-sm">
      <div className="card-header">
        <h5 className="mb-0">{t('checkout.shippingInfo.title')}</h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label">{t('checkout.shippingInfo.method')}</label>
            <div className="row g-2">
              <div className="col-md-6">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="shippingMethod"
                    value="digital"
                    checked={formData.shippingMethod === 'digital'}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label">
                    <i className="bi bi-laptop me-2"></i>
                    {t('checkout.shippingInfo.digital')}
                    <small className="d-block text-muted">{t('checkout.orderSummary.free')}</small>
                  </label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="shippingMethod"
                    value="pickup"
                    checked={formData.shippingMethod === 'pickup'}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label">
                    <i className="bi bi-shop me-2"></i>
                    {t('checkout.shippingInfo.pickup')}
                    <small className="d-block text-muted">{t('checkout.orderSummary.free')}</small>
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12">
            <label className="form-label">{t('checkout.shippingInfo.notes')}</label>
            <textarea
              className="form-control"
              name="shippingNotes"
              rows="3"
              value={formData.shippingNotes}
              onChange={handleInputChange}
              placeholder={t('checkout.shippingInfo.notes')}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="card shadow-sm">
      <div className="card-header">
        <h5 className="mb-0">{t('checkout.payment.title')}</h5>
      </div>
      <div className="card-body">
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label">{t('checkout.payment.method')}</label>
            <div className="row g-2">
              <div className="col-md-6">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    value="creditCard"
                    checked={formData.paymentMethod === 'creditCard'}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label">
                    <i className="bi bi-credit-card me-2"></i>
                    {t('checkout.payment.creditCard')}
                  </label>
                </div>
              </div>
              <div className="col-md-6">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="paymentMethod"
                    value="bankTransfer"
                    checked={formData.paymentMethod === 'bankTransfer'}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label">
                    <i className="bi bi-bank me-2"></i>
                    {t('checkout.payment.bankTransfer')}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {formData.paymentMethod === 'creditCard' && (
            <>
              <div className="col-12">
                <label className="form-label">{t('checkout.payment.cardNumber')} <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">{t('checkout.payment.expiryDate')} <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleInputChange}
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label">{t('checkout.payment.cvv')} <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="cvv"
                  value={formData.cvv}
                  onChange={handleInputChange}
                  placeholder="123"
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label">{t('checkout.payment.cardHolder')} <span className="text-danger">*</span></label>
                <input
                  type="text"
                  className="form-control"
                  name="cardHolder"
                  value={formData.cardHolder}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="col-12">
                <label className="form-label">{t('checkout.payment.installments')}</label>
                <select
                  className="form-select"
                  name="installments"
                  value={formData.installments}
                  onChange={handleInputChange}
                >
                  <option value="1">{t('checkout.payment.singlePayment')}</option>
                  <option value="2">2 {t('checkout.payment.installments')}</option>
                  <option value="3">3 {t('checkout.payment.installments')}</option>
                  <option value="6">6 {t('checkout.payment.installments')}</option>
                  <option value="9">9 {t('checkout.payment.installments')}</option>
                  <option value="12">12 {t('checkout.payment.installments')}</option>
                </select>
              </div>
              <div className="col-12">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    name="saveCard"
                    checked={formData.saveCard}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label">
                    {t('checkout.payment.saveCard')}
                  </label>
                </div>
              </div>
            </>
          )}

          <div className="col-12">
            <div className="alert alert-info">
              <i className="bi bi-shield-check me-2"></i>
              <strong>{t('checkout.payment.securePayment')}</strong>
              <br />
              <small>
                {window.location.protocol === 'https:' 
                  ? t('checkout.payment.ssl') 
                  : (isEnglish 
                      ? 'Warning: This page is not using a secure connection (HTTPS).' 
                      : 'Uyarı: Bu sayfa güvenli bir bağlantı (HTTPS) kullanmıyor.')}
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="card shadow-sm">
      <div className="card-header">
        <h5 className="mb-0">{t('checkout.confirmation.title')}</h5>
      </div>
      <div className="card-body">
        <div className="row g-4">
          <div className="col-md-6">
            <h6>{t('checkout.billingInfo.title')}</h6>
            <p className="mb-0">
              {formData.firstName} {formData.lastName}<br />
              {formData.email}<br />
              {formData.phone}<br />
              {formData.address}<br />
              {formData.city}, {formData.zipCode}
            </p>
          </div>
          <div className="col-md-6">
            <h6>{t('checkout.payment.title')}</h6>
            <p className="mb-0">
              {formData.paymentMethod === 'creditCard' && (
                <>
                  <i className="bi bi-credit-card me-2"></i>
                  {t('checkout.payment.creditCard')}
                  <br />
                  {formData.installments > 1 && (
                    <small className="text-muted">
                      {formData.installments} {t('checkout.payment.installments')}
                    </small>
                  )}
                </>
              )}
              {formData.paymentMethod === 'bankTransfer' && (
                <>
                  <i className="bi bi-bank me-2"></i>
                  {t('checkout.payment.bankTransfer')}
                </>
              )}
            </p>
          </div>
        </div>

        <hr />

        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            name="acceptTerms"
            checked={formData.acceptTerms}
            onChange={handleInputChange}
            required
          />
          <label className="form-check-label">
            {t('checkout.terms.accept')} <a href="gizlilik-politikasi" className="text-primary">{t('checkout.terms.terms')}</a>
          </label>
        </div>

        <div className="form-check">
          <input
            className="form-check-input"
            type="checkbox"
            name="acceptPrivacy"
            checked={formData.acceptPrivacy}
            onChange={handleInputChange}
            required
          />
          <label className="form-check-label">
            {t('checkout.terms.accept')} <a href="gizlilik-politikasi" className="text-primary">{t('checkout.terms.privacy')}</a>
          </label>
        </div>
      </div>
    </div>
  );

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.firstName && formData.lastName && formData.email && formData.phone && formData.address && formData.city;
      case 2:
        return formData.shippingMethod;
      case 3:
        if (formData.paymentMethod === 'creditCard') {
          return formData.cardNumber && formData.expiryDate && formData.cvv && formData.cardHolder;
        }
        return formData.paymentMethod;
      case 4:
        return formData.acceptTerms && formData.acceptPrivacy;
      default:
        return false;
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('checkout.title')} - Oğuz Yolyapan</title>
      </Helmet>

      <div className="container py-5">
        <div className="row">
          <div className="col-12">
            <h1 className="h2 mb-4">{t('checkout.title')}</h1>
            {renderStepIndicator()}
          </div>
        </div>

        <div className="row">
          <div className="col-lg-8">
            <form onSubmit={handleSubmit}>
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
              {currentStep === 4 && renderStep4()}

              <div className="d-flex justify-content-between mt-4">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={prevStep}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    {t('common.previous')}
                  </button>
                ) : (
                  <Link to={isEnglish ? '/en/cart' : '/sepet'} className="btn btn-outline-secondary">
                    <i className="bi bi-arrow-left me-2"></i>
                    {t('checkout.buttons.backToCart')}
                  </Link>
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={nextStep}
                    disabled={!isStepValid() || loading}
                  >
                    {t('common.next')}
                    <i className="bi bi-arrow-right ms-2"></i>
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="btn btn-success btn-lg"
                    disabled={!isStepValid() || loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {t('checkout.buttons.processing')}
                      </>
                    ) : (
                      <>
                        <i className="bi bi-credit-card me-2"></i>
                        {t('checkout.buttons.placeOrder')}
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="col-lg-4">
            <div className="sticky-top" style={{ top: '100px' }}>
              {renderOrderSummary()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};



export default Checkout;
