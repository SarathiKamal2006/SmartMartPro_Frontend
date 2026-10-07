const express = require('express');
const router = express.Router();
const {
  getStockBatches,
  createStockBatch,
  getExpiringBatches
} = require('../controllers/stockBatchController');

// GET /api/stock-batches
router.get('/', getStockBatches);

// POST /api/stock-batches
router.post('/', createStockBatch);

// GET /api/stock-batches/expiring
router.get('/expiring', getExpiringBatches);

module.exports = router;
