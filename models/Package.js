const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  title_tr: {
    type: String,
    required: [true, 'Turkish title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  title_en: {
    type: String,
    required: [true, 'English title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description_tr: {
    type: String,
    required: [true, 'Turkish description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  description_en: {
    type: String,
    required: [true, 'English description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  features_tr: [{
    type: String,
    trim: true,
    maxlength: [200, 'Feature cannot exceed 200 characters']
  }],
  features_en: [{
    type: String,
    trim: true,
    maxlength: [200, 'Feature cannot exceed 200 characters']
  }],
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  currency: {
    type: String,
    default: 'TRY',
    enum: ['TRY', 'USD', 'EUR']
  },
  duration_tr: {
    type: String,
    required: [true, 'Turkish duration is required'],
    trim: true
  },
  duration_en: {
    type: String,
    required: [true, 'English duration is required'],
    trim: true
  },
  sessionCount: {
    type: Number,
    required: [true, 'Session count is required'],
    min: [1, 'Session count must be at least 1']
  },
  type: {
    type: String,
    enum: ['basic', 'standard', 'premium', 'vip'],
    default: 'basic'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Category is required']
  },
  isPopular: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isHomeFeatured: {
    type: Boolean,
    default: false
  },
  icon: {
    type: String,
    default: 'bi-heart'
  },
  color: {
    type: String,
    default: '#059669'
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  // Package contents and details
  includes: {
    type: String, // HTML content
    default: ''
  },
  excludes: {
    type: String, // HTML content
    default: ''
  },
  requirements_tr: [String],
  requirements_en: [String],
  // Stats
  purchaseCount: {
    type: Number,
    default: 0
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for discount percentage
packageSchema.virtual('discountPercentage').get(function() {
  if (this.originalPrice && this.originalPrice > this.price) {
    return Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  return 0;
});

// Index for better performance
packageSchema.index({ type: 1 });
packageSchema.index({ isActive: 1 });
packageSchema.index({ isPopular: 1 });
packageSchema.index({ isHomeFeatured: 1 });
packageSchema.index({ category: 1 });
packageSchema.index({ price: 1 });
packageSchema.index({ sortOrder: 1 });

module.exports = mongoose.model('Package', packageSchema);
