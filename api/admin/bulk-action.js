const { connectDB } = require('../../lib/db.js');
const { sendSuccess, sendError, handleCors } = require('../../lib/response.js');
const { adminAuth } = require('../../middleware/auth.js');
const User = require('../../models/User.js');
const Contact = require('../../models/Contact.js');
const Testimonial = require('../../models/Testimonial.js');
const Post = require('../../models/Post.js');
const Package = require('../../models/Package.js');
const { FAQItem, FAQCategory } = require('../../models/FAQ.js');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  await connectDB();

  const { method } = req;

  try {
    // POST /api/admin/bulk-action - Perform bulk actions
    if (method === 'POST') {
      return await performBulkAction(req, res);
    }

    sendError(res, 'Bulk action route not found', 404, 'ROUTE_NOT_FOUND');

  } catch (error) {
    console.error('Bulk action API error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

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
