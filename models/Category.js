const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name_tr: {
    type: String,
    required: [true, 'Turkish category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
  },
  name_en: {
    type: String,
    required: [true, 'English category name is required'],
    trim: true,
    maxlength: [100, 'Category name cannot exceed 100 characters']
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
  description_tr: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  description_en: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  color: {
    type: String,
    default: '#059669',
    match: [/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Please enter a valid hex color']
  },
  icon: {
    type: String,
    default: 'bi-tag'
  },
  isActive: {
    type: Boolean,
    default: true
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
categorySchema.index({ slug_tr: 1 });
categorySchema.index({ slug_en: 1 });
categorySchema.index({ isActive: 1 });
categorySchema.index({ sortOrder: 1 });

module.exports = mongoose.model('Category', categorySchema);
