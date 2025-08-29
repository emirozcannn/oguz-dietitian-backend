
export const config = { runtime: 'nodejs' };
import mongoose from 'mongoose';

// MongoDB URI
const MONGODB_URI = 'mongodb+srv://emirweb:Emir123456@cluster0.mpsqy.mongodb.net/oguz-dietitian?retryWrites=true&w=majority';

// Basit User Schema - auth.js içinde
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, default: 'user' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  try {
    await mongoose.connect(MONGODB_URI);
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Database connection failed' });
  }

  // Sub-endpoint routing with query params
  const { type } = req.query;

  if (req.method === 'GET') {
    if (type === 'users') {
      try {
        const users = await User.find({}).select('-password');
        res.status(200).json({ success: true, data: users });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    } else {
      res.status(400).json({ success: false, error: 'Invalid type parameter' });
    }
  } 
  
  else if (req.method === 'POST') {
    if (type === 'login') {
      try {
        const { email, password } = req.body;

        if (!email || !password) {
          return res.status(400).json({ 
            success: false, 
            error: 'Email ve şifre gereklidir' 
          });
        }

        // User'ı bul (basit, şifre kontrolü yok)
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
          return res.status(401).json({ 
            success: false, 
            error: 'Kullanıcı bulunamadı' 
          });
        }

        // Basit şifre kontrolü (plain text - demo için)
        if (user.password !== password) {
          return res.status(401).json({ 
            success: false, 
            error: 'Geçersiz şifre' 
          });
        }

        res.status(200).json({
          success: true,
          data: {
            user: {
              id: user._id,
              email: user.email,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role
            },
            message: 'Giriş başarılı'
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    }
    
    else if (type === 'register') {
      try {
        const { email, password, firstName, lastName } = req.body;

        if (!email || !password || !firstName || !lastName) {
          return res.status(400).json({ 
            success: false, 
            error: 'Email, şifre, ad ve soyad gereklidir' 
          });
        }

        // Email kontrolü
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
          return res.status(409).json({ 
            success: false, 
            error: 'Bu email adresi zaten kullanımda' 
          });
        }

        // Yeni user oluştur (basit, şifre hash yok)
        const newUser = new User({
          email: email.toLowerCase(),
          password, // Plain text - demo için
          firstName,
          lastName
        });

        const savedUser = await newUser.save();

        res.status(201).json({
          success: true,
          data: {
            user: {
              id: savedUser._id,
              email: savedUser.email,
              firstName: savedUser.firstName,
              lastName: savedUser.lastName,
              role: savedUser.role
            },
            message: 'Kayıt başarılı'
          }
        });
      } catch (error) {
        res.status(500).json({ success: false, error: error.message });
      }
    }
    
    else {
      res.status(400).json({ success: false, error: 'Invalid type parameter' });
    }
  } 
  
  else {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
}
