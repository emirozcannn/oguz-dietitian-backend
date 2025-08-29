import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'İsim gereklidir'],
    trim: true,
    maxlength: [100, 'İsim 100 karakterden uzun olamaz']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Unvan 100 karakterden uzun olamaz']
  },
  city: {
    type: String,
    trim: true,
    maxlength: [50, 'Şehir 50 karakterden uzun olamaz']
  },
  rating: {
    type: Number,
    required: [true, 'Puan gereklidir'],
    min: [1, 'Puan en az 1 olmalıdır'],
    max: [5, 'Puan en fazla 5 olmalıdır']
  },
  content: {
    tr: {
      type: String,
      required: [true, 'Türkçe yorum gereklidir'],
      trim: true,
      maxlength: [1000, 'Yorum 1000 karakterden uzun olamaz']
    },
    en: {
      type: String,
      trim: true,
      maxlength: [1000, 'Comment cannot be longer than 1000 characters']
    }
  },
  programType: {
    type: String,
    trim: true,
    maxlength: [100, 'Program türü 100 karakterden uzun olamaz']
  },
  beforeWeight: {
    type: Number,
    min: [30, 'Başlangıç kilosu en az 30 kg olmalıdır'],
    max: [300, 'Başlangıç kilosu en fazla 300 kg olmalıdır']
  },
  afterWeight: {
    type: Number,
    min: [30, 'Bitiş kilosu en az 30 kg olmalıdır'],
    max: [300, 'Bitiş kilosu en fazla 300 kg olmalıdır']
  },
  durationMonths: {
    type: Number,
    min: [1, 'Program süresi en az 1 ay olmalıdır'],
    max: [60, 'Program süresi en fazla 60 ay olmalıdır']
  },
  avatarUrl: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  orderIndex: {
    type: Number,
    default: 0
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderationNotes: {
    type: String,
    trim: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectedAt: Date,
  tags: [{
    type: String,
    trim: true
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

// Virtual - kilo kaybı
testimonialSchema.virtual('weightLoss').get(function() {
  if (this.beforeWeight && this.afterWeight) {
    return this.beforeWeight - this.afterWeight;
  }
  return null;
});

// Virtual - kilo kaybı yüzdesi
testimonialSchema.virtual('weightLossPercentage').get(function() {
  if (this.beforeWeight && this.afterWeight) {
    return Math.round(((this.beforeWeight - this.afterWeight) / this.beforeWeight) * 100);
  }
  return null;
});

// Virtual - aylık ortalama kilo kaybı
testimonialSchema.virtual('averageMonthlyWeightLoss').get(function() {
  if (this.weightLoss && this.durationMonths) {
    return Math.round((this.weightLoss / this.durationMonths) * 10) / 10;
  }
  return null;
});

// Static method - onaylanmış yorumları getir
testimonialSchema.statics.getApproved = function(language = 'tr', limit = null) {
  const query = this.find({ status: 'approved' })
    .sort({ isFeatured: -1, orderIndex: 1, createdAt: -1 })
    .select(`name title city rating content.${language} programType beforeWeight afterWeight durationMonths avatarUrl isFeatured tags`);
  
  if (limit) query.limit(limit);
  return query;
};

// Static method - öne çıkan yorumları getir
testimonialSchema.statics.getFeatured = function(language = 'tr') {
  return this.find({ status: 'approved', isFeatured: true })
    .sort({ orderIndex: 1, createdAt: -1 })
    .select(`name title city rating content.${language} programType beforeWeight afterWeight durationMonths avatarUrl tags`);
};

// Static method - bekleyen yorumları getir
testimonialSchema.statics.getPending = function() {
  return this.find({ status: 'pending' })
    .sort({ createdAt: -1 })
    .populate('userId', 'firstName lastName email');
};

// Static method - puan ortalamalarını hesapla
testimonialSchema.statics.getAverageRating = async function() {
  const result = await this.aggregate([
    { $match: { status: 'approved' } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    };
  }

  const data = result[0];
  const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  
  data.ratingDistribution.forEach(rating => {
    distribution[rating]++;
  });

  return {
    averageRating: Math.round(data.averageRating * 10) / 10,
    totalReviews: data.totalReviews,
    ratingDistribution: distribution
  };
};

// Pre-save middleware
testimonialSchema.pre('save', function(next) {
  // Anonim ise ismi gizle
  if (this.isAnonymous && this.name) {
    const names = this.name.split(' ');
    if (names.length > 1) {
      this.name = `${names[0]} ${names[names.length - 1].charAt(0)}.`;
    } else {
      this.name = `${names[0].charAt(0)}.`;
    }
  }

  // Onay tarihi ayarla
  if (this.isModified('status')) {
    if (this.status === 'approved' && !this.approvedAt) {
      this.approvedAt = new Date();
    } else if (this.status === 'rejected' && !this.rejectedAt) {
      this.rejectedAt = new Date();
    }
  }

  next();
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;
