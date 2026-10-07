const express = require('express');
const router = express.Router();
const InventoryLog = require('../models/InventoryLog');
const Product = require('../models/Product');

// GET /api/inventory/logs — Fetch stock audit trail
router.get('/logs', async (req, res) => {
  try {
    const logs = await InventoryLog.find().sort({ createdAt: -1 });
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/inventory/adjust — Restock, record damage, or adjust count
router.post('/adjust', async (req, res) => {
  try {
    const { productId, sku, action, change, branch, note, performedBy } = req.body;
    if (!sku && !productId) {
      return res.status(400).json({ success: false, message: 'Product ID or SKU is required.' });
    }

    const product = await Product.findOne({
      $or: [{ sku }, { _id: productId }]
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const qtyChange = Number(change || 0);
    product.stock = Math.max(0, product.stock + qtyChange);
    await product.save();

    // Create inventory audit log
    const log = new InventoryLog({
      logId: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      sku: product.sku,
      productName: product.name,
      action: action || (qtyChange > 0 ? 'Restock' : 'Damage Adjustment'),
      change: qtyChange,
      newStock: product.stock,
      branch: branch || product.branch,
      performedBy: performedBy || 'Sarathi Kamal N (Store Manager)',
      note: note || ''
    });

    await log.save();

    res.json({ success: true, message: 'Inventory adjusted', data: { product, log } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/inventory/transfer — Transfer stock between supermarket branches
router.post('/transfer', async (req, res) => {
  try {
    const { sku, quantity, fromBranch, toBranch } = req.body;
    if (!sku || !quantity || !fromBranch || !toBranch) {
      return res.status(400).json({ success: false, message: 'SKU, quantity, fromBranch, and toBranch are required.' });
    }

    const product = await Product.findOne({ sku });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const transferQty = Number(quantity);

    // Create audit log for transfer
    const log = new InventoryLog({
      logId: `TRF-${Math.floor(1000 + Math.random() * 9000)}`,
      sku: product.sku,
      productName: product.name,
      action: 'Branch Transfer',
      change: transferQty,
      newStock: product.stock,
      branch: `${fromBranch} -> ${toBranch}`,
      performedBy: 'Sarathi Kamal N (Store Manager)',
      note: `Transferred ${transferQty} ${product.unit} from ${fromBranch} to ${toBranch}`
    });

    await log.save();

    res.json({ success: true, message: `Stock transferred to ${toBranch}`, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/inventory/alerts — Low stock and expiring items
router.get('/alerts', async (req, res) => {
  try {
    const lowStock = await Product.find({ $expr: { $lte: ["$stock", "$threshold"] } });
    const outOfStock = await Product.find({ stock: 0 });

    res.json({
      success: true,
      data: {
        lowStock,
        outOfStock,
        totalAlerts: lowStock.length + outOfStock.length
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
