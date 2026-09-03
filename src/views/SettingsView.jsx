import React, { useState, useId } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { 
  Store, 
  Percent, 
  CreditCard, 
  Bell, 
  Users, 
  Building2, 
  Globe, 
  CheckCircle2,
  Palette,
  Sun,
  Moon
} from 'lucide-react';

export default function SettingsView() {
  const { user } = useApp();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { playSuccess, playClick } = useSoundEffects();

  const storeNameId = useId();
  const currencyId = useId();

  const [activeTab, setActiveTab] = useState('General Settings');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [storeName, setStoreName] = useState('SmartMart Pro Superstore');
  const [currency, setCurrency] = useState('USD ($)');

  const handleSave = () => {
    playSuccess();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">{t('settings')}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Configure store metadata, multi-language preferences, theme modes, tax rules, and manager profile.</p>
      </div>

      {/* Grid: Left Menu + Right Form */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left Side Menu */}
        <div className="bg-white dark:bg-slate-900 p-3 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-1">
          {[
            { name: 'General Settings', icon: Store },
            { name: 'Appearance & Theme', icon: Palette },
            { name: 'Tax Configuration', icon: Percent },
            { name: 'Payment Methods', icon: CreditCard },
            { name: 'Notifications Control', icon: Bell },
            { name: 'Users & Roles', icon: Users },
            { name: 'Branches Setup', icon: Building2 },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => { playClick(); setActiveTab(item.name); }}
                className={`w-full text-left px-3.5 py-2.5 rounded-2xl text-xs font-semibold flex items-center gap-3 transition-colors ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 text-emerald-500" />
                <span>{item.name}</span>
              </button>
            );
          })}
        </div>

        {/* Right Form Body */}
        <div className="md:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div>
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">{activeTab}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Update store metadata, default currency units, locale configurations, and system themes.</p>
          </div>

          {savedSuccess && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Settings updated successfully!</span>
            </div>
          )}

          {/* Theme Toggle Feature */}
          <div className="p-5 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Theme Mode Selection</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Switch between Light mode and Dark mode interface.</p>
              </div>
              <button
                onClick={() => { playClick(); toggleTheme(); }}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-colors"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                <span>Active: {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
            </div>
          </div>

          {/* Multi-Language Preferences */}
          <div className="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs">
              <Globe className="w-4 h-4" />
              <span>Multi-Language Preferences</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Switch application language across English, Hindi, Malayalam, and Tamil.</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'Hindi (हिंदी)' },
                { code: 'ml', label: 'Malayalam (മലയാളം)' },
                { code: 'ta', label: 'Tamil (தமிழ்)' },
              ].map((l) => (
                <button
                  key={l.code}
                  onClick={() => { playClick(); setLang(l.code); }}
                  className={`p-2.5 rounded-xl text-xs font-bold transition-all border ${
                    lang === l.code
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 text-xs">
            <div>
              <label htmlFor={storeNameId} className="block font-bold text-slate-900 dark:text-white mb-1">STORE NAME</label>
              <input
                id={storeNameId}
                type="text"
                value={storeName}
                onChange={e => setStoreName(e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-900 dark:text-white mb-1">STORE MANAGER PROFILE</label>
              <input
                type="text"
                disabled
                value={`${user.name} (${user.role})`}
                className="w-full p-3 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-500 font-bold"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor={currencyId} className="block font-bold text-slate-900 dark:text-white mb-1">DEFAULT CURRENCY</label>
                <select
                  id={currencyId}
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-200 font-semibold"
                >
                  <option>USD ($) - United States Dollar</option>
                  <option>INR (₹) - Indian Rupee</option>
                  <option>EUR (€) - Euro</option>
                </select>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-transform active:scale-95"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
