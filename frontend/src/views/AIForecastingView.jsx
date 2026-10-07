import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { 
  Sparkles, 
  BrainCircuit, 
  Lightbulb, 
  ArrowRight,
  Zap
} from 'lucide-react';

export default function AIForecastingView() {
  const { setAiDrawerOpen } = useApp();
  const { playBeep } = useSoundEffects();
  const { t } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="space-y-1 relative z-10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-300 animate-spin-slow" />
            <span className="text-xs font-extrabold text-emerald-300 uppercase tracking-wider">{t("AI INTELLIGENCE ENGINE") || "AI INTELLIGENCE ENGINE"}</span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-white">
            {t("Demand Forecasting & Automated Reorders")}
          </h2>
          <p className="text-xs text-emerald-100 max-w-xl">
            Machine-learning models trained on historical POS sales transactions predict upcoming stock shortages and customer purchase affinities.
          </p>
        </div>
        <button
          onClick={() => { playBeep(); setAiDrawerOpen(true); }}
          className="bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold px-5 py-3 rounded-2xl text-xs flex items-center gap-2 shadow-md transition-transform active:scale-95 shrink-0 relative z-10"
        >
          <BrainCircuit className="w-4 h-4 text-emerald-600" />
          <span>{t("LAUNCH AI COPILOT CHAT")}</span>
        </button>
      </div>

      {/* Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Smart Reorder Recommendations */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{t("Smart Reorder Recommendations")}</h3>
            </div>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold px-2.5 py-0.5 rounded-full">Automated</span>
          </div>

          <div className="space-y-3">
            {[
              { name: "Royal Basmati Rice 5kg", current: 12, recQty: 50, supplier: "Apex Foods Ltd", rationale: "Velocity: 14 bags/day. Projected stockout in 18 hrs." },
              { name: "Whole Milk 1 Gallon", current: 8, recQty: 40, supplier: "Apex Foods Ltd", rationale: "Weekend surge expected (+35% demand boost)." },
              { name: "Organic Bananas", current: 12, recQty: 80, supplier: "Green Valley Farms", rationale: "Fast perishability item. Consistent morning demand." },
            ].map((rec, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{rec.name}</h4>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">Reorder: +{rec.recQty} units</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{rec.rationale}</p>
                <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400 font-mono">
                  <span>Current Stock: <strong className="text-amber-600">{rec.current} units</strong></span>
                  <span>Supplier: {rec.supplier}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Customer Purchase Insights */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-teal-500" />
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{t("Customer Cross-Sell Matrix")}</h3>
            </div>
            <span className="text-[10px] bg-teal-500/10 text-teal-600 font-extrabold px-2.5 py-0.5 rounded-full">AI Recommendation</span>
          </div>

          <div className="space-y-3">
            {[
              { item: "Bought Sourdough Country Bread", rec: "Recommend Butter 8oz & Strawberry Jam", confidence: "94% Match Rate" },
              { item: "Bought Organic Italian Pasta", rec: "Recommend Pasta Sauce & Parmesan Cheese", confidence: "89% Match Rate" },
              { item: "Bought Roasted Coffee Beans", rec: "Recommend Whole Milk 1G & Brown Sugar", confidence: "86% Match Rate" },
            ].map((cross, i) => (
              <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold text-slate-900 dark:text-white">
                  <span>{cross.item}</span>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-600 px-2 py-0.5 rounded-md font-bold">{cross.confidence}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  <ArrowRight className="w-3.5 h-3.5" />
                  <span>{cross.rec}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
