import React, { useRef, useLayoutEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import Logo from './Logo';
import { X, Printer, CheckCircle2, ShoppingCart, Tag, ShieldCheck } from 'lucide-react';

function BarcodeSVG({ value }) {
  const bars = [
    2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 3, 2, 1, 1,
    3, 1, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 1, 3, 2, 1, 2, 1, 3, 1,
    2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1, 3, 2, 1, 1
  ];
  return (
    <div className="flex flex-col items-center justify-center my-2">
      <svg className="w-48 h-8" viewBox="0 0 220 32">
        {bars.map((width, idx) => {
          const x = idx * 3.5 + 5;
          return (
            <rect
              key={idx}
              x={x}
              y={0}
              width={idx % 2 === 0 ? width : width * 0.4}
              height={32}
              className="fill-slate-900 dark:fill-slate-100"
            />
          );
        })}
      </svg>
      <span className="font-mono text-[9px] tracking-[0.2em] text-slate-500 dark:text-slate-400 mt-0.5 uppercase font-black">
        *{value.replace('#', '')}*
      </span>
    </div>
  );
}

export default function InvoiceModal() {
  const { activeInvoice, setActiveInvoice, storeSettings, currencySymbol } = useApp();
  const { playSuccess } = useSoundEffects();
  const modalContainerRef = useRef(null);

  useLayoutEffect(() => {
    if (activeInvoice && modalContainerRef.current) {
      modalContainerRef.current.scrollTop = 0;
      playSuccess();
    }
  }, [activeInvoice, playSuccess]);

  if (!activeInvoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const details = activeInvoice.details || {};
  const symbol = currencySymbol || '₹';

  return (
    <div 
      id="printable-receipt-modal"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-fadeIn font-sans select-none"
    >
      {/* ── Fixed Max-Height Modal Container with Sticky Toolbar ── */}
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden relative transition-all"
      >
        {/* ── Sticky Top Header Control Toolbar (Hidden during print) ── */}
        <div className="px-4 py-3 bg-slate-100/90 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0 no-print">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>PAID & VERIFIED</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT</span>
            </button>
            <button
              onClick={() => setActiveInvoice(null)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close invoice"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Scrollable Printable Receipt Paper Body ── */}
        <div 
          ref={modalContainerRef}
          id="printable-receipt-paper"
          className="p-5 sm:p-6 text-slate-800 dark:text-slate-200 text-xs font-sans bg-white dark:bg-slate-900 space-y-3 overflow-y-auto flex-1 scrollbar-thin"
        >
          {/* Store Logo & Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center">
            <Logo 
              size="md" 
              subtitle="OFFICIAL TAX INVOICE • GST COMPLIANT" 
              className="justify-center"
            />
            <p className="text-[11px] font-extrabold text-slate-800 dark:text-slate-200 mt-1.5">
              {details.branch || "Chennai Central Superstore (Main)"}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium leading-tight">
              {storeSettings?.address || '14 Anna Salai, T. Nagar, Chennai - 600017'}
            </p>
            <p className="text-[9px] text-slate-400 font-mono mt-0.5">
              GSTIN: <strong>{storeSettings?.gstin || '33AAACS1429B1ZB'}</strong> • Ph: {storeSettings?.phone || '+91 98401 23456'}
            </p>
          </div>

          {/* Invoice Metadata Box */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-1.5 text-[11px]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400 font-bold uppercase text-[10px]">Invoice:</span>
                <span className="font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded text-[10px] border border-emerald-500/20">
                  {activeInvoice.id}
                </span>
              </div>
              <div className="text-right text-[10px] text-slate-500 font-medium">
                {activeInvoice.date === 'Just now' ? new Date().toLocaleString([], { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : activeInvoice.date}
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
              <div>
                <span className="text-slate-400 font-bold uppercase text-[10px]">Customer:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 ml-1 truncate max-w-[130px] inline-block align-bottom">
                  {activeInvoice.customer || 'Walk-in Customer'}
                </span>
              </div>
              <div className="text-right">
                <span className="font-black text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 text-[10px] border border-emerald-500/20">
                  {activeInvoice.paymentMethod || 'Cash'}
                </span>
              </div>
            </div>

            {/* Razorpay Online Verification Badge */}
            {(details.razorpayPaymentId || activeInvoice.paymentMethod?.includes('Razorpay')) && (
              <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-[10px] text-emerald-800 dark:text-emerald-300 font-bold mt-1">
                <div className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Razorpay Verified</span>
                </div>
                <span className="font-mono text-[9px]">
                  {details.razorpayPaymentId || `pay_${activeInvoice.id.replace('#', '').toLowerCase()}`}
                </span>
              </div>
            )}
          </div>

          {/* Product Items Table */}
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] uppercase font-black tracking-wider border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2 px-2.5">Item</th>
                  <th className="py-2 px-1 text-center">Qty</th>
                  <th className="py-2 px-2 text-right">Price</th>
                  <th className="py-2 px-2.5 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {(details.cartItems || []).map((item, idx) => {
                  const itemPrice = Number(item.product.price || 0);
                  const itemQty = Number(item.quantity || 1);
                  const itemTotal = itemPrice * itemQty;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2 px-2.5">
                        <span className="font-extrabold text-slate-900 dark:text-white block leading-tight truncate max-w-[150px]">
                          {item.product.name}
                        </span>
                        <span className="text-[8px] font-mono text-slate-400">
                          {item.product.sku || `SKU-${idx + 1}`} {item.product.unit ? `(${item.product.unit})` : ''}
                        </span>
                      </td>
                      <td className="py-2 px-1 text-center font-black text-emerald-600 dark:text-emerald-400">
                        {itemQty}
                      </td>
                      <td className="py-2 px-2 text-right text-slate-500 dark:text-slate-400 font-mono text-[10px]">
                        {symbol}{itemPrice.toFixed(2)}
                      </td>
                      <td className="py-2 px-2.5 text-right font-black text-slate-900 dark:text-white font-mono">
                        {symbol}{itemTotal.toFixed(2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Breakdown summary */}
          <div className="space-y-1.5 pt-2 text-[11px]">
            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>Subtotal ({(details.cartItems || []).length} items):</span>
              <span className="font-extrabold text-slate-900 dark:text-white font-mono">{symbol}{(details.subtotal || 0).toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-slate-600 dark:text-slate-400">
              <span>GST Tax ({storeSettings?.taxRate || 18}% Included):</span>
              <span className="font-extrabold text-slate-900 dark:text-white font-mono">{symbol}{(details.gst || 0).toFixed(2)}</span>
            </div>

            {details.discount > 0 && (
              <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/10 px-2 py-1 rounded-lg">
                <span className="flex items-center gap-1 text-[10px]">
                  <Tag className="w-3 h-3" />
                  <span>Coupon Discount:</span>
                </span>
                <span className="font-mono font-black text-[10px]">-{symbol}{details.discount.toFixed(2)}</span>
              </div>
            )}

            {/* Grand Total Compact Box */}
            <div className="flex justify-between items-center p-3 bg-slate-900 dark:bg-emerald-950/60 text-white rounded-xl border border-slate-800 dark:border-emerald-500/30 shadow-md my-2">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">Grand Total</span>
                <span className="text-[9px] text-slate-400">Tax Invoice Total</span>
              </div>
              <div className="text-right">
                <span className="text-xl font-black text-emerald-400 font-mono tracking-tight">
                  {symbol}{(details.grandTotal || activeInvoice.amount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer & Barcode */}
          <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-700 text-center space-y-1">
            <BarcodeSVG value={activeInvoice.id} />

            <div className="text-[9px] text-slate-500 dark:text-slate-400 space-y-0.5">
              <p className="font-bold text-slate-700 dark:text-slate-300">
                CASHIER: <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{details.cashier || 'Sarathi Kamal N'}</span>
              </p>
              <p className="italic text-[8px]">Goods once sold can be returned within 7 days with original receipt.</p>
              <p className="font-black text-slate-800 dark:text-slate-200 text-[9px] pt-0.5">*** Thank you for shopping with us! ***</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
