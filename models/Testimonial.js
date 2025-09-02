const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  content: {
    tr: {
      type: String,
      required: [true, 'Turkish content is required'],
      trim: true,
      maxlength: [1000, 'Content cannot exceed 1000 characters']
    },
    en: {
      type: String,
      required: [true, 'English content is required'],
      trim: true,
      maxlength: [1000, 'Content cannot exceed 1000 characters']
    }
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  position: {
    type: String,
    trim: true,
    maxlength: [100, 'Position cannot exceed 100 characters']
  },
  company: {
    type: String,
    trim: true,
    maxlength: [100, 'Company cannot exceed 100 characters']
  },
  avatarUrl: {
    type: String,
    default: null
  },
  location: {
    type: String,
    trim: true,
    maxlength: [100, 'Location cannot exceed 100 characters']
  },
  packageUsed: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date,
    default: null
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  // Contact info (optional, for verification)
  email: {
    type: String,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  // Metadata
  source: {
    type: String,
    enum: ['website', 'email', 'phone', 'social', 'referral'],
    default: 'website'
  },
  verified: {
    type: Boolean,
    default: false
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for better performance
testimonialSchema.index({ status: 1 });
testimonialSchema.index({ isVisible: 1 });
testimonialSchema.index({ isFeatured: 1 });
testimonialSchema.index({ rating: -1 });
testimonialSchema.index({ approvedAt: -1 });
testimonialSchema.index({ sortOrder: 1 });

module.exports = mongoose.model('Testimonial', testimonialSchema);
