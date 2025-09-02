import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const Cart = () => {
  const { t, i18n } = useTranslation();
  const { cart, updateQuantity, removeFromCart } = useCart();
  
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const isEnglish = i18n.language === 'en';

  const applyCoupon = () => {
    // Mock coupon validation
    if (couponCode.toLowerCase() === 'welcome10') {
      setAppliedCoupon({ code: 'WELCOME10', discount: 10, type: 'percentage' });
    } else if (couponCode.toLowerCase() === 'first50') {
      setAppliedCoupon({ code: 'FIRST50', discount: 50, type: 'fixed' });
    } else {
      alert(t('cart.invalidCoupon'));
    }
  };

  const calculateSubtotal = () => {
    return (cart || []).reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0;
    const subtotal = calculateSubtotal();
    if (appliedCoupon.type === 'percentage') {
      return (subtotal * appliedCoupon.discount) / 100;
    }
    return appliedCoupon.discount;
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    const discount = calculateDiscount();
    return (subtotal - discount) * 0.18; // 18% KDV
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount() + calculateTax();
  };

  if (!cart || cart.length === 0) {
    return (
      <>
        <Helmet>
          <title>{t('cart.title')} - Oğuz Yolyapan</title>
        </Helmet>

        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-8 text-center">
              <div className="py-5">
                <i className="bi bi-cart-x display-1 text-muted mb-4"></i>
                <h2 className="h3 mb-3">{t('cart.empty')}</h2>
                <p className="text-muted mb-4">{t('cart.emptyMessage')}</p>
                <Link 
                  to={isEnglish ? '/en/packages' : '/paketler'} 
                  className="btn btn-primary btn-lg"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  {t('cart.continueShopping')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{t('cart.title')} - Oğuz Yolyapan</title>
      </Helmet>

      <div className="container py-5">
        <div className="row">
          <div className="col-12">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h1 className="h2 mb-0">{t('cart.title')}</h1>
              <Link 
                to={isEnglish ? '/en/packages' : '/paketler'} 
                className="btn btn-outline-primary"
              >
                <i className="bi bi-arrow-left me-2"></i>
                {t('cart.continueShopping')}
              </Link>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-8">
            <div className="card shadow-sm">
              <div className="card-header bg-light">
                <h5 className="mb-0">{t('cart.subtitle')}</h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th className="border-0 ps-4">{t('cart.item')}</th>
                        <th className="border-0 text-center">{t('cart.quantity')}</th>
                        <th className="border-0 text-end">{t('cart.price')}</th>
                        <th className="border-0 text-end">{t('cart.total')}</th>
                        <th className="border-0 text-center pe-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(cart || []).map(item => (
                        <tr key={item.id}>
                          <td className="ps-4 py-3">
                            <div className="d-flex align-items-center">
                              <div className="flex-shrink-0 me-3">
                                <div className="bg-light rounded d-flex align-items-center justify-content-center" style={{ width: '60px', height: '60px' }}>
                                  <i className="bi bi-calendar-check text-primary"></i>
                                </div>
                              </div>
                              <div>
                                <h6 className="mb-1">{item.name}</h6>
                                <small className="text-muted">{item.duration || t('packages.consultation')}</small>
                              </div>
                            </div>
                          </td>
                          <td className="text-center py-3">
                            <div className="d-flex align-items-center justify-content-center">
                              <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              >
                                <i className="bi bi-dash"></i>
                              </button>
                              <span className="mx-2 fw-semibold">{item.quantity}</span>
                              <button 
                                className="btn btn-sm btn-outline-secondary"
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              >
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>
                          </td>
                          <td className="text-end py-3">
                            <span className="fw-semibold">₺{item.price}</span>
                          </td>
                          <td className="text-end py-3">
                            <span className="fw-semibold">₺{item.price * item.quantity}</span>
                          </td>
                          <td className="text-center py-3 pe-4">
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => removeFromCart(item.id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Coupon Code */}
            <div className="card shadow-sm mt-4">
              <div className="card-body">
                <h6 className="card-title">{t('cart.couponCode')}</h6>
                <div className="row g-2">
                  <div className="col-8">
                    <input
                      type="text"
                      className="form-control"
                      placeholder={t('cart.couponCode')}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                  </div>
                  <div className="col-4">
                    <button 
                      className="btn btn-outline-primary w-100"
                      onClick={applyCoupon}
                    >
                      {t('cart.applyCoupon')}
                    </button>
                  </div>
                </div>
                {appliedCoupon && (
                  <div className="alert alert-success mt-3 mb-0">
                    <i className="bi bi-check-circle me-2"></i>
                    {t('cart.couponApplied')}: {appliedCoupon.code}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card shadow-sm sticky-top" style={{ top: '100px' }}>
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">{t('cart.estimatedTotal')}</h5>
              </div>
              <div className="card-body">
                <div className="d-flex justify-content-between mb-2">
                  <span>{t('cart.subtotal')}</span>
                  <span className="fw-semibold">₺{calculateSubtotal().toFixed(2)}</span>
                </div>
                
                {appliedCoupon && (
                  <div className="d-flex justify-content-between mb-2 text-success">
                    <span>{t('cart.discount')} ({appliedCoupon.code})</span>
                    <span className="fw-semibold">-₺{calculateDiscount().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="d-flex justify-content-between mb-2">
                  <span>{t('cart.tax')} (18%)</span>
                  <span className="fw-semibold">₺{calculateTax().toFixed(2)}</span>
                </div>
                
                <hr />
                
                <div className="d-flex justify-content-between mb-3">
                  <strong>{t('cart.grandTotal')}</strong>
                  <strong className="text-primary">₺{calculateTotal().toFixed(2)}</strong>
                </div>
                
                <Link 
                  to={isEnglish ? '/en/checkout' : '/odeme'} 
                  className="btn btn-success w-100 btn-lg"
                >
                  <i className="bi bi-credit-card me-2"></i>
                  {t('cart.checkout')}
                </Link>
                
                <div className="text-center mt-3">
                  <small className="text-muted">
                    <i className="bi bi-shield-check me-1"></i>
                    {t('checkout.payment.securePayment')}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
