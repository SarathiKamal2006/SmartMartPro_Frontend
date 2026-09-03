import React, { useState, useRef, useId } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import BarcodeScannerModal from '../components/BarcodeScannerModal';
import { 
  Barcode, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  QrCode, 
  Banknote, 
  Receipt, 
  Scan,
  Tag
} from 'lucide-react';

export default function BillingPOSView() {
  const { 
    cart, 
    updateCartQuantity, 
    removeFromCart, 
    products, 
    addToCart,
    customers,
    selectedCustomer,
    setSelectedCustomer,
    paymentMethod,
    setPaymentMethod,
    cartTotals,
    completeCheckout,
    scannerModalOpen,
    setScannerModalOpen,
    showToast
  } = useApp();

  const { playClick, playBeep, playSuccess } = useSoundEffects();
  const { t } = useLanguage();
  const [scanInput, setScanInput] = useState('');
  
  const posScanId = useId();
  const scannerRef = useRef(null);

  const handleBarcodeScan = (e) => {
    e.preventDefault();
    if (!scanInput.trim()) return;
    const found = products.find(p => p.sku.toLowerCase() === scanInput.toLowerCase() || p.id === scanInput || p.name.toLowerCase().includes(scanInput.toLowerCase()));
    if (found) {
      addToCart(found);
      playSuccess();
      setScanInput('');
    } else {
      playBeep();
      showToast({
        title: 'Product Not Found ❌',
        message: `No SKU match for "${scanInput}". Try scanning PRD-284, DY-401, or BKY-092.`,
        type: 'error',
        category: 'product',
        duration: 4000
      });
    }
  };

  const handleCheckoutClick = () => {
    playSuccess();
    completeCheckout();
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{t("SmartMart Pro Point of Sale (POS) Billing Terminal")}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">High-speed supermarket checkout terminal, barcode scanner reader, 18% GST tax calculation, and split payments.</p>
        </div>

        <button
          onClick={() => { playBeep(); setScannerModalOpen(true); }}
          className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white font-extrabold text-xs flex items-center gap-2 shadow-md shadow-red-600/20 transition-transform active:scale-95"
        >
          <Scan className="w-4 h-4 text-white" />
          <span>{t("OPEN LASER SCANNER")}</span>
        </button>
      </div>

      {/* Barcode Scanner Bar */}
      <form onSubmit={handleBarcodeScan} className="flex gap-3">
        <div className="relative flex-1">
          <Barcode className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id={posScanId}
            type="text"
            value={scanInput}
            onChange={(e) => setScanInput(e.target.value)}
            placeholder="Scan SKU barcode or type item title (e.g. PRD-284, DY-401, Bananas)..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold px-6 py-3 rounded-2xl text-xs flex items-center gap-2 transition-all shrink-0 active:scale-95 border border-slate-700"
        >
          <Barcode className="w-4 h-4" />
          <span>{t("SCAN BARCODE")}</span>
        </button>
      </form>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Cart Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{t("SmartMart Pro Basket Items")}</h3>
              <span className="text-xs font-extrabold text-red-600 dark:text-red-400">{cart.length} {t("Unique SKUs")}</span>
            </div>
            {cart.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Receipt className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-sm font-extrabold text-slate-800 dark:text-slate-200">{t("Basket is currently empty")}</p>
                <p className="text-xs">{t("Scan a barcode or select items from supermarket catalog")}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-extrabold uppercase text-[10px]">
                      <th className="pb-3">Item Description</th>
                      <th className="pb-3 text-center">Quantity</th>
                      <th className="pb-3 text-right">Unit Price</th>
                      <th className="pb-3 text-right">Total</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                    {cart.map((item) => (
                      <tr key={item.product.id}>
                        <td className="py-3 font-bold">
                          <div className="flex items-center gap-3">
                            <img src={item.product.image} alt={item.product.name} className="w-9 h-9 rounded-xl object-cover" />
                            <div>
                              <span className="text-slate-900 dark:text-white font-extrabold">{t(item.product.name)}</span>
                              <span className="block text-[9px] text-slate-400 font-mono">{item.product.sku}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-center">
                          <div className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                            <button
                              onClick={() => { playClick(); updateCartQuantity(item.product.id, -1); }}
                              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                            >
                              <Minus className="w-3 h-3 text-red-600" />
                            </button>
                            <span className="font-extrabold w-6 text-center text-slate-900 dark:text-white">{item.quantity}</span>
                            <button
                              onClick={() => { playClick(); updateCartQuantity(item.product.id, 1); }}
                              className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300"
                            >
                              <Plus className="w-3 h-3 text-red-600" />
                            </button>
                          </div>
                        </td>
                        <td className="py-3 text-right font-semibold">₹{item.product.price.toFixed(2)}</td>
                        <td className="py-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                          ₹{(item.product.price * item.quantity).toFixed(2)}
                        </td>
                        <td className="py-3 text-right">
                          <button
                            onClick={() => { playBeep(); removeFromCart(item.product.id); }}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Subtotal Calculation Box */}
          <div className="p-4 bg-emerald-50/50 dark:bg-slate-800/40 rounded-2xl border border-emerald-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-xs font-semibold">
              <div className="flex gap-4">
                <span className="text-slate-500">{t("Subtotal")}:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">₹{cartTotals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex gap-4">
                <span className="text-slate-500">{t("GST (18%)")}:</span>
                <span className="font-extrabold text-slate-900 dark:text-white">₹{cartTotals.gst.toFixed(2)}</span>
              </div>
              {cartTotals.discount > 0 && (
                <div className="flex gap-4 text-emerald-600 dark:text-emerald-400">
                  <span>SmartMart Coupon Discount:</span>
                  <span className="font-extrabold">-₹{cartTotals.discount.toFixed(2)}</span>
                </div>
              )}
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">{t("GRAND TOTAL")}</span>
              <span className="text-3xl font-black text-emerald-600 dark:text-emerald-400">₹{cartTotals.grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Customer & Payment Method */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-6">
          <div>
            <label className="block text-xs font-extrabold text-slate-900 dark:text-white mb-2 uppercase">{t("CUSTOMER ATTACHMENT") || "CUSTOMER ATTACHMENT"}</label>
            <select
              value={selectedCustomer ? selectedCustomer.id : ''}
              onChange={(e) => {
                const c = customers.find(item => item.id === e.target.value);
                setSelectedCustomer(c || null);
                if (c) {
                  showToast({ title: 'Customer Attached 👤', message: `${c.name} (${c.tier} Member • ${c.points} pts)`, type: 'info', duration: 2500 });
                }
              }}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-bold text-slate-800 dark:text-slate-200"
            >
              <option value="">{t("Walk-in Customer")}</option>
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.tier} Member - {c.points} pts)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-900 dark:text-white mb-2 uppercase">{t("SELECT PAYMENT METHOD") || "SELECT PAYMENT METHOD"}</label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: 'Cash', label: t('Cash Payment'), icon: Banknote },
                { id: 'Card', label: t('Card / Swipe'), icon: CreditCard },
                { id: 'UPI', label: t('UPI / QR Code'), icon: QrCode },
                { id: 'Credit', label: t('SmartMart Wallet'), icon: Tag },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => {
                      playClick();
                      setPaymentMethod(m.id);
                      showToast({ title: `Payment Method: ${m.id} 💳`, message: `Selected for checkout`, type: 'info', duration: 1800 });
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'bg-red-50 dark:bg-slate-800 border-red-500 text-red-700 dark:text-red-400 font-bold shadow-sm'
                        : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isSelected ? 'text-red-600 dark:text-red-400' : 'text-slate-400'}`} />
                    <span className="text-xs">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <button
              disabled={cart.length === 0}
              onClick={handleCheckoutClick}
              className="w-full bg-gradient-to-r from-red-600 via-red-700 to-amber-600 hover:brightness-110 disabled:opacity-50 text-white font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-600/20 transition-transform active:scale-95"
            >
              <Receipt className="w-4 h-4" />
              <span>{t("PRINT POTHY INVOICE & PAY")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        ref={scannerRef}
        isOpen={scannerModalOpen}
        onClose={() => setScannerModalOpen(false)}
      />
    </div>
  );
}
