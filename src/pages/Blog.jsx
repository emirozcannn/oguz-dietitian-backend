import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import apiClient from '../lib/api.js';
import '../styles/blog.css';

const Blog = () => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [showNewsletterSuccess, setShowNewsletterSuccess] = useState(false);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);

  // Helper function to get post slug with fallback
  const getPostSlug = (post) => {
    if (isEnglish) {
      return post.slug_en || post.slug?.en || post.slug_tr || post.slug?.tr || 'untitled';
    } else {
      return post.slug_tr || post.slug?.tr || post.slug_en || post.slug?.en || 'untitled';
    }
  };

  // Helper function to get post title with fallback
  const getPostTitle = (post) => {
    if (isEnglish) {
      return post.title_en || post.title?.en || post.title_tr || post.title?.tr || 'Untitled';
    } else {
      return post.title_tr || post.title?.tr || post.title_en || post.title?.en || 'Başlıksız';
    }
  };

  // Helper function to get post excerpt with fallback
  const getPostExcerpt = (post) => {
    if (isEnglish) {
      return post.excerpt_en || post.excerpt?.en || post.excerpt_tr || post.excerpt?.tr || '';
    } else {
      return post.excerpt_tr || post.excerpt?.tr || post.excerpt_en || post.excerpt?.en || '';
    }
  };

  // Format image URL for MongoDB/External images
  const formatImage = (imageUrl) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=250&fit=crop';
    
    // Eğer tam URL ise direkt kullan
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Eğer base64 ise direkt kullan
    if (imageUrl.startsWith('data:image')) {
      return imageUrl;
    }
    
    // Diğer durumlarda varsayılan resim
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=250&fit=crop';
  };

  // Load blog data from MongoDB
  useEffect(() => {
    const loadBlogData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        try {
          const categoriesResponse = await apiClient.getCategories(isEnglish ? 'en' : 'tr');
          if (categoriesResponse.success) {
            setCategories(categoriesResponse.data || []);
            console.log('Categories loaded:', categoriesResponse.data);
          } else {
            console.error('Categories error:', categoriesResponse.error);
            // Fallback to demo categories
            loadDemoCategories();
          }
        } catch (categoriesError) {
          console.error('Error loading categories:', categoriesError);
          // Fallback to demo categories
          loadDemoCategories();
        }

        // Fetch posts with published status
        const postsResponse = await apiClient.getAllPosts(isEnglish ? 'en' : 'tr', null, null, 'published');
        if (postsResponse.success) {
          const postsData = postsResponse.data || [];
          console.log('Posts loaded:', postsData);
          setPosts(postsData);
          setFeaturedPosts(postsData.filter(post => post.is_featured));
          setPopularPosts(postsData.sort((a, b) => (b.view_count || 0) - (a.view_count || 0)).slice(0, 3));
        } else {
          console.error('Posts error:', postsResponse.error);
          // Fallback to demo data
          loadDemoBlogData();
        }
        
      } catch (error) {
        console.error('Error loading blog data:', error);
        // Fallback to demo data
        loadDemoBlogData();
      } finally {
        setLoading(false);
      }
    };

    loadBlogData();
  }, [isEnglish]);

  const loadDemoCategories = () => {
    const demoCategories = [
      {
        id: '1',
        name_tr: 'Genel Beslenme',
        name_en: 'General Nutrition',
        slug_tr: 'genel-beslenme',
        slug_en: 'general-nutrition',
        color: '#28a745',
        icon: 'leaf'
      },
      {
        id: '2',
        name_tr: 'Kilo Yönetimi',
        name_en: 'Weight Management',
        slug_tr: 'kilo-yonetimi',
        slug_en: 'weight-management',
        color: '#007bff',
        icon: 'scale'
      },
      {
        id: '3',
        name_tr: 'Spor Beslenmesi',
        name_en: 'Sports Nutrition',
        slug_tr: 'spor-beslenmesi',
        slug_en: 'sports-nutrition',
        color: '#17a2b8',
        icon: 'trophy'
      }
    ];
    setCategories(demoCategories);
  };

  const loadDemoBlogData = () => {
    // Demo blog posts
    const demoPosts = [
      {
        id: '1',
        title_tr: 'Sağlıklı Beslenme İpuçları',
        title_en: 'Healthy Eating Tips',
        excerpt_tr: 'Günlük yaşamınızda uygulayabileceğiniz basit beslenme önerileri.',
        excerpt_en: 'Simple nutrition tips you can apply in your daily life.',
        content_tr: 'Bu yazıda sağlıklı beslenme hakkında detaylı bilgiler bulacaksınız...',
        content_en: 'In this article, you will find detailed information about healthy eating...',
        slug_tr: 'saglikli-beslenme-ipuclari',
        slug_en: 'healthy-eating-tips',
        image_url: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=400&fit=crop',
        category_id: '1',
        tags: ['beslenme', 'sağlık', 'nutrition', 'health'],
        is_featured: true,
        is_published: true,
        views: 1245,
        read_time: 5,
        created_at: new Date().toISOString(),
        categories: {
          id: '1',
          name_tr: 'Genel Beslenme',
          name_en: 'General Nutrition',
          slug_tr: 'genel-beslenme',
          slug_en: 'general-nutrition',
          color: '#28a745',
          icon: 'leaf'
        }
      },
      {
        id: '2',
        title_tr: 'Kilo Verme Stratejileri',
        title_en: 'Weight Loss Strategies',
        excerpt_tr: 'Sağlıklı ve sürdürülebilir kilo verme yöntemleri.',
        excerpt_en: 'Healthy and sustainable weight loss methods.',
        content_tr: 'Kilo vermek için bilmeniz gereken her şey...',
        content_en: 'Everything you need to know about losing weight...',
        slug_tr: 'kilo-verme-stratejileri',
        slug_en: 'weight-loss-strategies',
        image_url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=400&fit=crop',
        category_id: '2',
        tags: ['kilo verme', 'diyet', 'weight loss', 'diet'],
        is_featured: false,
        is_published: true,
        views: 892,
        read_time: 7,
        created_at: new Date().toISOString(),
        categories: {
          id: '2',
          name_tr: 'Kilo Yönetimi',
          name_en: 'Weight Management',
          slug_tr: 'kilo-yonetimi',
          slug_en: 'weight-management',
          color: '#007bff',
          icon: 'scale'
        }
      },
      {
        id: '3',
        title_tr: 'Spor Beslenmesi',
        title_en: 'Sports Nutrition',
        excerpt_tr: 'Sporcular için optimal beslenme rehberi.',
        excerpt_en: 'Optimal nutrition guide for athletes.',
        content_tr: 'Spor performansınızı artıracak beslenme önerileri...',
        content_en: 'Nutrition tips to boost your athletic performance...',
        slug_tr: 'spor-beslenmesi',
        slug_en: 'sports-nutrition',
        image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&h=400&fit=crop',
        category_id: '3',
        tags: ['spor', 'beslenme', 'sports', 'nutrition'],
        is_featured: true,
        is_published: true,
        views: 1567,
        read_time: 6,
        created_at: new Date().toISOString(),
        categories: {
          id: '3',
          name_tr: 'Spor Beslenmesi',
          name_en: 'Sports Nutrition',
          slug_tr: 'spor-beslenmesi',
          slug_en: 'sports-nutrition',
          color: '#17a2b8',
          icon: 'trophy'
        }
      }
    ];

    const demoCategories = [
      {
        id: '1',
        name_tr: 'Genel Beslenme',
        name_en: 'General Nutrition',
        slug_tr: 'genel-beslenme',
        slug_en: 'general-nutrition',
        color: '#28a745',
        icon: 'leaf'
      },
      {
        id: '2',
        name_tr: 'Kilo Yönetimi',
        name_en: 'Weight Management',
        slug_tr: 'kilo-yonetimi',
        slug_en: 'weight-management',
        color: '#007bff',
        icon: 'scale'
      },
      {
        id: '3',
        name_tr: 'Spor Beslenmesi',
        name_en: 'Sports Nutrition',
        slug_tr: 'spor-beslenmesi',
        slug_en: 'sports-nutrition',
        color: '#17a2b8',
        icon: 'trophy'
      }
    ];

    setPosts(demoPosts);
    setCategories(demoCategories);
    setFeaturedPosts(demoPosts.filter(post => post.is_featured));
    setPopularPosts(demoPosts.sort((a, b) => b.views - a.views).slice(0, 3));
    setLoading(false);
  };

  // Filter posts based on search and category
  useEffect(() => {
    let filtered = posts;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(post => {
        // MongoDB'de category_id olarak kaydediliyor
        return String(post.category_id) === String(selectedCategory);
      });
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(post => {
        const title = isEnglish ? post.title_en : post.title_tr;
        const excerpt = isEnglish ? post.excerpt_en : post.excerpt_tr;
        const content = isEnglish ? post.content_en : post.content_tr;
        
        return (
          title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          content?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      });
    }

    setFilteredPosts(filtered);
  }, [searchTerm, selectedCategory, posts, isEnglish]);

  // Handle newsletter submission
  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (newsletterEmail) {
      try {
        // In production, save to newsletter subscribers table
        console.log(`Newsletter signup: ${newsletterEmail}`);
        setShowNewsletterSuccess(true);
        setNewsletterEmail('');
        
        setTimeout(() => {
          setShowNewsletterSuccess(false);
        }, 3000);
      } catch (error) {
        console.error('Newsletter signup error:', error);
      }
    }
  };

  // Handle post view tracking
  const handlePostView = async (postId) => {
    try {
      // MongoDB'de view count artırmak için API çağrısı yapmayız, 
      // çünkü view tracking genellikle BlogPost component'inde yapılır
      console.log('Post view:', postId);
    } catch (error) {
      console.error('Error tracking post view:', error);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return isEnglish 
      ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // Get time ago
  const getTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return isEnglish ? '1 day ago' : '1 gün önce';
    } else if (diffDays < 7) {
      return isEnglish ? `${diffDays} days ago` : `${diffDays} gün önce`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return isEnglish ? `${weeks} week${weeks > 1 ? 's' : ''} ago` : `${weeks} hafta önce`;
    } else {
      const months = Math.floor(diffDays / 30);
      return isEnglish ? `${months} month${months > 1 ? 's' : ''} ago` : `${months} ay önce`;
    }
  };

  // Get category for a post
  const getPostCategory = (post) => {
    if (!post.category_id) return null;
    return categories.find(cat => (cat._id || cat.id) === post.category_id);
  };

  // Parse tags from MongoDB data
  const parseTags = (post) => {
    try {
      // MongoDB'de tags string array olarak kaydediliyor
      const tags = isEnglish ? post.tags_en : post.tags_tr;
      
      if (Array.isArray(tags)) {
        return tags;
      }
      
      if (typeof tags === 'string') {
        try {
          return JSON.parse(tags);
        } catch {
          return tags.split(',').map(tag => tag.trim());
        }
      }
      
      return [];
    } catch {
      return [];
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex justify-content-center align-items-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }
  return (
    <>
      <Helmet>
        <title>{isEnglish ? 'Blog - Nutrition Articles' : 'Blog - Beslenme Yazıları'} - Oğuz Yolyapan</title>
        <meta name="description" content={isEnglish ? 'Read expert nutrition articles and tips from professional dietitian Oğuz Yolyapan' : 'Profesyonel diyetisyen Oğuz Yolyapan\'dan uzman beslenme yazıları ve ipuçları okuyun'} />
      </Helmet>

      <div className="container py-5">
        {/* Header Section */}
        <div className="row mb-5">
          <div className="col-lg-8 mx-auto text-center">
            <h1 className="display-4 fw-bold mb-4">
              {isEnglish ? 'Nutrition Blog' : 'Beslenme Blogu'}
            </h1>
            <p className="lead text-muted mb-4">
              {isEnglish ? 'Expert insights on nutrition, health, and wellness from professional dietitian Oğuz Yolyapan' : 'Profesyonel diyetisyen Oğuz Yolyapan\'dan beslenme, sağlık ve esenlik konularında uzman görüşleri'}
            </p>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="row mb-5">
          <div className="col-lg-8 mx-auto">
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <div className="row g-3">
                  <div className="col-lg-8">
                    <div className="input-group input-group-lg">
                      <span className="input-group-text">
                        <i className="bi bi-search"></i>
                      </span>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={isEnglish ? 'Search articles...' : 'Yazı ara...'}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col-lg-4">
                    <select
                      className="form-select form-select-lg"
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                      <option value="all">{isEnglish ? 'All Categories' : 'Tüm Kategoriler'}</option>
                      {categories.map(category => (
                        <option key={category._id} value={category._id}>
                          {isEnglish ? category.name.en : category.name.tr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="row mb-5">
            <div className="col-12">
              <h2 className="h3 mb-4">
                <i className="bi bi-star-fill text-warning me-2"></i>
                {isEnglish ? 'Featured Posts' : 'Öne Çıkan Yazılar'}
              </h2>
              <div className="row">
                {featuredPosts.map((post) => {
                  const postCategory = getPostCategory(post);
                  return (
                  <div key={post._id || post.id} className="col-lg-6 mb-4">
                    <article className="card border-0 shadow-lg h-100 overflow-hidden blog-card position-relative">
                      <div className="position-relative" style={{ height: '260px' }}>
                        <img
                          src={formatImage(post.featured_image || post.image_url)}
                          alt={post.image_alt_tr || post.image_alt_text || (isEnglish ? post.title_en : post.title_tr)}
                          className="w-100 h-100 object-fit-cover"
                          style={{ objectPosition: 'center' }}
                        />
                        {/* Overlay */}
                        <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(180deg, rgba(30,30,30,0.7) 0%, rgba(30,30,30,0.4) 60%, rgba(30,30,30,0.85) 100%)', zIndex: 2 }}></div>
                        {/* Category Badge */}
                        {postCategory && (
                          <div className="position-absolute top-0 start-0 m-3" style={{ zIndex: 3 }}>
                            <span className="badge px-3 py-2 rounded-pill fw-semibold shadow" style={{ backgroundColor: postCategory.color || '#28a745', color: '#fff', fontSize: '1rem', letterSpacing: '0.03em', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                              {postCategory.icon && (
                                <i className={`bi bi-${postCategory.icon} me-2`}></i>
                              )}
                              {isEnglish ? postCategory.name?.en || postCategory.name : postCategory.name?.tr || postCategory.name}
                            </span>
                          </div>
                        )}
                        {/* Featured Badge */}
                        <div className="position-absolute top-0 end-0 m-3" style={{ zIndex: 3 }}>
                          <span className="badge bg-warning text-dark px-3 py-2">
                            <i className="bi bi-star-fill me-1"></i>
                            {isEnglish ? 'Featured' : 'Öne Çıkan'}
                          </span>
                        </div>
                        {/* Title & Excerpt */}
                        <div className="position-absolute bottom-0 start-0 w-100 px-4 pb-4" style={{ zIndex: 4 }}>
                          <h3 className="fw-bold text-white mb-2" style={{ fontSize: '1.6rem', textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>
                            <Link
                              to={`/blog/${getPostSlug(post)}`}
                              className="text-decoration-none text-white"
                              onClick={() => handlePostView(post._id)}
                            >
                              {getPostTitle(post)}
                            </Link>
                          </h3>
                          <p className="lead text-white-50 mb-0" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.18)', fontSize: '1rem' }}>{isEnglish ? post.excerpt_en : post.excerpt_tr}</p>
                        </div>
                      </div>
                      <div className="card-body bg-white">
                        <div className="d-flex flex-wrap align-items-center gap-3 text-muted small mb-2">
                          <span><i className="bi bi-calendar3 me-1"></i>{formatDate(post.published_at)}</span>
                          <span><i className="bi bi-clock me-1"></i>{post.read_time} {isEnglish ? 'min read' : 'dk okuma'}</span>
                          <span><i className="bi bi-eye me-1"></i>{post.view_count}</span>
                          <span><i className="bi bi-heart me-1"></i>{post.like_count}</span>
                        </div>
                        <Link
                          to={`/blog/${isEnglish ? post.slug_en : post.slug_tr}`}
                          className="btn btn-outline-primary btn-sm w-100 fw-semibold"
                          onClick={() => handlePostView(post._id)}
                        >
                          {isEnglish ? 'Read More' : 'Devamını Oku'}
                          <i className="bi bi-arrow-right ms-1"></i>
                        </Link>
                      </div>
                    </article>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* All Posts Section */}
        <div className="row">
          <div className="col-lg-8">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="h3 mb-0">{isEnglish ? 'All Posts' : 'Tüm Yazılar'}</h2>
              <span className="text-muted">{filteredPosts.length} {isEnglish ? 'articles' : 'yazı'}</span>
            </div>
            {filteredPosts.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-search text-muted" style={{ fontSize: '3rem' }}></i>
                <h4 className="mt-3">{isEnglish ? 'No articles found' : 'Yazı bulunamadı'}</h4>
                <p className="text-muted">
                  {isEnglish ? 'Try adjusting your search terms or category filter.' : 'Arama terimlerinizi veya kategori filtrenizi ayarlamayı deneyin.'}
                </p>
              </div>
            ) : (
              <div className="row">
                {filteredPosts.map((post) => {
                  const postCategory = getPostCategory(post);
                  return (
                  <div key={post._id || post.id} className="col-12 mb-4">
                    <article className="card border-0 shadow-sm blog-card overflow-hidden position-relative">
                      <div className="row g-0">
                        {(post.featured_image || post.image_url) && (
                          <div className="col-lg-5 position-relative" style={{ minHeight: '200px' }}>
                            <img
                              src={formatImage(post.featured_image || post.image_url)}
                              alt={post.image_alt_tr || post.image_alt_text || (isEnglish ? post.title_en : post.title_tr)}
                              className="w-100 h-100 object-fit-cover"
                              style={{ objectPosition: 'center', minHeight: '200px' }}
                            />
                            {/* Overlay */}
                            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(180deg, rgba(30,30,30,0.7) 0%, rgba(30,30,30,0.4) 60%, rgba(30,30,30,0.85) 100%)', zIndex: 2 }}></div>
                            {/* Category Badge */}
                            {postCategory && (
                              <div className="position-absolute top-0 start-0 m-3" style={{ zIndex: 3 }}>
                                <span className="badge px-3 py-2 rounded-pill fw-semibold shadow" style={{ backgroundColor: postCategory.color || '#28a745', color: '#fff', fontSize: '1rem', letterSpacing: '0.03em', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
                                  {postCategory.icon && (
                                    <i className={`bi bi-${postCategory.icon} me-2`}></i>
                                  )}
                                  {isEnglish ? postCategory.name?.en || postCategory.name : postCategory.name?.tr || postCategory.name}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                        <div className={(post.featured_image || post.image_url) ? 'col-lg-7' : 'col-12'}>
                          <div className="card-body h-100 d-flex flex-column justify-content-center">
                            <div className="d-flex align-items-center mb-2 gap-2">
                              <small className="text-muted">{getTimeAgo(post.published_at)}</small>
                            </div>
                            <h3 className="card-title mb-2 fw-bold">
                              <Link
                                to={`/blog/${isEnglish ? post.slug_en : post.slug_tr}`}
                                className="text-decoration-none text-dark"
                                onClick={() => handlePostView(post._id)}
                              >
                                {isEnglish ? post.title_en : post.title_tr}
                              </Link>
                            </h3>
                            <p className="card-text text-muted mb-3">
                              {isEnglish ? post.excerpt_en : post.excerpt_tr}
                            </p>
                            <div className="d-flex flex-wrap align-items-center gap-3 text-muted small mb-2">
                              <span><i className="bi bi-clock me-1"></i>{post.read_time} {isEnglish ? 'min read' : 'dk okuma'}</span>
                              <span><i className="bi bi-eye me-1"></i>{post.view_count}</span>
                              <span><i className="bi bi-heart me-1"></i>{post.like_count}</span>
                            </div>
                            <div className="d-flex flex-wrap gap-1 mb-3">
                              {parseTags(post).map((tag, index) => (
                                <span key={index} className="badge bg-light text-muted">{tag}</span>
                              ))}
                            </div>
                            <Link
                              to={`/blog/${isEnglish ? post.slug_en : post.slug_tr}`}
                              className="btn btn-outline-primary btn-sm fw-semibold"
                              onClick={() => handlePostView(post._id)}
                            >
                              {isEnglish ? 'Read More' : 'Devamını Oku'}
                              <i className="bi bi-arrow-right ms-1"></i>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </article>
                  </div>
                  );
                })}
              </div>
            )}
          </div>
          {/* Sidebar */}
          <div className="col-lg-4 mt-5 mt-lg-0">
            {/* Popular Posts */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-fire text-danger me-2"></i>
                  {isEnglish ? 'Popular Posts' : 'Popüler Yazılar'}
                </h5>
              </div>
              <div className="card-body">
                {popularPosts.map((post, index) => (
                  <div key={post._id} className={`d-flex ${index !== popularPosts.length - 1 ? 'mb-3 pb-3 border-bottom' : ''}`}>
                    <div className="flex-shrink-0 me-3">
                      <span className="badge bg-primary rounded-circle" style={{ width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {index + 1}
                      </span>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1">
                        <Link
                          to={`/blog/${isEnglish ? post.slug_en : post.slug_tr}`}
                          className="text-decoration-none"
                          onClick={() => handlePostView(post._id)}
                        >
                          {isEnglish ? post.title_en : post.title_tr}
                        </Link>
                      </h6>
                      <small className="text-muted d-block">
                        <i className="bi bi-eye me-1"></i>
                        {post.view_count} {isEnglish ? 'views' : 'görüntülenme'}
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Categories */}
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-header bg-white">
                <h5 className="mb-0">
                  <i className="bi bi-folder text-primary me-2"></i>
                  {isEnglish ? 'Categories' : 'Kategoriler'}
                </h5>
              </div>
              <div className="card-body">
                <div className="d-flex flex-wrap gap-2">
                  <button
                    className={`btn btn-sm ${selectedCategory === 'all' ? 'btn-primary' : 'btn-outline-primary'}`}
                    onClick={() => setSelectedCategory('all')}
                  >
                    <i className="bi bi-grid me-1"></i>
                    {isEnglish ? 'All Categories' : 'Tüm Kategoriler'}
                  </button>
                  {categories.map(category => (
                    <button
                      key={category._id || category.id}
                      className={`btn btn-sm ${selectedCategory === (category._id || category.id) ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setSelectedCategory(category._id || category.id)}
                    >
                      {category.icon && (
                        <i className={`bi bi-${category.icon} me-1`}></i>
                      )}
                      {isEnglish ? category.name?.en || category.name : category.name?.tr || category.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {/* Newsletter */}
            <div className="card border-0 shadow-sm">
              <div className="card-body p-4 text-center">
                <i className="bi bi-envelope-heart text-primary mb-3" style={{ fontSize: '2rem' }}></i>
                <h5 className="mb-3">
                  {isEnglish ? 'Newsletter' : 'Bülten'}
                </h5>
                <p className="text-muted mb-4">
                  {isEnglish ? 'Subscribe to get the latest nutrition tips and articles.' : 'En son beslenme ipuçları ve yazıları almak için abone olun.'}
                </p>
                {showNewsletterSuccess ? (
                  <div className="alert alert-success">
                    <i className="bi bi-check-circle me-2"></i>
                    {isEnglish ? 'Successfully subscribed!' : 'Başarıyla abone oldunuz!'}
                  </div>
                ) : (
                  <form onSubmit={handleNewsletterSubmit}>
                    <div className="input-group mb-3">
                      <input
                        type="email"
                        className="form-control"
                        placeholder={isEnglish ? 'Enter your email' : 'E-posta adresinizi girin'}
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        required
                      />
                      <button className="btn btn-primary" type="submit">
                        <i className="bi bi-send me-1"></i>
                        {isEnglish ? 'Subscribe' : 'Abone Ol'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Blog;
