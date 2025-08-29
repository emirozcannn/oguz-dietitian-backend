import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './src/lib/mongodb.js'; // Sadece Mongoose

// Environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB bağlantısı (sadece Mongoose)
connectDB();

// Routes
import authRoutes from './routes/auth.js';
import packagesRoutes from './routes/packages.js';
import testimonialsRoutes from './routes/testimonials.js';
import blogRoutes from './routes/blog.js';
import categoryRoutes from './routes/category.js';
import faqRoutes from './routes/faq.js'; // Yeni Mongoose versiyonu

app.use('/api/auth', authRoutes);
app.use('/api/packages', packagesRoutes);
app.use('/api/testimonials', testimonialsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/faq', faqRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('API Error:', err);
  res.status(500).json({
    success: false,
    message: 'Sunucu hatası',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint bulunamadı'
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`FAQ Test: http://localhost:${PORT}/api/faq/items/public`);
});