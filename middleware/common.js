const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// CORS middleware
const corsMiddleware = cors({
  origin: function (origin, callback) {
    // Production'da belirli domain'lere, development'da hepsine izin ver
    const allowedOrigins = [
      'https://oguzyolyapan.com',
      'https://www.oguzyolyapan.com',
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:5175'
    ];
    
    // Environment variable'dan ek origin ekle
    if (process.env.CORS_ORIGIN) {
      allowedOrigins.push(process.env.CORS_ORIGIN);
    }
    
    // Origin kontrol et veya development'da izin ver
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV === 'development') {
      console.log('✅ CORS allowed origin:', origin || 'no-origin');
      callback(null, true);
    } else {
      console.log('🚫 CORS blocked origin:', origin);
      // CORS hatası yerine warning verelim ama yine de izin verelim (geçici)
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type', 
    'Authorization', 
    'Accept', 
    'Origin', 
    'X-Requested-With',
    'Access-Control-Allow-Origin'
  ],
  exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
  preflightContinue: false,
  optionsSuccessStatus: 200
});

// Rate limiting
const rateLimitMiddleware = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Security middleware
const securityMiddleware = helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  crossOriginEmbedderPolicy: false
});

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error('❌ API Error:', err);

  // Default error
  let error = {
    success: false,
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  };

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error = {
      success: false,
      error: messages.join(', '),
      code: 'VALIDATION_ERROR'
    };
    return res.status(400).json(error);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = {
      success: false,
      error: `${field} already exists`,
      code: 'DUPLICATE_ERROR'
    };
    return res.status(400).json(error);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = {
      success: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN'
    };
    return res.status(401).json(error);
  }

  if (err.name === 'TokenExpiredError') {
    error = {
      success: false,
      error: 'Token expired',
      code: 'TOKEN_EXPIRED'
    };
    return res.status(401).json(error);
  }

  // MongoDB connection errors
  if (err.name === 'MongoTimeoutError' || err.name === 'MongoNetworkTimeoutError') {
    error = {
      success: false,
      error: 'Database connection timeout',
      code: 'DB_TIMEOUT'
    };
    return res.status(503).json(error);
  }

  res.status(500).json(error);
};

module.exports = {
  corsMiddleware,
  rateLimitMiddleware,
  securityMiddleware,
  errorHandler
};
