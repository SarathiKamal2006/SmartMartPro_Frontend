import React from 'react';
import { 
  X, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  Navigation, 
  ExternalLink,
  Store
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { useToast } from '../context/ToastContext';

export default function BranchDirectoryModal({ isOpen, onClose }) {
  const { branches, selectedBranch, setSelectedBranch } = useApp();
  const { playClick, playSuccess } = useSoundEffects();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSelectBranch = (branch) => {
    playSuccess();
    setSelectedBranch(branch);
    showToast({
      title: 'Branch Switched! 🏬',
      message: `Active branch set to ${branch.name}`,
      type: 'success'
    });
    onClose();
  };

  const copyContact = (text, label) => {
    navigator.clipboard.writeText(text);
    playClick();
    showToast({
      title: `${label} Copied! 📋`,
      message: text,
      type: 'info'
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-600/10 text-red-600 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-red-600 text-white">
                  MULTI-BRANCH DIRECTORY
                </span>
                <span className="text-[10px] text-slate-400 font-bold">4 Active Superstores</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Pothys Mart Regional Branch Network
              </h3>
            </div>
          </div>

          <button
            onClick={() => { playClick(); onClose(); }}
            className="p-2.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800 hover:bg-red-500 hover:text-white text-slate-700 dark:text-slate-300 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Branch List */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {branches.map((b) => {
            const isSelected = selectedBranch?.id === b.id;
            return (
              <div 
                key={b.id}
                className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                  isSelected
                    ? 'border-red-500 bg-red-500/5 dark:bg-red-950/20 shadow-md ring-2 ring-red-500/30'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-red-600/10 text-red-600 dark:text-red-400">
                      {b.id} • {b.city}
                    </span>
                    {isSelected ? (
                      <span className="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Active Branch
                      </span>
                    ) : (
                      <span className="text-[11px] font-semibold text-slate-400">
                        ● Online
                      </span>
                    )}
                  </div>

                  <h4 className="font-extrabold text-base text-slate-900 dark:text-white mt-2">
                    {b.name}
                  </h4>

                  {/* Address */}
                  <div className="flex items-start gap-2 mt-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <span>{b.address || `${b.name}, ${b.city}`}</span>
                  </div>

                  {b.landmark && (
                    <p className="text-[11px] text-slate-400 italic pl-6 mt-0.5">
                      Landmark: {b.landmark}
                    </p>
                  )}

                  {/* Phone & Email */}
                  <div className="mt-3 space-y-1.5 pl-6 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <div 
                      onClick={() => copyContact(b.phone || '7305393222', 'Phone')}
                      className="flex items-center gap-2 cursor-pointer hover:text-red-600 transition-colors"
                      title="Click to copy phone"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{b.phone || '7305393222 / 04443666333'}</span>
                    </div>

                    <div 
                      onClick={() => copyContact(b.email || 'supermarket.chr@pothys.com', 'Email')}
                      className="flex items-center gap-2 cursor-pointer hover:text-red-600 transition-colors"
                      title="Click to copy email"
                    >
                      <Mail className="w-3.5 h-3.5 text-blue-600" />
                      <span>{b.email || 'supermarket.chr@pothys.com'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-amber-500" />
                      <span>{b.timings || '7:00 AM - 11:00 PM (Daily)'}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.address || b.name)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-slate-500 hover:text-red-600 flex items-center gap-1"
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    <span>Get Directions</span>
                  </a>

                  {isSelected ? (
                    <button
                      disabled
                      className="px-4 py-2 rounded-2xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs cursor-default"
                    >
                      Currently Selected
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSelectBranch(b)}
                      className="px-4 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md transition-transform active:scale-95 flex items-center gap-1.5"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Switch to this Branch</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-bold">
            All branches are connected in real-time with synchronized inventory.
          </span>
          <button
            onClick={() => { playClick(); onClose(); }}
            className="px-5 py-2 rounded-2xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-extrabold text-xs transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
