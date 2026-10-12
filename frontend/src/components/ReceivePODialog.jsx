import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { 
  PackageCheck, 
  Layers, 
  Calendar, 
  Check, 
  X, 
  Truck, 
  Boxes, 
  AlertCircle, 
  Building2, 
  ArrowRight,
  ShieldCheck,
  Tag
} from 'lucide-react';

export default function ReceivePODialog({ isOpen, onClose, purchaseOrder = null }) {
  const { 
    products, 
    branchProducts, 
    confirmReceivePO,
    selectedBranch,
    showToast 
  } = useApp();

  const { playClick, playSuccess, playBeep } = useSoundEffects();

  const [lines, setLines] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize line items from PO
  useEffect(() => {
    if (isOpen && purchaseOrder) {
      const productCatalog = branchProducts?.length > 0 ? branchProducts : products;
      
      // Handle PO items array or single product PO structure
      let initialItems = [];
      if (purchaseOrder.items && purchaseOrder.items.length > 0) {
        initialItems = purchaseOrder.items.map((item, idx) => {
          const matchedProd = productCatalog.find(p => p.sku === item.sku || p.name === item.productName || p.id === item.productId);
          const defaultBatch = matchedProd?.batchNo || `BATCH-2027-${(item.sku || `ITEM${idx+1}`).replace(/[^a-zA-Z0-9]/g, '')}`;
          return {
            id: item.sku || `item-${idx}`,
            productId: matchedProd?.id || item.productId || '',
            sku: item.sku || matchedProd?.sku || `SKU-${idx + 101}`,
            productName: item.productName || item.name || matchedProd?.name || 'Supermarket Goods',
            unit: matchedProd?.unit || 'units',
            currentStock: matchedProd?.stock || 0,
            orderedQty: Number(item.qty || item.quantity || 50),
            receivedQty: Number(item.qty || item.quantity || 50),
            batchNo: defaultBatch,
            mfgDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            expiryDate: matchedProd?.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          };
        });
      } else {
        const matchedProd = productCatalog.find(p => p.id === purchaseOrder.productId || p.name === purchaseOrder.productName);
        const defaultBatch = matchedProd?.batchNo || `BATCH-2027-${(matchedProd?.sku || 'PO').replace(/[^a-zA-Z0-9]/g, '')}`;
        initialItems = [{
          id: purchaseOrder.id || 'item-1',
          productId: matchedProd?.id || purchaseOrder.productId || '',
          sku: matchedProd?.sku || purchaseOrder.sku || 'PRD-IN',
          productName: purchaseOrder.productName || matchedProd?.name || 'Incoming Stock',
          unit: matchedProd?.unit || 'units',
          currentStock: matchedProd?.stock || 0,
          orderedQty: Number(purchaseOrder.quantity || 50),
          receivedQty: Number(purchaseOrder.quantity || 50),
          batchNo: defaultBatch,
          mfgDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          expiryDate: matchedProd?.expiryDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }];
      }

      setLines(initialItems);
    }
  }, [isOpen, purchaseOrder, branchProducts, products]);

  if (!isOpen || !purchaseOrder) return null;

  const handleLineChange = (index, field, value) => {
    setLines(prev => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const totalReceivedUnits = lines.reduce((sum, line) => sum + (Number(line.receivedQty) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (lines.length === 0) return;

    setIsSubmitting(true);
    playSuccess();

    try {
      await confirmReceivePO({
        poId: purchaseOrder.id || purchaseOrder.poNumber || purchaseOrder._id,
        supplierName: purchaseOrder.supplierName || 'Verified Supplier',
        branch: purchaseOrder.branch || selectedBranch?.name || 'Chennai Central Superstore (Main)',
        lines: lines
      });

      showToast({
        title: 'Goods Received & Stock Batches Created! 📦',
        message: `Successfully processed PO ${purchaseOrder.id || purchaseOrder.poNumber}. Created ${lines.length} stock batch(es) and updated store inventory.`,
        type: 'success',
        duration: 4500
      });

      onClose();
    } catch (err) {
      playBeep();
      showToast({
        title: 'Error Receiving PO ❌',
        message: err.message || 'Failed to complete goods intake.',
        type: 'error',
        duration: 3500
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] my-auto animate-scale-up text-xs">
        
        {/* Modal Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-teal-900 via-emerald-950 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-teal-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300 shrink-0">
              <PackageCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="bg-teal-400/20 text-teal-300 text-[9px] font-mono font-black uppercase px-1.5 py-0.2 rounded border border-teal-400/30">
                  FIG 8.7.3 SPECIFICATION
                </span>
                <h3 className="text-sm font-black tracking-tight text-white">
                  Receive Purchase Order Dialog
                </h3>
              </div>
              <p className="text-[10px] text-teal-100 font-medium">
                Record received quantities, batch lots, and expiry dates to intake stock into ERP.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { playClick(); onClose(); }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PO Meta Summary Bar */}
        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px]">
          <div className="flex items-center gap-3">
            <span className="font-mono font-black text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
              {purchaseOrder.id || purchaseOrder.poNumber || 'PO-REQ'}
            </span>
            <span className="text-slate-600 dark:text-slate-300 font-bold flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-slate-400" />
              {purchaseOrder.supplierName || 'Supplier Delivery'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>Branch: <strong className="text-slate-800 dark:text-slate-200">{purchaseOrder.branch || selectedBranch?.name || 'Chennai Superstore'}</strong></span>
          </div>
        </div>

        {/* Form & Items List */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5 flex-1 text-xs">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Line Items Received & Batch Registration
              </label>
              <span className="text-[10px] text-slate-400 font-bold">
                {lines.length} Line Item(s)
              </span>
            </div>

            {lines.map((line, idx) => (
              <div 
                key={line.id || idx}
                className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2.5"
              >
                {/* Line Top: Product Name, SKU, Ordered vs Received */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700/60 pb-2">
                  <div>
                    <span className="font-extrabold text-slate-900 dark:text-white block text-xs">
                      {line.productName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      SKU: {line.sku} • On-Hand: {line.currentStock} {line.unit}s
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Ordered Qty</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                      {line.orderedQty} {line.unit}s
                    </span>
                  </div>
                </div>

                {/* Line Form Inputs: Received Qty, Batch Lot, Mfg Date, Expiry Date */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                  {/* Received Qty */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5">
                      Received Qty ({line.unit}s) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={line.receivedQty}
                      onChange={(e) => handleLineChange(idx, 'receivedQty', Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-center font-mono font-black text-xs text-slate-900 dark:text-white focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* Batch Number */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5 flex items-center gap-1">
                      <Layers className="w-2.5 h-2.5 text-teal-500" />
                      Batch Lot No. *
                    </label>
                    <input
                      type="text"
                      required
                      value={line.batchNo}
                      onChange={(e) => handleLineChange(idx, 'batchNo', e.target.value)}
                      placeholder="e.g. BATCH-2027-A"
                      className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* Manufacturing Date */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5 flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5 text-teal-500" />
                      Mfg Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={line.mfgDate}
                      onChange={(e) => handleLineChange(idx, 'mfgDate', e.target.value)}
                      className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-400 mb-0.5 flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5 text-rose-500" />
                      Expiry Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={line.expiryDate}
                      onChange={(e) => handleLineChange(idx, 'expiryDate', e.target.value)}
                      className="w-full p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-[11px] font-bold text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-teal-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Live Stock Impact Note */}
                <div className="flex items-center justify-between text-[10px] pt-1 text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-teal-500" />
                    Creates Batch Lot <strong className="font-mono text-slate-700 dark:text-slate-300">{line.batchNo}</strong>
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">
                    New Stock Balance: {line.currentStock + (Number(line.receivedQty) || 0)} {line.unit}s (+{line.receivedQty})
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* FIG 8.7.3 SUMMARY & CONFIRMATION CARD */}
          <div className="p-3 bg-gradient-to-br from-slate-900 via-teal-950 to-slate-950 text-white rounded-2xl border border-teal-500/30 shadow-md space-y-2">
            <div className="flex items-center justify-between border-b border-teal-900/60 pb-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-teal-400" />
                Fig 8.7.3 Goods Receipt Impact Summary
              </span>
              <span className="text-[9px] font-mono bg-teal-500/20 text-teal-300 px-1.5 py-0.2 rounded">
                Automatic Batch Registration
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
              <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/60">
                <span className="text-slate-400 block text-[9px]">Total Intake Units</span>
                <span className="font-black text-emerald-400 text-xs">+{totalReceivedUnits} units</span>
              </div>

              <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/60">
                <span className="text-slate-400 block text-[9px]">New Batches Created</span>
                <span className="font-black text-white text-xs">{lines.length} Batch Lots</span>
              </div>

              <div className="bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/60">
                <span className="text-slate-400 block text-[9px]">PO Status</span>
                <span className="font-black text-teal-300 text-xs">Mark as Received</span>
              </div>
            </div>
          </div>

          {/* Modal Action Buttons Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { playClick(); onClose(); }}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:brightness-110 text-white text-xs font-black shadow-md shadow-teal-600/25 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Processing Intake...' : 'Confirm & Create Stock Batches (Fig 8.7.3)'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
