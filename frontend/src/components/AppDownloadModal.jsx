import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  QrCode, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  Zap, 
  ShieldCheck, 
  Clock, 
  Tag, 
  ExternalLink 
} from 'lucide-react';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { useToast } from '../context/ToastContext';

export default function AppDownloadModal({ isOpen, onClose, initialPlatform = 'android' }) {
  const { playClick, playSuccess, playBeep } = useSoundEffects();
  const { showToast } = useToast();

  const [platform, setPlatform] = useState(initialPlatform);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen) return null;

  const handleSendLink = (e) => {
    e.preventDefault();
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      playBeep();
      showToast({
        title: 'Enter Valid Phone Number',
        message: 'Please provide a valid 10-digit mobile number.',
        type: 'warning'
      });
      return;
    }

    setIsSending(true);
    playSuccess();
    setTimeout(() => {
      setIsSending(false);
      setSentSuccess(true);
      showToast({
        title: 'App Link Dispatched! 📲',
        message: `Download link sent via SMS and WhatsApp to +91 ${phoneNumber}`,
        type: 'success',
        duration: 5000
      });
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-600/10 via-emerald-500/10 to-slate-100 dark:to-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-red-500/20">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-red-600 text-white shadow-sm">
                  POTHYS SMARTMART APP
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1">
                  <Zap className="w-3 h-3 fill-emerald-500" /> 10-Min Fast Delivery
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                Download Our Official Mobile App
              </h3>
            </div>
          </div>

          <button
            onClick={() => { playClick(); onClose(); }}
            className="p-2.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800 hover:bg-red-500 hover:text-white text-slate-700 dark:text-slate-300 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
            
            {/* Left: QR Code Scanner Simulation */}
            <div className="bg-slate-50 dark:bg-slate-800/60 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-700/80 flex flex-col items-center text-center space-y-3 shadow-inner">
              <div className="relative p-3 bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-red-500/40 shadow-md">
                {/* SVG QR code graphic */}
                <svg className="w-36 h-36" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="100" height="100" fill="white" rx="8" />
                  {/* Outer corner boxes */}
                  <rect x="10" y="10" width="24" height="24" rx="4" fill="#dc2626" />
                  <rect x="14" y="14" width="16" height="16" fill="white" />
                  <rect x="18" y="18" width="8" height="8" fill="#dc2626" />

                  <rect x="66" y="10" width="24" height="24" rx="4" fill="#dc2626" />
                  <rect x="70" y="14" width="16" height="16" fill="white" />
                  <rect x="74" y="18" width="8" height="8" fill="#dc2626" />

                  <rect x="10" y="66" width="24" height="24" rx="4" fill="#dc2626" />
                  <rect x="14" y="70" width="16" height="16" fill="white" />
                  <rect x="78" y="78" width="8" height="8" fill="#dc2626" />

                  {/* QR code dots */}
                  <rect x="40" y="12" width="6" height="6" fill="#0f172a" rx="1" />
                  <rect x="50" y="12" width="6" height="6" fill="#0f172a" rx="1" />
                  <rect x="40" y="24" width="8" height="8" fill="#059669" rx="1" />
                  <rect x="52" y="24" width="6" height="6" fill="#0f172a" rx="1" />
                  <rect x="12" y="42" width="8" height="8" fill="#0f172a" rx="1" />
                  <rect x="26" y="42" width="6" height="6" fill="#0f172a" rx="1" />
                  <rect x="36" y="38" width="10" height="10" fill="#dc2626" rx="2" />
                  <rect x="50" y="40" width="8" height="8" fill="#0f172a" rx="1" />
                  <rect x="64" y="42" width="6" height="6" fill="#059669" rx="1" />
                  <rect x="76" y="42" width="12" height="6" fill="#0f172a" rx="1" />
                  <rect x="40" y="56" width="8" height="8" fill="#0f172a" rx="1" />
                  <rect x="54" y="56" width="8" height="8" fill="#dc2626" rx="1" />
                  <rect x="68" y="54" width="6" height="6" fill="#0f172a" rx="1" />
                  <rect x="40" y="72" width="6" height="6" fill="#059669" rx="1" />
                  <rect x="52" y="72" width="10" height="10" fill="#0f172a" rx="1" />
                  <rect x="68" y="72" width="8" height="8" fill="#dc2626" rx="1" />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <span className="bg-red-600 text-white font-black text-[8px] px-1.5 py-0.5 rounded shadow">
                    MART
                  </span>
                </div>
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Point your phone camera or Google Lens to download instantly.
              </p>
            </div>

            {/* Right: Badges & Instant SMS Link Form */}
            <div className="space-y-4">
              <div>
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider">
                  Available On All Platforms
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2">
                  
                  {/* Google Play Button */}
                  <a
                    href="https://play.google.com/store"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => playClick()}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-black text-white hover:bg-slate-800 transition-transform active:scale-95 border border-slate-700 shadow-md"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
                      <path d="M3.609 1.814L13.792 12 3.61 22.186c-.352-.334-.56-.807-.56-1.336V3.15c0-.529.208-1.002.56-1.336z" fill="#00C1A6"/>
                      <path d="M17.158 8.634l-3.366 3.366 3.366 3.366 3.821-2.184c1.09-.623 1.09-1.725 0-2.348l-3.821-2.2z" fill="#FFD400"/>
                      <path d="M13.792 12L3.61 1.814C3.89 1.547 4.293 1.4 4.74 1.656l12.418 7.098-3.366 3.246z" fill="#0080FF"/>
                      <path d="M13.792 12l3.366 3.366L4.74 22.464c-.447.256-.85.109-1.13-.158L13.792 12z" fill="#FF3333"/>
                    </svg>
                    <div className="text-left leading-tight">
                      <div className="text-[8px] uppercase tracking-wider text-slate-300 font-semibold">GET IT ON</div>
                      <div className="text-xs font-black text-white">Google Play</div>
                    </div>
                  </a>

                  {/* App Store Button */}
                  <a
                    href="https://www.apple.com/app-store/"
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => playClick()}
                    className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-black text-white hover:bg-slate-800 transition-transform active:scale-95 border border-slate-700 shadow-md"
                  >
                    <svg className="w-5 h-5 shrink-0 fill-white" viewBox="0 0 24 24">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.99.6-2.63 1.35-.57.65-1.07 1.71-.93 2.73 1 .08 2.02-.48 2.64-1.23z"/>
                    </svg>
                    <div className="text-left leading-tight">
                      <div className="text-[8px] uppercase tracking-wider text-slate-300 font-semibold">Download on the</div>
                      <div className="text-xs font-black text-white">App Store</div>
                    </div>
                  </a>

                </div>
              </div>

              {/* SMS / WhatsApp Link Input */}
              <form onSubmit={handleSendLink} className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                  Get App Link on your Mobile Number
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="98401 23456"
                      className="w-full pl-11 pr-3 py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                  >
                    {isSending ? (
                      <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Send className="w-3.5 h-3.5" />
                    )}
                    <span>Send Link</span>
                  </button>
                </div>
                {sentSuccess && (
                  <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Link sent to +91 {phoneNumber}!
                  </p>
                )}
              </form>

              {/* Perks */}
              <div className="pt-2 grid grid-cols-2 gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  <span>20% OFF on 1st App Order</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Live Rider Tracking</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-bold">
            Compatible with Android 8.0+ and iOS 14.0+
          </span>
          <button
            onClick={() => { playClick(); onClose(); }}
            className="px-5 py-2 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-extrabold text-xs transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
