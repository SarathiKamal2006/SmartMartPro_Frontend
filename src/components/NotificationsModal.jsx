import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { X, Bell, AlertTriangle, Clock, CheckCircle2, ShoppingBag, Database, Check } from 'lucide-react';

export default function NotificationsModal() {
  const { notifDrawerOpen, setNotifDrawerOpen, notifications, markNotificationRead, markAllNotificationsRead } = useApp();
  const { playClick, playBeep } = useSoundEffects();
  const [activeTab, setActiveTab] = useState('All');

  if (!notifDrawerOpen) return null;

  const tabs = ['All', 'Stock Alerts', 'Orders', 'Expiry', 'System'];

  const filteredNotifs = notifications.filter(n => {
    if (activeTab === 'All') return true;
    return n.type === activeTab;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-950/60 backdrop-blur-xs transition-opacity font-sans">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-left">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">Store Notifications</h3>
              <p className="text-xs text-slate-500">Real-time system alerts & stock events</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { playBeep(); markAllNotificationsRead(); }}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1 hover:underline"
            >
              <Check className="w-3.5 h-3.5" />
              <span>MARK ALL READ</span>
            </button>
            <button
              onClick={() => { playClick(); setNotifDrawerOpen(false); }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 flex items-center gap-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { playClick(); setActiveTab(tab); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3">
          {filteredNotifs.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No notifications found for {activeTab}</p>
            </div>
          ) : (
            filteredNotifs.map((n) => (
              <div
                key={n.id}
                onClick={() => { playClick(); markNotificationRead(n.id); }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                  n.isNew
                    ? 'bg-emerald-50/60 dark:bg-slate-800/80 border-emerald-300 dark:border-emerald-700 shadow-sm'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {n.isNew && (
                  <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-emerald-600 animate-ping"></span>
                )}
                <div className="flex items-start gap-3">
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    n.type === 'Stock Alerts' ? 'bg-amber-500/10 text-amber-600' :
                    n.type === 'Expiry' ? 'bg-rose-500/10 text-rose-600' :
                    n.type === 'Orders' ? 'bg-emerald-500/10 text-emerald-600' :
                    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {n.type === 'Stock Alerts' && <AlertTriangle className="w-4 h-4" />}
                    {n.type === 'Expiry' && <Clock className="w-4 h-4" />}
                    {n.type === 'Orders' && <ShoppingBag className="w-4 h-4" />}
                    {n.type === 'System' && <Database className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{n.title}</h4>
                      {n.isNew && (
                        <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded-full">NEW</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">{n.description}</p>
                    <span className="text-[10px] text-slate-400 block mt-2 font-mono">{n.time}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
