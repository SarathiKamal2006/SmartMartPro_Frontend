const StockBatch = require('../models/StockBatch');
const Product = require('../models/Product');

// @desc    List all batches across branches
// @route   GET /api/stock-batches
const getStockBatches = async (req, res) => {
  try {
    const { sku, branch, status } = req.query;
    let query = {};
    if (sku) query.sku = sku;
    if (branch) query.branch = branch;
    if (status) query.status = status;

    const batches = await StockBatch.find(query).sort({ expiryDate: 1 });
    res.json({ success: true, count: batches.length, data: batches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add new batch
// @route   POST /api/stock-batches
const createStockBatch = async (req, res) => {
  try {
    const { sku, productName, quantity, branch, shelfLocation, expiryDate, supplierName } = req.body;
    if (!sku || !productName || !quantity || !expiryDate) {
      return res.status(400).json({ success: false, message: 'SKU, product name, quantity, and expiry date are required.' });
    }

    const batchNo = req.body.batchNo || `BATCH-2026-${Math.floor(100 + Math.random() * 900)}`;

    const batch = new StockBatch({
      batchNo,
      sku,
      productName,
      branch: branch || 'Chennai Central Superstore (Main)',
      quantity: Number(quantity),
      shelfLocation: shelfLocation || 'Aisle 2, Bay 4',
      expiryDate,
      supplierName: supplierName || 'SmartMart Vendor'
    });

    await batch.save();

    // Increment corresponding product stock
    const product = await Product.findOne({ sku });
    if (product) {
      product.stock += Number(quantity);
      await product.save();
    }

    res.status(201).json({ success: true, message: 'Stock batch added', data: batch });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Batches expiring soon
// @route   GET /api/stock-batches/expiring
const getExpiringBatches = async (req, res) => {
  try {
    const batches = await StockBatch.find({
      status: { $in: ['Active', 'Expiring Soon'] }
    }).sort({ expiryDate: 1 }).limit(15);

    res.json({ success: true, count: batches.length, data: batches });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getStockBatches,
  createStockBatch,
  getExpiringBatches
};
