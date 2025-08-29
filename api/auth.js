
export const config = { runtime: 'nodejs' };

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { type } = req.query;

  if (req.method === 'POST' && type === 'login') {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email ve şifre gereklidir' 
        });
      }

      // Hardcoded users for demo
      const users = {
        'admin@oguzyolyapan.com': {
          password: 'admin123',
          user: {
            id: '000000000000000000000001',
            email: 'admin@oguzyolyapan.com',
            firstName: 'Super',
            lastName: 'Admin',
            role: 'super_admin'
          }
        },
        'admin@example.com': {
          password: 'admin123',
          user: {
            id: '000000000000000000000002',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin'
          }
        },
        'ayse.demir@example.com': {
          password: 'user123',
          user: {
            id: '000000000000000000000003',
            email: 'ayse.demir@example.com',
            firstName: 'Ayşe',
            lastName: 'Demir',
            role: 'user'
          }
        },
        'test@test.com': {
          password: '123456',
          user: {
            id: '000000000000000000000004',
            email: 'test@test.com',
            firstName: 'Test',
            lastName: 'User',
            role: 'user'
          }
        }
      };

      const userData = users[email.toLowerCase()];
      if (!userData || userData.password !== password) {
        return res.status(401).json({ 
          success: false, 
          error: 'Geçersiz email veya şifre' 
        });
      }

      res.status(200).json({
        success: true,
        data: {
          user: userData.user,
          message: 'Giriş başarılı'
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  } 
  
  else if (req.method === 'POST' && type === 'register') {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ 
          success: false, 
          error: 'Email, şifre, ad ve soyad gereklidir' 
        });
      }

      // Demo register - always success
      res.status(201).json({
        success: true,
        data: {
          user: {
            id: Date.now().toString(),
            email: email,
            firstName: firstName,
            lastName: lastName,
            role: 'user'
          },
          message: 'Kayıt başarılı'
        }
      });
    } catch (error) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
  
  else {
    res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }
}
