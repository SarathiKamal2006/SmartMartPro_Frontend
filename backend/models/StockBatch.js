const mongoose = require('mongoose');

const stockBatchSchema = new mongoose.Schema({
  batchNo: {
    type: String,
    required: true,
    unique: true
  },
  sku: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  branch: {
    type: String,
    default: 'Chennai Central Superstore (Main)'
  },
  quantity: {
    type: Number,
    required: true,
    default: 0
  },
  shelfLocation: {
    type: String,
    default: 'Aisle 3, Shelf B'
  },
  manufactureDate: {
    type: String,
    default: ''
  },
  expiryDate: {
    type: String,
    required: true
  },
  supplierName: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Expiring Soon', 'Expired', 'Depleted'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StockBatch', stockBatchSchema);
