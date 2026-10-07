import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import api from '../services/api';
import { 
  Users, 
  UserPlus, 
  Award, 
  DollarSign, 
  Plus, 
  Search,
  X,
  CheckCircle,
  Mail,
  Phone,
  User,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export default function CustomersView() {
  const { customers, setCustomers } = useApp();
  const { playClick, playSuccess } = useSoundEffects();
  const [filterTab, setFilterTab] = useState('All Shoppers');
  const [search, setSearch] = useState('');

  // Add customer modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', walletBalance: '1000' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const filtered = customers.filter(c => {
    if (filterTab === 'Gold Members') return c.tier === 'Gold';
    if (filterTab === 'High Spenders') return (c.totalSpent || 0) > 1000;
    return (c.name || '').toLowerCase().includes(search.toLowerCase()) || 
           (c.email || '').toLowerCase().includes(search.toLowerCase());
  });

  // Dynamic statistics calculation
  const totalCustomersCount = customers.length;
  const goldMembersCount = customers.filter(c => c.tier === 'Gold').length;
  const totalSpentAll = customers.reduce((sum, c) => sum + (c.totalSpent || 0), 0);
  const avgSpent = totalCustomersCount > 0 ? (totalSpentAll / totalCustomersCount) : 0;

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.phone) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await api.customers.create({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        walletBalance: Number(formData.walletBalance || 1000),
        loyaltyPoints: 0
      });

      if (res && res.success && res.data) {
        playSuccess();
        setCustomers(prev => [{
          id: res.data._id || res.data.id || `CUST-${Date.now()}`,
          name: res.data.name,
          email: res.data.email,
          phone: res.data.phone,
          totalSpent: 0,
          points: 0,
          lastVisit: 'Just registered',
          tier: 'Bronze',
          wallet: Number(res.data.walletBalance || 1000)
        }, ...prev]);

        setShowAddModal(false);
        setFormData({ name: '', email: '', phone: '', walletBalance: '1000' });
      } else {
        setErrorMsg(res?.message || 'Failed to create customer.');
      }
    } catch (err) {
      setErrorMsg('Error creating customer: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Customer Directory & CRM</span>
            <span className="text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-bold">
              Real Registered Users Only
            </span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Displaying live customers registered via Email OTP verification, Google OAuth, GitHub OAuth, or manual CRM entry.
          </p>
        </div>
        <button 
          onClick={() => { playClick(); setShowAddModal(true); }}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-transform active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>ADD REGISTERED CUSTOMER</span>
        </button>
      </div>

      {/* Top 4 Dynamic Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Registered</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{totalCustomersCount} Shoppers</h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 inline" /> Verified Database
            </span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">New Signups (Live)</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">+{totalCustomersCount} Accounts</h3>
            <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold mt-1 block">Email OTP & OAuth</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
            <UserPlus className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Gold Tier Rewards</span>
            <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{goldMembersCount} Members</h3>
            <span className="text-[10px] text-amber-600 font-bold mt-1 block">High Value Buyers</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Avg. Basket Spend</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">₹{avgSpent.toFixed(2)}</h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">Customer Lifetime</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search registered customers..."
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

        {/* Table Content or Empty State */}
        {filtered.length === 0 ? (
          <div className="py-12 px-4 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto border border-emerald-500/20 shadow-sm">
              <Users className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {search ? `No customer matching "${search}"` : 'No Registered Customers Found'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
                {search 
                  ? 'Try clearing your search term or selecting another filter tab.'
                  : 'All sample mock customers have been cleared. Registered customers will automatically appear here once users sign up via Email OTP verification or Google/GitHub OAuth.'}
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-2xl text-xs flex items-center gap-2 shadow-sm transition-transform active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add First Registered Customer</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3.5">CUSTOMER NAME</th>
                  <th className="p-3.5">PHONE NUMBER</th>
                  <th className="p-3.5">EMAIL ADDRESS</th>
                  <th className="p-3.5">TOTAL PURCHASES</th>
                  <th className="p-3.5">LOYALTY POINTS</th>
                  <th className="p-3.5">STATUS</th>
                  <th className="p-3.5 text-right">TIER LEVEL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filtered.map((c) => (
                  <tr key={c.id || c._id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-xs flex items-center justify-center border border-emerald-500/20">
                        {c.name ? c.name.charAt(0).toUpperCase() : 'C'}
                      </div>
                      <span>{c.name}</span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">{c.phone || '+91 --- --- ----'}</td>
                    <td className="p-3.5 text-slate-500">{c.email}</td>
                    <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">₹{Number(c.totalSpent || 0).toFixed(2)}</td>
                    <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">{c.points || 0} pts</td>
                    <td className="p-3.5">
                      <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Verified
                      </span>
                    </td>
                    <td className="p-3.5 text-right">
                      <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full ${
                        c.tier === 'Gold' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20' :
                        c.tier === 'Silver' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300' :
                        'bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20'
                      }`}>
                        {c.tier || 'Bronze'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/40">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Add Registered Customer</h3>
                  <p className="text-[11px] text-slate-500">Save real customer profile into MongoDB Atlas database</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="p-6 space-y-4">
              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Customer Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. customer@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Phone Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. +91 98401 23456"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Initial Digital Wallet (₹)</label>
                <input
                  type="number"
                  value={formData.walletBalance}
                  onChange={(e) => setFormData({ ...formData, walletBalance: e.target.value })}
                  placeholder="1000"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {loading ? 'Saving...' : 'Save to MongoDB'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
