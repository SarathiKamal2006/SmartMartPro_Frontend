import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { 
  Building2, 
  ArrowRightLeft, 
  MapPin, 
  CheckCircle2, 
  Truck
} from 'lucide-react';

export default function WarehouseBranchesView() {
  const { branches, products, purchaseOrders, receiveWarehouseGoods } = useApp();
  const { playSuccess, playBeep } = useSoundEffects();
  const { t } = useLanguage();

  const [sourceBranch, setSourceBranch] = useState(branches[0].id);
  const [destBranch, setDestBranch] = useState(branches[1].id);
  const [selectedProduct, setSelectedProduct] = useState(products[0].id);
  const [transferQty, setTransferQty] = useState(10);
  const [transferSuccess, setTransferSuccess] = useState(false);

  // Verification counts states
  const [receivedQtyMap, setReceivedQtyMap] = useState({});
  const [damagedQtyMap, setDamagedQtyMap] = useState({});

  const handleTransfer = (e) => {
    e.preventDefault();
    if (sourceBranch === destBranch) {
      playBeep();
      alert("Source and Destination branches cannot be the same.");
      return;
    }
    playSuccess();
    setTransferSuccess(true);
    setTimeout(() => setTransferSuccess(false), 4000);
  };

  const handleVerify = (poId, expectedQty) => {
    const received = receivedQtyMap[poId] !== undefined ? receivedQtyMap[poId] : expectedQty;
    const damaged = damagedQtyMap[poId] !== undefined ? damagedQtyMap[poId] : 0;
    
    receiveWarehouseGoods(poId, received, damaged);
    playSuccess();

    // Clear maps for this PO
    const newRecv = { ...receivedQtyMap };
    delete newRecv[poId];
    setReceivedQtyMap(newRecv);

    const newDmg = { ...damagedQtyMap };
    delete newDmg[poId];
    setDamagedQtyMap(newDmg);
  };

  const deliveredPOs = purchaseOrders ? purchaseOrders.filter(po => po.status === 'Delivered') : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Warehouse & Multi-Branch Control</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold">Manage multi-branch allocation, inter-branch stock transfers, and regional warehouse logistics.</p>
      </div>

      {/* Branch Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {branches.map((b) => (
          <div key={b.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {b.id}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {b.city}
                </span>
              </div>
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white mt-2">{b.name}</h3>
              <p className="text-xs text-slate-500 mt-1">Manager: {b.id === 'BR-01' ? 'Sarathi Kamal N' : 'Branch Lead'}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs font-semibold">
              <div>
                <span className="text-[10px] text-slate-400 block">Available Stock</span>
                <span className="text-slate-900 dark:text-white font-extrabold">{b.totalStock.toLocaleString()} items</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Daily Revenue</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{b.revenue}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Inter-branch Transfer Controller */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-bold">
            <ArrowRightLeft className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Inter-Branch Stock Transfer</h3>
            <p className="text-xs text-slate-500">Initiate automated stock reallocation between regional grocery warehouses.</p>
          </div>
        </div>

        {transferSuccess && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Success: Transferred {transferQty} units to target branch warehouse!</span>
          </div>
        )}

        <form onSubmit={handleTransfer} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase text-[10px]">SOURCE BRANCH</label>
            <select
              value={sourceBranch}
              onChange={e => setSourceBranch(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase text-[10px]">DESTINATION BRANCH</label>
            <select
              value={destBranch}
              onChange={e => setDestBranch(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1 uppercase text-[10px]">SELECT ITEM SKU</label>
            <select
              value={selectedProduct}
              onChange={e => setSelectedProduct(e.target.value)}
              className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-800 dark:text-slate-200"
            >
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-transform active:scale-95"
            >
              <Truck className="w-4 h-4 text-white" />
              <span>EXECUTE TRANSFER</span>
            </button>
          </div>
        </form>
      </div>

      {/* Goods Received Verification Panel */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{t("Incoming Shipments Verification")}</h3>
            <p className="text-xs text-slate-500">{t("Count and verify delivered supplier shipments before updating store inventory.")}</p>
          </div>
        </div>

        {deliveredPOs.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">{t("No delivered supplier orders waiting in the warehouse queue.")}</p>
        ) : (
          <div className="space-y-4 text-xs font-semibold">
            {deliveredPOs.map(po => {
              const recv = receivedQtyMap[po.id] !== undefined ? receivedQtyMap[po.id] : po.quantity;
              const dmg = damagedQtyMap[po.id] !== undefined ? damagedQtyMap[po.id] : 0;
              return (
                <div key={po.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase font-mono">{po.id} • DELIVERED</span>
                    <h4 className="font-black text-sm text-slate-900 dark:text-white mt-1">{po.productName}</h4>
                    <p className="text-[11px] text-slate-500">Supplier: {po.supplierName} • Ordered Qty: {po.quantity} units</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="w-24">
                      <label className="block text-[10px] text-slate-400 uppercase font-extrabold mb-1">RECEIVED QTY</label>
                      <input
                        type="number"
                        min={0}
                        value={recv}
                        onChange={(e) => setReceivedQtyMap({ ...receivedQtyMap, [po.id]: parseInt(e.target.value) || 0 })}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white text-xs font-bold"
                      />
                    </div>

                    <div className="w-24">
                      <label className="block text-[10px] text-slate-400 uppercase font-extrabold mb-1">DAMAGED QTY</label>
                      <input
                        type="number"
                        min={0}
                        value={dmg}
                        onChange={(e) => setDamagedQtyMap({ ...damagedQtyMap, [po.id]: parseInt(e.target.value) || 0 })}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white text-xs font-bold"
                      />
                    </div>

                    <button
                      onClick={() => handleVerify(po.id, po.quantity)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-lg shadow-sm transition-transform active:scale-95 mt-4 md:mt-0"
                    >
                      VERIFY & UPDATE INVENTORY
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

