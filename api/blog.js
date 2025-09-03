const { connectDB } = require('../lib/db.js');
const { sendSuccess, sendError, handleCors } = require('../lib/response.js');
const { auth, adminAuth } = require('../middleware/auth.js');
const Post = require('../models/Post.js');
const Category = require('../models/Category.js'); // Category modelini import et
const User = require('../models/User.js'); // User modelini import et

// Helper function to generate URL-friendly slug
function generateSlug(title) {
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
    .trim('-');
}

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  await connectDB();

  const { method } = req;
  const url = new URL(req.url, `http://${req.headers.host}`);
  const segments = url.pathname.replace('/api/blog', '').split('/').filter(Boolean);

  try {
    // GET /api/blog - Get all posts
    if (method === 'GET' && segments.length === 0) {
      return await getPosts(req, res);
    }

    // GET /api/blog/:slug - Get single post
    if (method === 'GET' && segments.length === 1) {
      return await getPost(req, res, segments[0]);
    }

    // POST /api/blog - Create new post (admin only)
    if (method === 'POST' && segments.length === 0) {
      return await createPost(req, res);
    }

    // PUT /api/blog/:id - Update post (admin only)
    if (method === 'PUT' && segments.length === 1) {
      return await updatePost(req, res, segments[0]);
    }

    // DELETE /api/blog/:id - Delete post (admin only)
    if (method === 'DELETE' && segments.length === 1) {
      return await deletePost(req, res, segments[0]);
    }

    sendError(res, 'Blog route not found', 404, 'ROUTE_NOT_FOUND');

  } catch (error) {
    console.error('Blog API error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

// Blog functions
async function getPosts(req, res) {
  try {
    const { 
      type, 
      language = 'tr', 
      category, 
      page = 1, 
      limit = 10, 
      status = 'published' 
    } = req.query;

    const query = { status };
    
    if (category) query.category = category;
    if (type === 'featured') query.isFeatured = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Güvenli populate - hata durumunda devam et
    const posts = await Post.find(query)
      .populate({
        path: 'category',
        select: 'name_tr name_en slug_tr slug_en',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'author',
        select: 'firstName lastName',
        options: { strictPopulate: false }
      })
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean(); // Performans için lean() kullan

    const total = await Post.countDocuments(query);

    const formattedPosts = posts.map(post => ({
      _id: post._id,
      id: post._id, // Frontend için ID ekleme
      title_tr: post.title_tr,
      title_en: post.title_en,
      title: language === 'en' ? post.title_en : post.title_tr,
      slug_tr: post.slug_tr,
      slug_en: post.slug_en,
      slug: language === 'en' ? post.slug_en : post.slug_tr,
      excerpt_tr: post.excerpt_tr,
      excerpt_en: post.excerpt_en,
      excerpt: language === 'en' ? post.excerpt_en : post.excerpt_tr,
      content_tr: post.content_tr,
      content_en: post.content_en,
      imageUrl: post.imageUrl,
      featured_image: post.imageUrl,
      category: post.category || null,
      categories: post.category || null,
      author: post.author || { firstName: 'Oğuz', lastName: 'Yolyapan' },
      readTime: post.readTime || 3,
      read_time: post.readTime || 3,
      views: post.views || 0,
      view_count: post.views || 0,
      status: post.status,
      is_featured: post.isFeatured || false,
      publishedAt: post.publishedAt,
      published_at: post.publishedAt,
      createdAt: post.createdAt,
      created_at: post.createdAt,
      updatedAt: post.updatedAt,
      updated_at: post.updatedAt
    }));

    sendSuccess(res, {
      posts: formattedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    sendError(res, 'Failed to fetch posts: ' + error.message, 500);
  }
}

async function getPost(req, res, slug) {
  try {
    const { language = 'tr' } = req.query;

    const searchField = language === 'en' ? 'slug_en' : 'slug_tr';
    const post = await Post.findOne({ 
      [searchField]: slug, 
      status: 'published' 
    })
      .populate('category', 'name_tr name_en slug_tr slug_en')
      .populate('author', 'firstName lastName');

    if (!post) {
      return sendError(res, 'Post not found', 404, 'POST_NOT_FOUND');
    }

    post.views += 1;
    await post.save();

    const formattedPost = {
      _id: post._id,
      title: language === 'en' ? post.title_en : post.title_tr,
      slug: language === 'en' ? post.slug_en : post.slug_tr,
      excerpt: language === 'en' ? post.excerpt_en : post.excerpt_tr,
      content: language === 'en' ? post.content_en : post.content_tr,
      imageUrl: post.imageUrl,
      category: post.category,
      author: post.author,
      readTime: post.readTime,
      views: post.views,
      tags: post.tags,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt
    };

    sendSuccess(res, { post: formattedPost });
  } catch (error) {
    console.error('Get post error:', error);
    sendError(res, 'Failed to fetch post', 500);
  }
}

async function createPost(req, res) {
  try {
    // Geçici olarak admin auth kaldırıldı - dev amaçlı
    // const authResult = await adminAuth(req, res);
    // if (!authResult) return;

    // Required field validation - sadece temel alanları kontrol et
    const requiredFields = ['title_tr', 'title_en', 'content_tr', 'content_en'];
    const missingFields = requiredFields.filter(field => !req.body[field]?.trim());
    
    if (missingFields.length > 0) {
      return sendError(res, `Missing required fields: ${missingFields.join(', ')}`, 400, 'VALIDATION_ERROR');
    }

    // Category validation - daha esnek: varsa kullan, yoksa null
    let categoryId = null;
    if (req.body.category_id && req.body.category_id.trim()) {
      categoryId = req.body.category_id;
    } else if (req.body.category && req.body.category.trim()) {
      categoryId = req.body.category;
    }

    const postData = {
      title_tr: req.body.title_tr.trim(),
      title_en: req.body.title_en.trim(),
      slug_tr: req.body.slug_tr?.trim() || generateSlug(req.body.title_tr),
      slug_en: req.body.slug_en?.trim() || generateSlug(req.body.title_en),
      excerpt_tr: req.body.excerpt_tr?.trim() || '',
      excerpt_en: req.body.excerpt_en?.trim() || '',
      content_tr: req.body.content_tr.trim(),
      content_en: req.body.content_en.trim(),
      imageUrl: req.body.featured_image || req.body.imageUrl,
      imageAltText_tr: req.body.image_alt_tr,
      imageAltText_en: req.body.image_alt_en,
      category: categoryId, // null olabilir
      author: '674bc89c5fc7529b6a2b3c3b', // Default admin ID
      status: req.body.status || 'draft',
      isFeatured: req.body.is_featured || false,
      readTime: req.body.read_time || 3,
      tags: req.body.tags_tr || [],
      seo: {
        metaTitle_tr: req.body.meta_title_tr,
        metaTitle_en: req.body.meta_title_en,
        metaDescription_tr: req.body.meta_description_tr,
        metaDescription_en: req.body.meta_description_en,
        keywords: req.body.meta_keywords_tr ? req.body.meta_keywords_tr.split(',') : []
      },
      publishedAt: req.body.status === 'published' ? new Date() : null
    };

    console.log('Creating post with data:', postData);

    const post = await Post.create(postData);
    const populatedPost = await Post.findById(post._id)
      .populate({
        path: 'category',
        select: 'name_tr name_en slug_tr slug_en',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'author',
        select: 'firstName lastName',
        options: { strictPopulate: false }
      })
      .lean();

    sendSuccess(res, { post: populatedPost }, 'Post created successfully', 201);
  } catch (error) {
    console.error('Create post error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return sendError(res, `Validation failed: ${validationErrors.join(', ')}`, 400, 'VALIDATION_ERROR');
    }
    
    sendError(res, 'Failed to create post: ' + error.message, 500);
  }
}

async function updatePost(req, res, id) {
  try {
    // Geçici olarak admin auth kaldırıldı - dev amaçlı
    // const authResult = await adminAuth(req, res);
    // if (!authResult) return;

    // Required field validation for updates
    const requiredFields = ['title_tr', 'title_en', 'content_tr', 'content_en'];
    const missingFields = requiredFields.filter(field => !req.body[field]?.trim());
    
    if (missingFields.length > 0) {
      return sendError(res, `Missing required fields: ${missingFields.join(', ')}`, 400, 'VALIDATION_ERROR');
    }

    // Category validation - daha esnek: sadece varsa kontrol et
    if (req.body.category_id === null || req.body.category_id === undefined) {
      // Category gönderilmemişse mevcut değeri koru
      delete req.body.category_id;
    }

    const updateData = {
      title_tr: req.body.title_tr.trim(),
      title_en: req.body.title_en.trim(),
      slug_tr: req.body.slug_tr?.trim() || generateSlug(req.body.title_tr),
      slug_en: req.body.slug_en?.trim() || generateSlug(req.body.title_en),
      excerpt_tr: req.body.excerpt_tr?.trim() || '',
      excerpt_en: req.body.excerpt_en?.trim() || '',
      content_tr: req.body.content_tr.trim(),
      content_en: req.body.content_en.trim(),
      imageUrl: req.body.featured_image || req.body.imageUrl,
      imageAltText_tr: req.body.image_alt_tr,
      imageAltText_en: req.body.image_alt_en,
      status: req.body.status || 'draft',
      isFeatured: req.body.is_featured || false,
      readTime: req.body.read_time || 3,
      tags: req.body.tags_tr || [],
      seo: {
        metaTitle_tr: req.body.meta_title_tr,
        metaTitle_en: req.body.meta_title_en,
        metaDescription_tr: req.body.meta_description_tr,
        metaDescription_en: req.body.meta_description_en,
        keywords: req.body.meta_keywords_tr ? req.body.meta_keywords_tr.split(',') : []
      },
      lastModified: new Date(),
      publishedAt: req.body.status === 'published' && !req.body.published_at ? new Date() : req.body.published_at
    };

    // Category'i sadece gönderildiyse ekle
    if (req.body.category_id && req.body.category_id.trim()) {
      updateData.category = req.body.category_id;
    } else if (req.body.category && req.body.category.trim()) {
      updateData.category = req.body.category;
    }

    console.log('Updating post with data:', updateData);

    const post = await Post.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: false } // Geçici olarak validation'ı kapat
    )
      .populate({
        path: 'category',
        select: 'name_tr name_en slug_tr slug_en',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'author',
        select: 'firstName lastName',
        options: { strictPopulate: false }
      })
      .lean();

    if (!post) {
      return sendError(res, 'Post not found', 404, 'POST_NOT_FOUND');
    }

    sendSuccess(res, { post }, 'Post updated successfully');
  } catch (error) {
    console.error('Update post error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return sendError(res, `Validation failed: ${validationErrors.join(', ')}`, 400, 'VALIDATION_ERROR');
    }
    
    sendError(res, 'Failed to update post: ' + error.message, 500);
  }
}

async function deletePost(req, res, id) {
  try {
    // Geçici olarak admin auth kaldırıldı - dev amaçlı
    // const authResult = await adminAuth(req, res);
    // if (!authResult) return;

    const post = await Post.findByIdAndDelete(id);

    if (!post) {
      return sendError(res, 'Post not found', 404, 'POST_NOT_FOUND');
    }

    sendSuccess(res, { id }, 'Post deleted successfully');
  } catch (error) {
    console.error('Delete post error:', error);
    sendError(res, 'Failed to delete post', 500);
  }
}
