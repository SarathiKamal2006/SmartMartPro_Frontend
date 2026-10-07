const express = require('express');
const router = express.Router();
const {
  getDeliveries,
  createDelivery,
  verifyDeliveryOtp,
  sendEmailOtp
} = require('../controllers/deliveryController');

// GET /api/deliveries
router.get('/', getDeliveries);

// POST /api/deliveries
router.post('/', createDelivery);

// POST /api/deliveries/verify-otp
router.post('/verify-otp', verifyDeliveryOtp);

// POST /api/deliveries/send-email-otp
router.post('/send-email-otp', sendEmailOtp);

module.exports = router;
