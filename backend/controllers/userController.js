const User = require('../models/User');

// @desc    Fetch all staff members / directory
// @route   GET /api/users
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users, employees: users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Add new employee / staff member
// @route   POST /api/users
const createUser = async (req, res) => {
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
      email: email.toLowerCase(),
      password: password || 'password123',
      phone: phone || '',
      role: role || 'Cashier',
      branch: branch || 'Chennai Central Superstore (Main)',
      salary: Number(salary) || 25000,
      status: status || 'Active'
    });

    await user.save();
    const result = user.toObject();
    delete result.password;

    res.status(201).json({ success: true, message: 'Staff member created successfully', data: result, employee: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update employee details
// @route   PUT /api/users/:id
const updateUser = async (req, res) => {
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
    if (salary) user.salary = Number(salary);
    if (status) user.status = status;

    await user.save();
    const result = user.toObject();
    delete result.password;

    res.json({ success: true, message: 'Employee updated', data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Delete employee
// @route   DELETE /api/users/:id
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }
    res.json({ success: true, message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getUsers,
  createUser,
  updateUser,
  deleteUser
};
