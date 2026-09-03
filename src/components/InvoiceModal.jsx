import React, { useRef, useLayoutEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { X, Printer, CheckCircle2, ShoppingCart } from 'lucide-react';

export default function InvoiceModal() {
  const { activeInvoice, setActiveInvoice } = useApp();
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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn font-sans">
      <div 
        ref={modalContainerRef}
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative"
      >
        {/* Header toolbar */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-emerald-600 font-extrabold text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>TRANSACTION COMPLETED</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT RECEIPT</span>
            </button>
            <button
              onClick={() => setActiveInvoice(null)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper Body */}
        <div className="p-6 text-slate-800 dark:text-slate-200 text-xs space-y-4 font-sans print:p-0 print:text-black">
          {/* Store Logo & Header */}
          <div className="text-center border-b border-slate-200 dark:border-slate-800 pb-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold mb-2 shadow-md">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <h2 className="font-extrabold text-xl text-slate-900 dark:text-white tracking-wider">SMARTMART PRO SUPERMARKET</h2>
            <p className="text-[11px] text-slate-500">124 Main Commercial Avenue, Downtown Branch</p>
            <p className="text-[10px] text-slate-400">GSTIN: 27AAAAA0000A1Z5 | HELPLINE: +1 800-SMART-MART</p>
          </div>

          {/* Invoice Meta */}
          <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 dark:bg-slate-800/50 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-slate-400 block font-bold">INVOICE SKU:</span>
              <span className="font-black text-slate-900 dark:text-white">{activeInvoice.id}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold">TIMESTAMP:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{activeInvoice.date}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold">CUSTOMER:</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">{activeInvoice.customer}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-bold">PAYMENT METHOD:</span>
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">{activeInvoice.paymentMethod}</span>
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[10px] uppercase font-extrabold">
                <th className="py-2">ITEM</th>
                <th className="py-2 text-center">QTY</th>
                <th className="py-2 text-right">PRICE</th>
                <th className="py-2 text-right">TOTAL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {(details.cartItems || []).map((item, idx) => (
                <tr key={idx}>
                  <td className="py-2 font-bold">
                    {item.product.name}
                    <span className="block text-[9px] text-slate-400 font-mono">{item.product.sku}</span>
                  </td>
                  <td className="py-2 text-center font-black text-emerald-600 dark:text-emerald-400">{item.quantity}</td>
                  <td className="py-2 text-right">₹{item.product.price.toFixed(2)}</td>
                  <td className="py-2 text-right font-black text-slate-900 dark:text-white">₹{(item.product.price * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Breakdown summary */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-3 space-y-1.5 text-right text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal:</span>
              <span className="font-extrabold text-slate-900 dark:text-white">₹{(details.subtotal || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>GST (18%):</span>
              <span className="font-extrabold text-slate-900 dark:text-white">₹{(details.gst || 0).toFixed(2)}</span>
            </div>
            {details.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount Coupon:</span>
                <span className="font-extrabold">-₹{details.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-base font-black text-emerald-600 dark:text-emerald-400 pt-2 border-t border-slate-200 dark:border-slate-800">
              <span>Grand Total:</span>
              <span className="text-xl">₹{(details.grandTotal || activeInvoice.amount).toFixed(2)}</span>
            </div>
          </div>

          {/* Footer signature note */}
          <div className="text-center pt-4 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-400">
            <p className="font-extrabold text-slate-900 dark:text-white">STORE MANAGER: Sarathi Kamal N</p>
            <p className="mt-0.5 text-slate-500">Thank you for shopping at SmartMart Pro Supermarket!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
