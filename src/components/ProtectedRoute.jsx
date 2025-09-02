import * as AuthContext from '../context/AuthContext';
import { Navigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const ProtectedRoute = ({ children, adminOnly = false, allowedRoles = [] }) => {
  const { user, userRole, loading } = AuthContext.useAuth();
  const location = useLocation();
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  // Show loading spinner while checking auth
  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3 text-muted">
            {isEnglish ? 'Checking authentication...' : 'Kimlik doğrulaması kontrol ediliyor...'}
          </p>
        </div>
      </div>
    );
  }

  // If user is not authenticated, redirect to login
  if (!user) {
    const loginPath = isEnglish ? '/en/login' : '/giris';
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Check admin access if required
  if (adminOnly) {
    if (userRole !== 'admin') {
      // Redirect to client panel instead of showing error
      const clientPanelPath = isEnglish ? '/en/client-panel' : '/danisan-paneli';
      console.log('User is not admin, redirecting to client panel');
      return <Navigate to={clientPanelPath} replace />;
    }
  }

  // Check specific roles if provided
  if (allowedRoles.length > 0) {
    if (!allowedRoles.includes(userRole)) {
      const defaultPath = userRole === 'admin' 
        ? (isEnglish ? '/en/admin-panel' : '/yonetici-paneli')
        : (isEnglish ? '/en/client-panel' : '/danisan-paneli');
      
      console.log(`User role ${userRole} not in allowed roles ${allowedRoles.join(', ')}, redirecting to ${defaultPath}`);
      return <Navigate to={defaultPath} replace />;
    }
  }

  // User is authenticated and authorized, render the protected component
  return children;
};

export default ProtectedRoute;