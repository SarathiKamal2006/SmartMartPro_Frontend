const mongoose = require('mongoose');

const deliverySchema = new mongoose.Schema({
  deliveryId: {
    type: String,
    required: true,
    unique: true
  },
  orderId: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    default: ''
  },
  itemsCount: {
    type: Number,
    default: 1
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Assigned', 'In Transit', 'Delivered', 'Failed'],
    default: 'Assigned'
  },
  otp: {
    type: String,
    required: true
  },
  driverName: {
    type: String,
    default: 'Amira Patel'
  },
  driverPhone: {
    type: String,
    default: '+91 98842 00924'
  },
  deliveryTime: {
    type: String,
    default: '10 mins away'
  },
  branch: {
    type: String,
    default: 'Chennai Central Superstore (Main)'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Delivery', deliverySchema);
