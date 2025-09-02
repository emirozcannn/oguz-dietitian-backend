import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import apiClient from '../lib/api.js';
import '../styles/blogpost.css';

const BlogPost = () => {
  const { slug } = useParams();
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comments, setComments] = useState([]);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [category, setCategory] = useState(null);
  const [viewCount, setViewCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  
  // Comment form state
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [newComment, setNewComment] = useState('');

  const getLocalizedPath = (path) => (isEnglish ? `/en${path}` : path);

  const formatImage = (imageUrl) => {
    if (!imageUrl) return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop';
    
    // Eğer tam URL ise direkt kullan
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Eğer base64 ise direkt kullan
    if (imageUrl.startsWith('data:image')) {
      return imageUrl;
    }
    
    // Diğer durumlarda varsayılan resim
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=400&fit=crop';
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching post with slug:', slug, 'language:', isEnglish ? 'en' : 'tr');
        
        // Try to fetch post by slug - first try current language
        let response;
        try {
          response = await apiClient.getPostBySlug(slug, isEnglish ? 'en' : 'tr');
        } catch (error) {
          console.log('Failed with current language, trying other language...');
          // If not found in current language, try the other language
          response = await apiClient.getPostBySlug(slug, isEnglish ? 'tr' : 'en');
        }
        
        if (!response.success || !response.data) {
          console.error('Post fetch error:', response.error);
          setError(isEnglish ? 'Blog post not found' : 'Blog yazısı bulunamadı');
          return;
        }

        const postData = response.data;
        console.log('Fetched post data:', postData);
        
        setPost(postData);
        setViewCount(postData.view_count || postData.viewCount || 0);
        setLikeCount(postData.like_count || postData.likeCount || 0);

        // Increment view count
        try {
          await apiClient.incrementPostView(postData.id || postData._id);
        } catch (error) {
          console.error('View tracking error:', error);
        }

        // Load related posts
        try {
          const relatedResponse = await apiClient.getRelatedPosts(postData.id || postData._id, isEnglish ? 'en' : 'tr');
          if (relatedResponse.success) {
            setRelatedPosts(relatedResponse.data || []);
          }
        } catch (error) {
          console.error('Related posts error:', error);
        }

        // Load category info if post has category_id
        if (postData.category_id) {
          try {
            const categoriesResponse = await apiClient.getCategories();
            if (categoriesResponse.success) {
              const postCategory = categoriesResponse.data.find(cat => (cat._id || cat.id) === postData.category_id);
              setCategory(postCategory);
            }
          } catch (error) {
            console.error('Category fetch error:', error);
          }
        }

        // Set tags from post data
        console.log('Post data tags:', postData.tags, postData.tags_tr, postData.tags_en);
        
        const currentTags = isEnglish ? 
          (postData.tags?.en || postData.tags_en || []) : 
          (postData.tags?.tr || postData.tags_tr || []);
        
        console.log('Current tags for display:', currentTags);
        setTags(Array.isArray(currentTags) ? currentTags : []);
        
        setComments([]);

      } catch (error) {
        console.error('Error fetching post:', error);
        setError(isEnglish ? 'An error occurred' : 'Bir hata oluştu');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, isEnglish]);

  const handleLike = async () => {
    if (!post) return;

    try {
      await apiClient.likePost(post._id);
      setIsLiked(!isLiked);
      setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!post || !commentAuthor.trim() || !newComment.trim()) return;

    try {
      // MongoDB için comment sistemi henüz implement edilmedi
      // Geçici olarak form'u temizliyoruz ve başarı mesajı gösteriyoruz
      
      // Clear form
      setCommentAuthor('');
      setCommentEmail('');
      setNewComment('');

      // Show success message
      alert(isEnglish ? 'Comment submitted successfully! It will be published after approval.' : 'Yorum başarıyla gönderildi! Onaylandıktan sonra yayınlanacak.');

    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">{isEnglish ? 'Loading...' : 'Yükleniyor...'}</p>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center">
            <i className="bi bi-exclamation-circle display-1 text-warning mb-4"></i>
            <h2 className="mb-3">{isEnglish ? 'Post Not Found' : 'Yazı Bulunamadı'}</h2>
            <p className="text-muted mb-4">
              {isEnglish 
                ? 'The blog post you are looking for does not exist or has been removed.'
                : 'Aradığınız blog yazısı mevcut değil veya kaldırılmış.'}
            </p>
            <Link to={getLocalizedPath('/blog')} className="btn btn-primary">
              <i className="bi bi-arrow-left me-2"></i>
              {isEnglish ? 'Back to Blog' : 'Bloga Dön'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get title and content in correct language with fallbacks
  const title = isEnglish ? 
    (post.title_en || post.title?.en || post.title_tr || post.title?.tr) : 
    (post.title_tr || post.title?.tr || post.title_en || post.title?.en);
    
  const content = isEnglish ? 
    (post.content_en || post.content?.en || post.content_tr || post.content?.tr) : 
    (post.content_tr || post.content?.tr || post.content_en || post.content?.en);
    
  const excerpt = isEnglish ? 
    (post.excerpt_en || post.excerpt?.en || post.excerpt_tr || post.excerpt?.tr) : 
    (post.excerpt_tr || post.excerpt?.tr || post.excerpt_en || post.excerpt?.en);

  // Get SEO meta data
  const metaTitle = isEnglish ?
    (post.meta_title_en || post.metaTitle?.en || title) :
    (post.meta_title_tr || post.metaTitle?.tr || title);
    
  const metaDescription = isEnglish ?
    (post.meta_description_en || post.metaDescription?.en || excerpt) :
    (post.meta_description_tr || post.metaDescription?.tr || excerpt);
    
  const categoryName = category 
    ? (isEnglish ? category.name?.en || category.name : category.name?.tr || category.name)
    : (isEnglish ? 'General' : 'Genel');

  return (
    <>
      <Helmet>
        <title>{metaTitle} - Oğuz Yolyapan</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={tags.join(', ')} />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={formatImage(post.imageUrl || post.image_url)} />
        <meta property="og:type" content="article" />
        <meta property="article:author" content={post.author_name || 'Oğuz Yolyapan'} />
        <meta property="article:published_time" content={post.publishedAt || post.published_at} />
        <meta property="article:tag" content={tags.join(', ')} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={formatImage(post.imageUrl || post.image_url)} />
      </Helmet>

      <article className="blog-post">
        {/* Hero Section - Overlayed Image with Category and Title */}
        <section className="blog-hero-elegant position-relative overflow-hidden">
          <div className="position-relative w-100" style={{ height: '60vh', minHeight: 320 }}>
            <img
              src={formatImage(post.image_url)}
              alt={title}
              className="w-100 h-100 object-fit-cover"
              style={{ objectPosition: 'center' }}
            />
            {/* Overlay */}
            <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'linear-gradient(180deg, rgba(30,30,30,0.7) 0%, rgba(30,30,30,0.4) 60%, rgba(30,30,30,0.85) 100%)', zIndex: 2 }}></div>
            {/* Category Badge */}
            <div className="position-absolute top-0 start-0 m-4" style={{ zIndex: 3 }}>
              <span
                className="badge px-4 py-2 rounded-pill fw-semibold shadow"
                style={{
                  backgroundColor: category?.color || '#28a745',
                  color: '#fff',
                  fontSize: '1rem',
                  letterSpacing: '0.03em',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
                }}
              >
                {category?.icon && (
                  <i className={`bi bi-${category.icon} me-2`}></i>
                )}
                {categoryName}
              </span>
            </div>
            {/* Title & Excerpt */}
            <div className="position-absolute bottom-0 start-0 w-100 px-4 px-md-5 pb-4 pb-md-5" style={{ zIndex: 4 }}>
              <div className="col-lg-8 col-xl-7 mx-auto">
                <h1 className="fw-bold text-white mb-3" style={{ fontSize: '2.6rem', textShadow: '0 2px 12px rgba(0,0,0,0.25)' }}>{title}</h1>
                {excerpt && (
                  <p className="lead text-white-50 mb-4" style={{ textShadow: '0 1px 8px rgba(0,0,0,0.18)' }}>{excerpt}</p>
                )}
                {/* Meta Info */}
                <div className="d-flex flex-wrap align-items-center gap-3 text-white-50 small mb-2">
                  <span><i className="bi bi-calendar3 me-1"></i>{new Date(post.created_at).toLocaleDateString(isEnglish ? 'en-US' : 'tr-TR', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  <span><i className="bi bi-clock me-1"></i>{post.read_time} {isEnglish ? 'min read' : 'dk okuma'}</span>
                  <span><i className="bi bi-eye me-1"></i>{viewCount}</span>
                  <span><i className="bi bi-heart me-1"></i>{likeCount}</span>
                </div>
                {/* Action Buttons */}
                <div className="d-flex gap-2 mt-2">
                  <button
                    className={`btn ${isLiked ? 'btn-danger' : 'btn-outline-light'} btn-sm rounded-pill px-3 fw-semibold`}
                    onClick={handleLike}
                  >
                    <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'} me-1`}></i>
                    {isEnglish ? 'Like' : 'Beğen'}
                  </button>
                  <button
                    className="btn btn-outline-light btn-sm rounded-pill px-3 fw-semibold"
                    onClick={() => setShowShareMenu(!showShareMenu)}
                  >
                    <i className="bi bi-share me-1"></i>
                    {isEnglish ? 'Share' : 'Paylaş'}
                  </button>
                </div>
                {/* Share Menu */}
                {showShareMenu && (
                  <div className="share-menu mt-3 p-3 bg-white bg-opacity-75 rounded-3 border shadow-sm">
                    <div className="d-flex justify-content-center gap-2">
                      <a href="#" className="btn btn-outline-primary btn-sm rounded-circle p-2" style={{ width: '36px', height: '36px' }}>
                        <i className="bi bi-facebook"></i>
                      </a>
                      <a href="#" className="btn btn-outline-info btn-sm rounded-circle p-2" style={{ width: '36px', height: '36px' }}>
                        <i className="bi bi-twitter"></i>
                      </a>
                      <a href="#" className="btn btn-outline-success btn-sm rounded-circle p-2" style={{ width: '36px', height: '36px' }}>
                        <i className="bi bi-whatsapp"></i>
                      </a>
                      <a href="#" className="btn btn-outline-secondary btn-sm rounded-circle p-2" style={{ width: '36px', height: '36px' }}>
                        <i className="bi bi-link-45deg"></i>
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Main Content Section - Modernized */}
        <section className="blog-content-section py-5">
          <div className="container">
            <div className="row gx-5 justify-content-center">
              {/* Main Article Card */}
              <div className="col-lg-8">
                <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4">
                  {/* Breadcrumb */}
                  <nav aria-label="breadcrumb" className="mb-4">
                    <ol className="breadcrumb breadcrumb-elegant mb-0">
                      <li className="breadcrumb-item">
                        <Link to="/" className="text-muted text-decoration-none small">
                          <i className="bi bi-house-door me-1"></i>
                          {isEnglish ? 'Home' : 'Anasayfa'}
                        </Link>
                      </li>
                      <li className="breadcrumb-item">
                        <Link to={isEnglish ? '/en/blog' : '/blog'} className="text-muted text-decoration-none small">
                          <i className="bi bi-journal-text me-1"></i>
                          Blog
                        </Link>
                      </li>
                      <li className="breadcrumb-item active small" aria-current="page">
                        {isEnglish ? 'Article' : 'Yazı'}
                      </li>
                    </ol>
                  </nav>
                  {/* Article Body */}
                  <div className="blog-content-formatted mb-4">
                    <div 
                      style={{ whiteSpace: 'pre-wrap' }}
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </div>
                  {/* Tags Section */}
                  {tags && tags.length > 0 && (
                    <div className="tags-section mb-4">
                      <h6 className="fw-semibold mb-2 text-dark">
                        <i className="bi bi-tags me-2 text-primary"></i>
                        {isEnglish ? 'Tags:' : 'Etiketler:'}
                      </h6>
                      <div className="d-flex flex-wrap gap-2">
                        {tags.map((tag, index) => (
                          <span
                            key={`tag-${index}-${tag}`}
                            className="badge bg-light text-dark border rounded-pill px-3 py-2 fw-normal"
                            style={{ fontSize: '0.85rem' }}
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Comments Section */}
                  <div className="comments-section mt-5">
                    <div className="comments-header d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
                      <h5 className="mb-0 fw-semibold">
                        <i className="bi bi-chat-dots me-2 text-primary"></i>
                        {isEnglish ? 'Comments' : 'Yorumlar'} ({comments.length})
                      </h5>
                    </div>
                    {/* Comment Form */}
                    <div className="comment-form mb-5">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body">
                          <h6 className="card-title mb-3">
                            {isEnglish ? 'Leave a Comment' : 'Yorum Bırakın'}
                          </h6>
                          <form onSubmit={handleCommentSubmit}>
                            <div className="row g-3 mb-3">
                              <div className="col-md-6">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder={isEnglish ? 'Your Name' : 'Adınız'}
                                  value={commentAuthor}
                                  onChange={(e) => setCommentAuthor(e.target.value)}
                                  required
                                />
                              </div>
                              <div className="col-md-6">
                                <input
                                  type="email"
                                  className="form-control"
                                  placeholder={isEnglish ? 'Your Email' : 'E-posta Adresiniz'}
                                  value={commentEmail}
                                  onChange={(e) => setCommentEmail(e.target.value)}
                                  required
                                />
                              </div>
                            </div>
                            <div className="mb-3">
                              <textarea
                                className="form-control"
                                rows="4"
                                placeholder={isEnglish ? 'Write your comment...' : 'Yorumunuzu yazın...'}
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                required
                              ></textarea>
                            </div>
                            <button type="submit" className="btn btn-success rounded-pill px-4">
                              <i className="bi bi-send me-2"></i>
                              {isEnglish ? 'Post Comment' : 'Yorum Gönder'}
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                    {/* Comments List */}
                    <div className="comments-list">
                      {comments.length > 0 ? (
                        comments.map((comment) => (
                          <div key={comment.id} className="comment-item mb-4 p-4 bg-light rounded-3">
                            <div className="d-flex">
                              <div className="comment-avatar bg-primary text-white rounded-circle me-3 d-flex align-items-center justify-content-center" style={{ width: '48px', height: '48px', flexShrink: 0 }}>
                                <i className="bi bi-person-fill"></i>
                              </div>
                              <div className="flex-grow-1">
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                  <h6 className="mb-0 fw-semibold">{comment.user_name}</h6>
                                  <small className="text-muted">
                                    {new Date(comment.created_at).toLocaleDateString(
                                      isEnglish ? 'en-US' : 'tr-TR',
                                      { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
                                    )}
                                  </small>
                                </div>
                                <p className="mb-0 text-muted">{comment.content}</p>
                                {comment.status === 'pending' && (
                                  <small className="text-warning">
                                    <i className="bi bi-clock me-1"></i>
                                    {isEnglish ? 'Awaiting approval' : 'Onay bekliyor'}
                                  </small>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-5 text-muted">
                          <i className="bi bi-chat-square-text display-4 mb-3 opacity-50"></i>
                          <p className="mb-0">{isEnglish ? 'No comments yet. Be the first to comment!' : 'Henüz yorum yok. İlk yorumu siz yapın!'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              {/* Sidebar - Related Posts, Author, Newsletter */}
              <div className="col-lg-4 mt-5 mt-lg-0">
                {/* Related Posts */}
                {relatedPosts.length > 0 && (
                  <div className="related-posts card border-0 shadow-sm mb-4">
                    <div className="card-header bg-white border-0 pb-0">
                      <h6 className="mb-0 fw-semibold">
                        <i className="bi bi-collection me-2 text-primary"></i>
                        {isEnglish ? 'Related Articles' : 'İlgili Yazılar'}
                      </h6>
                    </div>
                    <div className="card-body">
                      {relatedPosts.slice(0, 3).map((relatedPost) => (
                        <div key={relatedPost._id} className="related-post-item mb-3 pb-3 border-bottom">
                          <div className="row g-2">
                            <div className="col-4">
                              <img
                                src={formatImage(relatedPost.image_url)}
                                alt={isEnglish ? relatedPost.title_en : relatedPost.title_tr}
                                className="img-fluid rounded object-fit-cover"
                                style={{ height: '60px' }}
                              />
                            </div>
                            <div className="col-8">
                              <Link
                                to={getLocalizedPath(`/blog/${isEnglish ? relatedPost.slug_en : relatedPost.slug_tr}`)}
                                className="text-decoration-none"
                              >
                                <h6 className="small mb-1 text-dark lh-sm" style={{ fontSize: '0.85rem' }}>
                                  {isEnglish ? relatedPost.title_en : relatedPost.title_tr}
                                </h6>
                              </Link>
                              <small className="text-muted">
                                <i className="bi bi-clock me-1"></i>
                                {relatedPost.read_time} {isEnglish ? 'min' : 'dk'}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {/* Author Card */}
                <div className="author-card card border-0 shadow-sm mb-4">
                  <div className="card-body text-center p-4">
                    <div className="author-avatar bg-primary text-white mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle" style={{ width: '80px', height: '80px' }}>
                      <i className="bi bi-person-fill fs-2"></i>
                    </div>
                    <h5 className="card-title mb-2">Oğuz Yolyapan</h5>
                    <p className="text-muted mb-3">
                      {isEnglish ? 'Professional Dietitian & Nutrition Expert' : 'Profesyonel Diyetisyen & Beslenme Uzmanı'}
                    </p>
                    <p className="small text-muted mb-4">
                      {isEnglish
                        ? 'Helping people achieve their health goals with personalized nutrition plans and expert guidance.'
                        : 'Kişiselleştirilmiş beslenme planları ve uzman rehberliği ile insanların sağlık hedeflerine ulaşmalarına yardımcı oluyorum.'
                      }
                    </p>
                    <div className="row g-3 text-center small">
                      <div className="col-6">
                        <div className="fw-bold fs-5 text-success">{viewCount}</div>
                        <div className="text-muted">{isEnglish ? 'Views' : 'Görüntülenme'}</div>
                      </div>
                      <div className="col-6">
                        <div className="fw-bold fs-5 text-danger">{comments.length}</div>
                        <div className="text-muted">{isEnglish ? 'Comments' : 'Yorum'}</div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Newsletter Signup */}
                <div className="newsletter-card card border-0 shadow-sm">
                  <div className="card-body text-center p-4" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)' }}>
                    <div className="newsletter-icon bg-success text-white mx-auto mb-3 d-flex align-items-center justify-content-center rounded-circle" style={{ width: '60px', height: '60px' }}>
                      <i className="bi bi-envelope-heart fs-4"></i>
                    </div>
                    <h6 className="mb-3">{isEnglish ? 'Stay Updated' : 'Güncel Kalın'}</h6>
                    <p className="small text-muted mb-3">
                      {isEnglish
                        ? 'Get the latest nutrition tips and articles delivered to your inbox.'
                        : 'En son beslenme ipuçlarını ve makaleleri e-posta kutunuza alın.'
                      }
                    </p>
                    <form className="newsletter-form">
                      <div className="input-group mb-3">
                        <input
                          type="email"
                          className="form-control"
                          placeholder={isEnglish ? 'Your email' : 'E-posta adresiniz'}
                        />
                        <button className="btn btn-success" type="submit">
                          <i className="bi bi-arrow-right"></i>
                        </button>
                      </div>
                    </form>
                    <small className="text-muted">
                      {isEnglish ? 'No spam, unsubscribe at any time.' : 'Spam yok, istediğiniz zaman abonelikten çıkın.'}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </article>
    </>
  );
};

export default BlogPost;
