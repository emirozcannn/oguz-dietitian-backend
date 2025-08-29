import mongoose from 'mongoose';

const packageSchema = new mongoose.Schema({
  title: {
    tr: {
      type: String,
      required: [true, 'Türkçe başlık gereklidir'],
      trim: true,
      maxlength: [100, 'Başlık 100 karakterden uzun olamaz']
    },
    en: {
      type: String,
      required: [true, 'İngilizce başlık gereklidir'],
      trim: true,
      maxlength: [100, 'Title cannot be longer than 100 characters']
    }
  },
  description: {
    tr: {
      type: String,
      trim: true,
      maxlength: [500, 'Açıklama 500 karakterden uzun olamaz']
    },
    en: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot be longer than 500 characters']
    }
  },
  price: {
    type: Number,
    required: [true, 'Fiyat gereklidir'],
    min: [0, 'Fiyat 0\'dan küçük olamaz'],
    max: [999999, 'Fiyat çok yüksek']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Orijinal fiyat 0\'dan küçük olamaz']
  },
  duration: {
    tr: {
      type: String,
      trim: true,
      maxlength: [50, 'Süre 50 karakterden uzun olamaz']
    },
    en: {
      type: String,
      trim: true,
      maxlength: [50, 'Duration cannot be longer than 50 characters']
    }
  },
  features: {
    tr: [{
      type: String,
      trim: true,
      maxlength: [200, 'Özellik 200 karakterden uzun olamaz']
    }],
    en: [{
      type: String,
      trim: true,
      maxlength: [200, 'Feature cannot be longer than 200 characters']
    }]
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  icon: {
    type: String,
    default: 'bi-heart',
    trim: true
  },
  category: {
    type: String,
    enum: ['basic', 'premium', 'vip', 'special'],
    default: 'basic'
  },
  orderIndex: {
    type: Number,
    default: 0
  },
  maxClients: {
    type: Number,
    min: [1, 'Maksimum müşteri sayısı en az 1 olmalıdır']
  },
  currentClients: {
    type: Number,
    default: 0,
    min: [0, 'Mevcut müşteri sayısı 0\'dan küçük olamaz']
  },
  tags: [{
    type: String,
    trim: true
  }],
  seoTitle: {
    tr: String,
    en: String
  },
  seoDescription: {
    tr: String,
    en: String
  }
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Virtual - indirim yüzdesi
packageSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Virtual - müsaitlik durumu
packageSchema.virtual('isAvailable').get(function() {
  if (!this.maxClients) return true;
  return this.currentClients < this.maxClients;
});

// Virtual - kalan kapasite
packageSchema.virtual('remainingCapacity').get(function() {
  if (!this.maxClients) return null;
  return this.maxClients - this.currentClients;
});

// Static method - aktif paketleri getir
packageSchema.statics.getActivePackages = function(language = 'tr') {
  return this.find({ isActive: true })
    .sort({ orderIndex: 1, createdAt: -1 })
    .select(`title.${language} description.${language} price originalPrice duration.${language} features.${language} isPopular icon category`);
};

// Static method - popüler paketleri getir
packageSchema.statics.getPopularPackages = function(language = 'tr') {
  return this.find({ isActive: true, isPopular: true })
    .sort({ orderIndex: 1, createdAt: -1 })
    .select(`title.${language} description.${language} price originalPrice duration.${language} features.${language} icon`);
};

// Pre-save middleware
packageSchema.pre('save', function(next) {
  // currentClients maxClients'ı geçmesin
  if (this.maxClients && this.currentClients > this.maxClients) {
    this.currentClients = this.maxClients;
  }
  next();
});

const Package = mongoose.model('Package', packageSchema);

export default Package;
