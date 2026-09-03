import React, { useEffect, useState } from 'react';

export default function SplashScreen({ onDone }) {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Increment progress bar smoothly
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 2;
      });
    }, 30);

    // After ~1.8s start fade out, then call onDone
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onDone, 500);
    }, 1800);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onDone]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-950 transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />

      <div className="relative flex flex-col items-center gap-8">

        {/* Animated Shopping Cart Track */}
        <div className="relative w-64 h-20 overflow-hidden">
          {/* Ground line */}
          <div className="absolute bottom-3 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent rounded-full" />

          {/* Moving cart SVG */}
          <div className="absolute bottom-3 animate-cart-move">
            <svg width="56" height="52" viewBox="0 0 56 52" fill="none">
              {/* Cart body */}
              <path
                d="M6 6H12L18 30H44L48 12H16"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Handle */}
              <path
                d="M2 6H6"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
              />
              {/* Items in cart - animated bounce */}
              <rect x="22" y="16" width="6" height="6" rx="1.5" fill="#34d399" className="animate-bounce" style={{ animationDelay: '0ms' }} />
              <rect x="30" y="14" width="6" height="8" rx="1.5" fill="#6ee7b7" className="animate-bounce" style={{ animationDelay: '100ms' }} />
              <rect x="38" y="16" width="5" height="6" rx="1.5" fill="#34d399" className="animate-bounce" style={{ animationDelay: '200ms' }} />
              {/* Wheels */}
              <circle cx="22" cy="38" r="5" fill="none" stroke="#10b981" strokeWidth="2.5" />
              <circle cx="22" cy="38" r="2" fill="#10b981" className="animate-spin" style={{ transformOrigin: '22px 38px' }} />
              <circle cx="40" cy="38" r="5" fill="none" stroke="#10b981" strokeWidth="2.5" />
              <circle cx="40" cy="38" r="2" fill="#10b981" className="animate-spin" style={{ transformOrigin: '40px 38px' }} />
            </svg>
          </div>

          {/* Speed lines */}
          <div className="absolute bottom-5 left-2 flex flex-col gap-1 animate-pulse">
            <div className="w-8 h-0.5 bg-emerald-500/30 rounded-full" />
            <div className="w-5 h-0.5 bg-emerald-500/20 rounded-full" />
            <div className="w-6 h-0.5 bg-emerald-500/25 rounded-full" />
          </div>
        </div>

        {/* Brand */}
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tight">
            SmartMart <span className="text-emerald-400">Pro</span>
          </h1>
          <p className="text-sm text-slate-400 font-medium">Enterprise Grocery ERP System</p>
        </div>

        {/* Progress bar */}
        <div className="w-56 space-y-2">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-75 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center text-xs text-slate-500 font-mono">
            Loading... {progress}%
          </p>
        </div>
      </div>

      <style>{`
        @keyframes cart-move {
          0%   { left: -70px; }
          100% { left: calc(100% + 10px); }
        }
        .animate-cart-move {
          animation: cart-move 1.6s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
