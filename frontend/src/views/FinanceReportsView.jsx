import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { 
  DollarSign, 
  FileSpreadsheet, 
  FileText, 
  BarChart3, 
  ArrowUpRight, 
  ArrowDownRight
} from 'lucide-react';

export default function FinanceReportsView() {
  const { transactions } = useApp();
  const { playClick } = useSoundEffects();
  const { t } = useLanguage();

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t("Financial Ledger & Profit Reports")}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t("Inspect cash ledger summaries, GST tax collections, profit ratios, and operational expenses.")}</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={playClick}
            className="px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5 text-rose-600" />
            <span>{t("EXPORT PDF")}</span>
          </button>
          <button 
            onClick={playClick}
            className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>{t("EXPORT EXCEL")}</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t("Total Revenue")}</span>
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">₹1,48,250.00</h3>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">+12.4% {t("vs last month")}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t("Expenses")}</span>
            <div className="w-9 h-9 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">₹92,400.00</h3>
          <span className="text-xs text-rose-600 font-bold mt-1 block">+4.1% {t("vs last month")}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t("Net Profit")}</span>
            <div className="w-9 h-9 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
              <ArrowUpRight className="w-4 h-4 text-teal-600" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">₹55,850.00</h3>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">+18.2% {t("vs last month")}</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t("GST Collected")}</span>
            <div className="w-9 h-9 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
              <BarChart3 className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">₹11,842.00</h3>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">+8.2% {t("vs last month")}</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
        {/* Ledger Table */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{t("Recent Ledger Transactions")}</h3>
            <span className="text-xs text-emerald-600 font-bold hover:underline cursor-pointer">{t("View Full Ledger")}</span>
          </div>

          <div className="space-y-3">
            {[
              { title: "Bulk Produce Purchase (Sun Valley)", date: "Today, 11:20 AM", amt: "-$4,250.00", type: "Debit" },
              { title: "Daily Checkout Terminals Aggregation", date: "Today, 10:42 AM", amt: "+$12,845.50", type: "Credit" },
              { title: "Store Utility & Power Grid Bill", date: "Yesterday, 04:30 PM", amt: "-$1,850.00", type: "Debit" },
              { title: "Employee Payroll Disbursement (Sep)", date: "Oct 01, 2025", amt: "-$24,500.00", type: "Debit" },
            ].map((tx, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">{tx.title}</h4>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{tx.date}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs font-black ${tx.type === 'Credit' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
                    {tx.amt}
                  </span>
                  <span className={`text-[10px] block font-bold px-2 py-0.5 rounded-md mt-0.5 ${
                    tx.type === 'Credit' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'
                  }`}>
                    {t(tx.type)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expense Breakdown */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white mb-2">{t("Expense Breakdown")}</h3>
            <p className="text-xs text-slate-500 mb-4">{t("Total Expenses")}: $92,400.00</p>

            <div className="space-y-3">
              {[
                { label: t('Inventory Purchases') + ' (50%)', val: '$46,200', pct: '50%', color: 'bg-emerald-500' },
                { label: t('Staff Salaries') + ' (25%)', val: '$23,100', pct: '25%', color: 'bg-teal-500' },
                { label: t('Store Utilities') + ' (15%)', val: '$13,860', pct: '15%', color: 'bg-amber-500' },
                { label: t('Logistics & Freight') + ' (10%)', val: '$9,240', pct: '10%', color: 'bg-blue-500' },
              ].map((item, i) => (
                <div key={i} className="space-y-1 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">{item.label}</span>
                    <span className="font-bold text-slate-900 dark:text-white">{item.val}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div className={`h-full ${item.color} rounded-full`} style={{ width: item.pct }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
