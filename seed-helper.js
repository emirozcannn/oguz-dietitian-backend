import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Import seed script from backend
import('../backend/utils/seed.js').then(() => {
  console.log('✅ Seed completed');
}).catch(console.error);

// Or manually run this in your MongoDB Atlas:
const seedData = {
  admin: {
    email: 'admin@oguzyolyapan.com',
    password: 'admin123456', // Change this!
    firstName: 'Oğuz',
    lastName: 'Yolyapan',
    role: 'super_admin'
  }
};

console.log('🌱 Use this data to create admin user manually in MongoDB Atlas if needed:', seedData);
