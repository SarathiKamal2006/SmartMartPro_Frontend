import React from 'react';

// Direct file path for user's official uploaded logo
const DIRECT_LOGO_PATH = 'C:/Users/sarat/.gemini/antigravity-ide/brain/3fc5a59a-2f99-4f0b-9a42-b62dd25c66f2/.user_uploaded/media_1791118183787.png';

/**
 * SmartMart Pro Official Logo Component
 * Features:
 * - Supports horizontal and vertical (stacked) layouts
 * - Micro-animations: Ambient breathing halo, rotating speed-arc ring, hover lift & sparkle ping
 * - Seamless multi-theme integration across dark & light UI surfaces
 */
export default function Logo({ 
  size = 'md', // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  showText = true, 
  subtitle = 'GROCERY & RETAIL ERP',
  className = '',
  iconOnly = false,
  animated = true,
  layout = 'horizontal', // 'horizontal' | 'vertical'
  onClick
}) {
  const sizeMap = {
    xs: { icon: 'w-9 h-9', text: 'text-sm', sub: 'text-[7.5px]', emblemSize: 'w-9 h-9' },
    sm: { icon: 'w-11 h-11', text: 'text-base', sub: 'text-[8.5px]', emblemSize: 'w-11 h-11' },
    md: { icon: 'w-14 h-14', text: 'text-xl', sub: 'text-[9.5px]', emblemSize: 'w-14 h-14' },
    lg: { icon: 'w-20 h-20', text: 'text-2xl', sub: 'text-[11px]', emblemSize: 'w-20 h-20' },
    xl: { icon: 'w-28 h-28', text: 'text-3xl sm:text-4xl', sub: 'text-xs sm:text-sm', emblemSize: 'w-28 h-28' },
    '2xl': { icon: 'w-36 h-36', text: 'text-5xl', sub: 'text-base', emblemSize: 'w-36 h-36' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isVertical = layout === 'vertical';

  return (
    <div 
      onClick={onClick}
      className={`inline-flex ${isVertical ? 'flex-col items-center text-center gap-2' : 'items-center gap-3'} select-none ${onClick ? 'cursor-pointer group' : 'group'} ${className}`}
    >
      {/* ─── Animated Emblem Container ─────────────────────────────── */}
      <div className="relative shrink-0 flex items-center justify-center">
        
        {/* 1. Subtle Ambient Breathing Halo Aura (Animation 1) */}
        {animated && (
          <div className="absolute -inset-1.5 bg-gradient-to-tr from-emerald-500/35 via-amber-400/25 to-teal-400/35 rounded-2xl blur-md opacity-75 group-hover:opacity-100 group-hover:scale-115 transition-all duration-500 animate-pulse-slow pointer-events-none" />
        )}

        {/* 2. Micro Rotating Speed-Arc Ring on Hover (Animation 2) */}
        {animated && (
          <div className="absolute -inset-1 rounded-2xl border border-dashed border-emerald-400/60 dark:border-emerald-400/70 opacity-70 group-hover:opacity-100 group-hover:rotate-180 transition-all duration-700 pointer-events-none" />
        )}

        {/* 3. Emblem Badge Core with pristine background & crisp containment */}
        <div className={`relative ${currentSize.emblemSize} rounded-2xl p-0.5 bg-white/95 dark:bg-slate-900/95 ring-1 ring-emerald-500/40 dark:ring-emerald-400/50 shadow-md shadow-emerald-600/15 overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:shadow-emerald-500/25`}>
          
          {/* Subtle gloss light overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-emerald-400/10 pointer-events-none z-10 rounded-2xl" />
          
          {/* Official High Quality SmartMart Pro Artwork */}
          <img 
            src={`/@fs/${DIRECT_LOGO_PATH.replace(/\\/g, '/')}`}
            alt="SmartMart Pro Official Brand Logo" 
            className="w-full h-full object-contain scale-105 rounded-xl transition-transform duration-500 group-hover:scale-115"
            onError={(e) => {
              // Graceful fallbacks
              if (e.target.src !== window.location.origin + '/smartmart_logo.png') {
                e.target.src = '/smartmart_logo.png';
              } else if (e.target.src !== window.location.origin + '/smartmart_logo.jpg') {
                e.target.src = '/smartmart_logo.jpg';
              }
            }}
          />
        </div>

        {/* 4. Tiny Floating Sparkle Accent (Animation 3) */}
        {animated && (
          <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full blur-[0.5px] shadow-sm shadow-amber-300 opacity-80 animate-ping pointer-events-none group-hover:scale-125" />
        )}
      </div>

      {/* ─── Brand Typography Lockup ───────────────────────────────── */}
      {showText && !iconOnly && (
        <div className={`flex flex-col ${isVertical ? 'items-center text-center' : 'justify-center'} leading-none`}>
          <div className={`font-black ${currentSize.text} tracking-tight text-slate-900 dark:text-white flex items-center gap-1 drop-shadow-xs`}>
            <span>SmartMart</span>
            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-500 bg-clip-text text-transparent drop-shadow-sm font-black">
              Pro
            </span>
          </div>
          {subtitle && (
            <span className={`font-extrabold tracking-widest text-emerald-700 dark:text-emerald-400 uppercase mt-1 ${currentSize.sub}`}>
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
