const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
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
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  role: {
    type: String,
    enum: ['Admin', 'Super Admin', 'Store Manager', 'Branch Manager', 'Manager', 'Cashier', 'Inventory Manager', 'Delivery Partner', 'Warehouse Staff', 'Accountant', 'Supplier', 'Supplier Partner', 'Customer'],
    default: 'Cashier'
  },
  branch: {
    type: String,
    default: 'Chennai Central Superstore (Main)'
  },
  salary: {
    type: Number,
    default: 25000
  },
  status: {
    type: String,
    enum: ['Active', 'On Leave', 'Terminated'],
    default: 'Active'
  },
  avatar: {
    type: String,
    default: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80'
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
