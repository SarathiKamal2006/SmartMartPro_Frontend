const Customer = require('../models/Customer');
const Order = require('../models/Order');

// @desc    List all customers
// @route   GET /api/customers
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: customers.length, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select('-password');
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }
    res.json({ success: true, data: customer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Top-up customer wallet balance
// @route   POST /api/customers/:id/wallet
const topUpWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    const topUpAmount = Number(amount || 0);

    if (topUpAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Valid top-up amount is required.' });
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    customer.walletBalance += topUpAmount;
    await customer.save();

    res.json({
      success: true,
      message: `Successfully topped up ₹${topUpAmount}. New wallet balance: ₹${customer.walletBalance}`,
      data: {
        id: customer._id,
        walletBalance: customer.walletBalance,
        loyaltyPoints: customer.loyaltyPoints
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get customer order history
// @route   GET /api/customers/:id/orders
const getCustomerOrders = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found.' });
    }

    const orders = await Order.find({
      $or: [{ customerEmail: customer.email }, { phone: customer.phone }]
    }).sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create new customer manually
// @route   POST /api/customers
const createCustomer = async (req, res) => {
  try {
    const { name, email, phone, walletBalance, loyaltyPoints } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, message: 'Name, email, and phone are required.' });
    }

    const existing = await Customer.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Customer with this email already exists.' });
    }

    const customer = new Customer({
      name,
      email: email.toLowerCase(),
      phone,
      password: 'password123',
      walletBalance: Number(walletBalance || 1000),
      loyaltyPoints: Number(loyaltyPoints || 0),
      isVerified: true
    });

    await customer.save();
    const result = customer.toObject();
    delete result.password;

    res.status(201).json({ success: true, message: 'Customer created', data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getCustomers,
  getCustomerById,
  topUpWallet,
  getCustomerOrders,
  createCustomer
};
