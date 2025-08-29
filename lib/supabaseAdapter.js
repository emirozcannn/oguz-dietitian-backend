// MongoDB Migration Adapter
// Bu dosya Supabase'den MongoDB'ye geçiş sırasında kullanılır

import mongoClient from './mongoClient.js';

// Supabase-compatible interface for smooth migration
export const supabase = {
  // Auth operations
  auth: {
    signInWithPassword: async ({ email, password }) => {
      try {
        const result = await mongoClient.auth.login(email, password);
        return {
          data: result,
          error: null
        };
      } catch (error) {
        return {
          data: null,
          error: { message: error.message }
        };
      }
    },

    signUp: async ({ email, password, options = {} }) => {
      try {
        const userData = {
          email,
          password,
          firstName: options.data?.firstName || '',
          lastName: options.data?.lastName || '',
          phone: options.data?.phone || ''
        };
        
        const result = await mongoClient.auth.register(userData);
        return {
          data: result,
          error: null
        };
      } catch (error) {
        return {
          data: null,
          error: { message: error.message }
        };
      }
    },

    signOut: async () => {
      localStorage.removeItem('auth_token');
      return { error: null };
    },

    getUser: async () => {
      try {
        const token = localStorage.getItem('auth_token');
        if (!token) {
          return { data: { user: null }, error: null };
        }

        const decoded = mongoClient.auth.verifyToken(token);
        const user = await mongoClient.auth.getUser(decoded.userId);
        
        return {
          data: { user },
          error: null
        };
      } catch (error) {
        return {
          data: { user: null },
          error: { message: error.message }
        };
      }
    }
  },

  // Database operations with Supabase-like interface
  from: (table) => {
    return {
      select: (columns = '*') => ({
        eq: (field, value) => ({
          execute: async () => {
            try {
              let result;
              
              switch (table) {
                case 'packages':
                  result = await mongoClient.packages.getAll();
                  if (field && value) {
                    result = result.filter(item => item[field] === value);
                  }
                  break;
                  
                case 'testimonials':
                  result = await mongoClient.testimonials.getApproved();
                  if (field && value) {
                    result = result.filter(item => item[field] === value);
                  }
                  break;
                  
                case 'posts':
                  result = await mongoClient.blog.getPosts();
                  if (field && value) {
                    result = result.filter(item => item[field] === value);
                  }
                  break;
                  
                default:
                  result = [];
              }
              
              return { data: result, error: null };
            } catch (error) {
              return { data: null, error: { message: error.message } };
            }
          }
        }),
        
        limit: (count) => ({
          execute: async () => {
            try {
              let result;
              
              switch (table) {
                case 'packages':
                  result = await mongoClient.packages.getAll();
                  break;
                case 'testimonials':
                  result = await mongoClient.testimonials.getApproved('tr', count);
                  break;
                case 'posts':
                  result = await mongoClient.blog.getPosts('tr', count);
                  break;
                default:
                  result = [];
              }
              
              return { data: result, error: null };
            } catch (error) {
              return { data: null, error: { message: error.message } };
            }
          }
        }),

        execute: async () => {
          try {
            let result;
            
            switch (table) {
              case 'packages':
                result = await mongoClient.packages.getAll();
                break;
              case 'testimonials':
                result = await mongoClient.testimonials.getApproved();
                break;
              case 'posts':
                result = await mongoClient.blog.getPosts();
                break;
              default:
                result = [];
            }
            
            return { data: result, error: null };
          } catch (error) {
            return { data: null, error: { message: error.message } };
          }
        }
      }),

      insert: (data) => ({
        execute: async () => {
          try {
            let result;
            
            switch (table) {
              case 'testimonials':
                result = await mongoClient.testimonials.create(data);
                break;
              case 'packages':
                result = await mongoClient.packages.create(data);
                break;
              case 'posts':
                result = await mongoClient.blog.create(data);
                break;
              default:
                throw new Error(`Insert operation not supported for table: ${table}`);
            }
            
            return { data: result, error: null };
          } catch (error) {
            return { data: null, error: { message: error.message } };
          }
        }
      }),

      update: (data) => ({
        eq: (field, value) => ({
          execute: async () => {
            try {
              let result;
              
              switch (table) {
                case 'packages':
                  result = await mongoClient.packages.update(value, data);
                  break;
                case 'testimonials':
                  if (data.status === 'approved') {
                    result = await mongoClient.testimonials.approve(value);
                  } else if (data.status === 'rejected') {
                    result = await mongoClient.testimonials.reject(value, data.moderationNotes);
                  }
                  break;
                case 'posts':
                  result = await mongoClient.blog.update(value, data);
                  break;
                default:
                  throw new Error(`Update operation not supported for table: ${table}`);
              }
              
              return { data: result, error: null };
            } catch (error) {
              return { data: null, error: { message: error.message } };
            }
          }
        })
      }),

      delete: () => ({
        eq: (field, value) => ({
          execute: async () => {
            try {
              let result;
              
              switch (table) {
                case 'packages':
                  result = await mongoClient.packages.delete(value);
                  break;
                default:
                  throw new Error(`Delete operation not supported for table: ${table}`);
              }
              
              return { data: result, error: null };
            } catch (error) {
              return { data: null, error: { message: error.message } };
            }
          }
        })
      })
    };
  }
};

// Backward compatibility exports
export const signInWithCredentials = supabase.auth.signInWithPassword;
export const signOut = supabase.auth.signOut;
export const isAuthenticated = async () => {
  const { data } = await supabase.auth.getUser();
  return !!data.user;
};

export default supabase;
