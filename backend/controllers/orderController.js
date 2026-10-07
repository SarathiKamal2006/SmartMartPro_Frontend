const Order = require('../models/Order');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const Customer = require('../models/Customer');
const FinanceTransaction = require('../models/FinanceTransaction');

// @desc    Get all orders
// @route   GET /api/orders
const getOrders = async (req, res) => {
  try {
    const { status, type, search } = req.query;
    let query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderId: req.params.id }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    res.json({ success: true, data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create new order / sale
// @route   POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { customerName, customerEmail, phone, items, paymentMethod, type, branch, discount, deliveryAddress } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: 'Order items are required.' });
    }

    const orderId = req.body.orderId || `#ORD-${Math.floor(1000 + Math.random() * 9000)}`;

    // Calculate order financials
    let subtotal = 0;
    const processedItems = [];

    for (const item of items) {
      const pId = item.productId || item.id || item.sku;
      const product = await Product.findOne({
        $or: [{ sku: pId }, { name: item.name }]
      });

      const qty = Number(item.quantity || 1);
      const itemPrice = product ? product.price : Number(item.price || 0);

      subtotal += itemPrice * qty;

      processedItems.push({
        productId: product ? product._id.toString() : pId,
        sku: product ? product.sku : (item.sku || pId),
        name: product ? product.name : item.name,
        quantity: qty,
        price: itemPrice,
        unit: product ? product.unit : (item.unit || 'kg'),
        image: product ? product.image : (item.image || '')
      });

      // Decrement product stock in DB if product exists
      if (product) {
        product.stock = Math.max(0, product.stock - qty);
        await product.save();

        // Create inventory audit log for sale
        const log = new InventoryLog({
          logId: `POS-${Math.floor(1000 + Math.random() * 9000)}`,
          sku: product.sku,
          productName: product.name,
          action: type === 'Online Storefront' ? 'Online Order' : 'POS Sale',
          change: -qty,
          newStock: product.stock,
          branch: branch || 'Chennai Central Superstore (Main)',
          performedBy: customerName || 'Cashier',
          note: `Sale order ${orderId}`
        });
        await log.save();
      }
    }

    const disc = Number(discount || 0);
    const tax = Math.round((subtotal - disc) * 0.18 * 100) / 100;
    const total = Math.max(0, subtotal - disc + tax);
    const deliveryOtp = Math.floor(1000 + Math.random() * 9000).toString();

    const order = new Order({
      orderId,
      customerName: customerName || 'Walk-in Customer',
      customerEmail: customerEmail || '',
      phone: phone || '',
      items: processedItems,
      subtotal,
      tax,
      discount: disc,
      total,
      paymentMethod: paymentMethod || 'Cash',
      paymentStatus: 'Paid',
      status: type === 'Online Storefront' ? 'Pending' : 'Completed',
      type: type || 'POS',
      branch: branch || 'Chennai Central Superstore (Main)',
      deliveryOtp,
      deliveryAddress: deliveryAddress || '',
      driverName: type === 'Online Storefront' ? 'Amira Patel' : ''
    });

    await order.save();

    // If customer email/phone exists, handle wallet deduction or add loyalty points
    if (customerEmail || phone) {
      const customer = await Customer.findOne({
        $or: [{ email: (customerEmail || '').toLowerCase() }, { phone }]
      });

      if (customer) {
        if (paymentMethod === 'Wallet') {
          customer.walletBalance = Math.max(0, customer.walletBalance - total);
        }
        // Add 1 loyalty point for every ₹100 spent
        customer.loyaltyPoints += Math.floor(total / 100);
        await customer.save();
      }
    }

    // Log Revenue Transaction
    const finTrx = new FinanceTransaction({
      transactionId: `#TRX-${Math.floor(1000 + Math.random() * 9000)}`,
      type: 'Revenue',
      category: type === 'Online Storefront' ? 'Online Storefront Order' : 'POS Supermarket Sale',
      amount: total,
      paymentMethod: paymentMethod || 'Cash',
      referenceId: orderId,
      description: `Revenue from Order ${orderId}`,
      branch: branch || 'Chennai Central Superstore (Main)'
    });
    await finTrx.save();

    res.status(201).json({ success: true, message: 'Order created successfully', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
const updateOrderStatus = async (req, res) => {
  try {
    const { status, driverName, driverPhone } = req.body;
    const order = await Order.findOne({
      $or: [{ _id: req.params.id }, { orderId: req.params.id }]
    });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (status) order.status = status;
    if (driverName) order.driverName = driverName;
    if (driverPhone) order.driverPhone = driverPhone;

    await order.save();
    res.json({ success: true, message: 'Order status updated', data: order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus
};
