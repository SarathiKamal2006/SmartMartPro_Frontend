const mongoose = require('mongoose');

const financeTransactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['Revenue', 'Expense'],
    required: true
  },
  category: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentMethod: {
    type: String,
    default: 'Bank Transfer'
  },
  referenceId: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  branch: {
    type: String,
    default: 'Chennai Central Superstore (Main)'
  },
  date: {
    type: String,
    default: () => new Date().toISOString().split('T')[0]
  },
  status: {
    type: String,
    default: 'Completed'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('FinanceTransaction', financeTransactionSchema);
