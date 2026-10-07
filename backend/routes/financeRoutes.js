const express = require('express');
const router = express.Router();
const {
  getFinanceSummary,
  getTransactions,
  createExpense
} = require('../controllers/financeController');

// GET /api/finance/summary
router.get('/summary', getFinanceSummary);

// GET /api/finance/transactions
router.get('/transactions', getTransactions);

// POST /api/finance/expenses
router.post('/expenses', createExpense);

module.exports = router;
