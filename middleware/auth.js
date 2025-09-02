const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided',
        code: 'NO_TOKEN'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    req.user = user;
    if (next) next();
    return true;
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
    return false;
  }
};

const adminAuth = async (req, res, next) => {
  try {
    const authResult = await auth(req, res);
    if (!authResult) return false;
    
    if (req.user && (req.user.role === 'admin' || req.user.role === 'super_admin')) {
      if (next) next();
      return true;
    } else {
      res.status(403).json({
        success: false,
        error: 'Admin access required',
        code: 'ADMIN_REQUIRED'
      });
      return false;
    }
  } catch (error) {
    res.status(401).json({
      success: false,
      error: 'Authentication failed',
      code: 'AUTH_FAILED'
    });
    return false;
  }
};

module.exports = { auth, adminAuth };
