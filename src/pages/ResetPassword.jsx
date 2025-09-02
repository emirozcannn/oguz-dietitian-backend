import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate } from 'react-router-dom';
import * as AuthContext from '../context/AuthContext';

const ResetPassword = () => {
  const { t, i18n } = useTranslation();
  const { resetPassword, user } = AuthContext.useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const isEnglish = i18n.language === 'en';

  const getLocalizedPath = useCallback((path) => {
    return isEnglish ? `/en${path}` : path;
  }, [isEnglish]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      // Check if user is admin
      const isAdmin = user.user_metadata?.role === 'admin' || 
                     user.email === 'admin@oguzyolyapan.com' ||
                     user.email === 'admin@oguz.com';
      
      let redirectTo;
      if (isAdmin) {
        // Admin kullanıcıları admin panele yönlendir
        redirectTo = getLocalizedPath(isEnglish ? '/admin-panel' : '/admin');
      } else {
        // Normal kullanıcıları client panele yönlendir
        redirectTo = getLocalizedPath(isEnglish ? '/client-panel' : '/danisan-paneli');
      }
      
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, isEnglish, getLocalizedPath]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = t('auth.signup.errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.signup.errors.emailInvalid');
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const { data, error } = await resetPassword(formData.email);
      
      if (error) {
        // Handle different error types
        if (error.message.includes('User not found')) {
          setErrors({ submit: t('auth.resetPassword.errors.emailNotFound') });
        } else {
          setErrors({ submit: error.message });
        }
        return;
      }
      
      if (data) {
        setIsSuccess(true);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setErrors({ submit: t('auth.resetPassword.errors.networkError') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('auth.resetPassword.title')} - Oğuz Yolyapan</title>
        <meta name="description" content={t('auth.resetPassword.subtitle')} />
      </Helmet>

      <div className="min-vh-100 d-flex align-items-center py-5" style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-5 col-md-7">
              <div className="card shadow-lg border-0">
                <div className="card-body p-5">
                  {/* Header */}
                  <div className="text-center mb-4">
                    <div className="mb-3">
                      <i className="bi bi-key text-primary" style={{ fontSize: '3rem' }}></i>
                    </div>
                    <h1 className="h3 mb-2">{t('auth.resetPassword.title')}</h1>
                    <p className="text-muted">{t('auth.resetPassword.subtitle')}</p>
                  </div>

                  {!isSuccess ? (
                    /* Reset Form */
                    <form onSubmit={handleSubmit} noValidate>
                      {/* Email */}
                      <div className="mb-4">
                        <label htmlFor="email" className="form-label fw-semibold">
                          {t('auth.resetPassword.email')}
                        </label>
                        <div className="input-group">
                          <span className="input-group-text">
                            <i className="bi bi-envelope"></i>
                          </span>
                          <input
                            type="email"
                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="ornek@email.com"
                            autoComplete="email"
                            required
                          />
                          {errors.email && (
                            <div className="invalid-feedback">{errors.email}</div>
                          )}
                        </div>
                      </div>

                      {/* Submit Error */}
                      {errors.submit && (
                        <div className="alert alert-danger" role="alert">
                          <i className="bi bi-exclamation-triangle me-2"></i>
                          {errors.submit}
                        </div>
                      )}

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className="btn btn-primary w-100 py-2 mb-3"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            {t('common.loading')}
                          </>
                        ) : (
                          <>
                            <i className="bi bi-send me-2"></i>
                            {t('auth.resetPassword.sendButton')}
                          </>
                        )}
                      </button>

                      {/* Demo Info */}
                      <div className="alert alert-info small" role="alert">
                        <i className="bi bi-info-circle me-2"></i>
                        <strong>Demo:</strong> Herhangi bir geçerli e-posta adresi kullanın (notfound@example.com hariç)
                      </div>
                    </form>
                  ) : (
                    /* Success Message */
                    <div className="text-center">
                      <div className="mb-4">
                        <i className="bi bi-check-circle text-success" style={{ fontSize: '4rem' }}></i>
                      </div>
                      <div className="alert alert-success" role="alert">
                        <h5 className="alert-heading mb-2">
                          <i className="bi bi-check-circle me-2"></i>
                          {t('common.success')}
                        </h5>
                        <p className="mb-0">{t('auth.resetPassword.success')}</p>
                      </div>
                      <p className="text-muted mb-4">
                        E-posta adresinizi kontrol edin ve gelen bağlantıya tıklayarak şifrenizi sıfırlayın.
                      </p>
                    </div>
                  )}

                  {/* Back to Login */}
                  <div className="text-center pt-3 border-top">
                    <Link to={getLocalizedPath(isEnglish ? '/login' : '/giris')} className="text-decoration-none">
                      <i className="bi bi-arrow-left me-2"></i>
                      {t('auth.resetPassword.backToLogin')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
