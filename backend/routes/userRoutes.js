const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET /api/users — Fetch all staff members / directory
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/users — Add new employee / staff member
router.post('/', async (req, res) => {
  try {
    const { name, email, password, phone, role, branch, salary, status } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, message: 'Name and email are required.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'User with this email already exists.' });
    }

    const user = new User({
      name,
      email,
      password: password || 'password123',
      phone: phone || '',
      role: role || 'Cashier',
      branch: branch || 'Chennai Central Superstore (Main)',
      salary: salary || 25000,
      status: status || 'Active'
    });

    await user.save();
    const result = user.toObject();
    delete result.password;

    res.status(201).json({ success: true, message: 'Staff member created successfully', data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/users/:id — Update employee details
router.put('/:id', async (req, res) => {
  try {
    const { name, phone, role, branch, salary, status } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (role) user.role = role;
    if (branch) user.branch = branch;
    if (salary) user.salary = salary;
    if (status) user.status = status;

    await user.save();
    const result = user.toObject();
    delete result.password;

    res.json({ success: true, message: 'Employee updated', data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/users/:id — Delete employee
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }
    res.json({ success: true, message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
