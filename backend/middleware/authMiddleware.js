const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Customer = require('../models/Customer');

const JWT_SECRET = process.env.JWT_SECRET || 'smartmart_super_secret_key_2024';

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);

      let user = await User.findById(decoded.id).select('-password');
      if (!user) {
        user = await Customer.findById(decoded.id).select('-password');
      }

      if (!user) {
        return res.status(401).json({ success: false, message: 'User not found or unauthorized' });
      }

      req.user = user;
      return next();
    } catch (error) {
      return res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user ? req.user.role : 'Unknown'}' is not authorized to access this resource`
      });
    }
    next();
  };
};

module.exports = {
  protect,
  authorize
};
