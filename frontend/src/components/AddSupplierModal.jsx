import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { 
  Building2, 
  UserCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Tag, 
  CreditCard, 
  Check, 
  X, 
  Star,
  ShieldCheck,
  Truck
} from 'lucide-react';

const CATEGORY_OPTIONS = [
  'General Groceries & Staples',
  'Fresh Produce & Vegetables',
  'Dairy & Chilled Foods',
  'Bakery & Confectionery',
  'Cookies & Biscuits',
  'Rice & Grains',
  'Masala & Spices',
  'Beverages & Soft Drinks',
  'Frozen Foods & Ready To Eat',
  'Baby Care & Nutrition',
  'Personal Care & Hygiene',
  'Household & Cleaning Needs'
];

const PAYMENT_TERMS_OPTIONS = [
  'Net 15 Days',
  'Net 30 Days (Standard B2B)',
  'Net 45 Days',
  'Net 60 Days (Extended Credit)',
  'Cash On Delivery (COD)',
  'Immediate / Advance Payment',
  '100% Against Delivery Challan'
];

export default function AddSupplierModal({ isOpen, onClose }) {
  const { addSupplier, showToast } = useApp();
  const { playClick, playSuccess, playBeep } = useSoundEffects();

  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [paymentTerms, setPaymentTerms] = useState(PAYMENT_TERMS_OPTIONS[1]);
  const [rating, setRating] = useState(4.8);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) {
      playBeep();
      showToast({
        title: 'Validation Error ⚠️',
        message: 'Supplier Company Name is required.',
        type: 'warning'
      });
      return;
    }

    setIsSubmitting(true);
    playSuccess();

    try {
      const saved = await addSupplier({
        name: companyName.trim(),
        companyName: companyName.trim(),
        contactPerson: contactPerson.trim() || 'Sales Representative',
        contact: contactPerson.trim() || 'Sales Representative',
        email: email.trim() || 'contact@supplier.in',
        phone: phone.trim() || '+91 98401 00000',
        address: address.trim() || 'Chennai Wholesale Commercial Complex, Tamil Nadu',
        category: category,
        paymentTerms: paymentTerms,
        rating: Number(rating) || 4.8
      });

      showToast({
        title: 'Supplier Added Successfully! 🏢',
        message: `${saved.name} (${paymentTerms}) is now active and immediately available for Purchase Orders.`,
        type: 'success',
        duration: 4500
      });

      // Reset form
      setCompanyName('');
      setContactPerson('');
      setEmail('');
      setPhone('');
      setAddress('');
      setCategory(CATEGORY_OPTIONS[0]);
      setPaymentTerms(PAYMENT_TERMS_OPTIONS[1]);

      onClose();
    } catch (err) {
      showToast({
        title: 'Error Saving Supplier ❌',
        message: err.message || 'Failed to register supplier.',
        type: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] my-auto animate-scale-up text-xs">
        
        {/* Header */}
        <div className="px-4 py-3 bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 text-white flex items-center justify-between shrink-0 border-b border-emerald-500/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300 shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="bg-emerald-400/20 text-emerald-300 text-[9px] font-mono font-black uppercase px-1.5 py-0.2 rounded border border-emerald-400/30">
                  FIG 8.7.5 SPECIFICATION
                </span>
                <h3 className="text-sm font-black tracking-tight text-white">
                  Add Supplier Form
                </h3>
              </div>
              <p className="text-[10px] text-emerald-100 font-medium">
                Register company profile, contact details, product category & payment credit terms.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => { playClick(); onClose(); }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
          
          {/* 1. Company Name & Contact Person */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3 h-3 text-emerald-500" />
                Company / Supplier Name *
              </label>
              <input
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Britannia Industries Ltd"
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-emerald-500" />
                Contact Person *
              </label>
              <input
                type="text"
                required
                value={contactPerson}
                onChange={(e) => setContactPerson(e.target.value)}
                placeholder="e.g. Ramesh V (Key Account Manager)"
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 2. E-mail & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider flex items-center gap-1">
                <Mail className="w-3 h-3 text-emerald-500" />
                E-Mail Address *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. orders@britannia.co.in"
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-500" />
                Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98401 23456"
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* 3. Address */}
          <div>
            <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3 text-emerald-500" />
              Office & Warehouse Address *
            </label>
            <textarea
              rows={2}
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Plot 42, SIDCO Industrial Estate, Guindy, Chennai - 600032, Tamil Nadu"
              className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* 4. Product Category & Payment Terms */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider flex items-center gap-1">
                <Tag className="w-3 h-3 text-emerald-500" />
                Product Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {CATEGORY_OPTIONS.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-700 dark:text-slate-300 mb-1 uppercase tracking-wider flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-emerald-500" />
                Payment Terms *
              </label>
              <select
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                {PAYMENT_TERMS_OPTIONS.map(term => (
                  <option key={term} value={term}>{term}</option>
                ))}
              </select>
            </div>
          </div>

          {/* PO Availability Live Badge */}
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/40 flex items-center justify-between text-[10px] text-emerald-800 dark:text-emerald-300">
            <span className="flex items-center gap-1.5 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Immediate PO Availability Enabled</span>
            </span>
            <span className="font-semibold text-slate-500 dark:text-slate-400">
              Auto-linked to Reorders
            </span>
          </div>

          {/* Modal Action Buttons Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => { playClick(); onClose(); }}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:brightness-110 text-white text-xs font-black shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving Supplier...' : 'Save & Make Available for PO'}</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
