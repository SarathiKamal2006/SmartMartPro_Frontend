const express = require('express');
const router = express.Router();
const StoreSetting = require('../models/StoreSetting');

// GET /api/settings — Fetch store configuration
router.get('/', async (req, res) => {
  try {
    let settings = await StoreSetting.findOne();
    if (!settings) {
      settings = new StoreSetting();
      await settings.save();
    }
    res.json({ success: true, data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/settings — Update store settings
router.put('/', async (req, res) => {
  try {
    let settings = await StoreSetting.findOne();
    if (!settings) {
      settings = new StoreSetting(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();
    res.json({ success: true, message: 'Settings updated successfully', data: settings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

