// Frontend API client

const API_BASE_URL = 'https://oguz-dietitian-backend.vercel.app';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
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
        console.error(`❌ API Error: ${response.status}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`✅ API Success: ${endpoint}`);
      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error.message);
      throw error;
    }
  }

  // Blog endpoints
  async getFeaturedPosts(language = 'tr', limit = 3) {
    return this.request(`/api/blog?type=featured&language=${language}&limit=${limit}`);
  }

  async getAllPosts(language = 'tr') {
    return this.request(`/api/blog?language=${language}`);
  }

  // Categories endpoints
  async getCategories() {
    return this.request('/api/categories');
  }

  // Packages endpoints
  async getPackages(language = 'tr') {
    return this.request(`/api/packages?language=${language}`);
  }

  async getHomeFeaturedPackages(language = 'tr') {
    return this.request(`/api/packages?type=home-featured&language=${language}`);
  }

  // Testimonials endpoints
  async getApprovedTestimonials(language = 'tr', limit = null) {
    const params = new URLSearchParams({ language, type: 'approved' });
    if (limit) params.append('limit', limit);
    return this.request(`/api/testimonials?${params}`);
  }

  // FAQ endpoints
  async getFAQItems(language = 'tr') {
    return this.request(`/api/faq?language=${language}`);
  }

  // Health check
  async getHealth() {
    return this.request('/api/health');
  }
}

// Singleton instance
const apiClient = new ApiClient();
export default apiClient;
