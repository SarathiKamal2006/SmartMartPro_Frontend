const StoreSetting = require('../models/StoreSetting');

// @desc    Get store settings
// @route   GET /api/settings
const getSettings = async (req, res) => {
  try {
    let setting = await StoreSetting.findOne();
    if (!setting) {
      setting = await StoreSetting.create({
        storeName: 'SmartMart Pro Supermarket',
        taxRatePercent: 5.0,
        currency: '₹',
        branches: [
          { id: 'BR-01', name: 'Chennai Central Superstore (Main)', city: 'Chennai', isHeadquarters: true },
          { id: 'BR-02', name: 'Bengaluru Indiranagar Express', city: 'Bengaluru', isHeadquarters: false },
          { id: 'BR-03', name: 'Mumbai Bandra Superstore', city: 'Mumbai', isHeadquarters: false }
        ]
      });
    }
    res.json({ success: true, setting, data: setting });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Update store settings
// @route   PUT /api/settings
const updateSettings = async (req, res) => {
  try {
    let setting = await StoreSetting.findOne();
    if (!setting) {
      setting = new StoreSetting(req.body);
    } else {
      Object.assign(setting, req.body);
    }
    await setting.save();
    res.json({ success: true, message: 'Settings saved', setting, data: setting });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

module.exports = {
  getSettings,
  updateSettings
};
