const mongoose = require('mongoose');

const storeSettingSchema = new mongoose.Schema({
  storeName: {
    type: String,
    default: 'SmartMart Pro Supermarket'
  },
  tagline: {
    type: String,
    default: 'Fresh Organic Groceries & Supermarket ERP'
  },
  email: {
    type: String,
    default: 'contact@smartmart.pro'
  },
  phone: {
    type: String,
    default: '+91 98401 23456'
  },
  address: {
    type: String,
    default: '14 Anna Salai, T. Nagar, Chennai - 600017, Tamil Nadu'
  },
  currency: {
    type: String,
    default: 'INR (₹) - Indian Rupee'
  },
  timezone: {
    type: String,
    default: 'Asia/Kolkata (IST +05:30)'
  },
  operatingHours: {
    type: String,
    default: '07:00 AM - 11:00 PM (Mon - Sun)'
  },
  taxRate: {
    type: Number,
    default: 18
  },
  gstin: {
    type: String,
    default: '33AAACS1429B1ZB'
  },
  legalBusinessName: {
    type: String,
    default: 'SmartMart Pro Supermarket Private Limited'
  },
  stateRegistration: {
    type: String,
    default: 'Tamil Nadu (State Code: 33)'
  },
  taxInvoicePrefix: {
    type: String,
    default: 'SMP/2026/INV-'
  },
  taxInclusive: {
    type: Boolean,
    default: true
  },
  hsnPrint: {
    type: Boolean,
    default: true
  },
  lowStockThreshold: {
    type: Number,
    default: 15
  },
  paymentMethods: {
    cod: { type: Boolean, default: true },
    upi: { type: Boolean, default: true },
    card: { type: Boolean, default: true },
    wallet: { type: Boolean, default: true },
    netbanking: { type: Boolean, default: true },
    upiVpa: { type: String, default: 'smartmartpro@icici' },
    walletCashbackPercent: { type: Number, default: 5 },
    codMaxLimit: { type: Number, default: 10000 }
  },
  notifications: {
    emailAlerts: { type: Boolean, default: true },
    smsAlerts: { type: Boolean, default: true },
    pushAlerts: { type: Boolean, default: true },
    alertEmail: { type: String, default: 'manager@smartmart.pro' }
  },
  appearance: {
    accentColor: { type: String, default: 'emerald' },
    compactMode: { type: Boolean, default: false },
    soundEnabled: { type: Boolean, default: true }
  },
  branches: [{
    id: String,
    name: String,
    city: String,
    address: String,
    phone: String,
    isHeadquarters: Boolean,
    status: { type: String, default: 'Active' }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('StoreSetting', storeSettingSchema);

