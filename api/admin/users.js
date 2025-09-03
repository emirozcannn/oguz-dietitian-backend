const { connectDB } = require('../../lib/db.js');
const { sendSuccess, sendError, handleCors } = require('../../lib/response.js');
const { adminAuth } = require('../../middleware/auth.js');
const User = require('../../models/User.js');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  await connectDB();

  const { method } = req;
  const url = new URL(req.url, `http://${req.headers.host}`);
  const segments = url.pathname.replace('/api/admin/users', '').split('/').filter(Boolean);

  try {
    // GET /api/admin/users - Get all users
    if (method === 'GET' && segments.length === 0) {
      return await getUsers(req, res);
    }

    // PUT /api/admin/users/:id/status - Update user status
    if (method === 'PUT' && segments[0] && segments[1] === 'status') {
      return await updateUserStatus(req, res, segments[0]);
    }

    // DELETE /api/admin/users/:id - Delete user
    if (method === 'DELETE' && segments[0]) {
      return await deleteUser(req, res, segments[0]);
    }

    sendError(res, 'Users admin route not found', 404, 'ROUTE_NOT_FOUND');

  } catch (error) {
    console.error('Users admin API error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

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
