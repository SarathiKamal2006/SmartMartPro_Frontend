/**
 * SmartMart Pro — MongoDB Atlas Database Configuration & Connection
 */
const dns = require('dns');
const mongoose = require('mongoose');
const seedDatabase = require('./seed');

// Fix SRV DNS resolution issues on Windows local networks for MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch (e) {
  // Ignore DNS override errors if unsupported
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Atlas connected: ${conn.connection.host}`);
    
    // Auto-seed database collections if empty
    try {
      await seedDatabase();
    } catch (sErr) {
      console.warn('Auto-seed check note:', sErr.message);
    }
  } catch (err) {
    console.error(`❌ MongoDB connection error: ${err.message}`);
  }
};

module.exports = connectDB;
