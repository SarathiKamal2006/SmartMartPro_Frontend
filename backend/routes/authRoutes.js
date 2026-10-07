const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const Customer = require('../models/Customer');
const User = require('../models/User');
const Otp = require('../models/Otp');

const JWT_SECRET = process.env.JWT_SECRET || 'smartmart_super_secret_key_2024';

const gmailUser = (process.env.GMAIL_USER || '').trim();
const gmailPass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: { user: gmailUser, pass: gmailPass },
  tls: { rejectUnauthorized: false }
});

function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function signToken(user) {
  return jwt.sign(
    {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role || 'Customer',
      avatar: user.avatar,
      walletBalance: user.walletBalance,
      loyaltyPoints: user.loyaltyPoints
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

function buildOtpEmailHTML(name, otp) {
  return `
  <div style="max-width:480px;margin:20px auto;background:#1e293b;border-radius:16px;padding:32px;color:#ffffff;font-family:sans-serif;">
    <h2 style="color:#10b981;margin-top:0;">SmartMart Pro Verification Code</h2>
    <p>Hello <strong>${name}</strong>,</p>
    <p>Your 4-digit OTP for SmartMart Pro account verification is:</p>
    <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#10b981;padding:16px;background:#0f172a;border-radius:12px;text-align:center;margin:20px 0;">
      ${otp}
    </div>
    <p style="color:#94a3b8;font-size:12px;">Valid for 5 minutes. Do not share this code with anyone.</p>
  </div>`;
}

function buildResetPasswordEmailHTML(name, otp) {
  return `
  <div style="max-width:480px;margin:20px auto;background:#1e293b;border-radius:16px;padding:32px;color:#ffffff;font-family:sans-serif;">
    <h2 style="color:#10b981;margin-top:0;">SmartMart Pro Password Reset</h2>
    <p>Hello <strong>${name || 'Valued User'}</strong>,</p>
    <p>We received a request to reset your SmartMart Pro account password. Your 4-digit security code is:</p>
    <div style="font-size:32px;font-weight:bold;letter-spacing:8px;color:#10b981;padding:16px;background:#0f172a;border-radius:12px;text-align:center;margin:20px 0;">
      ${otp}
    </div>
    <p style="color:#94a3b8;font-size:12px;">Valid for 10 minutes. If you did not request a password reset, please ignore this email.</p>
  </div>`;
}


// POST /api/auth/send-otp
router.post('/send-otp', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required.' });
    }

    const existingCustomer = await Customer.findOne({ email: email.toLowerCase() });
    if (existingCustomer) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const otp = generateOTP();
    await Otp.deleteMany({ email: email.toLowerCase() });

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    await Otp.create({
      email: email.toLowerCase(),
      otp,
      name,
      phone,
      password: hashedPassword
    });

    if (gmailUser && gmailPass) {
      try {
        await transporter.sendMail({
          from: `"SmartMart Pro" <${gmailUser}>`,
          to: email,
          subject: `🔐 SmartMart Pro — Your Verification Code: ${otp}`,
          html: buildOtpEmailHTML(name, otp)
        });
      } catch (e) {
        console.warn('Gmail SMTP send failed, falling back:', e.message);
      }
    }
    console.log(`📧 OTP generated for ${email}: ${otp}`);

    res.json({ success: true, message: `Verification code sent to ${email}` });
  } catch (err) {
    console.error('send-otp error:', err);
    res.status(500).json({ success: false, message: 'Failed to send OTP.' });
  }
});

// POST /api/auth/verify-otp
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const otpRecord = await Otp.findOne({ email: email.toLowerCase() });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'OTP expired or invalid.' });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code.' });
    }

    const customer = new Customer({
      name: otpRecord.name,
      email: otpRecord.email,
      phone: otpRecord.phone,
      password: otpRecord.password,
      isVerified: true
    });
    customer.$skipPasswordHash = true;
    await customer.save();

    await Otp.deleteOne({ _id: otpRecord._id });
    const token = signToken(customer);

    res.json({
      success: true,
      message: 'Account verified successfully!',
      token,
      user: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        role: 'Customer',
        walletBalance: customer.walletBalance,
        loyaltyPoints: customer.loyaltyPoints
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Verification failed.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required.' });
    }

    // Check staff User collection first, then Customer collection
    let user = await User.findOne({ email: email.toLowerCase() });
    let isCustomer = false;

    if (!user) {
      user = await Customer.findOne({ email: email.toLowerCase() });
      isCustomer = true;
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = signToken(user);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'Customer',
        branch: user.branch || 'Chennai Central Superstore (Main)',
        walletBalance: user.walletBalance || 2000,
        loyaltyPoints: user.loyaltyPoints || 0
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Login failed.' });
  }
});

// POST /api/auth/oauth — Google & Social OAuth Login Flow
router.post('/oauth', async (req, res) => {
  try {
    const { provider, email, name, avatar } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'OAuth email required.' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      user = await Customer.findOne({ email: email.toLowerCase() });
    }

    if (!user) {
      // Auto-provision new verified Customer via OAuth
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(`oauth_${Date.now()}`, salt);

      user = new Customer({
        name: name || email.split('@')[0],
        email: email.toLowerCase(),
        phone: '+91 99000 00000',
        password: hashedPassword,
        isVerified: true,
        walletBalance: 2000.00,
        loyaltyPoints: 100,
        avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      });
      user.$skipPasswordHash = true;
      await user.save();
    }

    const token = signToken(user);
    res.json({
      success: true,
      message: `Successfully authenticated via ${provider || 'Google'} OAuth`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || 'Customer',
        branch: user.branch || 'Chennai Central Superstore (Main)',
        walletBalance: user.walletBalance || 2000,
        loyaltyPoints: user.loyaltyPoints || 100,
        avatar: user.avatar
      }
    });
  } catch (err) {
    console.error('OAuth error:', err);
    res.status(500).json({ success: false, message: 'OAuth authentication failed.' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided.' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    let user = await User.findById(decoded.id).select('-password');
    if (!user) {
      user = await Customer.findById(decoded.id).select('-password');
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid token.' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      user = await Customer.findOne({ email: cleanEmail });
    }

    if (!user) {
      return res.status(404).json({ success: false, message: 'No registered account found with this email address.' });
    }

    const otp = generateOTP();
    await Otp.deleteMany({ email: cleanEmail });

    await Otp.create({
      email: cleanEmail,
      otp,
      name: user.name,
      phone: user.phone || '+91 99000 00000',
      password: user.password
    });

    if (gmailUser && gmailPass) {
      try {
        await transporter.sendMail({
          from: `"SmartMart Pro" <${gmailUser}>`,
          to: cleanEmail,
          subject: `🔑 SmartMart Pro — Password Reset Code: ${otp}`,
          html: buildResetPasswordEmailHTML(user.name, otp)
        });
      } catch (e) {
        console.warn('Gmail SMTP send failed, falling back:', e.message);
      }
    }
    console.log(`📧 Password Reset OTP generated for ${cleanEmail}: ${otp}`);

    res.json({ 
      success: true, 
      message: `Password reset code sent to ${cleanEmail}`,
      otp: process.env.NODE_ENV === 'development' ? otp : undefined
    });
  } catch (err) {
    console.error('forgot-password error:', err);
    res.status(500).json({ success: false, message: 'Failed to process password reset request.' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const otpRecord = await Otp.findOne({ email: cleanEmail });

    if (!otpRecord) {
      return res.status(400).json({ success: false, message: 'Password reset code expired or invalid.' });
    }

    if (otpRecord.otp !== otp) {
      return res.status(400).json({ success: false, message: 'Invalid 4-digit verification code.' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    let updated = await User.findOneAndUpdate({ email: cleanEmail }, { password: hashedPassword }, { new: true });
    if (!updated) {
      updated = await Customer.findOneAndUpdate({ email: cleanEmail }, { password: hashedPassword }, { new: true });
    }

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Account not found.' });
    }

    await Otp.deleteOne({ _id: otpRecord._id });

    res.json({
      success: true,
      message: 'Password updated successfully! You can now log in.'
    });
  } catch (err) {
    console.error('reset-password error:', err);
    res.status(500).json({ success: false, message: 'Failed to update password.' });
  }
});

module.exports = router;

