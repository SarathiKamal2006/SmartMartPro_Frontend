import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import StockAdjustmentModal from '../components/StockAdjustmentModal';
import ReceivePODialog from '../components/ReceivePODialog';
import { 
  Boxes, 
  AlertTriangle, 
  XCircle, 
  Download, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  IndianRupee, 
  SlidersHorizontal, 
  History, 
  TrendingUp, 
  TrendingDown, 
  Layers, 
  FileSpreadsheet, 
  PackageCheck,
  Sparkles
} from 'lucide-react';

export default function InventoryView() {
  const { 
    products, 
    suppliers, 
    createPurchaseRequest, 
    approvePurchaseRequest, 
    receiveWarehouseGoods, 
    branchProducts, 
    purchaseRequests, 
    purchaseOrders, 
    inventoryLogs,
    stockAdjustmentModalOpen,
    setStockAdjustmentModalOpen,
    selectedStockAdjustProduct,
    setSelectedStockAdjustProduct,
    receivePODialogOpen,
    setReceivePODialogOpen,
    activeReceivePO,
    setActiveReceivePO,
    searchTerm, 
    setSearchTerm, 
    setCurrentView,
    showToast 
  } = useApp();
  const { playClick, playSuccess } = useSoundEffects();
  const { t } = useLanguage();
  const [filterTab, setFilterTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState(searchTerm || '');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [activeLogTab, setActiveLogTab] = useState('All');

  React.useEffect(() => {
    if (searchTerm !== undefined && searchTerm !== searchQuery) {
      setSearchQuery(searchTerm);
    }
  }, [searchTerm]);

  // Reset pagination to page 1 whenever filterTab or searchQuery changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filterTab, searchQuery]);

  // Reorder modal states
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reorderQty, setReorderQty] = useState(50);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [purchaseSource, setPurchaseSource] = useState('');

  const safeBranchProducts = Array.isArray(branchProducts) ? branchProducts : (Array.isArray(products) ? products : []);
  const safeSuppliers = Array.isArray(suppliers) ? suppliers : [];

  const totalCount = safeBranchProducts.length;
  const lowCount = safeBranchProducts.filter(p => {
    if (!p) return false;
    const stock = Number(p.stock ?? 0);
    const threshold = Number(p.threshold ?? 10);
    return stock <= threshold && stock > 0;
  }).length;
  const outCount = safeBranchProducts.filter(p => p && Number(p.stock ?? 0) === 0).length;

  const filteredProducts = safeBranchProducts.filter(p => {
    if (!p) return false;
    const name = String(p.name || '').toLowerCase();
    const sku = String(p.sku || '').toLowerCase();
    const category = String(p.category || '');
    const q = (searchQuery || '').toLowerCase();
    const matchesSearch = name.includes(q) || sku.includes(q);
    
    const stock = Number(p.stock ?? 0);
    const threshold = Number(p.threshold ?? 10);

    if (filterTab === 'Low Stock') return stock <= threshold && stock > 0 && matchesSearch;
    if (filterTab === 'Out of Stock') return stock === 0 && matchesSearch;
    if (filterTab === 'Produce') return (category.includes('Produce') || category.includes('Fruits')) && matchesSearch;
    if (filterTab === 'Dairy') return category.includes('Dairy') && matchesSearch;
    
    return matchesSearch;
  });

  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

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
    if (!product) return;
    playClick();
    setSelectedProduct(product);
    setSelectedSupplierId(safeSuppliers[0]?.id || 'SUP-01');
    setReorderQty(50);
    const price = Number(product.price || 0);
    setUnitCost((price * 0.6).toFixed(2));
    setPurchaseSource('');
  };

  const computedTotal = unitCost ? (parseFloat(unitCost) * reorderQty).toFixed(2) : ((selectedProduct?.price || 0) * 0.6 * reorderQty).toFixed(2);

  const handleExportCSV = () => {
    playClick();
    if (!filteredProducts || filteredProducts.length === 0) {
      if (showToast) {
        showToast({
          title: 'No Data to Export',
          message: 'There are no products matching the current filter to export.',
          type: 'warning',
          category: 'inventory'
        });
      }
      return;
    }

    const headers = [
      'Product Name',
      'SKU',
      'Category',
      'Stock Quantity',
      'Unit',
      'Reorder Threshold',
      'Critical Level',
      'Unit Price (INR)',
      'Inventory Status'
    ];

    const rows = filteredProducts.map(p => {
      const stock = Number(p.stock ?? 0);
      const threshold = Number(p.threshold ?? 10);
      const critical = Math.floor(threshold / 2);
      const status = stock === 0 
        ? 'Out of Stock' 
        : stock <= critical 
          ? 'Critical Stock' 
          : stock <= threshold 
            ? 'Low Stock' 
            : 'In Stock';

      return [
        `"${String(p.name || '').replace(/"/g, '""')}"`,
        `"${String(p.sku || '').replace(/"/g, '""')}"`,
        `"${String(p.category || '').replace(/"/g, '""')}"`,
        stock,
        `"${String(p.unit || 'unit').replace(/"/g, '""')}"`,
        threshold,
        critical,
        Number(p.price || 0).toFixed(2),
        `"${status}"`
      ].join(',');
    });

    // Add UTF-8 BOM (\uFEFF) for Excel compatibility
    const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    const categoryName = filterTab.replace(/[^a-zA-Z0-9]/g, '_');
    link.setAttribute('download', `SmartMart_Inventory_${categoryName}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    playSuccess();
    if (showToast) {
      showToast({
        title: 'CSV Export Downloaded! 📊',
        message: `Successfully generated and downloaded ${filteredProducts.length} items to CSV.`,
        type: 'success',
        category: 'inventory',
        duration: 4000
      });
    }
  };

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
            type="button"
            onClick={() => {
              playClick();
              setCurrentView('aiForecasting');
            }}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:brightness-110 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-teal-600/25 transition-transform active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-emerald-200" />
            <span>FIG 8.8.3 SMART REORDERS</span>
          </button>

          <button 
            type="button"
            id="stock-adjustment-trigger-btn"
            onClick={() => {
              playClick();
              setSelectedStockAdjustProduct(null);
              setStockAdjustmentModalOpen(true);
            }}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 hover:brightness-110 text-white text-xs font-black flex items-center gap-2 shadow-md shadow-indigo-600/25 transition-transform active:scale-95 cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-indigo-300" />
            <span>FIG 8.6.3 STOCK ADJUSTMENT</span>
          </button>

          <button 
            id="export-inventory-csv-btn"
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm active:scale-95 cursor-pointer"
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
              {paginatedProducts.length > 0 ? (
                paginatedProducts.map((p) => {
                  const activePR = (purchaseRequests || []).find(r => r.productId === p.id);
                  const activePO = (purchaseOrders || []).find(o => o.productId === p.id);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5 font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                        <img src={p.image} alt={p.name} className="w-8 h-8 rounded-xl object-cover shadow-xs" onError={(e) => { e.currentTarget.src = "/dashboard_grocery_basket.png"; }} />
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
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            type="button"
                            title="Adjust Stock / Batch (Fig 8.6.3)"
                            onClick={() => {
                              playClick();
                              setSelectedStockAdjustProduct(p);
                              setStockAdjustmentModalOpen(true);
                            }}
                            className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-[10px] font-extrabold rounded-lg transition-transform active:scale-95 cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            <SlidersHorizontal className="w-3 h-3" />
                            <span>Adjust</span>
                          </button>
                          {p.stock <= p.threshold && (
                            <button
                              onClick={() => openReorderModal(p)}
                              className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 text-[10px] font-black rounded-lg transition-transform active:scale-95 shadow-sm cursor-pointer"
                            >
                              {t("REORDER PR")}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 font-semibold">
                    {t("No matching inventory records found for current filters.")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 text-xs text-slate-500 dark:text-slate-400 font-semibold border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-slate-900 dark:text-white font-extrabold">{totalItems === 0 ? 0 : startIndex + 1} - {endIndex}</strong> of <strong className="text-slate-900 dark:text-white font-extrabold">{totalItems}</strong> items (Page {validCurrentPage} of {totalPages})
            </span>
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[11px] text-slate-400 font-bold">Rows:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  playClick();
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-transparent text-xs font-extrabold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value={10} className="bg-white dark:bg-slate-900">10</option>
                <option value={20} className="bg-white dark:bg-slate-900">20</option>
                <option value={50} className="bg-white dark:bg-slate-900">50</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <button 
              type="button"
              disabled={validCurrentPage <= 1}
              onClick={() => {
                playClick();
                setCurrentPage(prev => Math.max(1, prev - 1));
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>PREVIOUS</span>
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
              if (totalPages > 7 && Math.abs(pageNum - validCurrentPage) > 2 && pageNum !== 1 && pageNum !== totalPages) {
                if (pageNum === 2 || pageNum === totalPages - 1) {
                  return <span key={pageNum} className="px-1 text-slate-400">...</span>;
                }
                return null;
              }
              const isActive = pageNum === validCurrentPage;
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => {
                    playClick();
                    setCurrentPage(pageNum);
                  }}
                  className={`w-8 h-8 rounded-xl font-extrabold flex items-center justify-center transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 scale-105' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button 
              type="button"
              disabled={validCurrentPage >= totalPages || totalPages === 0}
              onClick={() => {
                playClick();
                setCurrentPage(prev => Math.min(totalPages, prev + 1));
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed font-bold flex items-center gap-1 transition-all cursor-pointer"
            >
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
                  {safeSuppliers.map(s => (
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

      {/* FIG 8.6.3 INVENTORY AUDIT TRAIL & LOGS SECTION */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Fig 8.6.3 Inventory Logs & Audit Trail
                </h3>
                <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                  {(inventoryLogs || []).length} Logged Entries
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Immutable audit ledger recording every manual stock adjustment, damage write-off, cycle count correction, and batch lot revision.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {['All', 'Damage', 'Audit', 'Manual Add', 'Manual Remove'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => { playClick(); setActiveLogTab(tab); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  activeLogTab === tab
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <th className="p-3">LOG ID & DATE</th>
                <th className="p-3">PRODUCT & SKU</th>
                <th className="p-3">BATCH LOT NO.</th>
                <th className="p-3">ACTION / REASON</th>
                <th className="p-3 text-center">CHANGE DELTA</th>
                <th className="p-3 text-center">NEW BALANCE</th>
                <th className="p-3">PERFORMED BY & REMARKS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {(inventoryLogs || [])
                .filter(log => {
                  if (activeLogTab === 'Damage') return log.action?.includes('Damage') || log.reason?.includes('Damage');
                  if (activeLogTab === 'Audit') return log.action?.includes('Audit') || log.reason?.includes('Audit');
                  if (activeLogTab === 'Manual Add') return log.action === 'Manual Add' || log.change > 0;
                  if (activeLogTab === 'Manual Remove') return log.action === 'Manual Remove' || log.change < 0;
                  return true;
                })
                .map((log) => (
                  <tr key={log.id || log.logId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3">
                      <span className="font-mono font-black text-indigo-600 dark:text-indigo-400 block text-[11px]">
                        {log.logId || log.id}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {log.createdAt ? new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Today'}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {log.productName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {log.sku}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                        {log.batchNo || 'BATCH-2027-MAIN'}
                      </span>
                    </td>

                    <td className="p-3">
                      <span className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        log.action?.includes('Damage') ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' :
                        log.action?.includes('Audit') ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400' :
                        log.change > 0 ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                        'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                      }`}>
                        {log.action}
                      </span>
                      <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        {log.reason}
                      </span>
                    </td>

                    <td className="p-3 text-center">
                      <span className={`font-black font-mono text-xs px-2 py-0.5 rounded-lg inline-flex items-center gap-0.5 ${
                        log.change > 0 
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      }`}>
                        {log.change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {log.change > 0 ? `+${log.change}` : log.change}
                      </span>
                    </td>

                    <td className="p-3 text-center font-black font-mono text-slate-900 dark:text-white">
                      {log.newStock} units
                    </td>

                    <td className="p-3 text-[11px]">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {log.performedBy || 'Store Manager'}
                      </span>
                      {log.note && (
                        <span className="text-[10px] text-slate-400 italic block truncate max-w-xs">
                          "{log.note}"
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fig 8.6.3 Stock Adjustment Dialog Modal */}
      <StockAdjustmentModal
        isOpen={stockAdjustmentModalOpen}
        onClose={() => {
          setStockAdjustmentModalOpen(false);
          setSelectedStockAdjustProduct(null);
        }}
        initialProduct={selectedStockAdjustProduct}
      />

      {/* Fig 8.7.3 Receive Purchase Order Dialog */}
      <ReceivePODialog
        isOpen={receivePODialogOpen}
        onClose={() => {
          setReceivePODialogOpen(false);
          setActiveReceivePO(null);
        }}
        purchaseOrder={activeReceivePO}
      />
    </div>
  );
}
