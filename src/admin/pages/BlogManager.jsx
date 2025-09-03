import React, { useState, useEffect, useCallback, useMemo } from 'react';
import apiClient from '../../lib/api.js';
import { useTranslation } from 'react-i18next';
import { Toast, ToastContainer } from 'react-bootstrap';

const BlogManager = () => {
  const { i18n } = useTranslation();
  
  // State management
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const [wordCount, setWordCount] = useState({ tr: 0, en: 0 });
  const [currentPage, setCurrentPage] = useState(1);
  const [postsPerPage] = useState(10);
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState('desc');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    featured: 0
  });

  // Comprehensive form state
  const [formData, setFormData] = useState({
    title_tr: '',
    title_en: '',
    slug_tr: '',
    slug_en: '',
    content_tr: '',
    content_en: '',
    excerpt_tr: '',
    excerpt_en: '',
    featured_image: '',
    thumbnail: '',
    image_alt_tr: '',
    image_alt_en: '',
    category_id: '',
    tags_tr: [],
    tags_en: [],
    meta_title_tr: '',
    meta_title_en: '',
    meta_description_tr: '',
    meta_description_en: '',
    meta_keywords_tr: '',
    meta_keywords_en: '',
    status: 'draft',
    is_featured: false,
    published_at: '',
    scheduled_at: '',
    author_name: 'Oğuz Yolyapan',
    author_bio_tr: '',
    author_bio_en: '',
    author_image: '',
    read_time: 5,
    seo_focus_keyword_tr: '',
    seo_focus_keyword_en: '',
    allow_comments: true,
    custom_css: '',
    custom_js: ''
  });

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 4000);
  };

  // Form validation helper
  const validateForm = (data) => {
    const errors = [];
    
    // Required fields
    if (!data.title_tr?.trim()) errors.push('Türkçe başlık gereklidir');
    if (!data.title_en?.trim()) errors.push('İngilizce başlık gereklidir');
    if (!data.content_tr?.trim()) errors.push('Türkçe içerik gereklidir');
    if (!data.content_en?.trim()) errors.push('İngilizce içerik gereklidir');
    if (!data.excerpt_tr?.trim()) errors.push('Türkçe özet gereklidir');
    if (!data.excerpt_en?.trim()) errors.push('İngilizce özet gereklidir');
    if (!data.category_id?.trim()) errors.push('Kategori seçimi zorunludur');
    
    // Length validations
    if (data.meta_title_tr && data.meta_title_tr.length > 60) {
      errors.push('Türkçe meta başlık 60 karakterden uzun olamaz');
    }
    if (data.meta_title_en && data.meta_title_en.length > 60) {
      errors.push('İngilizce meta başlık 60 karakterden uzun olamaz');
    }
    
    // Content length validation
    if (data.content_tr && data.content_tr.trim().split(/\s+/).length < 50) {
      errors.push('Türkçe içerik en az 50 kelime olmalıdır');
    }
    if (data.content_en && data.content_en.trim().split(/\s+/).length < 50) {
      errors.push('İngilizce içerik en az 50 kelime olmalıdır');
    }
    
    return errors;
  };

  // Calculate word count
  const calculateWordCount = useCallback((text) => {
    if (!text) return 0;
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }, []);

  // Calculate read time based on word count (SINGLE DECLARATION)
  const calculateReadTime = useCallback((wordCount) => {
    const wordsPerMinute = 200;
    return Math.ceil(wordCount / wordsPerMinute) || 1;
  }, []);

  // Update word count when content changes
  useEffect(() => {
    setWordCount({
      tr: calculateWordCount(formData.content_tr),
      en: calculateWordCount(formData.content_en)
    });
  }, [formData.content_tr, formData.content_en, calculateWordCount]);

  // Optimized filtered and sorted posts with useMemo
  const filteredAndSortedPosts = useMemo(() => {
    const filtered = posts.filter(post => {
      const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
      const matchesSearch = !searchTerm || 
        (post.title_tr && post.title_tr.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (post.title_en && post.title_en.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (post.excerpt_tr && post.excerpt_tr.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (post.excerpt_en && post.excerpt_en.toLowerCase().includes(searchTerm.toLowerCase()));
      
      return matchesStatus && matchesSearch;
    });

    return [...filtered].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      if (sortField === 'created_at' || sortField === 'published_at') {
        aValue = new Date(aValue || 0);
        bValue = new Date(bValue || 0);
      }
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [posts, filterStatus, searchTerm, sortField, sortDirection]);

  const paginatedPosts = useMemo(() => {
    const startIndex = (currentPage - 1) * postsPerPage;
    return filteredAndSortedPosts.slice(startIndex, startIndex + postsPerPage);
  }, [filteredAndSortedPosts, currentPage, postsPerPage]);

  const totalPages = useMemo(() => {
    return Math.ceil(filteredAndSortedPosts.length / postsPerPage);
  }, [filteredAndSortedPosts.length, postsPerPage]);

  // Load functions
  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Geçici olarak normal blog endpoint'ini kullan (admin endpoint yerine)
      const response = await apiClient.getAllPosts('tr', null, 1, filterStatus === 'all' ? 'published' : filterStatus);
      
      if (!response || !response.success) {
        throw new Error(response?.message || 'Veri alınamadı');
      }
      
      // Backend'den gelen veri yapısı: { posts: [...], pagination: {...} }
      const postsData = Array.isArray(response.data?.posts) ? response.data.posts : 
                       Array.isArray(response.data) ? response.data : [];
      setPosts(postsData);
      
      // Update stats
      setStats({
        total: postsData.length,
        published: postsData.filter(p => p.status === 'published').length,
        draft: postsData.filter(p => p.status === 'draft').length,
        featured: postsData.filter(p => p.is_featured).length
      });
    } catch (error) {
      console.error('Error loading posts:', error);
      setError(error.message);
      setPosts([]);
      setStats({ total: 0, published: 0, draft: 0, featured: 0 });
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  const loadCategories = async () => {
    try {
      const response = await apiClient.getCategories();
      
      if (response.success) {
        // Backend'den gelen veri yapısı: { categories: [...] } veya doğrudan array
        const categoriesData = Array.isArray(response.data?.categories) ? response.data.categories : 
                              Array.isArray(response.data) ? response.data : [];
        setCategories(categoriesData);
      } else {
        // Fallback to demo categories if API fails
        setCategories([
          {
            _id: '1',
            name: { tr: 'Genel Beslenme', en: 'General Nutrition' },
            color: '#28a745',
            icon: 'leaf'
          },
          {
            _id: '2', 
            name: { tr: 'Kilo Yönetimi', en: 'Weight Management' },
            color: '#007bff',
            icon: 'scale'
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
      // Set fallback categories
      setCategories([
        {
          _id: '1',
          name: { tr: 'Genel Beslenme', en: 'General Nutrition' },
          color: '#28a745',
          icon: 'leaf'
        }
      ]);
    }
  };

  // Load data on component mount
  useEffect(() => {
    let isMounted = true;
    
    const loadData = async () => {
      try {
        await loadPosts();
        if (isMounted) {
          await loadCategories();
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message);
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [loadPosts]);

  // Image upload function (FIXED STRUCTURE)
  const handleImageUpload = async (file) => {
    try {
      setUploadingImage(true);
      
      // Validate file
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      
      if (file.size > maxSize) {
        throw new Error('Dosya boyutu 5MB\'dan büyük olamaz');
      }
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Sadece JPEG, PNG ve WebP formatları desteklenir');
      }

      // Create preview URL  
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setFormData(prev => ({
          ...prev,
          featured_image: imageUrl,
          thumbnail: imageUrl,
          image_url: imageUrl
        }));
        showToast('Resim başarıyla yüklendi', 'success');
      };
      reader.readAsDataURL(file);

      return true;
    } catch (error) {
      console.error('Error uploading image:', error);
      showToast('Resim yükleme hatası: ' + error.message, 'error');
      return false;
    } finally {
      setUploadingImage(false);
    }
  };

  // Generate SEO-friendly slug
  const generateSlug = (title) => {
    return title
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
      .trim();
  };

  // Handle form changes with advanced validation
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      
      // Auto-generate slugs
      if (name === 'title_tr' && value) {
        setFormData(prev => ({ ...prev, slug_tr: generateSlug(value) }));
      } else if (name === 'title_en' && value) {
        setFormData(prev => ({ ...prev, slug_en: generateSlug(value) }));
      }
      
      // Auto-calculate read time
      if (name === 'content_tr' || name === 'content_en') {
        const newWordCount = calculateWordCount(value);
        const newReadTime = calculateReadTime(newWordCount);
        setFormData(prev => ({ ...prev, read_time: newReadTime }));
      }
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setFormData({
      title_tr: '',
      title_en: '',
      slug_tr: '',
      slug_en: '',
      content_tr: '',
      content_en: '',
      excerpt_tr: '',
      excerpt_en: '',
      featured_image: '',
      thumbnail: '',
      image_alt_tr: '',
      image_alt_en: '',
      category_id: '',
      tags_tr: [],
      tags_en: [],
      meta_title_tr: '',
      meta_title_en: '',
      meta_description_tr: '',
      meta_description_en: '',
      meta_keywords_tr: '',
      meta_keywords_en: '',
      status: 'draft',
      is_featured: false,
      published_at: '',
      scheduled_at: '',
      author_name: 'Oğuz Yolyapan',
      author_bio_tr: '',
      author_bio_en: '',
      author_image: '',
      read_time: 5,
      seo_focus_keyword_tr: '',
      seo_focus_keyword_en: '',
      allow_comments: true,
      custom_css: '',
      custom_js: ''
    });
    setEditingPost(null);
    setActiveTab('basic');
    setWordCount({ tr: 0, en: 0 });
  };

  // Submit function with proper status handling
  const handleSubmitWithStatus = async (dataWithStatus) => {
    try {
      setLoading(true);

      // Form validation
      const validationErrors = validateForm(dataWithStatus);
      if (validationErrors.length > 0) {
        showToast(`Validation errors: ${validationErrors.join(', ')}`, 'error');
        return;
      }

      // Veriyi düzgün formatta hazırla
      const formDataWithAuthor = {
        ...dataWithStatus,
        authorId: '674bc89c5fc7529b6a2b3c3b', // Admin user ID
        // Category'i backend'e gönder
        category: dataWithStatus.category_id 
      };

      console.log('Submitting form data:', formDataWithAuthor);

      let response;
      if (editingPost) {
        response = await apiClient.updatePost(editingPost.id || editingPost._id, formDataWithAuthor);
      } else {
        response = await apiClient.createPost(formDataWithAuthor);
      }

      console.log('API Response:', response);

      if (response.success) {
        showToast(
          editingPost 
            ? 'Blog yazısı başarıyla güncellendi!' 
            : 'Blog yazısı başarıyla oluşturuldu!', 
          'success'
        );
        
        setShowModal(false);
        resetForm();
        await loadPosts(); // Reload posts
      } else {
        console.error('API Error:', response.error);
        showToast(`Hata: ${response.error}`, 'error');
      }
    } catch (error) {
      console.error('Submit error:', error);
      showToast(`Bir hata oluştu: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit with proper data mapping
  const handleEdit = (post) => {
    setEditingPost(post);
    
    const formatDateForInput = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().slice(0, 16);
    };

    // Parse tags safely
    const parseTags = (tags) => {
      if (Array.isArray(tags)) return tags;
      if (typeof tags === 'string') {
        try {
          return JSON.parse(tags);
        } catch {
          return tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        }
      }
      return [];
    };

    setFormData({
      title_tr: post.title_tr || '',
      title_en: post.title_en || '',
      slug_tr: post.slug_tr || '',
      slug_en: post.slug_en || '',
      content_tr: post.content_tr || '',
      content_en: post.content_en || '',
      excerpt_tr: post.excerpt_tr || '',
      excerpt_en: post.excerpt_en || '',
      featured_image: post.featured_image || post.image_url || '',
      thumbnail: post.thumbnail || post.image_url || '',
      image_alt_tr: post.image_alt_tr || post.image_alt_text || '',
      image_alt_en: post.image_alt_en || post.image_alt_text || '',
      category_id: post.category_id || '',
      tags_tr: parseTags(post.tags_tr),
      tags_en: parseTags(post.tags_en),
      meta_title_tr: post.meta_title_tr || '',
      meta_title_en: post.meta_title_en || '',
      meta_description_tr: post.meta_description_tr || '',
      meta_description_en: post.meta_description_en || '',
      meta_keywords_tr: post.meta_keywords_tr || '',
      meta_keywords_en: post.meta_keywords_en || '',
      status: post.status || 'draft',
      is_featured: Boolean(post.is_featured),
      published_at: formatDateForInput(post.published_at),
      scheduled_at: formatDateForInput(post.scheduled_at),
      author_name: post.author_name || 'Oğuz Yolyapan',
      author_bio_tr: post.author_bio_tr || '',
      author_bio_en: post.author_bio_en || '',
      author_image: post.author_image || '',
      read_time: post.read_time || 5,
      seo_focus_keyword_tr: post.seo_focus_keyword_tr || '',
      seo_focus_keyword_en: post.seo_focus_keyword_en || '',
      allow_comments: post.allow_comments !== false,
      custom_css: post.custom_css || '',
      custom_js: post.custom_js || ''
    });
    setShowModal(true);
  };

  // Handle delete with confirmation
  const handleDelete = async (postId) => {
    if (!window.confirm('Bu yazıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) return;

    try {
      await apiClient.deletePost(postId);
      showToast('Blog yazısı başarıyla silindi', 'success');
      loadPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      showToast('Yazı silinirken hata oluştu: ' + error.message, 'error');
    }
  };

  // Toggle featured status
  const toggleFeatured = async (postId, currentStatus) => {
    try {
      const currentPost = posts.find(p => (p.id || p._id) === postId);
      if (!currentPost) return;

      const updateData = {
        ...currentPost,
        is_featured: !currentStatus,
        updated_at: new Date().toISOString()
      };

      await apiClient.updatePost(postId, updateData);
      showToast(`Yazı ${!currentStatus ? 'öne çıkan' : 'normal'} olarak işaretlendi`, 'success');
      loadPosts();
    } catch (error) {
      console.error('Error updating featured status:', error);
      showToast('Öne çıkan durumu güncellenirken hata oluştu', 'error');
    }
  };

  // Toggle publish status
  const togglePublish = async (postId, currentStatus) => {
    try {
      const currentPost = posts.find(p => (p.id || p._id) === postId);
      if (!currentPost) return;

      const newStatus = currentStatus === 'published' ? 'draft' : 'published';
      
      const updateData = {
        ...currentPost,
        status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'published') {
        updateData.published_at = new Date().toISOString();
      }

      await apiClient.updatePost(postId, updateData);
      showToast(`Yazı ${newStatus === 'published' ? 'yayınlandı' : 'taslak olarak kaydedildi'}`, 'success');
      loadPosts();
    } catch (error) {
      console.error('Error updating publish status:', error);
      showToast('Yayın durumu güncellenirken hata oluştu', 'error');
    }
  };

  // Utility functions
  const getStatusBadge = (status) => {
    const badges = {
      'published': 'bg-success',
      'draft': 'bg-secondary', 
      'scheduled': 'bg-info',
      'archived': 'bg-warning text-dark'
    };
    return badges[status] || 'bg-secondary';
  };

  const getStatusText = (status) => {
    const texts = {
      'published': 'Yayınlanmış',
      'draft': 'Taslak',
      'scheduled': 'Zamanlanmış',
      'archived': 'Arşivlenmiş'
    };
    return texts[status] || status;
  };

  // Error boundary UI
  if (error) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger" role="alert">
          <h4 className="alert-heading">Bir hata oluştu!</h4>
          <p>{error}</p>
          <hr />
          <button 
            className="btn btn-outline-danger"
            onClick={() => {
              setError(null);
              loadPosts();
            }}
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  // Loading spinner for early return
  if (loading && posts.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '500px' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Blog yazıları yükleniyor...</h5>
        </div>
      </div>
    );
  }

  // Main component return
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="h4 mb-0">
              <i className="bi bi-journal-text me-2"></i>
              Blog Yazıları
            </h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Yeni Yazı
            </button>
          </div>

          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label">Status</label>
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Tüm Durumlar</option>
                    <option value="published">Yayınlanmış</option>
                    <option value="draft">Taslak</option>
                    <option value="scheduled">Zamanlanmış</option>
                    <option value="archived">Arşivlenmiş</option>
                  </select>
                </div>
                <div className="col-md-8">
                  <label className="form-label">Arama</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Başlık ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Posts Table */}
          <div className="card">
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Görsel</th>
                      <th>Başlık</th>
                      <th>Kategori</th>
                      <th>Durum</th>
                      <th>Öne Çıkan</th>
                      <th>Görüntülenme</th>
                      <th>Beğeni</th>
                      <th>Yorum</th>
                      <th>Tarih</th>
                      <th>İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedPosts.map((post, index) => (
                      <tr key={post.id || post._id || `post-${index}`}>
                        <td>
                          {(post.thumbnail || post.featured_image) ? (
                            <img
                              src={post.thumbnail || post.featured_image}
                              alt={post.image_alt_tr || 'Blog görseli'}
                              className="rounded"
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              className="bg-light rounded d-flex align-items-center justify-content-center"
                              style={{ width: '50px', height: '50px' }}
                            >
                              <i className="bi bi-image text-muted"></i>
                            </div>
                          )}
                        </td>
                        <td>
                          <div>
                            <strong>{i18n.language === 'tr' ? post.title_tr : post.title_en}</strong>
                            <div className="text-muted small">
                              {i18n.language === 'tr' ? post.excerpt_tr : post.excerpt_en}
                            </div>
                          </div>
                        </td>
                        <td>
                          {post.categories && (
                            <span
                              className="badge"
                              style={{ backgroundColor: post.categories.color || '#28a745', color: 'white' }}
                            >
                              {post.categories.icon && (
                                <i className={`bi bi-${post.categories.icon} me-1`}></i>
                              )}
                              {i18n.language === 'tr' ? 
                                (post.categories.name_tr || post.categories.name?.tr || post.categories.name) : 
                                (post.categories.name_en || post.categories.name?.en || post.categories.name)
                              }
                            </span>
                          )}
                        </td>
                        <td>
                          <span className={`badge ${getStatusBadge(post.status)}`}>
                            {getStatusText(post.status)}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`btn btn-sm ${post.is_featured ? 'btn-warning' : 'btn-outline-warning'}`}
                            onClick={() => toggleFeatured(post.id || post._id, post.is_featured)}
                          >
                            <i className="bi bi-star"></i>
                          </button>
                        </td>
                        <td>
                          <span className="badge bg-info">{post.view_count || 0}</span>
                        </td>
                        <td>
                          <span className="badge bg-danger">{post.like_count || 0}</span>
                        </td>
                        <td>
                          <span className="badge bg-primary">{post.comment_count || 0}</span>
                        </td>
                        <td>
                          <small className="text-muted">
                            {new Date(post.created_at).toLocaleDateString('tr-TR')}
                          </small>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(post)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              type="button"
                              className={`btn btn-sm ${post.status === 'published' ? 'btn-outline-secondary' : 'btn-outline-success'}`}
                              onClick={() => togglePublish(post.id || post._id, post.status)}
                            >
                              <i className={`bi ${post.status === 'published' ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                            </button>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(post.id || post._id)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {paginatedPosts.length === 0 && (
                  <div className="text-center py-4">
                    <i className="bi bi-journal-x display-4 text-muted"></i>
                    <p className="text-muted mt-2">Henüz blog yazısı yok.</p>
                  </div>
                )}
              </div>

              {/* Add Pagination */}
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <nav aria-label="Blog pagination">
                    <ul className="pagination">
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <i className="bi bi-chevron-left"></i>
                        </button>
                      </li>
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => setCurrentPage(page)}
                          >
                            {page}
                          </button>
                        </li>
                      ))}
                      
                      <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          <i className="bi bi-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modern Professional Blog Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="modal-dialog modal-fullscreen-lg-down modal-xl">
            <div className="modal-content border-0 shadow-lg">
              {/* Modal Header */}
              <div className="modal-header bg-primary text-white border-0">
                <div className="d-flex align-items-center">
                  <div className="bg-white bg-opacity-25 rounded-circle p-2 me-3">
                    <i className="bi bi-journal-text fs-4"></i>
                  </div>
                  <div>
                    <h5 className="modal-title mb-0 fw-bold">
                      {editingPost ? 'Blog Yazısını Düzenle' : 'Yeni Blog Yazısı Oluştur'}
                    </h5>
                    <small className="opacity-75">
                      {editingPost ? 'Mevcut blog yazısını güncelleyin' : 'Yeni bir blog yazısı oluşturun ve yayınlayın'}
                    </small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                ></button>
              </div>

              <form onSubmit={(e) => e.preventDefault()}>
                {/* Tab Navigation */}
                <div className="bg-light border-bottom">
                  <div className="container-fluid px-4">
                    <ul className="nav nav-tabs border-0" role="tablist">
                      <li className="nav-item">
                        <button
                          className={`nav-link px-4 py-3 fw-medium ${activeTab === 'basic' ? 'active bg-white border-0 border-bottom-0' : 'border-0'}`}
                          type="button"
                          onClick={() => setActiveTab('basic')}
                        >
                          <i className="bi bi-info-circle me-2"></i>
                          Temel Bilgiler
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          className={`nav-link px-4 py-3 fw-medium ${activeTab === 'content' ? 'active bg-white border-0' : 'border-0'}`}
                          type="button"
                          onClick={() => setActiveTab('content')}
                        >
                          <i className="bi bi-file-text me-2"></i>
                          İçerik
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          className={`nav-link px-4 py-3 fw-medium ${activeTab === 'media' ? 'active bg-white border-0' : 'border-0'}`}
                          type="button"
                          onClick={() => setActiveTab('media')}
                        >
                          <i className="bi bi-image me-2"></i>
                          Medya & Görsel
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          className={`nav-link px-4 py-3 fw-medium ${activeTab === 'seo' ? 'active bg-white border-0' : 'border-0'}`}
                          type="button"
                          onClick={() => setActiveTab('seo')}
                        >
                          <i className="bi bi-search me-2"></i>
                          SEO & Meta
                        </button>
                      </li>
                      <li className="nav-item">
                        <button
                          className={`nav-link px-4 py-3 fw-medium ${activeTab === 'publish' ? 'active bg-white border-0' : 'border-0'}`}
                          type="button"
                          onClick={() => setActiveTab('publish')}
                        >
                          <i className="bi bi-globe me-2"></i>
                          Yayın Ayarları
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <div className="container-fluid">
                    {/* Basic Information Tab */}
                    {activeTab === 'basic' && (
                      <div className="row g-4">
                        <div className="col-12">
                          <div className="d-flex align-items-center mb-4">
                            <div className="bg-primary bg-gradient rounded-circle p-2 me-3">
                              <i className="bi bi-info-circle text-white"></i>
                            </div>
                            <div>
                              <h6 className="mb-1 fw-bold">Temel Bilgiler</h6>
                              <small className="text-muted">Blog yazınızın temel bilgilerini girin</small>
                            </div>
                          </div>
                        </div>

                        {/* Titles */}
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-type text-primary me-2"></i>
                            Başlık (Türkçe) *
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            name="title_tr"
                            value={formData.title_tr}
                            onChange={handleChange}
                            placeholder="Blog yazısının Türkçe başlığı"
                            required
                          />
                          <div className="form-text">
                            SEO için 50-60 karakter arası önerilir
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-type text-primary me-2"></i>
                            Başlık (İngilizce) *
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            name="title_en"
                            value={formData.title_en}
                            onChange={handleChange}
                            placeholder="Blog post title in English"
                            required
                          />
                          <div className="form-text">
                            Recommended 50-60 characters for SEO
                          </div>
                        </div>

                        {/* Slugs */}
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-link text-primary me-2"></i>
                            URL Slug (Türkçe) *
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">/blog/</span>
                            <input
                              type="text"
                              className="form-control"
                              name="slug_tr"
                              value={formData.slug_tr}
                              onChange={handleChange}
                              placeholder="url-dostu-baslik"
                              required
                            />
                          </div>
                          <div className="form-text">
                            Otomatik oluşturulur, gerekirse düzenleyebilirsiniz
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-link text-primary me-2"></i>
                            URL Slug (İngilizce) *
                          </label>
                          <div className="input-group">
                            <span className="input-group-text">/en/blog/</span>
                            <input
                              type="text"
                              className="form-control"
                              name="slug_en"
                              value={formData.slug_en}
                              onChange={handleChange}
                              placeholder="url-friendly-title"
                              required
                            />
                          </div>
                          <div className="form-text">
                            Auto-generated, you can edit if needed
                          </div>
                        </div>

                        {/* Excerpts */}
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-card-text text-primary me-2"></i>
                            Özet (Türkçe) *
                          </label>
                          <textarea
                            className="form-control"
                            name="excerpt_tr"
                            value={formData.excerpt_tr}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Blog yazısının kısa özeti..."
                            maxLength="300"
                            required
                          />
                          <div className="form-text">
                            Maksimum 300 karakter. Blog listelerinde görünür.
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-card-text text-primary me-2"></i>
                            Özet (İngilizce) *
                          </label>
                          <textarea
                            className="form-control"
                            name="excerpt_en"
                            value={formData.excerpt_en}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Short summary of the blog post..."
                            maxLength="300"
                            required
                          />
                          <div className="form-text">
                            Maximum 300 characters. Appears in blog listings.
                          </div>
                        </div>

                        {/* Category & Read Time */}
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-folder text-primary me-2"></i>
                            Kategori *
                          </label>
                          <select
                            className="form-select form-select-lg"
                            name="category_id"
                            value={formData.category_id}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Kategori Seçin (Zorunlu)</option>
                            {categories.map((cat, index) => (
                              <option key={cat._id || cat.id || `cat-${index}`} value={cat._id || cat.id}>
                                {i18n.language === 'tr' ? 
                                  (cat.name?.tr || cat.name) : 
                                  (cat.name?.en || cat.name)
                                }
                              </option>
                            ))}
                          </select>
                          <div className="form-text text-danger">
                            Bu alan zorunludur. Blog yazısı kategorize edilmelidir.
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-clock text-primary me-2"></i>
                            Okuma Süresi (dakika)
                          </label>
                          <div className="input-group input-group-lg">
                            <input
                              type="number"
                              className="form-control"
                              name="read_time"
                              value={formData.read_time}
                              onChange={handleChange}
                              min="1"
                              max="60"
                            />
                            <span className="input-group-text">dakika</span>
                          </div>
                          <div className="form-text">
                            Kelime sayısına göre otomatik hesaplanır
                          </div>
                        </div>

                        {/* Tags */}
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-tags text-primary me-2"></i>
                            Etiketler (Türkçe)
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="tags_tr"
                            placeholder="beslenme, diyet, sağlık, protein"
                            value={Array.isArray(formData.tags_tr) ? formData.tags_tr.join(', ') : formData.tags_tr || ''}
                            onChange={(e) => {
                              const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                              setFormData({...formData, tags_tr: tagsArray});
                            }}
                          />
                          <div className="form-text">
                            Virgülle ayırarak yazın. SEO için önemlidir.
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-tags text-primary me-2"></i>
                            Etiketler (İngilizce)
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="tags_en"
                            placeholder="nutrition, diet, health, protein"
                            value={Array.isArray(formData.tags_en) ? formData.tags_en.join(', ') : formData.tags_en || ''}
                            onChange={(e) => {
                              const tagsArray = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
                              setFormData({...formData, tags_en: tagsArray});
                            }}
                          />
                          <div className="form-text">
                            Separate with commas. Important for SEO.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Content Tab */}
                    {activeTab === 'content' && (
                      <div className="row g-4">
                        <div className="col-12">
                          <div className="d-flex align-items-center justify-content-between mb-4">
                            <div className="d-flex align-items-center">
                              <div className="bg-success bg-gradient rounded-circle p-2 me-3">
                                <i className="bi bi-file-text text-white"></i>
                              </div>
                              <div>
                                <h6 className="mb-1 fw-bold">İçerik Editörü</h6>
                                <small className="text-muted">Blog yazınızın içeriğini oluşturun</small>
                              </div>
                            </div>
                            <div className="d-flex gap-2">
                              <span className="badge bg-info">
                                TR: {wordCount.tr} kelime
                              </span>
                              <span className="badge bg-info">
                                EN: {wordCount.en} kelime
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-file-text text-success me-2"></i>
                            İçerik (Türkçe) *
                          </label>
                          <textarea
                            className="form-control"
                            value={formData.content_tr}
                            onChange={(e) => setFormData(prev => ({ ...prev, content_tr: e.target.value }))}
                            rows="20"
                            placeholder="Blog yazınızın Türkçe içeriğini yazın..."
                            required
                          />
                          <div className="form-text">
                            Markdown desteklenir. Minimum 300 kelime önerilir.
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-file-text text-success me-2"></i>
                            İçerik (İngilizce) *
                          </label>
                          <textarea
                            className="form-control"
                            value={formData.content_en}
                            onChange={(e) => setFormData(prev => ({ ...prev, content_en: e.target.value }))}
                            rows="20"
                            placeholder="Write your blog post content in English..."
                            required
                          />
                          <div className="form-text">
                            Markdown supported. Minimum 300 words recommended.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Media Tab */}
                    {activeTab === 'media' && (
                      <div className="row g-4">
                        <div className="col-12">
                          <div className="d-flex align-items-center mb-4">
                            <div className="bg-warning bg-gradient rounded-circle p-2 me-3">
                              <i className="bi bi-image text-white"></i>
                            </div>
                            <div>
                              <h6 className="mb-1 fw-bold">Medya ve Görsel</h6>
                              <small className="text-muted">Blog yazınız için görsel ekleyin</small>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-cloud-upload text-warning me-2"></i>
                            Blog Resmi
                          </label>
                          <div className="border rounded p-4 text-center">
                            {formData.featured_image ? (
                              <div className="position-relative">
                                <img 
                                  src={formData.featured_image} 
                                  alt="Blog resmi" 
                                  className="img-fluid rounded shadow"
                                  style={{ maxHeight: '300px', objectFit: 'cover' }}
                                />
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                                  onClick={() => setFormData(prev => ({...prev, featured_image: '', thumbnail: ''}))}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            ) : (
                              <div>
                                <i className="bi bi-cloud-upload display-4 text-muted mb-3"></i>
                                <div className="mb-3">
                                  <input
                                    type="file"
                                    className="form-control"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files[0];
                                      if (file) {
                                        handleImageUpload(file);
                                      }
                                    }}
                                    disabled={uploadingImage}
                                  />
                                </div>
                                <p className="text-muted mb-0">
                                  JPG, PNG veya WebP formatında resim yükleyin
                                </p>
                                <small className="text-muted">Maksimum 5MB</small>
                              </div>
                            )}
                            {uploadingImage && (
                              <div className="mt-3">
                                <div className="spinner-border spinner-border-sm text-primary me-2" role="status"></div>
                                <small className="text-muted">Resim yükleniyor...</small>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="col-md-6">
                          <div className="mb-3">
                            <label className="form-label fw-medium">
                              <i className="bi bi-alt text-warning me-2"></i>
                              Resim Alt Metni (Türkçe)
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="image_alt_tr"
                              value={formData.image_alt_tr}
                              onChange={handleChange}
                              placeholder="Resim açıklaması (SEO için önemli)"
                            />
                          </div>
                          <div className="mb-3">
                            <label className="form-label fw-medium">
                              <i className="bi bi-alt text-warning me-2"></i>
                              Resim Alt Metni (İngilizce)
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="image_alt_en"
                              value={formData.image_alt_en}
                              onChange={handleChange}
                              placeholder="Image description (important for SEO)"
                            />
                          </div>
                          
                          <div className="alert alert-info border-0">
                            <i className="bi bi-lightbulb me-2"></i>
                            <strong>SEO İpucu:</strong> Alt metin görme engelli kullanıcılar için önemlidir ve Google'ın resminizi anlamasına yardımcı olur.
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SEO Tab */}
                    {activeTab === 'seo' && (
                      <div className="row g-4">
                        <div className="col-12">
                          <div className="d-flex align-items-center mb-4">
                            <div className="bg-info bg-gradient rounded-circle p-2 me-3">
                              <i className="bi bi-search text-white"></i>
                            </div>
                            <div>
                              <h6 className="mb-1 fw-bold">SEO ve Meta Ayarları</h6>
                              <small className="text-muted">Arama motorları için optimize edin</small>
                            </div>
                          </div>
                        </div>

                        {/* Meta Titles */}
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-tag text-info me-2"></i>
                            Meta Başlık (Türkçe)
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="meta_title_tr"
                            value={formData.meta_title_tr}
                            onChange={handleChange}
                            placeholder="SEO başlığı (50-60 karakter)"
                            maxLength="60"
                          />
                          <div className="progress mt-1" style={{ height: '2px' }}>
                            <div 
                              className="progress-bar bg-info" 
                              style={{ width: `${(formData.meta_title_tr.length / 60) * 100}%` }}
                            ></div>
                          </div>
                          <div className="form-text">
                            {formData.meta_title_tr.length}/60 karakter
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-tag text-info me-2"></i>
                            Meta Başlık (İngilizce)
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="meta_title_en"
                            value={formData.meta_title_en}
                            onChange={handleChange}
                            placeholder="SEO title (50-60 characters)"
                            maxLength="60"
                          />
                          <div className="progress mt-1" style={{ height: '2px' }}>
                            <div 
                              className="progress-bar bg-info" 
                              style={{ width: `${(formData.meta_title_en.length / 60) * 100}%` }}
                            ></div>
                          </div>
                          <div className="form-text">
                            {formData.meta_title_en.length}/60 characters
                          </div>
                        </div>

                        {/* Meta Descriptions */}
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-file-text text-info me-2"></i>
                            Meta Açıklama (Türkçe)
                          </label>
                          <textarea
                            className="form-control"
                            name="meta_description_tr"
                            value={formData.meta_description_tr}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Arama sonuçlarında görünen açıklama"
                            maxLength="160"
                          />
                          <div className="progress mt-1" style={{ height: '2px' }}>
                            <div 
                              className="progress-bar bg-info" 
                              style={{ width: `${(formData.meta_description_tr.length / 160) * 100}%` }}
                            ></div>
                          </div>
                          <div className="form-text">
                            {formData.meta_description_tr.length}/160 karakter
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-file-text text-info me-2"></i>
                            Meta Açıklama (İngilizce)
                          </label>
                          <textarea
                            className="form-control"
                            name="meta_description_en"
                            value={formData.meta_description_en}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Description shown in search results"
                            maxLength="160"
                          />
                          <div className="progress mt-1" style={{ height: '2px' }}>
                            <div 
                              className="progress-bar bg-info" 
                              style={{ width: `${(formData.meta_description_en.length / 160) * 100}%` }}
                            ></div>
                          </div>
                          <div className="form-text">
                            {formData.meta_description_en.length}/160 characters
                          </div>
                        </div>

                        {/* Meta Keywords */}
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-key text-info me-2"></i>
                            Anahtar Kelimeler (Türkçe)
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="meta_keywords_tr"
                            value={formData.meta_keywords_tr}
                            onChange={handleChange}
                            placeholder="anahtar, kelimeler, virgülle, ayırın"
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-key text-info me-2"></i>
                            Anahtar Kelimeler (İngilizce)
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="meta_keywords_en"
                            value={formData.meta_keywords_en}
                            onChange={handleChange}
                            placeholder="keywords, separated, by, commas"
                          />
                        </div>

                        {/* Focus Keywords */}
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-bullseye text-info me-2"></i>
                            Odak Anahtar Kelime (Türkçe)
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="seo_focus_keyword_tr"
                            value={formData.seo_focus_keyword_tr}
                            onChange={handleChange}
                            placeholder="ana anahtar kelime"
                          />
                          <div className="form-text">
                            Bu yazının ana konusu olan anahtar kelime
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-bullseye text-info me-2"></i>
                            Odak Anahtar Kelime (İngilizce)
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            name="seo_focus_keyword_en"
                            value={formData.seo_focus_keyword_en}
                            onChange={handleChange}
                            placeholder="main keyword"
                          />
                          <div className="form-text">
                            The main keyword this post is about
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="alert alert-info border-0">
                            <i className="bi bi-lightbulb me-2"></i>
                            <strong>SEO İpuçları:</strong>
                            <ul className="mb-0 mt-2">
                              <li>Meta başlık 50-60 karakter arasında olmalı</li>
                              <li>Meta açıklama 150-160 karakter arasında olmalı</li>
                              <li>Odak anahtar kelimeyi başlık ve içerikte kullanın</li>
                              <li>Resim alt metinlerini unutmayın</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Publish Settings Tab */}
                    {activeTab === 'publish' && (
                      <div className="row g-4">
                        <div className="col-12">
                          <div className="d-flex align-items-center mb-4">
                            <div className="bg-success bg-gradient rounded-circle p-2 me-3">
                              <i className="bi bi-globe text-white"></i>
                            </div>
                            <div>
                              <h6 className="mb-1 fw-bold">Yayın Ayarları</h6>
                              <small className="text-muted">Blog yazınızın yayın durumunu belirleyin</small>
                            </div>
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-circle text-success me-2"></i>
                            Yayın Durumu
                          </label>
                          <select
                            className="form-select form-select-lg"
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                          >
                            <option value="draft">📝 Taslak</option>
                            <option value="published">🌐 Yayınla</option>
                            <option value="scheduled">⏰ Zamanla</option>
                            <option value="archived">📦 Arşivle</option>
                          </select>
                        </div>

                        <div className="col-md-6">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="is_featured"
                              checked={formData.is_featured}
                              onChange={handleChange}
                              style={{ transform: 'scale(1.5)' }}
                            />
                            <label className="form-check-label fw-medium ms-2">
                              <i className="bi bi-star text-warning me-2"></i>
                              Öne Çıkan Yazı
                            </label>
                          </div>
                          <div className="form-text">
                            Öne çıkan yazılar ana sayfada ve blog listesinin üstünde görünür
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-calendar-event text-success me-2"></i>
                            Yayın Tarihi
                          </label>
                          <input
                            type="datetime-local"
                            className="form-control form-control-lg"
                            name="published_at"
                            value={formData.published_at}
                            onChange={handleChange}
                          />
                          <div className="form-text">
                            Boş bırakılırsa şu anki tarih kullanılır
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-clock text-success me-2"></i>
                            Zamanlanmış Yayın
                          </label>
                          <input
                            type="datetime-local"
                            className="form-control form-control-lg"
                            name="scheduled_at"
                            value={formData.scheduled_at}
                            onChange={handleChange}
                          />
                          <div className="form-text">
                            Belirtilen tarihte otomatik yayınlanır
                          </div>
                        </div>

                        <div className="col-md-6">
                          <label className="form-label fw-medium">
                            <i className="bi bi-person text-success me-2"></i>
                            Yazar Adı
                          </label>
                          <input
                            type="text"
                            className="form-control form-control-lg"
                            name="author_name"
                            value={formData.author_name}
                            onChange={handleChange}
                            placeholder="Yazar adı"
                          />
                        </div>

                        <div className="col-md-6">
                          <div className="form-check form-switch">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              name="allow_comments"
                              checked={formData.allow_comments}
                              onChange={handleChange}
                              style={{ transform: 'scale(1.5)' }}
                            />
                            <label className="form-check-label fw-medium ms-2">
                              <i className="bi bi-chat text-primary me-2"></i>
                              Yorumlara İzin Ver
                            </label>
                          </div>
                          <div className="form-text">
                            Okuyucular bu yazıya yorum yapabilir
                          </div>
                        </div>

                        <div className="col-12">
                          <div className="alert alert-success border-0">
                            <i className="bi bi-info-circle me-2"></i>
                            <strong>Yayın Durumları:</strong>
                            <ul className="mb-0 mt-2">
                              <li><strong>Taslak:</strong> Sadece admin panelinde görünür</li>
                              <li><strong>Yayınla:</strong> Herkese açık olarak yayınlanır</li>
                              <li><strong>Zamanla:</strong> Belirtilen tarihte otomatik yayınlanır</li>
                              <li><strong>Arşivle:</strong> Yayından kaldırılır ama silinmez</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="modal-footer bg-light border-0">
                  <div className="d-flex justify-content-between align-items-center w-100">
                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={() => {
                          setShowModal(false);
                          resetForm();
                        }}
                      >
                        <i className="bi bi-x-circle me-2"></i>
                        İptal
                      </button>
                      <button
                        type="button"
                        className="btn btn-outline-info"
                        onClick={() => {
                          console.log('Preview mode activated');
                        }}
                      >
                        <i className="bi bi-eye me-2"></i>
                        Önizle
                      </button>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        onClick={(e) => {
                          e.preventDefault();
                          const draftData = { ...formData, status: 'draft' };
                          setFormData(draftData);
                          handleSubmitWithStatus(draftData);
                        }}
                        disabled={loading}
                      >
                        <i className="bi bi-file-earmark me-2"></i>
                        {loading ? 'Kaydediliyor...' : 'Taslak Kaydet'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-primary btn-lg"
                        onClick={(e) => {
                          e.preventDefault();
                          const publishData = { ...formData, status: 'published' };
                          setFormData(publishData);
                          handleSubmitWithStatus(publishData);
                        }}
                        disabled={loading}
                      >
                        <i className="bi bi-send me-2"></i>
                        {loading ? 'Yayınlanıyor...' : (editingPost ? 'Güncelle ve Yayınla' : 'Yayınla')}
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Toast Container */}
      <ToastContainer position="top-end" className="p-3">
        <Toast 
          show={toast.show} 
          onClose={() => setToast({ show: false, message: '', type: 'success' })}
          bg={toast.type === 'error' ? 'danger' : toast.type}
          text={toast.type === 'error' ? 'white' : 'dark'}
        >
          <Toast.Body>{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default BlogManager;