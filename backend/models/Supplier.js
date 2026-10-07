const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  supplierId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Supplier company name is required'],
    trim: true
  },
  contactPerson: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  address: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    default: 'General Produce'
  },
  rating: {
    type: Number,
    default: 4.8
  },
  activeStatus: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  totalPaid: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Supplier', supplierSchema);
