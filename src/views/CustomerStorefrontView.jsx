import React, { useState, useDeferredValue } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { CATEGORIES } from '../data/mockData';
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
  ShoppingCart
} from 'lucide-react';
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
    showToast
  } = useApp();
  const { t } = useLanguage();
  const { playSuccess, playClick, playBeep } = useSoundEffects();

  const [activeSubTab, setActiveSubTab] = useState('shop'); // 'shop' | 'cart' | 'orders'
  const [selectedCat, setSelectedCat] = useState('All Categories');
  const [searchQuery, setSearchQuery] = useState('');
  const deferredSearch = useDeferredValue(searchQuery);

  const [wishlist, setWishlist] = useState(['PRD-284']);

  // Checkout states
  const [shippingAddress, setShippingAddress] = useState('14 Anna Salai, T. Nagar, Chennai - 600017');
  const [paymentGateway, setPaymentGateway] = useState('UPI'); // 'UPI' | 'Card' | 'COD' | 'Wallet'
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  // Review states
  const [reviewingProdId, setReviewingProdId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const toggleWishlist = (id) => {
    playClick();
    const product = products.find(p => p.id === id);
    const wasInWishlist = wishlist.includes(id);
    setWishlist(prev => wasInWishlist ? prev.filter(item => item !== id) : [...prev, id]);
    showToast({
      title: wasInWishlist ? 'Removed from Wishlist' : 'Added to Wishlist ❤️',
      message: product ? product.name : '',
      type: wasInWishlist ? 'info' : 'success',
      duration: 2500
    });
  };

  const handleAddToCart = (product) => {
    playSuccess();
    addToCart(product);
  };

  const handleOnlineCheckout = (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    if (paymentGateway === 'Wallet' && user.walletBalance < cartTotals.grandTotal) {
      playBeep();
      alert("Insufficient wallet balance. Please choose another payment method.");
      return;
    }

    playSuccess();
    const result = completeOnlineCheckout(shippingAddress, paymentGateway);
    setCheckoutSuccess(result);
    setTimeout(() => {
      setCheckoutSuccess(null);
      setActiveSubTab('orders');
    }, 4000);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!reviewingProdId) return;
    submitReview(reviewingProdId, reviewRating, reviewText);
    playSuccess();
    setReviewingProdId(null);
    setReviewText('');
    alert("Thank you! Your review has been recorded.");
  };

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCat === 'All Categories' || p.category === selectedCat;
    const matchesSearch = p.name.toLowerCase().includes(deferredSearch.toLowerCase()) || p.category.toLowerCase().includes(deferredSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8 font-sans">
      
      {/* SmartMart Pro Official Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-emerald-500/30">
        <div className="space-y-3 relative z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider shadow-md">
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            <span>{t("Online Customer Storefront")}</span>
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

      {/* Storefront Sub-Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => { playClick(); setActiveSubTab('shop'); }}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'shop'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          🛍️ {t("Shop Catalog")}
        </button>
        <button
          onClick={() => { playClick(); setActiveSubTab('cart'); }}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all relative ${
            activeSubTab === 'cart'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          🛒 {t("My Basket")}
          {cart.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-slate-950 rounded-full flex items-center justify-center text-[9px] font-black">
              {cart.reduce((sum, i) => sum + i.quantity, 0)}
            </span>
          )}
        </button>
        <button
          onClick={() => { playClick(); setActiveSubTab('orders'); }}
          className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'orders'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          🛵 {t("Live Delivery Tracking & Reviews")}
        </button>
      </div>



      {/* Tab 1: Shop Catalog */}
      {activeSubTab === 'shop' && (
        <>
          {/* Category Megamenu Bar */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-emerald-600" />
                <span>Categories</span>
              </h3>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold">{products.length} SKUs Stocked</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCat === cat.name;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { playClick(); setSelectedCat(cat.name); }}
                    className={`p-3.5 rounded-2xl text-xs font-extrabold transition-all duration-200 flex flex-col items-center justify-center gap-2 border text-center ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-105'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 hover:bg-emerald-50/50'
                    }`}
                  >
                    <span className="text-2xl">{cat.icon || '🛍️'}</span>
                    <span className="line-clamp-1">{cat.name}</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'text-slate-400 bg-slate-100 dark:bg-slate-800'}`}>
                      {cat.count} SKUs
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Catalog Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="font-extrabold text-xl text-slate-900 dark:text-white">{selectedCat} Showcase</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Authentic fresh items available for express delivery.</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
              />
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => {
              const isWishlisted = wishlist.includes(p.id);
              const cartItem = cart.find(item => item.product.id === p.id);
              const qtyInCart = cartItem ? cartItem.quantity : 0;

              return (
                <div 
                  key={p.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between"
                >
                  <div>
                    {/* Image */}
                    <div className="h-48 relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      
                      {p.discount && (
                        <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
                          {p.discount}
                        </span>
                      )}

                      <button
                        onClick={() => toggleWishlist(p.id)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs text-rose-500 hover:scale-110 transition-transform shadow-sm"
                      >
                        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
                      </button>

                      <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-lg">
                        {p.category}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="p-4 space-y-2">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">{t(p.name)}</h4>

                      <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                        <div className="flex items-center text-amber-500 font-extrabold gap-1">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{p.rating || 4.8}</span>
                        </div>
                        <span className="font-mono text-slate-400">SKU: {p.sku}</span>
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 block font-semibold">Price</span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">₹{p.price.toFixed(2)}</span>
                            <span className="text-xs text-slate-400 line-through">₹{(p.price * 1.25).toFixed(2)}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block font-semibold">Stock Status</span>
                          <span className={`text-xs font-extrabold ${p.stock > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                            {p.stock > 0 ? `${p.stock} ${p.unit}s` : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 mt-2">
                    {qtyInCart > 0 ? (
                      <div className="flex items-center justify-between bg-emerald-50 dark:bg-slate-800 p-1 rounded-2xl border border-emerald-200 dark:border-slate-700">
                        <button
                          onClick={() => { playClick(); updateCartQuantity(p.id, -1); }}
                          className="p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-xs hover:bg-slate-100"
                        >
                          <Minus className="w-3.5 h-3.5 text-emerald-600" />
                        </button>
                        <span className="font-black text-xs text-emerald-700 dark:text-emerald-300">{qtyInCart} In Basket</span>
                        <button
                          onClick={() => { playClick(); updateCartQuantity(p.id, 1); }}
                          className="p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-xs hover:bg-slate-100"
                        >
                          <Plus className="w-3.5 h-3.5 text-emerald-600" />
                        </button>
                      </div>
                    ) : (
                      <button
                        disabled={p.stock === 0}
                        onClick={() => handleAddToCart(p)}
                        className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-extrabold py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add To Basket</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Tab 2: My Basket & Checkout */}
      {activeSubTab === 'cart' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart items list */}
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
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-black rounded-xl hover:bg-emerald-500 shadow-md"
                >
                  Shop Products Now
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cart.map(item => (
                    <div key={item.product.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img src={item.product.image} alt={t(item.product.name)} className="w-12 h-12 rounded-xl object-cover" />
                        <div>
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">{t(item.product.name)}</h4>
                          <span className="text-[10px] text-slate-400 block">Unit price: ₹{item.product.price.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-1 rounded-xl">
                          <button
                            onClick={() => { playClick(); updateCartQuantity(item.product.id, -1); }}
                            className="p-1 rounded bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-600 dark:text-slate-300"
                          >
                            <Minus className="w-3 h-3 text-emerald-600" />
                          </button>
                          <span className="w-6 text-center font-bold text-xs">{item.quantity}</span>
                          <button
                            onClick={() => { playClick(); updateCartQuantity(item.product.id, 1); }}
                            className="p-1 rounded bg-white dark:bg-slate-900 hover:bg-slate-100 text-slate-600 dark:text-slate-300"
                          >
                            <Plus className="w-3 h-3 text-emerald-600" />
                          </button>
                        </div>
                        <span className="font-black text-sm text-emerald-600">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotals info */}
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

          {/* Checkout billing configuration panel */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white uppercase tracking-wider">Checkout Gateway</h3>
                <p className="text-xs text-slate-500">Attach shipping logistics and online payments.</p>
              </div>

              {checkoutSuccess && (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-extrabold rounded-2xl space-y-1.5 animate-bounce">
                  <p className="flex items-center gap-1.5"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Payment Authorized Successfully!</p>
                  <p className="text-[10px]">Order ID: <strong className="text-slate-900 dark:text-white">{checkoutSuccess.orderId}</strong></p>
                  <p className="text-[10px]">OTP Verification Code: <strong className="text-slate-900 dark:text-white">{checkoutSuccess.otp}</strong></p>
                </div>
              )}

              <form onSubmit={handleOnlineCheckout} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-400 uppercase font-extrabold mb-1">SHIPPING ADDRESS</label>
                  <textarea
                    required
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-white font-bold h-20"
                    placeholder="Enter full physical delivery address"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 uppercase font-extrabold mb-2">ONLINE PAYMENT GATEWAY</label>
                  <div className="grid grid-cols-2 gap-2 text-center text-[10px] font-bold">
                    {[
                      { id: 'UPI', label: 'UPI / PhonePe' },
                      { id: 'Razorpay', label: 'Razorpay Secure' },
                      { id: 'Card', label: 'Visa / Mastercard' },
                      { id: 'Wallet', label: 'SmartMart Wallet' }
                    ].map(g => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => { playClick(); setPaymentGateway(g.id); }}
                        className={`p-3 rounded-2xl border transition-all ${
                          paymentGateway === g.id
                            ? 'bg-emerald-50 dark:bg-slate-800 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={cart.length === 0}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl uppercase tracking-wider text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-98"
                >
                  Pay ₹{cartTotals.grandTotal.toFixed(2)} & Placed Order
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: My Orders & Live Tracking */}
      {activeSubTab === 'orders' && (
        <div className="space-y-6">
          {/* Loyalty progress */}
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 p-6 rounded-3xl shadow-lg border border-amber-400/20 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950/10 px-2 py-0.5 rounded">
                Loyalty Rewards Club
              </span>
              <h3 className="text-xl font-black mt-1">SmartMart Rewards Tier: {user?.tier || 'Bronze'}</h3>
            </div>
            <div className="text-center">
              <span className="text-[10px] font-bold block uppercase text-amber-900">Total Accumulate Points</span>
              <span className="text-3xl font-black">{user?.loyaltyPoints || 0} Points</span>
            </div>
            <div className="text-right text-xs font-semibold text-amber-950">
              <p>Earn 1 points for every ₹100 spend!</p>
              <p>Points can be redeemed during POS/online checkout.</p>
            </div>
          </div>

          {/* Orders Tracking list */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Active Online Orders Tracking</h3>
              <p className="text-xs text-slate-500">Track 10-minute delivery fleet updates and secure handovers via 4-digit OTP codes.</p>
            </div>

            {(!deliveries || deliveries.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">No orders placed yet.</p>
            ) : (
              <div className="space-y-4">
                {deliveries.map(d => (
                  <div key={d.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-slate-900 dark:text-white">{d.orderId}</span>
                        <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${
                          d.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-indigo-500/10 text-indigo-600 animate-pulse'
                        }`}>
                          {d.status.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-500">Delivery Address: {d.address}</p>
                      <div className="flex flex-wrap gap-4 text-[10px] font-bold text-slate-400">
                        <span>Items: {d.items} SKUs</span>
                        <span>•</span>
                        <span>Cost: {d.amount}</span>
                        <span>•</span>
                        <span>Driver fleet partner: {d.driver} ({d.time})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 mt-3 md:mt-0">
                      {d.status !== 'Delivered' ? (
                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-center text-xs font-bold">
                          <span className="block text-[9px] text-amber-600 font-extrabold uppercase mb-0.5">Secure Handover OTP</span>
                          <span className="text-amber-500 font-black text-sm tracking-wider">{d.otp}</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified and Delivered!
                          </span>
                          
                          {/* Write review */}
                          <button
                            onClick={() => { playClick(); setReviewingProdId(products[0]?.id || 'PRD-284'); }}
                            className="px-2.5 py-1 text-[10px] bg-slate-900 dark:bg-slate-800 text-white rounded hover:bg-slate-800 font-extrabold"
                          >
                            ⭐ Write Product Review
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Review Form Modal */}
          {reviewingProdId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative animate-scale-up space-y-4">
                <div>
                  <h3 className="text-base font-black text-white">Write Product Review</h3>
                  <p className="text-xs text-slate-400 mt-1">Submit feedback to improve grocery service ratings.</p>
                </div>

                <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs font-semibold">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">SELECT RATING STAR</label>
                    <select
                      value={reviewRating}
                      onChange={(e) => setReviewRating(parseInt(e.target.value))}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl font-bold text-white focus:outline-none"
                    >
                      <option value={5}>⭐⭐⭐⭐⭐ (5/5 Excellence)</option>
                      <option value={4}>⭐⭐⭐⭐ (4/5 Very Good)</option>
                      <option value={3}>⭐⭐⭐ (3/5 Average)</option>
                      <option value={2}>⭐⭐ (2/5 Poor)</option>
                      <option value={1}>⭐ (1/5 Bad)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-bold mb-1">REVIEW COMMENT</label>
                    <textarea
                      required
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl text-white font-bold h-24 focus:outline-none focus:border-emerald-500"
                      placeholder="e.g. Delicious sweet organic bananas! Freshly delivered."
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setReviewingProdId(null)}
                      className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-center"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-2xl text-center shadow-lg shadow-emerald-600/20"
                    >
                      Submit Review
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Official Footer */}
      <footer className="mt-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 text-xs">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center">
                <ShoppingCart className="w-4 h-4" />
              </div>
              <h4 className="font-black text-base text-slate-900 dark:text-white tracking-tight">SMARTMART PRO</h4>
            </div>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Enterprise grocery ERP system simulation. Fresh produce and goods delivered in 10-minutes.
            </p>
          </div>

          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">Shop Categories</h4>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400 font-semibold">
              <li>Fruits & Vegetables</li>
              <li>Dairy & Eggs</li>
              <li>Bakery & Bread</li>
              <li>Beverages</li>
              <li>Snacks & Pantry</li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">Helpline Care</h4>
            <ul className="space-y-2 text-slate-500 dark:text-slate-400 font-semibold">
              <li className="flex items-center gap-1.5"><PhoneCall className="w-3.5 h-3.5 text-emerald-600" /> Care: +1 800-SMART-MART</li>
              <li>Live Fleet Dispatch & OTP Verification</li>
              <li>Return & Refund Policies</li>
              <li>Rewards Tier Points Balance</li>
            </ul>
          </div>

          <div>
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white mb-3">Payment Gateways</h4>
            <p className="text-slate-500 dark:text-slate-400 mb-3">256-Bit Encrypted Secure Payment Integration</p>
            <div className="flex flex-wrap gap-1.5 font-bold text-[10px] text-slate-700 dark:text-slate-300">
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">UPI / QR</span>
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">Razorpay</span>
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">PhonePe</span>
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">Visa Card</span>
              <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">Mastercard</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400">
          <span>© 2026 SmartMart Pro Enterprise ERP System. All Rights Reserved.</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">10-Min Fast Delivery Guarantee</span>
        </div>
      </footer>
    </div>
  );
}
