// Frontend API client

// Import fallback data
import { 
  fallbackBlogPosts, 
  fallbackPackages, 
  fallbackTestimonials, 
  fallbackFAQ,
  fallbackContactInfo 
} from './fallback-data.js';

// Environment-based API URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (
  import.meta.env.MODE === 'development' 
    ? 'http://localhost:3001'  // Local backend
    : 'https://oguz-dietitian-backend.vercel.app'  // Production backend on Vercel
);

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
    console.log(`🔗 API Base URL: ${this.baseURL} (Mode: ${import.meta.env.MODE})`);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      console.log(`🌐 API Request: ${config.method} ${url}`);
      const response = await fetch(url, config);
      
      if (!response.ok) {
        console.error(`❌ API Error: ${response.status} for ${endpoint}`);
        throw new Error(`Backend unavailable (${response.status}): ${endpoint}`);
      }

      const data = await response.json();
      console.log(`✅ API Success: ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`🚨 API Unavailable (${endpoint}):`, error.message);
      
      // Return fallback data based on endpoint
      return this.getFallbackData(endpoint);
    }
  }

  // Generic GET method for backward compatibility
  async get(endpoint) {
    return await this.request(endpoint);
  }

  // Get fallback data based on endpoint
  getFallbackData(endpoint) {
    console.log(`📦 Using fallback data for: ${endpoint}`);
    
    // Blog endpoints
    if (endpoint.includes('/api/blog')) {
      if (endpoint.includes('type=featured')) {
        return {
          success: true,
          data: { posts: fallbackBlogPosts.slice(0, 3) },
          message: 'Fallback data loaded'
        };
      }
      return {
        success: true,
        data: { 
          posts: fallbackBlogPosts,
          pagination: { page: 1, limit: 10, total: fallbackBlogPosts.length, pages: 1 }
        },
        message: 'Fallback data loaded'
      };
    }
    
    // Package endpoints
    if (endpoint.includes('/api/packages')) {
      return {
        success: true,
        data: { packages: fallbackPackages },
        message: 'Fallback data loaded'
      };
    }
    
    // Testimonials endpoints
    if (endpoint.includes('/api/testimonials')) {
      return {
        success: true,
        data: { testimonials: fallbackTestimonials },
        message: 'Fallback data loaded'
      };
    }
    
    // FAQ endpoints
    if (endpoint.includes('/api/faq')) {
      return {
        success: true,
        data: { faq: fallbackFAQ },
        message: 'Fallback data loaded'
      };
    }
    
    // Contact endpoints
    if (endpoint.includes('/api/contact/info')) {
      return {
        success: true,
        data: fallbackContactInfo,
        message: 'Fallback data loaded'
      };
    }
    
    // Categories endpoints
    if (endpoint.includes('/api/categories')) {
      return {
        success: true,
        data: { categories: [] },
        message: 'Fallback data loaded'
      };
    }
    
    // Health check
    if (endpoint.includes('/api/health')) {
      return {
        success: false,
        error: 'Backend unavailable',
        message: 'Using fallback mode'
      };
    }
    
    // Default fallback
    throw new Error(`Backend unavailable: ${endpoint}`);
  }

  // Auth endpoints
  async login(email, password) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: { email, password }
    });
  }

  async register(userData) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: userData
    });
  }

  async getMe() {
    return this.request('/api/auth/me');
  }

  async updateProfile(profileData) {
    return this.request('/api/auth/profile', {
      method: 'PUT',
      body: profileData
    });
  }

  async changePassword(passwordData) {
    return this.request('/api/auth/change-password', {
      method: 'PUT',
      body: passwordData
    });
  }

  async forgotPassword(email) {
    return this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: { email }
    });
  }

  async resetPassword(token, newPassword) {
    return this.request('/api/auth/reset-password', {
      method: 'POST',
      body: { token, newPassword }
    });
  }

  // Blog endpoints
  async getFeaturedPosts(language = 'tr', limit = 3) {
    return this.request(`/api/blog?type=featured&language=${language}&limit=${limit}`);
  }

  async getAllPosts(language = 'tr', category = null, page = 1, status = 'published') {
    const params = new URLSearchParams({ language, page, status });
    if (category) params.append('category', category);
    return this.request(`/api/blog?${params}`);
  }

  // Admin-specific method for getting all posts (including drafts)
  async getAllPostsAdmin(status = 'all', page = 1, limit = 20, search = '') {
    const params = new URLSearchParams({ status, page, limit });
    if (search) params.append('search', search);
    return this.request(`/api/admin/blog?${params}`);
  }

  async getPostBySlug(slug, language = 'tr') {
    return this.request(`/api/blog/${slug}?language=${language}`);
  }

  async createPost(postData) {
    return this.request('/api/admin/blog', {
      method: 'POST',
      body: postData
    });
  }

  async updatePost(id, postData) {
    return this.request(`/api/admin/blog/${id}`, {
      method: 'PUT',
      body: postData
    });
  }

  async deletePost(id) {
    return this.request(`/api/admin/blog/${id}`, {
      method: 'DELETE'
    });
  }

  // Categories endpoints
  async getCategories(language = 'tr') {
    return this.request(`/api/categories?language=${language}`);
  }

  async createCategory(categoryData) {
    return this.request('/api/categories', {
      method: 'POST',
      body: categoryData
    });
  }

  async updateCategory(id, categoryData) {
    return this.request(`/api/categories/${id}`, {
      method: 'PUT',
      body: categoryData
    });
  }

  async deleteCategory(id) {
    return this.request(`/api/categories/${id}`, {
      method: 'DELETE'
    });
  }

  // Packages endpoints
  async getPackages(language = 'tr', category = null, type = null) {
    const params = new URLSearchParams({ language });
    if (category) params.append('category', category);
    if (type) params.append('type', type);
    return this.request(`/api/packages?${params}`);
  }

  async getHomeFeaturedPackages(language = 'tr') {
    return this.request(`/api/packages?type=home-featured&language=${language}`);
  }

  async getPackageById(id, language = 'tr') {
    return this.request(`/api/packages/${id}?language=${language}`);
  }

  async createPackage(packageData) {
    return this.request('/api/packages', {
      method: 'POST',
      body: packageData
    });
  }

  async updatePackage(id, packageData) {
    return this.request(`/api/packages/${id}`, {
      method: 'PUT',
      body: packageData
    });
  }

  async deletePackage(id) {
    return this.request(`/api/packages/${id}`, {
      method: 'DELETE'
    });
  }

  // Testimonials endpoints
  async getApprovedTestimonials(language = 'tr', limit = null) {
    const params = new URLSearchParams({ language, type: 'approved' });
    if (limit) params.append('limit', limit);
    return this.request(`/api/testimonials?${params}`);
  }

  async createTestimonial(testimonialData) {
    return this.request('/api/testimonials', {
      method: 'POST',
      body: testimonialData
    });
  }

  async getAllTestimonials(status = null, page = 1) {
    const params = new URLSearchParams({ page });
    if (status) params.append('status', status);
    return this.request(`/api/testimonials/admin/all?${params}`);
  }

  async updateTestimonialStatus(id, status, isVisible) {
    return this.request(`/api/testimonials/${id}/status`, {
      method: 'PUT',
      body: { status, isVisible }
    });
  }

  async deleteTestimonial(id) {
    return this.request(`/api/testimonials/${id}`, {
      method: 'DELETE'
    });
  }

  // FAQ endpoints
  async getFAQ(language = 'tr') {
    return this.request(`/api/faq?language=${language}`);
  }

  async getFAQItems(language = 'tr') {
    return this.request(`/api/faq?language=${language}`);
  }

  async getFAQCategories(language = 'tr') {
    return this.request(`/api/faq/categories?language=${language}`);
  }

  async createFAQCategory(categoryData) {
    return this.request('/api/faq/categories', {
      method: 'POST',
      body: categoryData
    });
  }

  async createFAQItem(itemData) {
    return this.request('/api/faq/items', {
      method: 'POST',
      body: itemData
    });
  }

  async updateFAQCategory(id, categoryData) {
    return this.request(`/api/faq/categories/${id}`, {
      method: 'PUT',
      body: categoryData
    });
  }

  async updateFAQItem(id, itemData) {
    return this.request(`/api/faq/items/${id}`, {
      method: 'PUT',
      body: itemData
    });
  }

  async deleteFAQCategory(id) {
    return this.request(`/api/faq/categories/${id}`, {
      method: 'DELETE'
    });
  }

  async deleteFAQItem(id) {
    return this.request(`/api/faq/items/${id}`, {
      method: 'DELETE'
    });
  }

  // Contact endpoints
  async submitContact(contactData) {
    return this.request('/api/contact', {
      method: 'POST',
      body: contactData
    });
  }

  async getContactInfo(language = 'tr') {
    return this.request(`/api/contact/info?language=${language}`);
  }

  async getContactMessages(status = null, page = 1) {
    const params = new URLSearchParams({ page });
    if (status) params.append('status', status);
    return this.request(`/api/contact/admin/messages?${params}`);
  }

  async updateContactMessage(id, status, reply = null) {
    return this.request(`/api/contact/admin/messages/${id}`, {
      method: 'PUT',
      body: { status, reply }
    });
  }

  async deleteContactMessage(id) {
    return this.request(`/api/contact/admin/messages/${id}`, {
      method: 'DELETE'
    });
  }

  // Upload endpoints
  async uploadImage(image, type = 'general') {
    return this.request('/api/upload/image', {
      method: 'POST',
      body: { image, type }
    });
  }

  async uploadImages(images, type = 'general') {
    return this.request('/api/upload/images', {
      method: 'POST',
      body: { images, type }
    });
  }

  // Admin endpoints
  async getDashboardStats() {
    return this.request('/api/admin/dashboard');
  }

  async getUsers(role = null, status = null, page = 1) {
    const params = new URLSearchParams({ page });
    if (role) params.append('role', role);
    if (status) params.append('status', status);
    return this.request(`/api/admin/users?${params}`);
  }

  async updateUserStatus(id, isActive, role = null) {
    return this.request(`/api/admin/users/${id}/status`, {
      method: 'PUT',
      body: { isActive, role }
    });
  }

  async deleteUser(id) {
    return this.request(`/api/admin/users/${id}`, {
      method: 'DELETE'
    });
  }

  async bulkAction(action, type, ids) {
    return this.request('/api/admin/bulk-action', {
      method: 'POST',
      body: { action, type, ids }
    });
  }

  // Health check
  async getHealth() {
    return this.request('/api/health');
  }

  // Legacy methods for backward compatibility
  async getHomeContent(language = 'tr') {
    // This will use packages, testimonials, and blog posts
    const [packages, testimonials, posts] = await Promise.all([
      this.getHomeFeaturedPackages(language),
      this.getApprovedTestimonials(language, 6),
      this.getFeaturedPosts(language, 3)
    ]);

    return {
      success: true,
      data: {
        packages: packages.data?.packages || [],
        testimonials: testimonials.data?.testimonials || [],
        posts: posts.data?.posts || []
      }
    };
  }

  async getAboutContent(language = 'tr') {
    // Return static about content for now
    return {
      success: true,
      data: {
        title: language === 'en' ? 'About Oğuz Yolyapan' : 'Oğuz Yolyapan Hakkında',
        content: language === 'en' 
          ? 'Expert Dietitian with years of experience...'
          : 'Uzman Diyetisyen, yıllarca deneyim...'
      }
    };
  }
}

// Singleton instance
const apiClient = new ApiClient();
export default apiClient;
