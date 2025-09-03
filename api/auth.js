const { connectDB } = require('../lib/db.js');
const { sendSuccess, sendError, handleCors } = require('../lib/response.js');
const { auth, adminAuth } = require('../middleware/auth.js');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  await connectDB();

  const { method } = req;
  const url = new URL(req.url, `http://${req.headers.host}`);
  const segments = url.pathname.replace('/api/auth/', '').split('/').filter(Boolean);

  try {
    // POST /api/auth/login
    if (method === 'POST' && (segments[0] === 'login' || segments.length === 0)) {
      return await login(req, res);
    }

    // POST /api/auth/register  
    if (method === 'POST' && segments[0] === 'register') {
      return await register(req, res);
    }

    // GET /api/auth/me
    if (method === 'GET' && segments[0] === 'me') {
      return await getCurrentUser(req, res);
    }

    // PUT /api/auth/profile
    if (method === 'PUT' && segments[0] === 'profile') {
      return await updateProfile(req, res);
    }

    sendError(res, 'Auth route not found', 404, 'ROUTE_NOT_FOUND');

  } catch (error) {
    console.error('Auth API error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

// Auth functions
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
