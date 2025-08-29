
export const config = { runtime: 'nodejs' };
import mongoose from 'mongoose';
import FAQItem from '../models/FAQItem.js';

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
      // Alt endpoint: /faq/items/public
      if (req.url && req.url.includes('items/public')) {
        const publicFaqs = await FAQItem.find({ is_public: true });
        res.status(200).json(publicFaqs);
        return;
      }
      // Diğer FAQ endpointleri
      const faqs = await FAQItem.find({});
      res.status(200).json(faqs);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
