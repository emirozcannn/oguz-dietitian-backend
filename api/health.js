const { connectDB } = require('../lib/db.js');
const { sendSuccess, sendError, handleCors } = require('../lib/response.js');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;

  try {
    await connectDB();
    
    sendSuccess(res, {
      status: 'healthy',
      server: 'running',
      database: 'connected',
      environment: process.env.NODE_ENV || 'production',
      timestamp: new Date().toISOString()
    }, 'Service is healthy');

  } catch (error) {
    console.error('Health check error:', error);
    sendError(res, 'Service unhealthy', 500);
  }
};
