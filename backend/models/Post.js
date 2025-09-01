import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
  title_tr: {
    type: String,
    required: [true, 'Turkish title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  title_en: {
    type: String,
    required: [true, 'English title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  slug_tr: {
    type: String,
    required: [true, 'Turkish slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  slug_en: {
    type: String,
    required: [true, 'English slug is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  excerpt_tr: {
    type: String,
    required: [true, 'Turkish excerpt is required'],
    trim: true,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  excerpt_en: {
    type: String,
    required: [true, 'English excerpt is required'],
    trim: true,
    maxlength: [300, 'Excerpt cannot exceed 300 characters']
  },
  content_tr: {
    type: String,
    required: [true, 'Turkish content is required']
  },
  content_en: {
    type: String,
    required: [true, 'English content is required']
  },
  imageUrl: {
    type: String,
    default: null
  },
  imageAltText_tr: {
    type: String,
    trim: true
  },
  imageAltText_en: {
    type: String,
    trim: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Author is required']
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  readTime: {
    type: Number, // in minutes
    default: 3
  },
  views: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  seo: {
    metaTitle_tr: {
      type: String,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaTitle_en: {
      type: String,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription_tr: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    metaDescription_en: {
      type: String,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    keywords: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },
  publishedAt: {
    type: Date,
    default: null
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Auto-calculate read time based on content length
postSchema.pre('save', function(next) {
  if (this.isModified('content_tr') || this.isModified('content_en')) {
    // Average reading speed: 200 words per minute
    const wordCount = Math.max(
      this.content_tr?.split(/\s+/).length || 0,
      this.content_en?.split(/\s+/).length || 0
    );
    this.readTime = Math.max(1, Math.round(wordCount / 200));
  }
  
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  this.lastModified = new Date();
  next();
});

// Index for better performance
postSchema.index({ slug_tr: 1 });
postSchema.index({ slug_en: 1 });
postSchema.index({ status: 1 });
postSchema.index({ publishedAt: -1 });
postSchema.index({ category: 1 });
postSchema.index({ isFeatured: 1 });
postSchema.index({ views: -1 });

export default mongoose.model('Post', postSchema);
