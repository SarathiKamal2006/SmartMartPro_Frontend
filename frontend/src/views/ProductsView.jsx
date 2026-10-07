import React, { useState, useId, useDeferredValue, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { getProductImage } from '../data/productImages';
import ProductCard from '../components/ProductCard';
import ProductDetailsModal from '../components/ProductDetailsModal';
import AutoSwipingProductCarousel from '../components/AutoSwipingProductCarousel';
import { 
  POTHYS_BANNERS, 
  CURATED_CATEGORIES, 
  BRANDS_YOU_LOVE, 
  ESSENTIALS_TABS, 
  POTHYS_CHOCOLATES, 
  POTHYS_CHEESE, 
  POTHYS_BEVERAGES, 
  POTHYS_PRODUCE, 
  POTHYS_CLEANING,
  POTHYS_RTE
} from '../data/pothysCatalogData';
import { 
  Plus, 
  Grid, 
  List, 
  Search, 
  Trash2, 
  X, 
  Barcode,
  ShoppingCart,
  Star,
  Store,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Sparkles,
  Layers,
  ArrowUpRight,
  ArrowRight,
  Zap,
  Tag
} from 'lucide-react';

const CATALOG_CATEGORY_CARDS = [
  { id: 'cat-all', name: 'All', image: '/dashboard_grocery_basket.png' },
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

export default function ProductsView() {
  const { products, addProduct, deleteProduct, addToCart } = useApp();
  const { playClick, playSuccess, playBeep } = useSoundEffects();
  
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCat, setSelectedCat] = useState('All');
  const [search, setSearch] = useState('');
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Banner carousel state
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [isBannerHovered, setIsBannerHovered] = useState(false);

  // Curated categories toggle
  const [showMoreCurated, setShowMoreCurated] = useState(false);

  // Essentials active tab
  const [activeEssentialsTab, setActiveEssentialsTab] = useState('Chocolates');

  // Auto-rotate hero banners every 5.5 seconds (paused when user hovers)
  useEffect(() => {
    if (isBannerHovered) return;
    const timer = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % POTHYS_BANNERS.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isBannerHovered]);

  const deferredSearch = useDeferredValue(search);

  // Combine store products with authentic catalog items
  const allCombinedProducts = React.useMemo(() => {
    const pothysMap = new Map();
    [
      ...POTHYS_CHOCOLATES,
      ...POTHYS_CHEESE,
      ...POTHYS_BEVERAGES,
      ...POTHYS_PRODUCE,
      ...POTHYS_CLEANING,
      ...POTHYS_RTE
    ].forEach(item => pothysMap.set(item.sku, item));

    const mappedProducts = products.map(p => {
      const sku = p.sku || p.id;
      if (pothysMap.has(sku)) {
        const pothysItem = pothysMap.get(sku);
        return {
          ...p,
          ...pothysItem,
          image: pothysItem.image || getProductImage(pothysItem)
        };
      }
      return p;
    });

    const mappedSkus = new Set(mappedProducts.map(p => p.sku || p.id));
    const extraPothys = Array.from(pothysMap.values()).filter(p => !mappedSkus.has(p.sku));
    const combined = [...extraPothys, ...mappedProducts];
    const DELETED_SKUS = new Set([
      'CHK-004', 'CHK-005', 'CHK-006',
      'TEA-001', 'COF-001', 'COF-002', 'COF-003',
      'CHE-001', 'CHE-002', 'CHE-004', 'CHE-005', 'CHE-006',
      'MAS-109', 'MAS-110', 'MAS-111', 'MAS-112'
    ]);
    return combined.filter(p => !DELETED_SKUS.has(p.sku) && !DELETED_SKUS.has(p.id));
  }, [products]);


  const [formData, setFormData] = useState({
    name: '',
    category: 'Fruits & Vegetables',
    price: '',
    unit: 'pack',
    stock: '',
    threshold: '25',
    supplier: 'Green Valley Farms',
    expiryDate: '2026-09-01',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80'
  });

  const matchesCategory = (prodCategory, targetCat) => {
    if (!targetCat || targetCat === 'All' || targetCat === 'All Categories') return true;
    if (!prodCategory) return false;
    const pCat = prodCategory.toLowerCase();
    const tCat = targetCat.toLowerCase();
    if (pCat === tCat) return true;
    if (tCat.includes('staple') && (pCat.includes('staple') || pCat.includes('rice') || pCat.includes('grain') || pCat.includes('dal') || pCat.includes('flour') || pCat.includes('oil'))) return true;
    if (tCat.includes('rice') && pCat.includes('rice')) return true;
    if (tCat.includes('dairy') && (pCat.includes('dairy') || pCat.includes('butter') || pCat.includes('paneer') || pCat.includes('cheese'))) return true;
    if (tCat.includes('snack') && (pCat.includes('snack') || pCat.includes('pantry') || pCat.includes('chocolate') || pCat.includes('namkeen'))) return true;
    if (tCat.includes('beverage') && (pCat.includes('beverage') || pCat.includes('tea') || pCat.includes('coffee') || pCat.includes('drink'))) return true;
    if (tCat.includes('clean') && (pCat.includes('clean') || pCat.includes('wash') || pCat.includes('detergent'))) return true;
    if (tCat.includes('household') && (pCat.includes('household') || pCat.includes('essential'))) return true;
    if (tCat.includes('personal') && (pCat.includes('personal') || pCat.includes('care'))) return true;
    if (tCat.includes('baby') && pCat.includes('baby')) return true;
    if (tCat.includes('fruit') || tCat.includes('vegetable') || tCat.includes('produce')) return pCat.includes('fruit') || pCat.includes('vegetable') || pCat.includes('produce');
    return pCat.includes(tCat) || tCat.includes(pCat);
  };

  const filteredProducts = allCombinedProducts.filter(p => {
    const matchesCat = matchesCategory(p.category, selectedCat);
    const matchesSearch = !deferredSearch || 
      (p.name && p.name.toLowerCase().includes(deferredSearch.toLowerCase())) || 
      (p.sku && p.sku.toLowerCase().includes(deferredSearch.toLowerCase())) ||
      (p.category && p.category.toLowerCase().includes(deferredSearch.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock) return;
    addProduct({
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      threshold: parseInt(formData.threshold),
    });
    playSuccess();
    setShowAddModal(false);
    setFormData({
      name: '',
      category: 'Fruits & Vegetables',
      price: '',
      unit: 'pack',
      stock: '',
      threshold: '25',
      supplier: 'Green Valley Farms',
      expiryDate: '2026-09-01',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80'
    });
  };

  const currentBanner = POTHYS_BANNERS[currentBannerIndex];

  return (
    <div className="space-y-10 font-sans">
      
      {/* ─── Top Admin Bar ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-600">SmartMart Pro Retail ERP</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Supermarket Product Catalog Dashboard</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Live retail catalog, auto-swiping customer carousels, barcode taxonomy & stock allocation.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-1">
            <button
              onClick={() => { playClick(); setViewMode('grid'); }}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>GRID</span>
            </button>
            <button
              onClick={() => { playClick(); setViewMode('list'); }}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'list' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>LIST</span>
            </button>
          </div>

          <button
            onClick={() => { playClick(); setShowAddModal(true); }}
            className="bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-emerald-700/20 transition-transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>ADD PRODUCT SKU</span>
          </button>
        </div>
      </div>

      {/* ─── 1. Hero Promotional Banner Carousel ─────────────────────────── */}
      <div 
        onMouseEnter={() => setIsBannerHovered(true)}
        onMouseLeave={() => setIsBannerHovered(false)}
        className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 dark:border-slate-800 transition-all duration-500 group select-none bg-slate-100 dark:bg-slate-900"
      >
        {/* Carousel Slide Track */}
        <div 
          onClick={() => {
            playClick();
            setSelectedCat(currentBanner.categoryFilter || 'All');
            const el = document.getElementById('all-catalog-skus');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          className="relative w-full min-h-[300px] sm:min-h-[330px] md:min-h-[350px] cursor-pointer overflow-hidden flex items-center"
          title={`Click to explore ${currentBanner.tag}`}
        >
          {POTHYS_BANNERS.map((banner, idx) => {
            const isActive = currentBannerIndex === idx;
            if (!isActive) return null;

            return (
              <div
                key={banner.id}
                className="absolute inset-0 w-full h-full flex flex-col md:flex-row items-center justify-between p-4 sm:p-6 md:p-8 lg:px-12 transition-all duration-500 ease-out z-10"
                style={{ backgroundColor: banner.bgColor || '#fbf7ea' }}
              >
                {/* Subtle Tabletop Shelf along bottom (for produce, fruits, chocolates) */}
                {banner.id !== 'banner-3' && (
                  <div className="absolute bottom-0 left-0 right-0 h-12 sm:h-16 md:h-20 bg-gradient-to-t from-[#c89868]/30 via-[#deb388]/15 to-transparent border-b-[4px] border-[#b88554]/25 pointer-events-none" />
                )}

                {/* Ambient floating items */}
                {banner.floatingItems?.map((item, fIdx) => (
                  <span
                    key={fIdx}
                    className={`absolute select-none pointer-events-none opacity-80 ${item.size} ${item.anim}`}
                    style={{ top: item.top, left: item.left, right: item.right }}
                  >
                    {item.text}
                  </span>
                ))}

                {/* ── Slide 1: Vegetables & Fruits ────────────────────────── */}
                {banner.id === 'banner-1' && (
                  <>
                    <div className="relative z-10 shrink-0 w-full md:w-5/12 lg:w-5/12 flex items-center justify-center md:justify-start h-48 sm:h-56 md:h-60">
                      <div className="w-full max-w-[340px] sm:max-w-[380px] h-full rounded-2xl overflow-hidden shadow-xl border border-emerald-200/60 flex items-center justify-center bg-white/40">
                        <img
                          src="/banners/hero_vegetables.jpg"
                          alt="Fresh Produce Basket"
                          className="w-full h-full object-cover object-center filter drop-shadow-md hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </div>

                    <div className="z-10 flex-1 text-center md:text-left space-y-1 sm:space-y-1.5 px-3 sm:px-6 md:px-8 py-2 pb-6 md:pb-2">
                      <div className="text-[#b8382c] font-black text-sm sm:text-base md:text-lg flex items-center justify-center md:justify-start gap-1.5">
                        <span>🍃</span>
                        <span>Vegetables & Fruits</span>
                      </div>
                      <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-[46px] font-black text-[#0f4d2a] tracking-tight leading-none drop-shadow-xs">
                        Next Day Order !
                      </h2>
                      <h3 className="text-lg sm:text-2xl md:text-3xl lg:text-[34px] font-extrabold text-[#185e34] tracking-tight leading-tight drop-shadow-xs">
                        prices are subject to change
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-[#244b33] pt-0.5 max-w-xl">
                        according to the market price fluctuations
                      </p>
                      <div className="pt-2 sm:pt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playClick();
                            setSelectedCat('Fruits & Vegetables');
                            const el = document.getElementById('all-catalog-skus');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#185333] hover:bg-[#113f26] text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-xl active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer border border-white/20"
                        >
                          <span>Explore Fresh Produce</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* ── Slide 2: Premium Fruits & Fresh Harvests ────────────── */}
                {banner.id === 'banner-2' && (
                  <>
                    <div className="relative z-10 shrink-0 w-full md:w-5/12 lg:w-5/12 flex items-center justify-center md:justify-start gap-3 h-48 sm:h-56 md:h-60">
                      {/* Farm Harvest Card */}
                      <div className="hidden sm:flex flex-col justify-between w-32 md:w-36 h-48 sm:h-52 rounded-2xl bg-white shadow-xl border border-amber-200/60 p-2.5 shrink-0">
                        <span className="text-[9px] font-black text-amber-800 uppercase tracking-widest bg-amber-100 px-2 py-0.5 rounded-full self-start">
                          FARM HARVEST
                        </span>
                        <div className="relative flex-1 flex items-center justify-center">
                          <img
                            src="/products/apple_royal_gala.png"
                            alt="Royal Gala Apple"
                            className="absolute left-0 bottom-1 h-14 object-contain drop-shadow-md hover:scale-105 transition-transform"
                          />
                          <img
                            src="/products/banana_red.png"
                            alt="Red Banana"
                            className="absolute right-0 bottom-1 h-18 object-contain drop-shadow-md hover:scale-105 transition-transform"
                          />
                          <img
                            src="/products/banana_nendran_ethan.png"
                            alt="Ethan Banana"
                            className="h-16 object-contain z-10 drop-shadow-lg hover:scale-105 transition-transform"
                          />
                        </div>
                        <span className="text-[8px] font-extrabold text-amber-900 text-center">
                          100% Organically Sourced
                        </span>
                      </div>

                      {/* Exotic Fruits Basket */}
                      <div className="w-44 sm:w-52 md:w-56 h-48 sm:h-52 rounded-2xl overflow-hidden shadow-xl border border-amber-200/60 bg-white/40">
                        <img
                          src="/banners/hero_fruits.jpg"
                          alt="Exotic Fruits Basket"
                          className="w-full h-full object-cover object-center filter drop-shadow-md hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </div>

                    <div className="z-10 flex-1 text-center md:text-left space-y-1 sm:space-y-1.5 px-3 sm:px-6 md:px-8 py-2 pb-6 md:pb-2">
                      <div className="text-[#b8382c] font-black text-sm sm:text-base md:text-lg drop-shadow-xs">
                        Premium Fruits & Fresh Harvests
                      </div>
                      <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-[46px] font-black text-[#4a1f08] tracking-tight leading-none drop-shadow-xs">
                        Fresh Harvest & Exotic Fruits!
                      </h2>
                      <h3 className="text-lg sm:text-2xl md:text-3xl lg:text-[34px] font-extrabold text-[#82380d] tracking-tight leading-tight drop-shadow-xs">
                        100% Organically Sourced
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-[#3d1e0f] pt-0.5 max-w-xl">
                        directly sourced from organic orchards with farm-fresh delivery
                      </p>
                      <div className="pt-2 sm:pt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playClick();
                            setSelectedCat('Fruits & Vegetables');
                            const el = document.getElementById('all-catalog-skus');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#b45d24] hover:bg-[#9d4e1b] text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-xl active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer border border-white/20"
                        >
                          <span>Explore Fresh Fruits</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* ── Slide 3: Home Hygiene & Care ────────────────────────── */}
                {banner.id === 'banner-3' && (
                  <>
                    <div className="relative z-10 shrink-0 w-full md:w-5/12 lg:w-5/12 flex flex-col items-center justify-center md:justify-start h-48 sm:h-56 md:h-60">
                      <div className="w-full max-w-[320px] sm:max-w-[360px] h-44 sm:h-50 rounded-2xl overflow-hidden shadow-xl border border-cyan-200/60 bg-white/40">
                        <img
                          src="/banners/hero_hygiene.jpg"
                          alt="Home Hygiene & Fabric Care"
                          className="w-full h-full object-cover object-center filter drop-shadow-md hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <span className="text-[10px] sm:text-xs font-black text-[#062c44] mt-1.5 drop-shadow-xs">
                        Comfort Fabric Conditioner and Fresh Scent Downy
                      </span>
                    </div>

                    <div className="z-10 flex-1 text-center md:text-left space-y-1 sm:space-y-1.5 px-3 sm:px-6 md:px-8 py-2 pb-6 md:pb-2">
                      <div className="text-[#0a5c7a] font-black text-sm sm:text-base md:text-lg drop-shadow-xs">
                        Home Hygiene & Care
                      </div>
                      <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-[46px] font-black text-[#062c44] tracking-tight leading-none drop-shadow-xs">
                        Cleanliness is not just a Choice;
                      </h2>
                      <h3 className="text-lg sm:text-2xl md:text-3xl lg:text-[34px] font-extrabold text-[#0a4668] tracking-tight leading-tight drop-shadow-xs">
                        it's a Lifestyle.
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-[#1b435a] pt-0.5 max-w-xl">
                        embrace it with our superior & disinfectant products
                      </p>
                      <div className="pt-2 sm:pt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playClick();
                            setSelectedCat('Cleaning Needs');
                            const el = document.getElementById('all-catalog-skus');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#0b5b80] hover:bg-[#084866] text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-xl active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer border border-white/20"
                        >
                          <span>Shop Hygiene Deals</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {/* ── Slide 4: Snacks & Confectioneries ───────────────────── */}
                {banner.id === 'banner-4' && (
                  <>
                    {/* Left Card: Cadbury Perk Bar */}
                    <div className="relative z-10 shrink-0 w-full md:w-3/12 lg:w-3/12 flex items-center justify-center md:justify-start h-48 sm:h-56 md:h-60">
                      <div className="relative w-40 sm:w-44 h-48 sm:h-52 rounded-2xl bg-white shadow-xl border border-amber-200/60 p-3 flex flex-col justify-between items-center">
                        <div className="w-full flex items-center justify-between">
                          <span className="text-[9px] font-black text-amber-800 uppercase tracking-widest bg-amber-100 px-2 py-0.5 rounded-full">
                            100% Genuine
                          </span>
                          <span className="text-xs select-none">✨</span>
                        </div>
                        <div className="relative w-full flex-1 flex items-center justify-center py-1">
                          <img
                            src="/products/cadbury_perk_extra.jpg"
                            alt="Cadbury Perk Extra"
                            className="max-h-24 sm:max-h-28 w-auto object-contain rounded-lg shadow-md border border-slate-100 hover:scale-105 transition-transform"
                          />
                        </div>
                        <span className="text-[10px] font-black text-amber-950 tracking-tight text-center">
                          Cadbury Perk 10% Extra Crisp
                        </span>
                      </div>
                    </div>

                    {/* Center: Typography */}
                    <div className="z-10 flex-1 text-center md:text-left space-y-1 sm:space-y-1.5 px-2 sm:px-4 md:px-6 py-2 pb-6 md:pb-2">
                      <div className="text-[#7d3b0f] font-black text-sm sm:text-base md:text-lg drop-shadow-xs">
                        Snacks & Confectioneries
                      </div>
                      <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-[44px] font-black text-[#2b0f05] tracking-tight leading-none drop-shadow-xs">
                        Sweet Treats & Chocolates!
                      </h2>
                      <h3 className="text-lg sm:text-2xl md:text-3xl lg:text-[32px] font-extrabold text-[#5e2709] tracking-tight leading-tight drop-shadow-xs">
                        100% Genuine Branded Bars
                      </h3>
                      <p className="text-xs sm:text-sm font-semibold text-[#381a0b] pt-0.5 max-w-xl">
                        chilled storage delivery with irresistible discount offers
                      </p>
                      <div className="pt-2 sm:pt-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            playClick();
                            setSelectedCat('Snacks & Namkeens');
                            const el = document.getElementById('all-catalog-skus');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#3e1d10] via-[#542816] to-[#3a1a0d] border border-amber-400/50 text-[#fff8ee] font-extrabold text-xs sm:text-sm shadow-lg hover:shadow-amber-950/40 active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer"
                        >
                          <span>Explore Chocolates</span>
                          <ArrowRight className="w-4 h-4 text-amber-300" />
                        </button>
                      </div>
                    </div>

                    {/* Right: Chocolate Truffles & Slab Basket */}
                    <div className="hidden lg:flex z-10 shrink-0 w-3/12 xl:w-4/12 items-center justify-end h-48 sm:h-56 md:h-60">
                      <div className="w-52 xl:w-60 h-48 sm:h-52 rounded-2xl overflow-hidden shadow-xl border border-amber-200/60 bg-white/40">
                        <img
                          src="/banners/hero_chocolates.jpg"
                          alt="Artisan Chocolates & Truffles"
                          className="w-full h-full object-cover object-center filter drop-shadow-md hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })}

          {/* Subtle hover gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10" />
        </div>

        {/* Slide Progress Capsule Pill */}
        <div className="absolute bottom-2.5 sm:bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-4 py-1 rounded-full border border-slate-200/80 dark:border-slate-700/80 shadow-md transition-all">
          <span className="text-[11px] sm:text-xs font-black text-slate-800 dark:text-slate-200 tracking-wider">
            {POTHYS_BANNERS[currentBannerIndex]?.indexStr || `0${currentBannerIndex + 1}/04`}
          </span>
          <div className="flex items-center gap-1.5">
            {POTHYS_BANNERS.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  playClick();
                  setCurrentBannerIndex(idx);
                }}
                className={`rounded-full transition-all duration-300 cursor-pointer ${
                  currentBannerIndex === idx
                    ? 'w-7 sm:w-8 h-2 sm:h-2.5 bg-emerald-700 dark:bg-emerald-500 shadow-xs'
                    : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-slate-300 dark:bg-slate-600 hover:bg-slate-400'
                }`}
                title={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>


        {/* Navigation Arrows: Left Chevron */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            playClick();
            setCurrentBannerIndex((prev) => (prev - 1 + POTHYS_BANNERS.length) % POTHYS_BANNERS.length);
          }}
          className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-md border border-white/60 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800 hover:scale-110 active:scale-95 transition-all cursor-pointer z-20"
          title="Previous banner"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Navigation Arrows: Right Chevron */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            playClick();
            setCurrentBannerIndex((prev) => (prev + 1) % POTHYS_BANNERS.length);
          }}
          className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/85 dark:bg-slate-900/85 backdrop-blur-md flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-md border border-white/60 dark:border-slate-700/60 hover:bg-white dark:hover:bg-slate-800 hover:scale-110 active:scale-95 transition-all cursor-pointer z-20"
          title="Next banner"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </div>

      {/* ─── 2. Curated For You (Circular Category Bubbles) ──────────────── */}
      <div className="space-y-4">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white text-center">
          Curated For You
        </h3>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-1">
          {(showMoreCurated ? CURATED_CATEGORIES : CURATED_CATEGORIES.slice(0, 7)).map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                setSelectedCat(cat.name);
                const el = document.getElementById('all-catalog-skus');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="flex flex-col items-center gap-2 group cursor-pointer text-center w-24 sm:w-28"
            >
              <div className={`w-20 h-20 sm:w-22 sm:h-22 rounded-full ${cat.bg} border-2 border-emerald-500/30 p-2 flex items-center justify-center shadow-xs group-hover:scale-110 group-hover:border-emerald-600 transition-all duration-300 relative`}>
                <img
                  src={cat.image}
                  alt={cat.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/products/veg_tomato_country.png';
                  }}
                  className="max-h-full max-w-full object-contain"
                />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-700 leading-tight">
                {cat.name}
              </span>
            </div>
          ))}

          {/* Show more toggle */}
          <div
            onClick={() => setShowMoreCurated(!showMoreCurated)}
            className="flex flex-col items-center gap-2 group cursor-pointer text-center w-24 sm:w-28"
          >
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-600 p-2 flex items-center justify-center shadow-xs group-hover:scale-110 transition-all">
              <ChevronDown className={`w-6 h-6 text-emerald-600 transition-transform ${showMoreCurated ? 'rotate-180' : ''}`} />
            </div>
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 group-hover:text-emerald-700">
              {showMoreCurated ? 'Show less' : 'Show more'}
            </span>
          </div>
        </div>
      </div>

      {/* ─── 3. Shop by Grocery Category (Cards Grid) ─────────────────────── */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white text-center">
          Shop By Category
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATALOG_CATEGORY_CARDS.filter(c => c.name !== 'All').map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                setSelectedCat(cat.name);
                const el = document.getElementById('all-catalog-skus');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 flex flex-col items-center justify-between text-center shadow-2xs hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
            >
              <div className="h-28 w-full flex items-center justify-center p-2 rounded-xl bg-slate-50/50 dark:bg-slate-950/40 mb-2">
                <img
                  src={cat.image}
                  alt={cat.name}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = '/products/veg_potato.png';
                  }}
                  className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-emerald-700 leading-tight">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 4. Mid Banner: Exotic Seasonal Fruits ───────────────────────── */}
      <div 
        onClick={() => {
          playClick();
          setSelectedCat('Fruits & Vegetables');
          const el = document.getElementById('all-catalog-skus');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 dark:border-slate-800 transition-all duration-500 group cursor-pointer relative min-h-[250px] sm:min-h-[275px] bg-[#fffbf0] dark:bg-[#21170d] flex flex-col md:flex-row items-center justify-between p-4 sm:p-7 md:p-8 lg:px-14 select-none"
        title="Click to shop Exotic Fruits & Fresh Vegetables"
      >
        {/* Wooden tabletop shelf */}
        <div className="absolute bottom-0 left-0 right-0 h-14 sm:h-18 md:h-20 bg-gradient-to-t from-[#c89868]/35 via-[#deb388]/20 to-transparent border-b-[5px] border-[#b88554]/30 pointer-events-none" />

        {/* Ambient floating fruits */}
        <span className="absolute top-[12%] left-[16%] text-2xl select-none pointer-events-none opacity-85 animate-float">🍊</span>
        <span className="absolute top-[24%] left-[36%] text-xl select-none pointer-events-none opacity-85 animate-float-subtle">🍎</span>
        <span className="absolute top-[12%] right-[14%] text-lg select-none pointer-events-none opacity-85 animate-float">🍋</span>
        <span className="absolute top-[32%] right-[8%] text-base select-none pointer-events-none opacity-85 animate-float-subtle">🍃</span>

        {/* Left Hero Visual */}
        <div className="relative z-10 shrink-0 w-full md:w-5/12 lg:w-1/2 flex items-center justify-center md:justify-start gap-3 h-48 sm:h-56 md:h-64 pb-2">
          {/* Farm Harvest Card */}
          <div className="hidden sm:flex flex-col justify-between w-32 md:w-36 h-44 md:h-52 rounded-2xl bg-white/90 dark:bg-slate-800/90 shadow-xl border border-amber-200/60 p-2.5 shrink-0">
            <span className="text-[9px] font-black text-amber-800 dark:text-amber-300 uppercase tracking-widest bg-amber-100/90 dark:bg-amber-900/60 px-2 py-0.5 rounded-full self-start">
              FARM HARVEST
            </span>
            <div className="relative flex-1 flex items-center justify-center">
              <img
                src="/products/apple_royal_gala.png"
                alt="Royal Gala Apple"
                className="absolute left-0 bottom-1 h-14 object-contain drop-shadow-md hover:scale-105 transition-transform"
              />
              <img
                src="/products/banana_red.png"
                alt="Red Banana"
                className="absolute right-0 bottom-1 h-18 object-contain drop-shadow-md hover:scale-105 transition-transform"
              />
              <img
                src="/products/banana_nendran_ethan.png"
                alt="Ethan Banana"
                className="h-16 object-contain z-10 drop-shadow-lg hover:scale-105 transition-transform"
              />
            </div>
            <span className="text-[8px] font-extrabold text-amber-900/80 dark:text-amber-300/80 text-center">
              100% Organically Sourced
            </span>
          </div>

          {/* Exotic Fruits Basket */}
          <img
            src="/banners/hero_fruits.jpg"
            alt="Exotic Fruits Basket"
            className="h-full max-h-48 sm:max-h-56 md:max-h-60 w-auto object-contain rounded-2xl shadow-xl border border-white/60 dark:border-amber-900/60 filter drop-shadow-xl hover:scale-102 transition-transform duration-300"
          />
        </div>

        {/* Center / Right Content */}
        <div className="z-10 flex-1 text-center md:text-left space-y-1 sm:space-y-1.5 px-2 sm:px-6 md:px-8 py-2 sm:py-3">
          <div className="text-red-600 dark:text-red-400 font-extrabold text-sm sm:text-base md:text-lg">
            Premium Fruits & Fresh Harvests
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-[44px] font-black text-[#6e3715] dark:text-amber-300 tracking-tight leading-none drop-shadow-xs">
            Fresh Harvest & Exotic Fruits!
          </h2>
          <h3 className="text-lg sm:text-2xl md:text-3xl lg:text-[32px] font-extrabold text-[#994d1a] dark:text-amber-400 tracking-tight leading-tight drop-shadow-xs">
            100% Organically Sourced
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-[#4a2e1e] dark:text-amber-200/90 pt-0.5 max-w-xl">
            directly sourced from organic orchards with farm-fresh delivery
          </p>
          <div className="pt-2 sm:pt-3">
            <button className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#b45d24] hover:bg-[#9d4e1b] text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-xl active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer border border-white/20">
              <span>Explore Fresh Fruits</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── 5. Brands You Love (Circular Logos) ─────────────────────────── */}
      <div className="space-y-4 pt-2">
        <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white text-center">
          Brands You Love
        </h3>

        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {BRANDS_YOU_LOVE.map((b) => (
            <div
              key={b.name}
              onClick={() => {
                setSearch(b.name);
                const el = document.getElementById('all-catalog-skus');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 flex flex-col items-center justify-center shadow-xs hover:shadow-md hover:scale-110 transition-all cursor-pointer group"
              title={b.name}
            >
              <img
                src={b.logo}
                alt={b.name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = '/products/colgate_active_salt.png';
                }}
                className="max-h-10 max-w-full object-contain mb-1"
              />
              <span className="text-[9px] font-bold text-slate-500 group-hover:text-emerald-700 truncate max-w-full">
                {b.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ─── 6. AUTO-SWIPING CAROUSEL: Your Daily Essentials ─────────────── */}
      <AutoSwipingProductCarousel
        title="Your Daily Essentials"
        subtitle="Handpicked confectioneries, dry fruits, staples & personal care"
        tabs={ESSENTIALS_TABS}
        activeTab={activeEssentialsTab}
        onTabChange={(tab) => setActiveEssentialsTab(tab)}
        products={POTHYS_CHOCOLATES}
        onOpenDetails={(item) => setSelectedProductDetails(item)}
        onShowAll={() => {
          setSelectedCat('Snacks & Namkeens');
          const el = document.getElementById('all-catalog-skus');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        autoSwipeInterval={3200}
      />

      {/* ─── 7. AUTO-SWIPING CAROUSEL: Dairy & Chilled Favorites ──────────── */}
      <AutoSwipingProductCarousel
        title="Dairy & Chilled Favorites"
        subtitle="Milky Mist cheese spread, fresh paneer, butter, Amul butter & pure ghee"
        products={POTHYS_CHEESE}
        onOpenDetails={(item) => setSelectedProductDetails(item)}
        onShowAll={() => {
          setSelectedCat('Chilled & Dairy Foods');
          const el = document.getElementById('all-catalog-skus');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        autoSwipeInterval={3500}
      />

      {/* ─── 8. Mid Banner: Cleanliness is a Lifestyle ───────────────────── */}
      <div 
        onClick={() => {
          playClick();
          setSelectedCat('Cleaning Needs');
          const el = document.getElementById('all-catalog-skus');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        className="rounded-3xl overflow-hidden shadow-2xl border border-slate-200/90 dark:border-slate-800 transition-all duration-500 group cursor-pointer relative min-h-[250px] sm:min-h-[275px] bg-[#d6f5f3] dark:bg-[#0b2833] flex flex-col md:flex-row items-center justify-between p-4 sm:p-7 md:p-8 lg:px-14 select-none"
        title="Click to shop Home Hygiene & Care deals"
      >
        {/* Ambient floating bubbles & sparkles */}
        <span className="absolute top-[10%] left-[16%] text-3xl select-none pointer-events-none opacity-85 animate-float">🫧</span>
        <span className="absolute top-[24%] left-[36%] text-xl select-none pointer-events-none opacity-85 animate-float-subtle">✨</span>
        <span className="absolute top-[10%] right-[12%] text-2xl select-none pointer-events-none opacity-85 animate-float">🫧</span>
        <span className="absolute top-[30%] right-[8%] text-lg select-none pointer-events-none opacity-85 animate-float-subtle">💧</span>

        {/* Left Hero Cleaning Arrangement */}
        <div className="relative z-10 shrink-0 w-full md:w-5/12 lg:w-1/2 flex flex-col items-center justify-center md:justify-start h-48 sm:h-56 md:h-64 pb-2">
          <img
            src="/banners/hero_hygiene.jpg"
            alt="Home Hygiene & Fabric Care"
            className="h-40 sm:h-48 md:h-52 w-auto object-contain rounded-2xl shadow-xl border border-white/60 dark:border-cyan-900/60 filter drop-shadow-xl hover:scale-102 transition-transform duration-300"
          />
          <span className="text-[10px] sm:text-xs font-bold text-[#0c4a6e] dark:text-sky-300 mt-1.5 drop-shadow-xs">
            Comfort Fabric Conditioner and Fresh Scent Downy
          </span>
        </div>

        {/* Center / Right Content */}
        <div className="z-10 flex-1 text-center md:text-left space-y-1 sm:space-y-1.5 px-2 sm:px-6 md:px-8 py-2 sm:py-3">
          <div className="text-[#0a5c7a] dark:text-sky-400 font-extrabold text-sm sm:text-base md:text-lg drop-shadow-xs">
            Home Hygiene & Care
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-[44px] font-black text-[#0a3550] dark:text-sky-100 tracking-tight leading-none drop-shadow-xs">
            Cleanliness is not just a Choice;
          </h2>
          <h3 className="text-lg sm:text-2xl md:text-3xl lg:text-[32px] font-extrabold text-[#0c4a6e] dark:text-sky-300 tracking-tight leading-tight drop-shadow-xs">
            it's a Lifestyle.
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-[#27536d] dark:text-sky-200/90 pt-0.5 max-w-xl">
            embrace it with our superior & disinfectant products
          </p>
          <div className="pt-2 sm:pt-3">
            <button className="px-6 sm:px-7 py-2.5 sm:py-3 rounded-full bg-[#0b5b80] hover:bg-[#084866] text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-xl active:scale-95 transition-all inline-flex items-center gap-2 cursor-pointer border border-white/20">
              <span>Shop Hygiene Deals</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ─── 9. AUTO-SWIPING CAROUSEL: Quench Your Thirst ────────────────── */}
      <AutoSwipingProductCarousel
        title="Quench Your Thirst"
        subtitle="Brooke Bond Taj Mahal, Nescafe Sunrise, AVT Green Tea, Frooti & Fresh Coolers"
        products={POTHYS_BEVERAGES}
        onOpenDetails={(item) => setSelectedProductDetails(item)}
        onShowAll={() => {
          setSelectedCat('Beverages');
          const el = document.getElementById('all-catalog-skus');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        autoSwipeInterval={3400}
      />

      {/* ─── 10. AUTO-SWIPING CAROUSEL: Farm Fresh Fruits & Veg ──────────── */}
      <AutoSwipingProductCarousel
        title="Farm Fresh Fruits & Vegetables"
        subtitle="Direct from local farmers: Country tomatoes, onions, apples & sweet corn"
        products={POTHYS_PRODUCE}
        onOpenDetails={(item) => setSelectedProductDetails(item)}
        onShowAll={() => {
          setSelectedCat('Fruits & Vegetables');
          const el = document.getElementById('all-catalog-skus');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        autoSwipeInterval={3600}
      />

      {/* ─── 11. AUTO-SWIPING CAROUSEL: Ready To Eat Delights ─────────────── */}
      <AutoSwipingProductCarousel
        title="Ready To Eat Delights"
        subtitle="Authentic pickles, cooking sauces, masala oats, muesli & breakfast mixes"
        products={POTHYS_RTE}
        onOpenDetails={(item) => setSelectedProductDetails(item)}
        onShowAll={() => {
          setSelectedCat('Ready To Eat');
          const el = document.getElementById('all-catalog-skus');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        autoSwipeInterval={3500}
      />

      {/* ─── 11. AUTO-SWIPING CAROUSEL: Home Hygiene & Cleaning ──────────── */}
      <AutoSwipingProductCarousel
        title="Cleaning & Home Hygiene"
        subtitle="Harpic, Surf Excel, Comfort, Vim & Tide for spotless clean home"
        products={POTHYS_CLEANING}
        onOpenDetails={(item) => setSelectedProductDetails(item)}
        onShowAll={() => {
          setSelectedCat('Cleaning Needs');
          const el = document.getElementById('all-catalog-skus');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        autoSwipeInterval={3800}
      />

      {/* ─── 12. FULL CATALOG SKU EXPLORER (Grid & List Mode) ────────────── */}
      <div id="all-catalog-skus" className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-2xl text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{selectedCat === 'All' ? 'All Catalog SKUs' : selectedCat}</span>
              <span className="text-xs bg-emerald-500/10 text-emerald-600 font-extrabold px-3 py-1 rounded-full border border-emerald-500/20">
                {filteredProducts.length} Items
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Complete supermarket inventory items ready for stock dispatch and retail sale.</p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search product title or SKU..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATALOG_CATEGORY_CARDS.map((c) => {
            const isSelected = selectedCat === c.name;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedCat(c.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
                }`}
              >
                {c.name}
              </button>
            );
          })}
        </div>

        {/* View mode toggle: Grid or List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredProducts.map((p) => (
              <ProductCard
                key={p.id || p.sku}
                product={p}
                variant="pothys"
                onOpenDetails={(item) => setSelectedProductDetails(item)}
                onDelete={(id) => {
                  playBeep();
                  deleteProduct(id);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <th className="p-4">PRODUCT NAME</th>
                  <th className="p-4">SKU</th>
                  <th className="p-4">CATEGORY</th>
                  <th className="p-4">PRICE</th>
                  <th className="p-4">STOCK</th>
                  <th className="p-4">STATUS</th>
                  <th className="p-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredProducts.map((p) => (
                  <tr key={p.id || p.sku} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-bold flex items-center gap-3">
                      <img src={getProductImage(p)} alt={p.name} className="w-9 h-9 rounded-xl object-contain bg-white dark:bg-slate-800 p-0.5" />
                      <span className="text-slate-900 dark:text-white font-black">{p.name}</span>
                    </td>
                    <td className="p-4 font-mono text-[11px] text-slate-500">{p.sku}</td>
                    <td className="p-4">{p.category}</td>
                    <td className="p-4 font-black text-emerald-600 dark:text-emerald-400">₹{p.price.toFixed(2)}</td>
                    <td className="p-4 font-bold">{p.stock}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                        p.stock <= 0
                          ? 'bg-rose-500/10 text-rose-600'
                          : p.stock <= (p.threshold || 20)
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-emerald-500/10 text-emerald-600'
                      }`}>
                        {p.stock <= 0 ? 'Out of Stock' : p.stock <= (p.threshold || 20) ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            playSuccess();
                            addToCart(p);
                          }}
                          className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
                          title="Add to Billing Basket"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            playBeep();
                            deleteProduct(p.id || p.sku);
                          }}
                          className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600"
                          title="Delete SKU"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Add Product Modal ───────────────────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">Add New Catalog Product SKU</h3>
                <p className="text-xs text-slate-500">Create SKU item with price, category & inventory threshold.</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-bold text-slate-700 dark:text-slate-300">
              <div className="space-y-1">
                <label>Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Brown Basmati Rice"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Department Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    {CATALOG_CATEGORY_CARDS.filter(c => c.name !== 'All').map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label>Unit Selling Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="145.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label>Initial Stock Qty</label>
                  <input
                    type="number"
                    required
                    placeholder="50"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label>Low Stock Warning Level</label>
                  <input
                    type="number"
                    value={formData.threshold}
                    onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer mt-4"
              >
                <Plus className="w-4 h-4" />
                <span>SAVE SKU TO CATALOG</span>
              </button>
            </form>
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
    </div>
  );
}
