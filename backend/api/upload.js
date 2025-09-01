import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { connectDB } from '../utils/db.js';
import { corsMiddleware, securityMiddleware, rateLimitMiddleware, errorHandler } from '../middleware/common.js';
import { auth, adminAuth } from '../middleware/auth.js';

const app = express();

// Apply middleware
app.use(corsMiddleware);
app.use(securityMiddleware);
app.use(rateLimitMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Connect to database
connectDB().catch(console.error);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Helper functions
const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  });
};

const sendError = (res, error = 'An error occurred', statusCode = 500, code = 'INTERNAL_ERROR') => {
  res.status(statusCode).json({
    success: false,
    error,
    code,
    timestamp: new Date().toISOString()
  });
};

// Upload single image
app.post('/api/upload/image', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 'No image file provided', 400, 'NO_FILE');
    }

    const { type = 'general' } = req.body;

    // Define folder based on type
    const folderMap = {
      profile: 'profiles',
      blog: 'blog-images',
      package: 'packages',
      testimonial: 'testimonials',
      general: 'uploads'
    };

    const folder = folderMap[type] || 'uploads';

    // Convert buffer to base64
    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(fileStr, {
      folder: `oguz-dietitian/${folder}`,
      public_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto:good' },
        { format: 'auto' }
      ]
    });

    const imageData = {
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      width: uploadResponse.width,
      height: uploadResponse.height,
      format: uploadResponse.format,
      size: uploadResponse.bytes,
      uploadedBy: req.user.id,
      type: type
    };

    sendSuccess(res, imageData, 'Image uploaded successfully');

  } catch (error) {
    console.error('Upload error:', error);
    if (error.message === 'Only image files are allowed') {
      return sendError(res, error.message, 400, 'INVALID_FILE_TYPE');
    }
    sendError(res, 'Failed to upload image', 500);
  }
});

// Upload multiple images
app.post('/api/upload/images', auth, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return sendError(res, 'No image files provided', 400, 'NO_FILES');
    }

    const { type = 'general' } = req.body;

    const folderMap = {
      profile: 'profiles',
      blog: 'blog-images',
      package: 'packages',
      testimonial: 'testimonials',
      general: 'uploads'
    };

    const folder = folderMap[type] || 'uploads';

    // Upload all images to Cloudinary
    const uploadPromises = req.files.map(async (file) => {
      const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
      
      const uploadResponse = await cloudinary.uploader.upload(fileStr, {
        folder: `oguz-dietitian/${folder}`,
        public_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        transformation: [
          { width: 1200, height: 800, crop: 'limit' },
          { quality: 'auto:good' },
          { format: 'auto' }
        ]
      });

      return {
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
        width: uploadResponse.width,
        height: uploadResponse.height,
        format: uploadResponse.format,
        size: uploadResponse.bytes,
        uploadedBy: req.user.id,
        type: type
      };
    });

    const uploadedImages = await Promise.all(uploadPromises);

    sendSuccess(res, { images: uploadedImages }, 'Images uploaded successfully');

  } catch (error) {
    console.error('Multiple upload error:', error);
    sendError(res, 'Failed to upload images', 500);
  }
});

// Delete image
app.delete('/api/upload/:publicId', adminAuth, async (req, res) => {
  try {
    const { publicId } = req.params;
    
    // Delete from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result === 'ok') {
      sendSuccess(res, null, 'Image deleted successfully');
    } else {
      sendError(res, 'Failed to delete image', 400, 'DELETE_FAILED');
    }

  } catch (error) {
    console.error('Delete image error:', error);
    sendError(res, 'Failed to delete image', 500);
  }
});

// Base64 upload (for simple cases without file input)
app.post('/api/upload/base64', auth, async (req, res) => {
  try {
    const { imageData, type = 'general', filename } = req.body;

    if (!imageData) {
      return sendError(res, 'No image data provided', 400, 'NO_DATA');
    }

    const folderMap = {
      profile: 'profiles',
      blog: 'blog-images',
      package: 'packages',
      testimonial: 'testimonials',
      general: 'uploads'
    };

    const folder = folderMap[type] || 'uploads';

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(imageData, {
      folder: `oguz-dietitian/${folder}`,
      public_id: filename ? `${filename}-${Date.now()}` : `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      transformation: [
        { width: 1200, height: 800, crop: 'limit' },
        { quality: 'auto:good' },
        { format: 'auto' }
      ]
    });

    const responseData = {
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      width: uploadResponse.width,
      height: uploadResponse.height,
      format: uploadResponse.format,
      size: uploadResponse.bytes,
      uploadedBy: req.user.id,
      type: type
    };

    sendSuccess(res, responseData, 'Image uploaded successfully');

  } catch (error) {
    console.error('Base64 upload error:', error);
    sendError(res, 'Failed to upload image', 500);
  }
});

// Health check for upload service
app.get('/api/upload/health', (req, res) => {
  const isCloudinaryConfigured = !!(
    process.env.CLOUDINARY_NAME && 
    process.env.CLOUDINARY_API_KEY && 
    process.env.CLOUDINARY_API_SECRET
  );

  sendSuccess(res, {
    status: 'healthy',
    cloudinary: isCloudinaryConfigured ? 'configured' : 'not_configured',
    maxFileSize: '5MB',
    allowedTypes: ['image/*']
  });
});

// Apply error handler
app.use(errorHandler);

// Handle 404
app.all('*', (req, res) => {
  sendError(res, 'Upload route not found', 404, 'ROUTE_NOT_FOUND');
});

export default app;
