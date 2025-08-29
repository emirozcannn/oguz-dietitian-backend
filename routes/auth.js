import express from 'express';
import { auth } from '../src/lib/mongoClient.js';

const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email ve şifre gerekli'
      });
    }

    console.log('🔐 Login attempt:', email);

    const result = await auth.login(email, password);

    res.json({
      success: true,
      message: 'Giriş başarılı',
      data: {
        user: result.user,
        token: result.token
      }
    });

  } catch (error) {
    console.error('❌ Login error:', error.message);
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const userData = req.body;

    if (!userData.email || !userData.password) {
      return res.status(400).json({
        success: false,
        message: 'Email ve şifre gerekli'
      });
    }

    console.log('📝 Register attempt:', userData.email);

    const result = await auth.register(userData);

    res.status(201).json({
      success: true,
      message: 'Kayıt başarılı',
      data: {
        user: result.user,
        token: result.token
      }
    });

  } catch (error) {
    console.error('❌ Register error:', error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
});

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await auth.getUser(userId);

    res.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('❌ Profile fetch error:', error.message);
    res.status(404).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
