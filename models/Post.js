import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title: {
    tr: {
      type: String,
      required: [true, 'Türkçe başlık gereklidir'],
      trim: true,
      maxlength: [200, 'Başlık 200 karakterden uzun olamaz']
    },
    en: {
      type: String,
      required: [true, 'İngilizce başlık gereklidir'],
      trim: true,
      maxlength: [200, 'Title cannot be longer than 200 characters']
    }
  },
  slug: {
    tr: {
      type: String,
      required: [true, 'Türkçe slug gereklidir'],
      // unique: true, // Geçici olarak kaldır
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Slug sadece küçük harf, rakam ve tire içerebilir']
    },
    en: {
      type: String,
      required: [true, 'İngilizce slug gereklidir'],
      // unique: true, // Geçici olarak kaldır
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers and hyphens']
    }
  },
  excerpt: {
    tr: {
      type: String,
      trim: true,
      maxlength: [300, 'Özet 300 karakterden uzun olamaz']
    },
    en: {
      type: String,
      trim: true,
      maxlength: [300, 'Excerpt cannot be longer than 300 characters']
    }
  },
  content: {
    tr: {
      type: String,
      required: [true, 'Türkçe içerik gereklidir']
    },
    en: {
      type: String,
      required: [true, 'İngilizce içerik gereklidir']
    }
  },
  imageUrl: {
    type: String,
    trim: true
  },
  imageAltText: {
    tr: String,
    en: String
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  publishedAt: Date,
  viewCount: {
    type: Number,
    default: 0,
    min: [0, 'Görüntülenme sayısı 0\'dan küçük olamaz']
  },
  readTime: {
    type: Number,
    default: 5,
    min: [1, 'Okuma süresi en az 1 dakika olmalıdır'],
    max: [60, 'Okuma süresi en fazla 60 dakika olmalıdır']
  },
  metaTitle: {
    tr: {
      type: String,
      maxlength: [60, 'Meta başlık 60 karakterden uzun olamaz']
    },
    en: {
      type: String,
      maxlength: [60, 'Meta title cannot be longer than 60 characters']
    }
  },
  metaDescription: {
    tr: {
      type: String,
      maxlength: [160, 'Meta açıklama 160 karakterden uzun olamaz']
    },
    en: {
      type: String,
      maxlength: [160, 'Meta description cannot be longer than 160 characters']
    }
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false, // Geçici olarak false
    default: null // Default değer ekle
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false // Zorunlu olmaktan çıkar
  }],
  tags: {
    tr: [{
      type: String,
      trim: true,
      maxlength: [30, 'Tag 30 karakterden uzun olamaz']
    }],
    en: [{
      type: String,
      trim: true,
      maxlength: [30, 'Tag cannot be longer than 30 characters']
    }]
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  allowComments: {
    type: Boolean,
    default: true
  },
  orderIndex: {
    type: Number,
    default: 0
  },
  relatedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post'
  }]
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

// Virtual - yayın durumu kontrolü
postSchema.virtual('isPublished').get(function() {
  return this.status === 'published' && this.publishedAt && this.publishedAt <= new Date();
});

// Virtual - URL path'i
postSchema.virtual('urlPath').get(function() {
  return {
    tr: `/blog/${this.slug.tr}`,
    en: `/en/blog/${this.slug.en}`
  };
});

// Virtual - estimated reading time based on content
postSchema.virtual('estimatedReadTime').get(function() {
  if (this.content?.tr) {
    const wordsPerMinute = 200;
    const wordCount = this.content.tr.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute) || 1;
  }
  return this.readTime;
});

// Static method - yayınlanmış postları getir
postSchema.statics.getPublished = function(language = 'tr', limit = null, categories = null) {
  const matchCondition = {
    status: 'published',
    publishedAt: { $lte: new Date() }
  };

  if (categories && categories.length > 0) {
    matchCondition.categories = { $in: categories };
  }

  const query = this.find(matchCondition)
    .populate('authorId', 'firstName lastName')
    .populate('categories', `name.${language} slug.${language} color`)
    .sort({ isFeatured: -1, publishedAt: -1 })
    .select(`title.${language} slug.${language} excerpt.${language} imageUrl imageAltText.${language} publishedAt viewCount readTime tags isFeatured isPopular categories authorId`);

  if (limit) query.limit(limit);
  return query;
};

// Static method - öne çıkan postları getir
postSchema.statics.getFeatured = function(language = 'tr', limit = 3) {
  return this.find({
    status: 'published',
    publishedAt: { $lte: new Date() },
    isFeatured: true
  })
    .populate('authorId', 'firstName lastName')
    .populate('categories', `name.${language} slug.${language} color`)
    .sort({ publishedAt: -1 })
    .limit(limit)
    .select(`title.${language} slug.${language} excerpt.${language} imageUrl imageAltText.${language} publishedAt viewCount readTime categories authorId`);
};

// Static method - popüler postları getir
postSchema.statics.getPopular = function(language = 'tr', limit = 5) {
  return this.find({
    status: 'published',
    publishedAt: { $lte: new Date() }
  })
    .populate('authorId', 'firstName lastName')
    .populate('categories', `name.${language} slug.${language} color`)
    .sort({ viewCount: -1, publishedAt: -1 })
    .limit(limit)
    .select(`title.${language} slug.${language} excerpt.${language} imageUrl viewCount readTime categories authorId`);
};

// Static method - benzer postları getir
postSchema.statics.getRelated = function(postId, categories, language = 'tr', limit = 3) {
  return this.find({
    _id: { $ne: postId },
    status: 'published',
    publishedAt: { $lte: new Date() },
    categories: { $in: categories }
  })
    .populate('categories', `name.${language} color`)
    .sort({ publishedAt: -1 })
    .limit(limit)
    .select(`title.${language} slug.${language} excerpt.${language} imageUrl publishedAt readTime categories`);
};

// Static method - slug'a göre post getir
postSchema.statics.getBySlug = function(slug, language = 'tr') {
  return this.findOne({
    [`slug.${language}`]: slug,
    status: 'published',
    publishedAt: { $lte: new Date() }
  })
    .populate('authorId', 'firstName lastName avatarUrl')
    .populate('categories', `name.${language} slug.${language} color`)
    .select(`title.${language} slug content.${language} excerpt.${language} imageUrl imageAltText.${language} publishedAt viewCount readTime metaTitle.${language} metaDescription.${language} tags authorId categories allowComments`);
};

// Instance method - görüntülenme sayısını artır
postSchema.methods.incrementViews = function() {
  return this.updateOne({ $inc: { viewCount: 1 } });
};

// Pre-save middleware
postSchema.pre('save', function(next) {
  // Slug'ları düzenle
  if (this.isModified('title')) {
    if (this.title.tr && !this.slug.tr) {
      this.slug.tr = this.title.tr
        .toLowerCase()
        .replace(/[çğıöşü]/g, match => ({
          'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u'
        }[match]))
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now();
    }
    
    if (this.title.en && !this.slug.en) {
      this.slug.en = this.title.en
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') + '-' + Date.now();
    }
  }

  // Yayın tarihi ayarla
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }

  // Author ID varsayılan değer
  if (!this.authorId) {
    this.authorId = '674bc89c5fc7529b6a2b3c3b'; // Admin user ID
  }

  // Okuma süresini hesapla
  if (this.isModified('content') && this.content?.tr) {
    const wordsPerMinute = 200;
    const wordCount = this.content.tr.split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute) || 1;
  }

  next();
});

const Post = mongoose.model('Post', postSchema);

export default Post;
