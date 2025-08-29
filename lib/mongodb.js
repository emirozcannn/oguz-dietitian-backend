import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    // Backend için process.env, frontend için import.meta.env kullan
    const mongoURI = process.env.MONGODB_URI || import.meta.env?.VITE_MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MongoDB URI bulunamadı! .env dosyasında MONGODB_URI tanımlayın');
    }

    // Eğer zaten bağlıysa tekrar bağlanma
    if (mongoose.connections[0].readyState) {
      console.log('✅ MongoDB zaten bağlı');
      return;
    }

    // MongoDB'ye bağlan
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // 5 saniye timeout
      socketTimeoutMS: 45000, // 45 saniye socket timeout
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    // Bağlantı eventleri
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('📡 MongoDB disconnected');
    });

  } catch (error) {
    console.error('❌ MongoDB bağlantı hatası:', error.message);
    
    // Geliştirme modunda daha detaylı hata göster
    if (import.meta.env.VITE_DEV_MODE === 'true') {
      console.error('Full error:', error);
    }
    
    // Uygulama çökmemeli, sadece log ver
    // process.exit(1); // Bu satırı yorumladık
  }
};

export default connectDB;
