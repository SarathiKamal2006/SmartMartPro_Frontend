const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const nodemailer = require('nodemailer');

// @desc    List delivery dispatches
// @route   GET /api/deliveries
const getDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.find().sort({ createdAt: -1 });
    res.json({ success: true, count: deliveries.length, data: deliveries });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Create delivery order dispatch
// @route   POST /api/deliveries
const createDelivery = async (req, res) => {
  try {
    const { orderId, customerName, address, phone, itemsCount, amount, driverName, branch } = req.body;
    if (!orderId || !customerName || !address) {
      return res.status(400).json({ success: false, message: 'Order ID, customer name, and address are required.' });
    }

    const deliveryId = `DEL-${Math.floor(800 + Math.random() * 200)}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    const delivery = new Delivery({
      deliveryId,
      orderId,
      customerName,
      address,
      phone: phone || '',
      itemsCount: Number(itemsCount || 1),
      amount: Number(amount || 0),
      status: 'Assigned',
      otp,
      driverName: driverName || 'Amira Patel',
      branch: branch || 'Chennai Central Superstore (Main)'
    });

    await delivery.save();
    res.status(201).json({ success: true, message: 'Delivery dispatched', data: delivery });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Verify customer 4-digit OTP
// @route   POST /api/deliveries/verify-otp
const verifyDeliveryOtp = async (req, res) => {
  try {
    const { deliveryId, otp } = req.body;
    if (!deliveryId || !otp) {
      return res.status(400).json({ success: false, message: 'Delivery ID and OTP are required.' });
    }

    const delivery = await Delivery.findOne({
      $or: [{ _id: req.params.id }, { deliveryId }]
    });

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery order not found.' });
    }

    if (delivery.otp !== otp.toString()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP. Verification failed.' });
    }

    delivery.status = 'Delivered';
    delivery.deliveryTime = 'Delivered just now';
    await delivery.save();

    // Update parent order status to Delivered
    if (delivery.orderId) {
      await Order.findOneAndUpdate(
        { orderId: delivery.orderId },
        { status: 'Delivered' }
      );
    }

    res.json({ success: true, message: `Delivery ${delivery.deliveryId} verified with OTP!`, data: delivery });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Send Delivery Handover OTP to Customer Email
// @route   POST /api/deliveries/send-email-otp
const sendEmailOtp = async (req, res) => {
  try {
    const { deliveryId, email, customerName } = req.body;
    if (!deliveryId) {
      return res.status(400).json({ success: false, message: 'Delivery ID required.' });
    }

    const delivery = await Delivery.findOne({
      $or: [{ deliveryId }, { _id: req.params.id }]
    });

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery record not found.' });
    }

    const targetEmail = email || 'ananya.s@gmail.com';
    const otp = delivery.otp || '4812';

    const gmailUser = (process.env.GMAIL_USER || '').trim();
    const gmailPass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

    if (gmailUser && gmailPass) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: { user: gmailUser, pass: gmailPass },
        tls: { rejectUnauthorized: false }
      });

      await transporter.sendMail({
        from: `"SmartMart Pro Express" <${gmailUser}>`,
        to: targetEmail,
        subject: `🚚 Delivery Security Code: ${otp} (SmartMart Order ${delivery.orderId || delivery.deliveryId})`,
        html: `
        <div style="max-width:480px;margin:20px auto;background:#0f172a;border-radius:20px;padding:32px;color:#ffffff;font-family:sans-serif;">
          <h2 style="color:#10b981;margin:0;text-align:center;">🚚 SmartMart Pro Delivery</h2>
          <p style="color:#94a3b8;font-size:13px;text-align:center;">Doorstep Handover Security Code</p>
          <p style="margin-top:20px;">Hello <strong>${customerName || delivery.customerName}</strong>,</p>
          <p>Your SmartMart delivery driver <strong>${delivery.driverName}</strong> is arriving at your doorstep!</p>
          <p>Please share this 4-digit handover OTP with the driver to confirm receiving your order:</p>
          <div style="font-size:38px;font-weight:bold;letter-spacing:10px;color:#10b981;padding:18px;background:#1e293b;border-radius:16px;text-align:center;margin:24px 0;border:1px solid #10b981;">
            ${otp}
          </div>
          <p style="color:#94a3b8;font-size:12px;">Delivery ID: <strong>${delivery.deliveryId}</strong> | Order ID: <strong>${delivery.orderId}</strong></p>
          <p style="color:#64748b;font-size:11px;margin-top:24px;">Thank you for shopping with SmartMart Pro!</p>
        </div>`
      });
      console.log(`📧 Delivery OTP ${otp} emailed to ${targetEmail}`);
    } else {
      console.log(`📧 Mock Delivery OTP ${otp} prepared for ${targetEmail}`);
    }

    res.json({
      success: true,
      message: `Handover OTP sent to customer email (${targetEmail})!`,
      otp,
      email: targetEmail
    });
  } catch (err) {
    console.error('Error sending delivery email OTP:', err.message);
    res.status(500).json({ success: false, message: 'Failed to send OTP to email.' });
  }
};

module.exports = {
  getDeliveries,
  createDelivery,
  verifyDeliveryOtp,
  sendEmailOtp
};
