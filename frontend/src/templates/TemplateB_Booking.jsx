import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, CheckCircle2, User, Mail, Tag, X } from 'lucide-react';
import client from '../api/client';

export default function TemplateB_Booking({ data, isPreview = false }) {
  const { 
    businessName, businessSlug, heroHeadline, aboutText, primaryColor, backgroundImageUrl, supportEmail, location, items = [],
    fontFamily = 'sans', buttonShape = 'rounded', colorMode = 'light', workingHours
  } = data;
  
  const [formStatus, setFormStatus] = useState('idle'); // idle, loading, success, error
  const [bookingForm, setBookingForm] = useState({ name: '', email: '', phone: '', datetime: '', date: '', time: '', serviceTitle: '' });
  
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const btnClass = buttonShape === 'pill' ? 'rounded-full' : buttonShape === 'square' ? 'rounded-none' : 'rounded-xl';
  const themeClass = colorMode === 'dark' ? 'dark bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800';

  const selectedItemData = items.find(i => i.title === bookingForm.serviceTitle);
  const isService = selectedItemData?.itemType === 'service' && selectedItemData?.schedule?.workingDays?.length > 0;

  useEffect(() => {
    if (isService && bookingForm.date) {
      // Check if selected date is a working day
      const dayOfWeek = new Date(bookingForm.date).getDay();
      if (!selectedItemData.schedule.workingDays.includes(dayOfWeek)) {
        setAvailableSlots([]);
        return;
      }

      const fetchSlots = async () => {
        if (isPreview) return;
        setSlotsLoading(true);
        try {
          const res = await client.get(`/tenant/slug/${businessSlug}/slots?serviceTitle=${encodeURIComponent(bookingForm.serviceTitle)}&date=${bookingForm.date}`);
          setAvailableSlots(res.data.slots || []);
        } catch (err) {
          console.error(err);
        } finally {
          setSlotsLoading(false);
        }
      };
      fetchSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [bookingForm.serviceTitle, bookingForm.date, businessSlug, isPreview, isService, selectedItemData]);

  // Reset date/time when service changes
  useEffect(() => {
    setBookingForm(prev => ({ ...prev, date: '', time: '', datetime: '' }));
  }, [bookingForm.serviceTitle]);

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setCouponError('');
    if (isPreview) {
      setCouponError('Coupons cannot be validated in preview mode.');
      return;
    }
    try {
      const { data } = await client.post(`/tenant/slug/${businessSlug}/validate-coupon`, { code: couponCode });
      setAppliedCoupon({ code: couponCode, discountPercentage: data.discountPercentage });
    } catch (err) {
      setCouponError(err.response?.data?.message || 'Invalid coupon code');
      setAppliedCoupon(null);
    }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (isPreview) return;
    setFormStatus('loading');
    
    try {
      const selectedItem = items.find(i => i.title === bookingForm.serviceTitle);
      
      let datePart = '';
      let timePart = '';
      
      if (isService) {
        if (!bookingForm.date || !bookingForm.time) {
          alert('Please select a valid date and time slot.');
          setFormStatus('idle');
          return;
        }
        datePart = bookingForm.date;
        timePart = bookingForm.time;
      } else {
        [datePart, timePart] = bookingForm.datetime.split('T');
      }

      const basePrice = selectedItem.price;
      const discountAmount = appliedCoupon ? (basePrice * (appliedCoupon.discountPercentage / 100)) : 0;
      const finalPrice = basePrice - discountAmount;

      await client.post(`/tenant/slug/${businessSlug}/orders`, {
        customerName: bookingForm.name,
        customerPhone: bookingForm.phone,
        customerEmail: bookingForm.email,
        address: 'In-Store Appointment',
        paymentMethod: 'Pay at Venue',
        items: [{ 
          title: selectedItem.title, 
          price: selectedItem.price, 
          qty: 1, 
          bookingDate: datePart, 
          bookingTime: timePart 
        }],
        totalPrice: finalPrice,
        couponCode: appliedCoupon ? appliedCoupon.code : '',
        discountApplied: discountAmount,
      });
      setFormStatus('success');
    } catch (err) {
      console.error(err);
      setFormStatus('error');
    }
  };

  // Convert hex to rgb for rgba usage (simplistic fallback)
  const hexToRGB = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return `${r}, ${g}, ${b}`;
  };

  return (
    <div className={`min-h-screen font-${fontFamily} ${themeClass}`}>
      {/* Header */}
      <header className="absolute top-0 w-full z-10 px-6 py-6 md:px-12 flex justify-between items-center">
        <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">{businessName}</h1>
        <a 
          href="#booking" 
          className={`px-6 py-2.5 ${btnClass} text-white font-semibold text-sm transition-opacity hover:opacity-90 shadow-lg shadow-black/10`}
          style={{ backgroundColor: primaryColor }}
        >
          Book Now
        </a>
      </header>

      {/* Hero (Split Screen) */}
      <section className="flex flex-col md:flex-row min-h-[90vh]">
        <div className="flex-1 flex flex-col justify-center px-6 py-24 md:px-16 lg:px-24 bg-white dark:bg-slate-900 relative z-0">
          <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundColor: primaryColor }} />
          <div className="relative z-10">
            <span 
              className={`inline-block px-4 py-1.5 ${btnClass} text-sm font-semibold mb-6 tracking-wide uppercase`}
              style={{ color: primaryColor, backgroundColor: `rgba(${hexToRGB(primaryColor)}, 0.1)` }}
            >
              Premium Services
            </span>
            <h2 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] text-slate-900 dark:text-white mb-6">
              {heroHeadline || 'Experience Excellence'}
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-300 mb-10 leading-relaxed max-w-lg">
              {aboutText}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="#booking" 
                className={`inline-flex justify-center px-8 py-4 ${btnClass} text-white font-bold transition-transform hover:-translate-y-1 shadow-xl`}
                style={{ backgroundColor: primaryColor, boxShadow: `0 20px 25px -5px rgba(${hexToRGB(primaryColor)}, 0.3)` }}
              >
                Book Appointment
              </a>
              <a 
                href="#services" 
                className={`inline-flex justify-center px-8 py-4 ${btnClass} font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors`}
              >
                View Services
              </a>
            </div>
          </div>
        </div>
        
        {/* Right side - Abstract colored block or image */}
        <div className="hidden md:flex flex-1 relative items-center justify-center overflow-hidden">
          {backgroundImageUrl ? (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${backgroundImageUrl})` }}
            />
          ) : (
            <div className="absolute inset-0" style={{ backgroundColor: primaryColor }} />
          )}
          <div className="absolute inset-0 bg-slate-900/30"></div>
          {/* Decorative elements */}
          <div className="absolute w-[150%] h-[150%] rounded-full bg-white/10 blur-3xl -top-1/4 -right-1/4 animate-pulse-soft" />
          <div className="absolute w-[100%] h-[100%] rounded-full bg-black/10 blur-2xl bottom-0 left-0" />
          
          <div className="relative z-10 bg-white/10 backdrop-blur-xl border border-white/20 p-10 rounded-3xl text-white shadow-2xl text-center">
            <div className="w-20 h-20 bg-white/20 rounded-2xl mx-auto flex items-center justify-center mb-6 backdrop-blur-md">
              <Calendar size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-display font-bold mb-2">Professional Care</h3>
            <p className="text-white/80 max-w-xs">Dedicated to providing you with the highest quality service.</p>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section id="services" className="py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl font-bold text-slate-900 dark:text-white mb-4">Our Services</h2>
          <p className="text-slate-600 dark:text-slate-400">Choose from our range of premium offerings.</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400">Service menu coming soon.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            {items.map((item, index) => (
              <div 
                key={item._id} 
                className={`p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors ${
                  index !== items.length - 1 ? 'border-b border-slate-100 dark:border-slate-700' : ''
                }`}
              >
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{item.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{item.description}</p>
                </div>
                <div className="flex items-center gap-6 md:flex-col md:items-end md:gap-2">
                  <span className="text-2xl font-bold whitespace-nowrap" style={{ color: primaryColor }}>
                    ₹{item.price}{item.priceUnit ? <span className="text-base font-normal text-slate-500 ml-1">{item.priceUnit}</span> : ''}
                  </span>
                  <a 
                    href="#booking" 
                    className={`px-4 py-2 ${btnClass} font-semibold text-sm border-2 transition-colors whitespace-nowrap`}
                    style={{ borderColor: primaryColor, color: primaryColor }}
                  >
                    Select
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Booking Form CTA */}
      <section id="booking" className="py-24 px-6 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at top right, ${primaryColor}, transparent 50%)` }} />
        
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-16 items-center relative z-10">
          <div className="flex-1 text-center lg:text-left">
            <h2 className="font-display text-4xl md:text-5xl font-bold mb-6">Ready to Book?</h2>
            <p className="text-slate-400 text-lg mb-10 max-w-lg mx-auto lg:mx-0">
              Schedule your appointment today. Fill out the form and our team will confirm your slot shortly.
            </p>
            
            <div className="space-y-6 max-w-sm mx-auto lg:mx-0 text-left">
              <div className="flex items-center gap-4 text-slate-300">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <Clock size={20} style={{ color: primaryColor }} />
                </div>
                <div>
                  <p className="font-semibold text-white">Opening Hours</p>
                  <p className="text-sm">
                    {workingHours ? `${workingHours.start} - ${workingHours.end}` : 'Mon-Sat: 9:00 AM - 8:00 PM'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-slate-300">
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <MapPin size={20} style={{ color: primaryColor }} />
                </div>
                <div>
                  <p className="font-semibold text-white">Location</p>
                  <p className="text-sm">{location || '123 Business Avenue, City'}</p>
                </div>
              </div>
              
              {supportEmail && (
                <div className="flex items-center gap-4 text-slate-300 mt-6">
                  <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                    <Mail size={20} style={{ color: primaryColor }} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">Email Us</p>
                    <p className="text-sm">{supportEmail}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl text-slate-800">
            {formStatus === 'success' ? (
              <div className="text-center py-12 animate-fade-in">
                <div className="w-20 h-20 rounded-full mx-auto flex items-center justify-center mb-6" style={{ backgroundColor: `rgba(${hexToRGB(primaryColor)}, 0.1)` }}>
                  <CheckCircle2 size={40} style={{ color: primaryColor }} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Request Sent!</h3>
                <p className="text-slate-600 mb-6">We've received your booking request and will contact you shortly to confirm.</p>
                
                {/* Booking Summary */}
                {bookingForm.serviceTitle && (
                  <div className="bg-slate-50 rounded-2xl p-5 text-left border border-slate-200 mb-6">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Booking Summary</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Service</span>
                        <span className="font-semibold text-slate-900">{bookingForm.serviceTitle}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-500">Date</span>
                        <span className="font-semibold text-slate-900">{isService ? bookingForm.date : bookingForm.datetime.split('T')[0]}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Time Slot</span>
                        <span className="font-semibold text-slate-900">{isService ? bookingForm.time : bookingForm.datetime.split('T')[1]}</span>
                      </div>
                      
                      {(() => {
                        const svc = items.find(i => i.title === bookingForm.serviceTitle);
                        if (!svc) return null;
                        const basePrice = svc.price;
                        const discount = appliedCoupon ? (basePrice * (appliedCoupon.discountPercentage / 100)) : 0;
                        const finalPrice = basePrice - discount;
                        return (
                          <>
                            <div className="flex justify-between pt-2 border-t border-slate-200 mt-2">
                              <span className="text-slate-500">Service Price</span>
                              <span className="font-semibold text-slate-700">₹{basePrice}</span>
                            </div>
                            {appliedCoupon && (
                              <div className="flex justify-between text-emerald-600">
                                <span>Discount ({appliedCoupon.code})</span>
                                <span className="font-bold">-₹{discount.toFixed(2)}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-slate-500 font-semibold">Total Paid</span>
                              <span className="font-bold" style={{ color: primaryColor }}>₹{finalPrice.toFixed(2)}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                <button 
                  onClick={() => {
                    setFormStatus('idle');
                    setBookingForm({ name: '', email: '', phone: '', datetime: '', date: '', time: '', serviceTitle: '' });
                    setAppliedCoupon(null);
                    setCouponCode('');
                    setCouponError('');
                  }}
                  className="mt-2 font-semibold hover:underline"
                  style={{ color: primaryColor }}
                >
                  Book another slot
                </button>
              </div>
            ) : (
              <form onSubmit={handleBook} className="space-y-5">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Request an Appointment</h3>
                
                {formStatus === 'error' && <p className="text-red-500 text-sm font-bold bg-red-50 p-3 rounded-lg border border-red-100">An error occurred. Please try again.</p>}

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Service</label>
                  <select required className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 transition-all" style={{ '--tw-ring-color': primaryColor }} value={bookingForm.serviceTitle} onChange={e => setBookingForm({...bookingForm, serviceTitle: e.target.value})}>
                    <option value="">Select a service...</option>
                    {items.map(item => (
                      <option key={item._id} value={item.title}>{item.title} - ₹{item.price}{item.priceUnit ? ` ${item.priceUnit}` : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input required type="text" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 transition-all" style={{ '--tw-ring-color': primaryColor }} placeholder="John Doe" value={bookingForm.name} onChange={e => setBookingForm({...bookingForm, name: e.target.value})} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Phone Number</label>
                  <input required type="tel" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 transition-all" style={{ '--tw-ring-color': primaryColor }} placeholder="+91 9876543210" value={bookingForm.phone} onChange={e => setBookingForm({...bookingForm, phone: e.target.value})} />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address (Optional)</label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="email" className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 transition-all" style={{ '--tw-ring-color': primaryColor }} placeholder="john@example.com" value={bookingForm.email} onChange={e => setBookingForm({...bookingForm, email: e.target.value})} />
                  </div>
                </div>
                
                {isService ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
                      <input 
                        required 
                        type="date" 
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 transition-all" 
                        style={{ '--tw-ring-color': primaryColor }} 
                        value={bookingForm.date} 
                        onChange={e => {
                          const dateObj = new Date(e.target.value);
                          if (!selectedItemData.schedule.workingDays.includes(dateObj.getDay())) {
                            alert("This service is not available on the selected day. Please pick a valid working day.");
                            return;
                          }
                          setBookingForm({...bookingForm, date: e.target.value, time: ''});
                        }} 
                      />
                    </div>
                    
                    {bookingForm.date && (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Time Slot</label>
                        {slotsLoading ? (
                          <div className="p-4 text-center text-slate-500 text-sm">Loading slots...</div>
                        ) : availableSlots.length === 0 ? (
                          <div className="p-4 text-center text-slate-500 text-sm">No available slots for this date.</div>
                        ) : (
                          <div className="grid grid-cols-3 gap-2 mt-2 max-h-48 overflow-y-auto pr-2 pb-2">
                            {availableSlots.map(slot => (
                              <button
                                key={slot.time}
                                type="button"
                                disabled={!slot.available}
                                onClick={() => setBookingForm({...bookingForm, time: slot.time})}
                                className={`py-2 text-sm font-semibold rounded-lg border transition-all ${
                                  !slot.available ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed opacity-60' 
                                  : bookingForm.time === slot.time ? 'border-transparent text-white shadow-md' 
                                  : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                                }`}
                                style={bookingForm.time === slot.time ? { backgroundColor: primaryColor } : {}}
                              >
                                {slot.time}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date & Time</label>
                    <div className="relative">
                      <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input required type="datetime-local" min={new Date().toISOString().slice(0, 16)} className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 transition-all" style={{ '--tw-ring-color': primaryColor }} value={bookingForm.datetime} onChange={e => setBookingForm({...bookingForm, datetime: e.target.value})} />
                    </div>
                  </div>
                )}

                {/* Promo Code Section */}
                {selectedItemData && (
                  <div className="pt-2">
                    {!appliedCoupon ? (
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-1.5">
                          <Tag size={14} className="text-slate-400" />
                          Promo Code (Optional)
                        </label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 transition-all text-sm uppercase" 
                            style={{ '--tw-ring-color': primaryColor }} 
                            placeholder="ENTER CODE" 
                            value={couponCode} 
                            onChange={e => setCouponCode(e.target.value.toUpperCase())} 
                          />
                          <button 
                            type="button" 
                            onClick={handleApplyCoupon} 
                            className={`px-5 py-2.5 ${btnClass} text-white font-bold text-sm transition-opacity hover:opacity-90`}
                            style={{ backgroundColor: primaryColor }}
                          >
                            Apply
                          </button>
                        </div>
                        {couponError && <p className="text-red-500 text-xs mt-1.5 font-medium">{couponError}</p>}
                      </div>
                    ) : (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                        <span className="text-emerald-700 font-bold text-sm flex items-center gap-1.5">
                          <CheckCircle2 size={16} />
                          {appliedCoupon.code} applied! (-{appliedCoupon.discountPercentage}%)
                        </span>
                        <button type="button" onClick={() => { setAppliedCoupon(null); setCouponCode(''); }} className="text-emerald-600 hover:text-emerald-800 transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    )}

                    {/* Price Summary */}
                    <div className="mt-3 bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Service Price</span>
                        <span className="font-semibold text-slate-900">₹{selectedItemData.price}{selectedItemData.priceUnit ? ` ${selectedItemData.priceUnit}` : ''}</span>
                      </div>
                      {appliedCoupon && (
                        <div className="flex justify-between text-emerald-600">
                          <span className="font-medium">Discount ({appliedCoupon.discountPercentage}%)</span>
                          <span className="font-bold">-₹{(selectedItemData.price * (appliedCoupon.discountPercentage / 100)).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between pt-2 border-t border-slate-200">
                        <span className="font-semibold text-slate-700">Total</span>
                        <span className="font-bold text-lg" style={{ color: primaryColor }}>
                          ₹{appliedCoupon 
                            ? (selectedItemData.price - (selectedItemData.price * (appliedCoupon.discountPercentage / 100))).toFixed(2) 
                            : selectedItemData.price}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={formStatus === 'loading' || isPreview || (isService && (!bookingForm.date || !bookingForm.time))}
                  className={`w-full py-4 ${btnClass} text-white font-bold transition-all hover:opacity-90 flex items-center justify-center gap-2 mt-4 shadow-lg disabled:opacity-50`}
                  style={{ backgroundColor: primaryColor }}
                >
                  {formStatus === 'loading' ? (
                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : 'Submit Request'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-500 dark:text-slate-400 text-sm border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
        © {new Date().getFullYear()} {businessName}. Powered by BizWiz.
      </footer>
    </div>
  );
}
