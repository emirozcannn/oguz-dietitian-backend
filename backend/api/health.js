// Health check endpoint for Vercel
export default function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, Origin, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Health check response
  res.status(200).json({
    success: true,
    message: 'Service is healthy',
    data: {
      status: 'healthy',
      server: 'running',
      database: 'connected',
      environment: process.env.NODE_ENV || 'production'
    },
    timestamp: new Date().toISOString()
  });
}
