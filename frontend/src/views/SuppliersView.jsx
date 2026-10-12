import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import ReceivePODialog from '../components/ReceivePODialog';
import AddSupplierModal from '../components/AddSupplierModal';
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
  Clock,
  Filter,
  AlertTriangle,
  CreditCard,
  Building2
} from 'lucide-react';

export default function SuppliersView() {
  const { 
    suppliers, 
    user, 
    purchaseRequests, 
    approvePurchaseRequest, 
    purchaseOrders, 
    updatePOStatus, 
    receiveWarehouseGoods, 
    receivePODialogOpen,
    setReceivePODialogOpen,
    activeReceivePO,
    setActiveReceivePO,
    showToast 
  } = useApp();
  const { playClick, playSuccess } = useSoundEffects();
  const { t } = useLanguage();
  const [filterTab, setFilterTab] = useState('All Suppliers');
  const [search, setSearch] = useState('');
  const [addSupplierOpen, setAddSupplierOpen] = useState(false);
  const [poStatusFilter, setPoStatusFilter] = useState('All');

  const filteredSuppliers = (suppliers || []).filter(s => {
    if (filterTab === 'Critical Deliveries') return (s.activePOs || 0) > 3;
    if (filterTab === 'Pending Contract renewal') return s.status === 'Inactive';
    const matchSearch = (s.name && s.name.toLowerCase().includes(search.toLowerCase())) || 
      (s.category && s.category.toLowerCase().includes(search.toLowerCase())) ||
      (s.paymentTerms && s.paymentTerms.toLowerCase().includes(search.toLowerCase()));
    return matchSearch;
  });

  // Filter Purchase Orders for Fig 8.7.4 Purchase Order Register
  const filteredPOs = (purchaseOrders || []).filter(po => {
    if (poStatusFilter === 'All') return true;
    if (poStatusFilter === 'Draft') return po.status === 'Draft' || po.status === 'Pending Acceptance';
    if (poStatusFilter === 'Sent') return po.status === 'Sent' || po.status === 'Accepted' || po.status === 'Shipped';
    if (poStatusFilter === 'Received') return po.status === 'Received' || po.status === 'Delivered';
    if (poStatusFilter === 'Cancelled') return po.status === 'Cancelled';
    return po.status === poStatusFilter;
  });

  // Count late orders for manager follow-up
  const lateOrdersCount = (purchaseOrders || []).filter(po => 
    po.isLate || (po.status !== 'Received' && po.status !== 'Delivered' && po.status !== 'Cancelled' && new Date(po.expectedDelivery) < new Date())
  ).length;

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
      {/* Top Header with Fig 8.7.5 Add Supplier Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Supplier Management & Purchase Order Register
            </h2>
            <span className="hidden sm:inline-block bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase">
              Fig 8.7.4 & 8.7.5
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Register suppliers with credit terms, issue purchase orders, track late shipments, and execute warehouse GRN intake.
          </p>
        </div>

        {/* Fig 8.7.5 Add Supplier CTA Button */}
        <button 
          onClick={() => {
            playClick();
            setAddSupplierOpen(true);
          }}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-110 text-white font-black px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/25 transition-transform active:scale-95 cursor-pointer shrink-0"
          id="add-supplier-btn"
        >
          <Plus className="w-4 h-4" />
          <span>➕ ADD SUPPLIER (Fig 8.7.5)</span>
        </button>
      </div>

      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Vendors</span>
            <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{suppliers.length} Companies</h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold mt-1 block">Active Directory</span>
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
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Purchase Orders (PO)</span>
            <h3 className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">{(purchaseOrders || []).length} Orders</h3>
            <span className="text-[10px] text-indigo-600 font-bold mt-1 block">In Register Pipeline</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Late / Overdue Orders</span>
            <h3 className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">{lateOrdersCount} Late</h3>
            <span className="text-[10px] text-rose-600 font-bold mt-1 block">Requires Follow-up</span>
          </div>
          <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ── SECTION 1: Fig 8.7.4 Purchase Order Register with Status Filter ── */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black px-2 py-0.5 rounded border border-indigo-500/20 uppercase font-mono">
                Fig 8.7.4
              </span>
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>Purchase Order Register with Status Filter</span>
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Lists purchase orders with supplier, items, amount, status and date. Filter by <strong>Draft</strong>, <strong>Sent</strong>, <strong>Received</strong> or <strong>Cancelled</strong> to follow up on late orders.
            </p>
          </div>

          {/* Fig 8.7.4 Status Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
            {['All', 'Draft', 'Sent', 'Received', 'Cancelled'].map((status) => {
              const count = status === 'All' 
                ? (purchaseOrders || []).length 
                : (purchaseOrders || []).filter(po => {
                    if (status === 'Draft') return po.status === 'Draft' || po.status === 'Pending Acceptance';
                    if (status === 'Sent') return po.status === 'Sent' || po.status === 'Accepted' || po.status === 'Shipped';
                    if (status === 'Received') return po.status === 'Received' || po.status === 'Delivered';
                    if (status === 'Cancelled') return po.status === 'Cancelled';
                    return po.status === status;
                  }).length;

              const active = poStatusFilter === status;
              return (
                <button
                  key={status}
                  onClick={() => {
                    playClick();
                    setPoStatusFilter(status);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                    active
                      ? status === 'Draft' ? 'bg-amber-600 text-white shadow-sm' :
                        status === 'Sent' ? 'bg-blue-600 text-white shadow-sm' :
                        status === 'Received' ? 'bg-emerald-600 text-white shadow-sm' :
                        status === 'Cancelled' ? 'bg-rose-600 text-white shadow-sm' :
                        'bg-slate-900 dark:bg-slate-700 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span>{status}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    active ? 'bg-white/25 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* PO Table */}
        {(!filteredPOs || filteredPOs.length === 0) ? (
          <div className="p-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl text-center text-xs text-slate-400">
            No purchase orders matching status filter "<strong>{poStatusFilter}</strong>".
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-black uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                  <th className="p-3">PO NUMBER</th>
                  <th className="p-3">SUPPLIER</th>
                  <th className="p-3">ITEMS / PRODUCTS</th>
                  <th className="p-3">ORDER DATE</th>
                  <th className="p-3">EXP. DELIVERY</th>
                  <th className="p-3">TOTAL AMOUNT</th>
                  <th className="p-3">STATUS</th>
                  <th className="p-3 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                {filteredPOs.map(po => {
                  const isLate = po.isLate || (
                    po.status !== 'Received' && 
                    po.status !== 'Delivered' && 
                    po.status !== 'Cancelled' && 
                    po.expectedDelivery && 
                    new Date(po.expectedDelivery) < new Date()
                  );

                  return (
                    <tr key={po.id} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors ${isLate ? 'bg-rose-500/5' : ''}`}>
                      <td className="p-3">
                        <div className="font-mono font-bold text-indigo-600 dark:text-indigo-400">{po.id}</div>
                        {isLate && (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black text-rose-600 bg-rose-500/10 px-1.5 py-0.2 rounded border border-rose-500/20 mt-0.5">
                            <AlertTriangle className="w-2.5 h-2.5" /> LATE / OVERDUE
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <div className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{po.supplierName || 'Wholesale Supplier'}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-bold text-slate-800 dark:text-slate-200">{po.productName}</div>
                        <div className="text-[10px] text-slate-400 font-semibold">{po.quantity} units {po.itemsCount ? `(${po.itemsCount} line items)` : ''}</div>
                      </td>
                      <td className="p-3 font-mono text-slate-500">
                        {po.orderDate || '2026-10-01'}
                      </td>
                      <td className="p-3 font-mono">
                        <span className={isLate ? 'text-rose-600 font-bold' : 'text-slate-500'}>
                          {po.expectedDelivery || '2026-10-06'}
                        </span>
                      </td>
                      <td className="p-3 font-black text-emerald-600 dark:text-emerald-400">
                        ₹{(po.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3">
                        <span className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase border ${
                          po.status === 'Draft' || po.status === 'Pending Acceptance' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                          po.status === 'Sent' || po.status === 'Accepted' || po.status === 'Shipped' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                          po.status === 'Received' || po.status === 'Delivered' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                          'bg-rose-500/10 text-rose-600 border-rose-500/20'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isLate && (
                            <button
                              type="button"
                              onClick={() => {
                                playSuccess();
                                showToast({
                                  title: 'Follow-up Email Sent 📧',
                                  message: `Urgent delivery follow-up sent to ${po.supplierName} for PO ${po.id}.`,
                                  type: 'info'
                                });
                              }}
                              className="px-2 py-1 bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-[10px] rounded-lg transition-transform active:scale-95 shadow-sm"
                            >
                              FOLLOW UP
                            </button>
                          )}
                          {po.status !== 'Received' && po.status !== 'Delivered' && po.status !== 'Cancelled' && (
                            <button
                              type="button"
                              onClick={() => {
                                playClick();
                                setActiveReceivePO(po);
                                setReceivePODialogOpen(true);
                              }}
                              className="px-2.5 py-1 bg-gradient-to-r from-teal-600 to-emerald-600 hover:brightness-110 text-white font-black text-[10px] rounded-lg transition-transform active:scale-95 shadow-sm flex items-center gap-1 cursor-pointer"
                            >
                              <PackageCheck className="w-3 h-3" />
                              <span>RECEIVE PO</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pending Reorder Requests subsection */}
        {(purchaseRequests && purchaseRequests.length > 0) && (
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-black text-amber-600 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              <span>Pending Purchase Requests (PR) Awaiting Issue ({(purchaseRequests || []).length})</span>
            </h4>
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
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-[10px] rounded-xl transition-transform active:scale-95 shadow-sm cursor-pointer"
                        >
                          APPROVE PR & ISSUE PO
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION 2: Verified Supplier Directory & Payment Terms ── */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <span>Registered Suppliers Directory & Payment Terms</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Profiles with registered payment credit terms, contact details, and category specialties.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['All Suppliers', 'Critical Deliveries', 'Pending Contract renewal'].map((tab) => (
              <button
                key={tab}
                onClick={() => { playClick(); setFilterTab(tab); }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
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

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suppliers by name, category, or payment term..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <th className="p-3.5">COMPANY NAME</th>
                <th className="p-3.5">CONTACT PERSON</th>
                <th className="p-3.5">PHONE & EMAIL</th>
                <th className="p-3.5">CATEGORY</th>
                <th className="p-3.5">PAYMENT TERMS</th>
                <th className="p-3.5">STATUS</th>
                <th className="p-3.5 text-right">RATING</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
              {filteredSuppliers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-3.5">
                    <div className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-emerald-600" />
                      <span>{s.name}</span>
                    </div>
                    {s.address && (
                      <div className="text-[10px] text-slate-400 font-medium truncate max-w-xs">{s.address}</div>
                    )}
                  </td>
                  <td className="p-3.5 font-bold text-slate-700 dark:text-slate-300">{s.contact}</td>
                  <td className="p-3.5">
                    <div className="font-mono text-slate-600 dark:text-slate-400 font-semibold">{s.phone}</div>
                    <div className="text-[10px] text-slate-400">{s.email}</div>
                  </td>
                  <td className="p-3.5">
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-[11px] font-bold">
                      {s.category}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 font-extrabold text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                      <CreditCard className="w-3 h-3" />
                      {s.paymentTerms || 'Net 30 Days'}
                    </span>
                  </td>
                  <td className="p-3.5">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      s.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-extrabold text-amber-500 flex items-center justify-end gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{s.rating || 4.8}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fig 8.7.5 Add Supplier Modal */}
      <AddSupplierModal
        isOpen={addSupplierOpen}
        onClose={() => setAddSupplierOpen(false)}
      />

      {/* Fig 8.7.3 Receive Purchase Order Dialog */}
      <ReceivePODialog
        isOpen={receivePODialogOpen}
        onClose={() => {
          setReceivePODialogOpen(false);
          setActiveReceivePO(null);
        }}
        purchaseOrder={activeReceivePO}
      />
    </div>
  );
}
