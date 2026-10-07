const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const seedDatabase = require('../seed');
const fs = require('fs');
const path = require('path');

// Auto-sync chocolate images on first request
let imagesSynced = false;
router.use((req, res, next) => {
  if (!imagesSynced) {
    imagesSynced = true;
    try {
      const brainDir = 'C:/Users/sarat/.gemini/antigravity-ide/brain/3fc5a59a-2f99-4f0b-9a42-b62dd25c66f2';
      const destDir = path.resolve(__dirname, '../../frontend/public/products');
      if (fs.existsSync(brainDir) && fs.existsSync(destDir)) {
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
          }
        }
        console.log('✅ Auto-synced 12 chocolate images to frontend/public/products');
      }
      // Purge requested deleted items from MongoDB
      const DELETED_SKUS = [
        'CHK-004', 'CHK-005', 'CHK-006',
        'TEA-001', 'COF-001', 'COF-002', 'COF-003',
        'CHE-001', 'CHE-002', 'CHE-004', 'CHE-005', 'CHE-006',
        'MAS-109', 'MAS-110', 'MAS-111', 'MAS-112'
      ];
      const Product = require('../models/Product');
      Product.deleteMany({
        $or: [
          { sku: { $in: DELETED_SKUS } },
          { name: { $regex: /5 Star|KitKat|Perk Bar Double|Asafoetida|Darling Turmeric|MTR Hing|KSC 333 Tamarind/i } }
        ]
      }).exec().then(res => {
        if (res.deletedCount > 0) console.log(`🗑️ Purged ${res.deletedCount} deleted products from DB`);
      }).catch(() => {});
    } catch (e) {
      console.error('Failed to sync chocolate images:', e);
    }
  }
  next();
});

const GLOBAL_EXCLUDED_SKUS = [
  'CHK-004', 'CHK-005', 'CHK-006',
  'TEA-001', 'COF-001', 'COF-002', 'COF-003',
  'CHE-001', 'CHE-002', 'CHE-004', 'CHE-005', 'CHE-006',
  'MAS-109', 'MAS-110', 'MAS-111', 'MAS-112'
];

// GET/POST /api/products/reseed — Reset & seed products with clean initial catalog
router.all('/reseed', async (req, res) => {
  try {
    await seedDatabase();
    const products = await Product.find({ sku: { $nin: GLOBAL_EXCLUDED_SKUS } }).sort({ createdAt: -1 });
    res.json({ success: true, message: 'Database re-seeded with original product list.', count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/categories — Get distinct list of categories with product counts
router.get('/categories', async (req, res) => {
  try {
    const Category = require('../models/Category');
    const categories = await Category.find({});
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/category/:category — Products by category
router.get('/category/:category', async (req, res) => {
  try {
    const categoryName = decodeURIComponent(req.params.category);
    let query = { sku: { $nin: GLOBAL_EXCLUDED_SKUS } };
    if (categoryName && categoryName !== 'All Categories' && categoryName !== 'All') {
      query.category = { $regex: new RegExp(`^${categoryName}$`, 'i') };
    }
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, category: categoryName, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/search/:query — Search products by query
router.get('/search/:query', async (req, res) => {
  try {
    const q = decodeURIComponent(req.params.query);
    const products = await Product.find({
      sku: { $nin: GLOBAL_EXCLUDED_SKUS },
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } },
        { sku: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    res.json({ success: true, count: products.length, query: q, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products — Fetch products with search, category, brand, price, sort
router.get('/', async (req, res) => {
  try {
    const { category, search, barcode, brand, minPrice, maxPrice, sort, status } = req.query;
    let query = { sku: { $nin: GLOBAL_EXCLUDED_SKUS } };

    if (category && category !== 'All' && category !== 'All Categories' && category !== 'cat-all') {
      query.category = { $regex: new RegExp(category, 'i') };
    }

    if (barcode) {
      query.barcode = barcode;
    }

    if (brand) {
      query.brand = { $regex: new RegExp(brand, 'i') };
    }

    if (status) {
      query.status = status;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    else if (sort === 'price-high') sortOption = { price: -1 };
    else if (sort === 'discount') sortOption = { discountPercentage: -1 };
    else if (sort === 'newest') sortOption = { createdAt: -1 };

    const products = await Product.find(query).sort(sortOption);
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/products/:id — Single product by mongo ID or SKU
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findOne({
      $or: [{ _id: mongoose.isValidObjectId(req.params.id) ? req.params.id : null }, { sku: req.params.id }]
    });
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/products — Add product
router.post('/', async (req, res) => {
  try {
    const { name, category, price, costPrice, stock, threshold, unit, supplier, expiryDate, barcode, image } = req.body;
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Name, price, and stock are required.' });
    }

    // Auto-generate SKU if not provided
    const sku = req.body.sku || `PRD-${Math.floor(100 + Math.random() * 900)}`;
    const autoBarcode = barcode || `8901234${Math.floor(10000 + Math.random() * 90000)}`;

    const product = new Product({
      sku,
      name,
      category: category || 'Fruits & Vegetables',
      price: Number(price),
      costPrice: Number(costPrice || 0),
      stock: Number(stock),
      threshold: Number(threshold || 10),
      unit: unit || 'kg',
      supplier: supplier || 'SmartMart Local Vendor',
      expiryDate: expiryDate || '2026-12-31',
      barcode: autoBarcode,
      image: image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80'
    });

    await product.save();
    res.status(201).json({ success: true, message: 'Product added successfully', data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/products/:id — Edit product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }

    const fields = ['name', 'category', 'price', 'costPrice', 'stock', 'threshold', 'unit', 'supplier', 'expiryDate', 'barcode', 'image', 'discount'];
    fields.forEach(field => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field];
      }
    });

    await product.save();
    res.json({ success: true, message: 'Product updated', data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/products/:id — Delete product
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
