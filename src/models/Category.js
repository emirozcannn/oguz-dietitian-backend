import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    tr: {
      type: String,
      required: [true, 'Türkçe kategori adı gereklidir'],
      trim: true,
      maxlength: [50, 'Kategori adı 50 karakterden uzun olamaz']
    },
    en: {
      type: String,
      required: [true, 'İngilizce kategori adı gereklidir'],
      trim: true,
      maxlength: [50, 'Category name cannot be longer than 50 characters']
    }
  },
  slug: {
    tr: {
      type: String,
      required: [true, 'Türkçe slug gereklidir'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Slug sadece küçük harf, rakam ve tire içerebilir']
    },
    en: {
      type: String,
      required: [true, 'İngilizce slug gereklidir'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers and hyphens']
    }
  },
  description: {
    tr: {
      type: String,
      trim: true,
      maxlength: [200, 'Açıklama 200 karakterden uzun olamaz']
    },
    en: {
      type: String,
      trim: true,
      maxlength: [200, 'Description cannot be longer than 200 characters']
    }
  },
  color: {
    type: String,
    default: '#007bff',
    match: [/^#[0-9A-F]{6}$/i, 'Geçerli bir hex renk kodu giriniz']
  },
  icon: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  orderIndex: {
    type: Number,
    default: 0
  },
  postCount: {
    type: Number,
    default: 0
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

// Virtual - URL path'i
categorySchema.virtual('urlPath').get(function() {
  return {
    tr: `/blog/kategori/${this.slug.tr}`,
    en: `/en/blog/category/${this.slug.en}`
  };
});

// Static method - aktif kategorileri getir
categorySchema.statics.getActive = function(language = 'tr') {
  return this.find({ isActive: true })
    .sort({ orderIndex: 1, [`name.${language}`]: 1 })
    .select(`name.${language} slug.${language} color icon postCount`);
};

// Pre-save middleware
categorySchema.pre('save', function(next) {
  // Slug'ları düzenle
  if (this.isModified('name')) {
    if (this.name.tr && !this.slug.tr) {
      this.slug.tr = this.name.tr
        .toLowerCase()
        .replace(/[çğıöşü]/g, match => ({
          'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u'
        }[match]))
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }
    
    if (this.name.en && !this.slug.en) {
      this.slug.en = this.name.en
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    }
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
