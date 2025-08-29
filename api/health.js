export default function handler(req, res) {
  res.status(200).json({ 
    success: true, 
    data: { 
      status: 'OK', 
      message: 'API is running', 
      timestamp: new Date().toISOString() 
    } 
  });
}
