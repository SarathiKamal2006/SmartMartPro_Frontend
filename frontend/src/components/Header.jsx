import React, { useState, useEffect, useId, useRef, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { getProductImage } from '../data/productImages';
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
  UserCheck,
  X,
  ArrowRight,
  Check,
  ShoppingBag,
  ExternalLink
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
    products,
    addToCart,
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
  const { playClick, playBeep, playSuccess } = useSoundEffects();

  const searchInputId = useId();
  const searchContainerRef = useRef(null);
  const [currentTime, setCurrentTime] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [addedItemSku, setAddedItemSku] = useState(null);

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

  // Handle outside click & escape key to close search dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Instant real-time matching products from entire catalog
  const searchResults = useMemo(() => {
    const q = (deferredSearchTerm || '').trim().toLowerCase();
    if (!q) return [];

    return products.filter(p => {
      const name = (p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const sku = (p.sku || p.id || '').toLowerCase();
      const brand = (p.brand || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      const isCookie = (q.includes('cookie') || q.includes('biscuit') || q.includes('bisc')) && 
        (name.includes('cookie') || name.includes('biscuit') || cat.includes('cookie') || cat.includes('biscuit'));

      return name.includes(q) || cat.includes(q) || sku.includes(q) || brand.includes(q) || desc.includes(q) || isCookie;
    });
  }, [products, deferredSearchTerm]);

  const showSearchDropdown = isSearchFocused && searchTerm.trim().length > 0;

  const handleQuickAdd = (e, product) => {
    e.stopPropagation();
    addToCart(product);
    playSuccess();
    setAddedItemSku(product.sku || product.id);
    showToast({
      title: `${product.name} Added! 🛒`,
      message: `${currencySymbol || '₹'}${product.price} added to cart`,
      type: 'success',
      duration: 2000
    });
    setTimeout(() => setAddedItemSku(null), 1500);
  };

  const handleSelectProduct = (product) => {
    playClick();
    setIsSearchFocused(false);
    if (currentView !== 'customer-store' && currentView !== 'products') {
      setCurrentView('customer-store');
    }
  };

  const POPULAR_SEARCH_SUGGESTIONS = [
    { label: '🍪 Cookies & Biscuits', term: 'cookies' },
    { label: '🍫 Chocolates', term: 'chocolate' },
    { label: '🥛 Milk & Dairy', term: 'milk' },
    { label: '🌾 Basmati Rice', term: 'rice' },
    { label: '🍎 Fresh Fruits', term: 'fruits' },
    { label: '👶 Baby Care', term: 'baby' },
  ];

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

        {/* Mega Search Bar with Live Interactive Dropdown */}
        <div ref={searchContainerRef} className="flex-1 max-w-xl relative">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              id={searchInputId}
              type="text"
              value={searchTerm}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setIsSearchFocused(true);
              }}
              placeholder={t("searchPlaceholder") || "Search SmartMart Pro products, cookies, snacks, groceries..."}
              className="w-full pl-10 pr-16 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-semibold text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setIsSearchFocused(false);
                }}
                className="absolute right-10 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            {searchTerm !== deferredSearchTerm && (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-mono text-emerald-600 animate-pulse font-bold">
                ...
              </span>
            )}
          </div>

          {/* Live Search Results Dropdown Overlay */}
          {showSearchDropdown && (
            <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden animate-scale-up backdrop-blur-md">
              
              {/* Header result stats */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">
                    {searchResults.length > 0 ? (
                      <>Found <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{searchResults.length}</span> matching products</>
                    ) : (
                      <>No results found for "<span className="text-amber-600 dark:text-amber-400 font-bold">{searchTerm}</span>"</>
                    )}
                  </span>
                </div>
                <button
                  onClick={() => setIsSearchFocused(false)}
                  className="text-[11px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold flex items-center gap-1 cursor-pointer"
                >
                  <span>ESC to close</span>
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Product Match List */}
              {searchResults.length > 0 ? (
                <div className="max-h-96 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-2">
                  {searchResults.slice(0, 6).map((item) => {
                    const itemImg = getProductImage(item);
                    const isJustAdded = addedItemSku === (item.sku || item.id);
                    return (
                      <div
                        key={item.sku || item.id}
                        onClick={() => handleSelectProduct(item)}
                        className="p-2.5 rounded-2xl flex items-center justify-between gap-3 hover:bg-emerald-50/70 dark:hover:bg-slate-800/80 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                            <img
                              src={itemImg}
                              alt={item.name}
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                              onError={(e) => { e.currentTarget.src = "/dashboard_grocery_basket.png"; }}
                            />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs font-black text-slate-900 dark:text-white truncate group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                                {item.name}
                              </span>
                              {item.discount && (
                                <span className="bg-rose-100 text-rose-700 dark:bg-rose-950/80 dark:text-rose-400 text-[9px] font-black px-1.5 py-0.5 rounded-md">
                                  {item.discount}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 dark:text-slate-400 flex-wrap">
                              <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded font-bold text-slate-600 dark:text-slate-300">
                                {item.sku || item.id}
                              </span>
                              <span>•</span>
                              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                                {item.category}
                              </span>
                              <span>•</span>
                              <span className={`font-semibold ${item.stock > 0 ? 'text-slate-600 dark:text-slate-300' : 'text-rose-500 font-bold'}`}>
                                {item.stock > 0 ? `Stock: ${item.stock}` : 'Out of Stock'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-xs font-black text-slate-900 dark:text-white">
                              {currencySymbol || '₹'}{Number(item.price).toFixed(2)}
                            </div>
                            {item.originalPrice && item.originalPrice > item.price && (
                              <div className="text-[10px] text-slate-400 line-through">
                                {currencySymbol || '₹'}{Number(item.originalPrice).toFixed(2)}
                              </div>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={(e) => handleQuickAdd(e, item)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 transition-all cursor-pointer shadow-xs ${
                              isJustAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-emerald-700 hover:bg-emerald-600 text-white active:scale-95'
                            }`}
                          >
                            {isJustAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>+ Add</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Empty state with instant suggestion chips */
                <div className="p-6 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center mx-auto mb-3">
                    <Search className="w-6 h-6" />
                  </div>
                  <h4 className="text-xs font-black text-slate-800 dark:text-slate-200">
                    No matching products found
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 mb-4">
                    Try searching with different keywords, brand names or browse popular categories below:
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    {POPULAR_SEARCH_SUGGESTIONS.map(sugg => (
                      <button
                        key={sugg.term}
                        type="button"
                        onClick={() => {
                          playClick();
                          setSearchTerm(sugg.term);
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-100 dark:bg-slate-800 dark:hover:bg-emerald-950/60 text-slate-700 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300 text-[11px] font-bold transition-colors cursor-pointer"
                      >
                        {sugg.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Dropdown Quick Navigation Footer */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setIsSearchFocused(false);
                    setCurrentView('customer-store');
                  }}
                  className="font-extrabold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer text-xs"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>View All in Storefront ({searchResults.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setIsSearchFocused(false);
                    setCurrentView('products');
                  }}
                  className="font-bold text-slate-600 dark:text-slate-400 hover:text-emerald-600 flex items-center gap-1 cursor-pointer text-xs"
                >
                  <Grid className="w-3.5 h-3.5" />
                  <span>Open Catalog</span>
                </button>
              </div>

            </div>
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
