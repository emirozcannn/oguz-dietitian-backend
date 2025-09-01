import express from 'express';
import { connectDB } from '../utils/db.js';
import { corsMiddleware, securityMiddleware, rateLimitMiddleware, errorHandler } from '../middleware/common.js';
import { adminAuth } from '../middleware/auth.js';

// Models
import User from '../models/User.js';
import Post from '../models/Post.js';
import Package from '../models/Package.js';
import Testimonial from '../models/Testimonial.js';
import Contact from '../models/Contact.js';
import Category from '../models/Category.js';
import { FAQCategory, FAQItem } from '../models/FAQ.js';

const app = express();

// Apply middleware
app.use(corsMiddleware);
app.use(securityMiddleware);
app.use(rateLimitMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to database
connectDB().catch(console.error);

// Helper functions
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

const sendError = (res, error = 'An error occurred', statusCode = 500, code = 'INTERNAL_ERROR') => {
  res.status(statusCode).json({
    success: false,
    error,
    code,
    timestamp: new Date().toISOString()
  });
};

// ===============================
// ADMIN DASHBOARD
// ===============================

// Get dashboard stats
app.get('/api/admin/dashboard', adminAuth, async (req, res) => {
  try {
    const [
      totalUsers,
      totalPosts,
      totalPackages,
      totalTestimonials,
      totalContacts,
      recentUsers,
      recentContacts,
      pendingTestimonials
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments({ status: 'published' }),
      Package.countDocuments({ isActive: true }),
      Testimonial.countDocuments({ status: 'approved' }),
      Contact.countDocuments(),
      User.find().sort({ createdAt: -1 }).limit(5).select('firstName lastName email createdAt'),
      Contact.find().sort({ createdAt: -1 }).limit(5).select('firstName lastName email subject status createdAt'),
      Testimonial.countDocuments({ status: 'pending' })
    ]);

    const stats = {
      users: {
        total: totalUsers,
        recent: recentUsers
      },
      posts: {
        total: totalPosts,
        published: totalPosts
      },
      packages: {
        total: totalPackages,
        active: totalPackages
      },
      testimonials: {
        total: totalTestimonials,
        pending: pendingTestimonials
      },
      contacts: {
        total: totalContacts,
        recent: recentContacts
      }
    };

    sendSuccess(res, stats);

  } catch (error) {
    console.error('Dashboard stats error:', error);
    sendError(res, 'Failed to fetch dashboard stats', 500);
  }
});

// ===============================
// USER MANAGEMENT
// ===============================

// Get all users
app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const { role, status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (role) query.role = role;
    if (status) query.isActive = status === 'active';

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-password'),
      User.countDocuments(query)
    ]);

    sendSuccess(res, {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    sendError(res, 'Failed to fetch users', 500);
  }
});

// Update user status
app.put('/api/admin/users/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, role } = req.body;

    const updateData = {};
    if (typeof isActive === 'boolean') updateData.isActive = isActive;
    if (role) updateData.role = role;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).select('-password');

    if (!user) {
      return sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
    }

    sendSuccess(res, { user }, 'User updated successfully');

  } catch (error) {
    console.error('Update user error:', error);
    sendError(res, 'Failed to update user', 500);
  }
});

// ===============================
// BLOG MANAGEMENT
// ===============================

// Update blog post
app.put('/api/admin/blog/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category').populate('author', 'firstName lastName');

    if (!post) {
      return sendError(res, 'Post not found', 404, 'POST_NOT_FOUND');
    }

    sendSuccess(res, { post }, 'Post updated successfully');

  } catch (error) {
    console.error('Update post error:', error);
    sendError(res, 'Failed to update post', 500);
  }
});

// Delete blog post
app.delete('/api/admin/blog/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      return sendError(res, 'Post not found', 404, 'POST_NOT_FOUND');
    }

    sendSuccess(res, null, 'Post deleted successfully');

  } catch (error) {
    console.error('Delete post error:', error);
    sendError(res, 'Failed to delete post', 500);
  }
});

// ===============================
// PACKAGE MANAGEMENT
// ===============================

// Create package
app.post('/api/admin/packages', adminAuth, async (req, res) => {
  try {
    const pkg = await Package.create(req.body);
    const populatedPackage = await Package.findById(pkg._id).populate('category');

    sendSuccess(res, { package: populatedPackage }, 'Package created successfully', 201);

  } catch (error) {
    console.error('Create package error:', error);
    sendError(res, 'Failed to create package', 500);
  }
});

// Update package
app.put('/api/admin/packages/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const pkg = await Package.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('category');

    if (!pkg) {
      return sendError(res, 'Package not found', 404, 'PACKAGE_NOT_FOUND');
    }

    sendSuccess(res, { package: pkg }, 'Package updated successfully');

  } catch (error) {
    console.error('Update package error:', error);
    sendError(res, 'Failed to update package', 500);
  }
});

// ===============================
// TESTIMONIAL MANAGEMENT
// ===============================

// Get all testimonials (for admin)
app.get('/api/admin/testimonials', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [testimonials, total] = await Promise.all([
      Testimonial.find(query)
        .populate('packageUsed', 'title_tr title_en')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Testimonial.countDocuments(query)
    ]);

    sendSuccess(res, {
      testimonials,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get admin testimonials error:', error);
    sendError(res, 'Failed to fetch testimonials', 500);
  }
});

// Update testimonial status
app.put('/api/admin/testimonials/:id/status', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, isVisible } = req.body;

    const updateData = {};
    if (status) {
      updateData.status = status;
      if (status === 'approved') {
        updateData.approvedAt = new Date();
        updateData.approvedBy = req.user.id;
      }
    }
    if (typeof isVisible === 'boolean') updateData.isVisible = isVisible;

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!testimonial) {
      return sendError(res, 'Testimonial not found', 404, 'TESTIMONIAL_NOT_FOUND');
    }

    sendSuccess(res, { testimonial }, 'Testimonial updated successfully');

  } catch (error) {
    console.error('Update testimonial error:', error);
    sendError(res, 'Failed to update testimonial', 500);
  }
});

// ===============================
// CONTACT MANAGEMENT
// ===============================

// Get contact messages
app.get('/api/admin/contacts', adminAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    const query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [contacts, total] = await Promise.all([
      Contact.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Contact.countDocuments(query)
    ]);

    sendSuccess(res, {
      contacts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });

  } catch (error) {
    console.error('Get contacts error:', error);
    sendError(res, 'Failed to fetch contacts', 500);
  }
});

// Update contact message
app.put('/api/admin/contacts/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, reply } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (reply) {
      updateData.reply = reply;
      updateData.repliedAt = new Date();
      updateData.repliedBy = req.user.id;
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!contact) {
      return sendError(res, 'Contact message not found', 404, 'CONTACT_NOT_FOUND');
    }

    sendSuccess(res, { contact }, 'Contact message updated successfully');

  } catch (error) {
    console.error('Update contact error:', error);
    sendError(res, 'Failed to update contact message', 500);
  }
});

// ===============================
// CATEGORY MANAGEMENT
// ===============================

// Create category
app.post('/api/admin/categories', adminAuth, async (req, res) => {
  try {
    const category = await Category.create(req.body);
    sendSuccess(res, { category }, 'Category created successfully', 201);

  } catch (error) {
    console.error('Create category error:', error);
    sendError(res, 'Failed to create category', 500);
  }
});

// Update category
app.put('/api/admin/categories/:id', adminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const category = await Category.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!category) {
      return sendError(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    sendSuccess(res, { category }, 'Category updated successfully');

  } catch (error) {
    console.error('Update category error:', error);
    sendError(res, 'Failed to update category', 500);
  }
});

// ===============================
// FAQ MANAGEMENT
// ===============================

// Create FAQ category
app.post('/api/admin/faq/categories', adminAuth, async (req, res) => {
  try {
    const category = await FAQCategory.create(req.body);
    sendSuccess(res, { category }, 'FAQ category created successfully', 201);

  } catch (error) {
    console.error('Create FAQ category error:', error);
    sendError(res, 'Failed to create FAQ category', 500);
  }
});

// Create FAQ item
app.post('/api/admin/faq/items', adminAuth, async (req, res) => {
  try {
    const item = await FAQItem.create(req.body);
    const populatedItem = await FAQItem.findById(item._id).populate('category');

    sendSuccess(res, { item: populatedItem }, 'FAQ item created successfully', 201);

  } catch (error) {
    console.error('Create FAQ item error:', error);
    sendError(res, 'Failed to create FAQ item', 500);
  }
});

// Apply error handler
app.use(errorHandler);

// Handle 404
app.all('*', (req, res) => {
  sendError(res, 'Admin route not found', 404, 'ROUTE_NOT_FOUND');
});

export default app;
