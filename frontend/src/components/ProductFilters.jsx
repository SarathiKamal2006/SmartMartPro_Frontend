import React from 'react';
import { Filter, RotateCcw, Check, Sparkles } from 'lucide-react';

export default function ProductFilters({
  brands = [],
  selectedBrand = '',
  setSelectedBrand,
  priceRange = [0, 2000],
  setPriceRange,
  stockStatus = '',
  setStockStatus,
  onlyDiscount = false,
  setOnlyDiscount,
  sortBy = 'relevance',
  setSortBy,
  onReset
}) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-600" />
          <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">Filters & Sorting</h3>
        </div>
        <button
          onClick={onReset}
          className="text-[11px] font-bold text-rose-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Sort By Dropdown */}
      <div className="space-y-2">
        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">Sort By:</label>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
        >
          <option value="relevance">Relevance / Featured</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="discount">Highest Discount</option>
          <option value="newest">Newest Arrival</option>
        </select>
      </div>

      {/* Availability Filter */}
      <div className="space-y-2">
        <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">Stock Availability:</label>
        <div className="flex flex-col gap-1.5">
          {['', 'In Stock', 'Low Stock', 'Out of Stock'].map((status) => (
            <button
              key={status || 'all'}
              onClick={() => setStockStatus(status)}
              className={`px-3 py-2 rounded-xl text-xs font-bold text-left border transition-all flex items-center justify-between ${
                stockStatus === status
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-400'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <span>{status || 'All Stock Status'}</span>
              {stockStatus === status && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </button>
          ))}
        </div>
      </div>

      {/* Discount Only Checkbox */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={onlyDiscount}
            onChange={(e) => setOnlyDiscount(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700 cursor-pointer"
          />
          <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Items with Discount Only</span>
          </span>
        </label>
      </div>

      {/* Max Price Filter Slider */}
      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between text-xs font-extrabold text-slate-700 dark:text-slate-300">
          <span>Max Price Limit:</span>
          <span className="text-emerald-600 font-black">₹{priceRange[1]}</span>
        </div>
        <input
          type="range"
          min="10"
          max="2000"
          step="10"
          value={priceRange[1]}
          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
          className="w-full accent-emerald-600 cursor-pointer"
        />
        <div className="flex justify-between text-[10px] font-bold text-slate-400">
          <span>₹10</span>
          <span>₹2,000</span>
        </div>
      </div>

      {/* Brand Selector */}
      {brands.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300 block">Brand:</label>
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="w-full border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
