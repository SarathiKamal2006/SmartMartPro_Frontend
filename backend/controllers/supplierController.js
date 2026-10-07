const Supplier = require('../models/Supplier');

// @desc    Supplier directory
// @route   GET /api/suppliers
const getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.json({ success: true, count: suppliers.length, data: suppliers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add new supplier
// @route   POST /api/suppliers
const createSupplier = async (req, res) => {
  try {
    const { name, contactPerson, email, phone, address, category, rating, activeStatus } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, message: 'Supplier name is required.' });
    }

    const supplierId = req.body.supplierId || `SUP-${Math.floor(10 + Math.random() * 90)}`;

    const supplier = new Supplier({
      supplierId,
      name,
      contactPerson: contactPerson || '',
      email: email || '',
      phone: phone || '',
      address: address || '',
      category: category || 'General Produce',
      rating: Number(rating || 4.8),
      activeStatus: activeStatus || 'Active'
    });

    await supplier.save();
    res.status(201).json({ success: true, message: 'Supplier added', data: supplier });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Edit supplier
// @route   PUT /api/suppliers/:id
const updateSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ success: false, message: 'Supplier not found.' });
    }

    Object.assign(supplier, req.body);
    await supplier.save();

    res.json({ success: true, message: 'Supplier updated', data: supplier });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getSuppliers,
  createSupplier,
  updateSupplier
};
