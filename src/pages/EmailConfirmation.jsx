import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

const EmailConfirmation = () => {
  const { i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const isEnglish = i18n.language === 'en';

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      try {
        // URL'den token'ları al
        const token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        const access_token = searchParams.get('access_token');
        const refresh_token = searchParams.get('refresh_token');

        if (type === 'signup' && token_hash) {
          // Email confirmation
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'email'
          });

          if (error) throw error;

          setStatus('success');
          setMessage(isEnglish ? 'Email confirmed successfully!' : 'Email başarıyla doğrulandı!');
          
          // 3 saniye sonra login sayfasına yönlendir
          setTimeout(() => {
            navigate(isEnglish ? '/en/login' : '/giris');
          }, 3000);

        } else if (type === 'recovery' && access_token) {
          // Password reset
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          });

          if (error) throw error;

          setStatus('success');
          setMessage(isEnglish ? 'Password reset link verified!' : 'Şifre sıfırlama linki doğrulandı!');
          
          // Reset password sayfasına yönlendir
          setTimeout(() => {
            navigate(isEnglish ? '/en/reset-password' : '/sifre-sifirla');
          }, 2000);

        } else if (type === 'magiclink' && access_token) {
          // Magic link login
          const { error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          });

          if (error) throw error;

          setStatus('success');
          setMessage(isEnglish ? 'Successfully logged in!' : 'Başarıyla giriş yapıldı!');
          
          // Ana sayfaya yönlendir
          setTimeout(() => {
            navigate(isEnglish ? '/en' : '/');
          }, 2000);

        } else {
          throw new Error('Invalid confirmation link');
        }

      } catch (error) {
        console.error('Email confirmation error:', error);
        setStatus('error');
        setMessage(
          isEnglish 
            ? 'Email confirmation failed. The link may be expired or invalid.' 
            : 'Email doğrulama başarısız. Link süresi dolmuş veya geçersiz olabilir.'
        );
      }
    };

    handleEmailConfirmation();
  }, [searchParams, navigate, isEnglish]);

  return (
    <div className="container-fluid vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="row justify-content-center w-100">
        <div className="col-md-6 col-lg-4">
          <div className="card shadow">
            <div className="card-body text-center p-5">
              {status === 'loading' && (
                <>
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h4 className="mb-3">
                    {isEnglish ? 'Confirming...' : 'Doğrulanıyor...'}
                  </h4>
                  <p className="text-muted">
                    {isEnglish ? 'Please wait while we confirm your email.' : 'Email adresinizi doğrularken lütfen bekleyin.'}
                  </p>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="text-success mb-3">
                    <i className="bi bi-check-circle" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h4 className="text-success mb-3">
                    {isEnglish ? 'Success!' : 'Başarılı!'}
                  </h4>
                  <p className="text-muted mb-4">{message}</p>
                  <p className="small text-muted">
                    {isEnglish ? 'Redirecting...' : 'Yönlendiriliyor...'}
                  </p>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="text-danger mb-3">
                    <i className="bi bi-exclamation-circle" style={{ fontSize: '3rem' }}></i>
                  </div>
                  <h4 className="text-danger mb-3">
                    {isEnglish ? 'Error' : 'Hata'}
                  </h4>
                  <p className="text-muted mb-4">{message}</p>
                  <div className="d-flex gap-2 justify-content-center">
                    <button 
                      className="btn btn-primary"
                      onClick={() => navigate(isEnglish ? '/en/login' : '/giris')}
                    >
                      {isEnglish ? 'Go to Login' : 'Giriş Sayfasına Git'}
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
  );
};

export default EmailConfirmation;
