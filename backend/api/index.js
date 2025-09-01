import express from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

import { connectDB } from '../utils/db.js';
import { corsMiddleware, securityMiddleware, rateLimitMiddleware, errorHandler } from '../middleware/common.js';
import { auth, adminAuth } from '../middleware/auth.js';

// Models
import User from '../models/User.js';
import Category from '../models/Category.js';
import Post from '../models/Post.js';
import Package from '../models/Package.js';
import Testimonial from '../models/Testimonial.js';
import { FAQCategory, FAQItem } from '../models/FAQ.js';
import Contact from '../models/Contact.js';

const app = express();

// Global CORS middleware for all requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Apply middleware
app.use(corsMiddleware);
app.use(securityMiddleware);
app.use(rateLimitMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to database
connectDB().catch(console.error);

// Helper function to send success response
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

// Helper function to send error response
const sendError = (res, error = 'An error occurred', statusCode = 500, code = 'INTERNAL_ERROR') => {
  res.status(statusCode).json({
    success: false,
    error,
    code,
    timestamp: new Date().toISOString()
  });
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  sendSuccess(res, {
    status: 'healthy',
    server: 'running',
    database: 'connected',
    environment: process.env.NODE_ENV || 'development'
  }, 'Service is healthy');
});

// Preflight OPTIONS handler
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(200).end();
});

// ===============================
// AUTH ENDPOINTS
// ===============================

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Email and password are required', 400, 'MISSING_CREDENTIALS');
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return sendError(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) {
      return sendError(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      return sendError(res, 'Account is deactivated', 401, 'ACCOUNT_DEACTIVATED');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    // Remove password from response
    const userResponse = user.toJSON();

    sendSuccess(res, {
      user: userResponse,
      token
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Login failed', 500);
  }
});

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return sendError(res, 'All required fields must be provided', 400, 'MISSING_FIELDS');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'User already exists with this email', 400, 'USER_EXISTS');
    }

    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone
    });

    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    sendSuccess(res, {
      user: user.toJSON(),
      token
    }, 'Registration successful', 201);

  } catch (error) {
    console.error('Registration error:', error);
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return sendError(res, messages.join(', '), 400, 'VALIDATION_ERROR');
    }
    sendError(res, 'Registration failed', 500);
  }
});

// Get current user
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('subscription.packageId');
    sendSuccess(res, { user });
  } catch (error) {
    console.error('Get me error:', error);
    sendError(res, 'Failed to get user data', 500);
  }
});

// Update profile
app.put('/api/auth/profile', auth, async (req, res) => {
  try {
    const { firstName, lastName, phone, healthInfo, preferences } = req.body;
    
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phone) updateData.phone = phone;
    if (healthInfo) updateData.healthInfo = healthInfo;
    if (preferences) updateData.preferences = preferences;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    sendSuccess(res, { user }, 'Profile updated successfully');
  } catch (error) {
    console.error('Profile update error:', error);
    sendError(res, 'Failed to update profile', 500);
  }
});

// ===============================
// BLOG ENDPOINTS
// ===============================

// Get posts
app.get('/api/blog', async (req, res) => {
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
    
    if (category) {
      query.category = category;
    }

    if (type === 'featured') {
      query.isFeatured = true;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await Post.find(query)
      .populate('category', 'name_tr name_en slug_tr slug_en')
      .populate('author', 'firstName lastName')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);

    // Format response based on language
    const formattedPosts = posts.map(post => ({
      _id: post._id,
      title: language === 'en' ? post.title_en : post.title_tr,
      title_tr: post.title_tr,
      title_en: post.title_en,
      slug: language === 'en' ? post.slug_en : post.slug_tr,
      slug_tr: post.slug_tr,
      slug_en: post.slug_en,
      excerpt: language === 'en' ? post.excerpt_en : post.excerpt_tr,
      excerpt_tr: post.excerpt_tr,
      excerpt_en: post.excerpt_en,
      content: language === 'en' ? post.content_en : post.content_tr,
      imageUrl: post.imageUrl,
      category: post.category,
      author: post.author,
      readTime: post.readTime,
      views: post.views,
      publishedAt: post.publishedAt,
      createdAt: post.createdAt
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
    sendError(res, 'Failed to fetch posts', 500);
  }
});

// Get single post by slug
app.get('/api/blog/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
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

    // Increment view count
    post.views += 1;
    await post.save();

    // Format response
    const formattedPost = {
      _id: post._id,
      title: language === 'en' ? post.title_en : post.title_tr,
      title_tr: post.title_tr,
      title_en: post.title_en,
      slug: language === 'en' ? post.slug_en : post.slug_tr,
      slug_tr: post.slug_tr,
      slug_en: post.slug_en,
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
});

// Create post (Admin only)
app.post('/api/blog', adminAuth, async (req, res) => {
  try {
    const postData = {
      ...req.body,
      author: req.user.id
    };

    const post = await Post.create(postData);
    const populatedPost = await Post.findById(post._id)
      .populate('category')
      .populate('author', 'firstName lastName');

    sendSuccess(res, { post: populatedPost }, 'Post created successfully', 201);

  } catch (error) {
    console.error('Create post error:', error);
    sendError(res, 'Failed to create post', 500);
  }
});

// ===============================
// PACKAGES ENDPOINTS
// ===============================

// Get packages
app.get('/api/packages', async (req, res) => {
  try {
    const { language = 'tr', category, type } = req.query;

    const query = { isActive: true };
    
    if (category) {
      query.category = category;
    }

    if (type === 'home-featured') {
      query.isHomeFeatured = true;
    }

    const packages = await Package.find(query)
      .populate('category', 'name_tr name_en')
      .sort({ sortOrder: 1, createdAt: -1 });

    // Format response based on language
    const formattedPackages = packages.map(pkg => ({
      _id: pkg._id,
      title: language === 'en' ? pkg.title_en : pkg.title_tr,
      title_tr: pkg.title_tr,
      title_en: pkg.title_en,
      description: language === 'en' ? pkg.description_en : pkg.description_tr,
      description_tr: pkg.description_tr,
      description_en: pkg.description_en,
      features: language === 'en' ? pkg.features_en : pkg.features_tr,
      price: pkg.price,
      originalPrice: pkg.originalPrice,
      currency: pkg.currency,
      duration: language === 'en' ? pkg.duration_en : pkg.duration_tr,
      duration_tr: pkg.duration_tr,
      duration_en: pkg.duration_en,
      sessionCount: pkg.sessionCount,
      type: pkg.type,
      category: pkg.category,
      isPopular: pkg.isPopular,
      icon: pkg.icon,
      color: pkg.color,
      discountPercentage: pkg.discountPercentage,
      rating: pkg.rating,
      createdAt: pkg.createdAt
    }));

    sendSuccess(res, {
      packages: formattedPackages
    });

  } catch (error) {
    console.error('Get packages error:', error);
    sendError(res, 'Failed to fetch packages', 500);
  }
});

// Get single package
app.get('/api/packages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { language = 'tr' } = req.query;

    const pkg = await Package.findOne({ _id: id, isActive: true })
      .populate('category', 'name_tr name_en');

    if (!pkg) {
      return sendError(res, 'Package not found', 404, 'PACKAGE_NOT_FOUND');
    }

    const formattedPackage = {
      _id: pkg._id,
      title: language === 'en' ? pkg.title_en : pkg.title_tr,
      description: language === 'en' ? pkg.description_en : pkg.description_tr,
      features: language === 'en' ? pkg.features_en : pkg.features_tr,
      price: pkg.price,
      originalPrice: pkg.originalPrice,
      duration: language === 'en' ? pkg.duration_en : pkg.duration_tr,
      sessionCount: pkg.sessionCount,
      type: pkg.type,
      category: pkg.category,
      isPopular: pkg.isPopular,
      includes: pkg.includes,
      excludes: pkg.excludes,
      requirements: language === 'en' ? pkg.requirements_en : pkg.requirements_tr,
      rating: pkg.rating,
      purchaseCount: pkg.purchaseCount
    };

    sendSuccess(res, { package: formattedPackage });

  } catch (error) {
    console.error('Get package error:', error);
    sendError(res, 'Failed to fetch package', 500);
  }
});

// ===============================
// TESTIMONIALS ENDPOINTS
// ===============================

// Get approved testimonials
app.get('/api/testimonials', async (req, res) => {
  try {
    const { language = 'tr', type, limit } = req.query;

    const query = { 
      status: 'approved', 
      isVisible: true 
    };

    let dbQuery = Testimonial.find(query)
      .populate('packageUsed', 'title_tr title_en')
      .sort({ sortOrder: 1, approvedAt: -1 });

    if (limit) {
      dbQuery = dbQuery.limit(parseInt(limit));
    }

    const testimonials = await dbQuery;

    // Format response based on language
    const formattedTestimonials = testimonials.map(testimonial => ({
      _id: testimonial._id,
      name: testimonial.name,
      content: testimonial.content[language] || testimonial.content.tr,
      rating: testimonial.rating,
      position: testimonial.position,
      company: testimonial.company,
      location: testimonial.location,
      avatarUrl: testimonial.avatarUrl,
      packageUsed: testimonial.packageUsed,
      approvedAt: testimonial.approvedAt
    }));

    sendSuccess(res, {
      testimonials: formattedTestimonials
    });

  } catch (error) {
    console.error('Get testimonials error:', error);
    sendError(res, 'Failed to fetch testimonials', 500);
  }
});

// Create testimonial
app.post('/api/testimonials', async (req, res) => {
  try {
    const testimonial = await Testimonial.create(req.body);
    sendSuccess(res, { testimonial }, 'Testimonial submitted successfully', 201);
  } catch (error) {
    console.error('Create testimonial error:', error);
    sendError(res, 'Failed to submit testimonial', 500);
  }
});

// ===============================
// FAQ ENDPOINTS
// ===============================

// Get FAQ items
app.get('/api/faq', async (req, res) => {
  try {
    const { language = 'tr' } = req.query;

    const categories = await FAQCategory.find({ isActive: true })
      .sort({ sortOrder: 1 });

    const items = await FAQItem.find({ isActive: true })
      .populate('category')
      .sort({ sortOrder: 1 });

    // Group items by category
    const faqData = categories.map(category => ({
      _id: category._id,
      name: language === 'en' ? category.name_en : category.name_tr,
      description: language === 'en' ? category.description_en : category.description_tr,
      icon: category.icon,
      color: category.color,
      items: items
        .filter(item => item.category._id.toString() === category._id.toString())
        .map(item => ({
          _id: item._id,
          question: language === 'en' ? item.question_en : item.question_tr,
          answer: language === 'en' ? item.answer_en : item.answer_tr,
          viewCount: item.viewCount
        }))
    }));

    sendSuccess(res, { faq: faqData });

  } catch (error) {
    console.error('Get FAQ error:', error);
    sendError(res, 'Failed to fetch FAQ', 500);
  }
});

// ===============================
// CONTACT ENDPOINTS
// ===============================

// Submit contact form
app.post('/api/contact', async (req, res) => {
  try {
    const contactData = {
      ...req.body,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    const contact = await Contact.create(contactData);
    sendSuccess(res, { contact }, 'Message sent successfully', 201);

  } catch (error) {
    console.error('Create contact error:', error);
    sendError(res, 'Failed to send message', 500);
  }
});

// Get contact info
app.get('/api/contact/info', (req, res) => {
  const { language = 'tr' } = req.query;
  
  const contactInfo = {
    phone: '+90 XXX XXX XX XX',
    email: 'info@oguzyolyapan.com',
    address: language === 'en' 
      ? 'Address Information (English)'
      : 'Adres Bilgisi (Türkçe)',
    workingHours: language === 'en'
      ? 'Monday - Friday: 09:00 - 18:00'
      : 'Pazartesi - Cuma: 09:00 - 18:00',
    social: {
      instagram: 'https://instagram.com/oguzyolyapan',
      linkedin: 'https://linkedin.com/in/oguzyolyapan',
      facebook: 'https://facebook.com/oguzyolyapan'
    }
  };

  sendSuccess(res, contactInfo);
});

// ===============================
// NEWSLETTER ENDPOINTS
// ===============================

// Newsletter subscription
app.post('/api/newsletter', async (req, res) => {
  try {
    const { email, language = 'tr', source = 'website' } = req.body;

    if (!email || !email.includes('@')) {
      return sendError(res, 'Valid email is required', 400, 'INVALID_EMAIL');
    }

    // Simple newsletter subscription (you can expand this with a Newsletter model)
    const newsletterData = {
      email: email.toLowerCase(),
      language,
      source,
      subscribedAt: new Date(),
      isActive: true,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    };

    // For now, just log it (later you can save to database)
    console.log('Newsletter subscription:', newsletterData);

    sendSuccess(res, { 
      message: 'Newsletter subscription successful' 
    }, 'Subscription successful', 201);

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    sendError(res, 'Failed to subscribe to newsletter', 500);
  }
});

// ===============================
// CATEGORIES ENDPOINTS
// ===============================

// Get categories
app.get('/api/categories', async (req, res) => {
  try {
    const { language = 'tr' } = req.query;

    const categories = await Category.find({ isActive: true })
      .sort({ sortOrder: 1 });

    const formattedCategories = categories.map(category => ({
      _id: category._id,
      name: language === 'en' ? category.name_en : category.name_tr,
      slug: language === 'en' ? category.slug_en : category.slug_tr,
      description: language === 'en' ? category.description_en : category.description_tr,
      color: category.color,
      icon: category.icon
    }));

    sendSuccess(res, { categories: formattedCategories });

  } catch (error) {
    console.error('Get categories error:', error);
    sendError(res, 'Failed to fetch categories', 500);
  }
});

// Apply error handler
app.use(errorHandler);

// Global error handler for unhandled errors
app.use((err, req, res, next) => {
  console.error('🚨 Unhandled error:', err);
  
  // CORS headers for error responses
  res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  sendError(res, err.message || 'Internal server error', 500, 'INTERNAL_ERROR');
});

// Handle 404
app.all('*', (req, res) => {
  // CORS headers for 404 responses
  res.header('Access-Control-Allow-Origin', req.get('Origin') || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  sendError(res, 'Route not found', 404, 'ROUTE_NOT_FOUND');
});

// For Vercel serverless functions
export default app;

// For local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  });
}
