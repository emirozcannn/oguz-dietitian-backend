export const config = { runtime: 'nodejs' };
import mongoose from 'mongoose';
import Testimonial from '../../models/Testimonial.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const MONGODB_URI = process.env.MONGODB_URI || '';
      await mongoose.connect(MONGODB_URI);
      
      const { language = 'tr', limit } = req.query || {};
      const query = { status: 'approved', language };
      let testimonials = await Testimonial.find(query);
      if (limit) testimonials = testimonials.slice(0, Number(limit));
      
      res.status(200).json(testimonials);
    } catch (error) {
      console.error('Testimonials approved error:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
