import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { 
  Boxes, 
  AlertTriangle, 
  XCircle, 
  Download, 
  Search, 
  ChevronLeft, 
  ChevronRight,
  MapPin,
  IndianRupee
} from 'lucide-react';

export default function InventoryView() {
  const { products, suppliers, createPurchaseRequest, approvePurchaseRequest, receiveWarehouseGoods, branchProducts, purchaseRequests, purchaseOrders, showToast } = useApp();
  const { playClick, playSuccess } = useSoundEffects();
  const { t } = useLanguage();
  const [filterTab, setFilterTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Reorder modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reorderQty, setReorderQty] = useState(50);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [purchaseSource, setPurchaseSource] = useState('');

  const totalCount = branchProducts.length;
  const lowCount = branchProducts.filter(p => p.stock <= p.threshold && p.stock > 0).length;
  const outCount = branchProducts.filter(p => p.stock === 0).length;

  const filteredProducts = branchProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (filterTab === 'Low Stock') return p.stock <= p.threshold && p.stock > 0 && matchesSearch;
    if (filterTab === 'Out of Stock') return p.stock === 0 && matchesSearch;
    if (filterTab === 'Produce') return (p.category.includes('Produce') || p.category.includes('Fruits')) && matchesSearch;
    if (filterTab === 'Dairy') return p.category.includes('Dairy') && matchesSearch;
    
    return matchesSearch;
  });

  const handleReorderSubmit = (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    const cost = unitCost ? parseFloat(unitCost) : selectedProduct.price * 0.6;
    createPurchaseRequest(selectedProduct.id, reorderQty, selectedSupplierId, cost, purchaseSource || undefined);
    playSuccess();
    
    if (showToast) {
      showToast({
        title: 'Purchase Request Submitted! 📦',
        message: `Reorder request for ${reorderQty} ${selectedProduct.unit}s of ${selectedProduct.name} sent to Suppliers Procurement Queue.`,
        type: 'success',
        category: 'inventory',
        duration: 5000
      });
    }

    setSelectedProduct(null);
    setReorderQty(50);
    setUnitCost('');
    setPurchaseSource('');
  };

  const openReorderModal = (product) => {
    playClick();
    setSelectedProduct(product);
    setSelectedSupplierId(suppliers[0]?.id || 'SUP-01');
    setReorderQty(50);
    setUnitCost((product.price * 0.6).toFixed(2));
    setPurchaseSource('');
  };

  const computedTotal = unitCost ? (parseFloat(unitCost) * reorderQty).toFixed(2) : ((selectedProduct?.price || 0) * 0.6 * reorderQty).toFixed(2);

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t("Inventory & Stock Control")}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t("Track SKU stock levels, monitor threshold alerts, and reorder products across branches.")}</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={playClick}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            <span>{t("EXPORT CSV")}</span>
          </button>
        </div>
      </div>

      {/* Top 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t("Total Tracked Products")}</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalCount} {t("Items")}</h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">{t("All Categories Active")}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Boxes className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t("lowStockAlerts")}</span>
            <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{lowCount} {t("lowStockAlerts")}</h3>
            <span className="text-[10px] text-amber-600 font-bold mt-1 block">{t("Reorder Required")}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t("Out of Stock Items")}</span>
            <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{outCount} {t("Out")}</h3>
            <span className="text-[10px] text-rose-600 font-bold mt-1 block">{t("PO Recommended")}</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
            <XCircle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("Search catalog by SKU or title...")}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['All', 'Low Stock', 'Out of Stock', 'Dairy', 'Produce'].map((tab) => (
              <button
                key={tab}
                onClick={() => { playClick(); setFilterTab(tab); }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                  filterTab === tab
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {t(tab)}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5">{t("PRODUCT NAME")}</th>
                <th className="p-3.5">{t("SKU")}</th>
                <th className="p-3.5">{t("CATEGORY")}</th>
                <th className="p-3.5">{t("STOCK QTY")}</th>
                <th className="p-3.5">{t("REORDER LEVEL")}</th>
                <th className="p-3.5">{t("CRITICAL LEVEL")}</th>
                <th className="p-3.5">{t("STATUS")}</th>
                <th className="p-3.5 text-right">{t("ACTION")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredProducts.map((p) => {
                const activePR = (purchaseRequests || []).find(r => r.productId === p.id);
                const activePO = (purchaseOrders || []).find(o => o.productId === p.id);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-8 h-8 rounded-xl object-cover" />
                      <span>{t(p.name)}</span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500 font-semibold">{p.sku}</td>
                    <td className="p-3.5">{p.category}</td>
                    <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">{p.stock} {p.unit}s</td>
                    <td className="p-3.5 font-semibold text-slate-500">{p.threshold} {p.unit}s</td>
                    <td className="p-3.5 font-semibold text-slate-400">{Math.floor(p.threshold / 2)} {p.unit}s</td>
                    <td className="p-3.5">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                        p.stock === 0 ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                        p.stock <= Math.floor(p.threshold / 2) ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                        p.stock <= p.threshold ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                        'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      }`}>
                        {p.stock === 0 ? t('Out of Stock') : p.stock <= Math.floor(p.threshold / 2) ? t('CRITICAL STOCK') : p.stock <= p.threshold ? t('Low Stock') : t('In Stock')}
                      </span>
                      {activePR && (
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            📦 PR Pending ({activePR.quantity} {p.unit}s)
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              playSuccess();
                              approvePurchaseRequest(activePR.id);
                              const poId = `PO-${Math.floor(1000 + Math.random() * 9000)}`;
                              receiveWarehouseGoods(poId, activePR.quantity, 0);
                              if (showToast) {
                                showToast({
                                  title: 'Stock Intake Complete! 🎉',
                                  message: `Added +${activePR.quantity} ${p.unit}s of ${p.name} into store inventory. Status is now IN STOCK!`,
                                  type: 'success',
                                  category: 'inventory',
                                  duration: 5000
                                });
                              }
                            }}
                            className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 transition-transform active:scale-95 shadow-sm cursor-pointer"
                            title="Instantly receive PR stock into inventory"
                          >
                            ⚡ Receive Stock (+{activePR.quantity})
                          </button>
                        </div>
                      )}
                      {activePO && (
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                            📄 PO {activePO.status} ({activePO.quantity} {p.unit}s)
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              playSuccess();
                              receiveWarehouseGoods(activePO.id, activePO.quantity, 0);
                              if (showToast) {
                                showToast({
                                  title: 'Stock Intake Complete! 🎉',
                                  message: `Added +${activePO.quantity} ${p.unit}s of ${p.name} into store inventory. Status is now IN STOCK!`,
                                  type: 'success',
                                  category: 'inventory',
                                  duration: 5000
                                });
                              }
                            }}
                            className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 transition-transform active:scale-95 shadow-sm cursor-pointer"
                            title="Instantly receive PO stock into inventory"
                          >
                            ⚡ Receive Stock (+{activePO.quantity})
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 text-right">
                      {p.stock <= p.threshold ? (
                        <button
                          onClick={() => openReorderModal(p)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-black rounded-lg transition-transform active:scale-95 shadow-sm"
                        >
                          {t("REORDER PR")}
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-bold">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex items-center justify-between pt-3 text-xs text-slate-400 font-semibold">
          <span>Showing {filteredProducts.length} of {products.length} items</span>
          <div className="flex items-center gap-1.5">
            <button className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 font-bold flex items-center gap-1">
              <ChevronLeft className="w-4 h-4" />
              <span>PREVIOUS</span>
            </button>
            <span className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center">1</span>
            <button className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 font-bold flex items-center gap-1">
              <span>NEXT</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Procurement Request Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative animate-scale-up space-y-5">
            <div>
              <h3 className="text-base font-black text-white">{t("Submit Procurement Request")}</h3>
              <p className="text-xs text-slate-400 mt-1">
                Initiate a purchase request for <strong className="text-emerald-400">{selectedProduct.name}</strong>.
              </p>
            </div>

            {/* Product Info Summary */}
            <div className="flex items-center gap-3 p-3 bg-slate-800/60 border border-slate-700/50 rounded-2xl">
              <img src={selectedProduct.image} alt={selectedProduct.name} className="w-10 h-10 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-extrabold text-white truncate">{selectedProduct.name}</p>
                <p className="text-[10px] text-slate-400 font-mono">{selectedProduct.sku} · Current Stock: <span className="text-amber-400 font-bold">{selectedProduct.stock} {selectedProduct.unit}s</span></p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-bold">Retail Price</p>
                <p className="text-xs font-extrabold text-emerald-400">₹{selectedProduct.price.toFixed(2)}</p>
              </div>
            </div>

            <form onSubmit={handleReorderSubmit} className="space-y-4 text-xs">
              {/* Where to Buy */}
              <div>
                <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  {t("WHERE TO BUY (SOURCE / LOCATION)")}
                </label>
                <input
                  type="text"
                  value={purchaseSource}
                  onChange={(e) => setPurchaseSource(e.target.value)}
                  placeholder="e.g. Chennai Koyambedu Market, Amazon B2B, Direct Supplier..."
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Quantity & Unit Cost side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">{t("REORDER QUANTITY")}</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={reorderQty}
                    onChange={(e) => setReorderQty(parseInt(e.target.value) || 1)}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
                    {t("UNIT COST (₹)")}
                  </label>
                  <input
                    type="number"
                    required
                    min={0.01}
                    step="0.01"
                    value={unitCost}
                    onChange={(e) => setUnitCost(e.target.value)}
                    placeholder="Cost per unit"
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl font-bold text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {/* Total Amount Display */}
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-between">
                <span className="text-emerald-400 font-bold text-[11px]">ESTIMATED TOTAL COST</span>
                <span className="text-lg font-black text-emerald-400">₹{computedTotal}</span>
              </div>

              {/* Supplier */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">{t("RECOMMENDED SUPPLIER")}</label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-2xl font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.category})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setSelectedProduct(null); setUnitCost(''); setPurchaseSource(''); }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-center transition-colors"
                >
                  {t("Cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-2xl text-center shadow-lg shadow-emerald-600/25 transition-colors"
                >
                  {t("Submit Request")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
