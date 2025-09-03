const { connectDB } = require('../lib/db.js');
const { sendSuccess, sendError, handleCors } = require('../lib/response.js');
const { adminAuth } = require('../middleware/auth.js');
const User = require('../models/User.js');
const Contact = require('../models/Contact.js');
const Testimonial = require('../models/Testimonial.js');
const Post = require('../models/Post.js');
const Package = require('../models/Package.js');
const { FAQItem, FAQCategory } = require('../models/FAQ.js');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  await connectDB();

  const { method } = req;
  const url = new URL(req.url, `http://${req.headers.host}`);
  const segments = url.pathname.replace('/api/admin', '').split('/').filter(Boolean);

  try {
    // Dashboard endpoint
    if (segments[0] === 'dashboard' && method === 'GET') {
      return await getDashboard(req, res);
    }

    // Blog admin endpoints
    if (segments[0] === 'blog') {
      if (method === 'GET') return await getBlogPosts(req, res);
      if (method === 'POST') return await createBlogPost(req, res);
      if (method === 'PUT' && segments[1]) return await updateBlogPost(req, res, segments[1]);
      if (method === 'DELETE' && segments[1]) return await deleteBlogPost(req, res, segments[1]);
    }

    // Contacts endpoints
    if (segments[0] === 'contacts') {
      if (method === 'GET') return await getContacts(req, res);
      if (method === 'PUT' && segments[1]) return await updateContact(req, res, segments[1]);
      if (method === 'DELETE' && segments[1]) return await deleteContact(req, res, segments[1]);
    }

    // Users endpoints
    if (segments[0] === 'users') {
      if (method === 'GET' && segments.length === 1) return await getUsers(req, res);
      if (method === 'PUT' && segments[1] && segments[2] === 'status') return await updateUserStatus(req, res, segments[1]);
      if (method === 'DELETE' && segments[1]) return await deleteUser(req, res, segments[1]);
    }

    // Bulk action endpoint
    if (segments[0] === 'bulk-action' && method === 'POST') {
      return await performBulkAction(req, res);
    }

    sendError(res, 'Admin route not found', 404, 'ROUTE_NOT_FOUND');

  } catch (error) {
    console.error('Admin API error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

// Dashboard function
async function getDashboard(req, res) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const [
      totalUsers,
      totalPosts,
      totalPackages,
      totalTestimonials,
      totalContacts,
      pendingTestimonials,
      unreadContacts
    ] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments(),
      Package.countDocuments(),
      Testimonial.countDocuments(),
      Contact.countDocuments(),
      Testimonial.countDocuments({ status: 'pending' }),
      Contact.countDocuments({ status: 'unread' })
    ]);

    const stats = {
      users: { total: totalUsers },
      posts: { total: totalPosts },
      packages: { total: totalPackages },
      testimonials: { total: totalTestimonials, pending: pendingTestimonials },
      contacts: { total: totalContacts, unread: unreadContacts }
    };

    sendSuccess(res, { stats });
  } catch (error) {
    console.error('Get dashboard error:', error);
    sendError(res, 'Failed to fetch dashboard data', 500);
  }
}

// Contacts functions
async function getContacts(req, res) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const { status, page = 1 } = req.query;
    const limit = 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (status) filter.status = status;

    const contacts = await Contact.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Contact.countDocuments(filter);

    sendSuccess(res, {
      contacts,
      pagination: {
        page: parseInt(page),
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    sendError(res, 'Failed to fetch contacts', 500);
  }
}

async function updateContact(req, res, id) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const { status, reply } = req.body;

    const updateData = { status };
    if (reply) updateData.reply = reply;
    if (status === 'replied') updateData.repliedAt = new Date();

    const contact = await Contact.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!contact) {
      return sendError(res, 'Contact not found', 404, 'CONTACT_NOT_FOUND');
    }

    sendSuccess(res, { contact }, 'Contact updated successfully');
  } catch (error) {
    console.error('Update contact error:', error);
    sendError(res, 'Failed to update contact', 500);
  }
}

async function deleteContact(req, res, id) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return sendError(res, 'Contact not found', 404, 'CONTACT_NOT_FOUND');
    }

    sendSuccess(res, { id }, 'Contact deleted successfully');
  } catch (error) {
    console.error('Delete contact error:', error);
    sendError(res, 'Failed to delete contact', 500);
  }
}

// Users functions
async function getUsers(req, res) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const { role, status, page = 1 } = req.query;
    const limit = 20;
    const skip = (page - 1) * limit;

    const filter = {};
    if (role) filter.role = role;
    if (status) filter.isActive = status === 'active';

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);

    sendSuccess(res, {
      users,
      pagination: {
        page: parseInt(page),
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    sendError(res, 'Failed to fetch users', 500);
  }
}

async function updateUserStatus(req, res, id) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const { isActive, role } = req.body;

    const updateData = { isActive };
    if (role) updateData.role = role;

    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
    }

    sendSuccess(res, { user }, 'User status updated successfully');
  } catch (error) {
    console.error('Update user status error:', error);
    sendError(res, 'Failed to update user status', 500);
  }
}

async function deleteUser(req, res, id) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    // Prevent deleting yourself
    if (req.user._id.toString() === id) {
      return sendError(res, 'Cannot delete your own account', 400, 'CANNOT_DELETE_SELF');
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return sendError(res, 'User not found', 404, 'USER_NOT_FOUND');
    }

    sendSuccess(res, { id }, 'User deleted successfully');
  } catch (error) {
    console.error('Delete user error:', error);
    sendError(res, 'Failed to delete user', 500);
  }
}

// Bulk action function
async function performBulkAction(req, res) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    const { action, type, ids } = req.body;

    if (!action || !type || !Array.isArray(ids) || ids.length === 0) {
      return sendError(res, 'Invalid bulk action parameters', 400, 'INVALID_PARAMETERS');
    }

    let Model;
    switch (type) {
      case 'users':
        Model = User;
        break;
      case 'contacts':
        Model = Contact;
        break;
      case 'testimonials':
        Model = Testimonial;
        break;
      case 'posts':
        Model = Post;
        break;
      case 'packages':
        Model = Package;
        break;
      case 'faq-items':
        Model = FAQItem;
        break;
      case 'faq-categories':
        Model = FAQCategory;
        break;
      default:
        return sendError(res, 'Invalid type', 400, 'INVALID_TYPE');
    }

    let result;
    switch (action) {
      case 'delete':
        result = await Model.deleteMany({ _id: { $in: ids } });
        break;
      case 'activate':
        result = await Model.updateMany(
          { _id: { $in: ids } },
          { $set: { isActive: true } }
        );
        break;
      case 'deactivate':
        result = await Model.updateMany(
          { _id: { $in: ids } },
          { $set: { isActive: false } }
        );
        break;
      case 'approve':
        result = await Model.updateMany(
          { _id: { $in: ids } },
          { $set: { status: 'approved', approvedAt: new Date() } }
        );
        break;
      case 'reject':
        result = await Model.updateMany(
          { _id: { $in: ids } },
          { $set: { status: 'rejected' } }
        );
        break;
      default:
        return sendError(res, 'Invalid action', 400, 'INVALID_ACTION');
    }

    sendSuccess(res, {
      action,
      type,
      affectedCount: result.modifiedCount || result.deletedCount,
      ids
    }, `Bulk ${action} completed successfully`);

  } catch (error) {
    console.error('Perform bulk action error:', error);
    sendError(res, 'Failed to perform bulk action', 500);
  }
}

// Blog Admin Functions
async function getBlogPosts(req, res) {
  try {
    const { 
      status = 'all',
      page = 1, 
      limit = 20,
      search = '',
      category,
      author 
    } = req.query;

    const query = {};
    
    if (status !== 'all') query.status = status;
    if (category) query.category = category;
    if (author) query.author = author;
    if (search) {
      query.$or = [
        { title_tr: { $regex: search, $options: 'i' } },
        { title_en: { $regex: search, $options: 'i' } },
        { content_tr: { $regex: search, $options: 'i' } },
        { content_en: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const posts = await Post.find(query)
      .populate('category', 'name_tr name_en')
      .populate('author', 'firstName lastName email')
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Post.countDocuments(query);

    sendSuccess(res, {
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get blog posts error:', error);
    sendError(res, 'Failed to fetch blog posts', 500);
  }
}

async function createBlogPost(req, res) {
  try {
    const postData = req.body;
    
    // Varsayılan değerler
    const newPost = new Post({
      ...postData,
      author: '674bc89c5fc7529b6a2b3c3b', // Default admin ID
      created_at: new Date(),
      updated_at: new Date(),
      published_at: postData.status === 'published' ? new Date() : null,
      view_count: 0,
      like_count: 0,
      comment_count: 0
    });

    const savedPost = await newPost.save();
    
    sendSuccess(res, savedPost, 'Blog post created successfully');
  } catch (error) {
    console.error('Create blog post error:', error);
    sendError(res, 'Failed to create blog post', 500);
  }
}

async function updateBlogPost(req, res, postId) {
  try {
    const postData = req.body;
    
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      {
        ...postData,
        updated_at: new Date(),
        published_at: postData.status === 'published' && !postData.published_at ? new Date() : postData.published_at
      },
      { new: true }
    ).populate('category', 'name_tr name_en');

    if (!updatedPost) {
      return sendError(res, 'Blog post not found', 404, 'POST_NOT_FOUND');
    }

    sendSuccess(res, updatedPost, 'Blog post updated successfully');
  } catch (error) {
    console.error('Update blog post error:', error);
    sendError(res, 'Failed to update blog post', 500);
  }
}

async function deleteBlogPost(req, res, postId) {
  try {
    const deletedPost = await Post.findByIdAndDelete(postId);

    if (!deletedPost) {
      return sendError(res, 'Blog post not found', 404, 'POST_NOT_FOUND');
    }

    sendSuccess(res, { id: postId }, 'Blog post deleted successfully');
  } catch (error) {
    console.error('Delete blog post error:', error);
    sendError(res, 'Failed to delete blog post', 500);
  }
}
