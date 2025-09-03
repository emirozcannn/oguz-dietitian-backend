const { connectDB } = require('../../lib/db.js');
const { sendSuccess, sendError, handleCors } = require('../../lib/response.js');
const { adminAuth } = require('../../middleware/auth.js');
const User = require('../../models/User.js');
const Post = require('../../models/Post.js');
const Package = require('../../models/Package.js');
const Testimonial = require('../../models/Testimonial.js');
const Contact = require('../../models/Contact.js');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  await connectDB();

  const { method } = req;

  try {
    // Admin auth middleware first
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    // GET /api/admin/dashboard - Get dashboard stats
    if (method === 'GET') {
      return await getDashboardStats(req, res);
    }

    sendError(res, 'Admin dashboard route not found', 404, 'ROUTE_NOT_FOUND');

  } catch (error) {
    console.error('Admin Dashboard API error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

// Dashboard functions
async function getDashboardStats(req, res) {
  try {
    // Get counts for different entities
    const [
      totalUsers,
      totalPosts,
      publishedPosts,
      totalPackages,
      activePackages,
      totalTestimonials,
      approvedTestimonials,
      totalContacts,
      recentContacts
    ] = await Promise.all([
      User.countDocuments({ role: 'client' }),
      Post.countDocuments(),
      Post.countDocuments({ status: 'published' }),
      Package.countDocuments(),
      Package.countDocuments({ isActive: true }),
      Testimonial.countDocuments(),
      Testimonial.countDocuments({ status: 'approved' }),
      Contact.countDocuments(),
      Contact.find().sort({ createdAt: -1 }).limit(5)
    ]);

    // Calculate some additional stats
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
          }
        }
      },
      {
        $group: {
          _id: null,
          count: { $sum: 1 }
        }
      }
    ]);

    const newUsersThisMonth = userGrowth[0]?.count || 0;

    const stats = {
      users: {
        total: totalUsers,
        newThisMonth: newUsersThisMonth,
        growth: totalUsers > 0 ? ((newUsersThisMonth / totalUsers) * 100).toFixed(1) : 0
      },
      posts: {
        total: totalPosts,
        published: publishedPosts,
        draft: totalPosts - publishedPosts,
        publishedPercentage: totalPosts > 0 ? ((publishedPosts / totalPosts) * 100).toFixed(1) : 0
      },
      packages: {
        total: totalPackages,
        active: activePackages,
        inactive: totalPackages - activePackages,
        activePercentage: totalPackages > 0 ? ((activePackages / totalPackages) * 100).toFixed(1) : 0
      },
      testimonials: {
        total: totalTestimonials,
        approved: approvedTestimonials,
        pending: totalTestimonials - approvedTestimonials,
        approvalRate: totalTestimonials > 0 ? ((approvedTestimonials / totalTestimonials) * 100).toFixed(1) : 0
      },
      contacts: {
        total: totalContacts,
        recent: recentContacts
      }
    };

    sendSuccess(res, { stats }, 'Dashboard stats retrieved successfully');
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    sendError(res, 'Failed to fetch dashboard stats', 500);
  }
}
