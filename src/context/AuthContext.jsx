import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import apiClient from '../lib/api.js';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  console.log('🚀 AuthProvider initialized with API');
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Sayfa yüklendiğinde token kontrolü
  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      try {
        const savedToken = localStorage.getItem('auth_token');
        if (savedToken) {
          // Token'i doğrulamak yerine sadece decode et
          const decoded = jwtDecode(savedToken);

          // Token'in süresinin dolup dolmadığını kontrol et
          if (decoded.exp * 1000 > Date.now()) {
            // Kullanıcı bilgilerini API'den getir
            const response = await apiClient.getProfile(decoded.userId);
            const userData = response.data;
            
            setUser(userData);
            setUserRole(userData.role);
            setToken(savedToken);
            console.log('✅ Auto-login successful:', userData.email);
          } else {
            // Token süresi dolmuş
            console.warn('⚠️ Token expired, signing out.');
            localStorage.removeItem('auth_token');
          }
        }
      } catch (error) {
        console.error('❌ Auto-login failed:', error.message);
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signIn = async (email, password) => {
    console.log('🔐 API sign in attempt:', email);
    setLoading(true);
    
    try {
      const response = await apiClient.login(email, password);
      
      setUser(response.data.user);
      setUserRole(response.data.user.role);
      setToken(response.data.token);
      
      // Token'i localStorage'a kaydet
      localStorage.setItem('auth_token', response.data.token);
      
      console.log('✅ Login successful:', response.data.user.email);
      return { data: { user: response.data.user }, error: null };
      
    } catch (error) {
      console.error('❌ Login failed:', error.message);
      return { 
        data: null, 
        error: { message: error.message } 
      };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData) => {
    console.log('📝 API sign up attempt:', userData.email);
    setLoading(true);
    
    try {
      const response = await apiClient.register(userData);
      
      setUser(response.data.user);
      setUserRole(response.data.user.role);
      setToken(response.data.token);
      
      // Token'i localStorage'a kaydet
      localStorage.setItem('auth_token', response.data.token);
      
      console.log('✅ Registration successful:', response.data.user.email);
      return { data: { user: response.data.user }, error: null };
      
    } catch (error) {
      console.error('❌ Registration failed:', error.message);
      return { 
        data: null, 
        error: { message: error.message } 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    console.log('🚪 Signing out...');
    setUser(null);
    setUserRole(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    return { error: null };
  };

  const isAuthenticated = () => {
    return !!user && !!token;
  };

  const isAdmin = () => {
    return userRole === 'admin' || userRole === 'super_admin';
  };

  const value = {
    user,
    userRole,
    loading,
    token,
    signIn,
    signUp,
    signOut,
    isAuthenticated,
    isAdmin
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
export default AuthProvider;