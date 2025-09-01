import mongoose from 'mongoose';

// FAQ Category Schema
const faqCategorySchema = new mongoose.Schema({
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
  description_tr: {
    type: String,
    trim: true,
    maxlength: [300, 'Description cannot exceed 300 characters']
  },
  description_en: {
    type: String,
    trim: true,
    maxlength: [300, 'Description cannot exceed 300 characters']
  },
  icon: {
    type: String,
    default: 'bi-question-circle'
  },
  color: {
    type: String,
    default: '#059669'
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
  timestamps: true
});

// FAQ Item Schema
const faqItemSchema = new mongoose.Schema({
  question_tr: {
    type: String,
    required: [true, 'Turkish question is required'],
    trim: true,
    maxlength: [300, 'Question cannot exceed 300 characters']
  },
  question_en: {
    type: String,
    required: [true, 'English question is required'],
    trim: true,
    maxlength: [300, 'Question cannot exceed 300 characters']
  },
  answer_tr: {
    type: String,
    required: [true, 'Turkish answer is required'],
    trim: true,
    maxlength: [2000, 'Answer cannot exceed 2000 characters']
  },
  answer_en: {
    type: String,
    required: [true, 'English answer is required'],
    trim: true,
    maxlength: [2000, 'Answer cannot exceed 2000 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FAQCategory',
    required: [true, 'Category is required']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  isHelpful: {
    yes: { type: Number, default: 0 },
    no: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Index for better performance
faqCategorySchema.index({ isActive: 1 });
faqCategorySchema.index({ sortOrder: 1 });

faqItemSchema.index({ category: 1 });
faqItemSchema.index({ isActive: 1 });
faqItemSchema.index({ sortOrder: 1 });

export const FAQCategory = mongoose.model('FAQCategory', faqCategorySchema);
export const FAQItem = mongoose.model('FAQItem', faqItemSchema);
