const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: String,
  sku: String,
  name: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  unit: { type: String, default: 'kg' },
  image: String
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    default: ''
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'UPI', 'Wallet'],
    default: 'Cash'
  },
  paymentStatus: {
    type: String,
    enum: ['Paid', 'Pending', 'Failed'],
    default: 'Paid'
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Out for Delivery', 'Delivered', 'Completed', 'Cancelled'],
    default: 'Completed'
  },
  type: {
    type: String,
    enum: ['POS', 'Online Storefront'],
    default: 'POS'
  },
  branch: {
    type: String,
    default: 'Chennai Central Superstore (Main)'
  },
  deliveryOtp: {
    type: String,
    default: ''
  },
  deliveryAddress: {
    type: String,
    default: ''
  },
  driverName: {
    type: String,
    default: ''
  },
  driverPhone: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
