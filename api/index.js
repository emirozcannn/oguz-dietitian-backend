const { connectDB } = require('../lib/db.js');
const { sendSuccess, sendError, handleCors } = require('../lib/response.js');

// Simple routing handler - Main API entry point
module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  await connectDB();

  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathname = url.pathname.replace('/api', '');
    
    // Health check
    if (pathname === '/health' || pathname === '/') {
      return sendSuccess(res, {
        status: 'ok',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: 'connected'
      }, 'API is healthy');
    }

    // Route not found in main handler
    sendError(res, `Route ${pathname} not found. Use specific endpoint files.`, 404, 'ROUTE_NOT_FOUND');

  } catch (error) {
    console.error('API error:', error);
    sendError(res, 'Internal server error', 500);
  }
};
