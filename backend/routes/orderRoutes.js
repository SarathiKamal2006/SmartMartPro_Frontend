const express = require('express');
const router = express.Router();
const {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
} = require('../controllers/orderController');

// GET /api/orders
router.get('/', getOrders);

// GET /api/orders/:id
router.get('/:id', getOrderById);

// POST /api/orders
router.post('/', createOrder);

// PATCH /api/orders/:id/status
router.patch('/:id/status', updateOrderStatus);

module.exports = router;
