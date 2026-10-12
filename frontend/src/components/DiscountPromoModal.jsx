import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { 
  Tag, 
  Percent, 
  Sparkles, 
  X, 
  Check, 
  Trash2, 
  Receipt, 
  Calculator, 
  ArrowRight 
} from 'lucide-react';

const PRESET_PROMO_CODES = [
  { code: 'FRESH10', label: '10% OFF', type: 'percent', value: 10, desc: 'Fresh groceries discount' },
  { code: 'SMARTPRO', label: '₹50 OFF', type: 'fixed', value: 50, desc: 'Orders above ₹300' },
  { code: 'SUPER100', label: '₹100 OFF', type: 'fixed', value: 100, desc: 'Mega basket above ₹600' },
  { code: 'FESTIVE20', label: '20% OFF', type: 'percent', value: 20, desc: 'Festive season saver' },
  { code: 'STAFF15', label: '15% OFF', type: 'percent', value: 15, desc: 'Internal staff discount' },
];

export default function DiscountPromoModal({ isOpen, onClose }) {
  const { 
    cart, 
    appliedDiscount, 
    setAppliedDiscount, 
    currencySymbol,
    showToast 
  } = useApp();

  const { playClick, playSuccess } = useSoundEffects();

  const [activeTab, setActiveTab] = useState('bill'); // 'bill' | 'item'

  // Bill-level draft state
  const [promoCodeInput, setPromoCodeInput] = useState(appliedDiscount?.promoCode || '');
  const [customBillType, setCustomBillType] = useState(appliedDiscount?.billDiscountType || 'fixed'); // 'fixed' | 'percent'
  const [customBillValue, setCustomBillValue] = useState(appliedDiscount?.billDiscount || 0);

  // Item-level draft state: { [productId]: { type: 'percent'|'fixed', value: number } }
  const [draftItemDiscounts, setDraftItemDiscounts] = useState(appliedDiscount?.itemDiscounts || {});
  const [selectedItemId, setSelectedItemId] = useState(cart[0]?.product?.id || '');
  const [itemDiscType, setItemDiscType] = useState('percent');
  const [itemDiscVal, setItemDiscVal] = useState(10);

  // Synchronize with active applied discounts when opening
  useEffect(() => {
    if (isOpen) {
      setPromoCodeInput(appliedDiscount?.promoCode || '');
      setCustomBillType(appliedDiscount?.billDiscountType || 'fixed');
      setCustomBillValue(appliedDiscount?.billDiscount || 0);
      setDraftItemDiscounts(appliedDiscount?.itemDiscounts || {});
      if (cart.length > 0 && !selectedItemId) {
        setSelectedItemId(cart[0].product.id);
      }
    }
  }, [isOpen, appliedDiscount, cart]);

  if (!isOpen) return null;

  const symbol = currencySymbol || '₹';

  // Real-time Preview Calculations before confirmation
  const grossSubtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Calculate draft item discounts
  let draftItemDiscountTotal = 0;
  cart.forEach(item => {
    const disc = draftItemDiscounts[item.product.id];
    if (disc && disc.value > 0) {
      const lineGross = item.product.price * item.quantity;
      if (disc.type === 'percent') {
        draftItemDiscountTotal += lineGross * (disc.value / 100);
      } else {
        draftItemDiscountTotal += Math.min(lineGross, disc.value * item.quantity);
      }
    }
  });

  const subtotalAfterItemDiscounts = Math.max(0, grossSubtotal - draftItemDiscountTotal);

  // Calculate draft bill discount
  let draftBillDiscountAmount = 0;
  if (customBillType === 'percent' && customBillValue > 0) {
    draftBillDiscountAmount = subtotalAfterItemDiscounts * (Number(customBillValue) / 100);
  } else if (Number(customBillValue) > 0) {
    draftBillDiscountAmount = Math.min(subtotalAfterItemDiscounts, Number(customBillValue));
  }

  const draftTotalDiscount = Math.min(grossSubtotal, draftItemDiscountTotal + draftBillDiscountAmount);
  const draftTaxableAmount = Math.max(0, grossSubtotal - draftTotalDiscount);
  const draftGst = draftTaxableAmount * 0.18;
  const draftGrandTotal = draftTaxableAmount + draftGst;

  // Handlers
  const handleApplyPresetCode = (preset) => {
    playClick();
    setPromoCodeInput(preset.code);
    setCustomBillType(preset.type);
    setCustomBillValue(preset.value);
    showToast({
      title: `Preset Selected: ${preset.code} 🎟️`,
      message: `${preset.label} discount loaded. Review calculation preview below.`,
      type: 'info',
      duration: 2000
    });
  };

  const handleApplyItemDiscount = () => {
    if (!selectedItemId) return;
    playClick();
    const item = cart.find(i => i.product.id === selectedItemId);
    if (!item) return;

    const val = Number(itemDiscVal) || 0;
    if (val <= 0) {
      handleRemoveItemDiscount(selectedItemId);
      return;
    }

    setDraftItemDiscounts(prev => ({
      ...prev,
      [selectedItemId]: {
        type: itemDiscType,
        value: val,
        name: item.product.name
      }
    }));

    showToast({
      title: 'Item Discount Staged 🏷️',
      message: `${itemDiscType === 'percent' ? val + '%' : symbol + val} discount applied to ${item.product.name}`,
      type: 'info',
      duration: 2000
    });
  };

  const handleRemoveItemDiscount = (productId) => {
    playClick();
    setDraftItemDiscounts(prev => {
      const copy = { ...prev };
      delete copy[productId];
      return copy;
    });
  };

  const handleConfirmAndApply = () => {
    playSuccess();
    setAppliedDiscount({
      promoCode: promoCodeInput.trim().toUpperCase() || (customBillValue > 0 ? 'CUSTOM-DISC' : ''),
      billDiscount: Number(customBillValue) || 0,
      billDiscountType: customBillType,
      itemDiscounts: draftItemDiscounts,
      label: promoCodeInput.trim().toUpperCase() 
        ? `${promoCodeInput.trim().toUpperCase()} (-${symbol}${draftTotalDiscount.toFixed(2)})`
        : `Discounts Applied (-${symbol}${draftTotalDiscount.toFixed(2)})`
    });

    showToast({
      title: 'Discount & Promo Applied! 🎉',
      message: `Total discount of ${symbol}${draftTotalDiscount.toFixed(2)} saved with order.`,
      type: 'success',
      duration: 3500
    });

    onClose();
  };

  const handleResetAll = () => {
    playClick();
    setPromoCodeInput('');
    setCustomBillValue(0);
    setCustomBillType('fixed');
    setDraftItemDiscounts({});
    setAppliedDiscount({
      promoCode: '',
      billDiscount: 0,
      billDiscountType: 'fixed',
      itemDiscounts: {},
      label: ''
    });

    showToast({
      title: 'Discounts Cleared',
      message: 'All item and bill discounts removed.',
      type: 'info',
      duration: 2000
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] my-auto animate-scale-up">
        
        {/* Modal Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="bg-emerald-400/20 text-emerald-200 text-[9px] font-mono font-black uppercase px-1.5 py-0.2 rounded border border-emerald-400/30">
                  FIG 8.5.3
                </span>
                <h3 className="text-sm font-black tracking-tight text-white">
                  Discount & Promo Code Dialog
                </h3>
              </div>
              <p className="text-[10px] text-emerald-100/90 font-medium">
                Live net payable calculation preview before confirmation
              </p>
            </div>
          </div>

          <button
            onClick={() => { playClick(); onClose(); }}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3.5 sm:p-4 overflow-y-auto space-y-3.5 flex-1 text-xs">
          
          {/* Tab Switcher */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => { playClick(); setActiveTab('bill'); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'bill'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>1. Bill Promo Code</span>
            </button>
            <button
              type="button"
              onClick={() => { playClick(); setActiveTab('item'); }}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeTab === 'item'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Percent className="w-3.5 h-3.5" />
              <span>2. Item Discount ({Object.keys(draftItemDiscounts).length})</span>
            </button>
          </div>

          {/* Tab 1: Bill-Level Promo Codes */}
          {activeTab === 'bill' && (
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-black text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Quick Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {PRESET_PROMO_CODES.map((preset) => {
                    const isSelected = promoCodeInput.toUpperCase() === preset.code;
                    return (
                      <button
                        type="button"
                        key={preset.code}
                        onClick={() => handleApplyPresetCode(preset)}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-500 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-mono font-black text-[10px] text-emerald-700 dark:text-emerald-300">
                            {preset.code}
                          </span>
                          <span className="text-[10px] font-extrabold text-slate-900 dark:text-white bg-white dark:bg-slate-900 px-1 rounded">
                            {preset.label}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-400 block truncate mt-1">
                          {preset.desc}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Promo Code / Manual Bill Discount */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    Custom Bill Discount
                  </span>
                  <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg">
                    <button
                      type="button"
                      onClick={() => setCustomBillType('fixed')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        customBillType === 'fixed' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      Flat ({symbol})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomBillType('percent')}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        customBillType === 'percent' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                      }`}
                    >
                      Percentage (%)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Promo Code Name</label>
                    <input
                      type="text"
                      placeholder="e.g. VIP2026"
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value)}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-xs font-bold text-slate-900 dark:text-white uppercase focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 font-bold block mb-0.5">
                      Discount Value ({customBillType === 'percent' ? '%' : symbol})
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={customBillType === 'percent' ? 100 : grossSubtotal}
                      value={customBillValue}
                      onChange={(e) => setCustomBillValue(Math.max(0, Number(e.target.value)))}
                      className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Item-Level Discounts */}
          {activeTab === 'item' && (
            <div className="space-y-3">
              {cart.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs font-semibold">
                  Basket is empty. Add products to apply item-level discounts.
                </div>
              ) : (
                <>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                    <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
                      Add Item Markdown
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-1">
                        <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Select Item</label>
                        <select
                          value={selectedItemId}
                          onChange={(e) => setSelectedItemId(e.target.value)}
                          className="w-full p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none truncate"
                        >
                          {cart.map(item => (
                            <option key={item.product.id} value={item.product.id}>
                              {item.product.name} ({item.quantity}x @ {symbol}{item.product.price})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Type</label>
                        <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg">
                          <button
                            type="button"
                            onClick={() => setItemDiscType('percent')}
                            className={`flex-1 py-1 rounded text-[10px] font-bold cursor-pointer ${
                              itemDiscType === 'percent' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                            }`}
                          >
                            %
                          </button>
                          <button
                            type="button"
                            onClick={() => setItemDiscType('fixed')}
                            className={`flex-1 py-1 rounded text-[10px] font-bold cursor-pointer ${
                              itemDiscType === 'fixed' ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs' : 'text-slate-500'
                            }`}
                          >
                            {symbol} Flat
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-slate-500 font-bold block mb-0.5">Value</label>
                        <div className="flex gap-1.5">
                          <input
                            type="number"
                            min="0"
                            value={itemDiscVal}
                            onChange={(e) => setItemDiscVal(Math.max(0, Number(e.target.value)))}
                            className="w-16 p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleApplyItemDiscount}
                            className="flex-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-xs active:scale-95 cursor-pointer"
                          >
                            <span>Add</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Quick percentage chips */}
                    <div className="flex items-center gap-1 pt-1">
                      <span className="text-[9px] font-bold text-slate-400">Quick:</span>
                      {[5, 10, 15, 20, 30, 50].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => {
                            setItemDiscType('percent');
                            setItemDiscVal(pct);
                          }}
                          className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-[9px] font-bold hover:bg-emerald-100 hover:text-emerald-700 cursor-pointer"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Item Discounts List */}
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block uppercase">
                      Basket Item Markdowns
                    </span>
                    <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                      {cart.map(item => {
                        const disc = draftItemDiscounts[item.product.id];
                        const lineGross = item.product.price * item.quantity;
                        let lineDisc = 0;
                        if (disc) {
                          lineDisc = disc.type === 'percent' ? lineGross * (disc.value / 100) : Math.min(lineGross, disc.value * item.quantity);
                        }
                        const lineNet = lineGross - lineDisc;

                        return (
                          <div key={item.product.id} className="p-2 bg-white dark:bg-slate-900 flex items-center justify-between gap-2 text-xs">
                            <div className="flex items-center gap-2 min-w-0">
                              <img src={item.product.image} alt={item.product.name} className="w-6 h-6 rounded object-cover shrink-0" />
                              <div className="min-w-0">
                                <span className="font-bold text-slate-900 dark:text-white block truncate text-[11px]">{item.product.name}</span>
                                <span className="text-[9px] text-slate-400 font-mono">
                                  {item.quantity} × {symbol}{item.product.price}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              {disc ? (
                                <div className="text-right">
                                  <span className="text-[9px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-1 py-0.2 rounded">
                                    -{symbol}{lineDisc.toFixed(2)} ({disc.value}{disc.type === 'percent' ? '%' : symbol})
                                  </span>
                                  <span className="block font-black text-emerald-600 dark:text-emerald-400 text-[10px]">
                                    {symbol}{lineNet.toFixed(2)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400">No disc</span>
                              )}

                              {disc && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItemDiscount(item.product.id)}
                                  className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                  title="Remove item discount"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* FIG 8.5.3 LIVE CALCULATION & CONFIRMATION PREVIEW BOX */}
          <div className="p-3 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950 text-white rounded-2xl border border-emerald-800/40 shadow-md space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
              <div className="flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-300">
                  Fig 8.5.3 Live Calculation Preview
                </span>
              </div>
              <span className="text-[9px] font-mono bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded">
                Pre-Confirmation
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 text-[10px]">
              <div className="bg-slate-800/70 p-1.5 rounded-lg">
                <span className="text-[9px] text-slate-400 block truncate">Gross</span>
                <span className="font-extrabold text-white">{symbol}{grossSubtotal.toFixed(2)}</span>
              </div>

              <div className="bg-slate-800/70 p-1.5 rounded-lg">
                <span className="text-[9px] text-slate-400 block truncate">Item Disc</span>
                <span className={`font-extrabold ${draftItemDiscountTotal > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                  -{symbol}{draftItemDiscountTotal.toFixed(2)}
                </span>
              </div>

              <div className="bg-slate-800/70 p-1.5 rounded-lg">
                <span className="text-[9px] text-slate-400 block truncate">Bill Promo</span>
                <span className={`font-extrabold ${draftBillDiscountAmount > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                  -{symbol}{draftBillDiscountAmount.toFixed(2)}
                </span>
              </div>

              <div className="bg-slate-800/70 p-1.5 rounded-lg">
                <span className="text-[9px] text-slate-400 block truncate">GST (18%)</span>
                <span className="font-extrabold text-slate-300">+{symbol}{draftGst.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <div>
                <span className="text-[9px] text-emerald-400 font-extrabold uppercase tracking-wider block">
                  Savings: {symbol}{draftTotalDiscount.toFixed(2)}
                </span>
              </div>

              <div className="text-right flex items-baseline gap-2">
                <span className="text-[9px] text-slate-400 uppercase font-bold">Payable Total:</span>
                <span className="text-lg font-black text-emerald-400 font-mono">
                  {symbol}{draftGrandTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Action Buttons Footer */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetAll}
            className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
          >
            Reset / Clear
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { playClick(); onClose(); }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleConfirmAndApply}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white text-xs font-black shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Confirm & Apply to Order</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
