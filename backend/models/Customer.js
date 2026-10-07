const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Invalid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone is required'],
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  role: {
    type: String,
    default: 'Customer'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  walletBalance: {
    type: Number,
    default: 2000.00
  },
  loyaltyPoints: {
    type: Number,
    default: 0
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
  }
}, {
  timestamps: true
});

// Hash password before saving
customerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  // Skip hashing if password was already hashed (from OTP verification flow)
  if (this.$skipPasswordHash) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
customerSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Customer', customerSchema);
