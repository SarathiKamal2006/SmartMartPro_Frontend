const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/employees
router.get('/', async (req, res) => {
  try {
    const employees = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: employees.length, employees });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/employees — Add new staff
router.post('/', async (req, res) => {
  try {
    const { name, email, password, role, branch, phone, salary } = req.body;

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already exists.' });
    }

    const employee = new User({
      name,
      email: email.toLowerCase(),
      password: password || 'smartmart2026',
      role: role || 'Cashier',
      branch: branch || 'Chennai Central Superstore (Main)',
      phone: phone || '',
      salary: Number(salary) || 25000
    });

    await employee.save();
    res.status(201).json({ success: true, message: 'Employee created successfully', employee });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

module.exports = router;
