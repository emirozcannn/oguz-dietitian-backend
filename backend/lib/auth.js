import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifyToken = async (req) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.substring(7);
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    throw new Error('Invalid token');
  }
};

export const requireAuth = async (req) => {
  const user = await verifyToken(req);
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
};

export const requireAdmin = async (req) => {
  const user = await requireAuth(req);
  if (user.role !== 'admin') {
    throw new Error('Admin access required');
  }
  return user;
};
