const express = require('express');
const router = express.Router();
const {
  getInventoryLogs,
  adjustInventory,
  transferInventory,
  getInventoryAlerts
} = require('../controllers/inventoryController');

// GET /api/inventory/logs
router.get('/logs', getInventoryLogs);

// POST /api/inventory/adjust
router.post('/adjust', adjustInventory);

// POST /api/inventory/transfer
router.post('/transfer', transferInventory);

// GET /api/inventory/alerts
router.get('/alerts', getInventoryAlerts);

module.exports = router;
