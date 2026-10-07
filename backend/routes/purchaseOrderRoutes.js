const express = require('express');
const router = express.Router();
const PurchaseOrder = require('../models/PurchaseOrder');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');

// GET /api/purchase-orders — List all purchase orders
router.get('/', async (req, res) => {
  try {
    const pos = await PurchaseOrder.find().sort({ createdAt: -1 });
    res.json({ success: true, count: pos.length, data: pos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/purchase-orders — Create PO
router.post('/', async (req, res) => {
  try {
    const { supplierId, supplierName, items, totalCost, expectedDate, branch } = req.body;
    if (!supplierName || !items || !items.length) {
      return res.status(400).json({ success: false, message: 'Supplier name and PO items are required.' });
    }

    const poNumber = req.body.poNumber || `PO-2026-${Math.floor(100 + Math.random() * 900)}`;

    const po = new PurchaseOrder({
      poNumber,
      supplierId: supplierId || '',
      supplierName,
      items,
      totalCost: Number(totalCost || 0),
      status: 'Pending',
      expectedDate: expectedDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
      branch: branch || 'Chennai Central Superstore (Main)'
    });

    await po.save();
    res.status(201).json({ success: true, message: 'Purchase Order created', data: po });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /api/purchase-orders/:id/receive — Mark PO received & auto-increment product stock in MongoDB
router.patch('/:id/receive', async (req, res) => {
  try {
    const po = await PurchaseOrder.findOne({
      $or: [{ _id: req.params.id }, { poNumber: req.params.id }]
    });

    if (!po) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found.' });
    }

    if (po.status === 'Received') {
      return res.status(400).json({ success: false, message: 'Purchase Order was already received.' });
    }

    po.status = 'Received';
    await po.save();

    // Auto-increment stock in Product collection for each item
    for (const item of po.items) {
      const product = await Product.findOne({
        $or: [{ sku: item.sku }, { name: item.productName }]
      });

      if (product) {
        product.stock += Number(item.qty || 0);
        await product.save();

        // Create inventory audit log
        const log = new InventoryLog({
          logId: `PO-RCV-${Math.floor(1000 + Math.random() * 9000)}`,
          sku: product.sku,
          productName: product.name,
          action: 'Restock',
          change: Number(item.qty),
          newStock: product.stock,
          branch: po.branch,
          performedBy: 'Sarathi Kamal N (Store Manager)',
          note: `Received shipment from PO ${po.poNumber}`
        });
        await log.save();
      }
    }

    res.json({ success: true, message: `PO ${po.poNumber} received and stock auto-updated in database!`, data: po });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
