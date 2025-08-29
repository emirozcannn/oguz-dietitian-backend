
export const config = { runtime: 'nodejs' };
import mongoose from 'mongoose';
import Package from '../models/Package.js';

// CORS headers
export function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    setCors(res);
    res.status(200).end();
    return;
  }
  setCors(res);
  const MONGODB_URI = process.env.MONGODB_URI || '';
  if (req.method === 'GET') {
    try {
      await mongoose.connect(MONGODB_URI);
      const packages = await Package.find({});
      res.status(200).json(packages);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
