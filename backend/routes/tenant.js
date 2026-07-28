const router = require('express').Router();
const auth = require('../middleware/auth');
const Tenant = require('../models/Tenant');

// POST /api/tenant — Create tenant (protected)
router.post('/', auth, async (req, res) => {
  try {
    const { businessName, businessSlug, themeType, primaryColor, heroHeadline, aboutText, supportEmail, location, backgroundImageUrl } = req.body;
    const slug = businessSlug.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const slugTaken = await Tenant.findOne({ businessSlug: slug });
    if (slugTaken) return res.status(400).json({ message: 'This URL slug is already taken. Try another.' });

    const tenant = await Tenant.create({
      userId: req.user.id,
      businessName,
      businessSlug: slug,
      themeType,
      primaryColor,
      heroHeadline,
      aboutText,
      supportEmail,
      location,
      backgroundImageUrl,
    });
    res.status(201).json(tenant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tenant/my — Get current user's tenants (protected)
router.get('/my', auth, async (req, res) => {
  try {
    const tenants = await Tenant.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(tenants);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tenant/:id — Update tenant details (protected)
router.put('/:id', auth, async (req, res) => {
  try {
    const tenant = await Tenant.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: req.body },
      { new: true, runValidators: true }
    );
    if (!tenant) return res.status(404).json({ message: 'Tenant not found.' });
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tenant/slug/:slug — Public route for site renderer
router.get('/slug/:slug', async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ businessSlug: req.params.slug });
    if (!tenant) return res.status(404).json({ message: 'Business not found.' });
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tenant/slug/:slug/view — Public route to increment page views
router.post('/slug/:slug/view', async (req, res) => {
  try {
    const tenant = await Tenant.findOneAndUpdate(
      { businessSlug: req.params.slug },
      { $inc: { pageViews: 1 } },
      { new: true }
    );
    if (!tenant) return res.status(404).json({ message: 'Business not found.' });
    res.json({ message: 'View recorded' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tenant/slug/:slug/orders — Public route to submit an order
router.post('/slug/:slug/orders', async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ businessSlug: req.params.slug });
    if (!tenant) return res.status(404).json({ message: 'Business not found.' });

    const { customerName, customerPhone, customerEmail, address, paymentMethod, items, totalPrice, couponCode, discountApplied } = req.body;
    
    // Decrement stock for ordered items
    for (const orderItem of items) {
      const tenantItem = tenant.items.find(i => i.title === orderItem.title);
      if (tenantItem && tenantItem.stockCount !== null && tenantItem.stockCount >= orderItem.qty) {
        tenantItem.stockCount -= orderItem.qty;
      }
    }

    tenant.orders.push({
      customerName,
      customerPhone,
      customerEmail: customerEmail || '',
      address,
      paymentMethod,
      items,
      totalPrice,
      couponCode: couponCode || '',
      discountApplied: discountApplied || 0,
      status: 'Pending'
    });
    
    await tenant.save();
    
    // Get the newly added order (the last one in the array)
    const newOrder = tenant.orders[tenant.orders.length - 1];
    
    res.status(201).json({ message: 'Order placed successfully!', orderId: newOrder._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tenant/slug/:slug/orders/:orderId/cancel — Public route to cancel an order
router.put('/slug/:slug/orders/:orderId/cancel', async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ businessSlug: req.params.slug });
    if (!tenant) return res.status(404).json({ message: 'Business not found.' });

    const order = tenant.orders.id(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    // Only allow cancellation if pending or processing
    if (order.status !== 'Pending' && order.status !== 'Processing') {
      return res.status(400).json({ message: `Cannot cancel an order with status: ${order.status}` });
    }

    order.status = 'Cancelled';
    await tenant.save();

    res.json({ message: 'Order cancelled successfully.', status: order.status });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tenant/slug/:slug/validate-coupon — Public route
router.post('/slug/:slug/validate-coupon', async (req, res) => {
  try {
    const { code } = req.body;
    const tenant = await Tenant.findOne({ businessSlug: req.params.slug });
    if (!tenant) return res.status(404).json({ message: 'Business not found.' });

    const coupon = tenant.coupons.find(c => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
    if (!coupon) return res.status(400).json({ message: 'Invalid or expired coupon.' });

    res.json({ discountPercentage: coupon.discountPercentage });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tenant/:id/items — Add item
router.post('/:id/items', auth, async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ _id: req.params.id, userId: req.user.id });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found.' });
    tenant.items.push(req.body);
    await tenant.save();
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tenant/:id/items/:itemId — Update item
router.put('/:id/items/:itemId', auth, async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ _id: req.params.id, userId: req.user.id });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found.' });
    const item = tenant.items.id(req.params.itemId);
    if (!item) return res.status(404).json({ message: 'Item not found.' });
    Object.assign(item, req.body);
    await tenant.save();
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tenant/:id/items/:itemId — Delete item
router.delete('/:id/items/:itemId', auth, async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ _id: req.params.id, userId: req.user.id });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found.' });
    tenant.items.pull(req.params.itemId);
    await tenant.save();
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/tenant/:id/coupons — Add coupon
router.post('/:id/coupons', auth, async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ _id: req.params.id, userId: req.user.id });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found.' });
    tenant.coupons.push(req.body);
    await tenant.save();
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tenant/:id/coupons/:couponId — Delete coupon
router.delete('/:id/coupons/:couponId', auth, async (req, res) => {
  try {
    const tenant = await Tenant.findOne({ _id: req.params.id, userId: req.user.id });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found.' });
    tenant.coupons.pull(req.params.couponId);
    await tenant.save();
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/tenant/:id — Delete a tenant (website)
router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await Tenant.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ message: 'Tenant not found.' });
    res.json({ message: 'Website deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT /api/tenant/:id/orders/:orderId/status — Admin route to update order status
router.put('/:id/orders/:orderId/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const tenant = await Tenant.findOne({ _id: req.params.id, userId: req.user.id });
    if (!tenant) return res.status(404).json({ message: 'Tenant not found.' });
    
    const order = tenant.orders.id(req.params.orderId);
    if (!order) return res.status(404).json({ message: 'Order not found.' });

    order.status = status;
    await tenant.save();
    res.json(tenant);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/tenant/slug/:slug/slots — Public route to check slot availability
router.get('/slug/:slug/slots', async (req, res) => {
  try {
    const { serviceTitle, date } = req.query;
    if (!serviceTitle || !date) return res.status(400).json({ message: 'serviceTitle and date are required.' });

    const tenant = await Tenant.findOne({ businessSlug: req.params.slug });
    if (!tenant) return res.status(404).json({ message: 'Business not found.' });

    const item = tenant.items.find(i => i.title === serviceTitle);
    if (!item) return res.status(404).json({ message: 'Service not found.' });

    const schedule = item.schedule;
    if (!schedule || !schedule.workingDays || schedule.workingDays.length === 0) {
      return res.json({ slots: [], message: 'No schedule configured for this service.' });
    }

    // Check if the requested date falls on a working day
    const requestedDay = new Date(date).getDay(); // 0=Sun, 1=Mon, ...
    if (!schedule.workingDays.includes(requestedDay)) {
      return res.json({ slots: [], message: 'This day is not a working day.' });
    }

    // Generate time slots from startTime to endTime using slotDuration
    const [startH, startM] = schedule.startTime.split(':').map(Number);
    const [endH, endM] = schedule.endTime.split(':').map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    const duration = schedule.slotDuration || 60;
    const maxPerSlot = schedule.maxBookingsPerSlot || 1;

    const allSlots = [];
    for (let t = startMinutes; t + duration <= endMinutes; t += duration) {
      const hh = String(Math.floor(t / 60)).padStart(2, '0');
      const mm = String(t % 60).padStart(2, '0');
      allSlots.push(`${hh}:${mm}`);
    }

    // Count existing bookings for this service on this date
    const bookingCounts = {};
    for (const order of tenant.orders) {
      if (order.status === 'Cancelled') continue;
      for (const oi of order.items) {
        if (oi.title === serviceTitle && oi.bookingDate === date) {
          bookingCounts[oi.bookingTime] = (bookingCounts[oi.bookingTime] || 0) + 1;
        }
      }
    }

    const now = new Date();
    const todayStr = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const slots = allSlots.map(time => {
      const [h, m] = time.split(':').map(Number);
      const slotMinutes = h * 60 + m;
      
      const isPastDate = date < todayStr;
      const isPastTimeToday = date === todayStr && slotMinutes <= currentMinutes;
      const isAvailable = !isPastDate && !isPastTimeToday && (bookingCounts[time] || 0) < maxPerSlot;

      return {
        time,
        booked: bookingCounts[time] || 0,
        max: maxPerSlot,
        available: isAvailable
      };
    });

    res.json({ slots });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
