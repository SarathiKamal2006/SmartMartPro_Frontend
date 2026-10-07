const express = require('express');
const router = express.Router();
const FinanceTransaction = require('../models/FinanceTransaction');
const Order = require('../models/Order');

// GET /api/finance/summary — Calculate total revenue, expenses, net profit, GST
router.get('/summary', async (req, res) => {
  try {
    const orders = await Order.find();
    const transactions = await FinanceTransaction.find();

    const totalOrderRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const totalGstCollected = orders.reduce((sum, o) => sum + (o.tax || 0), 0);

    const totalExpenseAmount = transactions
      .filter(t => t.type === 'Expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const extraRevenue = transactions
      .filter(t => t.type === 'Revenue' && !t.referenceId)
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalRevenue = totalOrderRevenue + extraRevenue;
    const netProfit = totalRevenue - totalExpenseAmount;

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalExpenses: totalExpenseAmount,
        netProfit,
        totalGstCollected,
        totalOrdersCount: orders.length,
        transactionCount: transactions.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/finance/transactions — List income & expense transactions
router.get('/transactions', async (req, res) => {
  try {
    const { type } = req.query;
    let query = {};
    if (type) query.type = type;

    const transactions = await FinanceTransaction.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/finance/expenses — Log operational expense (utility, salary, rent)
router.post('/expenses', async (req, res) => {
  try {
    const { title, category, amount, paymentMethod, branch, description, referenceId } = req.body;
    if (!title || !amount) {
      return res.status(400).json({ success: false, message: 'Expense title and amount are required.' });
    }

    const transactionId = `EXP-${Math.floor(1000 + Math.random() * 9000)}`;

    const transaction = new FinanceTransaction({
      transactionId,
      type: 'Expense',
      category: category || 'Utilities',
      amount: Number(amount),
      paymentMethod: paymentMethod || 'Bank Transfer',
      referenceId: referenceId || '',
      description: title || description || '',
      branch: branch || 'Chennai Central Superstore (Main)'
    });

    await transaction.save();
    res.status(201).json({ success: true, message: 'Expense logged successfully', data: transaction });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
