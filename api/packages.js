
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
      // Alt endpoint: /packages/home-featured
      if (req.url && req.url.includes('home-featured')) {
        const { language = 'tr' } = req.query || {};
        const query = { is_home_featured: true, language };
        let packages = await Package.find(query);
        res.status(200).json(packages);
        return;
      }
      // Diğer packages endpointleri
      const packages = await Package.find({});
      res.status(200).json(packages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
