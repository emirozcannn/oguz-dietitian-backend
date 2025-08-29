import express from 'express';
import { blog } from '../src/lib/mongoClient.js';
import Post from '../src/models/Post.js';

const router = express.Router();

// Get all posts (Admin)
router.get('/', async (req, res) => {
  try {
    const { language = 'tr', limit, categories, status } = req.query;
    
    let data;
    if (status === 'all' || !status) {
      data = await blog.getAllPosts(language, limit ? parseInt(limit) : null, categories);
    } else {
      data = await blog.getPosts(language, limit ? parseInt(limit) : null, categories);
    }

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('❌ Blog posts fetch error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get published posts (Public)
router.get('/published', async (req, res) => {
  try {
    const { language = 'tr', limit, categories } = req.query;
    const data = await blog.getPosts(language, limit ? parseInt(limit) : null, categories);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('❌ Published blog posts fetch error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get featured posts
router.get('/featured', async (req, res) => {
  try {
    const { language = 'tr', limit = 3 } = req.query;
    const data = await blog.getFeatured(language, parseInt(limit));

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('❌ Featured blog posts fetch error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get categories
router.get('/categories', async (req, res) => {
  try {
    const data = await blog.getCategories();

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('❌ Blog categories fetch error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single post by slug
router.get('/post/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { language = 'tr' } = req.query;
    
    const data = await blog.getBySlug(slug, language);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('❌ Blog post fetch error:', error.message);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

// Create new post (Admin)
router.post('/', async (req, res) => {
  try {
    const postData = req.body;
    console.log('Received post data:', postData);

    // Validate required fields - check nested structure
    const titleTr = postData.title?.tr || postData.title_tr;
    const titleEn = postData.title?.en || postData.title_en;
    
    if (!titleTr || !titleEn) {
      return res.status(400).json({
        success: false,
        message: 'Başlık gerekli (hem Türkçe hem İngilizce)'
      });
    }

    const contentTr = postData.content?.tr || postData.content_tr;
    const contentEn = postData.content?.en || postData.content_en;
    
    if (!contentTr || !contentEn) {
      return res.status(400).json({
        success: false,
        message: 'İçerik gerekli (hem Türkçe hem İngilizce)'
      });
    }

    // Ensure proper data structure for MongoDB
    const mongoData = {
      title: {
        tr: titleTr,
        en: titleEn
      },
      slug: {
        tr: postData.slug?.tr || postData.slug_tr || generateSlug(titleTr),
        en: postData.slug?.en || postData.slug_en || generateSlug(titleEn)
      },
      content: {
        tr: contentTr,
        en: contentEn
      },
      excerpt: {
        tr: postData.excerpt?.tr || postData.excerpt_tr || '',
        en: postData.excerpt?.en || postData.excerpt_en || ''
      },
      imageUrl: postData.imageUrl || postData.featured_image || '',
      imageAltText: {
        tr: postData.imageAltText?.tr || postData.image_alt_tr || '',
        en: postData.imageAltText?.en || postData.image_alt_en || ''
      },
      status: postData.status || 'draft',
      isFeatured: Boolean(postData.isFeatured || postData.is_featured),
      allowComments: postData.allowComments !== false && postData.allow_comments !== false,
      readTime: parseInt(postData.readTime || postData.read_time) || 5,
      authorId: postData.authorId || '674bc89c5fc7529b6a2b3c3b',
      categories: [], // Geçici olarak boş
      tags: {
        tr: Array.isArray(postData.tags?.tr) ? postData.tags.tr : 
            (Array.isArray(postData.tags_tr) ? postData.tags_tr : 
            (typeof postData.tags_tr === 'string' ? postData.tags_tr.split(',').map(t => t.trim()).filter(t => t) : [])),
        en: Array.isArray(postData.tags?.en) ? postData.tags.en : 
            (Array.isArray(postData.tags_en) ? postData.tags_en : 
            (typeof postData.tags_en === 'string' ? postData.tags_en.split(',').map(t => t.trim()).filter(t => t) : []))
      },
      metaTitle: {
        tr: postData.metaTitle?.tr || postData.meta_title_tr || '',
        en: postData.metaTitle?.en || postData.meta_title_en || ''
      },
      metaDescription: {
        tr: postData.metaDescription?.tr || postData.meta_description_tr || '',
        en: postData.metaDescription?.en || postData.meta_description_en || ''
      }
    };

    console.log('Processed mongo data:', mongoData);

    // Create new post directly with MongoDB model
    const newPost = new Post(mongoData);
    const savedPost = await newPost.save();

    res.status(201).json({
      success: true,
      message: 'Blog yazısı başarıyla oluşturuldu',
      data: savedPost
    });
  } catch (error) {
    console.error('API Error (/blog):', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Helper function to generate slug
function generateSlug(text) {
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

// Update post (Admin)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const data = await blog.update(id, updateData);

    res.json({
      success: true,
      message: 'Blog yazısı başarıyla güncellendi',
      data
    });
  } catch (error) {
    console.error('❌ Blog post update error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Delete post (Admin)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await blog.delete(id);

    res.json({
      success: true,
      message: 'Blog yazısı başarıyla silindi'
    });
  } catch (error) {
    console.error('❌ Blog post deletion error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Increment post view count
router.post('/:id/view', async (req, res) => {
  try {
    const { id } = req.params;
    
    const data = await blog.incrementView(id);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('❌ View increment error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get related posts
router.get('/:id/related', async (req, res) => {
  try {
    const { id } = req.params;
    const { language = 'tr' } = req.query;
    
    const data = await blog.getRelatedPosts(id, language);
    
    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('❌ Related posts error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Like/unlike post
router.post('/:id/like', async (req, res) => {
  try {
    const { id } = req.params;
    
    const data = await blog.toggleLike(id);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('❌ Like error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Get single post by ID (Admin) - Keep at end to avoid conflicts
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const data = await blog.getById(id);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('❌ Blog post fetch error:', error.message);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

export default router;