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

        {/* Official SmartMart Pro Brand Emblem Hero */}
        <div className="relative group flex flex-col items-center">
          {/* Animated Halo Glow */}
          <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500/40 via-amber-400/30 to-emerald-400/40 rounded-full blur-xl animate-pulse-slow pointer-events-none" />
          
          {/* Rotating speed-orbit dashed ring */}
          <div className="absolute -inset-2 rounded-full border-2 border-dashed border-emerald-400/60 animate-spin-slow pointer-events-none" />

          {/* Core Emblem Badge */}
          <div className="relative w-32 h-32 rounded-3xl p-2 bg-white/95 ring-2 ring-emerald-400/70 shadow-2xl shadow-emerald-500/40 overflow-hidden flex items-center justify-center">
            <img 
              src="/@fs/C:/Users/sarat/.gemini/antigravity-ide/brain/3fc5a59a-2f99-4f0b-9a42-b62dd25c66f2/.user_uploaded/media_1791118183787.png"
              alt="SmartMart Pro Official Logo" 
              className="w-full h-full object-contain"
              onError={(e) => { e.target.src = '/smartmart_logo.png'; }}
            />
          </div>
          {/* Subtle reflection floor */}
          <div className="w-24 h-2.5 mt-3 bg-emerald-500/30 blur-sm rounded-full" />
        </div>

        {/* Brand Lockup */}
        <div className="text-center space-y-1.5">
          <h1 className="text-4xl font-black text-white tracking-tight flex items-center justify-center gap-2">
            <span>SmartMart</span>
            <span className="bg-gradient-to-r from-emerald-400 via-amber-300 to-emerald-300 bg-clip-text text-transparent font-black">
              Pro
            </span>
          </h1>
          <p className="text-xs font-bold text-emerald-300/90 tracking-widest uppercase">Freshness • Quality • Trust</p>
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
