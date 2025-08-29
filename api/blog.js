

export const config = { runtime: 'nodejs' };
import mongoose from 'mongoose';
import Post from '../models/Post.js';

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
      // Alt endpoint: /blog/featured
      if (req.url && req.url.includes('featured')) {
        const { language = 'tr', limit = 3 } = req.query || {};
        const query = { is_featured: true, language };
        let posts = await Post.find(query);
        posts = posts.slice(0, Number(limit));
        res.status(200).json(posts);
        return;
      }
      // Diğer blog endpointleri
      const posts = await Post.find({});
      res.status(200).json(posts);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
