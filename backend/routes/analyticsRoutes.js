const express = require('express');
const router = express.Router();
const {
  getForecasting,
  getTopSelling
} = require('../controllers/analyticsController');

// GET /api/analytics/forecasting
router.get('/forecasting', getForecasting);

// GET /api/analytics/top-selling
router.get('/top-selling', getTopSelling);

module.exports = router;
