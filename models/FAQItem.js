import mongoose from 'mongoose';

const faqItemSchema = new mongoose.Schema({
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FAQCategory',
    required: true
  },
  question_tr: {
    type: String,
    required: true,
    trim: true
  },
  question_en: {
    type: String,
    required: true,
    trim: true
  },
  answer_tr: {
    type: String,
    required: true,
    trim: true
  },
  answer_en: {
    type: String,
    required: true,
    trim: true
  },
  order_index: {
    type: Number,
    default: 0
  },
  is_active: {
    type: Boolean,
    default: true
  },
  view_count: {
    type: Number,
    default: 0
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  },
  collection: 'faq_items'
});

// Indexes for better performance
faqItemSchema.index({ category_id: 1 });
faqItemSchema.index({ is_active: 1 });
faqItemSchema.index({ order_index: 1 });

export default mongoose.model('FAQItem', faqItemSchema);
