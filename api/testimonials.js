
export const config = { runtime: 'nodejs' };
import mongoose from 'mongoose';
import Testimonial from '../models/Testimonial.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI || '';
  if (req.method === 'GET') {
    try {
      await mongoose.connect(MONGODB_URI);
      // Alt endpoint: /testimonials/approved
      if (req.url && req.url.includes('approved')) {
        const { language = 'tr', limit } = req.query || {};
        const query = { status: 'approved', language };
        let testimonials = await Testimonial.find(query);
        if (limit) testimonials = testimonials.slice(0, Number(limit));
        res.status(200).json(testimonials);
        return;
      }
      // Diğer testimonial endpointleri
      const testimonials = await Testimonial.find({});
      res.status(200).json(testimonials);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
