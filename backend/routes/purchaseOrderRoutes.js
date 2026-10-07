const express = require('express');
const router = express.Router();
const {
  getPurchaseOrders,
  createPurchaseOrder,
  receivePurchaseOrder
} = require('../controllers/purchaseOrderController');

// GET /api/purchase-orders
router.get('/', getPurchaseOrders);

// POST /api/purchase-orders
router.post('/', createPurchaseOrder);

// PATCH /api/purchase-orders/:id/receive
router.patch('/:id/receive', receivePurchaseOrder);

module.exports = router;
