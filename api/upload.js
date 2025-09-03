const { sendSuccess, sendError, handleCors } = require('../lib/response.js');
const { adminAuth } = require('../middleware/auth.js');

module.exports = async function handler(req, res) {
  if (handleCors(req, res)) return;
  
  const { method } = req;
  const url = new URL(req.url, `http://${req.headers.host}`);
  const segments = url.pathname.replace('/api/upload', '').split('/').filter(Boolean);

  try {
    // POST /api/upload/image - Upload single image (admin)
    if (method === 'POST' && segments[0] === 'image') {
      return await uploadImage(req, res);
    }

    // POST /api/upload/images - Upload multiple images (admin)
    if (method === 'POST' && segments[0] === 'images') {
      return await uploadImages(req, res);
    }

    sendError(res, 'Upload route not found', 404, 'ROUTE_NOT_FOUND');

  } catch (error) {
    console.error('Upload API error:', error);
    sendError(res, 'Internal server error', 500);
  }
};

async function uploadImage(req, res) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    // Basit bir mock response
    sendSuccess(res, { 
      url: 'https://via.placeholder.com/300x200',
      filename: 'uploaded-image.jpg',
      size: 12345
    }, 'Image uploaded successfully', 201);
  } catch (error) {
    console.error('Upload image error:', error);
    sendError(res, 'Failed to upload image', 500);
  }
}

async function uploadImages(req, res) {
  try {
    const authResult = await adminAuth(req, res);
    if (!authResult) return;

    // Basit bir mock response
    sendSuccess(res, { 
      urls: [
        'https://via.placeholder.com/300x200',
        'https://via.placeholder.com/300x201'
      ],
      count: 2
    }, 'Images uploaded successfully', 201);
  } catch (error) {
    console.error('Upload images error:', error);
    sendError(res, 'Failed to upload images', 500);
  }
}
