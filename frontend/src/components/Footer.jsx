import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { useToast } from '../context/ToastContext';
import PolicyModal from './PolicyModal';
import AppDownloadModal from './AppDownloadModal';
import BranchDirectoryModal from './BranchDirectoryModal';
import { 
  Headphones, 
  Mail, 
  MapPin, 
  Building2, 
  ChevronRight, 
  Copy, 
  Check, 
  Store, 
  Sparkles,
  ExternalLink,
  PhoneCall
} from 'lucide-react';

export default function Footer() {
  const { 
    selectedBranch, 
    branches, 
    setSelectedBranch, 
    setCurrentView, 
    setSearchTerm,
    user 
  } = useApp();
  
  const { playClick, playSuccess } = useSoundEffects();
  const { showToast } = useToast();

  // Modals state
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [initialPolicyTab, setInitialPolicyTab] = useState('privacy');
  const [appDownloadModalOpen, setAppDownloadModalOpen] = useState(false);
  const [branchDirectoryModalOpen, setBranchDirectoryModalOpen] = useState(false);

  // Copy feedback state
  const [copiedField, setCopiedField] = useState(null);

  // Active branch details (defaulting gracefully to Chromepet / BR-01)
  const branch = selectedBranch || branches[0] || {
    id: "BR-01",
    name: "Chennai Central Superstore (Chromepet)",
    city: "Chennai, Tamil Nadu",
    address: "407/7, G.S.T Road, Zamin Pallavaram, Chromepet, Chengalpattu, Tamil Nadu - 600044",
    phone: "7305393222 / 04443666333",
    email: "supermarket.chr@pothys.com"
  };

  const categories = [
    'Fruits & Vegetables',
    'Staples',
    'Snacks & Namkeens',
    'Beverages',
    'Chilled & Dairy Foods',
    'Ready To Cook',
    'Ready To Eat',
    'Baby Care',
    'Household Essentials',
    'Cleaning Needs',
    'Feminine Care',
    'Health Care',
    'Personal Care',
    'Stationaries',
    'Skin Care',
    'Oral Care',
    'Men',
    'Creams & Lotions',
    'Crockeries'
  ];

  const handleCategoryClick = (catName) => {
    playClick();
    if (user?.role === 'Customer') {
      setCurrentView('customerStorefront');
    } else {
      setCurrentView('products');
    }
    setSearchTerm(catName);
    
    // Scroll container to top
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    showToast({
      title: `Filtering: ${catName} 🛒`,
      message: `Showing products for ${catName}`,
      type: 'info'
    });
  };

  const handleLinkClick = (linkType) => {
    playClick();
    const mainEl = document.querySelector('main');
    if (mainEl) mainEl.scrollTo({ top: 0, behavior: 'smooth' });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (linkType === 'Home') {
      setCurrentView(user?.role === 'Customer' ? 'customerStorefront' : 'dashboard');
      setSearchTerm('');
    } else if (linkType === 'Deals') {
      setCurrentView('products');
      setSearchTerm('Deals');
      showToast({ title: 'Special Deals & Offers 🔥', message: 'Showing discounted supermarket deals', type: 'info' });
    } else if (linkType === 'New Arrivals') {
      setCurrentView('products');
      setSearchTerm('New');
      showToast({ title: 'Fresh New Arrivals ✨', message: 'Showing latest stocked supermarket arrivals', type: 'info' });
    }
  };

  const openPolicy = (tabId) => {
    playClick();
    setInitialPolicyTab(tabId);
    setPolicyModalOpen(true);
  };

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    playSuccess();
    setCopiedField(fieldName);
    showToast({
      title: `${fieldName} Copied! 📋`,
      message: text,
      type: 'success'
    });
    setTimeout(() => setCopiedField(null), 2500);
  };

  return (
    <>
      <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 pt-8 pb-6 px-6 sm:px-10 transition-colors duration-300 mt-12 shadow-sm">
        
        {/* Branch Switcher Quick Bar */}
        <div className="max-w-7xl mx-auto mb-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Store className="w-3.5 h-3.5 text-red-600" /> Select Branch Location:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {branches.map((b) => {
                const isActive = selectedBranch?.id === b.id;
                return (
                  <button
                    key={b.id}
                    onClick={() => {
                      playClick();
                      setSelectedBranch(b);
                      showToast({
                        title: 'Branch Switched',
                        message: `Active branch updated to ${b.name}`,
                        type: 'info'
                      });
                    }}
                    className={`px-2.5 py-1 rounded-full font-extrabold text-[11px] transition-all flex items-center gap-1 ${
                      isActive
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    <span>{b.shortName || b.city.split(',')[0]}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => { playClick(); setBranchDirectoryModalOpen(true); }}
            className="text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
          >
            <span>View All 4 Branch Superstore Addresses</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Main 3-Column Footer Layout (Exact Reference Match) */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          
          {/* ═════════ COLUMN 1 (Left): Brand, Address, Policies ═════════ */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* Authentic Pothys Mart Red Emblem Lockup */}
              <div className="flex items-center gap-3">
                <div className="inline-flex flex-col items-center select-none group cursor-pointer" onClick={() => handleLinkClick('Home')}>
                  {/* Outer Red Border Box */}
                  <div className="px-3.5 py-1 rounded-xl border-2 border-red-600 bg-red-600 shadow-sm flex items-center justify-center transition-transform group-hover:scale-105">
                    <span className="text-white font-black text-lg sm:text-xl tracking-wider uppercase font-sans">
                      POTHYS
                    </span>
                  </div>
                  {/* Red MART Text below */}
                  <div className="text-red-600 font-black text-sm tracking-[0.25em] uppercase font-sans mt-0.5">
                    MART
                  </div>
                </div>

                <div className="h-9 w-[1px] bg-slate-200 dark:bg-slate-800" />

                <div className="flex flex-col leading-none">
                  <span className="text-[11px] font-black tracking-wider uppercase text-slate-400">
                    SmartMart Pro ERP
                  </span>
                  <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    ● {branch.shortName || 'Chromepet Main'}
                  </span>
                </div>
              </div>

              {/* Dynamic Branch Address (Authentic Format from Screenshot) */}
              <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed max-w-sm">
                <p>{branch.address || "407/7, G.S.T Road, Zamin Pallavaram, Chromepet,"}</p>
                {branch.landmark && (
                  <p className="text-[11px] text-slate-400 mt-1 italic">
                    {branch.landmark}
                  </p>
                )}
              </div>
            </div>

            {/* Bottom Left: Policy Links & Copyright */}
            <div className="space-y-1.5 pt-2">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                <button 
                  onClick={() => openPolicy('privacy')}
                  className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  Privacy Policy
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button 
                  onClick={() => openPolicy('refund')}
                  className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  Refund Policy
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button 
                  onClick={() => openPolicy('shipping')}
                  className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  Shipping Policy
                </button>
                <span className="text-slate-300 dark:text-slate-700">|</span>
                <button 
                  onClick={() => openPolicy('terms')}
                  className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  Terms and Condition
                </button>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-slate-500 font-normal">
                Copyright © 2026 Pothys Mart. All Right Reserved
              </div>
            </div>
          </div>

          {/* ═════════ COLUMN 2 (Middle): Need Help, Phone, Email ═════════ */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
              Need Help
            </h4>

            {/* Phone contact with green headset icon */}
            <div className="flex items-center gap-3 pt-1">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  {branch.phone ? (
                    <div className="flex flex-wrap items-center gap-1">
                      {branch.phone.split('/').map((num, idx) => {
                        const trimmed = num.trim();
                        return (
                          <React.Fragment key={idx}>
                            {idx > 0 && <span className="text-slate-400 font-normal">/</span>}
                            <a 
                              href={`tel:${trimmed.replace(/\s+/g, '')}`}
                              className="hover:text-emerald-600 transition-colors"
                            >
                              {trimmed}
                            </a>
                          </React.Fragment>
                        );
                      })}
                    </div>
                  ) : (
                    <span>7305393222 / 04443666333</span>
                  )}
                </div>
                <button
                  onClick={() => copyToClipboard(branch.phone || '7305393222 / 04443666333', 'Phone Numbers')}
                  className="text-slate-400 hover:text-emerald-600 transition-colors p-1"
                  title="Copy Phone Numbers"
                >
                  {copiedField === 'Phone Numbers' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Subtle Divider Line */}
            <div className="h-[1px] w-full bg-slate-200/80 dark:bg-slate-800" />

            {/* Email contact with mail icon */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex items-center gap-2">
                <a 
                  href={`mailto:${branch.email || 'supermarket.chr@pothys.com'}`}
                  className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  {branch.email || 'supermarket.chr@pothys.com'}
                </a>
                <button
                  onClick={() => copyToClipboard(branch.email || 'supermarket.chr@pothys.com', 'Email Address')}
                  className="text-slate-400 hover:text-red-600 transition-colors p-1"
                  title="Copy Email Address"
                >
                  {copiedField === 'Email Address' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Store Hours Tag */}
            <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              <span>🕒 Store Timings: <strong>{branch.timings || '7:00 AM – 11:00 PM'}</strong> (Daily)</span>
            </div>
          </div>

          {/* ═════════ COLUMN 3 (Right): Categories, Links, App Badges ═════════ */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* Categories Section */}
            <div className="space-y-1.5">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                Categories
              </h4>
              <div className="text-[11px] sm:text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-normal flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                {categories.map((cat, idx) => (
                  <React.Fragment key={cat}>
                    <button
                      onClick={() => handleCategoryClick(cat)}
                      className="hover:text-red-600 dark:hover:text-red-400 hover:underline transition-colors text-left"
                    >
                      {cat}
                    </button>
                    {idx < categories.length - 1 && (
                      <span className="text-slate-300 dark:text-slate-700 select-none">|</span>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Quick Links Section */}
            <div className="space-y-1.5 pt-1">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                Links
              </h4>
              <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 dark:text-slate-300">
                <button
                  onClick={() => handleLinkClick('Home')}
                  className="hover:text-red-600 dark:hover:text-red-400 hover:underline transition-colors"
                >
                  Home
                </button>
                <button
                  onClick={() => handleLinkClick('Deals')}
                  className="hover:text-red-600 dark:hover:text-red-400 hover:underline transition-colors"
                >
                  Deals
                </button>
                <button
                  onClick={() => handleLinkClick('New Arrivals')}
                  className="hover:text-red-600 dark:hover:text-red-400 hover:underline transition-colors"
                >
                  New Arrivals
                </button>
              </div>
            </div>

            {/* Download Our App Section */}
            <div className="space-y-2 pt-2">
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white tracking-tight">
                Download Our App
              </h4>
              
              <div className="flex flex-wrap items-center gap-3">
                
                {/* Google Play Store Badge (Exact Visual Match) */}
                <button
                  onClick={() => { playClick(); setAppDownloadModalOpen(true); }}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-black text-white hover:bg-slate-800 transition-transform active:scale-95 shadow-sm border border-slate-700"
                  title="Download on Google Play"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                    <path d="M3.609 1.814L13.792 12 3.61 22.186c-.352-.334-.56-.807-.56-1.336V3.15c0-.529.208-1.002.56-1.336z" fill="#00C1A6"/>
                    <path d="M17.158 8.634l-3.366 3.366 3.366 3.366 3.821-2.184c1.09-.623 1.09-1.725 0-2.348l-3.821-2.2z" fill="#FFD400"/>
                    <path d="M13.792 12L3.61 1.814C3.89 1.547 4.293 1.4 4.74 1.656l12.418 7.098-3.366 3.246z" fill="#0080FF"/>
                    <path d="M13.792 12l3.366 3.366L4.74 22.464c-.447.256-.85.109-1.13-.158L13.792 12z" fill="#FF3333"/>
                  </svg>
                  <div className="text-left leading-tight">
                    <div className="text-[7.5px] uppercase tracking-wider text-slate-300 font-semibold">GET IT ON</div>
                    <div className="text-[11px] font-black text-white">Google Play</div>
                  </div>
                </button>

                {/* Apple App Store Badge (Exact Visual Match) */}
                <button
                  onClick={() => { playClick(); setAppDownloadModalOpen(true); }}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-black text-white hover:bg-slate-800 transition-transform active:scale-95 shadow-sm border border-slate-700"
                  title="Download on Apple App Store"
                >
                  <svg className="w-4 h-4 shrink-0 fill-white" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.07 1.71-.93 2.73 1 .08 2.02-.48 2.64-1.23z"/>
                  </svg>
                  <div className="text-left leading-tight">
                    <div className="text-[7.5px] uppercase tracking-wider text-slate-300 font-semibold">Download on the</div>
                    <div className="text-[11px] font-black text-white">App Store</div>
                  </div>
                </button>

              </div>
            </div>

          </div>

        </div>
      </footer>

      {/* Global Modals for Footer */}
      <PolicyModal 
        isOpen={policyModalOpen}
        onClose={() => setPolicyModalOpen(false)}
        initialTab={initialPolicyTab}
      />

      <AppDownloadModal 
        isOpen={appDownloadModalOpen}
        onClose={() => setAppDownloadModalOpen(false)}
      />

      <BranchDirectoryModal 
        isOpen={branchDirectoryModalOpen}
        onClose={() => setBranchDirectoryModalOpen(false)}
      />
    </>
  );
}
