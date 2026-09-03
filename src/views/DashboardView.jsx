import React, { useState, useTransition, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
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
  Store
} from 'lucide-react';

export default function DashboardView() {
  const { products, setCurrentView, setAiDrawerOpen, user, purchaseRequests, approvePurchaseRequest, branchProfile, branchProducts, selectedBranch } = useApp();
  const { t } = useLanguage();
  const { playClick, playBeep, playSuccess } = useSoundEffects();

  const [activeTab, setActiveTab] = useState('All');
  const [isPending, startTransition] = useTransition();

  const handleTabChange = (tabName) => {
    playClick();
    startTransition(() => {
      setActiveTab(tabName);
    });
  };

  const lowStockItems = useMemo(() => {
    return branchProducts.filter(p => p.stock <= p.threshold);
  }, [branchProducts]);

  const totalStockValue = useMemo(() => {
    return branchProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
  }, [branchProducts]);

  return (
    <div className="space-y-6">
      
      {/* Top Welcome Banner (SmartMart Pro Style Red & Amber) */}
      <div className="bg-gradient-to-r from-green-700 via-emerald-700 to-teal-600 text-white p-8 sm:p-10 rounded-3xl shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-emerald-600/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
        
        <div className="space-y-3 relative z-10">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-300 text-slate-950 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-md">
              ⚡ 10-MIN EXPRESS DELIVERY ACTIVE
            </span>
            <span className="text-sm text-emerald-200 font-semibold">{selectedBranch.name}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Welcome back, {user?.name || 'Sarathi Kamal N'}
          </h2>
          <p className="text-green-100 text-sm sm:text-base max-w-2xl leading-relaxed font-medium">
            AI Executive Summary: SmartMart Pro sales are up <strong className="text-emerald-300 font-black">{branchProfile.salesGrowthWeek}</strong> this week. Fresh Vegetables & Dairy led revenue growth. {lowStockItems.length} SKUs require automated replenishment.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => { playBeep(); setAiDrawerOpen(true); }}
            className="bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold px-6 py-3.5 rounded-2xl text-sm flex items-center gap-2 shadow-lg transition-transform active:scale-95"
          >
            <Sparkles className="w-5 h-5 text-emerald-600 animate-spin-slow" />
            <span>Ask AI Insights</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards (4 Columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Revenue */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('totalRevenue')}</span>
            <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{branchProfile.revenueFormatted}</h3>
            <div className="flex items-center gap-1.5 mt-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>{branchProfile.revenueGrowth} vs last week</span>
            </div>
          </div>
        </div>

        {/* Products in Stock */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('productsInStock')}</span>
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
              <Package className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">₹{totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
            <div className="flex items-center gap-1.5 mt-1.5 text-sm font-bold text-amber-600 dark:text-amber-400">
              <Activity className="w-4 h-4" />
              <span>{branchProducts.length} Active SKUs</span>
            </div>
          </div>
        </div>

        {/* Active Customers */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('activeCustomers')}</span>
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Users className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{branchProfile.activeCustomers.toLocaleString()}</h3>
            <div className="flex items-center gap-1.5 mt-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>{branchProfile.customerGrowth} vs last week</span>
            </div>
          </div>
        </div>

        {/* Pending Orders */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('pendingOrders')}</span>
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center font-bold">
              <ShoppingBag className="w-6 h-6 text-rose-500" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-3xl font-black text-slate-900 dark:text-white">{branchProfile.pendingPOs} POs</h3>
            <div className="flex items-center gap-1.5 mt-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
              <span>{branchProfile.poGrowth} vs last week</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Revenue Chart + Low Stock Alert Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{t('monthlyRevenue')} Analytics</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Aggregate supermarket sales comparison Q2-Q3</p>
              </div>

              {/* View Switcher */}
              <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                {['All', 'Produce', 'Dairy', 'Bakery'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab)}
                    className={`px-4 py-1.5 rounded-xl text-sm font-bold transition-all ${
                      activeTab === tab 
                        ? 'bg-emerald-600 text-white shadow-xs' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom SVG Line Chart */}
            <div className="h-64 w-full pt-4 relative">
              {isPending && (
                <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xs flex items-center justify-center text-emerald-600 font-bold gap-2 z-10">
                  <Zap className="w-4 h-4 animate-spin text-emerald-600" /> REFRESHING SALES STREAM...
                </div>
              )}
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 180" preserveAspectRatio="none">
                <line x1="0" y1="30" x2="500" y2="30" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="4 4" />
                <line x1="0" y1="80" x2="500" y2="80" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="4 4" />
                <line x1="0" y1="130" x2="500" y2="130" stroke="currentColor" className="text-slate-100 dark:text-slate-800" strokeDasharray="4 4" />

                <defs>
                  <linearGradient id="pothysRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#059669" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
                <path
                  d={`${branchProfile.chartPath} L500,180 L0,180 Z`}
                  fill="url(#pothysRevenueGrad)"
                />
                <path
                  d={branchProfile.chartPath}
                  fill="none"
                  stroke="#059669"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                <circle cx="250" cy="50" r="5" fill="#059669" className="animate-pulse" />
                <circle cx="450" cy="40" r="5" fill="#10b981" />
              </svg>

              <div className="flex justify-between text-xs font-bold text-slate-400 mt-3">
                <span>APR</span>
                <span>MAY</span>
                <span>JUN</span>
                <span>JUL</span>
                <span>AUG</span>
                <span>SEP</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white uppercase tracking-wider mb-4">{t('topCategories')}</h4>
            <div className="space-y-4">
              {branchProfile.topCategories.map((cat, i) => (
                <div key={i} className="space-y-1.5 text-sm">
                  <div className="flex justify-between font-bold">
                    <span className="text-slate-700 dark:text-slate-300">{cat.name}</span>
                    <span className="text-slate-900 dark:text-white">{cat.val}</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color} rounded-full transition-all duration-500`} style={{ width: cat.pct }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500 animate-pulse" />
                <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{t('lowStockAlerts')}</h3>
              </div>
              <span className="text-sm bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold px-3 py-1 rounded-full">
                {lowStockItems.length} Items
              </span>
            </div>

            <div className="space-y-3">
              {lowStockItems.slice(0, 4).map((item) => (
                <div key={item.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="min-w-0 flex-1 pr-3">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">{item.name}</h4>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">SKU: {item.sku}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-extrabold px-2.5 py-1 rounded-md ${
                      item.stock === 0 ? 'bg-red-600 text-white' : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                    }`}>
                      {item.stock === 0 ? 'OUT OF STOCK' : 'LOW STOCK'}
                    </span>
                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-1.5">
                      {item.stock} {item.unit}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={() => { playClick(); setCurrentView('inventory'); }}
            className="w-full mt-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black py-4 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-transform active:scale-95"
          >
            <span>GENERATE REORDER POs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Branch Manager / Super Admin Procurement Requests Panel */}
      {(user?.role === 'Branch Manager' || user?.role === 'Super Admin') && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 mt-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-500" />
              <span>{t("Pending Procurement Reorder Requests")} ({purchaseRequests?.length || 0})</span>
            </h3>
            <span className="text-sm text-slate-400 font-bold">{t("Awaiting Manager PO Issuance")}</span>
          </div>

          {(!purchaseRequests || purchaseRequests.length === 0) ? (
            <p className="text-sm text-slate-400 py-6 text-center">{t("No pending purchase requests. All branch inventory healthy.")}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {purchaseRequests.map(req => (
                <div key={req.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">{req.productName}</h4>
                    <p className="text-xs text-slate-400 mt-1">Supplier: {req.supplierName}</p>
                    <div className="flex gap-2 items-center mt-2 text-xs font-black uppercase text-amber-600">
                      <span>QTY: {req.quantity} units</span>
                      <span>•</span>
                      <span>Request ID: {req.id}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => { playSuccess(); approvePurchaseRequest(req.id); }}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl shadow-md transition-transform active:scale-95 shrink-0"
                  >
                    {t("Approve & Issue PO")}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
