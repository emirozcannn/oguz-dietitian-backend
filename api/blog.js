

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
      
      const { language = 'tr', limit, categories, type } = req.query || {};
      
      // Alt endpoint: ?type=featured
      if (type === 'featured') {
        const query = { is_featured: true, language };
        let posts = await Post.find(query);
        if (limit) posts = posts.slice(0, Number(limit));
        res.status(200).json(posts);
        return;
      }
      
      // Alt endpoint: ?type=popular
      if (type === 'popular') {
        const query = { is_popular: true, language };
        let posts = await Post.find(query);
        if (limit) posts = posts.slice(0, Number(limit));
        res.status(200).json(posts);
        return;
      }
      
      // Alt endpoint: ?type=published
      if (type === 'published') {
        const query = { status: 'published', language };
        if (categories) {
          query.categories = { $in: categories.split(',') };
        }
        let posts = await Post.find(query);
        if (limit) posts = posts.slice(0, Number(limit));
        res.status(200).json(posts);
        return;
      }
      
      // Ana blog endpointleri
      const posts = await Post.find({ language });
      res.status(200).json({ success: true, data: posts });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
