import React, { createContext, useContext, useState, useEffect } from 'react';
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
        const savedUser = localStorage.getItem('auth_user');
        
        if (savedToken && savedUser) {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setUserRole(userData.role);
          setToken(savedToken);
          console.log('✅ Auto-login successful:', userData.email);
        }
      } catch (error) {
        console.error('❌ Auto-login failed:', error.message);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
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
      
      if (!response.success) {
        throw new Error(response.error || 'Login failed');
      }
      
      const userData = response.data.user;
      setUser(userData);
      setUserRole(userData.role);
      
      // LocalStorage'a kaydet
      localStorage.setItem('auth_token', 'demo-token-' + userData.id);
      localStorage.setItem('auth_user', JSON.stringify(userData));
      
      console.log('✅ Login successful:', userData.email);
      return { data: { user: userData }, error: null };
      
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
      
      if (!response.success) {
        throw new Error(response.error || 'Registration failed');
      }
      
      setUser(response.data.user);
      setUserRole(response.data.user.role);
      // Token yok, sadece user data var
      
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
    localStorage.removeItem('auth_user');
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