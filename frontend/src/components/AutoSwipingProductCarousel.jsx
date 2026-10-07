import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpRight } from 'lucide-react';
import ProductCard from './ProductCard';

export default function AutoSwipingProductCarousel({
  title,
  subtitle,
  tabs = [],
  activeTab,
  onTabChange,
  products = [],
  onOpenDetails,
  onShowAll,
  autoSwipeInterval = 3200,
}) {
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // Check scroll position
  const updateScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  // Manual scroll
  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = 240; // Approx single card width + gap
    const scrollAmount = direction === 'left' ? -cardWidth * 2 : cardWidth * 2;
    container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    setTimeout(updateScrollButtons, 300);
  };

  // Auto-swiping logic: auto-scroll horizontally every interval
  useEffect(() => {
    if (isHovered || products.length === 0) return;

    const interval = setInterval(() => {
      if (!scrollRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      
      // If reached end, wrap back to start
      if (scrollLeft + clientWidth >= scrollWidth - 15) {
        scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: 240, behavior: 'smooth' });
      }
      updateScrollButtons();
    }, autoSwipeInterval);

    return () => clearInterval(interval);
  }, [isHovered, products.length, autoSwipeInterval]);

  useEffect(() => {
    updateScrollButtons();
  }, [products]);

  return (
    <div 
      className="space-y-4 relative py-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header & Category Tabs */}
      <div className="flex flex-col items-center justify-center text-center space-y-3">
        {title && (
          <div>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                {subtitle}
              </p>
            )}
          </div>
        )}

        {/* Optional Category Pills Tabs */}
        {tabs.length > 0 && (
          <div className="flex items-center gap-1.5 max-w-full overflow-x-auto scrollbar-none py-1 px-4">
            {tabs.map((tab) => {
              const isActive = activeTab === tab || (!activeTab && tab === tabs[0]);
              return (
                <button
                  key={tab}
                  onClick={() => onTabChange && onTabChange(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap cursor-pointer shadow-2xs ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-sm ring-2 ring-emerald-700/30'
                      : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
                  }`}
                >
                  {tab}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Product Carousel with Left / Right Arrows */}
      <div className="relative group/carousel px-1">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
          className="absolute -left-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Horizontal Scrolling Cards Container */}
        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-3 px-2"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {products.map((prod) => (
            <div
              key={prod.id || prod.sku}
              className="w-[210px] sm:w-[225px] shrink-0"
              style={{ scrollSnapAlign: 'start' }}
            >
              <ProductCard
                product={prod}
                variant="pothys"
                onOpenDetails={onOpenDetails}
              />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          aria-label="Scroll right"
          className="absolute -right-2 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-200 hover:bg-emerald-50 hover:text-emerald-700 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Centered Show All Button */}
      {onShowAll && (
        <div className="flex justify-center pt-2">
          <button
            onClick={onShowAll}
            className="inline-flex items-center gap-1.5 px-6 py-2 rounded-full bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-700/20 active:scale-95 transition-all cursor-pointer"
          >
            <span>Show All</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
}
