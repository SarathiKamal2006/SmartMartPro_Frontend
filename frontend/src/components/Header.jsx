import React, { useState, useEffect, useId } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import Logo from './Logo';
import { 
  Search, 
  Bell, 
  Sparkles, 
  Globe, 
  Building2, 
  Clock,
  Scan,
  Sun,
  Moon,
  ShoppingCart,
  PhoneCall,
  MapPin,
  Wallet,
  Tag,
  Grid,
  Store,
  UserCheck
} from 'lucide-react';

export default function Header() {
  const { 
    branches, 
    selectedBranch, 
    setSelectedBranch, 
    sidebarCollapsed,
    toggleSidebar,
    notifications, 
    setNotifDrawerOpen,
    setAiDrawerOpen,
    setScannerModalOpen,
    searchTerm,
    setSearchTerm,
    deferredSearchTerm,
    cart,
    user,
    currentView,
    setCurrentView,
    storeSettings,
    currencySymbol,
    showToast
  } = useApp();

  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { playClick, playBeep } = useSoundEffects();

  const searchInputId = useId();
  const [currentTime, setCurrentTime] = useState('');

  const unreadCount = notifications.filter(n => n.isNew).length;
  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-emerald-100 dark:border-slate-800 sticky top-0 z-30 shadow-md transition-colors duration-200">
      
      {/* Top Header Notice Bar */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white px-6 py-1.5 text-xs font-semibold flex items-center justify-between shadow-inner">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-[11px] text-emerald-200 font-extrabold uppercase tracking-wider">
            ⚡ {(storeSettings?.storeName || 'SmartMart Pro').toUpperCase()} • {t("expressDelivery").toUpperCase()}
          </span>
          <span className="hidden md:inline text-emerald-400">|</span>
          <span className="hidden md:flex items-center gap-1 text-slate-100 text-[11px]">
            <PhoneCall className="w-3.5 h-3.5 text-emerald-400" /> {t("helpline") || "Helpline"}: <strong>{storeSettings?.phone || '+91 98401 23456'}</strong>
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1 text-emerald-300 font-extrabold">
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t("Logged in") || "Logged in"}: <strong>{user?.name || 'Sarathi Kamal N'} ({t(user?.role || 'Guest')})</strong></span>
          </div>
          <span className="text-emerald-400">|</span>
          <div className="flex items-center gap-1.5 text-emerald-200 font-extrabold">
            <Wallet className="w-3.5 h-3.5 text-amber-400" />
            <span>{t("digitalWallet") || "Wallet"}: {currencySymbol || '₹'}{user?.walletBalance !== undefined ? user.walletBalance.toFixed(2) : '4,500.00'}</span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="px-6 py-3 flex items-center justify-between gap-4">
        
        {/* Branch Location Picker */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="text-slate-500 font-semibold">{t("Branch") || "Branch"}:</span>
            <select
              value={selectedBranch.id}
              onChange={(e) => {
                const b = branches.find(item => item.id === e.target.value);
                if (b) {
                  setSelectedBranch(b);
                  showToast({ title: 'Branch Switched 🏬', message: `Now viewing ${b.name}`, type: 'info', duration: 2500 });
                }
              }}
              className="bg-transparent focus:outline-none cursor-pointer font-black text-slate-900 dark:text-white text-xs"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold">
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Mega Search Bar */}
        <div className="flex-1 max-w-xl relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id={searchInputId}
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full pl-10 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
          />
          {searchTerm !== deferredSearchTerm && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-emerald-600 animate-pulse font-bold">
              SEARCHING...
            </span>
          )}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2">
          



          {/* Barcode Scanner */}
          <button
            onClick={() => { playBeep(); setScannerModalOpen(true); }}
            title="Scan SKU Barcode"
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          >
            <Scan className="w-4 h-4 text-emerald-600" />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={() => {
              playClick();
              toggleTheme();
              showToast({
                title: theme === 'dark' ? 'Light Theme Activated ☀️' : 'Dark Theme Activated 🌙',
                message: theme === 'dark' ? 'Switched to clean daytime mode' : 'Switched to sleek dark mode',
                type: 'info',
                duration: 2000
              });
            }}
            title={theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-bold">
            <Globe className="w-3.5 h-3.5 text-teal-600" />
            <select
              value={lang}
              onChange={(e) => {
                setLang(e.target.value);
                showToast({
                  title: `Language Changed 🌐`,
                  message: `Switched language to ${e.target.value.toUpperCase()}`,
                  type: 'info',
                  duration: 2000
                });
              }}
              className="bg-transparent focus:outline-none cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              <option value="en" className="bg-white dark:bg-slate-900">EN 🇬🇧</option>
              <option value="ta" className="bg-white dark:bg-slate-900">TA 🇮🇳</option>
              <option value="hi" className="bg-white dark:bg-slate-900">HI 🇮🇳</option>
              <option value="ml" className="bg-white dark:bg-slate-900">ML 🇮🇳</option>
              <option value="te" className="bg-white dark:bg-slate-900">TE 🇮🇳</option>
              <option value="kn" className="bg-white dark:bg-slate-900">KN 🇮🇳</option>
            </select>
          </div>

          {/* Recently Accessed Views Tracker */}
          <div className="relative group">
            <button
              title="Recently Accessed Views"
              className="p-2 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span className="hidden md:inline text-[10px] font-black uppercase">RECENT</span>
            </button>
            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-2 hidden group-hover:block z-50 animate-scale-up space-y-1">
              <div className="px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                Recently Visited
              </div>
              {[
                { name: 'Product Catalog', view: 'products', icon: '🛒' },
                { name: 'POS Billing', view: 'posBilling', icon: '⚡' },
                { name: 'Inventory', view: 'inventoryControl', icon: '📦' },
                { name: 'AI Demand Forecast', view: 'demandForecasting', icon: '🤖' },
                { name: 'Finance & GST', view: 'financialLedger', icon: '📊' },
                { name: 'Settings & API', view: 'settingsView', icon: '⚙️' }
              ].map((item) => (
                <button
                  key={item.view}
                  onClick={() => { playClick(); setCurrentView(item.view); }}
                  className="w-full text-left px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span>{item.icon}</span>
                  <span>{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notifications Bell */}
          <button
            onClick={() => { playClick(); setNotifDrawerOpen(true); }}
            className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors"
          >
            <Bell className="w-4 h-4 text-emerald-600" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Smart AI */}
          <button
            onClick={() => { playClick(); setAiDrawerOpen(true); }}
            className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white px-3 py-1.5 rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden md:inline">{t("Smart AI") || "Smart AI"}</span>
          </button>

          {/* Cart Basket */}
          <button
            onClick={() => { playClick(); setCurrentView('billing'); }}
            className="relative p-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white transition-colors shadow-md shadow-emerald-600/20 flex items-center gap-1.5 px-3"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="text-xs font-black hidden sm:inline">{t("BASKET") || "BASKET"}</span>
            {totalCartCount > 0 && (
              <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {totalCartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
