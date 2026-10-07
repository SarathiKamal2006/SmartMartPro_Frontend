import React, { useState, useRef, useImperativeHandle, forwardRef, useId, useLayoutEffect } from 'react';
import { QrCode, Scan, X, CheckCircle, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useCustomHooks';

const BarcodeScannerModal = forwardRef(function BarcodeScannerModal({ isOpen, onClose }, ref) {
  const { products, addToCart } = useApp();
  const { playBeep, playSuccess } = useSoundEffects();
  const [manualCode, setManualCode] = useState('');
  const [lastScanned, setLastScanned] = useState(null);
  const [isScanning, setIsScanning] = useState(false);

  // Hook 1: useId for accessibility
  const barcodeInputId = useId();

  // Hook 2: useRefs for DOM elements
  const inputRef = useRef(null);
  const scannerContainerRef = useRef(null);

  // Hook 3: useLayoutEffect for synchronous layout sizing before browser paint
  useLayoutEffect(() => {
    if (isOpen && scannerContainerRef.current) {
      inputRef.current?.focus();
    }
  }, [isOpen]);

  // Hook 4: useImperativeHandle to expose imperative methods to parent
  useImperativeHandle(ref, () => ({
    triggerScan: (skuCode) => {
      const match = products.find(p => p.sku === skuCode || p.id === skuCode);
      if (match) {
        addToCart(match);
        setLastScanned(match);
        playBeep();
        setTimeout(() => setLastScanned(null), 2500);
        return true;
      }
      return false;
    },
    focusInput: () => {
      inputRef.current?.focus();
    },
    resetScanner: () => {
      setManualCode('');
      setLastScanned(null);
    }
  }), [products, addToCart, playBeep]);

  const handleSimulateScan = () => {
    setIsScanning(true);
    playBeep();
    setTimeout(() => {
      const randomProd = products[Math.floor(Math.random() * products.length)];
      addToCart(randomProd);
      setLastScanned(randomProd);
      playSuccess();
      setIsScanning(false);
      setTimeout(() => setLastScanned(null), 3000);
    }, 1000);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!manualCode.trim()) return;
    const match = products.find(p => p.sku.toLowerCase() === manualCode.trim().toLowerCase() || p.name.toLowerCase().includes(manualCode.trim().toLowerCase()));
    if (match) {
      addToCart(match);
      setLastScanned(match);
      playSuccess();
      setManualCode('');
      setTimeout(() => setLastScanned(null), 3000);
    } else {
      playBeep();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div 
        ref={scannerContainerRef}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xl relative overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Scan className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white tracking-wide">LASER BARCODE SCANNER</h3>
              <p className="text-xs text-slate-400">Aim SKU reader at product barcode</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder simulation */}
        <div className="relative h-48 rounded-2xl bg-slate-950 border-2 border-emerald-500/40 flex flex-col items-center justify-center overflow-hidden mb-5 shadow-inner">
          <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-lg animate-cyber-scan" />
          
          <QrCode className="w-16 h-16 text-emerald-500/30 mb-2 animate-float-slow" />
          <p className="text-xs font-mono text-emerald-400">AIMING LASER SCANNER AT SKU BARCODE...</p>

          {isScanning && (
            <div className="absolute inset-0 bg-emerald-950/80 flex items-center justify-center gap-2 text-emerald-300 font-mono text-xs font-bold">
              <Zap className="w-4 h-4 animate-spin text-emerald-400" /> SCANNING SKU DATA...
            </div>
          )}
        </div>

        {/* Last Scanned Feedback Banner */}
        {lastScanned && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-3 animate-fadeIn">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            <div className="text-xs font-bold">
              ADDED TO CART: {lastScanned.name} (${lastScanned.price.toFixed(2)})
            </div>
          </div>
        )}

        {/* Manual Barcode Input Form */}
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <div>
            <label htmlFor={barcodeInputId} className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase">
              MANUAL SKU CODE / QUICK ENTER:
            </label>
            <div className="flex gap-2">
              <input
                id={barcodeInputId}
                ref={inputRef}
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="e.g. PRD-284 or Bananas..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold text-white text-xs shadow-md transition-all"
              >
                ENTER
              </button>
            </div>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={handleSimulateScan}
              className="flex-1 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-bold text-xs hover:bg-emerald-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4 text-emerald-500" /> SIMULATE LASER SCAN
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              CLOSE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default BarcodeScannerModal;
