import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pzcikukgyeddntwyldpg.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6Y2lrdWtneWVkZG50d3lsZHBnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMDgxMjEsImV4cCI6MjA3MTc4NDEyMX0.hQNh2A3se9XYJ6c32TlT-2f7b4zW91Gn5uivjJEt6Ww';

// Debug: Environment variables kontrol
console.log('🔧 Environment check:', {
  url: supabaseUrl,
  hasEnvUrl: !!import.meta.env.VITE_SUPABASE_URL,
  hasEnvKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY
});

// Create a single instance
let supabaseInstance = null;

const getSupabaseClient = () => {
  if (!supabaseInstance) {
    console.log('🔗 Supabase client initializing with:', {
      url: supabaseUrl,
      hasKey: !!supabaseAnonKey
    });

    // Tarayıcıda mı kontrolü
    const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        ...(isBrowser && {
          storage: window.localStorage,
          storageKey: 'sb-oguz-auth-token'
        })
      },
      db: {
        schema: 'public' // Bu satırı ekleyin
      }
    });
  }
  return supabaseInstance;
};

export const supabase = getSupabaseClient();

// Simple auth helper for admin panel
export const signInWithCredentials = async (email, password) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

// Sign out helper
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Sign out error:', error);
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return !!user;
  } catch {
    return false;
  }
};

// Connection test log (run once)
let connectionTested = false;

const testConnection = () => {
  if (!connectionTested) {
    connectionTested = true;
    
    // Testimonials tablosunu test et
    supabase
      .from('testimonials')
      .select('id')
      .limit(1)
      .then(({ data, error }) => {
        if (error) {
          console.error('❌ Testimonials bağlantı hatası:', error.message);
        } else {
          console.log('✅ Testimonials bağlantısı başarılı!', data);
        }
      });
      
    // Packages tablosunu da test et
    supabase
      .from('packages')
      .select('id')
      .limit(1)
      .then((result) => {
        const { data, error } = result;
        if (error) {
          console.error('❌ Packages bağlantı hatası:', error.message);
        } else {
          console.log('✅ Packages bağlantısı başarılı!', data);
        }
      });
  }
};

// Test connection
testConnection();