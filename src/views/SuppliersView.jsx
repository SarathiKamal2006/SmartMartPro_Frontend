import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { 
  Truck, 
  UserCheck, 
  ShoppingBag, 
  AlertCircle, 
  Plus, 
  Search, 
  Star,
  FileText
} from 'lucide-react';

export default function SuppliersView() {
  const { suppliers, user, purchaseOrders, updatePOStatus } = useApp();
  const { playClick, playSuccess } = useSoundEffects();
  const { t } = useLanguage();
  const [filterTab, setFilterTab] = useState('All Suppliers');
  const [search, setSearch] = useState('');

  const filtered = suppliers.filter(s => {
    if (filterTab === 'Critical Deliveries') return s.activePOs > 3;
    if (filterTab === 'Pending Contract renewal') return s.status === 'Inactive';
    return s.name.toLowerCase().includes(search.toLowerCase()) || s.category.toLowerCase().includes(search.toLowerCase());
  });

  // Render Supplier partner portal if logged in as a Supplier
  if (user?.role === 'Supplier') {
    return (
      <div className="space-y-6 font-sans">
        {/* Supplier Header */}
        <div className="bg-gradient-to-r from-teal-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden border border-teal-500/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="space-y-2 relative z-10">
            <span className="bg-teal-400/20 text-teal-300 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider border border-teal-400/30">
              {t("SUPPLIER PARTNER PANEL") || "SUPPLIER PARTNER PANEL"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {t("Welcome, Supplier Partner")} {user.name}
            </h2>
            <p className="text-teal-100 text-xs sm:text-sm font-medium">
              Fulfill incoming supermarket purchase orders, upload digital invoices, and update delivery fleet statuses.
            </p>
          </div>
        </div>

        {/* POs list */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              <span>{t("Issued Purchase Orders (POs)")}</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t("POs sent from SmartMart Pro procurement manager.")}</p>
          </div>

          {(!purchaseOrders || purchaseOrders.length === 0) ? (
            <p className="text-xs text-slate-400 py-10 text-center">{t("No active purchase orders found.")}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                    <th className="p-3.5">PO ID</th>
                    <th className="p-3.5">PRODUCT NAME</th>
                    <th className="p-3.5">QUANTITY</th>
                    <th className="p-3.5">TOTAL COST</th>
                    <th className="p-3.5">STATUS</th>
                    <th className="p-3.5 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {purchaseOrders.map(po => (
                    <tr key={po.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3.5 font-bold font-mono text-emerald-600">{po.id}</td>
                      <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">{po.productName}</td>
                      <td className="p-3.5 font-bold">{po.quantity} units</td>
                      <td className="p-3.5 font-black text-emerald-600">₹{po.amount?.toFixed(2) || '2,400.00'}</td>
                      <td className="p-3.5">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          po.status === 'Pending Acceptance' ? 'bg-amber-500/10 text-amber-600' :
                          po.status === 'Accepted' ? 'bg-blue-500/10 text-blue-600' :
                          po.status === 'Shipped' ? 'bg-indigo-500/10 text-indigo-600' :
                          'bg-emerald-500/10 text-emerald-600'
                        }`}>
                          {t(po.status)}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        {po.status === 'Pending Acceptance' ? (
                          <button
                            onClick={() => { playSuccess(); updatePOStatus(po.id, 'Accepted'); }}
                            className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-[10px] rounded-lg transition-transform active:scale-95 shadow-sm"
                          >
                            {t("ACCEPT PO")}
                          </button>
                        ) : po.status === 'Accepted' ? (
                          <button
                            onClick={() => { playSuccess(); updatePOStatus(po.id, 'Shipped'); }}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] rounded-lg transition-transform active:scale-95 shadow-sm"
                          >
                            {t("MARK SHIPPED")}
                          </button>
                        ) : po.status === 'Shipped' ? (
                          <button
                            onClick={() => { playSuccess(); updatePOStatus(po.id, 'Delivered'); }}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[10px] rounded-lg transition-transform active:scale-95 shadow-sm"
                          >
                            {t("MARK DELIVERED")}
                          </button>
                        ) : (
                          <span className="text-slate-400 font-extrabold text-[10px]">{t("AWAITING WAREHOUSE VERIFICATION")}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Supplier Procurement & PO Delivery</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Monitor procurement sources, delivery health, purchase orders, and vendor ratings.</p>
        </div>
        <button 
          onClick={playClick}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>ADD SUPPLIER</span>
        </button>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Vendors</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">48 Companies</h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">Active Procurement</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Partners</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">42 Active</h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">Healthy Delivery</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Orders</span>
            <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">14 POs</h3>
            <span className="text-[10px] text-amber-600 font-bold mt-1 block">Awaiting Delivery</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Overdue Payments</span>
            <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">$8,250.00</h3>
            <span className="text-[10px] text-rose-600 font-bold mt-1 block">Due in 7 days</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search suppliers..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['All Suppliers', 'Critical Deliveries', 'Pending Contract renewal'].map((tab) => (
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
                <th className="p-3.5">SUPPLIER NAME</th>
                <th className="p-3.5">CONTACT PERSON</th>
                <th className="p-3.5">PHONE</th>
                <th className="p-3.5">EMAIL</th>
                <th className="p-3.5">PRODUCTS SUPPLIED</th>
                <th className="p-3.5">STATUS</th>
                <th className="p-3.5 text-right">RATING</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">{s.name}</td>
                  <td className="p-3.5 font-semibold">{s.contact}</td>
                  <td className="p-3.5 font-mono text-slate-500">{s.phone}</td>
                  <td className="p-3.5 text-slate-500">{s.email}</td>
                  <td className="p-3.5 font-semibold text-slate-700 dark:text-slate-300">{s.category}</td>
                  <td className="p-3.5">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      s.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-extrabold text-amber-500 flex items-center justify-end gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{s.rating}</span>
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
