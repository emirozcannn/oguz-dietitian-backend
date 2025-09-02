import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email gereklidir'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Geçerli bir email adresi girin'
    ]
  },
  password: {
    type: String,
    required: [true, 'Şifre gereklidir'],
    minlength: [6, 'Şifre en az 6 karakter olmalıdır']
  },
  firstName: {
    type: String,
    required: [true, 'Ad gereklidir'],
    trim: true,
    maxlength: [50, 'Ad 50 karakterden uzun olamaz']
  },
  lastName: {
    type: String,
    required: [true, 'Soyad gereklidir'],
    trim: true,
    maxlength: [50, 'Soyad 50 karakterden uzun olamaz']
  },
  phone: {
    type: String,
    trim: true,
    match: [/^(\+90|0)?[5][0-9]{9}$/, 'Geçerli bir telefon numarası girin']
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'super_admin'],
    default: 'user'
  },
  avatarUrl: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: Date
}, {
  timestamps: true, // createdAt ve updatedAt otomatik eklenir
  toJSON: { 
    transform: function(doc, ret) {
      // Şifreyi JSON response'dan çıkar
      delete ret.password;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.loginAttempts;
      delete ret.lockUntil;
      return ret;
    }
  }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Şifreyi kaydetmeden önce hash'le
userSchema.pre('save', async function(next) {
  // Şifre değişmediyse hash'leme
  if (!this.isModified('password')) return next();
  
  try {
    // Şifreyi hash'le
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Email'i küçük harfe çevir
userSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase();
  }
  next();
});

// Şifre karşılaştırma methodu
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Account lock kontrolü
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Failed login attempt
userSchema.methods.incLoginAttempts = function() {
  // Zaten kilitliyse ve kilit süresi geçmişse sıfırla
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Max attempt'e ulaştıysa kilitle
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: Date.now() + 2 * 60 * 60 * 1000 }; // 2 saat kilit
  }
  
  return this.updateOne(updates);
};

// Successful login
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 },
    $set: { lastLogin: new Date() }
  });
};

// Static method - find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method - create admin user
userSchema.statics.createAdmin = async function(userData) {
  const adminData = {
    ...userData,
    role: 'admin',
    emailVerified: true,
    isActive: true
  };
  
  const admin = new this(adminData);
  return await admin.save();
};

const User = mongoose.model('User', userSchema);

export default User;
