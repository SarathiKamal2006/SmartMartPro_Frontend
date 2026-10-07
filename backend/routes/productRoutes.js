const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');
const {
  reseedProducts,
  getCategories,
  getProductsByCategory,
  searchProducts,
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');

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
      Product.deleteMany({
        $or: [
          { sku: { $in: DELETED_SKUS } },
          { name: { $regex: /5 Star|KitKat|Perk Bar Double|Asafoetida|Darling Turmeric|MTR Hing|KSC 333 Tamarind/i } }
        ]
      }).exec().then(res => {
        if (res && res.deletedCount > 0) console.log(`🗑️ Purged ${res.deletedCount} deleted products from DB`);
      }).catch(() => {});
    } catch (e) {
      console.error('Failed to sync chocolate images:', e);
    }
  }
  next();
});

// Reseed catalog
router.all('/reseed', reseedProducts);

// Categories
router.get('/categories', getCategories);

// Products by Category
router.get('/category/:category', getProductsByCategory);

// Search Products
router.get('/search/:query', searchProducts);

// List all products with filters
router.get('/', getProducts);

// Single Product by ID or SKU
router.get('/:id', getProductById);

// Create Product
router.post('/', createProduct);

// Update Product
router.put('/:id', updateProduct);

// Delete Product
router.delete('/:id', deleteProduct);

module.exports = router;
