const { connectDB } = require('../lib/db.js');
const { sendSuccess, sendError, handleCors } = require('../lib/response.js');
const { auth, adminAuth } = require('../middleware/auth.js');
const jwt = require('jsonwebtoken');

// Models
const User = require('../models/User.js');
const Category = require('../models/Category.js');
const Post = require('../models/Post.js');
const Package = require('../models/Package.js');
const Testimonial = require('../models/Testimonial.js');
const { FAQCategory, FAQItem } = require('../models/FAQ.js');
const Contact = require('../models/Contact.js');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  await connectDB();

  try {
    const { path: pathname, method } = req.query;
    const segments = pathname ? pathname.split('/').filter(Boolean) : [];

    // Route: GET /auth/me
    if (method === 'GET' && segments[0] === 'auth' && segments[1] === 'me') {
      return await getCurrentUser(req, res);
    }

    // Route: POST /auth/login
    if (method === 'POST' && segments[0] === 'auth' && segments[1] === 'login') {
      return await login(req, res);
    }

    // Route: POST /auth/register
    if (method === 'POST' && segments[0] === 'auth' && segments[1] === 'register') {
      return await register(req, res);
    }

    // Route: PUT /auth/profile
    if (method === 'PUT' && segments[0] === 'auth' && segments[1] === 'profile') {
      return await updateProfile(req, res);
    }

    // Route: GET /blog
    if (method === 'GET' && segments[0] === 'blog' && !segments[1]) {
      return await getPosts(req, res);
    }

    // Route: GET /blog/:slug
    if (method === 'GET' && segments[0] === 'blog' && segments[1]) {
      return await getPost(req, res, segments[1]);
    }

    // Route: POST /blog
    if (method === 'POST' && segments[0] === 'blog' && !segments[1]) {
      return await createPost(req, res);
    }

    // Route: GET /packages
    if (method === 'GET' && segments[0] === 'packages' && !segments[1]) {
      return await getPackages(req, res);
    }

    // Route: GET /packages/:id
    if (method === 'GET' && segments[0] === 'packages' && segments[1]) {
      return await getPackage(req, res, segments[1]);
    }

    // Route: GET /testimonials
    if (method === 'GET' && segments[0] === 'testimonials') {
      return await getTestimonials(req, res);
    }

    // Route: POST /testimonials
    if (method === 'POST' && segments[0] === 'testimonials') {
      return await createTestimonial(req, res);
    }

    // Route: GET /faq
    if (method === 'GET' && segments[0] === 'faq') {
      return await getFAQ(req, res);
    }

    // Route: POST /contact
    if (method === 'POST' && segments[0] === 'contact' && !segments[1]) {
      return await submitContact(req, res);
    }

    // Route: GET /contact/info
    if (method === 'GET' && segments[0] === 'contact' && segments[1] === 'info') {
      return await getContactInfo(req, res);
    }

    // Route: GET /categories
    if (method === 'GET' && segments[0] === 'categories') {
      return await getCategories(req, res);
    }

    sendError(res, 'Route not found', 404, 'ROUTE_NOT_FOUND');

  } catch (error) {
    console.error('API error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

// ===============================
// AUTH FUNCTIONS
// ===============================

async function login(req, res) {
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

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });

    const userResponse = user.toJSON();

    sendSuccess(res, {
      user: userResponse,
      token
    }, 'Login successful');
  } catch (error) {
    console.error('Login error:', error);
    sendError(res, 'Login failed', 500);
  }
}

async function register(req, res) {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return sendError(res, 'All required fields must be provided', 400, 'MISSING_FIELDS');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return sendError(res, 'User already exists with this email', 400, 'USER_EXISTS');
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone
    });

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
}

async function getCurrentUser(req, res) {
  try {
    // Auth middleware first
    const authResult = await auth(req, res);
    if (!authResult) return;

    const user = await User.findById(req.user.id).populate('subscription.packageId');
    sendSuccess(res, { user });
  } catch (error) {
    console.error('Get me error:', error);
    sendError(res, 'Failed to get user data', 500);
  }
}

async function updateProfile(req, res) {
  try {
    // Auth middleware first
    const authResult = await auth(req, res);
    if (!authResult) return;

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
}

// ===============================
// BLOG FUNCTIONS
// ===============================

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

    const posts = await Post.find(query)
      .populate('category', 'name_tr name_en slug_tr slug_en')
      .populate('author', 'firstName lastName')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);

    const formattedPosts = posts.map(post => ({
      _id: post._id,
      title: language === 'en' ? post.title_en : post.title_tr,
      slug: language === 'en' ? post.slug_en : post.slug_tr,
      excerpt: language === 'en' ? post.excerpt_en : post.excerpt_tr,
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
    // Admin auth middleware first
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

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
}

// ===============================
// PACKAGE FUNCTIONS
// ===============================

async function getPackages(req, res) {
  try {
    const { language = 'tr', category, type } = req.query;

    const query = { isActive: true };
    
    if (category) query.category = category;
    if (type === 'home-featured') query.isHomeFeatured = true;

    const packages = await Package.find(query)
      .populate('category', 'name_tr name_en')
      .sort({ sortOrder: 1, createdAt: -1 });

    const formattedPackages = packages.map(pkg => ({
      _id: pkg._id,
      title: language === 'en' ? pkg.title_en : pkg.title_tr,
      description: language === 'en' ? pkg.description_en : pkg.description_tr,
      features: language === 'en' ? pkg.features_en : pkg.features_tr,
      price: pkg.price,
      originalPrice: pkg.originalPrice,
      currency: pkg.currency,
      duration: language === 'en' ? pkg.duration_en : pkg.duration_tr,
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

    sendSuccess(res, { packages: formattedPackages });
  } catch (error) {
    console.error('Get packages error:', error);
    sendError(res, 'Failed to fetch packages', 500);
  }
}

async function getPackage(req, res, id) {
  try {
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
}

// ===============================
// OTHER FUNCTIONS
// ===============================

async function getTestimonials(req, res) {
  try {
    const { language = 'tr', limit } = req.query;

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

    sendSuccess(res, { testimonials: formattedTestimonials });
  } catch (error) {
    console.error('Get testimonials error:', error);
    sendError(res, 'Failed to fetch testimonials', 500);
  }
}

async function createTestimonial(req, res) {
  try {
    const testimonial = await Testimonial.create(req.body);
    sendSuccess(res, { testimonial }, 'Testimonial submitted successfully', 201);
  } catch (error) {
    console.error('Create testimonial error:', error);
    sendError(res, 'Failed to submit testimonial', 500);
  }
}

async function getFAQ(req, res) {
  try {
    const { language = 'tr' } = req.query;

    const categories = await FAQCategory.find({ isActive: true })
      .sort({ sortOrder: 1 });

    const items = await FAQItem.find({ isActive: true })
      .populate('category')
      .sort({ sortOrder: 1 });

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
}

async function submitContact(req, res) {
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
}

async function getContactInfo(req, res) {
  try {
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
  } catch (error) {
    console.error('Get contact info error:', error);
    sendError(res, 'Failed to get contact info', 500);
  }
}

async function getCategories(req, res) {
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
}
