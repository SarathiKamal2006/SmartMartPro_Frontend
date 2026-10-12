import React, { useState, useEffect, useDeferredValue } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { CATEGORIES } from '../data/mockData';
import { getProductImage } from '../data/productImages';
import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import ProductFilters from '../components/ProductFilters';
import LiveDeliveryTrackingModal from '../components/LiveDeliveryTrackingModal';
import Logo from '../components/Logo';
import { 
  ShoppingBag, 
  Search, 
  Star, 
  Heart, 
  Sparkles, 
  Wallet, 
  Tag, 
  CheckCircle2, 
  Plus, 
  Minus, 
  ShieldCheck, 
  PhoneCall, 
  Clock, 
  ShoppingCart, 
  Filter, 
  SlidersHorizontal, 
  Store, 
  Layers, 
  Truck,
  Navigation,
  MapPin,
  KeyRound,
  Send,
  Building,
  Home,
  LocateFixed,
  Briefcase,
  Zap,
  Bike,
  AlertCircle
} from 'lucide-react';
import { startRazorpayPayment } from '../services/paymentService';

const STOREFRONT_CATEGORIES = [
  { id: 'cat-all', name: 'All Categories', image: '/dashboard_grocery_basket.png' },
  { id: 'cat-cookies', name: 'Cookies & Biscuits', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat-produce', name: 'Fruits & Vegetables', image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat-staples', name: 'Staples', image: '/categories/cat_staples.png' },
  { id: 'cat-snacks', name: 'Snacks & Namkeens', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat-bev', name: 'Beverages', image: 'https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat-dairy', name: 'Chilled & Dairy Foods', image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat-rtc', name: 'Ready To Cook', image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat-rte', name: 'Ready To Eat', image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat-baby', name: 'Baby Care', image: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=400&q=80' },
  { id: 'cat-cleaning', name: 'Cleaning Needs', image: '/categories/cat_cleaning_needs.png' },
  { id: 'cat-household', name: 'Household Essentials', image: '/categories/cat_household_essentials.png' },
  { id: 'cat-personal', name: 'Personal Care', image: '/categories/cat_personal_care.png' },
  { id: 'cat-health', name: 'Health Care', image: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?auto=format&fit=crop&w=400&q=80' },
];

export default function CustomerStorefrontView() {
  const { 
    products, 
    cart, 
    addToCart, 
    updateCartQuantity, 
    user, 
    cartTotals, 
    completeOnlineCheckout, 
    deliveries, 
    submitReview,
    setRazorpayModalOpen,
    setRazorpayOrderDetails,
    searchTerm,
    setSearchTerm,
    deferredSearchTerm,
    showToast
  } = useApp();
  const { t } = useLanguage();
  const { playSuccess, playClick } = useSoundEffects();

  const [activeSubTab, setActiveSubTab] = useState('shop'); // 'shop' | 'cart' | 'orders'
  const [selectedCat, setSelectedCat] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState(searchTerm || '');
  const deferredSearch = useDeferredValue(searchQuery);

  // Sync internal search query with global header search term
  useEffect(() => {
    if (searchTerm !== undefined && searchTerm !== searchQuery) {
      setSearchQuery(searchTerm);
    }
  }, [searchTerm]);

  const [wishlist, setWishlist] = useState(['PRD-284']);

  // Filters & Sorting state
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [stockStatus, setStockStatus] = useState('');
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [sortBy, setSortBy] = useState('relevance');
  const [showFilterSidebar, setShowFilterSidebar] = useState(false);
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);

  // Live GPS tracking modal state
  const [activeTrackingDelivery, setActiveTrackingDelivery] = useState(null);

  // Detailed Customer Checkout Form State
  const [checkoutName, setCheckoutName] = useState(user?.name || 'Ananya Sundaram');
  const [checkoutPhone, setCheckoutPhone] = useState(user?.phone || '+91 98401 23456');
  const [checkoutEmail, setCheckoutEmail] = useState(user?.email || 'ananya.s@gmail.com');
  const [checkoutFlat, setCheckoutFlat] = useState('Flat 4B, Emerald Heights');
  const [checkoutStreet, setCheckoutStreet] = useState('14 Anna Salai, Panagal Park Road');
  const [checkoutArea, setCheckoutArea] = useState('T. Nagar');
  const [checkoutCity, setCheckoutCity] = useState('Chennai');
  const [checkoutPincode, setCheckoutPincode] = useState('600017');
  const [checkoutBranch, setCheckoutBranch] = useState('SmartMart Pro Central (Main)');
  const [checkoutNotes, setCheckoutNotes] = useState('Please ring bell on arrival');
  const [paymentMode, setPaymentMode] = useState('wallet');
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);
  const [selectedAddressType, setSelectedAddressType] = useState('home'); // 'home' | 'office' | 'custom'
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Auto-sync customer profile data & memory on load (Method 3)
  useEffect(() => {
    try {
      const saved = localStorage.getItem('smartmart_saved_customer_address');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.customerName) setCheckoutName(parsed.customerName);
        if (parsed.customerPhone) setCheckoutPhone(parsed.customerPhone);
        if (parsed.customerEmail) setCheckoutEmail(parsed.customerEmail);
        if (parsed.branch) setCheckoutBranch(parsed.branch);
        if (parsed.deliveryNotes) setCheckoutNotes(parsed.deliveryNotes);
      }
    } catch (e) {}

    if (user) {
      if (user.name) setCheckoutName(user.name);
      if (user.phone) setCheckoutPhone(user.phone);
      if (user.email) setCheckoutEmail(user.email);
      if (user.address) {
        setCheckoutStreet(user.address);
      }
    }
  }, [user]);

  // 📍 1-Click Auto-Detect Current GPS Location for New Customer
  const handleAutoDetectLocation = () => {
    playClick();
    setIsDetectingGps(true);
    if ('geolocation' in navigator) {
      showToast(t("Detecting current GPS location..."), "info");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsDetectingGps(false);
          setCheckoutCity('Chennai');
          setCheckoutArea('T. Nagar Central');
          setCheckoutPincode('600017');
          setCheckoutBranch('SmartMart Pro Central (Main)');
          showToast(t("📍 GPS Location detected & address filled!"), "success");
        },
        (error) => {
          setIsDetectingGps(false);
          setCheckoutCity('Chennai');
          setCheckoutArea('T. Nagar');
          setCheckoutPincode('600017');
          showToast(t("📍 Location set to Chennai Central (T. Nagar)"), "info");
        },
        { timeout: 4000 }
      );
    } else {
      setIsDetectingGps(false);
      setCheckoutCity('Chennai');
      setCheckoutArea('T. Nagar');
      showToast(t("📍 Location set to Chennai Central"), "info");
    }
  };

  // 🏠 Address Preset Switcher (Home / Office / New Custom)
  const handleSelectPresetAddress = (type) => {
    playClick();
    setSelectedAddressType(type);
    if (type === 'home') {
      setCheckoutFlat('Flat 4B, Emerald Heights');
      setCheckoutStreet('14 Anna Salai, Panagal Park Road');
      setCheckoutArea('T. Nagar');
      setCheckoutCity('Chennai');
      setCheckoutPincode('600017');
      setCheckoutBranch('SmartMart Pro Central (Main)');
      showToast(t("Switched to Home Address 🏠"), "info");
    } else if (type === 'office') {
      setCheckoutFlat('Floor 6, Tower B');
      setCheckoutStreet('Ascendas IT Tech Park, CSIR Road');
      setCheckoutArea('Taramani / Velachery');
      setCheckoutCity('Chennai');
      setCheckoutPincode('600113');
      setCheckoutBranch('SmartMart Velachery Express');
      showToast(t("Switched to Work / Office Address 🏢"), "info");
    } else {
      setCheckoutFlat('');
      setCheckoutStreet('');
      setCheckoutArea('');
      setCheckoutCity('Chennai');
      setCheckoutPincode('');
      showToast(t("Enter your new custom delivery address 📍"), "info");
    }
  };

  const toggleWishlist = (id) => {
    playClick();
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(x => x !== id));
      showToast(t("Removed from Wishlist"), "info");
    } else {
      setWishlist([...wishlist, id]);
      showToast(t("Added to Wishlist"), "success");
    }
  };

  const resetFilters = () => {
    setSelectedBrand('');
    setPriceRange([0, 2000]);
    setStockStatus('');
    setOnlyDiscount(false);
    setSortBy('relevance');
    setSearchQuery('');
  };

  const matchesCategory = (prodCategory, targetCat) => {
    if (!targetCat || targetCat === 'All Categories' || targetCat === 'All' || targetCat === 'cat-all') return true;
    if (!prodCategory) return false;
    const pCat = prodCategory.toLowerCase();
    const tCat = targetCat.toLowerCase();
    if (pCat === tCat) return true;

    if (tCat.includes('staple')) {
      return pCat.includes('staple') || pCat.includes('rice') || pCat.includes('grain') || pCat.includes('flour') || 
             pCat.includes('atta') || pCat.includes('dal') || pCat.includes('pulse') || 
             pCat.includes('oil') || pCat.includes('spice') || pCat.includes('masala');
    }

    if (tCat.includes('cookie') || tCat.includes('biscuit')) {
      return pCat.includes('cookie') || pCat.includes('biscuit') || pCat.includes('snack') || pCat.includes('bakery');
    }

    if (tCat.includes('snack')) {
      return pCat.includes('snack') || pCat.includes('biscuit') || pCat.includes('cookie') || pCat.includes('namkeen') || 
             pCat.includes('chip') || pCat.includes('noodle') || pCat.includes('chocolate') || pCat.includes('candy');
    }

    if (tCat.includes('bev')) {
      return pCat.includes('bev') || pCat.includes('juice') || pCat.includes('drink') || 
             pCat.includes('tea') || pCat.includes('coffee') || pCat.includes('water');
    }

    if (tCat.includes('dairy') || tCat.includes('chilled')) {
      return pCat.includes('dairy') || pCat.includes('milk') || pCat.includes('cheese') || 
             pCat.includes('paneer') || pCat.includes('butter') || pCat.includes('ghee') || pCat.includes('curd');
    }

    if (tCat.includes('fruit') || tCat.includes('veg')) {
      return pCat.includes('fruit') || pCat.includes('veg') || pCat.includes('produce') || pCat.includes('fresh');
    }

    if (tCat.includes('clean')) {
      return pCat.includes('clean') || pCat.includes('wash') || pCat.includes('detergent') || 
             pCat.includes('soap') || pCat.includes('harpic') || pCat.includes('surf') || pCat.includes('vim');
    }

    if (tCat.includes('household')) {
      return pCat.includes('house') || pCat.includes('home') || pCat.includes('pooja') || pCat.includes('freshener');
    }

    if (tCat.includes('baby')) {
      return pCat.includes('baby') || pCat.includes('infant') || pCat.includes('diaper');
    }

    return pCat.includes(tCat) || tCat.includes(pCat);
  };

  const filteredProducts = products.filter(p => {
    const effectiveQ = (deferredSearch || deferredSearchTerm || '').trim().toLowerCase();
    if (effectiveQ) {
      const matchesName = (p.name || '').toLowerCase().includes(effectiveQ);
      const matchesCat = (p.category || '').toLowerCase().includes(effectiveQ);
      const matchesBrand = (p.brand || '').toLowerCase().includes(effectiveQ);
      const matchesSku = (p.sku || '').toLowerCase().includes(effectiveQ);
      const matchesDesc = (p.description || '').toLowerCase().includes(effectiveQ);
      const matchesSupplier = (p.supplier || '').toLowerCase().includes(effectiveQ);
      const isCookieTerm = (effectiveQ.includes('cookie') || effectiveQ.includes('biscuit') || effectiveQ.includes('bisc')) && 
        ((p.name || '').toLowerCase().includes('cookie') || (p.name || '').toLowerCase().includes('biscuit') || (p.category || '').toLowerCase().includes('cookie') || (p.category || '').toLowerCase().includes('biscuit'));
      if (!matchesName && !matchesCat && !matchesBrand && !matchesSku && !matchesDesc && !matchesSupplier && !isCookieTerm) return false;
    }

    if (selectedCat && selectedCat !== 'All Categories' && selectedCat !== 'cat-all') {
      if (!matchesCategory(p.category, selectedCat)) return false;
    }

    if (selectedBrand) {
      if (!p.brand || !p.brand.toLowerCase().includes(selectedBrand.toLowerCase())) return false;
    }

    if (p.price < priceRange[0] || p.price > priceRange[1]) return false;

    if (stockStatus) {
      if (stockStatus === 'In Stock' && p.stock <= 0) return false;
      if (stockStatus === 'Out of Stock' && p.stock > 0) return false;
    }

    if (onlyDiscount && (!p.discountPercentage || p.discountPercentage <= 0) && !p.discount) return false;

    return true;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsProcessingCheckout(true);

    const fullAddress = `${checkoutFlat}, ${checkoutStreet}, ${checkoutArea}, ${checkoutCity} - ${checkoutPincode}`;

    if (paymentMode === 'razorpay') {
      try {
        await startRazorpayPayment({
          amount: cartTotals.grandTotal,
          customer: {
            name: checkoutName,
            email: checkoutEmail,
            phone: checkoutPhone
          },
          description: `SmartMart Pro Online Grocery Order (${cart.length} items)`,
          onSuccess: async (paymentDetails) => {
            const order = await completeOnlineCheckout({
              customerName: checkoutName,
              customerPhone: checkoutPhone,
              customerEmail: checkoutEmail,
              customerAddress: fullAddress,
              selectedBranch: checkoutBranch,
              deliveryNotes: checkoutNotes,
              paymentMethod: 'Razorpay (Online Verified)',
              paymentId: paymentDetails?.paymentId,
              orderId: paymentDetails?.orderId
            });
            playSuccess();
            setCheckoutSuccess(order);
            setActiveSubTab('orders');
            if (order) {
              setActiveTrackingDelivery(order);
            }
            setIsProcessingCheckout(false);
          },
          onError: async (err) => {
            console.warn('Razorpay live SDK not configured with live merchant key, using in-app gateway:', err);
            setRazorpayOrderDetails({
              amount: cartTotals.grandTotal,
              customer: {
                name: checkoutName,
                email: checkoutEmail,
                phone: checkoutPhone
              },
              orderId: `order_online_${Date.now()}`
            });
            setRazorpayModalOpen(true);
            setIsProcessingCheckout(false);
          },
          onDismiss: () => {
            setIsProcessingCheckout(false);
          }
        });
      } catch (err) {
        console.error('Payment launch error:', err);
        setRazorpayOrderDetails({
          amount: cartTotals.grandTotal,
          customer: {
            name: checkoutName,
            email: checkoutEmail,
            phone: checkoutPhone
          },
          orderId: `order_online_${Date.now()}`
        });
        setRazorpayModalOpen(true);
        setIsProcessingCheckout(false);
      }
      return;
    }

    try {
      const order = await completeOnlineCheckout({
        customerName: checkoutName,
        customerPhone: checkoutPhone,
        customerEmail: checkoutEmail,
        customerAddress: fullAddress,
        selectedBranch: checkoutBranch,
        deliveryNotes: checkoutNotes,
        paymentMethod: paymentMode
      });
      playSuccess();
      setCheckoutSuccess(order);
      setActiveSubTab('orders');
      if (order) {
        setActiveTrackingDelivery(order);
      }
    } catch (err) {
      alert("Payment failed: " + err.message);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const activeDeliveriesList = deliveries.filter(d => d.status !== 'Delivered');

  return (
    <div className="space-y-8 font-sans">
      
      {/* ─── Active Delivery Floating Quick-Tracker Banner ─────────────── */}
      {activeDeliveriesList.length > 0 && (
        <div 
          onClick={() => { playClick(); setActiveTrackingDelivery(activeDeliveriesList[0]); }}
          className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border border-emerald-500/40 p-4 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-3 cursor-pointer hover:border-emerald-400 transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Navigation className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-white">Active Order in Transit:</span>
                <span className="font-mono text-xs font-extrabold text-emerald-400">{activeDeliveriesList[0].orderId || activeDeliveriesList[0].id}</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold animate-pulse">
                  10-MIN FLASH
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                Partner <strong>{activeDeliveriesList[0].driver || 'Amira Patel'}</strong> is en route to <strong>{activeDeliveriesList[0].address || activeDeliveriesList[0].deliveryAddress}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right text-xs">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Security Handover OTP</span>
              <span className="font-mono font-black text-emerald-400 text-sm tracking-wider">{activeDeliveriesList[0].otp || activeDeliveriesList[0].deliveryOtp}</span>
            </div>
            <button
              type="button"
              className="px-4 py-2 bg-emerald-600 group-hover:bg-emerald-500 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
            >
              <Navigation className="w-3.5 h-3.5" />
              <span>LIVE GPS TRACKING</span>
            </button>
          </div>
        </div>
      )}

      {/* ─── SmartMart Pro Official Hero Banner ──────────────────────────── */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-emerald-500/30">
        <div className="space-y-3 relative z-10 max-w-xl">
          <div className="flex items-center gap-3">
            <Logo size="sm" showText={false} />
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider shadow-md">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span>{t("Online Customer Storefront")}</span>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
            {t("customerStorefront")} <span className="text-emerald-300 underline decoration-emerald-400 decoration-wavy">20% OFF</span>
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed">
            {t("Fresh organic produce, dairy, bakery, beverages & pantry items delivered straight to your home in 10 minutes.")}
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-black bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-white/20">
              <Wallet className="w-4 h-4 text-emerald-300" />
              <span>{t("digitalWallet")}: <strong>₹{user?.walletBalance !== undefined ? user.walletBalance.toFixed(2) : '4,500.00'}</strong></span>
            </div>
            <div className="flex items-center gap-2 text-xs font-black bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-2xl border border-white/20">
              <Tag className="w-4 h-4 text-amber-300" />
              <span>{t("Coupon") || "Coupon"}: <strong className="text-amber-300">FRESH10 (₹10.00 Off)</strong></span>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-2 gap-3 relative z-10 w-full md:w-auto shrink-0 text-xs font-bold text-slate-100">
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-emerald-300" />
            <div>
              <span className="block text-[10px] text-emerald-200">EXPRESS SPEED</span>
              <span>{t("expressDelivery")}</span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20 flex items-center gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
            <div>
              <span className="block text-[10px] text-emerald-200">QUALITY CHECK</span>
              <span>100% Organic</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Storefront Sub-Tabs ─────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => { playClick(); setActiveSubTab('shop'); }}
            className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'shop'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t("Products")} ({filteredProducts.length})</span>
          </button>

          <button
            onClick={() => { playClick(); setActiveSubTab('cart'); }}
            className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all relative cursor-pointer ${
              activeSubTab === 'cart'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{t("Shopping Basket")}</span>
            {cart.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center animate-bounce">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>

          <button
            onClick={() => { playClick(); setActiveSubTab('orders'); }}
            className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'orders'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t("My Orders")}</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search groceries, milk, tea..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
          />
        </div>
      </div>

      {/* ─── TAB 1: SHOP PRODUCTS (FIG 8.9.1 OMNICHANNEL STOREFRONT) ─────── */}
      {activeSubTab === 'shop' && (
        <div className="space-y-6">
          {/* Fig 8.9.1 Free Delivery Promo Banner */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 text-white p-4 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 border border-emerald-400/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white shrink-0">
                <Truck className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-300/20 text-emerald-100 text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded border border-emerald-300/30">
                    FIG 8.9.1 SPECIFICATION
                  </span>
                  <span className="font-black text-sm text-white">
                    🎉 Free Express Delivery on Orders Over ₹199
                  </span>
                </div>
                <p className="text-[11px] text-emerald-100 font-medium">
                  Use Promo Code: <strong className="text-white underline">FREEDEL</strong> · 10-Minute Hyperlocal Delivery Guarantee.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[10px] font-mono font-black bg-white/15 px-3 py-1.5 rounded-xl border border-white/20">
                ⚡ 10-MIN RAPID DISPATCH
              </span>
            </div>
          </div>

          {/* Category Pills Bar */}
          <div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {STOREFRONT_CATEGORIES.map((c) => {
                const isSelected = selectedCat === c.name;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      playClick();
                      setSelectedCat(c.name);
                    }}
                    className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-900 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <span>{c.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Omnichannel 2-Column Grid: Products Grid (Left) + Cart & Track Map (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column: Product Cards */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Showing {filteredProducts.length} Supermarket Items in "{selectedCat}"
                </span>
                <span className="text-[11px] text-slate-400 font-bold">
                  Click "+ ADD" to update real-time cart
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.map((p) => (
                  <ProductCard
                    key={p.id || p.sku}
                    product={p}
                    onOpenDetails={(item) => setSelectedProductDetails(item)}
                    wishlist={wishlist}
                    toggleWishlist={toggleWishlist}
                  />
                ))}
              </div>
            </div>

            {/* Right Column: Persistent Cart Panel & Track Your Order Map (Fig 8.9.1) */}
            <div className="lg:col-span-4 space-y-5 sticky top-4">
              
              {/* 1. Real-Time Cart Panel (FIG 8.9.3 SPECIFICATION) */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-black text-sm text-slate-900 dark:text-white">Shopping Cart Panel</h3>
                        <span className="text-[9px] font-black bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-md border border-emerald-500/30">
                          Fig 8.9.3
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-semibold">{cart.length} unique line items</p>
                    </div>
                  </div>
                  {cart.length > 0 && (
                    <span className="text-[10px] font-black font-mono bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-full">
                      {cart.reduce((s, i) => s + i.quantity, 0)} Items
                    </span>
                  )}
                </div>

                {cart.length === 0 ? (
                  <div className="py-6 text-center text-slate-400 space-y-2">
                    <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-700" />
                    <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Your basket is empty</p>
                    <p className="text-[10px] text-slate-400">Add products from the catalog to start checkout.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Item list with quantity controls and price */}
                    <div className="max-h-56 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 pr-1 space-y-2">
                      {cart.map((item) => (
                        <div key={item.product.id || item.product.sku} className="pt-2 flex items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <img 
                              src={getProductImage(item.product)} 
                              alt={item.product.name} 
                              className="w-8 h-8 rounded-lg object-contain bg-slate-50 p-0.5 border shrink-0" 
                              onError={(e) => { e.currentTarget.src = '/products/veg_potato.png'; }}
                            />
                            <div className="min-w-0">
                              <p className="font-extrabold text-slate-900 dark:text-white text-xs truncate">{item.product.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">₹{item.product.price.toFixed(2)} each</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => { playClick(); updateCartQuantity(item.product.id || item.product.sku, -1); }}
                              className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer text-xs font-bold"
                            >
                              -
                            </button>
                            <span className="font-black text-xs w-4 text-center">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => { playClick(); updateCartQuantity(item.product.id || item.product.sku, 1); }}
                              className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer text-xs font-bold"
                            >
                              +
                            </button>
                            <span className="font-black text-xs text-emerald-600 ml-1 font-mono">
                              ₹{(item.product.price * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Financial Summary: Subtotal & GST (18%) */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl space-y-1 text-xs border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between text-slate-500 font-semibold">
                        <span>Subtotal</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">₹{cartTotals.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 font-semibold">
                        <span>GST Tax (18%)</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">₹{cartTotals.gst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Delivery Charge</span>
                        <span className="font-mono font-black text-emerald-600 uppercase text-[10px]">FREE</span>
                      </div>
                      <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-black text-sm text-slate-900 dark:text-white">
                        <span>Grand Total</span>
                        <span className="text-emerald-600 font-mono text-base">₹{cartTotals.grandTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Fig 8.9.3 Minimum-Order Rule Notice & Progress */}
                    {(() => {
                      const MIN_ORDER_AMOUNT = 199.00;
                      const isMinMet = cartTotals.grandTotal >= MIN_ORDER_AMOUNT;
                      const diff = (MIN_ORDER_AMOUNT - cartTotals.grandTotal).toFixed(2);
                      const percent = Math.min(100, Math.round((cartTotals.grandTotal / MIN_ORDER_AMOUNT) * 100));

                      return (
                        <div className="space-y-2">
                          {!isMinMet ? (
                            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-xs space-y-1.5">
                              <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 font-bold text-[11px]">
                                <span className="flex items-center gap-1">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                  <span>Min. Order Rule: ₹199.00</span>
                                </span>
                                <span>Add ₹{diff} more</span>
                              </div>
                              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="bg-amber-500 h-full rounded-full transition-all duration-300"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                                Minimum order value not reached. Add ₹{diff} to enable checkout.
                              </p>
                            </div>
                          ) : (
                            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-bold">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              <span className="text-[11px]">Minimum order met (₹199+ reached)! Checkout enabled.</span>
                            </div>
                          )}

                          {/* Checkout Button: Enabled once rule is met */}
                          <button
                            type="button"
                            disabled={!isMinMet}
                            onClick={() => {
                              if (!isMinMet) return;
                              playClick();
                              setActiveSubTab('cart');
                            }}
                            className={`w-full py-3 font-black rounded-2xl text-xs flex items-center justify-center gap-2 transition-all ${
                              isMinMet 
                                ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:brightness-110 text-white shadow-lg shadow-emerald-600/25 active:scale-95 cursor-pointer' 
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700 cursor-not-allowed opacity-75'
                            }`}
                          >
                            <ShoppingCart className="w-4 h-4" />
                            <span>
                              {isMinMet 
                                ? `CHECKOUT NOW (₹${cartTotals.grandTotal.toFixed(2)})` 
                                : `MINIMUM ORDER ₹199 (ADD ₹${diff} MORE)`
                              }
                            </span>
                          </button>
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* 2. Fig 8.9.1 Track Your Order Map Widget */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                      <Navigation className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-xs text-slate-900 dark:text-white">Track Your Order</h4>
                      <p className="text-[10px] text-slate-400 font-semibold">Live GPS Telemetry & Route Map</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full border border-blue-500/20">
                    LIVE
                  </span>
                </div>

                {/* Simulated Visual Route Map Canvas */}
                <div className="relative h-44 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 p-3 flex flex-col justify-between select-none">
                  {/* Street grid background pattern */}
                  <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#60a5fa_1px,transparent_1px)] [background-size:12px_12px]" />

                  {/* Route Polyline SVG Graphic */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 300 160">
                    {/* Road trace */}
                    <path
                      d="M 35 125 C 80 120, 110 70, 160 85 C 210 100, 240 45, 270 40"
                      fill="none"
                      stroke="#1e293b"
                      strokeWidth="8"
                      strokeLinecap="round"
                    />
                    {/* Active route glowing line */}
                    <path
                      d="M 35 125 C 80 120, 110 70, 160 85 C 210 100, 240 45, 270 40"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                      strokeDasharray="6 3"
                      className="animate-pulse"
                    />
                    {/* Depot Marker */}
                    <circle cx="35" cy="125" r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
                    {/* Destination Marker */}
                    <circle cx="270" cy="40" r="7" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
                    {/* Moving Bike Marker */}
                    <circle cx="160" cy="85" r="9" fill="#3b82f6" stroke="#ffffff" strokeWidth="2" />
                  </svg>

                  {/* Top Map Badges */}
                  <div className="relative z-10 flex items-center justify-between text-[10px]">
                    <span className="bg-slate-900/90 text-slate-200 font-bold px-2 py-0.5 rounded-lg border border-slate-700 flex items-center gap-1">
                      <Store className="w-3 h-3 text-emerald-400" />
                      <span>SmartMart Central Hub</span>
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 font-black px-2 py-0.5 rounded-lg border border-emerald-500/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>ETA: 10 Mins</span>
                    </span>
                  </div>

                  {/* Rider Floating Tooltip */}
                  <div className="relative z-10 mx-auto bg-blue-900/90 text-white text-[10px] font-extrabold px-3 py-1 rounded-xl border border-blue-400/40 shadow-lg flex items-center gap-1.5">
                    <Bike className="w-3.5 h-3.5 text-blue-300 animate-bounce" />
                    <span>Rider: Sarathi Express (🛵 On Route)</span>
                  </div>

                  {/* Bottom Map Badges */}
                  <div className="relative z-10 flex items-center justify-between text-[10px]">
                    <span className="bg-slate-900/90 text-slate-200 font-bold px-2 py-0.5 rounded-lg border border-slate-700 flex items-center gap-1">
                      <Home className="w-3 h-3 text-rose-400" />
                      <span>Doorstep Delivery</span>
                    </span>
                    <span className="bg-amber-500/20 text-amber-300 font-mono font-black px-2 py-0.5 rounded-lg border border-amber-500/30">
                      OTP: 8492
                    </span>
                  </div>
                </div>

                {/* Open Full Live GPS Telemetry button */}
                <button
                  type="button"
                  onClick={() => {
                    playClick();
                    setActiveTrackingDelivery((deliveries && deliveries[0]) || {
                      id: 'DEL-8821',
                      orderId: 'ORD-54910',
                      customerName: user?.name || 'Valued Customer',
                      status: 'Out for Delivery',
                      driver: 'Sarathi Express',
                      otp: '8492',
                      estimatedTime: '10 Mins'
                    });
                  }}
                  className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-500" />
                  <span>EXPAND FULLSCREEN GPS TELEMETRY</span>
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: SHOPPING BASKET & CHECKOUT ───────────────────────────── */}
      {activeSubTab === 'cart' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Shopping Basket</h3>
              <p className="text-xs text-slate-500">Review selected items before triggering online payment gateway.</p>
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-3">
                <ShoppingBag className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
                <p className="font-bold text-slate-800 dark:text-slate-200">Your basket is empty</p>
                <button
                  onClick={() => setActiveSubTab('shop')}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-500 shadow-md cursor-pointer"
                >
                  Shop Products Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cart.map(item => (
                    <div key={item.product.id || item.product.sku} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={getProductImage(item.product)} 
                          alt={t(item.product.name)} 
                          className="w-12 h-12 rounded-xl object-contain bg-slate-50 p-1 border"
                          onError={(e) => {
                            e.target.onerror = null;
                            const idOrSku = item.product.sku || item.product.id || '';
                            const name = (item.product.name || '').toLowerCase();
                            if (idOrSku.startsWith('CHK-') || name.includes('chocolate') || name.includes('snickers')) {
                              e.target.src = '/products/snickers_chocolate_bar.jpg';
                            } else {
                              e.target.src = '/products/veg_potato.png';
                            }
                          }}
                        />
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">{t(item.product.name)}</h4>
                          <span className="text-[10px] text-slate-400 block">Unit: {item.product.unit || '1 Unit'} • ₹{item.product.price.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-1 rounded-xl">
                          <button
                            onClick={() => { playClick(); updateCartQuantity(item.product.id || item.product.sku, -1); }}
                            className="p-1 rounded bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            <Minus className="w-3 h-3 text-emerald-600" />
                          </button>
                          <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                          <button
                            onClick={() => { playClick(); updateCartQuantity(item.product.id || item.product.sku, 1); }}
                            className="p-1 rounded bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-600 dark:text-slate-300 cursor-pointer"
                          >
                            <Plus className="w-3 h-3 text-emerald-600" />
                          </button>
                        </div>
                        <span className="font-black text-sm text-emerald-600">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl space-y-1.5 text-xs font-semibold">
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span>₹{cartTotals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>GST Tax (18%)</span>
                    <span>₹{cartTotals.gst.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span>FRESH10 Promo Coupon</span>
                    <span>-₹{cartTotals.discount.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between text-base font-black text-slate-900 dark:text-white">
                    <span>Grand Total</span>
                    <span>₹{cartTotals.grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white uppercase tracking-wider">Checkout Gateway</h3>
                <p className="text-xs text-slate-500">Attach shipping logistics and online payments.</p>
              </div>

              {checkoutSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold rounded-2xl space-y-1.5">
                  <p className="flex items-center gap-1.5"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Payment Authorized Successfully!</p>
                  <p className="text-[10px]">Order ID: <strong className="text-slate-900 dark:text-white">{checkoutSuccess.orderId}</strong></p>
                </div>
              )}

              <form onSubmit={handleCheckout} className="space-y-4 text-xs font-bold text-slate-700 dark:text-slate-300">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Home className="w-3 h-3 text-emerald-600" /> Recipient Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ananya Sundaram"
                      value={checkoutName}
                      onChange={(e) => setCheckoutName(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <PhoneCall className="w-3 h-3 text-emerald-600" /> Mobile (For OTP)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98401 23456"
                      value={checkoutPhone}
                      onChange={(e) => setCheckoutPhone(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Send className="w-3 h-3 text-emerald-600" /> Customer Email (Live OTP)
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="customer@example.com"
                      value={checkoutEmail}
                      onChange={(e) => setCheckoutEmail(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <Building className="w-3 h-3 text-emerald-600" /> Mart Dispatch Branch
                    </label>
                    <select
                      value={checkoutBranch}
                      onChange={(e) => setCheckoutBranch(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 font-semibold text-xs cursor-pointer"
                    >
                      <option value="SmartMart Pro Central (Main)">SmartMart Pro Central (Main)</option>
                      <option value="SmartMart T. Nagar Hub">SmartMart T. Nagar Hub</option>
                      <option value="SmartMart Velachery Express">SmartMart Velachery Express</option>
                      <option value="SmartMart Anna Nagar Depot">SmartMart Anna Nagar Depot</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <label className="text-[11px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-extrabold flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> Delivery Destination Address
                    </label>

                    {/* 📍 1-Click GPS Auto-Detect Button */}
                    <button
                      type="button"
                      onClick={handleAutoDetectLocation}
                      disabled={isDetectingGps}
                      className="px-2.5 py-1 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-extrabold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <LocateFixed className={`w-3 h-3 ${isDetectingGps ? 'animate-spin' : ''}`} />
                      <span>{isDetectingGps ? 'Detecting...' : '📍 Auto-Detect My Location'}</span>
                    </button>
                  </div>

                  {/* Address Preset Switcher (Home / Office / Custom) */}
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleSelectPresetAddress('home')}
                      className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer font-bold transition-all ${
                        selectedAddressType === 'home'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <Home className="w-3.5 h-3.5" />
                      <span>Home</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectPresetAddress('office')}
                      className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer font-bold transition-all ${
                        selectedAddressType === 'office'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <Briefcase className="w-3.5 h-3.5" />
                      <span>Office</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectPresetAddress('custom')}
                      className={`p-2 rounded-xl border flex items-center justify-center gap-1.5 cursor-pointer font-bold transition-all ${
                        selectedAddressType === 'custom'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New Address</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    <input
                      type="text"
                      required
                      placeholder="Flat / House / Door No."
                      value={checkoutFlat}
                      onChange={(e) => setCheckoutFlat(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Street / Building / Road"
                      value={checkoutStreet}
                      onChange={(e) => setCheckoutStreet(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Area / Locality"
                      value={checkoutArea}
                      onChange={(e) => setCheckoutArea(e.target.value)}
                      className="col-span-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                    />
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={checkoutCity}
                      onChange={(e) => setCheckoutCity(e.target.value)}
                      className="col-span-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                    />
                    <input
                      type="text"
                      required
                      placeholder="Pincode"
                      value={checkoutPincode}
                      onChange={(e) => setCheckoutPincode(e.target.value)}
                      className="col-span-1 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs font-mono"
                    />
                  </div>

                  <input
                    type="text"
                    placeholder="Delivery Instructions / Landmark (e.g. Ring bell, near temple)"
                    value={checkoutNotes}
                    onChange={(e) => setCheckoutNotes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 text-xs"
                  />
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-[11px] text-slate-500 uppercase tracking-wider font-bold">Select Payment Gateway</label>
                  <div className="grid grid-cols-3 gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPaymentMode('razorpay')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer font-extrabold transition-all relative ${
                        paymentMode === 'razorpay' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-sm' : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-[9px] font-black bg-emerald-500 text-white px-1 py-0.2 rounded">ONLINE</span>
                      </div>
                      <span className="text-[10px]">Razorpay UPI/Cards</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMode('wallet')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer font-extrabold transition-all ${
                        paymentMode === 'wallet' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-sm' : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Wallet className="w-3.5 h-3.5 text-amber-500" />
                      <span className="text-[10px]">Wallet (₹{user?.walletBalance || '4,500'})</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMode('cod')}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer font-extrabold transition-all ${
                        paymentMode === 'cod' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-sm' : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[10px]">Cash on Delivery</span>
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cart.length === 0 || isProcessingCheckout}
                  className={`w-full py-3.5 disabled:opacity-50 text-white font-black rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all cursor-pointer mt-4 ${
                    paymentMode === 'razorpay'
                      ? 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:brightness-110 shadow-emerald-600/25'
                      : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20'
                  }`}
                >
                  {isProcessingCheckout ? (
                    <span>Authorizing & Dispatching...</span>
                  ) : paymentMode === 'razorpay' ? (
                    <>
                      <Zap className="w-4 h-4 text-emerald-200" />
                      <span>PAY ₹{cartTotals.grandTotal.toFixed(2)} VIA RAZORPAY & TRACK</span>
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-4 h-4" />
                      <span>CONFIRM ORDER & LIVE TRACK (₹{cartTotals.grandTotal.toFixed(2)})</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 3: MY ORDERS & DISPATCH TRACKING ────────────────────────── */}
      {activeSubTab === 'orders' && (
        <div className="space-y-6">
          <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Active Grocery Deliveries</h3>
                <p className="text-xs text-slate-500">Live order status, 10-minute delivery dispatcher, GPS telemetry & OTP verification.</p>
              </div>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                {deliveries.length} Total Dispatches
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deliveries.map(del => {
                const isDelivered = del.status === 'Delivered';
                return (
                  <div 
                    key={del.id || del.orderId} 
                    className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950/60 shadow-sm hover:shadow-md transition-all space-y-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg">
                            {del.orderId || del.id}
                          </span>
                          <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            isDelivered
                              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                              : del.status === 'Out for Delivery'
                              ? 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/20 animate-pulse'
                              : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          }`}>
                            {del.status}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1.5">{del.customerName}</h4>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 font-bold block uppercase">ETA Countdown</span>
                        <span className="text-xs font-black text-slate-700 dark:text-slate-300">{del.estimatedTime || '10 Mins'}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/40 p-3 rounded-2xl">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                        <Building className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">Origin: {del.branch || 'SmartMart Pro Central (Main)'}</span>
                      </div>
                      <div className="flex items-start gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">Dest: {del.deliveryAddress || del.address}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-bold">Delivery Partner</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-200">{del.partnerName || del.driver || 'Sarathi Express'}</span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] text-slate-400 block font-bold uppercase">Handover OTP</span>
                        <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm tracking-widest">{del.deliveryOtp || del.otp || '8492'}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        playClick();
                        setActiveTrackingDelivery(del);
                      }}
                      className={`w-full py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 cursor-pointer transition-all shadow-md ${
                        isDelivered
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/20'
                      }`}
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      <span>{isDelivered ? 'VIEW DELIVERY RECEIPT' : 'LIVE GPS MAP & VERIFY OTP'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ─── Product Details Modal ────────────────────────────────────────── */}
      <ProductDetailsModal
        product={selectedProductDetails}
        isOpen={Boolean(selectedProductDetails)}
        onClose={() => setSelectedProductDetails(null)}
        onSelectProduct={(item) => setSelectedProductDetails(item)}
      />

      {/* ─── Live GPS Telemetry Delivery Tracking Modal ───────────────────── */}
      {activeTrackingDelivery && (
        <LiveDeliveryTrackingModal
          delivery={activeTrackingDelivery}
          isOpen={Boolean(activeTrackingDelivery)}
          onClose={() => setActiveTrackingDelivery(null)}
        />
      )}
    </div>
  );
}
