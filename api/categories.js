
export const config = { runtime: 'nodejs' };
import mongoose from 'mongoose';
import Category from '../models/Category.js';

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
      
      const { type } = req.query || {};
      
      // Alt endpoint: ?type=public (FAQ categories için)
      if (type === 'public') {
        const categories = await Category.find({ is_active: true }).sort({ order_index: 1 });
        res.status(200).json(categories);
        return;
      }
      
      // Ana categories endpointleri
      const categories = await Category.find({});
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
