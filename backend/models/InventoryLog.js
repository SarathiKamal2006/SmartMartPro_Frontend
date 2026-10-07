const mongoose = require('mongoose');

const inventoryLogSchema = new mongoose.Schema({
  logId: {
    type: String,
    required: true
  },
  sku: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  action: {
    type: String,
    enum: ['Restock', 'POS Sale', 'Online Order', 'Damage Adjustment', 'Branch Transfer', 'Stock Update'],
    required: true
  },
  change: {
    type: Number,
    required: true
  },
  newStock: {
    type: Number,
    required: true
  },
  branch: {
    type: String,
    default: 'Chennai Central Superstore (Main)'
  },
  performedBy: {
    type: String,
    default: 'Sarathi Kamal N (Store Manager)'
  },
  note: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InventoryLog', inventoryLogSchema);
