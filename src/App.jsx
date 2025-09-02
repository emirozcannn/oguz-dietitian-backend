import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';

// Auth Context - Changed to named import
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';

// Protected Route Component
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import About from './pages/About';
import Blog from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Packages from './pages/Packages';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Appointment from './pages/Appointment';
import Calculators from './pages/Calculators';
import ClientPanel from './pages/ClientPanel';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';
import Refund from './pages/Refund';
import Delivery from './pages/Delivery';
import EmailConfirmation from './pages/EmailConfirmation';
import PaymentCallback from './pages/PaymentCallback';
import AuthTest from './pages/AuthTest';

// Import i18n
import './i18n';

// Layout wrapper component
const LayoutWrapper = ({ children }) => {
  const location = useLocation();
  
  // Pages that should not have header/footer
  const noLayoutPages = [
    '/giris', '/kayit', '/sifre-sifirla', '/danisan-paneli', '/admin', '/yonetici-paneli',
    '/en/login', '/en/signup', '/en/reset-password', '/en/client-panel', '/en/admin-panel',
    '/auth/callback', '/en/auth/callback'
  ];
  
  const shouldHideLayout = noLayoutPages.includes(location.pathname);
  
  if (shouldHideLayout) {
    return <>{children}</>;
  }
  
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    // Set language based on URL
    const path = window.location.pathname;
    if (path.startsWith('/en')) {
      i18n.changeLanguage('en');
    } else {
      i18n.changeLanguage('tr');
    }
  }, [i18n]);

  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="App">
              <LayoutWrapper>
              <Routes>
              {/* Turkish Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/hakkimda" element={<About />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/paketler" element={<Packages />} />
              <Route path="/sss" element={<FAQ />} />
              <Route path="/iletisim" element={<Contact />} />
              <Route path="/randevu" element={<Appointment />} />
              <Route path="/hesaplayicilar" element={<Calculators />} />
              <Route path="/sepet" element={<Cart />} />
              <Route path="/odeme" element={<Checkout />} />
              <Route path="/siparis-basarili" element={<OrderSuccess />} />
              <Route path="/giris" element={<Login />} />
              <Route path="/kayit" element={<Signup />} />
              <Route path="/sifre-sifirla" element={<ResetPassword />} />
              <Route path="/danisan-paneli" element={<ProtectedRoute><ClientPanel /></ProtectedRoute>} />
              <Route path="/yonetici-paneli" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
              <Route path="/gizlilik-politikasi" element={<Privacy />} />
              <Route path="/kullanim-sartlari" element={<Terms />} />
              <Route path="/cerez-politikasi" element={<Cookies />} />
              <Route path="/iade-politikasi" element={<Refund />} />
              <Route path="/kargo-teslimat" element={<Delivery />} />
              <Route path="/delivery" element={<Delivery />} />
              <Route path="/en/delivery" element={<Delivery />} />
              <Route path="/auth/callback" element={<EmailConfirmation />} />
              <Route path="/auth-test" element={<AuthTest />} />

              {/* English Routes */}
              <Route path="/en" element={<Home />} />
              <Route path="/en/about" element={<About />} />
              <Route path="/en/blog" element={<Blog />} />
              <Route path="/en/blog/:slug" element={<BlogPost />} />
              <Route path="/en/packages" element={<Packages />} />
              <Route path="/en/faq" element={<FAQ />} />
              <Route path="/en/contact" element={<Contact />} />
              <Route path="/en/appointment" element={<Appointment />} />
              <Route path="/en/calculators" element={<Calculators />} />
              <Route path="/en/cart" element={<Cart />} />
              <Route path="/en/checkout" element={<Checkout />} />
              <Route path="/en/order-success" element={<OrderSuccess />} />
              <Route path="/en/login" element={<Login />} />
              <Route path="/en/signup" element={<Signup />} />
              <Route path="/en/reset-password" element={<ResetPassword />} />
              <Route path="/en/client-panel" element={<ProtectedRoute><ClientPanel /></ProtectedRoute>} />
              <Route path="/en/admin-panel" element={<ProtectedRoute adminOnly><AdminPanel /></ProtectedRoute>} />
              <Route path="/en/privacy-policy" element={<Privacy />} />
              <Route path="/en/terms-of-service" element={<Terms />} />
              <Route path="/en/cookie-policy" element={<Cookies />} />
              <Route path="/en/refund-policy" element={<Refund />} />
              <Route path="/en/delivery" element={<Delivery />} />
              <Route path="/en/auth/callback" element={<EmailConfirmation />} />
              <Route path="/en/payment-callback" element={<PaymentCallback />} />
              <Route path="/payment-callback" element={<PaymentCallback />} />
              <Route path="/payment-success" element={<PaymentCallback />} />
              <Route path="/payment-failed" element={<PaymentCallback />} />
              <Route path="/en/payment-success" element={<PaymentCallback />} />
              <Route path="/en/payment-failed" element={<PaymentCallback />} />
              </Routes>
            </LayoutWrapper>
          </div>
        </Router>
        </CartProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;