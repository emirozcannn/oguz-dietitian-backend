
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
      
      const { language = 'tr' } = req.query || {};
      
      // Alt endpoint: /packages/home-featured
      if (req.url && req.url.includes('home-featured')) {
        const query = { is_home_featured: true, language };
        const packages = await Package.find(query);
        res.status(200).json(packages);
        return;
      }
      
      // Alt endpoint: /packages/popular
      if (req.url && req.url.includes('popular')) {
        const query = { is_popular: true, language };
        const packages = await Package.find(query);
        res.status(200).json(packages);
        return;
      }
      
      // Ana packages endpointleri
      const packages = await Package.find({ language });
      res.status(200).json(packages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
