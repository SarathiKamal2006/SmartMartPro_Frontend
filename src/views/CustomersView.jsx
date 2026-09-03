import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { 
  Users, 
  UserPlus, 
  Award, 
  DollarSign, 
  Plus, 
  Search
} from 'lucide-react';

export default function CustomersView() {
  const { customers } = useApp();
  const { playClick } = useSoundEffects();
  const [filterTab, setFilterTab] = useState('All Shoppers');
  const [search, setSearch] = useState('');

  const filtered = customers.filter(c => {
    if (filterTab === 'Gold Members') return c.tier === 'Gold';
    if (filterTab === 'High Spenders') return c.totalSpent > 1000;
    return c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Customer CRM & Loyalty Points</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage shopper profiles, loyalty tier rewards, digital wallets, and purchase history.</p>
        </div>
        <button 
          onClick={playClick}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>ADD CUSTOMER</span>
        </button>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Shoppers</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">1,842 Customers</h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">Active CRM Database</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">New Signups</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">+156 Signups</h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">Acquisition Up</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loyalty Members</span>
            <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">482 Members</h3>
            <span className="text-[10px] text-amber-600 font-bold mt-1 block">Point Holders</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Avg. Basket Value</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">$48.20 Spent</h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">Up 4.2% QoQ</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search customers..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['All Shoppers', 'Gold Members', 'High Spenders'].map((tab) => (
              <button
                key={tab}
                onClick={() => { playClick(); setFilterTab(tab); }}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                  filterTab === tab
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5">CUSTOMER NAME</th>
                <th className="p-3.5">PHONE NUMBER</th>
                <th className="p-3.5">EMAIL ADDRESS</th>
                <th className="p-3.5">TOTAL PURCHASES</th>
                <th className="p-3.5">LOYALTY POINTS</th>
                <th className="p-3.5">LAST VISIT</th>
                <th className="p-3.5 text-right">TIER LEVEL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">{c.name}</td>
                  <td className="p-3.5 font-mono text-slate-500">{c.phone}</td>
                  <td className="p-3.5 text-slate-500">{c.email}</td>
                  <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">₹{c.totalSpent.toFixed(2)}</td>
                  <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">{c.points} pts</td>
                  <td className="p-3.5 text-slate-400 text-[11px]">{c.lastVisit}</td>
                  <td className="p-3.5 text-right">
                    <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${
                      c.tier === 'Gold' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                      c.tier === 'Silver' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' :
                      'bg-teal-500/10 text-teal-600 dark:text-teal-400'
                    }`}>
                      {c.tier}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
