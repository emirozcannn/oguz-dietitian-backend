// Frontend API client - tarayıcıda çalışır, jsonwebtoken kullanmaz

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiClient {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // body objesi varsa JSON.stringify yap
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'API endpoint bulunamadı' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error.message);
      throw error;
    }
  }

  // 🔹 Auth endpoints
  async login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
  }

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: userData
    });
  }

  async getProfile(userId) {
    return this.request(`/auth/profile/${userId}`);
  }

  // 🔹 Packages endpoints
  async getPackages(language = 'tr') {
    return this.request(`/packages?language=${language}`);
  }

  async getPopularPackages(language = 'tr') {
    return this.request(`/packages/popular?language=${language}`);
  }

  async getHomeFeaturedPackages(language = 'tr') {
    return this.request(`/packages/home-featured?language=${language}`);
  }

  // 🔹 Testimonials endpoints
  async getApprovedTestimonials(language = 'tr', limit = null) {
    const params = new URLSearchParams({ language });
    if (limit) params.append('limit', limit);
    return this.request(`/testimonials/approved?${params}`);
  }

  // 🔹 Blog endpoints
  async getAllPosts(language = 'tr', limit = null, categories = null, status = 'all') {
    const params = new URLSearchParams({
      language,
      ...(limit && { limit }),
      ...(categories && { categories }),
      ...(status && { status })
    });
    
    const response = await this.request(`/blog?${params}`);
    if (!response.success) {
      throw new Error(response.message || 'Blog yazıları alınamadı');
    }
    return response;
  }

  async getPublishedPosts(language = 'tr', limit = null, categories = null) {
    const params = new URLSearchParams({
      language,
      ...(limit && { limit }),
      ...(categories && { categories })
    });
    
    return this.request(`/blog/published?${params}`);
  }

  async getFeaturedPosts(language = 'tr', limit = 3) {
    return this.request(`/blog/featured?language=${language}&limit=${limit}`);
  }

  async getPopularPosts(language = 'tr', limit = 5) {
    return this.request(`/blog/popular?language=${language}&limit=${limit}`);
  }

  async getPostBySlug(slug, language = 'tr') {
    return this.request(`/blog/post/${slug}?language=${language}`);
  }

  async getPostById(id) {
    return this.request(`/blog/${id}`);
  }

  // Create new blog post
  async createPost(postData) {
    try {
      console.log('Creating post with data:', postData);
      
      // Validate required fields
      if (!postData.title_tr || !postData.title_en) {
        throw new Error('Başlık gerekli (hem Türkçe hem İngilizce)');
      }
      
      if (!postData.content_tr || !postData.content_en) {
        throw new Error('İçerik gerekli (hem Türkçe hem İngilizce)');
      }

      // Transform data to match backend expectations
      const transformedData = {
        title: {
          tr: postData.title_tr,
          en: postData.title_en
        },
        slug: {
          tr: postData.slug_tr || this.generateSlug(postData.title_tr),
          en: postData.slug_en || this.generateSlug(postData.title_en)
        },
        content: {
          tr: postData.content_tr,
          en: postData.content_en
        },
        excerpt: {
          tr: postData.excerpt_tr || '',
          en: postData.excerpt_en || ''
        },
        imageUrl: postData.featured_image || '',
        imageAltText: {
          tr: postData.image_alt_tr || '',
          en: postData.image_alt_en || ''
        },
        status: postData.status || 'draft',
        isFeatured: Boolean(postData.is_featured),
        allowComments: postData.allow_comments !== false,
        readTime: parseInt(postData.read_time) || 5,
        authorId: postData.authorId || '674bc89c5fc7529b6a2b3c3b',
        // Categories geçici olarak boş bırak
        categories: [],
        tags: {
          tr: Array.isArray(postData.tags_tr) ? postData.tags_tr : 
              (typeof postData.tags_tr === 'string' ? postData.tags_tr.split(',').map(t => t.trim()).filter(t => t) : []),
          en: Array.isArray(postData.tags_en) ? postData.tags_en : 
              (typeof postData.tags_en === 'string' ? postData.tags_en.split(',').map(t => t.trim()).filter(t => t) : [])
        },
        metaTitle: {
          tr: postData.meta_title_tr || '',
          en: postData.meta_title_en || ''
        },
        metaDescription: {
          tr: postData.meta_description_tr || '',
          en: postData.meta_description_en || ''
        }
      };

      console.log('Transformed data:', transformedData);

      const response = await this.request('/blog', {
        method: 'POST',
        body: transformedData
      });
      
      console.log('Create post response:', response);
      
      return { success: true, data: response };
    } catch (error) {
      console.error('Create post error:', error);
      return { success: false, error: error.message };
    }
  }

  // Helper function to generate slug
  generateSlug(text) {
    if (!text) return '';
    return text
      .toLowerCase()
      .replace(/[çÇ]/g, 'c')
      .replace(/[ğĞ]/g, 'g')
      .replace(/[ıI]/g, 'i')
      .replace(/[öÖ]/g, 'o')
      .replace(/[şŞ]/g, 's')
      .replace(/[üÜ]/g, 'u')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim() + '-' + Date.now();
  }

  // Update existing blog post
  async updatePost(id, postData) {
    try {
      console.log('Updating post:', id, 'with data:', postData);
      
      const response = await this.request(`/blog/${id}`, {
        method: 'PUT',
        body: postData
      });
      console.log('Update post response:', response);
      
      return { success: true, data: response };
    } catch (error) {
      console.error('Update post error:', error);
      return { success: false, error: error.message };
    }
  }

  async deletePost(id) {
    const response = await this.request(`/blog/${id}`, {
      method: 'DELETE'
    });
    if (!response.success) throw new Error(response.message || 'Blog yazısı silinemedi');
    return response;
  }

  // 🔹 Generic HTTP methods
  async get(endpoint) {
    return this.request(endpoint);
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: data
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data
    });
  }

  async patch(endpoint, data) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE'
    });
  }

  // 🔹 Blog extra endpoints
  async incrementPostView(postId) {
    return this.request(`/blog/${postId}/view`, { method: 'POST' });
  }

  async getRelatedPosts(postId, language = 'tr') {
    return this.request(`/blog/${postId}/related?language=${language}`);
  }

  async likePost(postId) {
    return this.request(`/blog/${postId}/like`, { method: 'POST' });
  }

  async getCategories() {
    return this.request('/categories');
  }
}

// Singleton instance
const apiClient = new ApiClient();
export default apiClient;
