import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import * as AuthContext from '../context/AuthContext';

const Login = () => {
  const { t, i18n } = useTranslation();
  const auth = AuthContext.useAuth();
  
  // Debug: Auth context'i kontrol et
  console.log('🔍 Auth context:', auth);
  console.log('🔍 Available methods:', Object.keys(auth));
  
  const { user, userRole, loading } = auth;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isEnglish = i18n.language === 'en';

  // Check user role and redirect
  const checkUserRoleAndRedirect = useCallback(() => {
    // Don't redirect if we're still loading auth state
    if (loading) return;
    
    if (user && userRole !== null) {
      console.log('Redirecting user with role:', userRole);
      // Role-based redirection with correct paths
      const isAdminUser = userRole === 'admin' || userRole === 'super_admin';
      const redirectPath = isAdminUser
        ? '/admin'  // Admin panel için hem admin hem super_admin
        : (isEnglish ? '/en/client-panel' : '/danisan-paneli');
      
      console.log('Redirecting to:', redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [user, userRole, loading, navigate, isEnglish]);

  // Redirect if already logged in
  useEffect(() => {
    checkUserRoleAndRedirect();
  }, [checkUserRoleAndRedirect]);

  // Show success message if coming from registration
  useEffect(() => {
    if (searchParams.get('registered') === 'true') {
      // You could show a toast notification here
      console.log('Registration successful! Please sign in.');
    }
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
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
    
    if (!formData.email.trim()) {
      newErrors.email = t('auth.login.errors.emailRequired');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('auth.signup.errors.emailInvalid');
    }
    
    if (!formData.password) {
      newErrors.password = t('auth.login.errors.passwordRequired');
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.login.errors.passwordTooShort');
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
    
    // Use auth.signIn instead of destructured signIn
    if (!auth.signIn || typeof auth.signIn !== 'function') {
      console.error('❌ signIn is not available:', { signIn: auth.signIn, auth });
      setErrors({ submit: 'Authentication service is not available. Please refresh the page.' });
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      console.log('🔐 Attempting login with:', formData.email);
      const { data, error } = await auth.signIn(formData.email.trim(), formData.password);
      
      if (error) {
        // Handle different error types
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ submit: t('auth.login.errors.invalidCredentials') });
        } else if (error.message.includes('Email not confirmed')) {
          setErrors({ submit: t('auth.login.errors.emailNotConfirmed') });
        } else if (error.message.includes('Too many requests')) {
          setErrors({ submit: t('auth.login.errors.tooManyRequests') });
        } else {
          setErrors({ submit: t('auth.login.errors.networkError') });
        }
        return;
      }
      
      if (data?.user) {
        console.log('Login successful:', data.user.email);
        // AuthContext will handle role fetching and redirect through useEffect
        // The redirect will happen automatically in checkUserRoleAndRedirect
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: t('auth.login.errors.networkError') });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('auth.login.title')} - Oğuz Yolyapan</title>
        <meta name="description" content={t('auth.login.subtitle')} />
      </Helmet>

      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="row w-100 justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow">
              <div className="card-body p-4">
                {/* Header */}
                <div className="text-center mb-4">
                  <h2 className="h4 mb-1">{t('auth.login.title')}</h2>
                  <p className="text-muted">{t('auth.login.subtitle')}</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} noValidate>
                  {/* Email */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      {t('auth.login.email')}
                    </label>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder={t('auth.login.emailPlaceholder')}
                      autoComplete="email"
                      disabled={isLoading}
                      required
                    />
                    {errors.email && (
                      <div className="invalid-feedback">{errors.email}</div>
                    )}
                  </div>

                  {/* Password */}
                  <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                      {t('auth.login.password')}
                    </label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder={t('auth.login.passwordPlaceholder')}
                        autoComplete="current-password"
                        disabled={isLoading}
                        required
                      />
                      <button 
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                        aria-label={showPassword ? t('common.hidePassword') : t('common.showPassword')}
                      >
                        <i className={`bi bi-eye${showPassword ? '-slash' : ''}`}></i>
                      </button>
                      {errors.password && (
                        <div className="invalid-feedback">{errors.password}</div>
                      )}
                    </div>
                  </div>

                  {/* Remember & Forgot Password */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="remember"
                        name="remember"
                        checked={formData.remember}
                        onChange={handleChange}
                        disabled={isLoading}
                      />
                      <label className="form-check-label" htmlFor="remember">
                        {t('auth.login.remember')}
                      </label>
                    </div>
                    <Link 
                      to={isEnglish ? '/en/reset-password' : '/sifre-sifirla'} 
                      className="text-decoration-none small"
                      tabIndex={isLoading ? -1 : 0}
                    >
                      {t('auth.login.forgotPassword')}
                    </Link>
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
                    className="btn btn-primary w-100 mb-3"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {t('common.loading')}
                      </>
                    ) : (
                      t('auth.login.loginButton')
                    )}
                  </button>

                  {/* Demo Info - Only show in development */}
                  {import.meta.env.MODE === 'development' && (
                    <div className="alert alert-info" role="alert">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Demo:</strong> admin@oguz.com / password123 (Admin)<br />
                      <strong>Demo:</strong> test@test.com / password123 (User)
                    </div>
                  )}
                </form>

                {/* Sign Up Link */}
                <div className="text-center">
                  <p className="mb-0 text-muted">
                    {t('auth.login.noAccount')}{' '}
                    <Link 
                      to={isEnglish ? '/en/signup' : '/kayit'} 
                      className="text-decoration-none"
                      tabIndex={isLoading ? -1 : 0}
                    >
                      {t('auth.login.signupLink')}
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;