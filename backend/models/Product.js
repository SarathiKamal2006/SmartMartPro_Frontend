const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  costPrice: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    default: 'kg'
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  threshold: {
    type: Number,
    default: 10
  },
  status: {
    type: String,
    enum: ['In Stock', 'Low Stock', 'Out of Stock'],
    default: 'In Stock'
  },
  image: {
    type: String,
    default: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80'
  },
  expiryDate: {
    type: String,
    default: ''
  },
  supplier: {
    type: String,
    default: 'SmartMart Local Vendor'
  },
  barcode: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 4.5
  },
  discount: {
    type: String,
    default: ''
  },
  brand: {
    type: String,
    default: ''
  },
  subCategory: {
    type: String,
    default: ''
  },
  discountPercentage: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  },
  offerAvailable: {
    type: Boolean,
    default: false
  },
  packSize: {
    type: String,
    default: '1 Kg'
  },
  packSizes: {
    type: [String],
    default: ['100 gm', '250 gm', '1 Kg', '2 Kg']
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  weightOptions: {
    type: [String],
    default: ['100 gm', '250 gm', '1 Kg', '2 Kg']
  },
  selectedWeight: {
    type: String,
    default: '1 Kg'
  },
  baseWeight: {
    type: String,
    default: '1 Kg'
  },
  batchNo: {
    type: String,
    default: 'BATCH-2026-A'
  },
  branch: {
    type: String,
    default: 'Chennai Central Superstore (Main)'
  }
}, {
  timestamps: true
});

// Auto-update status based on stock & threshold
productSchema.pre('save', function(next) {
  if (this.stock <= 0) {
    this.status = 'Out of Stock';
  } else if (this.stock <= this.threshold) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
  next();
});

module.exports = mongoose.model('Product', productSchema);
