
export const config = { runtime: 'nodejs' };
import mongoose from 'mongoose';
import Package from '../models/Package.js';

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
      
      const { language = 'tr', type } = req.query || {};
      
      // Alt endpoint: ?type=home-featured
      if (type === 'home-featured') {
        const query = { is_home_featured: true, language };
        const packages = await Package.find(query);
        res.status(200).json({ success: true, data: packages });
        return;
      }
      
      // Alt endpoint: ?type=popular
      if (type === 'popular') {
        const query = { is_popular: true, language };
        const packages = await Package.find(query);
        res.status(200).json({ success: true, data: packages });
        return;
      }
      
      // Ana packages endpointleri
      const packages = await Package.find({ language });
      res.status(200).json({ success: true, data: packages });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
