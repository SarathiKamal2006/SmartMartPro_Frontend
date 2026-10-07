const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment
} = require('../controllers/paymentController');

// POST /api/payment/create-order
router.post('/create-order', createPaymentOrder);

// POST /api/payment/verify-payment
router.post('/verify-payment', verifyPayment);

module.exports = router;
