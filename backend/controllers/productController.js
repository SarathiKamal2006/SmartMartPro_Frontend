const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const seedDatabase = require('../config/seed');

const GLOBAL_EXCLUDED_SKUS = [
  'CHK-004', 'CHK-005', 'CHK-006',
  'TEA-001', 'COF-001', 'COF-002', 'COF-003',
  'CHE-001', 'CHE-002', 'CHE-004', 'CHE-005', 'CHE-006',
  'MAS-109', 'MAS-110', 'MAS-111', 'MAS-112'
];

// @desc    Reseed products catalog
// @route   ALL /api/products/reseed
const reseedProducts = async (req, res) => {
  try {
    await seedDatabase();
    const products = await Product.find({ sku: { $nin: GLOBAL_EXCLUDED_SKUS } }).sort({ createdAt: -1 });
    res.json({ success: true, message: 'Database re-seeded with original product list.', count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get products by category
// @route   GET /api/products/category/:category
const getProductsByCategory = async (req, res) => {
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
};

// @desc    Search products
// @route   GET /api/products/search/:query
const searchProducts = async (req, res) => {
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
};

// @desc    Get all products with filtering & sorting
// @route   GET /api/products
const getProducts = async (req, res) => {
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
};

// @desc    Get single product by ID or SKU
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
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
};

// @desc    Create product
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, category, price, costPrice, stock, threshold, unit, supplier, expiryDate, barcode, image } = req.body;
    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ success: false, message: 'Name, price, and stock are required.' });
    }

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
};

// @desc    Update product
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
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
};

// @desc    Delete product
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found.' });
    }
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  reseedProducts,
  getCategories,
  getProductsByCategory,
  searchProducts,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
