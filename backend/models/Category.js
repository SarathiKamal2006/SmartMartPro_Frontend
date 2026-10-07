const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  categoryId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  count: {
    type: Number,
    default: 0
  },
  icon: {
    type: String,
    default: '📦'
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Category', categorySchema);
