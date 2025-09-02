import mongoose from 'mongoose';

const faqCategorySchema = new mongoose.Schema({
  name_tr: { 
    type: String, 
    required: true,
    trim: true
  },
  name_en: { 
    type: String, 
    required: true,
    trim: true
  },
  icon: { 
    type: String, 
    default: 'bi-question-circle',
    trim: true
  },
  color: { 
    type: String, 
    default: '#0d6efd',
    trim: true
  },
  order_index: { 
    type: Number, 
    default: 0 
  },
  is_active: { 
    type: Boolean, 
    default: true 
  }
}, {
  timestamps: { 
    createdAt: 'created_at', 
    updatedAt: 'updated_at' 
  },
  collection: 'faq_categories'
});

// Indexes for better performance
faqCategorySchema.index({ order_index: 1 });
faqCategorySchema.index({ is_active: 1 });

export default mongoose.model('FAQCategory', faqCategorySchema);
