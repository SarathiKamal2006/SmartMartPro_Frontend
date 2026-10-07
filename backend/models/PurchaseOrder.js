const mongoose = require('mongoose');

const poItemSchema = new mongoose.Schema({
  productName: { type: String, required: true },
  sku: String,
  qty: { type: Number, required: true },
  unitCost: { type: Number, required: true },
  total: { type: Number, required: true }
}, { _id: false });

const purchaseOrderSchema = new mongoose.Schema({
  poNumber: {
    type: String,
    required: true,
    unique: true
  },
  supplierId: {
    type: String,
    default: ''
  },
  supplierName: {
    type: String,
    required: true
  },
  items: [poItemSchema],
  totalCost: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Draft', 'Pending', 'Shipped', 'Received', 'Cancelled'],
    default: 'Pending'
  },
  expectedDate: {
    type: String,
    default: ''
  },
  branch: {
    type: String,
    default: 'Chennai Central Superstore (Main)'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
