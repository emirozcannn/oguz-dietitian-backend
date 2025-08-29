import express from 'express';
import { testimonials } from '../src/lib/mongoClient.js';

const router = express.Router();

// Get approved testimonials
router.get('/approved', async (req, res) => {
  try {
    const { language = 'tr', limit } = req.query;
    const data = await testimonials.getApproved(language, limit ? parseInt(limit) : null);

    res.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('❌ Testimonials fetch error:', error.message);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
