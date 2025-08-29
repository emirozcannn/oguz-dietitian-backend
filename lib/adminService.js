import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';

// Admin işlemleri için Supabase client (service role kullanır)
// Bu fonksiyonlar sadece admin panelden çağrılmalı
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

let supabaseAdmin = null;

if (supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

// Admin user operations
export const adminUserService = {
  // List all users
  async listUsers() {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) throw error;
      return data;
    } else {
      // Fallback: Use regular client (limited functionality)
      // This will only work if user has admin access in RLS
      const { data, error } = await supabase.auth.admin.listUsers();
      if (error) throw error;
      return data;
    }
  },

  // Create user
  async createUser(userData) {
    if (supabaseAdmin) {
      // Use Supabase Auth admin API
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: userData.user_metadata,
        email_confirm: true
      });
      
      if (error) throw error;
      return data;
    } else {
      // Fallback: Use regular client
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: userData.user_metadata,
        email_confirm: true
      });
      
      if (error) throw error;
      return data;
    }
  },

  // Update user
  async updateUser(userId, updates) {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, updates);
      if (error) throw error;
      return data;
    } else {
      // Fallback: Use regular client
      const { data, error } = await supabase.auth.admin.updateUserById(userId, updates);
      if (error) throw error;
      return data;
    }
  },

  // Delete user
  async deleteUser(userId) {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.auth.admin.deleteUser(userId);
      if (error) throw error;
      return data;
    } else {
      // Fallback: Use regular client
      const { data, error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      return data;
    }
  },

  // Get user by ID
  async getUserById(userId) {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId);
      if (error) throw error;
      return data;
    } else {
      // Fallback: Use regular client
      const { data, error } = await supabase.auth.admin.getUserById(userId);
      if (error) throw error;
      return data;
    }
  }
};

// Fallback to regular user query if admin not available
export const regularUserService = {
  // Bu servis normal kullanıcı tablosundan veri çeker (limited)
  async getUsers() {
    // Bu implementation daha sonra profiles tablosu oluşturulduğunda kullanılabilir
    throw new Error('Regular user service not implemented yet');
  }
};

export default supabaseAdmin;
