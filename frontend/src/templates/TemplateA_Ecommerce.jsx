import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, X, CheckCircle2, MapPin, Mail, CreditCard, Wallet, FileText, Clock } from 'lucide-react';
import client from '../api/client';

export default function TemplateA_Ecommerce({ data, isPreview = false }) {
  const { 
    businessName, businessSlug, heroHeadline, aboutText, primaryColor, 
    backgroundImageUrl, supportEmail, location, items = [],
    fontFamily = 'sans', buttonShape = 'rounded', colorMode = 'light'
  } = data;
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isOrdersOpen, setIsOrdersOpen] = useState(false);
  
  // Load past orders from localStorage for this specific business
  const [myOrders, setMyOrders] = useState(() => {
    try {
      const saved = localStorage.getItem(`orders_${businessSlug}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Checkout Form State
  const [checkoutForm, setCheckoutForm] = useState({ name: '', phone: '', address: '', paymentMethod: 'Cash on Delivery' });
  const [orderStatus, setOrderStatus] = useState('idle'); // idle, loading, success, error
  const [lastOrderDetails, setLastOrderDetails] = useState(null);
  
  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  const btnClass = buttonShape === 'pill' ? 'rounded-full' : buttonShape === 'square' ? 'rounded-none' : 'rounded-xl';
  const themeClass = colorMode === 'dark' ? 'dark bg-slate-900 text-white' : 'bg-slate-50 text-slate-900';

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      if (existing) {
        return prev.map((c) =>
          c._id === item._id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((c) => (c._id === id ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0)
    );
  };

  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discountAmount = appliedCoupon ? (subtotal * (appliedCoupon.discountPercentage / 100)) : 0;
  const totalPrice = subtotal - discountAmount;

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

  const handleCheckoutSubmit = async (e) => {
    e.preventDefault();
    setOrderStatus('loading');
    try {
      const { data } = await client.post(`/tenant/slug/${businessSlug}/orders`, {
        customerName: checkoutForm.name,
        customerPhone: checkoutForm.phone,
        address: checkoutForm.address,
        paymentMethod: checkoutForm.paymentMethod,
        items: cart.map(c => ({ title: c.title, price: c.price, qty: c.qty })),
        totalPrice,
        couponCode: appliedCoupon ? appliedCoupon.code : '',
        discountApplied: discountAmount
      });
      const newOrder = {
        id: data.orderId || Math.random().toString(36).substr(2, 9).toUpperCase(),
        date: new Date().toISOString(),
        totalPrice,
        items: cart.map(c => ({ title: c.title, qty: c.qty, price: c.price })),
        paymentMethod: checkoutForm.paymentMethod,
        status: 'Pending'
      };
      
      const updatedOrders = [newOrder, ...myOrders];
      setMyOrders(updatedOrders);
      localStorage.setItem(`orders_${businessSlug}`, JSON.stringify(updatedOrders));
      setLastOrderDetails(newOrder);

      setOrderStatus('success');
      setCart([]);
    } catch (err) {
      console.error(err);
      setOrderStatus('error');
    }
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await client.put(`/tenant/slug/${businessSlug}/orders/${orderId}/cancel`);
      // Update local state
      const updatedOrders = myOrders.map(o => 
        o.id === orderId ? { ...o, status: 'Cancelled' } : o
      );
      setMyOrders(updatedOrders);
      localStorage.setItem(`orders_${businessSlug}`, JSON.stringify(updatedOrders));
    } catch (err) {
      console.error('Failed to cancel order', err);
      alert(err.response?.data?.message || 'Failed to cancel order.');
    }
  };

  return (
    <div className={`min-h-screen font-${fontFamily} relative pb-24 ${themeClass}`}>
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="font-display font-bold text-2xl text-slate-900 dark:text-white">{businessName}</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsOrdersOpen(true)}
              className="p-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-2 font-medium"
            >
              <FileText size={20} />
              <span className="hidden sm:inline">My Orders</span>
            </button>
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span
                  className="absolute top-0 right-0 w-5 h-5 flex items-center justify-center text-[10px] font-bold text-white rounded-full border-2 border-white dark:border-slate-900"
                  style={{ backgroundColor: primaryColor }}
                >
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative py-24 px-6 text-center overflow-hidden bg-slate-900 text-white">
        {backgroundImageUrl ? (
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          />
        ) : (
          <div 
            className="absolute inset-0 opacity-20 pointer-events-none bg-dot-pattern"
            style={{ backgroundColor: primaryColor }} 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent opacity-80"></div>
        <div className="relative z-10 max-w-3xl mx-auto drop-shadow-lg bg-black/40 backdrop-blur-md rounded-3xl p-8 border border-white/10">
          <h2 className="font-display text-5xl md:text-6xl font-extrabold tracking-tight mb-6 text-white">
            {heroHeadline || `Welcome to ${businessName}`}
          </h2>
          <p className="text-lg md:text-xl text-white/90 leading-relaxed mb-8">
            {aboutText}
          </p>
          <a
            href="#catalog"
            className={`inline-flex px-8 py-4 ${btnClass} text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5`}
            style={{ backgroundColor: primaryColor }}
          >
            Shop Now
          </a>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-center justify-between mb-10">
          <h3 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Our Catalog</h3>
          <span className="text-slate-500 dark:text-slate-400">{items.length} items</span>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <p className="text-slate-500 dark:text-slate-400">No products available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => {
              const cartItem = cart.find((c) => c._id === item._id);
              const isOutOfStock = item.stockCount !== null && item.stockCount <= 0;
              const hasLowStock = item.stockCount !== null && item.stockCount > 0 && item.stockCount <= 5;
              const currentQty = cartItem ? cartItem.qty : 0;
              const canAddMore = item.stockCount === null || currentQty < item.stockCount;

              return (
                <div key={item._id} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm hover:shadow-md transition-shadow group flex flex-col relative">
                  {item.stockCount !== null && (
                    <div className="absolute top-2 right-2 z-10">
                      {isOutOfStock ? (
                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Out of Stock</span>
                      ) : hasLowStock ? (
                        <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">Only {item.stockCount} left</span>
                      ) : null}
                    </div>
                  )}
                  {item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-48 object-cover bg-slate-100 group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-48 bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-500">
                      No Image
                    </div>
                  )}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex justify-between items-start gap-4 mb-2">
                      <h4 className="font-bold text-lg text-slate-900 dark:text-white">{item.title}</h4>
                      <span className="font-bold text-lg whitespace-nowrap" style={{ color: primaryColor }}>
                        ₹{item.price}{item.priceUnit ? <span className="text-sm font-normal text-slate-500 ml-1">{item.priceUnit}</span> : ''}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mb-6 flex-1 line-clamp-3">{item.description}</p>
                    
                    {cartItem ? (
                      <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-700 rounded-xl p-1 border border-slate-200 dark:border-slate-600">
                        <button
                          onClick={() => updateQty(item._id, -1)}
                          className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-colors shadow-sm"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="font-bold text-slate-900 dark:text-white">{cartItem.qty}</span>
                        <button
                          onClick={() => updateQty(item._id, 1)}
                          disabled={!canAddMore}
                          className="w-10 h-10 flex items-center justify-center text-white rounded-lg transition-colors shadow-sm disabled:opacity-50"
                          style={{ backgroundColor: primaryColor }}
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(item)}
                        disabled={isOutOfStock}
                        className={`w-full py-3 ${btnClass} font-semibold text-white transition-opacity hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                        style={{ backgroundColor: primaryColor }}
                      >
                        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Floating Checkout Button */}
      {totalItems > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-30 px-6 pointer-events-none flex justify-center">
          <button
            onClick={() => setIsCartOpen(true)}
            className="pointer-events-auto flex items-center gap-4 px-6 py-4 rounded-full text-white shadow-2xl hover:scale-105 transition-transform animate-slide-up"
            style={{ backgroundColor: primaryColor }}
          >
            <span className="flex items-center gap-2 font-bold bg-white/20 px-3 py-1 rounded-full">
              <ShoppingCart size={18} /> {totalItems}
            </span>
            <span className="font-semibold">View Order — ₹{totalPrice}</span>
          </button>
        </div>
      )}

      {/* Cart Sidebar / Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsCartOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2">
                <ShoppingCart size={20} /> Your Cart
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="text-slate-400 hover:text-slate-600 p-2">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="text-center text-slate-500 py-10">Your cart is empty.</div>
              ) : (
                cart.map(item => (
                  <div key={item._id} className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.imageUrl && <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-900 text-sm leading-tight mb-1">{item.title}</h4>
                      <div className="text-sm font-semibold" style={{ color: primaryColor }}>₹{item.price}</div>
                      
                      <div className="flex items-center gap-3 mt-3">
                        <button onClick={() => updateQty(item._id, -1)} className="w-7 h-7 rounded-md bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200">
                          <Minus size={14} />
                        </button>
                        <span className="font-bold text-sm text-slate-900 w-4 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item._id, 1)} className="w-7 h-7 rounded-md text-white flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="font-bold text-slate-900 text-sm">
                      ₹{item.price * item.qty}
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-slate-500">Subtotal</span>
                  <span className="font-bold text-lg text-slate-700">₹{subtotal}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between items-center mb-2 text-emerald-600">
                    <span className="font-semibold text-sm">Discount ({appliedCoupon.code})</span>
                    <span className="font-bold text-sm">-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center mb-6 pt-2 border-t border-slate-200">
                  <span className="font-semibold text-slate-600">Total</span>
                  <span className="font-bold text-2xl text-slate-900">₹{totalPrice.toFixed(2)}</span>
                </div>
                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className={`w-full py-4 ${btnClass} text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5`}
                  style={{ backgroundColor: primaryColor }}
                >
                  Proceed to Checkout
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => orderStatus !== 'loading' && setIsCheckoutOpen(false)} />
          <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-slide-up flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="font-bold text-xl text-slate-900">Checkout</h2>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            
            {orderStatus === 'success' && lastOrderDetails ? (
              <div className="p-10 text-center flex flex-col items-center">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} className="text-emerald-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Order Placed!</h3>
                <p className="text-slate-600 mb-6">Thank you for your order. We will process it shortly.</p>
                
                <div className="bg-slate-50 w-full rounded-2xl p-6 border border-slate-100 mb-8 text-left">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-semibold text-slate-500">Order ID</span>
                    <span className="font-bold text-slate-900">#{lastOrderDetails.id}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-semibold text-slate-500">Amount to Pay</span>
                    <span className="font-bold text-slate-900" style={{ color: primaryColor }}>₹{lastOrderDetails.totalPrice}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-500">Payment</span>
                    <span className="font-bold text-slate-900">{lastOrderDetails.paymentMethod}</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setIsCartOpen(false);
                    setOrderStatus('idle');
                    setIsOrdersOpen(true);
                  }}
                  className="w-full py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all"
                  style={{ backgroundColor: primaryColor }}
                >
                  View Order History
                </button>
              </div>
            ) : (
              <div className="p-6 overflow-y-auto">
                <div className="mb-6 bg-slate-50 rounded-xl p-4 border border-slate-100 flex justify-between items-center">
                  <span className="font-semibold text-slate-600">Amount to Pay</span>
                  <span className="font-bold text-2xl" style={{ color: primaryColor }}>₹{totalPrice.toFixed(2)}</span>
                </div>

                {!appliedCoupon ? (
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Have a discount code?</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-4 py-2 text-slate-900 uppercase focus:ring-2 focus:outline-none" 
                        placeholder="ENTER CODE" 
                        value={couponCode} 
                        onChange={e => setCouponCode(e.target.value.toUpperCase())} 
                      />
                      <button 
                        type="button" 
                        onClick={handleApplyCoupon} 
                        className="px-4 py-2 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-700 transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}
                  </div>
                ) : (
                  <div className="mb-6 bg-emerald-50 border border-emerald-100 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-emerald-700 font-bold text-sm">Coupon {appliedCoupon.code} applied! (-{appliedCoupon.discountPercentage}%)</span>
                    <button type="button" onClick={() => setAppliedCoupon(null)} className="text-emerald-700 hover:text-emerald-900"><X size={16}/></button>
                  </div>
                )}

                <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                    <input required className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:outline-none" value={checkoutForm.name} onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})} placeholder="John Doe" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input required type="tel" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:outline-none" value={checkoutForm.phone} onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})} placeholder="+91 9876543210" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Delivery Address</label>
                    <textarea required rows={2} className="w-full bg-white border border-slate-200 rounded-lg px-4 py-3 text-slate-900 focus:ring-2 focus:outline-none resize-none" value={checkoutForm.address} onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})} placeholder="123 Street Name, City, Pincode" />
                  </div>
                  
                  <div className="pt-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        type="button" 
                        onClick={() => setCheckoutForm({...checkoutForm, paymentMethod: 'Cash on Delivery'})}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${checkoutForm.paymentMethod === 'Cash on Delivery' ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                      >
                        <Wallet size={24} className="mb-2 text-slate-700" />
                        <span className="text-sm font-semibold text-slate-900">Cash on Delivery</span>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => setCheckoutForm({...checkoutForm, paymentMethod: 'UPI on Delivery'})}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${checkoutForm.paymentMethod === 'UPI on Delivery' ? 'border-primary-500 bg-primary-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                      >
                        <CreditCard size={24} className="mb-2 text-slate-700" />
                        <span className="text-sm font-semibold text-slate-900">UPI on Delivery</span>
                      </button>
                    </div>
                  </div>

                  {orderStatus === 'error' && <p className="text-red-500 text-sm font-semibold mt-2">Failed to place order. Please try again.</p>}

                  <button
                    type="submit"
                    disabled={orderStatus === 'loading'}
                    className={`w-full mt-6 py-4 ${btnClass} text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-70 flex justify-center items-center`}
                    style={{ backgroundColor: primaryColor }}
                  >
                    {orderStatus === 'loading' ? <span className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : 'Place Order'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order History Sidebar / Modal */}
      {isOrdersOpen && (
        <div className="fixed inset-0 z-[70] flex justify-end">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsOrdersOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-fade-in">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="font-display font-bold text-xl text-slate-900 flex items-center gap-2">
                <FileText size={20} /> My Orders
              </h2>
              <button onClick={() => setIsOrdersOpen(false)} className="text-slate-400 hover:text-slate-600 p-2">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {myOrders.length === 0 ? (
                <div className="text-center text-slate-500 py-20">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={32} className="text-slate-300" />
                  </div>
                  <p className="font-semibold text-slate-700 mb-1">No orders yet</p>
                  <p className="text-sm">When you place an order, it will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {myOrders.map((order) => (
                    <div key={order.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Order #{order.id}</p>
                          <div className="flex items-center gap-1 text-slate-400 text-xs">
                            <Clock size={12} />
                            {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                        <div className="font-bold text-lg" style={{ color: primaryColor }}>
                          ₹{order.totalPrice}
                        </div>
                      </div>
                      
                      <ul className="space-y-2 mb-4">
                        {order.items.map((item, idx) => (
                          <li key={idx} className="flex justify-between items-center text-sm text-slate-700">
                            <span><span className="font-bold text-slate-900">{item.qty}x</span> {item.title}</span>
                            <span className="text-slate-500">₹{item.price * item.qty}</span>
                          </li>
                        ))}
                      </ul>
                      
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex gap-2">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg inline-block ${
                            order.status === 'Cancelled' ? 'bg-red-50 text-red-700' :
                            order.status === 'Delivered' ? 'bg-green-50 text-green-700' :
                            'bg-emerald-50 text-emerald-700'
                          }`}>
                            {order.status || 'Processing'}
                          </span>
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg inline-block">{order.paymentMethod}</span>
                        </div>
                        
                        {(order.status === 'Pending' || order.status === 'Processing' || !order.status) && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors"
                          >
                            Cancel Order
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {myOrders.length > 0 && (
              <div className="p-6 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => setIsOrdersOpen(false)}
                  className="w-full py-3 rounded-xl bg-white border-2 border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      {(supportEmail || location) && (
        <footer className="bg-slate-900 text-slate-400 py-12 px-6 border-t border-slate-800">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-white font-display font-bold text-xl mb-2">{businessName}</h3>
              <p className="text-sm">Thank you for shopping with us.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-6">
              {supportEmail && (
                <a href={`mailto:${supportEmail}`} className="flex items-center gap-2 hover:text-white transition-colors">
                  <Mail size={18} /> {supportEmail}
                </a>
              )}
              {location && (
                <div className="flex items-center gap-2">
                  <MapPin size={18} /> {location}
                </div>
              )}
            </div>
          </div>
        </footer>
      )}    </div>
  );
}
