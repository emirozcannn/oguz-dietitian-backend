export const config = { runtime: 'nodejs' };
import mongoose from 'mongoose';
import Post from '../../models/Post.js';

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
      
      const { language = 'tr', limit = 5 } = req.query || {};
      const query = { is_popular: true, language };
      let posts = await Post.find(query);
      posts = posts.slice(0, Number(limit));
      
      res.status(200).json(posts);
    } catch (error) {
      console.error('Blog popular error:', error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
