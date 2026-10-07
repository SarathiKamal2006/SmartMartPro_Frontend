const express = require('express');
const router = express.Router();
const {
  getSuppliers,
  createSupplier,
  updateSupplier
} = require('../controllers/supplierController');

// GET /api/suppliers
router.get('/', getSuppliers);

// POST /api/suppliers
router.post('/', createSupplier);

// PUT /api/suppliers/:id
router.put('/:id', updateSupplier);

module.exports = router;
