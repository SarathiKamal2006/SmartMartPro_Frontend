const express = require('express');
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  login,
  oauth,
  getMe,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

// POST /api/auth/send-otp
router.post('/send-otp', sendOtp);

// POST /api/auth/verify-otp
router.post('/verify-otp', verifyOtp);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/oauth
router.post('/oauth', oauth);

// GET /api/auth/me
router.get('/me', getMe);

// POST /api/auth/forgot-password
router.post('/forgot-password', forgotPassword);

// POST /api/auth/reset-password
router.post('/reset-password', resetPassword);

module.exports = router;
