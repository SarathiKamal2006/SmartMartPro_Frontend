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
  FileText,
  CheckCircle2,
  PackageCheck,
  Clock
} from 'lucide-react';

export default function SuppliersView() {
  const { suppliers, user, purchaseRequests, approvePurchaseRequest, purchaseOrders, updatePOStatus, receiveWarehouseGoods, showToast } = useApp();
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
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Supplier Procurement & Stock Reorders</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track incoming stock reorders, approve purchase requests (PRs), and manage vendor accounts.</p>
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
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Pending Reorders (PR)</span>
            <h3 className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">{(purchaseRequests || []).length} Requests</h3>
            <span className="text-[10px] text-amber-600 font-bold mt-1 block">Awaiting PR Approval</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Issued Orders (PO)</span>
            <h3 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{(purchaseOrders || []).length} Active POs</h3>
            <span className="text-[10px] text-indigo-600 font-bold mt-1 block">In Pipeline & Fulfillment</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Active Partners</span>
            <h3 className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-1">42 Active</h3>
            <span className="text-[10px] text-teal-600 font-bold mt-1 block">Verified B2B Suppliers</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── SECTION 1: Stock Reorder Requests (PR) & Issued POs ── */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <span>Admin Stock Reorders & Purchase Requests (PR)</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            When an Admin clicks <strong>REORDER PR</strong> on any item in Inventory, the stock request arrives here for approval.
          </p>
        </div>

        {/* Purchase Requests List */}
        <div>
          <h4 className="text-xs font-black text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            <span>Pending Purchase Requests ({(purchaseRequests || []).length})</span>
          </h4>

          {(!purchaseRequests || purchaseRequests.length === 0) ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center text-xs text-slate-400">
              No pending reorder requests. Reorder items from <strong>Inventory & Stock Control</strong> to create new requests.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-amber-500/10 text-amber-700 dark:text-amber-400 font-black uppercase text-[10px] border-b border-amber-500/20">
                    <th className="p-3">REQ ID</th>
                    <th className="p-3">REORDER PRODUCT</th>
                    <th className="p-3">REORDER QTY</th>
                    <th className="p-3">ESTIMATED TOTAL</th>
                    <th className="p-3">PURCHASE SOURCE</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {purchaseRequests.map(req => (
                    <tr key={req.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-bold font-mono text-amber-600">{req.id}</td>
                      <td className="p-3 font-extrabold text-slate-900 dark:text-white">{req.productName}</td>
                      <td className="p-3 font-bold">{req.quantity} units</td>
                      <td className="p-3 font-black text-emerald-600">₹{(req.totalAmount || 0).toFixed(2)}</td>
                      <td className="p-3 font-semibold text-slate-500">{req.purchaseSource || req.supplierName}</td>
                      <td className="p-3">
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 border border-amber-500/20">
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => {
                            playSuccess();
                            approvePurchaseRequest(req.id);
                            if (showToast) {
                              showToast({
                                title: 'PO Issued! 📄',
                                message: `Purchase Order for ${req.quantity} units of ${req.productName} issued to ${req.supplierName}.`,
                                type: 'success',
                                category: 'inventory'
                              });
                            }
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[10px] rounded-xl transition-transform active:scale-95 shadow-sm"
                        >
                          APPROVE PR & ISSUE PO
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Issued Purchase Orders List */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-black text-indigo-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <ShoppingBag className="w-4 h-4" />
            <span>Active Purchase Orders ({(purchaseOrders || []).length})</span>
          </h4>

          {(!purchaseOrders || purchaseOrders.length === 0) ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center text-xs text-slate-400">
              No active purchase orders in pipeline.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 font-black uppercase text-[10px] border-b border-indigo-500/20">
                    <th className="p-3">PO ID</th>
                    <th className="p-3">PRODUCT</th>
                    <th className="p-3">QTY</th>
                    <th className="p-3">SUPPLIER</th>
                    <th className="p-3">STATUS</th>
                    <th className="p-3 text-right">INVENTORY INTAKE ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {purchaseOrders.map(po => (
                    <tr key={po.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 font-bold font-mono text-indigo-600">{po.id}</td>
                      <td className="p-3 font-extrabold text-slate-900 dark:text-white">{po.productName}</td>
                      <td className="p-3 font-bold">{po.quantity} units</td>
                      <td className="p-3 font-semibold text-slate-500">{po.supplierName}</td>
                      <td className="p-3">
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                          po.status === 'Pending Acceptance' ? 'bg-amber-500/10 text-amber-600' :
                          po.status === 'Accepted' ? 'bg-blue-500/10 text-blue-600' :
                          po.status === 'Shipped' ? 'bg-indigo-500/10 text-indigo-600' :
                          'bg-emerald-500/10 text-emerald-600'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="p-3 text-right flex items-center justify-end gap-2">
                        {po.status !== 'Delivered' && (
                          <button
                            onClick={() => {
                              playSuccess();
                              updatePOStatus(po.id, 'Delivered');
                            }}
                            className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[10px] rounded-lg transition-transform active:scale-95 shadow-sm"
                          >
                            MARK DELIVERED
                          </button>
                        )}
                        <button
                          onClick={() => {
                            playSuccess();
                            receiveWarehouseGoods(po.id, po.quantity, 0);
                            if (showToast) {
                              showToast({
                                title: 'Stock Intake Complete! 🎉',
                                message: `Added ${po.quantity} units of ${po.productName} into live store inventory!`,
                                type: 'success',
                                category: 'inventory'
                              });
                            }
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[10px] rounded-lg transition-transform active:scale-95 shadow-sm flex items-center gap-1"
                        >
                          <PackageCheck className="w-3 h-3" />
                          <span>RECEIVE INTO INVENTORY</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Main Suppliers Table Panel */}
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

