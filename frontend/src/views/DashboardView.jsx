import React, { useState, useTransition, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import Logo from '../components/Logo';
import { 
  DollarSign, 
  Package, 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  AlertTriangle, 
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
  Store,
  CheckCircle2,
  Clock,
  Plus,
  FileText,
  Receipt,
  Boxes,
  UserPlus,
  BarChart3,
  ChevronRight,
  ShieldCheck,
  Tag,
  Leaf,
  ChevronDown
} from 'lucide-react';

export default function DashboardView() {
  const { 
    products, 
    setCurrentView, 
    setAiDrawerOpen, 
    user, 
    purchaseRequests, 
    approvePurchaseRequest, 
    branchProfile, 
    branchProducts, 
    selectedBranch,
    showToast
  } = useApp();
  const { t } = useLanguage();
  const { playClick, playBeep, playSuccess } = useSoundEffects();

  const [activeTab, setActiveTab] = useState('All');
  const [selectedTimeRange, setSelectedTimeRange] = useState('Last 6 Months');
  const [isPending, startTransition] = useTransition();

  const lowStockItems = useMemo(() => {
    return [
      { id: '1', name: 'Tomatoes', category: 'Vegetables', quantity: '2 kg', status: 'Low Stock', statusColor: 'bg-rose-50 text-rose-600 border-rose-200', image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=120&q=80' },
      { id: '2', name: 'Sunflower Oil', category: 'Cooking Oils', quantity: '5 L', status: 'Low Stock', statusColor: 'bg-rose-50 text-rose-600 border-rose-200', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=120&q=80' },
      { id: '3', name: 'Paneer', category: 'Dairy Products', quantity: '3 kg', status: 'Low Stock', statusColor: 'bg-rose-50 text-rose-600 border-rose-200', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=120&q=80' },
      { id: '4', name: 'Green Chilies', category: 'Vegetables', quantity: '1 kg', status: 'Critical', statusColor: 'bg-amber-50 text-amber-600 border-amber-200', image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=120&q=80' },
    ];
  }, []);

  const recentOrders = [
    { id: '#SMT10245', customer: 'Ramesh Kumar', amount: '₹2,840.00', time: 'Today, 10:24 AM', status: 'Delivered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { id: '#SMT10244', customer: 'Priya S', amount: '₹1,260.00', time: 'Today, 09:12 AM', status: 'Processing', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    { id: '#SMT10243', customer: 'Anitha Stores', amount: '₹5,480.00', time: 'Yesterday, 08:45 PM', status: 'Packed', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: '#SMT10242', customer: 'Karthik', amount: '₹980.00', time: 'Yesterday, 02:29 PM', status: 'Delivered', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  ];

  const monthlyChartData = [
    { month: 'May', revenue: 70, orders: 120, revenueFormatted: '₹0.7L' },
    { month: 'Jun', revenue: 105, orders: 190, revenueFormatted: '₹1.05L' },
    { month: 'Jul', revenue: 120, orders: 230, revenueFormatted: '₹1.2L' },
    { month: 'Aug', revenue: 145, orders: 270, revenueFormatted: '₹1.45L' },
    { month: 'Sep', revenue: 170, orders: 310, revenueFormatted: '₹1.7L' },
    { month: 'Oct', revenue: 195, orders: 380, revenueFormatted: '₹1.95L' },
  ];

  return (
    <div className="space-y-6 font-sans">
      
      {/* ─── 1. Top Hero Banner: Fresh Groceries. Healthier Tomorrow. (Native Ultra-Crisp UI) ─── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#fbf8f2] via-[#faf6ee] to-[#f4f7f2] dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 border border-[#e8ece4] dark:border-slate-800 p-6 sm:p-8 lg:p-10 shadow-xs flex flex-col lg:flex-row items-center justify-between gap-8 min-h-[260px]">
        
        {/* 4K Ultra-Crisp Fresh Produce Basket Artwork on Right */}
        <div 
          className="absolute inset-y-0 right-0 w-full lg:w-3/5 bg-cover bg-right bg-no-repeat pointer-events-none opacity-95 transition-opacity"
          style={{ 
            backgroundImage: `url('/@fs/C:/Users/sarat/.gemini/antigravity-ide/brain/3fc5a59a-2f99-4f0b-9a42-b62dd25c66f2/fresh_produce_basket_hd_1791127978409.jpg')`,
            maskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 10%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,1) 55%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.15) 10%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,1) 55%)"
          }}
        />

        {/* Ambient Warm Sunlight Accent */}
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        {/* Left Headline & Features: Native Vector Typography (Never Blurry) */}
        <div className="space-y-4 max-w-xl z-10">
          <div className="flex items-center gap-2">
            <Logo size="xs" showText={false} />
            <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200 tracking-tight">
              SmartMart <span className="text-amber-500 font-black">Pro</span>
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            Fresh Groceries. <span className="text-emerald-700 dark:text-emerald-400">Healthier Tomorrow.</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed max-w-lg">
            AI-powered insights, smart inventory and seamless operations for your grocery retail business.
          </p>

          {/* 3 Real Interactive Feature Badges */}
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-2.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-emerald-100 dark:border-slate-700 shadow-xs hover:border-emerald-300 transition-colors">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-black text-xs">
                ₹
              </div>
              <div className="leading-tight">
                <span className="block text-xs font-black text-slate-900 dark:text-white">Fresh Products</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Direct from Farms</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-emerald-100 dark:border-slate-700 shadow-xs hover:border-emerald-300 transition-colors">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Tag className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight">
                <span className="block text-xs font-black text-slate-900 dark:text-white">Better Prices</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">More Value</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-emerald-100 dark:border-slate-700 shadow-xs hover:border-emerald-300 transition-colors">
              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div className="leading-tight">
                <span className="block text-xs font-black text-slate-900 dark:text-white">Trusted Quality</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">For Your Family</span>
              </div>
            </div>
          </div>

          {/* Carousel Pagination Dots */}
          <div className="flex items-center gap-1.5 pt-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-700 dark:bg-emerald-400 shadow-xs"></span>
            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></span>
            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700"></span>
          </div>
        </div>
      </div>

      {/* ─── Compact AI Smart Summary Strip (Sleek & Non-Obstructive) ─── */}
      <div 
        onClick={() => { playClick(); setAiDrawerOpen(true); }}
        className="bg-white/95 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl px-4 py-3 border border-emerald-100 dark:border-slate-800 shadow-xs hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 transition-all flex flex-wrap items-center justify-between gap-3 cursor-pointer group"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-spin-slow" />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-xs font-black text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
              AI Summary
              <span className="text-[10px] font-bold px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/70 text-emerald-800 dark:text-emerald-300 rounded-md">Live</span>
            </span>
            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
              Sales are up <strong className="text-slate-900 dark:text-white font-bold">14.2%</strong> this week. Fresh Vegetables & Dairy continue to drive revenue growth.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
            <TrendingUp className="w-3.5 h-3.5" /> +14.2% vs last week
          </span>
          <span className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
            <span>Ask AI</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>


      {/* ─── 2. KPI Metric Cards (4 Columns) ─────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Total Revenue */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-black text-base border border-emerald-100">
                ₹
              </div>
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">TOTAL REVENUE</span>
            </div>
            <span className="text-slate-400 font-bold text-xs">•••</span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">₹1,48,250.00</h3>
              <div className="flex items-center gap-1 mt-1 text-xs font-bold text-emerald-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+12.4% vs last week</span>
              </div>
            </div>
            <svg className="w-16 h-8 text-emerald-500" viewBox="0 0 64 32" fill="none">
              <path d="M2 28 L14 20 L28 24 L42 12 L54 16 L62 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* 2. Products in Stock */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100">
                <Boxes className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">PRODUCTS IN STOCK</span>
            </div>
            <span className="text-slate-400 font-bold text-xs">•••</span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">₹1,497,068.85</h3>
              <div className="flex items-center gap-1 mt-1 text-xs font-bold text-amber-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+16.3% Active SKUs</span>
              </div>
            </div>
            <svg className="w-16 h-8 text-emerald-500" viewBox="0 0 64 32" fill="none">
              <path d="M2 26 L16 22 L28 18 L40 24 L52 10 L62 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* 3. Active Customers */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100">
                <Users className="w-5 h-5 text-sky-600" />
              </div>
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">ACTIVE CUSTOMERS</span>
            </div>
            <span className="text-slate-400 font-bold text-xs">•••</span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">1,842</h3>
              <div className="flex items-center gap-1 mt-1 text-xs font-bold text-sky-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+8.2% vs last week</span>
              </div>
            </div>
            <svg className="w-16 h-8 text-sky-500" viewBox="0 0 64 32" fill="none">
              <path d="M2 24 L14 26 L28 16 L42 20 L54 8 L62 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* 4. Pending Orders */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100">
                <FileText className="w-5 h-5 text-amber-600" />
              </div>
              <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">PENDING ORDERS</span>
            </div>
            <span className="text-slate-400 font-bold text-xs">•••</span>
          </div>
          <div className="mt-4 flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">38 POs</h3>
              <div className="flex items-center gap-1 mt-1 text-xs font-bold text-amber-600">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+15.6% vs last week</span>
              </div>
            </div>
            <svg className="w-16 h-8 text-amber-500" viewBox="0 0 64 32" fill="none">
              <path d="M2 28 L14 24 L26 18 L40 22 L52 12 L62 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
      </div>


      {/* ─── 3. Lower Section: 4 Distinct Grid Modules ────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-stretch">
        
        {/* Col 1: Monthly Sales Revenue Analytics */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-600" />
                <h4 className="font-extrabold text-xs text-slate-900">Monthly Sales Revenue Analytics</h4>
              </div>
              <select
                value={selectedTimeRange}
                onChange={(e) => setSelectedTimeRange(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 text-[10px] font-bold text-slate-700 cursor-pointer focus:outline-none"
              >
                <option>Last 6 Months</option>
                <option>Last 30 Days</option>
                <option>This Year</option>
              </select>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-4 text-[10px] font-bold text-slate-500 mb-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                Revenue (₹)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                Orders
              </span>
            </div>

            {/* Bar & Trend Chart Visualization */}
            <div className="relative h-44 flex items-end justify-between gap-2 pt-6 px-1">
              {monthlyChartData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <div className="relative w-full flex justify-center items-end h-32">
                    {/* Bar */}
                    <div 
                      className="w-5 bg-emerald-600 rounded-t-md transition-all duration-300 group-hover:bg-emerald-500"
                      style={{ height: `${(item.revenue / 200) * 100}%` }}
                      title={`${item.month}: Revenue ${item.revenueFormatted}, Orders: ${item.orders}`}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500">{item.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Col 2: Low Stock Alerts */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h4 className="font-extrabold text-xs text-slate-900">Low Stock Alerts</h4>
              </div>
              <button 
                onClick={() => setCurrentView('inventory')}
                className="text-[10px] font-extrabold text-emerald-700 hover:underline flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <img src={item.image} alt={item.name} className="w-8 h-8 rounded-xl object-cover border border-slate-100 shrink-0" />
                    <div>
                      <h5 className="font-bold text-xs text-slate-900 leading-tight">{item.name}</h5>
                      <span className="text-[10px] text-slate-500">{item.category}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-black text-slate-800 block">{item.quantity}</span>
                    <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${item.statusColor}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Col 3: Quick Actions */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-emerald-600" />
              <h4 className="font-extrabold text-xs text-slate-900">Quick Actions</h4>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { name: 'Add Product', icon: Plus, action: () => setCurrentView('products') },
                { name: 'Create PO', icon: FileText, action: () => setCurrentView('suppliers') },
                { name: 'POS Billing', icon: Receipt, action: () => setCurrentView('billing') },
                { name: 'Stock Update', icon: Boxes, action: () => setCurrentView('inventory') },
                { name: 'New Customer', icon: UserPlus, action: () => setCurrentView('customers') },
                { name: 'Generate Report', icon: BarChart3, action: () => setCurrentView('reports') },
              ].map((btn, idx) => {
                const Icon = btn.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => { playClick(); btn.action(); }}
                    className="p-3 rounded-2xl bg-emerald-50/60 hover:bg-emerald-100/70 border border-emerald-100 text-slate-800 transition-all flex flex-col items-center justify-center gap-1.5 active:scale-95 group"
                  >
                    <Icon className="w-4 h-4 text-emerald-700 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-extrabold text-slate-900">{btn.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Col 4: Recent Orders */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <h4 className="font-extrabold text-xs text-slate-900">Recent Orders</h4>
              </div>
              <button 
                onClick={() => setCurrentView('deliveries')}
                className="text-[10px] font-extrabold text-emerald-700 hover:underline flex items-center gap-0.5"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-3">
              {recentOrders.map((ord) => (
                <div key={ord.id} className="flex items-center justify-between p-2 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                  <div>
                    <span className="font-mono text-[10px] font-black text-slate-800">{ord.id}</span>
                    <h5 className="font-bold text-xs text-slate-900 leading-tight">{ord.customer}</h5>
                    <span className="text-[9px] text-slate-400">{ord.time}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-black text-slate-900 block">{ord.amount}</span>
                    <span className={`inline-block text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${ord.color}`}>
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ─── 4. Bottom Footer Note ──────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 text-xs font-bold text-slate-500">
        <div className="flex items-center gap-2">
          <Logo size="xs" showText={false} />
          <span>SmartMart Pro</span>
          <span>•</span>
          <span className="text-slate-400 font-medium">Freshness • Quality • Growth</span>
        </div>
        <div className="text-emerald-700 italic font-medium">
          Better Groceries. Brighter Future. 🌿
        </div>
      </div>
    </div>
  );
}
