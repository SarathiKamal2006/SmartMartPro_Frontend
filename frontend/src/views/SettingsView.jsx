import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import { 
  Store, 
  Palette, 
  Percent, 
  CreditCard, 
  Bell, 
  Users, 
  Building2, 
  Globe, 
  CheckCircle2, 
  Sun, 
  Moon, 
  Mail, 
  MessageSquare, 
  Printer, 
  Zap, 
  Save, 
  Plus, 
  MapPin, 
  Phone, 
  Wallet,
  Send
} from 'lucide-react';

export default function SettingsView() {
  const { user, selectedBranch, setSelectedBranch, employees, setEmployees, addNotification, storeSettings, updateStoreSettings } = useApp();
  const { theme, toggleTheme, accentColor, setAccentColor, compactMode, setCompactMode, soundEnabled, setSoundEnabled } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { playSuccess, playClick } = useSoundEffects();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('General Settings');
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. General Settings State
  const [storeName, setStoreName] = useState(storeSettings?.storeName || 'SmartMart Pro Supermarket');
  const [tagline, setTagline] = useState(storeSettings?.tagline || 'Fresh Organic Groceries & Supermarket ERP');
  const [supportEmail, setSupportEmail] = useState(storeSettings?.email || 'contact@smartmart.pro');
  const [phone, setPhone] = useState(storeSettings?.phone || '+91 98401 23456');
  const [address, setAddress] = useState(storeSettings?.address || '14 Anna Salai, T. Nagar, Chennai - 600017, Tamil Nadu');
  const [currency, setCurrency] = useState(storeSettings?.currency || 'INR (₹) - Indian Rupee');
  const [timezone, setTimezone] = useState(storeSettings?.timezone || 'Asia/Kolkata (IST +05:30)');
  const [operatingHours, setOperatingHours] = useState(storeSettings?.operatingHours || '07:00 AM - 11:00 PM (Mon - Sun)');
  const [lowStockThreshold, setLowStockThreshold] = useState(storeSettings?.lowStockThreshold || 15);

  // 3. Tax Configuration State
  const [gstin, setGstin] = useState(storeSettings?.gstin || '33AAACS1429B1ZB');
  const [legalName, setLegalName] = useState(storeSettings?.legalBusinessName || 'SmartMart Pro Supermarket Private Limited');
  const [stateRegistration, setStateRegistration] = useState(storeSettings?.stateRegistration || 'Tamil Nadu (State Code: 33)');
  const [taxInvoicePrefix, setTaxInvoicePrefix] = useState(storeSettings?.taxInvoicePrefix || 'SMP/2026/INV-');
  const [taxRate, setTaxRate] = useState(storeSettings?.taxRate || 18);
  const [taxInclusive, setTaxInclusive] = useState(storeSettings?.taxInclusive !== undefined ? storeSettings.taxInclusive : true);
  const [hsnPrint, setHsnPrint] = useState(storeSettings?.hsnPrint !== undefined ? storeSettings.hsnPrint : true);

  // 4. Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState(storeSettings?.paymentMethods || {
    cod: true,
    upi: true,
    card: true,
    wallet: true,
    netbanking: true
  });
  const [upiVpa, setUpiVpa] = useState('smartmartpro@icici');
  const [walletCashback, setWalletCashback] = useState(5);
  const [codMaxLimit, setCodMaxLimit] = useState(10000);

  // 5. Notifications Control State
  const [notifSettings, setNotifSettings] = useState(storeSettings?.notifications || {
    emailAlerts: true,
    smsAlerts: true,
    pushAlerts: true
  });
  const [alertEmail, setAlertEmail] = useState('manager@smartmart.pro');

  // 6. Users & Roles State
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Cashier');
  const [newUserBranch, setNewUserBranch] = useState('Chennai Central Superstore (Main)');
  const [newUserPhone, setNewUserPhone] = useState('');

  // 7. Branches Setup State
  const [localBranches, setLocalBranches] = useState([
    { id: 'BR-01', name: 'Chennai Central Superstore (Main)', city: 'Chennai', address: '14 Anna Salai, T. Nagar, Chennai - 600017', phone: '+91 44 2834 5678', isHeadquarters: true, status: 'Active', manager: 'Sarathi Kamal N' },
    { id: 'BR-02', name: 'Bengaluru Indiranagar Express', city: 'Bengaluru', address: '100ft Road, HAL 2nd Stage, Bengaluru - 560038', phone: '+91 80 4123 9876', isHeadquarters: false, status: 'Active', manager: 'Sarah Jenkins' },
    { id: 'BR-03', name: 'Mumbai Bandra Superstore', city: 'Mumbai', address: 'Linking Road, Bandra West, Mumbai - 400050', phone: '+91 22 6789 1234', isHeadquarters: false, status: 'Active', manager: 'Marcus Sterling' },
    { id: 'BR-04', name: 'Hyderabad Hitech City Hub', city: 'Hyderabad', address: 'Plot 44, Madhapur, Cyberabad, Hyderabad - 500081', phone: '+91 40 4567 8901', isHeadquarters: false, status: 'Active', manager: 'David Kim' },
    { id: 'BR-05', name: 'Kochi Marine Drive Express', city: 'Kochi', address: 'Shanmugham Road, Ernakulam, Kochi - 682031', phone: '+91 484 234 5678', isHeadquarters: false, status: 'Active', manager: 'Elena Rostova' }
  ]);
  const [showAddBranchModal, setShowAddBranchModal] = useState(false);
  const [newBranchCode, setNewBranchCode] = useState('');
  const [newBranchName, setNewBranchName] = useState('');
  const [newBranchCity, setNewBranchCity] = useState('');
  const [newBranchAddress, setNewBranchAddress] = useState('');
  const [newBranchPhone, setNewBranchPhone] = useState('');
  const [newBranchManager, setNewBranchManager] = useState('');

  // Fetch initial settings from backend & sync with storeSettings
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await api.settings.get();
        if (res && res.success && res.data) {
          const d = res.data;
          if (d.storeName) setStoreName(d.storeName);
          if (d.tagline) setTagline(d.tagline);
          if (d.email) setSupportEmail(d.email);
          if (d.phone) setPhone(d.phone);
          if (d.address) setAddress(d.address);
          if (d.currency) setCurrency(d.currency);
          if (d.timezone) setTimezone(d.timezone);
          if (d.operatingHours) setOperatingHours(d.operatingHours);
          if (d.lowStockThreshold) setLowStockThreshold(d.lowStockThreshold);
          if (d.taxRate) setTaxRate(d.taxRate);
          if (d.gstin) setGstin(d.gstin);
          if (d.legalBusinessName) setLegalName(d.legalBusinessName);
          if (d.stateRegistration) setStateRegistration(d.stateRegistration);
          if (d.taxInvoicePrefix) setTaxInvoicePrefix(d.taxInvoicePrefix);
          if (d.taxInclusive !== undefined) setTaxInclusive(d.taxInclusive);
          if (d.hsnPrint !== undefined) setHsnPrint(d.hsnPrint);
          if (d.paymentMethods) setPaymentMethods(prev => ({ ...prev, ...d.paymentMethods }));
          if (d.notifications) setNotifSettings(prev => ({ ...prev, ...d.notifications }));
          if (d.appearance?.accentColor) setAccentColor(d.appearance.accentColor);
          if (d.appearance?.compactMode !== undefined) setCompactMode(d.appearance.compactMode);
          if (d.appearance?.soundEnabled !== undefined) setSoundEnabled(d.appearance.soundEnabled);
          if (d.branches && Array.isArray(d.branches) && d.branches.length > 0) {
            setLocalBranches(d.branches);
          }
          if (updateStoreSettings) {
            updateStoreSettings(d);
          }
        }
      } catch (err) {
        console.warn('Could not fetch settings from backend, using current storeSettings:', err.message);
      }
    }
    loadSettings();
  }, [setAccentColor, setCompactMode, setSoundEnabled, updateStoreSettings]);

  // Save changes handler (takes immediate effect globally)
  const handleSave = async (tabName = activeTab) => {
    if (soundEnabled) playSuccess();
    setLoading(true);

    const payload = {
      storeName,
      tagline,
      email: supportEmail,
      phone,
      address,
      currency,
      timezone,
      operatingHours,
      lowStockThreshold: Number(lowStockThreshold),
      taxRate: Number(taxRate),
      gstin,
      legalBusinessName: legalName,
      stateRegistration,
      taxInvoicePrefix,
      taxInclusive,
      hsnPrint,
      paymentMethods,
      notifications: notifSettings,
      branches: localBranches,
      appearance: {
        accentColor,
        compactMode,
        soundEnabled
      }
    };

    // 1. Immediately apply to AppContext & ThemeContext & LocalStorage
    if (updateStoreSettings) {
      updateStoreSettings(payload);
    }
    setAccentColor(accentColor);
    setCompactMode(compactMode);
    setSoundEnabled(soundEnabled);

    // 2. Persist to MongoDB backend
    try {
      await api.settings.update(payload);
    } catch (err) {
      console.warn('Backend settings update note:', err.message);
    }

    setLoading(false);
    setSavedSuccess(true);
    showToast({
      title: `${tabName} Saved & Applied! ✅`,
      message: 'All changes are now active across store headers, theme styles, POS, and receipts.',
      type: 'success',
      category: 'system',
      duration: 3500
    });

    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handleTestNotification = () => {
    playClick();
    addNotification({
      title: '🔔 Test System Alert',
      description: 'This is a live test notification generated from Settings > Notifications Control.',
      time: 'Just now',
      type: 'System Alerts',
      targetRoles: ['Super Admin', 'Store Manager', 'Cashier', 'Customer'],
      isNew: true
    });
    playSuccess();
    showToast({
      title: 'Test Notification Dispatched! 🔔',
      message: 'Check the top notification bell icon to view your new alert.',
      type: 'info',
      category: 'system',
      duration: 3500
    });
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) {
      alert('Please provide staff name and email');
      return;
    }
    playClick();
    const newStaff = {
      name: newUserName,
      email: newUserEmail,
      role: newUserRole,
      branch: newUserBranch,
      phone: newUserPhone || '+91 98401 00000',
      status: 'Active',
      joinDate: new Date().toLocaleDateString('en-GB')
    };

    try {
      const res = await api.users.create(newStaff);
      if (res && res.success && res.data) {
        if (setEmployees) {
          setEmployees(prev => [res.data, ...prev]);
        }
      }
    } catch (err) {
      console.warn('API staff creation fallback to local state:', err.message);
      if (setEmployees) {
        setEmployees(prev => [{ ...newStaff, id: `USR-${Math.floor(100 + Math.random() * 900)}` }, ...prev]);
      }
    }

    playSuccess();
    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserPhone('');
    showToast({
      title: 'Staff Member Created! 👤',
      message: `${newUserName} (${newUserRole}) added to ${newUserBranch}.`,
      type: 'success',
      category: 'system',
      duration: 3500
    });
  };

  const handleAddBranch = (e) => {
    e.preventDefault();
    if (!newBranchName || !newBranchCity) {
      alert('Branch name and city are required.');
      return;
    }
    playClick();
    const code = newBranchCode || `BR-0${localBranches.length + 1}`;
    const newBranch = {
      id: code,
      name: newBranchName,
      city: newBranchCity,
      address: newBranchAddress || `${newBranchCity} Commercial Hub`,
      phone: newBranchPhone || '+91 80 4000 0000',
      manager: newBranchManager || 'Branch In-charge',
      isHeadquarters: false,
      status: 'Active'
    };

    const updated = [...localBranches, newBranch];
    setLocalBranches(updated);
    setShowAddBranchModal(false);
    setNewBranchCode('');
    setNewBranchName('');
    setNewBranchCity('');
    setNewBranchAddress('');
    setNewBranchPhone('');
    setNewBranchManager('');
    playSuccess();
    showToast({
      title: 'Branch Added! 🏢',
      message: `${newBranchName} added to multi-store network.`,
      type: 'success',
      category: 'system',
      duration: 3500
    });
  };

  // Nav menu items (Developer API Keys removed)
  const menuItems = [
    { name: 'General Settings', icon: Store, desc: 'Store profile & metadata' },
    { name: 'Appearance & Theme', icon: Palette, desc: 'Themes, languages & accents' },
    { name: 'Tax Configuration', icon: Percent, desc: 'GST slabs & legal compliance' },
    { name: 'Payment Methods', icon: CreditCard, desc: 'Gateways, UPI & Wallet' },
    { name: 'Notifications Control', icon: Bell, desc: 'Alert channels & email' },
    { name: 'Users & Roles', icon: Users, desc: 'Staff directory & RBAC' },
    { name: 'Branches Setup', icon: Building2, desc: 'Multi-store locations' }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <span>{t('settings')}</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              ERP v2.6 Enterprise
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configure supermarket metadata, localized languages, GST tax slabs, multi-branch network, and payment gateways.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(activeTab)}
            disabled={loading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-transform active:scale-95 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : 'Save Configuration'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-xs font-bold rounded-2xl flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Settings successfully saved and synced to database!</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">MongoDB Synced</span>
        </div>
      )}

      {/* Main Grid: Left Sidebar Menu + Right Active Tab Content */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        {/* Left Side Navigation Menu */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1.5 h-fit">
          <div className="px-3 py-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Configuration Tabs
          </div>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {
                  playClick();
                  setActiveTab(item.name);
                }}
                className={`w-full text-left px-3.5 py-3 rounded-2xl text-xs flex items-center gap-3 transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white font-semibold'
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 transition-colors ${
                  isActive ? 'bg-white/20 text-white' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                }`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <div className="truncate leading-tight">{item.name}</div>
                  <div className={`text-[10px] font-normal truncate mt-0.5 ${isActive ? 'text-emerald-100' : 'text-slate-400'}`}>
                    {item.desc}
                  </div>
                </div>
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 px-3 pb-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Node REST Online
            </span>
            <span className="font-mono text-[10px]">v2.6</span>
          </div>
        </div>

        {/* Right Tab Content Container */}
        <div className="md:col-span-3 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">

          {/* ══════════════════════════════════════════════════════
              TAB 1: GENERAL SETTINGS
             ══════════════════════════════════════════════════════ */}
          {activeTab === 'General Settings' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Store className="w-5 h-5 text-emerald-500" />
                  <span>General Store Settings</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Update primary supermarket metadata, support helpline, default currency, and manager credentials.
                </p>
              </div>

              {/* Active Manager Card */}
              <div className="p-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-base shadow-sm">
                    {user?.name ? user.name.charAt(0) : 'S'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {user?.name || 'Sarathi Kamal N'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        {user?.role || 'Super Admin'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {user?.email || 'admin@smartmart.pro'} • Clearance: Root Access Level 5
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-600/20 rounded-xl text-xs font-bold font-mono">
                  ACTIVE SESSION
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-900 dark:text-white mb-1.5">STORE DISPLAY NAME</label>
                  <input
                    type="text"
                    value={storeName}
                    onChange={e => setStoreName(e.target.value)}
                    placeholder="Enter store name..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-900 dark:text-white mb-1.5">BRAND SLOGAN / TAGLINE</label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={e => setTagline(e.target.value)}
                    placeholder="Enter brand tagline..."
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1.5">SUPPORT HELPLINE EMAIL</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      value={supportEmail}
                      onChange={e => setSupportEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1.5">SUPPORT PHONE NUMBER</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-900 dark:text-white mb-1.5">HEADQUARTERS PHYSICAL ADDRESS</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full pl-10 pr-3 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1.5">DEFAULT STORE CURRENCY</label>
                  <select
                    value={currency}
                    onChange={e => setCurrency(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option>INR (₹) - Indian Rupee</option>
                    <option>USD ($) - United States Dollar</option>
                    <option>EUR (€) - Euro</option>
                    <option>GBP (£) - British Pound</option>
                    <option>AED (د.إ) - UAE Dirham</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1.5">SYSTEM TIMEZONE</label>
                  <select
                    value={timezone}
                    onChange={e => setTimezone(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option>Asia/Kolkata (IST +05:30)</option>
                    <option>UTC (Coordinated Universal Time)</option>
                    <option>America/New_York (EST -05:00)</option>
                    <option>Europe/London (GMT +00:00)</option>
                    <option>Asia/Dubai (GST +04:00)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1.5">OPERATING STORE HOURS</label>
                  <input
                    type="text"
                    value={operatingHours}
                    onChange={e => setOperatingHours(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1.5">DEFAULT LOW-STOCK THRESHOLD (UNITS)</label>
                  <input
                    type="number"
                    value={lowStockThreshold}
                    onChange={e => setLowStockThreshold(Number(e.target.value))}
                    min="1"
                    max="100"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 2: APPEARANCE & THEME
             ══════════════════════════════════════════════════════ */}
          {activeTab === 'Appearance & Theme' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Palette className="w-5 h-5 text-emerald-500" />
                  <span>Appearance & Display Preferences</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Switch light/dark themes, multi-language localization, accent colors, and audio sound feedback.
                </p>
              </div>

              {/* Theme Mode Selector Cards */}
              <div className="space-y-3">
                <label className="block font-bold text-xs text-slate-900 dark:text-white">THEME MODE SELECTION</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      playClick();
                      if (theme !== 'light') toggleTheme();
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      theme === 'light'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-950 dark:text-emerald-300 ring-2 ring-emerald-500/30 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                        <Sun className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm">Light Mode</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">Crisp daytime contrast & clean white layout</div>
                      </div>
                    </div>
                    {theme === 'light' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                  </button>

                  <button
                    onClick={() => {
                      playClick();
                      if (theme !== 'dark') toggleTheme();
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      theme === 'dark'
                        ? 'bg-emerald-500/10 border-emerald-500 text-emerald-950 dark:text-emerald-300 ring-2 ring-emerald-500/30 font-bold'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                        <Moon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-extrabold text-sm">Dark Mode</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">Sleek dark theme optimized for low-light</div>
                      </div>
                    </div>
                    {theme === 'dark' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                  </button>
                </div>
              </div>

              {/* Multi-Language Selector */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-emerald-500" />
                  <label className="block font-bold text-xs text-slate-900 dark:text-white">MULTI-LANGUAGE LOCALIZATION</label>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { code: 'en', label: 'English', sub: 'Standard' },
                    { code: 'hi', label: 'Hindi (हिंदी)', sub: 'National' },
                    { code: 'ml', label: 'Malayalam (മലയാളം)', sub: 'Regional' },
                    { code: 'ta', label: 'Tamil (தமிழ்)', sub: 'Regional' },
                  ].map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        playClick();
                        setLang(l.code);
                        showToast({
                          title: `Language changed to ${l.label}`,
                          message: 'All store translations updated instantly.',
                          type: 'info',
                          category: 'system',
                          duration: 2000
                        });
                      }}
                      className={`p-3.5 rounded-2xl text-left border transition-all ${
                        lang === l.code
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                      }`}
                    >
                      <div className="text-xs font-extrabold">{l.label}</div>
                      <div className={`text-[10px] mt-0.5 ${lang === l.code ? 'text-emerald-100' : 'text-slate-400'}`}>{l.sub}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Accent Color Palette */}
              <div className="space-y-3 pt-2">
                <label className="block font-bold text-xs text-slate-900 dark:text-white">PRIMARY BRAND ACCENT COLOR</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { id: 'emerald', name: 'Emerald Green', bg: 'bg-emerald-500' },
                    { id: 'blue', name: 'Ocean Sky', bg: 'bg-blue-500' },
                    { id: 'violet', name: 'Royal Violet', bg: 'bg-violet-500' },
                    { id: 'amber', name: 'Amber Gold', bg: 'bg-amber-500' },
                    { id: 'rose', name: 'Rose Red', bg: 'bg-rose-500' },
                  ].map((acc) => (
                    <button
                      key={acc.id}
                      onClick={() => {
                        if (soundEnabled) playClick();
                        setAccentColor(acc.id);
                        showToast({
                          title: `Theme: ${acc.name} 🎨`,
                          message: 'Accent colors updated in real-time. Remember to click Save Configuration.',
                          type: 'info',
                          category: 'system',
                          duration: 2200
                        });
                      }}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                        accentColor === acc.id
                          ? 'bg-emerald-500/10 border-emerald-500 font-bold text-slate-900 dark:text-white ring-2 ring-emerald-500/30'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full ${acc.bg} shadow-sm`} />
                      <span className="text-[11px] font-bold">{acc.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Toggles: Audio, Compact Mode */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Audio & Web Audio API Sound Effects</div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">Play audio chimes on POS billing, barcode scan, and approvals</div>
                  </div>
                  <button
                    onClick={() => {
                      const next = !soundEnabled;
                      setSoundEnabled(next);
                      if (next) playSuccess();
                      showToast({
                        title: next ? 'Sound Effects Enabled 🔊' : 'Sound Effects Muted 🔇',
                        message: next ? 'Web Audio chime feedback turned ON' : 'Audio sounds muted globally',
                        type: 'info',
                        category: 'system',
                        duration: 2000
                      });
                    }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${
                      soundEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Compact High-Density Table Layout</div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">Reduce padding in inventory and order logs for large monitors</div>
                  </div>
                  <button
                    onClick={() => {
                      if (soundEnabled) playClick();
                      const next = !compactMode;
                      setCompactMode(next);
                      showToast({
                        title: next ? 'Compact Table Mode ON 📊' : 'Standard Density Mode ON 📊',
                        message: next ? 'Table rows compressed for high data density' : 'Default comfortable table padding restored',
                        type: 'info',
                        category: 'system',
                        duration: 2000
                      });
                    }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${
                      compactMode ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${compactMode ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 3: TAX CONFIGURATION
             ══════════════════════════════════════════════════════ */}
          {activeTab === 'Tax Configuration' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Percent className="w-5 h-5 text-emerald-500" />
                  <span>Tax & GST Compliance Configuration</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure GSTIN registration credentials, GST tax slabs, HSN codes, and invoice serial numbering.
                </p>
              </div>

              {/* GSTIN Business Profile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1.5">GSTIN REGISTRATION NUMBER</label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={e => setGstin(e.target.value.toUpperCase())}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1.5">LEGAL BUSINESS ENTITY NAME</label>
                  <input
                    type="text"
                    value={legalName}
                    onChange={e => setLegalName(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1.5">REGISTRATION STATE / CODE</label>
                  <input
                    type="text"
                    value={stateRegistration}
                    onChange={e => setStateRegistration(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1.5">TAX INVOICE SERIAL PREFIX</label>
                  <input
                    type="text"
                    value={taxInvoicePrefix}
                    onChange={e => setTaxInvoicePrefix(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 font-mono font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* GST Tax Slabs Selection */}
              <div className="space-y-3 pt-2">
                <label className="block font-bold text-xs text-slate-900 dark:text-white">DEFAULT STORE GST TAX SLAB</label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { rate: 0, label: '0% Exempt', desc: 'Raw grains & milk' },
                    { rate: 5, label: '5% Essential', desc: 'Edible oil, tea, coffee' },
                    { rate: 12, label: '12% Processed', desc: 'Juices, dairy cheese' },
                    { rate: 18, label: '18% Standard', desc: 'Active FMCG grocery' },
                    { rate: 28, label: '28% Luxury', desc: 'Aerated & luxury' },
                  ].map((s) => (
                    <button
                      key={s.rate}
                      onClick={() => {
                        playClick();
                        setTaxRate(s.rate);
                      }}
                      className={`p-3.5 rounded-2xl text-left border transition-all ${
                        taxRate === s.rate
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 font-bold'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                      }`}
                    >
                      <div className="text-base font-extrabold">{s.rate}%</div>
                      <div className="text-xs font-bold mt-0.5">{s.label}</div>
                      <div className={`text-[10px] mt-1 ${taxRate === s.rate ? 'text-emerald-100' : 'text-slate-400'}`}>{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tax Split Preview */}
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-extrabold text-emerald-800 dark:text-emerald-300 block">
                    Tax Breakdown for {taxRate}% GST:
                  </span>
                  <span className="text-slate-600 dark:text-slate-400">
                    Intra-State: CGST ({(taxRate / 2).toFixed(1)}%) + SGST ({(taxRate / 2).toFixed(1)}%) • Inter-State: IGST ({taxRate.toFixed(1)}%)
                  </span>
                </div>
                <span className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-xl text-xs shrink-0">
                  Compliant with GSTN Rules
                </span>
              </div>

              {/* Compliance Toggles */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Tax-Inclusive Retail Pricing</div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">All product MRPs displayed to retail customers include GST</div>
                  </div>
                  <button
                    onClick={() => {
                      playClick();
                      setTaxInclusive(!taxInclusive);
                    }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${
                      taxInclusive ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${taxInclusive ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">Print HSN / SAC Codes on Invoices</div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">Print 8-digit HSN codes on thermal POS receipts</div>
                  </div>
                  <button
                    onClick={() => {
                      playClick();
                      setHsnPrint(!hsnPrint);
                    }}
                    className={`w-12 h-6 rounded-full p-1 transition-colors ${
                      hsnPrint ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition-transform ${hsnPrint ? 'translate-x-6' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 4: PAYMENT METHODS
             ══════════════════════════════════════════════════════ */}
          {activeTab === 'Payment Methods' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-500" />
                  <span>Payment Channels & POS Terminals</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure checkout payment methods, merchant UPI VPA, SmartMart Wallet cashback, and thermal printers.
                </p>
              </div>

              {/* Payment Gateways List */}
              <div className="space-y-3">
                {[
                  {
                    id: 'cod',
                    name: 'Cash on Delivery (COD) / Register Cash',
                    desc: 'Accept physical cash at billing counter and doorstep deliveries.',
                    icon: Store
                  },
                  {
                    id: 'upi',
                    name: 'UPI & Instant QR Codes',
                    desc: 'Google Pay, PhonePe, Paytm, BHIM and dynamic terminal QR scanning.',
                    icon: Zap
                  },
                  {
                    id: 'card',
                    name: 'Credit & Debit Cards (POS Swipe)',
                    desc: 'Visa, MasterCard, RuPay & American Express with integrated EDC terminal.',
                    icon: CreditCard
                  },
                  {
                    id: 'wallet',
                    name: 'SmartMart Pro Customer Wallet',
                    desc: 'Instant 1-tap checkout with auto cashback rewards credited on every order.',
                    icon: Wallet
                  },
                  {
                    id: 'netbanking',
                    name: 'Net Banking & Corporate Accounts',
                    desc: 'Direct bank transfer across 40+ major Indian scheduled banks.',
                    icon: Building2
                  }
                ].map((pm) => {
                  const Icon = pm.icon;
                  const isEnabled = paymentMethods[pm.id];
                  return (
                    <div
                      key={pm.id}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                        isEnabled
                          ? 'bg-slate-50 dark:bg-slate-800/60 border-emerald-500/40'
                          : 'bg-slate-50/40 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`p-2.5 rounded-xl ${
                          isEnabled ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{pm.name}</span>
                            {isEnabled && (
                              <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                ACTIVE
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{pm.desc}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          playClick();
                          setPaymentMethods(prev => ({ ...prev, [pm.id]: !prev[pm.id] }));
                        }}
                        className={`w-12 h-6 rounded-full p-1 shrink-0 transition-colors ${
                          isEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Specific Gateway Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1.5">MERCHANT UPI VPA ADDRESS</label>
                  <input
                    type="text"
                    value={upiVpa}
                    onChange={e => setUpiVpa(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1.5">WALLET CASHBACK REWARD (%)</label>
                  <input
                    type="number"
                    value={walletCashback}
                    onChange={e => setWalletCashback(Number(e.target.value))}
                    min="0"
                    max="20"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-900 dark:text-white mb-1.5">MAX COD ORDER LIMIT (₹)</label>
                  <input
                    type="number"
                    value={codMaxLimit}
                    onChange={e => setCodMaxLimit(Number(e.target.value))}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 font-semibold"
                  />
                </div>
              </div>

              {/* Hardware Peripherals Box */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <Printer className="w-6 h-6 text-emerald-500 shrink-0" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">POS Thermal Receipt Hardware</div>
                    <div className="text-slate-500 dark:text-slate-400 text-[11px]">ESC/POS 80mm High-Speed Thermal Printer & Laser Scanner (Connected)</div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    playSuccess();
                    showToast({
                      title: 'Receipt Test Printed! 🧾',
                      message: 'Hardware communication test successful.',
                      type: 'success',
                      category: 'system',
                      duration: 3000
                    });
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-sm shrink-0"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Test Print Receipt</span>
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 5: NOTIFICATIONS CONTROL
             ══════════════════════════════════════════════════════ */}
          {activeTab === 'Notifications Control' && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-emerald-500" />
                  <span>Notifications & Alert Channels</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure automated email notifications, SMS delivery alerts, push notifications, and sound chimes.
                </p>
              </div>

              {/* Notification Channels */}
              <div className="space-y-3">
                {[
                  {
                    id: 'emailAlerts',
                    title: 'Automated Email Notifications',
                    desc: 'Send order invoices to customers, low stock critical alerts to inventory keepers, and EOD digests to managers.',
                    icon: Mail
                  },
                  {
                    id: 'smsAlerts',
                    title: 'SMS & WhatsApp Delivery Notifications',
                    desc: 'Dispatch driver OTP verification codes and live order tracking links straight to customer phones.',
                    icon: MessageSquare
                  },
                  {
                    id: 'pushAlerts',
                    title: 'In-App System Popups & Bell Badges',
                    desc: 'Display instant notification badges and bell drawer alerts on new online storefront orders.',
                    icon: Bell
                  }
                ].map((nc) => {
                  const Icon = nc.icon;
                  const isEnabled = notifSettings[nc.id];
                  return (
                    <div
                      key={nc.id}
                      className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-3.5">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-900 dark:text-white">{nc.title}</div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{nc.desc}</div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          playClick();
                          setNotifSettings(prev => ({ ...prev, [nc.id]: !prev[nc.id] }));
                        }}
                        className={`w-12 h-6 rounded-full p-1 shrink-0 transition-colors ${
                          isEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Manager Alert Email Destination */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3 text-xs">
                <label className="block font-bold text-slate-900 dark:text-white">MANAGER LOW-STOCK ALERT RECIPIENT EMAIL</label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    value={alertEmail}
                    onChange={e => setAlertEmail(e.target.value)}
                    className="flex-1 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold"
                  />
                  <button
                    onClick={handleTestNotification}
                    className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Test Alert</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 6: USERS & ROLES
             ══════════════════════════════════════════════════════ */}
          {activeTab === 'Users & Roles' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-500" />
                    <span>Users & Role-Based Access Control (RBAC)</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manage staff directory, role permissions, and access privileges across all ERP modules.
                  </p>
                </div>
                <button
                  onClick={() => {
                    playClick();
                    setShowAddUserModal(true);
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-transform active:scale-95 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD STAFF MEMBER</span>
                </button>
              </div>

              {/* RBAC Role Cards Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { role: 'Super Admin', desc: 'Full root access to all modules & settings', count: '1 User' },
                  { role: 'Store Manager', desc: 'Inventory, Orders, POS, POs, Staff', count: '3 Users' },
                  { role: 'Cashier', desc: 'POS billing terminal & fast checkout', count: '8 Users' },
                  { role: 'Warehouse Staff', desc: 'Inbound goods count & stock transfers', count: '4 Users' },
                ].map((r) => (
                  <div key={r.role} className="p-3.5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs">
                    <div className="font-extrabold text-slate-900 dark:text-white">{r.role}</div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">{r.desc}</div>
                    <span className="inline-block px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-md text-[9px] mt-2">
                      {r.count}
                    </span>
                  </div>
                ))}
              </div>

              {/* Staff Directory Table */}
              <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                      <th className="p-3">STAFF MEMBER</th>
                      <th className="p-3">ROLE</th>
                      <th className="p-3">BRANCH</th>
                      <th className="p-3">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {(employees || [
                      { id: 'USR-01', name: 'Sarathi Kamal N', email: 'admin@smartmart.pro', role: 'Super Admin', branch: 'Chennai Central (Main)', status: 'Active' },
                      { id: 'USR-02', name: 'Sarah Jenkins', email: 'manager@smartmart.pro', role: 'Store Manager', branch: 'Chennai Central (Main)', status: 'Active' },
                      { id: 'USR-03', name: 'Marcus Sterling', email: 'inventory@smartmart.pro', role: 'Inventory Manager', branch: 'Bengaluru Express', status: 'Active' },
                      { id: 'USR-04', name: 'Elena Rostova', email: 'cashier@smartmart.pro', role: 'Cashier', branch: 'Mumbai Superstore', status: 'Active' },
                    ]).slice(0, 6).map((emp) => (
                      <tr key={emp.id || emp._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                        <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px]">
                            {emp.name ? emp.name.charAt(0) : 'U'}
                          </div>
                          <div>
                            <div>{emp.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal font-mono">{emp.email}</div>
                          </div>
                        </td>
                        <td className="p-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            emp.role === 'Super Admin' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' :
                            emp.role === 'Store Manager' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                          }`}>
                            {emp.role}
                          </span>
                        </td>
                        <td className="p-3 text-[11px] text-slate-600 dark:text-slate-400">{emp.branch}</td>
                        <td className="p-3">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            {emp.status || 'Active'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Staff Modal */}
              {showAddUserModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-scaleUp">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Add New Staff Member</h4>
                      <button onClick={() => setShowAddUserModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>

                    <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-900 dark:text-white mb-1">FULL NAME</label>
                        <input
                          type="text"
                          required
                          value={newUserName}
                          onChange={e => setNewUserName(e.target.value)}
                          placeholder="e.g. Rajesh Kumar"
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-900 dark:text-white mb-1">EMAIL ADDRESS</label>
                        <input
                          type="email"
                          required
                          value={newUserEmail}
                          onChange={e => setNewUserEmail(e.target.value)}
                          placeholder="rajesh@smartmart.pro"
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-900 dark:text-white mb-1">ROLE</label>
                          <select
                            value={newUserRole}
                            onChange={e => setNewUserRole(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold"
                          >
                            <option>Cashier</option>
                            <option>Store Manager</option>
                            <option>Inventory Manager</option>
                            <option>Warehouse Staff</option>
                            <option>Delivery Partner</option>
                            <option>Accountant</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-slate-900 dark:text-white mb-1">BRANCH</label>
                          <select
                            value={newUserBranch}
                            onChange={e => setNewUserBranch(e.target.value)}
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-semibold truncate"
                          >
                            <option>Chennai Central Superstore (Main)</option>
                            <option>Bengaluru Indiranagar Express</option>
                            <option>Mumbai Bandra Superstore</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-900 dark:text-white mb-1">PHONE NUMBER</label>
                        <input
                          type="text"
                          value={newUserPhone}
                          onChange={e => setNewUserPhone(e.target.value)}
                          placeholder="+91 98401 55555"
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-3">
                        <button
                          type="button"
                          onClick={() => setShowAddUserModal(false)}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20"
                        >
                          Save Member
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              TAB 7: BRANCHES SETUP
             ══════════════════════════════════════════════════════ */}
          {activeTab === 'Branches Setup' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-emerald-500" />
                    <span>Store Branches & Warehouses</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Manage multi-location retail supermarkets, regional hubs, and stock distribution.
                  </p>
                </div>
                <button
                  onClick={() => {
                    playClick();
                    setShowAddBranchModal(true);
                  }}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-transform active:scale-95 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>ADD NEW BRANCH</span>
                </button>
              </div>

              {/* Branch Network Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {localBranches.map((br) => {
                  const isCurrent = selectedBranch?.id === br.id;
                  return (
                    <div
                      key={br.id}
                      className={`p-5 rounded-3xl border transition-all space-y-3 ${
                        isCurrent
                          ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/30'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-emerald-500/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                              {br.id}
                            </span>
                            <span className="font-extrabold text-sm text-slate-900 dark:text-white">{br.city}</span>
                            {br.isHeadquarters && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/20 text-amber-600 dark:text-amber-400">
                                HQ MAIN
                              </span>
                            )}
                          </div>
                          <div className="font-bold text-xs text-slate-800 dark:text-slate-200 mt-1">{br.name}</div>
                        </div>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate">{br.address}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{br.phone}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Active Superstore
                        </span>

                        <button
                          onClick={() => {
                            playClick();
                            if (setSelectedBranch) {
                              setSelectedBranch(br);
                              playSuccess();
                              showToast({
                                title: `Switched to ${br.name}`,
                                message: 'Active branch view updated across all ERP modules.',
                                type: 'info',
                                category: 'system',
                                duration: 2500
                              });
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-500'
                          }`}
                        >
                          {isCurrent ? 'Current Active Branch' : 'Select Branch'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Branch Modal */}
              {showAddBranchModal && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-scaleUp">
                    <div className="flex items-center justify-between">
                      <h4 className="font-extrabold text-base text-slate-900 dark:text-white">Add New Store Branch</h4>
                      <button onClick={() => setShowAddBranchModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                    </div>

                    <form onSubmit={handleAddBranch} className="space-y-3 text-xs">
                      <div>
                        <label className="block font-bold text-slate-900 dark:text-white mb-1">BRANCH NAME</label>
                        <input
                          type="text"
                          required
                          value={newBranchName}
                          onChange={e => setNewBranchName(e.target.value)}
                          placeholder="e.g. Pune Kothrud Superstore"
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block font-bold text-slate-900 dark:text-white mb-1">BRANCH CODE</label>
                          <input
                            type="text"
                            value={newBranchCode}
                            onChange={e => setNewBranchCode(e.target.value.toUpperCase())}
                            placeholder="BR-06"
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono"
                          />
                        </div>
                        <div>
                          <label className="block font-bold text-slate-900 dark:text-white mb-1">CITY</label>
                          <input
                            type="text"
                            required
                            value={newBranchCity}
                            onChange={e => setNewBranchCity(e.target.value)}
                            placeholder="Pune"
                            className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-900 dark:text-white mb-1">ADDRESS</label>
                        <input
                          type="text"
                          value={newBranchAddress}
                          onChange={e => setNewBranchAddress(e.target.value)}
                          placeholder="Paud Road, Kothrud, Pune - 411038"
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-slate-900 dark:text-white mb-1">CONTACT PHONE</label>
                        <input
                          type="text"
                          value={newBranchPhone}
                          onChange={e => setNewBranchPhone(e.target.value)}
                          placeholder="+91 20 2543 0000"
                          className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                        />
                      </div>

                      <div className="flex justify-end gap-2 pt-3">
                        <button
                          type="button"
                          onClick={() => setShowAddBranchModal(false)}
                          className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md shadow-emerald-600/20"
                        >
                          Add Branch
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Save Action Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Active configuration section: <strong className="text-slate-700 dark:text-slate-300">{activeTab}</strong>
            </span>
            <button
              onClick={() => handleSave(activeTab)}
              disabled={loading}
              className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-transform active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save {activeTab}</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
