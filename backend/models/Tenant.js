const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, default: 0 },
  imageUrl: { type: String, default: '' },
  category: { type: String, default: 'General' },
  stockCount: { type: Number, default: null }, // null means infinite stock
  itemType: { type: String, enum: ['product', 'service'], default: 'product' },
  priceUnit: { type: String, default: '' }, // e.g. "per kg", "per piece"
  schedule: {
    workingDays: [{ type: Number }],            // 0=Sun, 1=Mon, ... 6=Sat
    startTime: { type: String, default: '09:00' },
    endTime: { type: String, default: '17:00' },
    slotDuration: { type: Number, default: 60 },  // minutes
    maxBookingsPerSlot: { type: Number, default: 1 }
  }
});

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true },
  discountPercentage: { type: Number, required: true, min: 1, max: 100 },
  isActive: { type: Boolean, default: true }
});

const orderSchema = new mongoose.Schema({
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String, default: '' },
  address: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  items: [
    {
      title: String,
      price: Number,
      qty: Number,
      bookingDate: String,
      bookingTime: String
    }
  ],
  totalPrice: { type: Number, required: true },
  discountApplied: { type: Number, default: 0 },
  couponCode: { type: String, default: '' },
  status: { type: String, default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
});

const tenantSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    businessName: { type: String, required: true },
    businessSlug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    themeType: {
      type: String,
      enum: ['ecommerce', 'booking', 'landing'],
      default: 'ecommerce',
    },
    primaryColor: { type: String, default: '#7c3aed' },
    fontFamily: { type: String, default: 'sans' },
    buttonShape: { type: String, enum: ['rounded', 'square', 'pill'], default: 'rounded' },
    colorMode: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
    heroHeadline: { type: String, default: '' },
    aboutText: { type: String, default: '' },
    supportEmail: { type: String, default: '' },
    location: { type: String, default: '' },
    backgroundImageUrl: { type: String, default: '' },
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    faviconUrl: { type: String, default: '' },
    pageViews: { type: Number, default: 0 },
    workingHours: {
      start: { type: String, default: '09:00' },
      end: { type: String, default: '17:00' }
    },
    items: [itemSchema],
    coupons: [couponSchema],
    orders: [orderSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Tenant', tenantSchema);
