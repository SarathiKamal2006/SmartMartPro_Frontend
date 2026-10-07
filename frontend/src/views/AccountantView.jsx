import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { 
  Calculator, 
  DollarSign, 
  TrendingUp, 
  Receipt, 
  Plus, 
  FileText, 
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function AccountantView() {
  const { expenses, setExpenses, transactions, branchExpenses, branchTransactions, branchProfile, selectedBranch } = useApp();
  const { playSuccess, playClick } = useSoundEffects();
  const { t } = useLanguage();

  const [showAddExpense, setShowAddExpense] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);
  const [gstFiled, setGstFiled] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Utilities',
    amount: '',
    branch: 'Downtown Superstore'
  });

  const grossRevenue = useMemo(() => {
    const trxSum = branchTransactions ? branchTransactions.reduce((sum, t) => sum + t.amount, 0) : 0;
    return trxSum + branchProfile.baseRevenueAddon;
  }, [branchTransactions, branchProfile]);

  const totalExpenseSum = useMemo(() => {
    return branchExpenses ? branchExpenses.reduce((sum, e) => sum + e.amount, 0) : 0;
  }, [branchExpenses]);

  const gstCollected = useMemo(() => {
    return grossRevenue * 0.18;
  }, [grossRevenue]);

  const netProfit = useMemo(() => {
    return grossRevenue - totalExpenseSum - gstCollected;
  }, [grossRevenue, totalExpenseSum, gstCollected]);

  const handleAddExpense = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.amount) return;

    const newExp = {
      id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
      title: formData.title,
      category: formData.category,
      amount: parseFloat(formData.amount),
      date: 'Just now',
      status: 'Paid',
      branch: formData.branch
    };

    setExpenses(prev => [newExp, ...prev]);
    playSuccess();
    setShowAddExpense(false);
    setFormData({ title: '', category: 'Utilities', amount: '', branch: 'Downtown Superstore' });
    setSuccessMsg(true);
    setTimeout(() => setSuccessMsg(false), 3000);
  };

  const handleFileGST = () => {
    playSuccess();
    setGstFiled(true);
    setTimeout(() => setGstFiled(false), 4000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t("Finance, Expenses & GST Tax Ledger")}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track store profit margins, operational expenditures, payroll, and 18% GST tax filings.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => { playClick(); handleFileGST(); }}
            className="bg-slate-900 dark:bg-slate-800 hover:brightness-110 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 border border-slate-700 shadow-sm"
          >
            <Receipt className="w-4 h-4 text-amber-500" />
            <span>{t("FILE 18% GST RETURN")}</span>
          </button>

          <button
            onClick={() => { playClick(); setShowAddExpense(true); }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>{t("LOG NEW EXPENSE")}</span>
          </button>
        </div>
      </div>

      {gstFiled && (
        <div className="p-3 bg-teal-500/10 border border-teal-500/30 text-teal-600 dark:text-teal-400 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-teal-500" />
          <span>GST Return Filed Successfully: GSTIN-33AAECS5481R1ZN filed for Q3-2026. Acknowledgement Receipt generated!</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Expense voucher logged to company ledger successfully!</span>
        </div>
      )}

      {/* KPI Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t("Gross Revenue (YTD)")}</span>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">₹{grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +18.4% growth
          </span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t("Operating Expenses")}</span>
          <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">₹{totalExpenseSum.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <span className="text-[10px] text-slate-400 font-semibold mt-1 block">{branchExpenses?.length || 0} active expense categories</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t("Net Operating Profit")}</span>
          <h3 className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">₹{netProfit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">{(netProfit / grossRevenue * 100).toFixed(1)}% Net Margin</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">{t("GST 18% Tax Collected")}</span>
          <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">₹{gstCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold mt-1 block">Ready for tax audit filing</span>
        </div>
      </div>

      {/* Expenses Ledger Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{t("Operational Expense Voucher Logs")}</h3>
          <span className="text-xs text-slate-400 font-mono">{branchExpenses?.length || 0} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5">VOUCHER ID</th>
                <th className="p-3.5">TITLE & DESCRIPTION</th>
                <th className="p-3.5">CATEGORY</th>
                <th className="p-3.5">BRANCH</th>
                <th className="p-3.5">DATE</th>
                <th className="p-3.5 text-right">AMOUNT (₹)</th>
                <th className="p-3.5 text-right">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {branchExpenses && branchExpenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3.5 font-mono text-emerald-600 dark:text-emerald-400 font-bold">{exp.id}</td>
                  <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">{exp.title}</td>
                  <td className="p-3.5">
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {exp.category}
                    </span>
                  </td>
                  <td className="p-3.5 font-semibold text-slate-600 dark:text-slate-400">{exp.branch}</td>
                  <td className="p-3.5 text-slate-400">{exp.date}</td>
                  <td className="p-3.5 text-right font-extrabold text-slate-900 dark:text-white">₹{exp.amount.toFixed(2)}</td>
                  <td className="p-3.5 text-right">
                    <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      {exp.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Log Operational Expense</h3>
              <button onClick={() => setShowAddExpense(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">EXPENSE TITLE</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Commercial Electricity Bill"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">CATEGORY</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    <option>Utilities</option>
                    <option>Logistics</option>
                    <option>Maintenance</option>
                    <option>Payroll</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">AMOUNT (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-2xl text-xs shadow-md shadow-emerald-600/20"
              >
                SUBMIT VOUCHER TO LEDGER
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
