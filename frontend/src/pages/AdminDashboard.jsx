import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Settings, LogOut, Plus, Pencil, Trash2, ExternalLink, Globe, AlertCircle, ShoppingCart, CheckCircle2, TrendingUp, Tag, Download, RefreshCcw, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import ThemeToggle from '../components/ThemeToggle';

import TemplateA_Ecommerce from '../templates/TemplateA_Ecommerce';
import TemplateB_Booking from '../templates/TemplateB_Booking';
import TemplateC_Landing from '../templates/TemplateC_Landing';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [tenants, setTenants] = useState([]);
  const [activeTenantId, setActiveTenantId] = useState(null);
  const [activeTab, setActiveTab] = useState('websites'); // websites, dashboard, analytics, items, orders, coupons, settings
  const [loading, setLoading] = useState(true);
  
  // Forms and Modals
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [itemForm, setItemForm] = useState({ title: '', description: '', price: '', imageUrl: '', stockCount: '', itemType: 'product', schedule: { workingDays: [1,2,3,4,5], startTime: '09:00', endTime: '17:00', slotDuration: 60, maxBookingsPerSlot: 1 } });
  const [contentForm, setContentForm] = useState({ 
    aboutText: '', primaryColor: '', fontFamily: '', buttonShape: '', colorMode: '', 
    supportEmail: '', location: '', backgroundImageUrl: '', 
    metaTitle: '', metaDescription: '', faviconUrl: '',
    workingHoursStart: '', workingHoursEnd: ''
  });
  
  const [couponForm, setCouponForm] = useState({ code: '', discountPercentage: '' });
  const [isCouponModalOpen, setIsCouponModalOpen] = useState(false);
  
  // Status
  const [saveStatus, setSaveStatus] = useState('');

  const fetchTenants = async () => {
    try {
      const { data } = await client.get('/tenant/my');
      setTenants(data);
      if (data.length > 0) {
        if (!activeTenantId || !data.find(t => t._id === activeTenantId)) {
          setActiveTenantId(data[0]._id);
        }
      } else {
        setActiveTenantId(null);
      }
    } catch (err) {
      console.error('Failed to fetch tenants:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeTenant = tenants.find(t => t._id === activeTenantId);

  useEffect(() => {
    fetchTenants();
  }, []);

  useEffect(() => {
    if (activeTenant) {
      setContentForm({
        aboutText: activeTenant.aboutText || '',
        primaryColor: activeTenant.primaryColor || '#7c3aed',
        fontFamily: activeTenant.fontFamily || 'sans',
        buttonShape: activeTenant.buttonShape || 'rounded',
        colorMode: activeTenant.colorMode || 'light',
        supportEmail: activeTenant.supportEmail || '',
        location: activeTenant.location || '',
        backgroundImageUrl: activeTenant.backgroundImageUrl || '',
        metaTitle: activeTenant.metaTitle || '',
        metaDescription: activeTenant.metaDescription || '',
        faviconUrl: activeTenant.faviconUrl || '',
        workingHoursStart: activeTenant.workingHours?.start || '09:00',
        workingHoursEnd: activeTenant.workingHours?.end || '17:00'
      });
    }
  }, [activeTenantId, tenants]);

  // -- Handlers --

  const handleUpdateContent = async (e) => {
    e.preventDefault();
    setSaveStatus('saving');
    try {
      const payload = {
        ...contentForm,
        workingHours: { start: contentForm.workingHoursStart, end: contentForm.workingHoursEnd }
      };
      await client.put(`/tenant/${activeTenant._id}`, payload);
      setSaveStatus('saved');
      fetchTenants();
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(''), 3000);
    }
  };

  const openItemModal = (item = null) => {
    if (item) {
      setCurrentItem(item);
      setItemForm({
        title: item.title, description: item.description, price: item.price, imageUrl: item.imageUrl || '',
        stockCount: item.stockCount === null ? '' : item.stockCount,
        itemType: item.itemType || 'product',
        priceUnit: item.priceUnit || '',
        schedule: {
          workingDays: item.schedule?.workingDays || [1,2,3,4,5],
          startTime: item.schedule?.startTime || '09:00',
          endTime: item.schedule?.endTime || '17:00',
          slotDuration: item.schedule?.slotDuration || 60,
          maxBookingsPerSlot: item.schedule?.maxBookingsPerSlot || 1
        }
      });
    } else {
      setCurrentItem(null);
      setItemForm({
        title: '', description: '', price: '', imageUrl: '', stockCount: '',
        itemType: 'product',
        priceUnit: '',
        schedule: { workingDays: [1,2,3,4,5], startTime: '09:00', endTime: '17:00', slotDuration: 60, maxBookingsPerSlot: 1 }
      });
    }
    setIsItemModalOpen(true);
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...itemForm,
        stockCount: itemForm.itemType === 'service' ? null : (itemForm.stockCount === '' ? null : Number(itemForm.stockCount)),
        schedule: itemForm.itemType === 'service' ? itemForm.schedule : undefined
      };
      if (currentItem) {
        await client.put(`/tenant/${activeTenant._id}/items/${currentItem._id}`, payload);
      } else {
        await client.post(`/tenant/${activeTenant._id}/items`, payload);
      }
      setIsItemModalOpen(false);
      fetchTenants();
    } catch (err) {
      alert('Failed to save item. Please try again.');
    }
  };

  const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const toggleWorkingDay = (day) => {
    const days = itemForm.schedule.workingDays;
    const newDays = days.includes(day) ? days.filter(d => d !== day) : [...days, day].sort();
    setItemForm({ ...itemForm, schedule: { ...itemForm.schedule, workingDays: newDays } });
  };

  const handleDeleteItem = async (itemId) => {
    try {
      await client.delete(`/tenant/${activeTenant._id}/items/${itemId}`);
      fetchTenants();
    } catch (err) {
      console.error('Failed to delete item.', err);
    }
  };

  const handleSaveCoupon = async (e) => {
    e.preventDefault();
    try {
      await client.post(`/tenant/${activeTenant._id}/coupons`, couponForm);
      setIsCouponModalOpen(false);
      fetchTenants();
    } catch (err) {
      alert('Failed to save coupon.');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await client.put(`/tenant/${activeTenant._id}/orders/${orderId}/status`, { status: newStatus });
      fetchTenants();
    } catch (err) {
      alert('Failed to update order status.');
    }
  };

  const handleDeleteCoupon = async (couponId) => {
    try {
      await client.delete(`/tenant/${activeTenant._id}/coupons/${couponId}`);
      fetchTenants();
    } catch (err) {
      console.error('Failed to delete coupon.', err);
    }
  };

  const exportOrdersCSV = () => {
    if (!activeTenant?.orders?.length) return;
    const headers = ['Order ID', 'Customer Name', 'Phone', 'Address', 'Items (Qty x Name)', 'Booking Date', 'Booking Time', 'Total Price', 'Coupon Code', 'Status', 'Date'];
    const rows = activeTenant.orders.map(o => {
      const itemsStr = o.items.map(i => `${i.qty}x ${i.title}`).join('; ');
      const bookingDate = o.items[0]?.bookingDate || '';
      const bookingTime = o.items[0]?.bookingTime || '';
      return [
        o._id,
        `"${o.customerName}"`,
        `"${o.customerPhone}"`,
        `"${o.address}"`,
        `"${itemsStr}"`,
        bookingDate,
        bookingTime,
        o.totalPrice,
        o.couponCode || '',
        o.status,
        new Date(o.createdAt).toLocaleDateString()
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeTenant.businessSlug}_orders.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  const handleDeleteSite = async () => {
    if (!window.confirm('Are you ABSOLUTELY sure you want to delete this website? This cannot be undone.')) return;
    try {
      await client.delete(`/tenant/${activeTenant._id}`);
      fetchTenants();
      setActiveTab('websites');
    } catch (err) {
      alert('Failed to delete website.');
    }
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-slate-950 flex items-center justify-center transition-colors">
        <div className="spinner" />
      </div>
    );
  }

  if (!activeTenant && !loading) {
    return (
      <div className="min-h-screen bg-background dark:bg-slate-950 flex flex-col items-center justify-center transition-colors">
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-display font-bold text-primary-900 dark:text-white mb-2">No Website Found</h2>
        <p className="text-primary-600 dark:text-slate-400 mb-6">You need to complete onboarding first.</p>
        <button onClick={() => window.location.href = '/onboarding'} className="btn-primary">
          Go to Onboarding
        </button>
      </div>
    );
  }

  const liveUrl = `http://localhost:5173/${activeTenant?.businessSlug}`;

  const getPreviewData = () => {
    return {
      ...activeTenant,
      ...contentForm,
      workingHours: { start: contentForm.workingHoursStart, end: contentForm.workingHoursEnd }
    };
  };

  const renderPreview = () => {
    const previewData = getPreviewData();
    return (
      <div className="border-[8px] border-slate-800 dark:border-slate-950 rounded-[2rem] overflow-hidden shadow-2xl h-[800px] relative bg-white flex flex-col w-full hidden lg:flex">
        {/* Fake Browser Bar */}
        <div className="bg-slate-100 dark:bg-slate-900 p-3 flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
           <div className="flex gap-1.5">
             <div className="w-3 h-3 rounded-full bg-red-400"></div>
             <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
             <div className="w-3 h-3 rounded-full bg-green-400"></div>
           </div>
           <div className="bg-white dark:bg-slate-950 rounded-lg px-4 py-1 text-xs text-slate-500 w-full text-center font-mono truncate mx-4 shadow-sm border border-slate-200 dark:border-slate-800">
             localhost:5173/{activeTenant.businessSlug}
           </div>
        </div>
        <div className="flex-1 overflow-y-auto preview-container preview-isolate relative">
          <div className="pointer-events-none absolute inset-0 z-50"></div> {/* Prevent interactions */}
          <div className={previewData.colorMode === 'dark' ? 'dark' : ''}>
            {activeTenant.themeType === 'ecommerce' && <TemplateA_Ecommerce data={previewData} isPreview={true} />}
            {activeTenant.themeType === 'booking' && <TemplateB_Booking data={previewData} isPreview={true} />}
            {activeTenant.themeType === 'landing' && <TemplateC_Landing data={previewData} isPreview={true} />}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background dark:bg-slate-950 flex flex-col md:flex-row transition-colors">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-r border-primary-200 dark:border-slate-800 flex flex-col md:min-h-screen transition-colors">
        <div className="p-6 border-b border-primary-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <span className="font-bold text-primary-500 dark:text-slate-400 text-xs tracking-wider uppercase">Your Websites</span>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <a href="/onboarding" className="text-secondary-600 dark:text-secondary-400 hover:text-secondary-700 dark:hover:text-secondary-300 p-1 bg-secondary-50 dark:bg-secondary-900/50 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded transition-colors" title="Create New Website">
                <Plus size={16} />
              </a>
            </div>
          </div>
          
          <select 
            value={activeTenantId || ''} 
            onChange={(e) => setActiveTenantId(e.target.value)}
            className="w-full bg-primary-50 dark:bg-slate-800 border border-primary-200 dark:border-slate-700 text-primary-900 dark:text-white text-sm rounded-lg focus:ring-secondary-500 focus:border-secondary-500 block p-2.5 font-semibold transition-colors"
          >
            {tenants.map(t => (
              <option key={t._id} value={t._id}>{t.businessName}</option>
            ))}
          </select>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => setActiveTab('websites')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'websites' ? 'bg-secondary-50 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400' : 'text-primary-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-slate-800'
            }`}
          >
            <Globe size={18} /> My Websites
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'dashboard' ? 'bg-secondary-50 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400' : 'text-primary-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'analytics' ? 'bg-secondary-50 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400' : 'text-primary-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp size={18} /> Analytics
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'items' ? 'bg-secondary-50 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400' : 'text-primary-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-slate-800'
            }`}
          >
            <Package size={18} /> Services / Products
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'orders' ? 'bg-secondary-50 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400' : 'text-primary-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-slate-800'
            }`}
          >
            <div className="relative">
              <ShoppingCart size={18} />
              {activeTenant?.orders?.filter(o => o.status === 'Pending' || o.status === 'Processing').length > 0 && (
                <span className="absolute -top-2 -right-3 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-emerald-500 rounded-full">
                  {activeTenant.orders.filter(o => o.status === 'Pending' || o.status === 'Processing').length}
                </span>
              )}
            </div>
            Orders
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'coupons' ? 'bg-secondary-50 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400' : 'text-primary-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-slate-800'
            }`}
          >
            <Tag size={18} /> Coupons
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'settings' ? 'bg-secondary-50 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-400' : 'text-primary-600 dark:text-slate-400 hover:bg-primary-50 dark:hover:bg-slate-800'
            }`}
          >
            <Settings size={18} /> Content & Settings
          </button>
        </nav>

        <div className="p-4 border-t border-primary-100 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-4 px-2">
            {user?.picture && <img src={user.picture} alt="Profile" className="w-8 h-8 rounded-full bg-primary-200 dark:bg-slate-700" />}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-primary-900 dark:text-white truncate">{user?.name}</p>
            </div>
          </div>
          <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-primary-600 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-auto">
        
        {activeTab === 'websites' ? (
          <div className="max-w-6xl space-y-6 animate-fade-in">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <h2 className="section-heading dark:text-white mb-0">My Websites</h2>
                <a href="/onboarding" className="btn-primary">
                  <Plus size={16} /> Create New Site
                </a>
             </div>
             
             {tenants.length === 0 ? (
               <div className="p-12 text-center text-primary-500 dark:text-slate-400 bg-white dark:bg-slate-900 rounded-2xl border border-primary-100 dark:border-slate-800 shadow-card">
                 <Globe size={32} className="mx-auto mb-3 opacity-50" />
                 <p>You haven't created any websites yet.</p>
               </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tenants.map(tenant => (
                     <div key={tenant._id} className="bg-white dark:bg-slate-900 border border-primary-100 dark:border-slate-800 rounded-2xl p-6 flex flex-col shadow-card hover:shadow-card-hover transition-all">
                        <div className="flex-1 mb-4">
                           <h3 className="text-xl font-bold text-primary-900 dark:text-white mb-2">{tenant.businessName}</h3>
                           <span className="text-xs font-medium px-2 py-1 rounded bg-secondary-100 dark:bg-secondary-900/50 text-secondary-800 dark:text-secondary-300 capitalize inline-block mb-3">{tenant.themeType}</span>
                           <a href={`http://localhost:5173/${tenant.businessSlug}`} target="_blank" rel="noreferrer" className="text-sm text-primary-500 hover:text-secondary-600 flex items-center gap-1 mb-4">
                              /{tenant.businessSlug} <ExternalLink size={12} />
                           </a>
                        </div>
                        <div className="flex items-center gap-3 pt-4 border-t border-primary-100 dark:border-slate-800">
                           <button onClick={() => { setActiveTenantId(tenant._id); setActiveTab('dashboard'); }} className="btn-secondary w-full justify-center py-2 text-sm">
                              Manage Site
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
             )}
          </div>
        ) : (
          <>
            {/* Top Banner (Live URL) */}
            <div className="bg-primary-900 rounded-2xl p-6 mb-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-card">
              <div>
                <p className="text-primary-300 text-sm font-medium mb-1">Your public site is live at:</p>
                <a href={liveUrl} target="_blank" rel="noreferrer" className="text-white font-mono text-lg hover:underline underline-offset-4 decoration-secondary-500 break-all">
                  {liveUrl}
                </a>
              </div>
              <a href={liveUrl} target="_blank" rel="noreferrer" className="btn-secondary whitespace-nowrap bg-white/10 text-white border-white/20 hover:bg-white/20">
                Visit Site <ExternalLink size={16} />
              </a>
            </div>

            {/* Tab Content */}
            <div className={activeTab === 'settings' || activeTab === 'analytics' ? "w-full" : "max-w-4xl"}>
          
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="section-heading dark:text-white">Overview</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="card-flat dark:bg-slate-900 dark:border-slate-800">
                  <h3 className="text-sm font-medium text-primary-500 dark:text-slate-400 mb-1">Current Theme</h3>
                  <p className="text-2xl font-display font-bold text-primary-900 dark:text-white capitalize">{activeTenant.themeType}</p>
                </div>
                <div className="card-flat dark:bg-slate-900 dark:border-slate-800">
                  <h3 className="text-sm font-medium text-primary-500 dark:text-slate-400 mb-1">Total Items</h3>
                  <p className="text-2xl font-display font-bold text-primary-900 dark:text-white">{activeTenant.items?.length || 0}</p>
                </div>
                <div className="card-flat dark:bg-slate-900 dark:border-slate-800">
                  <h3 className="text-sm font-medium text-primary-500 dark:text-slate-400 mb-1">Total Orders</h3>
                  <p className="text-2xl font-display font-bold text-primary-900 dark:text-white">{activeTenant.orders?.length || 0}</p>
                </div>
              </div>

              <h2 className="section-heading dark:text-white mt-8 mb-4">Quick Actions</h2>
              <div className="grid sm:grid-cols-3 gap-6">
                 <button onClick={() => openItemModal()} className="card-flat flex flex-col items-center justify-center gap-3 hover:bg-primary-50 dark:hover:bg-slate-800 transition-colors text-primary-700 dark:text-slate-300">
                   <div className="p-3 bg-secondary-100 dark:bg-secondary-900/50 rounded-full text-secondary-600 dark:text-secondary-400"><Plus size={24}/></div>
                   <span className="font-semibold">Add Item/Service</span>
                 </button>
                 <button onClick={() => setActiveTab('items')} className="card-flat flex flex-col items-center justify-center gap-3 hover:bg-primary-50 dark:hover:bg-slate-800 transition-colors text-primary-700 dark:text-slate-300">
                   <div className="p-3 bg-primary-100 dark:bg-slate-800 rounded-full text-primary-600 dark:text-slate-400"><Package size={24}/></div>
                   <span className="font-semibold">Manage Components</span>
                 </button>
                 <button onClick={handleDeleteSite} className="card-flat flex flex-col items-center justify-center gap-3 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-red-600">
                   <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-full text-red-600 dark:text-red-400"><Trash2 size={24}/></div>
                   <span className="font-semibold">Delete Website</span>
                 </button>
              </div>
            </div>
          )}

          {/* Items Tab */}
          {activeTab === 'items' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="section-heading">Manage Catalog</h2>
                <button onClick={() => openItemModal()} className="btn-primary">
                  <Plus size={16} /> Add New
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-primary-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-card transition-colors">
                {activeTenant.items?.length === 0 ? (
                  <div className="p-12 text-center text-primary-500 dark:text-slate-400">
                    <Package size={32} className="mx-auto mb-3 opacity-50" />
                    <p>No items added yet. Click "Add New" to get started.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-primary-100 dark:divide-slate-800">
                    {activeTenant.items.map(item => (
                      <li key={item._id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-primary-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-primary-900 dark:text-white">{item.title}</h4>
                          <p className="text-sm text-primary-600 dark:text-slate-400 line-clamp-2 mt-1">{item.description}</p>
                          {item.stockCount !== null && (
                            <p className={`text-xs mt-2 font-bold ${item.stockCount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                              {item.stockCount > 0 ? `${item.stockCount} in stock` : 'Out of Stock'}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/3">
                          <span className="font-bold text-primary-900 dark:text-white whitespace-nowrap">
                            ₹{item.price}{item.priceUnit ? ` ${item.priceUnit}` : ''}
                          </span>
                          <div className="flex items-center gap-2">
                            <button onClick={() => openItemModal(item)} className="p-2 text-primary-500 dark:text-slate-400 hover:text-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-900/30 rounded-lg">
                              <Pencil size={18} />
                            </button>
                            <button onClick={() => handleDeleteItem(item._id)} className="p-2 text-primary-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="section-heading dark:text-white mb-0">Recent Orders</h2>
                  <button onClick={fetchTenants} className="p-2 text-primary-500 hover:text-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-900/30 rounded-lg transition-colors" title="Refresh Orders">
                    <RefreshCcw size={18} />
                  </button>
                </div>
                {activeTenant?.orders?.length > 0 && (
                  <button onClick={exportOrdersCSV} className="btn-secondary flex items-center gap-2 text-sm py-1.5 px-3">
                    <Download size={14} /> Export CSV
                  </button>
                )}
              </div>
              
              <div className="bg-white dark:bg-slate-900 border border-primary-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-card transition-colors">
                {!activeTenant.orders || activeTenant.orders.length === 0 ? (
                  <div className="p-12 text-center text-primary-500 dark:text-slate-400">
                    <ShoppingCart size={32} className="mx-auto mb-3 opacity-50" />
                    <p>No orders yet. They will appear here once customers checkout.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-primary-50 dark:bg-slate-800/50 text-primary-600 dark:text-slate-400 font-medium border-b border-primary-100 dark:border-slate-800">
                        <tr>
                          <th className="px-6 py-4">Customer</th>
                          <th className="px-6 py-4">Contact & Address</th>
                          <th className="px-6 py-4">Order Details</th>
                          <th className="px-6 py-4">Payment</th>
                          <th className="px-6 py-4">Total</th>
                          <th className="px-6 py-4">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-primary-100 dark:divide-slate-800">
                        {[...activeTenant.orders].reverse().map(order => (
                          <tr key={order._id} className="hover:bg-primary-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4 font-semibold text-primary-900 dark:text-white">{order.customerName}</td>
                            <td className="px-6 py-4">
                              <p className="dark:text-slate-300 font-medium">{order.customerPhone}</p>
                              {order.customerEmail && <p className="text-xs text-primary-600 dark:text-slate-400 mt-0.5">{order.customerEmail}</p>}
                              <p className="text-xs text-primary-500 dark:text-slate-500 mt-1 max-w-[200px] truncate" title={order.address}>{order.address}</p>
                            </td>
                            <td className="px-6 py-4">
                              <ul className="text-xs space-y-1">
                                {order.items.map((item, idx) => (
                                  <li key={idx} className="text-primary-700 dark:text-slate-300">
                                    <span className="font-bold dark:text-white">{item.qty}x</span> {item.title}
                                    {(item.bookingDate || item.bookingTime) && (
                                      <div className="text-[11px] text-primary-400 dark:text-slate-500 mt-0.5 flex items-center gap-2">
                                        {item.bookingDate && <span>📅 {item.bookingDate}</span>}
                                        {item.bookingTime && <span>🕐 {item.bookingTime}</span>}
                                      </div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-xs font-medium px-2 py-1 rounded bg-secondary-100 dark:bg-secondary-900/50 text-secondary-800 dark:text-secondary-300 inline-block mb-2">
                                {order.paymentMethod}
                              </span>
                              <div className="flex items-center gap-2">
                                <div className={`text-[10px] font-bold px-2 py-1 inline-block rounded uppercase tracking-wider ${
                                  order.status === 'Cancelled' ? 'bg-red-100 text-red-700' : 
                                  order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                                  'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {order.status || 'Processing'}
                                </div>
                                {(!order.status || order.status === 'Processing' || order.status === 'Pending') && (
                                  <>
                                    <button 
                                      onClick={() => handleUpdateOrderStatus(order._id, 'Delivered')}
                                      className="p-1 text-primary-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                      title="Mark as Delivered"
                                    >
                                      <Check size={16} />
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateOrderStatus(order._id, 'Cancelled')}
                                      className="p-1 text-primary-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                      title="Cancel Order"
                                    >
                                      <X size={16} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 font-bold text-primary-900 dark:text-white">₹{order.totalPrice}</td>
                            <td className="px-6 py-4 text-primary-500 dark:text-slate-500 whitespace-nowrap">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (() => {
            const orders = activeTenant.orders || [];
            const totalOrders = orders.length;
            const deliveredOrders = orders.filter(o => o.status === 'Delivered');
            const cancelledOrders = orders.filter(o => o.status === 'Cancelled');
            const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Processing' || !o.status);
            const totalRevenue = deliveredOrders.reduce((sum, o) => sum + o.totalPrice, 0);
            const pageViews = activeTenant.pageViews || 0;
            const conversionRate = pageViews > 0 ? ((totalOrders / pageViews) * 100).toFixed(1) : '0.0';
            const avgOrderValue = deliveredOrders.length > 0 ? (totalRevenue / deliveredOrders.length).toFixed(0) : 0;
            const totalDiscount = orders.reduce((sum, o) => sum + (o.discountApplied || 0), 0);

            // Orders per day (last 7 days)
            const today = new Date();
            const last7Days = Array.from({ length: 7 }, (_, i) => {
              const d = new Date(today);
              d.setDate(d.getDate() - (6 - i));
              return d.toISOString().split('T')[0];
            });
            const ordersPerDay = last7Days.map(dateStr => ({
              date: dateStr,
              label: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
              shortLabel: new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' }),
              count: orders.filter(o => o.createdAt && new Date(o.createdAt).toISOString().split('T')[0] === dateStr).length,
              revenue: orders.filter(o => o.createdAt && new Date(o.createdAt).toISOString().split('T')[0] === dateStr && o.status === 'Delivered').reduce((s, o) => s + o.totalPrice, 0)
            }));
            const maxDayOrders = Math.max(...ordersPerDay.map(d => d.count), 1);
            const maxDayRevenue = Math.max(...ordersPerDay.map(d => d.revenue), 1);

            // Donut chart data
            const statusData = [
              { label: 'Delivered', count: deliveredOrders.length, color: '#10b981' },
              { label: 'Cancelled', count: cancelledOrders.length, color: '#ef4444' },
              { label: 'Pending', count: pendingOrders.length, color: '#f59e0b' },
            ].filter(s => s.count > 0);
            const donutTotal = statusData.reduce((s, d) => s + d.count, 0) || 1;

            // Top items
            const itemCounts = {};
            orders.forEach(o => {
              if (o.status === 'Cancelled') return;
              o.items.forEach(item => {
                if (!itemCounts[item.title]) itemCounts[item.title] = { title: item.title, qty: 0, revenue: 0 };
                itemCounts[item.title].qty += item.qty;
                itemCounts[item.title].revenue += item.price * item.qty;
              });
            });
            const topItems = Object.values(itemCounts).sort((a, b) => b.qty - a.qty).slice(0, 5);

            // Donut SVG helpers
            const donutRadius = 70;
            const donutStroke = 20;
            const donutCircumference = 2 * Math.PI * donutRadius;
            let donutOffset = 0;

            return (
            <div className="space-y-8 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="section-heading dark:text-white mb-0">Site Analytics</h2>
                <button onClick={fetchTenants} className="p-2 text-primary-500 hover:text-secondary-600 hover:bg-secondary-50 dark:hover:bg-secondary-900/30 rounded-lg transition-colors" title="Refresh">
                  <RefreshCcw size={18} />
                </button>
              </div>

              {/* Stat Cards Row 1 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card-flat dark:bg-slate-900 dark:border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <h3 className="text-xs font-semibold text-primary-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Page Views</h3>
                  <p className="text-3xl font-display font-bold text-primary-900 dark:text-white">{pageViews.toLocaleString()}</p>
                  <p className="text-[11px] text-primary-400 dark:text-slate-500 mt-1">Total visits</p>
                </div>
                <div className="card-flat dark:bg-slate-900 dark:border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <h3 className="text-xs font-semibold text-primary-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Total Orders</h3>
                  <p className="text-3xl font-display font-bold text-primary-900 dark:text-white">{totalOrders}</p>
                  <p className="text-[11px] text-primary-400 dark:text-slate-500 mt-1">All time</p>
                </div>
                <div className="card-flat dark:bg-slate-900 dark:border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <h3 className="text-xs font-semibold text-primary-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Revenue</h3>
                  <p className="text-3xl font-display font-bold text-emerald-600 dark:text-emerald-400">₹{totalRevenue.toLocaleString()}</p>
                  <p className="text-[11px] text-primary-400 dark:text-slate-500 mt-1">From delivered orders</p>
                </div>
                <div className="card-flat dark:bg-slate-900 dark:border-slate-800 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-16 h-16 bg-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
                  <h3 className="text-xs font-semibold text-primary-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Conversion</h3>
                  <p className="text-3xl font-display font-bold text-purple-600 dark:text-purple-400">{conversionRate}%</p>
                  <p className="text-[11px] text-primary-400 dark:text-slate-500 mt-1">Visitors → Orders</p>
                </div>
              </div>

              {/* Stat Cards Row 2 */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card-flat dark:bg-slate-900 dark:border-slate-800 border-l-4 border-l-emerald-500">
                  <h3 className="text-xs font-semibold text-primary-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Delivered</h3>
                  <p className="text-2xl font-display font-bold text-emerald-600 dark:text-emerald-400">{deliveredOrders.length}</p>
                </div>
                <div className="card-flat dark:bg-slate-900 dark:border-slate-800 border-l-4 border-l-red-500">
                  <h3 className="text-xs font-semibold text-primary-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Cancelled</h3>
                  <p className="text-2xl font-display font-bold text-red-600 dark:text-red-400">{cancelledOrders.length}</p>
                </div>
                <div className="card-flat dark:bg-slate-900 dark:border-slate-800 border-l-4 border-l-amber-500">
                  <h3 className="text-xs font-semibold text-primary-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Pending</h3>
                  <p className="text-2xl font-display font-bold text-amber-600 dark:text-amber-400">{pendingOrders.length}</p>
                </div>
                <div className="card-flat dark:bg-slate-900 dark:border-slate-800 border-l-4 border-l-cyan-500">
                  <h3 className="text-xs font-semibold text-primary-500 dark:text-slate-400 mb-1 uppercase tracking-wider">Avg Order Value</h3>
                  <p className="text-2xl font-display font-bold text-cyan-600 dark:text-cyan-400">₹{Number(avgOrderValue).toLocaleString()}</p>
                </div>
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Orders Bar Chart (last 7 days) */}
                <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-primary-100 dark:border-slate-800 rounded-2xl p-6 shadow-card transition-colors">
                  <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-1">Orders — Last 7 Days</h3>
                  <p className="text-xs text-primary-400 dark:text-slate-500 mb-6">Daily order volume</p>
                  
                  <div className="w-full overflow-hidden">
                    <svg viewBox="0 0 560 220" className="w-full" preserveAspectRatio="xMidYMid meet">
                      {/* Grid lines */}
                      {[0, 1, 2, 3, 4].map(i => (
                        <line key={i} x1="40" y1={40 + i * 40} x2="540" y2={40 + i * 40} stroke="currentColor" className="text-primary-100 dark:text-slate-800" strokeWidth="1" />
                      ))}
                      
                      {/* Y axis labels */}
                      {[0, 1, 2, 3, 4].map(i => {
                        const val = Math.round(maxDayOrders * (4 - i) / 4);
                        return <text key={i} x="30" y={44 + i * 40} textAnchor="end" className="fill-primary-400 dark:fill-slate-500" fontSize="11">{val}</text>;
                      })}
                      
                      {/* Bars */}
                      {ordersPerDay.map((d, i) => {
                        const barWidth = 44;
                        const gap = (500 - 7 * barWidth) / 8;
                        const x = 40 + gap + i * (barWidth + gap);
                        const barH = (d.count / maxDayOrders) * 160;
                        const y = 200 - barH;
                        return (
                          <g key={d.date}>
                            {/* Bar background */}
                            <rect x={x} y={40} width={barWidth} height={160} rx="6" className="fill-primary-50 dark:fill-slate-800" />
                            {/* Bar fill */}
                            <rect x={x} y={y} width={barWidth} height={barH} rx="6" fill="url(#barGradient)" style={{ transition: 'all 0.3s ease' }}>
                              <animate attributeName="height" from="0" to={barH} dur="0.6s" fill="freeze" />
                              <animate attributeName="y" from="200" to={y} dur="0.6s" fill="freeze" />
                            </rect>
                            {/* Count label */}
                            {d.count > 0 && (
                              <text x={x + barWidth / 2} y={y - 6} textAnchor="middle" className="fill-primary-700 dark:fill-white" fontSize="12" fontWeight="bold">{d.count}</text>
                            )}
                            {/* Day label */}
                            <text x={x + barWidth / 2} y={215} textAnchor="middle" className="fill-primary-500 dark:fill-slate-400" fontSize="10">{d.shortLabel}</text>
                          </g>
                        );
                      })}
                      
                      {/* Gradient definition */}
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#818cf8" />
                          <stop offset="100%" stopColor="#6366f1" />
                        </linearGradient>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                {/* Order Status Donut Chart */}
                <div className="bg-white dark:bg-slate-900 border border-primary-100 dark:border-slate-800 rounded-2xl p-6 shadow-card transition-colors flex flex-col items-center">
                  <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-1 self-start">Order Status</h3>
                  <p className="text-xs text-primary-400 dark:text-slate-500 mb-4 self-start">Breakdown by status</p>
                  
                  {totalOrders === 0 ? (
                    <div className="flex-1 flex items-center justify-center text-primary-400 dark:text-slate-500 text-sm">No orders yet</div>
                  ) : (
                    <>
                      <svg viewBox="0 0 200 200" className="w-40 h-40 mb-4" style={{ transform: 'rotate(-90deg)' }}>
                        {statusData.map((segment, i) => {
                          const dashLen = (segment.count / donutTotal) * donutCircumference;
                          const dashGap = donutCircumference - dashLen;
                          const currentOffset = donutOffset;
                          donutOffset += dashLen;
                          return (
                            <circle
                              key={i}
                              cx="100" cy="100" r={donutRadius}
                              fill="none"
                              stroke={segment.color}
                              strokeWidth={donutStroke}
                              strokeDasharray={`${dashLen} ${dashGap}`}
                              strokeDashoffset={-currentOffset}
                              strokeLinecap="round"
                              style={{ transition: 'all 0.5s ease' }}
                            />
                          );
                        })}
                        {/* Center text */}
                        <text x="100" y="96" textAnchor="middle" className="fill-primary-900 dark:fill-white" fontSize="28" fontWeight="bold" style={{ transform: 'rotate(90deg)', transformOrigin: '100px 100px' }}>{totalOrders}</text>
                        <text x="100" y="114" textAnchor="middle" className="fill-primary-400 dark:fill-slate-500" fontSize="11" style={{ transform: 'rotate(90deg)', transformOrigin: '100px 100px' }}>orders</text>
                      </svg>
                      
                      {/* Legend */}
                      <div className="space-y-2 w-full">
                        {statusData.map((s, i) => (
                          <div key={i} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }} />
                              <span className="text-primary-700 dark:text-slate-300 font-medium">{s.label}</span>
                            </div>
                            <span className="font-bold text-primary-900 dark:text-white">{s.count} <span className="text-primary-400 dark:text-slate-500 font-normal text-xs">({((s.count / donutTotal) * 100).toFixed(0)}%)</span></span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Revenue Trend + Top Items Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Revenue Trend Line Chart */}
                <div className="bg-white dark:bg-slate-900 border border-primary-100 dark:border-slate-800 rounded-2xl p-6 shadow-card transition-colors">
                  <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-1">Revenue Trend — Last 7 Days</h3>
                  <p className="text-xs text-primary-400 dark:text-slate-500 mb-6">Daily revenue from delivered orders</p>
                  
                  <div className="w-full overflow-hidden">
                    <svg viewBox="0 0 400 180" className="w-full" preserveAspectRatio="xMidYMid meet">
                      {/* Grid */}
                      {[0, 1, 2, 3].map(i => (
                        <line key={i} x1="45" y1={20 + i * 45} x2="380" y2={20 + i * 45} stroke="currentColor" className="text-primary-100 dark:text-slate-800" strokeWidth="1" />
                      ))}
                      
                      {/* Y axis labels */}
                      {[0, 1, 2, 3].map(i => {
                        const val = maxDayRevenue > 0 ? `₹${Math.round(maxDayRevenue * (3 - i) / 3)}` : '₹0';
                        return <text key={i} x="40" y={24 + i * 45} textAnchor="end" className="fill-primary-400 dark:fill-slate-500" fontSize="9">{val}</text>;
                      })}
                      
                      {/* Area fill */}
                      <path
                        d={(() => {
                          const points = ordersPerDay.map((d, i) => {
                            const x = 45 + i * (335 / 6);
                            const y = 155 - (d.revenue / maxDayRevenue) * 135;
                            return `${x},${y}`;
                          });
                          const firstX = 45;
                          const lastX = 45 + 6 * (335 / 6);
                          return `M${firstX},155 L${points.join(' L')} L${lastX},155 Z`;
                        })()}
                        fill="url(#lineGradient)"
                      />
                      
                      {/* Line */}
                      <polyline
                        fill="none"
                        stroke="#10b981"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={ordersPerDay.map((d, i) => {
                          const x = 45 + i * (335 / 6);
                          const y = 155 - (d.revenue / maxDayRevenue) * 135;
                          return `${x},${y}`;
                        }).join(' ')}
                      />
                      
                      {/* Dots + X labels */}
                      {ordersPerDay.map((d, i) => {
                        const x = 45 + i * (335 / 6);
                        const y = 155 - (d.revenue / maxDayRevenue) * 135;
                        return (
                          <g key={d.date}>
                            <circle cx={x} cy={y} r="4" fill="#10b981" stroke="white" strokeWidth="2" />
                            {d.revenue > 0 && (
                              <text x={x} y={y - 10} textAnchor="middle" className="fill-emerald-700 dark:fill-emerald-400" fontSize="9" fontWeight="bold">₹{d.revenue}</text>
                            )}
                            <text x={x} y={172} textAnchor="middle" className="fill-primary-500 dark:fill-slate-400" fontSize="9">{d.shortLabel}</text>
                          </g>
                        );
                      })}
                      
                      <defs>
                        <linearGradient id="lineGradientChart" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                </div>

                {/* Top Selling Items */}
                <div className="bg-white dark:bg-slate-900 border border-primary-100 dark:border-slate-800 rounded-2xl p-6 shadow-card transition-colors">
                  <h3 className="text-sm font-bold text-primary-900 dark:text-white mb-1">Top Selling Items</h3>
                  <p className="text-xs text-primary-400 dark:text-slate-500 mb-4">By quantity sold (excluding cancelled)</p>
                  
                  {topItems.length === 0 ? (
                    <div className="flex items-center justify-center h-40 text-primary-400 dark:text-slate-500 text-sm">No data yet</div>
                  ) : (
                    <div className="space-y-3">
                      {topItems.map((item, i) => {
                        const maxQty = topItems[0].qty || 1;
                        const pct = (item.qty / maxQty) * 100;
                        return (
                          <div key={item.title}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-primary-400 dark:text-slate-500 w-5">#{i + 1}</span>
                                <span className="text-sm font-semibold text-primary-900 dark:text-white truncate max-w-[160px]">{item.title}</span>
                              </div>
                              <div className="text-right">
                                <span className="text-sm font-bold text-primary-900 dark:text-white">{item.qty} sold</span>
                                <span className="text-xs text-primary-400 dark:text-slate-500 ml-2">₹{item.revenue.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="w-full h-2 bg-primary-100 dark:bg-slate-800 rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all duration-500" 
                                style={{ 
                                  width: `${pct}%`,
                                  background: `linear-gradient(90deg, ${['#6366f1','#8b5cf6','#a78bfa','#c4b5fd','#ddd6fe'][i] || '#ddd6fe'}, ${['#818cf8','#a78bfa','#c4b5fd','#ddd6fe','#ede9fe'][i] || '#ede9fe'})`
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Coupon & Discount Summary */}
              {totalDiscount > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-6 shadow-card transition-colors">
                  <h3 className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-3">💰 Discount Summary</h3>
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-0.5">Total Discounts Given</p>
                      <p className="text-2xl font-display font-bold text-amber-900 dark:text-amber-200">₹{totalDiscount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-0.5">Orders with Coupon</p>
                      <p className="text-2xl font-display font-bold text-amber-900 dark:text-amber-200">{orders.filter(o => o.couponCode).length}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-0.5">Active Coupons</p>
                      <p className="text-2xl font-display font-bold text-amber-900 dark:text-amber-200">{activeTenant.coupons?.filter(c => c.isActive).length || 0}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            );
          })()}

          {/* Coupons Tab */}
          {activeTab === 'coupons' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <h2 className="section-heading">Discount Codes</h2>
                <button onClick={() => { setCouponForm({ code: '', discountPercentage: '' }); setIsCouponModalOpen(true); }} className="btn-primary">
                  <Plus size={16} /> Create Code
                </button>
              </div>

              <div className="bg-white dark:bg-slate-900 border border-primary-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-card transition-colors">
                {!activeTenant.coupons || activeTenant.coupons.length === 0 ? (
                  <div className="p-12 text-center text-primary-500 dark:text-slate-400">
                    <Tag size={32} className="mx-auto mb-3 opacity-50" />
                    <p>No discount codes created yet.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-primary-100 dark:divide-slate-800">
                    {activeTenant.coupons.map(coupon => (
                      <li key={coupon._id} className="p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-primary-50 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex-1">
                          <h4 className="text-lg font-bold text-primary-900 dark:text-white uppercase tracking-wider">{coupon.code}</h4>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">{coupon.discountPercentage}% OFF</span>
                          <button onClick={() => handleDeleteCoupon(coupon._id)} className="p-2 text-primary-500 dark:text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Settings / Content Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6 animate-fade-in">
              <h2 className="section-heading mb-6">Content & Settings</h2>
              
              <div className="grid lg:grid-cols-2 gap-8">
                
                {/* Settings Form */}
                <form onSubmit={handleUpdateContent} className="card-flat space-y-8 h-fit">
                  
                  {/* Theme Settings */}
                  <div>
                    <h3 className="text-lg font-bold text-primary-900 dark:text-white border-b border-primary-100 dark:border-slate-800 pb-2 mb-4">Theme & Style</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="input-label">Theme Color</label>
                        <div className="flex items-center gap-4">
                          <input
                            type="color"
                            className="w-12 h-12 p-1 rounded-xl cursor-pointer border border-primary-200 bg-white"
                            value={contentForm.primaryColor}
                            onChange={(e) => setContentForm({ ...contentForm, primaryColor: e.target.value })}
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="input-label">Font Family</label>
                          <select 
                            className="input-field" 
                            value={contentForm.fontFamily} 
                            onChange={(e) => setContentForm({...contentForm, fontFamily: e.target.value})}
                          >
                            <option value="sans">Sans-serif</option>
                            <option value="serif">Serif</option>
                            <option value="mono">Monospace</option>
                          </select>
                        </div>
                        <div>
                          <label className="input-label">Button Shape</label>
                          <select 
                            className="input-field" 
                            value={contentForm.buttonShape} 
                            onChange={(e) => setContentForm({...contentForm, buttonShape: e.target.value})}
                          >
                            <option value="rounded">Rounded</option>
                            <option value="square">Square</option>
                            <option value="pill">Pill</option>
                          </select>
                        </div>
                      </div>
                      
                      <div>
                        <label className="input-label">Color Mode Override</label>
                        <select 
                          className="input-field" 
                          value={contentForm.colorMode} 
                          onChange={(e) => setContentForm({...contentForm, colorMode: e.target.value})}
                        >
                          <option value="light">Always Light Mode</option>
                          <option value="dark">Always Dark Mode</option>
                          <option value="system">Follow System Preferences</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="input-label">Background Image URL</label>
                        <input
                          type="url"
                          className="input-field"
                          placeholder="https://example.com/image.jpg"
                          value={contentForm.backgroundImageUrl}
                          onChange={(e) => setContentForm({ ...contentForm, backgroundImageUrl: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Business Details */}
                  <div>
                    <h3 className="text-lg font-bold text-primary-900 dark:text-white border-b border-primary-100 dark:border-slate-800 pb-2 mb-4">Business Details</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="input-label">Support Email</label>
                        <input
                          type="email"
                          className="input-field"
                          value={contentForm.supportEmail}
                          onChange={(e) => setContentForm({ ...contentForm, supportEmail: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="input-label">Store Location</label>
                        <input
                          type="text"
                          className="input-field"
                          value={contentForm.location}
                          onChange={(e) => setContentForm({ ...contentForm, location: e.target.value })}
                        />
                      </div>
                      
                      {activeTenant.themeType === 'booking' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="input-label">Working Hours Start</label>
                            <input type="time" className="input-field" value={contentForm.workingHoursStart} onChange={(e) => setContentForm({...contentForm, workingHoursStart: e.target.value})} />
                          </div>
                          <div>
                            <label className="input-label">Working Hours End</label>
                            <input type="time" className="input-field" value={contentForm.workingHoursEnd} onChange={(e) => setContentForm({...contentForm, workingHoursEnd: e.target.value})} />
                          </div>
                        </div>
                      )}

                      <div>
                        <label className="input-label">About Us Text</label>
                        <textarea
                          rows={4}
                          required
                          className="input-field resize-y"
                          value={contentForm.aboutText}
                          onChange={(e) => setContentForm({ ...contentForm, aboutText: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* SEO Settings */}
                  <div>
                    <h3 className="text-lg font-bold text-primary-900 dark:text-white border-b border-primary-100 dark:border-slate-800 pb-2 mb-4">SEO Optimization</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="input-label">Meta Title</label>
                        <input type="text" className="input-field" placeholder="e.g. My Awesome Business" value={contentForm.metaTitle} onChange={e => setContentForm({...contentForm, metaTitle: e.target.value})} />
                      </div>
                      <div>
                        <label className="input-label">Meta Description</label>
                        <textarea rows={2} className="input-field" placeholder="Describe your business for Google search results..." value={contentForm.metaDescription} onChange={e => setContentForm({...contentForm, metaDescription: e.target.value})} />
                      </div>
                      <div>
                        <label className="input-label">Favicon URL</label>
                        <input type="url" className="input-field" placeholder="https://example.com/favicon.ico" value={contentForm.faviconUrl} onChange={e => setContentForm({...contentForm, faviconUrl: e.target.value})} />
                      </div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-primary-100 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <button type="submit" className="btn-primary min-w-[120px]">
                        {saveStatus === 'saving' ? <div className="spinner-sm" /> : 'Save Changes'}
                      </button>
                      {saveStatus === 'saved' && <span className="text-sm text-emerald-600 flex items-center gap-1"><CheckCircle2 size={16}/> Saved</span>}
                      {saveStatus === 'error' && <span className="text-sm text-red-600 flex items-center gap-1"><AlertCircle size={16}/> Failed</span>}
                    </div>
                    
                    <button type="button" onClick={handleDeleteSite} className="text-sm text-red-600 hover:text-red-700 font-bold px-4 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                      Delete Website
                    </button>
                  </div>
                </form>

                {/* Live Preview Pane */}
                <div className="hidden lg:block sticky top-10">
                  <h3 className="text-sm font-bold text-primary-500 uppercase tracking-wider mb-4 flex items-center gap-2"><Globe size={16} /> Live Preview</h3>
                  {renderPreview()}
                </div>

              </div>
            </div>
          )}
          </div>
          </>
        )}
      </main>

      {/* Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-card-hover w-full max-w-lg animate-slide-up overflow-hidden border border-primary-100 dark:border-slate-700 max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-primary-100 dark:border-slate-700 bg-primary-50 dark:bg-slate-800 flex-shrink-0">
              <h3 className="text-lg font-bold text-primary-900 dark:text-white">{currentItem ? 'Edit Item' : 'Add New Item'}</h3>
            </div>
            <form onSubmit={handleSaveItem} className="p-6 space-y-4 overflow-y-auto">
              {/* Type Selector */}
              <div>
                <label className="input-label">Type</label>
                <div className="flex gap-2 mt-1">
                  <button type="button" onClick={() => setItemForm({...itemForm, itemType: 'product'})} className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${itemForm.itemType === 'product' ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300' : 'border-primary-200 dark:border-slate-700 text-primary-500 dark:text-slate-400 hover:border-primary-300'}`}>
                    📦 Product
                  </button>
                  <button type="button" onClick={() => setItemForm({...itemForm, itemType: 'service'})} className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${itemForm.itemType === 'service' ? 'border-secondary-500 bg-secondary-50 dark:bg-secondary-900/30 text-secondary-700 dark:text-secondary-300' : 'border-primary-200 dark:border-slate-700 text-primary-500 dark:text-slate-400 hover:border-primary-300'}`}>
                    📅 Service (Appointment)
                  </button>
                </div>
              </div>

              <div>
                <label className="input-label">Name</label>
                <input required className="input-field" value={itemForm.title} onChange={e => setItemForm({...itemForm, title: e.target.value})} placeholder={itemForm.itemType === 'service' ? 'e.g. Dental Checkup' : 'e.g. Wireless Headphones'} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Price (₹)</label>
                  <input required type="number" min="0" className="input-field" value={itemForm.price} onChange={e => setItemForm({...itemForm, price: e.target.value})} placeholder="0.00" />
                </div>
                <div>
                  <label className="input-label">Price Unit (Optional)</label>
                  <input className="input-field" value={itemForm.priceUnit} onChange={e => setItemForm({...itemForm, priceUnit: e.target.value})} placeholder="e.g. / kg, / hr" />
                </div>
              </div>
              <div>
                <label className="input-label">Image URL (Optional)</label>
                <input type="url" className="input-field" value={itemForm.imageUrl} onChange={e => setItemForm({...itemForm, imageUrl: e.target.value})} placeholder="https://example.com/image.jpg" />
              </div>

              {/* Stock Count — only for products */}
              {itemForm.itemType === 'product' && (
                <div>
                  <label className="input-label">Stock Count (Optional)</label>
                  <input type="number" min="0" className="input-field" value={itemForm.stockCount} onChange={e => setItemForm({...itemForm, stockCount: e.target.value})} placeholder="Leave empty for infinite stock" />
                </div>
              )}

              <div>
                <label className="input-label">Description</label>
                <textarea rows={3} className="input-field resize-none" value={itemForm.description} onChange={e => setItemForm({...itemForm, description: e.target.value})} placeholder="Describe this item..." />
              </div>

              {/* Schedule Config — only for services */}
              {itemForm.itemType === 'service' && (
                <div className="border-t border-primary-100 dark:border-slate-700 pt-4 space-y-4">
                  <h4 className="text-sm font-bold text-primary-900 dark:text-white flex items-center gap-2">📅 Scheduling Configuration</h4>

                  {/* Working Days */}
                  <div>
                    <label className="input-label mb-2">Working Days</label>
                    <div className="flex gap-1.5 flex-wrap">
                      {DAY_NAMES.map((name, idx) => (
                        <button key={idx} type="button" onClick={() => toggleWorkingDay(idx)} className={`w-10 h-10 rounded-lg text-xs font-bold transition-all ${itemForm.schedule.workingDays.includes(idx) ? 'bg-secondary-500 text-white shadow-blue' : 'bg-primary-100 dark:bg-slate-800 text-primary-500 dark:text-slate-400 hover:bg-primary-200 dark:hover:bg-slate-700'}`}>
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Working Hours */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="input-label">Start Time</label>
                      <input type="time" className="input-field" value={itemForm.schedule.startTime} onChange={e => setItemForm({...itemForm, schedule: {...itemForm.schedule, startTime: e.target.value}})} />
                    </div>
                    <div>
                      <label className="input-label">End Time</label>
                      <input type="time" className="input-field" value={itemForm.schedule.endTime} onChange={e => setItemForm({...itemForm, schedule: {...itemForm.schedule, endTime: e.target.value}})} />
                    </div>
                  </div>

                  {/* Slot Duration */}
                  <div>
                    <label className="input-label">Slot Duration</label>
                    <select className="input-field" value={itemForm.schedule.slotDuration} onChange={e => setItemForm({...itemForm, schedule: {...itemForm.schedule, slotDuration: Number(e.target.value)}})}>
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={45}>45 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={90}>1.5 hours</option>
                      <option value={120}>2 hours</option>
                    </select>
                  </div>

                  {/* Max Bookings Per Slot */}
                  <div>
                    <label className="input-label">Max Bookings Per Slot</label>
                    <input type="number" min="1" className="input-field" value={itemForm.schedule.maxBookingsPerSlot} onChange={e => setItemForm({...itemForm, schedule: {...itemForm.schedule, maxBookingsPerSlot: Number(e.target.value)}})} placeholder="1" />
                    <p className="text-xs text-primary-400 dark:text-slate-500 mt-1">E.g. 1 for a dentist, 5 for a yoga class</p>
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsItemModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{currentItem ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {isCouponModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-card-hover w-full max-w-sm animate-slide-up overflow-hidden border border-primary-100">
            <div className="px-6 py-4 border-b border-primary-100 bg-primary-50">
              <h3 className="text-lg font-bold text-primary-900">Create Discount Code</h3>
            </div>
            <form onSubmit={handleSaveCoupon} className="p-6 space-y-4">
              <div>
                <label className="input-label">Code</label>
                <input required className="input-field uppercase" value={couponForm.code} onChange={e => setCouponForm({...couponForm, code: e.target.value.toUpperCase()})} placeholder="e.g. SUMMER20" />
              </div>
              <div>
                <label className="input-label">Discount Percentage (%)</label>
                <input required type="number" min="1" max="100" className="input-field" value={couponForm.discountPercentage} onChange={e => setCouponForm({...couponForm, discountPercentage: e.target.value})} placeholder="20" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsCouponModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
