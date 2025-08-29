export const config = { runtime: 'nodejs' };
import mongoose from 'mongoose';

// Contact Message Schema
const contactMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  category_id: { type: String },
  status: { type: String, default: 'unread' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const ContactMessage = mongoose.models.ContactMessage || mongoose.model('ContactMessage', contactMessageSchema);

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
      const messages = await ContactMessage.find({}).sort({ created_at: -1 });
      res.status(200).json({ success: true, data: messages });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } 
  
  else if (req.method === 'POST') {
    try {
      await mongoose.connect(MONGODB_URI);
      
      const { name, email, phone, subject, message, category_id } = req.body;
      
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'Gerekli alanlar eksik' });
      }
      
      const newMessage = new ContactMessage({
        name,
        email,
        phone,
        subject,
        message,
        category_id
      });
      
      const savedMessage = await newMessage.save();
      res.status(201).json({ success: true, data: savedMessage });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } 
  
  else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
