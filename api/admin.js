const { connectDB } = require('../lib/db.js');
const { sendSuccess, sendError, handleCors } = require('../lib/response.js');
const { adminAuth } = require('../middleware/auth.js');

// Models
const User = require('../models/User.js');
const Post = require('../models/Post.js');
const Package = require('../models/Package.js');
const Testimonial = require('../models/Testimonial.js');
const Contact = require('../models/Contact.js');
const Category = require('../models/Category.js');
const { FAQCategory, FAQItem } = require('../models/FAQ.js');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  await connectDB();

  try {
    const { path: pathname, method } = req.query;
    const segments = pathname ? pathname.split('/').filter(Boolean) : [];

    // Route: GET /admin/dashboard
    if (method === 'GET' && segments[0] === 'admin' && segments[1] === 'dashboard') {
      return await getDashboardStats(req, res);
    }

    // Route: GET /admin/users
    if (method === 'GET' && segments[0] === 'admin' && segments[1] === 'users' && !segments[2]) {
      return await getUsers(req, res);
    }

    // Route: PUT /admin/users/:id/status
    if (method === 'PUT' && segments[0] === 'admin' && segments[1] === 'users' && segments[3] === 'status') {
      return await updateUserStatus(req, res, segments[2]);
    }

    // Route: PUT /admin/blog/:id
    if (method === 'PUT' && segments[0] === 'admin' && segments[1] === 'blog' && segments[2]) {
      return await updateBlogPost(req, res, segments[2]);
    }

    // Route: DELETE /admin/blog/:id
    if (method === 'DELETE' && segments[0] === 'admin' && segments[1] === 'blog' && segments[2]) {
      return await deleteBlogPost(req, res, segments[2]);
    }

    // Route: POST /admin/packages
    if (method === 'POST' && segments[0] === 'admin' && segments[1] === 'packages' && !segments[2]) {
      return await createPackage(req, res);
    }

    // Route: PUT /admin/packages/:id
    if (method === 'PUT' && segments[0] === 'admin' && segments[1] === 'packages' && segments[2]) {
      return await updatePackage(req, res, segments[2]);
    }

    // Route: GET /admin/testimonials
    if (method === 'GET' && segments[0] === 'admin' && segments[1] === 'testimonials' && !segments[2]) {
      return await getTestimonials(req, res);
    }

    // Route: PUT /admin/testimonials/:id/status
    if (method === 'PUT' && segments[0] === 'admin' && segments[1] === 'testimonials' && segments[3] === 'status') {
      return await updateTestimonialStatus(req, res, segments[2]);
    }

    // Route: GET /admin/contacts
    if (method === 'GET' && segments[0] === 'admin' && segments[1] === 'contacts' && !segments[2]) {
      return await getContacts(req, res);
    }

    // Route: PUT /admin/contacts/:id
    if (method === 'PUT' && segments[0] === 'admin' && segments[1] === 'contacts' && segments[2]) {
      return await updateContact(req, res, segments[2]);
    }

    // Route: POST /admin/categories
    if (method === 'POST' && segments[0] === 'admin' && segments[1] === 'categories' && !segments[2]) {
      return await createCategory(req, res);
    }

    // Route: PUT /admin/categories/:id
    if (method === 'PUT' && segments[0] === 'admin' && segments[1] === 'categories' && segments[2]) {
      return await updateCategory(req, res, segments[2]);
    }

    // Route: POST /admin/faq/categories
    if (method === 'POST' && segments[0] === 'admin' && segments[1] === 'faq' && segments[2] === 'categories') {
      return await createFAQCategory(req, res);
    }

    // Route: POST /admin/faq/items
    if (method === 'POST' && segments[0] === 'admin' && segments[1] === 'faq' && segments[2] === 'items') {
      return await createFAQItem(req, res);
    }

    sendError(res, 'Admin route not found', 404, 'ROUTE_NOT_FOUND');

  } catch (error) {
    console.error('Admin API error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

// ===============================
// ADMIN DASHBOARD
// ===============================

async function getDashboardStats(req, res) {
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
}

// ===============================
// USER MANAGEMENT
// ===============================

async function getUsers(req, res) {
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
}

async function updateUserStatus(req, res, id) {
  try {
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
}

// ===============================
// BLOG MANAGEMENT
// ===============================

async function updateBlogPost(req, res, id) {
  try {
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
}

async function deleteBlogPost(req, res, id) {
  try {
    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      return sendError(res, 'Post not found', 404, 'POST_NOT_FOUND');
    }

    sendSuccess(res, null, 'Post deleted successfully');
  } catch (error) {
    console.error('Delete post error:', error);
    sendError(res, 'Failed to delete post', 500);
  }
}

// ===============================
// PACKAGE MANAGEMENT
// ===============================

async function createPackage(req, res) {
  try {
    const pkg = await Package.create(req.body);
    const populatedPackage = await Package.findById(pkg._id).populate('category');

    sendSuccess(res, { package: populatedPackage }, 'Package created successfully', 201);
  } catch (error) {
    console.error('Create package error:', error);
    sendError(res, 'Failed to create package', 500);
  }
}

async function updatePackage(req, res, id) {
  try {
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
}

// ===============================
// TESTIMONIAL MANAGEMENT
// ===============================

async function getTestimonials(req, res) {
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
}

async function updateTestimonialStatus(req, res, id) {
  try {
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
}

// ===============================
// CONTACT MANAGEMENT
// ===============================

async function getContacts(req, res) {
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
}

async function updateContact(req, res, id) {
  try {
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
}

// ===============================
// CATEGORY MANAGEMENT
// ===============================

async function createCategory(req, res) {
  try {
    const category = await Category.create(req.body);
    sendSuccess(res, { category }, 'Category created successfully', 201);
  } catch (error) {
    console.error('Create category error:', error);
    sendError(res, 'Failed to create category', 500);
  }
}

async function updateCategory(req, res, id) {
  try {
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
}

// ===============================
// FAQ MANAGEMENT
// ===============================

async function createFAQCategory(req, res) {
  try {
    const category = await FAQCategory.create(req.body);
    sendSuccess(res, { category }, 'FAQ category created successfully', 201);
  } catch (error) {
    console.error('Create FAQ category error:', error);
    sendError(res, 'Failed to create FAQ category', 500);
  }
}

async function createFAQItem(req, res) {
  try {
    const item = await FAQItem.create(req.body);
    const populatedItem = await FAQItem.findById(item._id).populate('category');

    sendSuccess(res, { item: populatedItem }, 'FAQ item created successfully', 201);
  } catch (error) {
    console.error('Create FAQ item error:', error);
    sendError(res, 'Failed to create FAQ item', 500);
  }
}
