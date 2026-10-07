const express = require('express');
const router = express.Router();
const {
  getCustomers,
  getCustomerById,
  topUpWallet,
  getCustomerOrders,
  createCustomer
} = require('../controllers/customerController');

// GET /api/customers
router.get('/', getCustomers);

// GET /api/customers/:id
router.get('/:id', getCustomerById);

// POST /api/customers/:id/wallet
router.post('/:id/wallet', topUpWallet);

// GET /api/customers/:id/orders
router.get('/:id/orders', getCustomerOrders);

// POST /api/customers
router.post('/', createCustomer);

module.exports = router;
