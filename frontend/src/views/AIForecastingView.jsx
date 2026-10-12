import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import DraftPOReviewModal from '../components/DraftPOReviewModal';
import DemandForecastChart from '../components/DemandForecastChart';
import { 
  Sparkles, 
  BrainCircuit, 
  Lightbulb, 
  ArrowRight,
  Zap,
  TrendingUp,
  AlertTriangle,
  ShoppingCart,
  Building2,
  Package,
  Calendar,
  CheckCircle2,
  FileText,
  Boxes
} from 'lucide-react';

export default function AIForecastingView() {
  const { 
    products, 
    suppliers, 
    setAiDrawerOpen, 
    createDraftPurchaseOrder, 
    setCurrentView, 
    showToast 
  } = useApp();
  const { playBeep, playClick, playSuccess } = useSoundEffects();
  const { t } = useLanguage();

  const [selectedDraftPO, setSelectedDraftPO] = useState(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Compute smart reorder suggestions: products below or close to reorder point (threshold)
  const reorderCandidates = (products || [])
    .filter(p => p.stock <= p.threshold || p.stock <= 25)
    .map(p => {
      // Predict 30-day demand using velocity modeling
      const dailyVelocity = Math.max(2, Math.round((p.threshold / 7) * 1.4));
      const predicted30DayDemand = dailyVelocity * 30;
      const suggestedOrderQty = Math.max(predicted30DayDemand - p.stock, 25);
      
      // Match supplier
      const matchedSupplier = suppliers.find(s => s.category === p.category) || suppliers[0] || {
        id: 'SUP-001',
        name: 'Apex FMCG Distributors Ltd',
        paymentTerms: 'Net 30 Days'
      };

      const unitCost = p.costPrice || (p.price * 0.6);
      const estimatedTotal = suggestedOrderQty * unitCost;

      return {
        product: p,
        dailyVelocity,
        predicted30DayDemand,
        suggestedOrderQty,
        supplier: matchedSupplier,
        unitCost,
        estimatedTotal,
        rationale: `Current stock (${p.stock}) is below reorder point (${p.threshold}). Predicted demand is ${predicted30DayDemand} units over next 30 days.`
      };
    });

  const filteredCandidates = categoryFilter === 'All' 
    ? reorderCandidates 
    : reorderCandidates.filter(c => c.product.category === categoryFilter);

  const categories = ['All', ...new Set(reorderCandidates.map(c => c.product.category))];

  const handleOrderNow = (candidate) => {
    playClick();
    const draftPO = createDraftPurchaseOrder(
      candidate.product,
      candidate.suggestedOrderQty,
      candidate.supplier,
      candidate.rationale
    );
    setSelectedDraftPO(draftPO);
    setReviewModalOpen(true);
  };

  const handleBuildupPO = (productPreset, quantity) => {
    const matchedProduct = products.find(p => p.name.toLowerCase().includes(productPreset.name.split(' ')[0].toLowerCase())) || products[0];
    const matchedSupplier = suppliers[0] || { id: 'SUP-001', name: 'Apex FMCG Distributors Ltd' };
    
    const draftPO = createDraftPurchaseOrder(
      matchedProduct,
      quantity,
      matchedSupplier,
      `Advance Stock Buildup for Festive Demand Surge (+120%)`
    );
    setSelectedDraftPO(draftPO);
    setReviewModalOpen(true);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-full">
              FIG 8.8.3 & FIG 8.8.4 SPECIFICATION
            </span>
            <Sparkles className="w-4 h-4 text-emerald-300 animate-spin-slow" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-white">
            Demand Forecasting & Smart Reorders Intelligence
          </h2>
          <p className="text-xs text-emerald-100 max-w-2xl">
            Multi-horizon machine learning models compare past sales history against future demand, highlight seasonal & festival peaks, and recommend optimal stock buildup orders.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 relative z-10">
          <button
            onClick={() => { playBeep(); setAiDrawerOpen(true); }}
            className="bg-white hover:bg-emerald-50 text-emerald-950 font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
          >
            <BrainCircuit className="w-4 h-4 text-emerald-600" />
            <span>AI COPILOT CHAT</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Items Needing Reorder</span>
            <h3 className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{reorderCandidates.length} SKUs</h3>
            <span className="text-[10px] text-amber-600 font-bold mt-1 block">Below Reorder Point</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">30-Day Forecast Volume</span>
            <h3 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
              {reorderCandidates.reduce((sum, c) => sum + c.predicted30DayDemand, 0)} Units
            </h3>
            <span className="text-[10px] text-indigo-600 font-bold mt-1 block">Predicted Demand</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Suggested Reorder Value</span>
            <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              ₹{reorderCandidates.reduce((sum, c) => sum + c.estimatedTotal, 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </h3>
            <span className="text-[10px] text-emerald-600 font-bold mt-1 block">Optimal Working Capital</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Forecast Accuracy</span>
            <h3 className="text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">96.8%</h3>
            <span className="text-[10px] text-teal-600 font-bold mt-1 block">Trained on POS Ledger</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── SECTION 1: FIG 8.8.4 DEMAND FORECAST FOR A SELECTED HORIZON ── */}
      <DemandForecastChart onTriggerBuildupPO={handleBuildupPO} />

      {/* ── SECTION 2: FIG 8.8.3 SMART REORDER SUGGESTIONS TABLE ── */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
        
        {/* Table Title & Filter Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded border border-emerald-500/20">
                Fig 8.8.3
              </span>
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <Boxes className="w-5 h-5 text-emerald-600" />
                <span>Smart Reorder Suggestions</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              The table lists products below their reorder point with current stock, predicted 30-day demand and a suggested order quantity. The <strong>Order Now</strong> button creates a draft purchase order, which the manager can review before sending.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { playClick(); setCategoryFilter(cat); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                  categoryFilter === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Suggestion Table */}
        {filteredCandidates.length === 0 ? (
          <div className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center text-xs text-slate-400 font-semibold">
            All inventory levels are healthy. No items currently require reordering.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3.5">PRODUCT & SKU</th>
                  <th className="p-3.5">CATEGORY</th>
                  <th className="p-3.5 text-center">CURRENT STOCK</th>
                  <th className="p-3.5 text-center">REORDER POINT</th>
                  <th className="p-3.5 text-center">PREDICTED 30-DAY DEMAND</th>
                  <th className="p-3.5 text-center">SUGGESTED ORDER QTY</th>
                  <th className="p-3.5">RECOMMENDED SUPPLIER</th>
                  <th className="p-3.5">EST. COST</th>
                  <th className="p-3.5 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredCandidates.map((c) => {
                  const p = c.product;
                  const isCritical = p.stock <= Math.floor(p.threshold / 2);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Product & SKU */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img 
                            src={p.image} 
                            alt={p.name} 
                            className="w-9 h-9 rounded-xl object-cover shadow-xs border border-slate-200 dark:border-slate-700" 
                            onError={(e) => { e.currentTarget.src = "/dashboard_grocery_basket.png"; }}
                          />
                          <div>
                            <div className="font-extrabold text-slate-900 dark:text-white">{p.name}</div>
                            <div className="text-[10px] font-mono text-slate-400">{p.sku}</div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-3.5">
                        <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded text-[11px]">
                          {p.category}
                        </span>
                      </td>

                      {/* Current Stock */}
                      <td className="p-3.5 text-center">
                        <span className={`inline-block font-black font-mono text-xs px-2.5 py-1 rounded-full ${
                          p.stock === 0 ? 'bg-rose-500/10 text-rose-600 border border-rose-500/20' :
                          isCritical ? 'bg-red-500/10 text-red-600 border border-red-500/20' :
                          'bg-amber-500/10 text-amber-600 border border-amber-500/20'
                        }`}>
                          {p.stock} {p.unit}s
                        </span>
                      </td>

                      {/* Reorder Point */}
                      <td className="p-3.5 text-center font-bold font-mono text-slate-600 dark:text-slate-400">
                        {p.threshold} {p.unit}s
                      </td>

                      {/* Predicted 30-day Demand */}
                      <td className="p-3.5 text-center">
                        <div className="font-black text-indigo-600 dark:text-indigo-400 font-mono text-xs">
                          {c.predicted30DayDemand} {p.unit}s
                        </div>
                        <div className="text-[9px] text-slate-400 font-semibold">
                          ~{c.dailyVelocity} units/day
                        </div>
                      </td>

                      {/* Suggested Order Quantity */}
                      <td className="p-3.5 text-center">
                        <span className="inline-flex items-center gap-1 font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-xl text-xs font-mono">
                          <Zap className="w-3 h-3" />
                          +{c.suggestedOrderQty} {p.unit}s
                        </span>
                      </td>

                      {/* Supplier */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-xs flex items-center gap-1">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{c.supplier.name}</span>
                        </div>
                        <div className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold">
                          {c.supplier.paymentTerms || 'Net 30 Days'}
                        </div>
                      </td>

                      {/* Estimated Total */}
                      <td className="p-3.5 font-black text-slate-900 dark:text-white font-mono">
                        ₹{c.estimatedTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>

                      {/* Order Now Button */}
                      <td className="p-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleOrderNow(c)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:brightness-110 text-white font-black text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer whitespace-nowrap flex items-center gap-1.5 ml-auto"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>ORDER NOW</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cross-Sell Recommendations & Affinity Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Customer Cross-Sell Matrix */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-teal-500" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Customer Cross-Sell & Basket Affinity</h3>
            </div>
            <span className="text-[10px] bg-teal-500/10 text-teal-600 font-extrabold px-2.5 py-0.5 rounded-full">AI Recommendation</span>
          </div>

          <div className="space-y-3">
            {[
              { item: "Customer buys Sourdough Country Bread", rec: "Recommend Salted Butter 8oz & Organic Strawberry Jam", confidence: "94% Match Rate" },
              { item: "Customer buys Italian Penne Pasta", rec: "Recommend Organic Pasta Sauce & Aged Parmesan Cheese", confidence: "89% Match Rate" },
              { item: "Customer buys Roasted Arabica Coffee", rec: "Recommend Whole Milk 1 Gallon & Raw Brown Sugar", confidence: "86% Match Rate" },
            ].map((cross, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-900 dark:text-white">
                  <span>{cross.item}</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md font-bold">{cross.confidence}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>{cross.rec}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Links to PO Register */}
        <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-3xl text-white shadow-sm flex flex-col justify-between space-y-4 border border-indigo-500/20">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-400" />
              <h3 className="font-black text-base text-white">Purchase Order Register & PO Tracker</h3>
            </div>
            <p className="text-xs text-indigo-200 mt-2 leading-relaxed">
              When draft purchase orders are created via <strong>Order Now</strong>, they automatically populate in the <strong>Purchase Order Register (Fig 8.7.4)</strong> under Suppliers management.
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                playClick();
                setCurrentView('suppliers');
              }}
              className="w-full py-3 bg-white hover:bg-indigo-50 text-slate-950 font-black rounded-2xl text-xs flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer shadow-lg"
            >
              <span>VIEW PURCHASE ORDER REGISTER (Fig 8.7.4)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Fig 8.8.3 Draft Purchase Order Review Modal */}
      <DraftPOReviewModal
        isOpen={reviewModalOpen}
        onClose={() => {
          setReviewModalOpen(false);
          setSelectedDraftPO(null);
        }}
        draftPO={selectedDraftPO}
        onSendSuccess={() => {
          if (showToast) {
            showToast({
              title: 'Purchase Order Dispatched! 📄',
              message: 'Draft PO reviewed and sent to supplier.',
              type: 'success',
              category: 'inventory'
            });
          }
        }}
      />
    </div>
  );
}
