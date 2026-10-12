import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { 
  TrendingUp, 
  Calendar, 
  Sparkles, 
  AlertCircle, 
  Flame, 
  ChevronRight, 
  Layers, 
  Boxes, 
  ArrowUpRight,
  ShieldAlert,
  Info
} from 'lucide-react';

const HORIZON_OPTIONS = [
  { days: 7, label: '7 Days', subtitle: 'Short-term Horizon' },
  { days: 14, label: '14 Days', subtitle: 'Bi-Weekly Horizon' },
  { days: 30, label: '30 Days', subtitle: 'Monthly Horizon' },
  { days: 60, label: '60 Days', subtitle: 'Festive Horizon' },
  { days: 90, label: '90 Days', subtitle: 'Quarterly Horizon' }
];

const PRESET_PRODUCTS = [
  { id: 'ALL', name: 'All Storewide Categories (Aggregated Demand)', category: 'Aggregated', baseline: 320 },
  { id: 'RICE', name: 'Royal Basmati Rice 5kg (Staples)', category: 'Grains', baseline: 65 },
  { id: 'OIL', name: 'Fortune Sunlite Sunflower Oil 1L', category: 'Oils', baseline: 80 },
  { id: 'FESTIVE_SWEETS', name: 'Festive Ghee & Sweets Gift Box', category: 'Confectionery', baseline: 40 },
  { id: 'DAIRY', name: 'Amul Butter 500g & Fresh Milk', category: 'Dairy', baseline: 95 },
  { id: 'SPICES', name: 'Aachi Garam Masala & Spices 200g', category: 'Spices', baseline: 50 }
];

export default function DemandForecastChart({ onTriggerBuildupPO }) {
  const { products, showToast } = useApp();
  const { playClick, playSuccess } = useSoundEffects();

  const [selectedHorizon, setSelectedHorizon] = useState(30);
  const [selectedProductId, setSelectedProductId] = useState('ALL');
  const [hoveredPoint, setHoveredPoint] = useState(null);

  const activeProduct = PRESET_PRODUCTS.find(p => p.id === selectedProductId) || PRESET_PRODUCTS[0];

  // Generate historical data points (past days equal to horizon or 14 days) and forecast data points
  const chartData = useMemo(() => {
    const historyDays = Math.min(selectedHorizon, 30);
    const forecastDays = selectedHorizon;
    const data = [];
    const base = activeProduct.baseline;

    const today = new Date();

    // Past History Points (Actual Sales)
    for (let i = historyDays; i >= 1; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const noise = Math.sin(i * 0.7) * (base * 0.15);
      const weekendBoost = isWeekend ? base * 0.35 : 0;
      const value = Math.max(10, Math.round(base + noise + weekendBoost));

      data.push({
        date: d,
        label: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        type: 'history',
        value,
        upperConfidence: value,
        lowerConfidence: value,
        isPeak: false
      });
    }

    // Today Baseline Anchor
    const todayVal = Math.round(base * 1.05);
    data.push({
      date: today,
      label: 'Today',
      type: 'today',
      value: todayVal,
      upperConfidence: todayVal,
      lowerConfidence: todayVal,
      isPeak: false
    });

    // Future Forecast Points (Expected Demand)
    for (let i = 1; i <= forecastDays; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      const dayOfWeek = d.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      // Seasonal / Festival spikes simulation
      let seasonalFactor = 1.0;
      let peakEvent = null;

      // Festive Peak (e.g. Day 12 to 18)
      if (i >= 12 && i <= 16) {
        seasonalFactor = 2.2; // +120% Festive Surge
        peakEvent = '🪔 Diwali Festival Week (+120% Surge)';
      } else if (i >= 26 && i <= 29) {
        seasonalFactor = 1.85; // +85% Month-End Stockup
        peakEvent = '🛒 Month-End Stockup Rush (+85%)';
      } else if (isWeekend) {
        seasonalFactor = 1.4; // +40% Weekend Peak
        peakEvent = '⚡ Weekend Surge (+40%)';
      }

      const noise = Math.cos(i * 0.5) * (base * 0.1);
      const forecastVal = Math.round((base * seasonalFactor) + noise);
      const confidenceMargin = Math.round(forecastVal * 0.12);

      data.push({
        date: d,
        label: d.toLocaleDateString([], { month: 'short', day: 'numeric' }),
        type: 'forecast',
        value: forecastVal,
        upperConfidence: forecastVal + confidenceMargin,
        lowerConfidence: Math.max(5, forecastVal - confidenceMargin),
        isPeak: !!peakEvent,
        peakEvent
      });
    }

    return data;
  }, [selectedHorizon, activeProduct]);

  // Derived metrics for summary stats
  const historyPoints = chartData.filter(d => d.type === 'history');
  const forecastPoints = chartData.filter(d => d.type === 'forecast');

  const avgPastDemand = Math.round(historyPoints.reduce((s, p) => s + p.value, 0) / (historyPoints.length || 1));
  const totalForecastDemand = forecastPoints.reduce((s, p) => s + p.value, 0);
  const peakPoint = forecastPoints.reduce((max, p) => p.value > (max?.value || 0) ? p : max, forecastPoints[0]);
  const surgePct = avgPastDemand > 0 ? Math.round(((peakPoint?.value - avgPastDemand) / avgPastDemand) * 100) : 0;

  // Chart coordinate mapping
  const width = 800;
  const height = 260;
  const paddingLeft = 45;
  const paddingRight = 35;
  const paddingTop = 25;
  const paddingBottom = 40;

  const maxVal = Math.max(...chartData.map(d => d.upperConfidence || d.value), 100) * 1.15;
  const minVal = 0;

  const getX = (index) => paddingLeft + (index / (chartData.length - 1)) * (width - paddingLeft - paddingRight);
  const getY = (val) => height - paddingBottom - ((val - minVal) / (maxVal - minVal)) * (height - paddingTop - paddingBottom);

  const todayIndex = chartData.findIndex(d => d.type === 'today');
  const todayX = getX(todayIndex);

  // Build SVG Path strings
  const historyPath = chartData
    .slice(0, todayIndex + 1)
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.value)}`)
    .join(' ');

  const historyAreaPath = `${historyPath} L ${todayX} ${height - paddingBottom} L ${getX(0)} ${height - paddingBottom} Z`;

  const forecastPath = chartData
    .slice(todayIndex)
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(todayIndex + i)} ${getY(d.value)}`)
    .join(' ');

  // Confidence Band Polygon Path
  const upperConfidencePoints = chartData.slice(todayIndex).map((d, i) => `${getX(todayIndex + i)},${getY(d.upperConfidence)}`);
  const lowerConfidencePoints = chartData.slice(todayIndex).map((d, i) => `${getX(todayIndex + i)},${getY(d.lowerConfidence)}`).reverse();
  const confidenceBandPath = `M ${upperConfidencePoints.join(' L ')} L ${lowerConfidencePoints.join(' L ')} Z`;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
      
      {/* Title & Horizon Selector */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded border border-indigo-500/20">
              Fig 8.8.4
            </span>
            <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <span>Demand Forecast for a Selected Horizon</span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            The forecast chart shows expected demand for the chosen number of days next to the recent sales history. Seasonal peaks, such as festival weeks, are visible so that stock can be built up in advance.
          </p>
        </div>

        {/* Horizon Filter Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
          {HORIZON_OPTIONS.map((opt) => {
            const isActive = selectedHorizon === opt.days;
            return (
              <button
                key={opt.days}
                onClick={() => {
                  playClick();
                  setSelectedHorizon(opt.days);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30 scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Calendar className="w-3 h-3" />
                <span>{opt.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Selector Dropdown & Horizon Legend Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black uppercase text-slate-400">Forecast Target:</span>
          <select
            value={selectedProductId}
            onChange={(e) => {
              playClick();
              setSelectedProductId(e.target.value);
            }}
            className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-extrabold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer text-xs"
          >
            {PRESET_PRODUCTS.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block"></span>
            <span>Past Actual Sales</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-indigo-500 inline-block"></span>
            <span>Forecast Expected Demand</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-indigo-500/20 border border-indigo-400/40 inline-block"></span>
            <span>95% Confidence Band</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-amber-500 inline-block animate-pulse"></span>
            <span>Seasonal Peak / Festival Surge</span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart Canvas */}
      <div className="relative w-full overflow-hidden bg-slate-50 dark:bg-slate-950/60 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4">
        
        {/* Hover Tooltip Overlay */}
        {hoveredPoint && (
          <div 
            className="absolute top-4 left-1/2 -translate-x-1/2 z-20 px-3.5 py-2 bg-slate-900/95 text-white rounded-2xl shadow-xl border border-slate-700 flex items-center gap-3 backdrop-blur-md text-xs pointer-events-none animate-fade-in"
          >
            <div>
              <span className="text-[10px] text-slate-400 block font-bold">{hoveredPoint.label} ({hoveredPoint.type === 'history' ? 'Past Actual' : hoveredPoint.type === 'today' ? 'Current Baseline' : 'Forecast Projection'})</span>
              <span className="font-black text-sm text-emerald-400 font-mono">{hoveredPoint.value} units demand</span>
            </div>
            {hoveredPoint.peakEvent && (
              <div className="border-l border-slate-700 pl-3">
                <span className="text-[10px] text-amber-300 font-black block">{hoveredPoint.peakEvent}</span>
                <span className="text-[9px] text-slate-400">Stock buildup needed in advance</span>
              </div>
            )}
          </div>
        )}

        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible select-none">
          <defs>
            {/* Emerald Gradient for History Area */}
            <linearGradient id="historyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>

            {/* Indigo Gradient for Confidence Band */}
            <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.04" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const val = Math.round(minVal + ratio * (maxVal - minVal));
            const y = getY(val);
            return (
              <g key={ratio}>
                <line 
                  x1={paddingLeft} 
                  y1={y} 
                  x2={width - paddingRight} 
                  y2={y} 
                  stroke="currentColor" 
                  className="text-slate-200 dark:text-slate-800/80" 
                  strokeDasharray="4 4" 
                />
                <text 
                  x={paddingLeft - 8} 
                  y={y + 3.5} 
                  textAnchor="end" 
                  className="text-[9px] fill-slate-400 font-mono font-bold"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Dividing 'TODAY' Marker Vertical Line */}
          <line 
            x1={todayX} 
            y1={paddingTop} 
            x2={todayX} 
            y2={height - paddingBottom} 
            stroke="#6366f1" 
            strokeWidth="2" 
            strokeDasharray="3 3" 
          />
          <text 
            x={todayX} 
            y={paddingTop - 6} 
            textAnchor="middle" 
            className="text-[9px] fill-indigo-500 dark:fill-indigo-400 font-black uppercase font-mono tracking-wider"
          >
            📍 Today (Horizon Boundary)
          </text>

          {/* Confidence Band Area for Forecast */}
          <path d={confidenceBandPath} fill="url(#confidenceGradient)" />

          {/* Past History Area */}
          <path d={historyAreaPath} fill="url(#historyGradient)" />

          {/* Past History Solid Line */}
          <path 
            d={historyPath} 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Expected Forecast Dashed Line */}
          <path 
            d={forecastPath} 
            fill="none" 
            stroke="#6366f1" 
            strokeWidth="2.5" 
            strokeDasharray="5 4" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />

          {/* Data Points / Interactive Circles */}
          {chartData.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.value);
            const isToday = d.type === 'today';
            const isPeak = d.isPeak;

            return (
              <g 
                key={i} 
                className="cursor-pointer"
                onMouseEnter={() => setHoveredPoint(d)}
                onMouseLeave={() => setHoveredPoint(null)}
              >
                {/* Outer halo for peak festival days */}
                {isPeak && (
                  <circle 
                    cx={cx} 
                    cy={cy} 
                    r="8" 
                    fill="#f59e0b" 
                    fillOpacity="0.25" 
                    className="animate-ping"
                  />
                )}

                {/* Point dot */}
                <circle 
                  cx={cx} 
                  cy={cy} 
                  r={isPeak ? "5.5" : isToday ? "4.5" : "3.5"} 
                  fill={isPeak ? "#f59e0b" : isToday ? "#6366f1" : d.type === 'history' ? "#10b981" : "#818cf8"} 
                  stroke="#ffffff" 
                  strokeWidth="1.5"
                  className="transition-transform hover:scale-150"
                />

                {/* Festival peak floating icon */}
                {isPeak && d.value === peakPoint.value && (
                  <g>
                    <rect 
                      x={cx - 55} 
                      y={cy - 28} 
                      width="110" 
                      height="18" 
                      rx="6" 
                      fill="#78350f" 
                      stroke="#f59e0b" 
                      strokeWidth="1" 
                    />
                    <text 
                      x={cx} 
                      y={cy - 16} 
                      textAnchor="middle" 
                      className="text-[8px] fill-amber-200 font-black uppercase font-mono"
                    >
                      🪔 PEAK SURGE (+{surgePct}%)
                    </text>
                  </g>
                )}

                {/* Date Label on X Axis */}
                {(i % Math.ceil(chartData.length / 10) === 0 || isToday) && (
                  <text 
                    x={cx} 
                    y={height - paddingBottom + 16} 
                    textAnchor="middle" 
                    className={`text-[9px] font-mono font-bold ${
                      isToday ? 'fill-indigo-600 dark:fill-indigo-400 font-black' : 'fill-slate-400'
                    }`}
                  >
                    {d.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* ── Advance Stock Buildup Advisory Card ── */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-teal-500/10 border border-amber-500/20 dark:border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold shrink-0 mt-0.5">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-black text-sm text-slate-900 dark:text-white">
                Advance Stock Buildup Advisory (Festive Peak)
              </h4>
              <span className="bg-amber-500/20 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-black px-2 py-0.5 rounded-full">
                Surge Alert: +{surgePct}%
              </span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
              Demand for <strong>{activeProduct.name}</strong> will peak at <strong>{peakPoint?.value} units</strong> on <strong>{peakPoint?.label}</strong>. To avoid supermarket shelf stockouts, issue supplier purchase orders <strong>5 days in advance</strong> (by {new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString([], { month: 'short', day: 'numeric' })}).
            </p>
          </div>
        </div>

        {/* Buildup Action */}
        <button
          type="button"
          onClick={() => {
            playSuccess();
            showToast({
              title: 'Advance Buildup PO Generated! 📦',
              message: `Procurement buffer of ${Math.round(peakPoint?.value * 1.5)} units scheduled for ${activeProduct.name}.`,
              type: 'success',
              category: 'inventory'
            });
            if (onTriggerBuildupPO) onTriggerBuildupPO(activeProduct, Math.round(peakPoint?.value * 1.5));
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:brightness-110 text-white font-black text-xs rounded-2xl shadow-lg shadow-amber-600/25 transition-transform active:scale-95 cursor-pointer shrink-0 flex items-center gap-1.5"
        >
          <Boxes className="w-4 h-4" />
          <span>⚡ ORDER ADVANCE BUILDUP PO</span>
        </button>
      </div>

    </div>
  );
}
