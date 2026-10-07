/**
 * SmartMart Pro — Backend API Server
 * ───────────────────────────────────
 * Enterprise Supermarket ERP & Storefront Backend
 * MongoDB Atlas + Gmail SMTP + JWT Auth + Full Modular APIs
 */

require('dotenv').config();
const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database
connectDB();

// ─── Middleware ─────────────────────────────────────────
app.use(cors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'], credentials: true }));
app.use(express.json());

// ─── Static Files & Image Sync ──────────────────────────
app.get('/api/sync-images', (req, res) => {
  const brainDir = 'C:/Users/sarat/.gemini/antigravity-ide/brain/3fc5a59a-2f99-4f0b-9a42-b62dd25c66f2';
  const destDir = path.resolve(__dirname, '../frontend/public/products');
  let copied = 0;
  if (fs.existsSync(brainDir)) {
    const imageMap = {
      'snickers_bar_1791040245296.jpg': 'snickers_chocolate_bar.jpg',
      'kinder_joy_boys_1791040273211.jpg': 'kinder_joy_boys.jpg',
      'nestle_bar_one_1791040308906.jpg': 'nestle_bar_one.jpg',
      'polo_mint_hole_1791040328010.jpg': 'polo_mint_hole.jpg',
      'milkybar_play_puzzle_1791040362148.jpg': 'milkybar_play_puzzle.jpg',
      'cadbury_crispello_trio_1791040393179.jpg': 'cadbury_dairy_milk_crispello.jpg',
      'lotte_caramilk_stick_1791040414975.jpg': 'lotte_caramilk_stick.jpg',
      'cadbury_fuse_bar_1791040450055.jpg': 'cadbury_fuse_bar.jpg',
      'lotte_coconut_punch_1791040477498.jpg': 'lotte_coconut_punch.jpg',
      'nestle_polo_roll_1791040584249.jpg': 'nestle_polo_roll.jpg',
      'milkybar_choo_1791040622231.jpg': 'milkybar_choo.jpg',
      'cadbury_perk_extra_1791040655551.jpg': 'cadbury_perk_extra.jpg'
    };
    for (const [src, dst] of Object.entries(imageMap)) {
      const s = path.join(brainDir, src);
      const d = path.join(destDir, dst);
      if (fs.existsSync(s)) {
        fs.copyFileSync(s, d);
        copied++;
      }
    }
  }
  return res.json({ status: 'ok', synced: true, copied });
});

app.use('/products', express.static(path.join(__dirname, '../frontend/public/products')));
app.use('/products', express.static('C:/Users/sarat/.gemini/antigravity-ide/brain/3fc5a59a-2f99-4f0b-9a42-b62dd25c66f2'));
app.use('/products', express.static('C:/Users/sarat/.gemini/antigravity-ide/brain/c09a5086-1d65-4f2d-8feb-bc0d74e0da8f'));
app.use('/products', express.static('C:/Users/sarat/.gemini/antigravity-ide/brain/af93d1a5-2a4b-420e-9add-f56336c4df9f'));

// ─── API Routes ─────────────────────────────────────────
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/purchase-orders', require('./routes/purchaseOrderRoutes'));
app.use('/api/finance', require('./routes/financeRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));
app.use('/api/deliveries', require('./routes/deliveryRoutes'));
app.use('/api/stock-batches', require('./routes/stockBatchRoutes'));
app.use('/api/payment', require('./routes/paymentRoutes'));

// ─── Health Check ───────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SmartMart Pro Backend',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// ─── Error Handling ─────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ───────────────────────────────────────
app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════╗
  ║   🛒  SmartMart Pro — Backend API Server     ║
  ║   📡  http://localhost:${PORT}                  ║
  ║   📦  MongoDB Atlas + Full ERP REST APIs     ║
  ╚══════════════════════════════════════════════╝
  `);
});

module.exports = app;
