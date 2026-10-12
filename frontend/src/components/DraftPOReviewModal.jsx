import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { 
  FileText, 
  Building2, 
  Calendar, 
  CreditCard, 
  Send, 
  Save, 
  X, 
  Package, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Truck
} from 'lucide-react';

export default function DraftPOReviewModal({ isOpen, onClose, draftPO, onSendSuccess }) {
  const { suppliers, sendPurchaseOrder, setPurchaseOrders, showToast } = useApp();
  const { playClick, playSuccess, playBeep } = useSoundEffects();

  const [quantity, setQuantity] = useState(draftPO?.quantity || 50);
  const [selectedSupplierId, setSelectedSupplierId] = useState(draftPO?.supplierId || '');
  const [expectedDelivery, setExpectedDelivery] = useState(draftPO?.expectedDelivery || '');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (draftPO) {
      setQuantity(draftPO.quantity || 50);
      setSelectedSupplierId(draftPO.supplierId || (suppliers[0]?.id || ''));
      setExpectedDelivery(draftPO.expectedDelivery || new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
      setNotes(draftPO.rationale || '30-Day AI Demand Forecast Auto-Reorder');
    }
  }, [draftPO, suppliers]);

  if (!isOpen || !draftPO) return null;

  const currentSupplier = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0] || { name: draftPO.supplierName, paymentTerms: 'Net 30 Days' };
  const unitCost = draftPO.unitCost || (draftPO.amount / (draftPO.quantity || 1)) || 45;
  const computedTotal = (unitCost * quantity).toFixed(2);

  const handleSaveDraft = () => {
    playSuccess();
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id === draftPO.id) {
        return {
          ...po,
          quantity,
          supplierId: currentSupplier.id,
          supplierName: currentSupplier.name,
          amount: parseFloat(computedTotal),
          expectedDelivery,
          notes
        };
      }
      return po;
    }));

    showToast({
      title: 'Draft PO Saved 💾',
      message: `Purchase order ${draftPO.id} updated and saved as Draft in PO Register.`,
      type: 'info'
    });
    onClose();
  };

  const handleSendPO = () => {
    playSuccess();
    // Update details and mark as Sent
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id === draftPO.id) {
        return {
          ...po,
          quantity,
          supplierId: currentSupplier.id,
          supplierName: currentSupplier.name,
          amount: parseFloat(computedTotal),
          expectedDelivery,
          notes,
          status: 'Sent'
        };
      }
      return po;
    }));

    showToast({
      title: 'PO Dispatched to Supplier! 🚀',
      message: `PO ${draftPO.id} for ${quantity} units sent to ${currentSupplier.name}. Total: ₹${computedTotal}`,
      type: 'success',
      duration: 5000
    });

    if (onSendSuccess) onSendSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] my-auto animate-scale-up text-xs">
        
        {/* Header */}
        <div className="px-4 py-3.5 bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-indigo-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="bg-amber-400/20 text-amber-300 text-[9px] font-mono font-black uppercase px-1.5 py-0.2 rounded border border-amber-400/30">
                  FIG 8.8.3 REVIEW DRAFT PO
                </span>
                <h3 className="text-sm font-black tracking-tight text-white">
                  Review Purchase Order ({draftPO.id})
                </h3>
              </div>
              <p className="text-[10px] text-slate-300 font-medium">
                Review suggested quantities, supplier terms, and delivery schedules before dispatch.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { playClick(); onClose(); }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1 text-xs">
          
          {/* Smart Reorder Origin Box */}
          <div className="p-3 bg-gradient-to-r from-indigo-50 to-emerald-50 dark:from-indigo-950/40 dark:to-emerald-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800/40 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-slate-900 dark:text-white text-xs flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                <span>{draftPO.productName}</span>
              </span>
              <span className="text-[10px] font-black font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                STATUS: DRAFT
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 font-medium">
              Rationale: {draftPO.rationale}
            </p>
          </div>

          {/* Form Grid */}
          <div className="space-y-3">
            
            {/* 1. Supplier & Payment Terms */}
            <div>
              <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3 h-3 text-indigo-500" />
                Assigned Supplier & Partner *
              </label>
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} — ({s.category}) · {s.paymentTerms || 'Net 30 Days'}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Order Quantity & Unit Cost */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider flex items-center gap-1">
                  <Package className="w-3 h-3 text-indigo-500" />
                  Order Quantity (Units) *
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-black text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-indigo-500" />
                  Expected Delivery Date *
                </label>
                <input
                  type="date"
                  required
                  value={expectedDelivery}
                  onChange={(e) => setExpectedDelivery(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* 3. Financial Summary Card */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 block uppercase">Unit Cost (B2B)</span>
                <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300 font-mono">₹{unitCost.toFixed(2)} / unit</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block uppercase">Payable Total</span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">₹{computedTotal}</span>
              </div>
            </div>

            {/* 4. Manager Notes */}
            <div>
              <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider">
                Special Procurement Instructions / Remarks
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Priority morning delivery requested. Verify standard batch packaging."
                className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={() => { playClick(); onClose(); }}
            className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold text-xs cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-transform active:scale-95 cursor-pointer shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Keep as Draft</span>
            </button>

            <button
              type="button"
              onClick={handleSendPO}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:brightness-110 text-white font-black text-xs flex items-center gap-1.5 transition-transform active:scale-95 shadow-md shadow-indigo-600/25 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Confirm & Send PO</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
