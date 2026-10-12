import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { 
  Boxes, 
  Plus, 
  Minus, 
  AlertTriangle, 
  Check, 
  X, 
  ShieldAlert, 
  FileText, 
  Layers, 
  TrendingDown,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

const ADJUSTMENT_REASONS = [
  { id: 'Audit Correction', label: 'Audit Correction (Cycle Count Discrepancy)' },
  { id: 'Damage', label: 'Damaged Goods / Broken Packaging' },
  { id: 'Expiry / Spoilage', label: 'Expiry / Spoilage / Rotten' },
  { id: 'Theft / Shrinkage', label: 'Theft / Shrinkage / Missing Item' },
  { id: 'Found Stock', label: 'Found Stock / Unrecorded Intake' },
  { id: 'Promo Sample', label: 'Tasting Sample / Promo Display' },
];

export default function StockAdjustmentModal({ isOpen, onClose, initialProduct = null }) {
  const { 
    products, 
    branchProducts, 
    adjustStockManual, 
    selectedBranch,
    showToast 
  } = useApp();

  const { playClick, playSuccess, playBeep } = useSoundEffects();

  const productList = branchProducts && branchProducts.length > 0 ? branchProducts : products;

  const [selectedProductId, setSelectedProductId] = useState(
    initialProduct?.id || productList[0]?.id || ''
  );
  const [selectedBatch, setSelectedBatch] = useState('');
  const [adjustmentMode, setAdjustmentMode] = useState('remove'); // 'add' | 'remove'
  const [quantity, setQuantity] = useState(5);
  const [reason, setReason] = useState('Audit Correction');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialProduct?.id) {
        setSelectedProductId(initialProduct.id);
        setSelectedBatch(initialProduct.batchNo || `BATCH-2027-${initialProduct.sku?.replace(/[^a-zA-Z0-9]/g, '') || '01'}`);
      } else if (productList.length > 0) {
        const first = productList[0];
        setSelectedProductId(first.id);
        setSelectedBatch(first.batchNo || `BATCH-2027-${first.sku?.replace(/[^a-zA-Z0-9]/g, '') || '01'}`);
      }
      setQuantity(5);
      setAdjustmentMode('remove');
      setReason('Audit Correction');
      setNote('');
    }
  }, [isOpen, initialProduct, productList]);

  if (!isOpen) return null;

  const currentProduct = productList.find(p => p.id === selectedProductId) || productList[0];
  const currentBatch = selectedBatch || currentProduct?.batchNo || `BATCH-2027-${currentProduct?.sku || '01'}`;
  const currentStock = currentProduct ? currentProduct.stock : 0;
  const qtyNumber = Math.max(1, Number(quantity) || 1);
  const delta = adjustmentMode === 'add' ? qtyNumber : -qtyNumber;
  const resultingStock = Math.max(0, currentStock + delta);
  const resultingStatus = resultingStock === 0 ? 'Out of Stock' : resultingStock <= (currentProduct?.threshold || 15) ? 'Low Stock' : 'In Stock';

  const handleProductChange = (e) => {
    const prodId = e.target.value;
    setSelectedProductId(prodId);
    const prod = productList.find(p => p.id === prodId);
    if (prod) {
      setSelectedBatch(prod.batchNo || `BATCH-2027-${prod.sku?.replace(/[^a-zA-Z0-9]/g, '') || '01'}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentProduct) return;

    if (adjustmentMode === 'remove' && qtyNumber > currentStock) {
      playBeep();
      showToast({
        title: 'Adjustment Exceeds Stock ⚠️',
        message: `Cannot remove ${qtyNumber} units. Current stock is only ${currentStock} ${currentProduct.unit}s.`,
        type: 'warning',
        duration: 3500
      });
      return;
    }

    setIsSubmitting(true);
    playSuccess();

    try {
      await adjustStockManual({
        productId: currentProduct.id,
        sku: currentProduct.sku,
        mode: adjustmentMode,
        quantity: qtyNumber,
        batchNo: currentBatch,
        reason: reason,
        note: note.trim() || `Manual ${adjustmentMode.toUpperCase()} (${reason})`
      });

      showToast({
        title: 'Stock Adjustment Saved! 📋',
        message: `${adjustmentMode === 'add' ? '+' : '-'}${qtyNumber} ${currentProduct.unit}s written to Inventory Log.`,
        type: 'success',
        duration: 3500
      });

      onClose();
    } catch (err) {
      showToast({
        title: 'Adjustment Error ❌',
        message: err.message || 'Failed to record adjustment.',
        type: 'error',
        duration: 3000
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[82vh] my-auto animate-scale-up text-xs">
        
        {/* Modal Header */}
        <div className="px-3.5 py-2.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-indigo-500/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <Boxes className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="bg-indigo-400/20 text-indigo-300 text-[8px] font-mono font-black uppercase px-1 py-0.2 rounded border border-indigo-400/30">
                  FIG 8.6.3
                </span>
                <h3 className="text-xs font-black tracking-tight text-white">
                  Stock Adjustment Dialog
                </h3>
              </div>
              <p className="text-[9px] text-slate-300">
                Manual stock revisions with live audit logging
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { playClick(); onClose(); }}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="p-3 overflow-y-auto space-y-2.5 flex-1 text-xs">
          
          {/* 1. Product Picker & Details Summary */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                1. Product & On-Hand Stock
              </label>
              <span className="text-[9px] font-bold text-slate-400">
                Current: <strong className="text-indigo-600 dark:text-indigo-400">{currentStock} {currentProduct?.unit}s</strong>
              </span>
            </div>

            <select
              value={selectedProductId}
              onChange={handleProductChange}
              className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer truncate"
            >
              {productList.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — {p.stock} {p.unit}s
                </option>
              ))}
            </select>
          </div>

          {/* 2. Batch Number & Expiry */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[9px] font-black text-slate-500 dark:text-slate-400 mb-0.5 uppercase flex items-center gap-1">
                <Layers className="w-2.5 h-2.5 text-indigo-500" />
                2. Target Batch Lot
              </label>
              <input
                type="text"
                required
                value={currentBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                placeholder="e.g. BATCH-2027-A"
                className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-500 dark:text-slate-400 mb-0.5 uppercase">
                Expiry Reference
              </label>
              <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[11px] font-bold border border-slate-200 dark:border-slate-700 truncate">
                {currentProduct?.expiryDate || '2027-10-15'}
              </div>
            </div>
          </div>

          {/* 3. Add or Remove Action */}
          <div>
            <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
              3. Adjustment Mode
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => { playClick(); setAdjustmentMode('add'); }}
                className={`py-1.5 px-2 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  adjustmentMode === 'add'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-700 dark:text-emerald-400 shadow-xs'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                }`}
              >
                <Plus className="w-3 h-3 text-emerald-500" />
                <span>➕ Add (Intake/Found)</span>
              </button>

              <button
                type="button"
                onClick={() => { playClick(); setAdjustmentMode('remove'); }}
                className={`py-1.5 px-2 rounded-lg border font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  adjustmentMode === 'remove'
                    ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-500 text-rose-700 dark:text-rose-400 shadow-xs'
                    : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                }`}
              >
                <Minus className="w-3 h-3 text-rose-500" />
                <span>➖ Remove (Damage/Deficit)</span>
              </button>
            </div>
          </div>

          {/* 4. Quantity Stepper & Quick Increment Chips */}
          <div className="p-2 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold text-slate-700 dark:text-slate-300 uppercase">
                4. Quantity ({currentProduct?.unit}s)
              </label>
              <div className="flex items-center gap-1">
                {[1, 5, 10, 25, 50].map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => { playClick(); setQuantity(q); }}
                    className={`px-1.5 py-0.2 rounded text-[9px] font-bold transition-all cursor-pointer ${
                      quantity === q 
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300'
                    }`}
                  >
                    +{q}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center hover:bg-slate-300 cursor-pointer"
              >
                <Minus className="w-3 h-3" />
              </button>
              <input
                type="number"
                min="1"
                required
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 p-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center font-mono text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <button
                type="button"
                onClick={() => setQuantity(prev => prev + 1)}
                className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center hover:bg-slate-300 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* 5. Reason & Remarks */}
          <div className="space-y-1.5">
            <div>
              <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 mb-0.5 uppercase tracking-wider">
                5. Reason / Justification
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {ADJUSTMENT_REASONS.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Audit remarks (e.g. Broken packaging in Bay 2)"
              className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Live Before & After Simulation Box */}
          <div className="p-2 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white rounded-xl border border-indigo-500/30 shadow-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold text-indigo-300 uppercase">
                Stock Simulation
              </span>
              <span className={`px-1.5 py-0.2 rounded-full font-black text-[8px] ${
                resultingStatus === 'In Stock' ? 'bg-emerald-500/20 text-emerald-300' :
                resultingStatus === 'Low Stock' ? 'bg-amber-500/20 text-amber-300' :
                'bg-rose-500/20 text-rose-300'
              }`}>
                {resultingStatus}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-1 text-center text-[9px]">
              <div className="bg-slate-800/80 p-1 rounded border border-slate-700/60">
                <span className="text-slate-400 block text-[8px]">Current</span>
                <span className="font-extrabold text-white">{currentStock} {currentProduct?.unit}s</span>
              </div>

              <div className="bg-slate-800/80 p-1 rounded border border-slate-700/60">
                <span className="text-slate-400 block text-[8px]">Delta</span>
                <span className={`font-extrabold flex items-center justify-center gap-0.5 ${
                  adjustmentMode === 'add' ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {adjustmentMode === 'add' ? <TrendingUp className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                  {adjustmentMode === 'add' ? `+${qtyNumber}` : `-${qtyNumber}`}
                </span>
              </div>

              <div className="bg-slate-800/80 p-1 rounded border border-slate-700/60">
                <span className="text-slate-400 block text-[8px]">New Balance</span>
                <span className="font-black text-emerald-400">{resultingStock} {currentProduct?.unit}s</span>
              </div>
            </div>
          </div>

          {/* Modal Action Buttons Footer */}
          <div className="pt-1.5 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { playClick(); onClose(); }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-[11px] font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 via-indigo-700 to-slate-900 hover:brightness-110 text-white text-[11px] font-black shadow-sm flex items-center gap-1 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3 h-3" />
              <span>{isSubmitting ? 'Saving...' : 'Confirm & Log Adjustment'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
