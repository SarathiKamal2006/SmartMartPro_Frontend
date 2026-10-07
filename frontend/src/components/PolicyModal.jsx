import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  FileText, 
  Truck, 
  RotateCcw, 
  Scale, 
  Printer, 
  CheckCircle2, 
  ExternalLink,
  Lock,
  Mail,
  Phone
} from 'lucide-react';
import { useSoundEffects } from '../hooks/useCustomHooks';

export default function PolicyModal({ isOpen, onClose, initialTab = 'privacy' }) {
  const { playClick, playBeep } = useSoundEffects();
  const [activeTab, setActiveTab] = useState(initialTab);

  if (!isOpen) return null;

  const tabs = [
    { id: 'privacy', label: 'Privacy Policy', icon: ShieldCheck },
    { id: 'refund', label: 'Refund Policy', icon: RotateCcw },
    { id: 'shipping', label: 'Shipping Policy', icon: Truck },
    { id: 'terms', label: 'Terms and Condition', icon: Scale },
  ];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center font-black">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-600 text-white">
                  POTHYS MART • LEGAL
                </span>
                <span className="text-[10px] text-slate-400 font-bold">Updated: Jan 2026</span>
              </div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Policies, Compliance & Legal Terms
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2.5 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
              title="Print Document"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={() => { playClick(); onClose(); }}
              className="p-2.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800 hover:bg-red-500 hover:text-white text-slate-700 dark:text-slate-300 transition-colors"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none bg-white dark:bg-slate-900">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { playClick(); setActiveTab(tab.id); }}
                className={`flex items-center gap-2 pb-3 px-3.5 text-xs font-black transition-all border-b-2 whitespace-nowrap ${
                  isActive
                    ? 'border-red-600 text-red-600 dark:text-red-400'
                    : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed flex-1">
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3">
                <Lock className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white">Customer Data Protection Commitment</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Pothys Mart & SmartMart Pro are fully compliant with the Digital Personal Data Protection Act (DPDP), ISO 27001, and 256-bit TLS encrypted transaction standards.
                  </p>
                </div>
              </div>

              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">1. Information We Collect</h4>
              <p>
                We collect personal information you provide when registering, placing online supermarket orders, or visiting our physical branch superstores. This includes your name, delivery address, phone number, email address, payment details, and geolocation for live delivery order routing.
              </p>

              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">2. How We Use Your Data</h4>
              <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                <li>Processing supermarket express orders, point-of-sale billing, and home grocery deliveries.</li>
                <li>Sending transactional updates, OTP verification codes, and real-time delivery GPS pings.</li>
                <li>Improving catalog recommendations, inventory forecasting, and personalised discount promotions.</li>
                <li>Preventing unauthorized transactions, fraudulent chargebacks, and securing payment gateway sessions.</li>
              </ul>

              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">3. Information Sharing & Third Parties</h4>
              <p>
                We never sell or rent your personal information to third-party marketing firms. Information is shared strictly with verified delivery partners, payment gateway providers (Razorpay, Stripe, UPI), and statutory authorities when mandated under Indian law.
              </p>

              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">4. Grievance Redressal Officer</h4>
              <div className="bg-slate-100 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs">
                <p className="font-bold text-slate-900 dark:text-white">Pothys Mart Grievance Redressal Desk:</p>
                <p className="mt-1 text-slate-600 dark:text-slate-300">Sarathi Kamal N — Chief Information Security Officer</p>
                <p className="text-slate-600 dark:text-slate-300">Address: 407/7, G.S.T Road, Zamin Pallavaram, Chromepet, Chengalpattu, Tamil Nadu - 600044</p>
                <p className="text-slate-600 dark:text-slate-300">Email: supermarket.chr@pothys.com | Phone: 7305393222 / 04443666333</p>
              </div>
            </div>
          )}

          {activeTab === 'refund' && (
            <div className="space-y-4">
              <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 flex items-start gap-3">
                <RotateCcw className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white">Hassle-Free Return & Instant Refund Guarantee</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    We ensure complete customer satisfaction. If you are not 100% satisfied with freshness, quality, or packaging, we offer no-questions-asked refunds.
                  </p>
                </div>
              </div>

              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">1. Return Eligibility by Category</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-black text-emerald-600 block">🍎 Fresh Produce & Dairy</span>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Returnable within <strong>24 hours</strong> of delivery if quality/freshness issues occur.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-black text-blue-600 block">📦 Packaged Foods & Staples</span>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Returnable within <strong>3 days</strong> if seal is broken, damaged, or expired.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-black text-purple-600 block">🧴 Personal Care & Cleaning</span>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Returnable within <strong>5 days</strong> if unused, sealed, and in original packaging.
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <span className="font-black text-rose-600 block">⚡ Instant Refund TAT</span>
                  <p className="mt-1 text-slate-600 dark:text-slate-300">
                    Wallet refunds credited <strong>instantly</strong>; Bank/UPI refunds processed in 2-4 business days.
                  </p>
                </div>
              </div>

              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">2. Refund Methods</h4>
              <p>
                Refunds are credited directly to your <strong>SmartMart Pro Digital Wallet</strong> (immediate credit for future orders) or reversed to original payment method (Credit/Debit Card, UPI, Net Banking) according to RBI payment settlement guidelines.
              </p>
            </div>
          )}

          {activeTab === 'shipping' && (
            <div className="space-y-4">
              <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex items-start gap-3">
                <Truck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white">Express 10-Minute & Same-Day Supermarket Delivery</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Multi-branch fulfillment ensures fastest delivery across Chennai, Bengaluru, Mumbai, and Hyderabad regions.
                  </p>
                </div>
              </div>

              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">1. Delivery Slots & Timings</h4>
              <div className="space-y-2 text-xs sm:text-sm">
                <p>• <strong>⚡ 10-20 Minute Express Delivery:</strong> Available within 5 km of any Pothys Mart branch superstore (7:00 AM – 11:00 PM).</p>
                <p>• <strong>🚚 Scheduled Slot Delivery:</strong> Choose convenient 2-hour morning or evening slots for bulk grocery orders.</p>
                <p>• <strong>❄️ Cold Chain Integrity:</strong> Chilled dairy, frozen foods, ice creams, and chocolates are transported in temperature-controlled insulated totes.</p>
              </div>

              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">2. Shipping Charges</h4>
              <p>
                Free delivery on all grocery orders above <strong>₹499.00</strong>. For orders below ₹499.00, a nominal delivery fee of ₹29.00 applies to cover logistics and rider safety gear.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="bg-slate-500/5 border border-slate-500/20 rounded-2xl p-4 flex items-start gap-3">
                <Scale className="w-5 h-5 text-slate-600 dark:text-slate-300 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white">Terms of Service & E-Commerce Conditions</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    By browsing Pothys Mart or placing an order through SmartMart Pro, you accept and agree to be bound by these legal terms.
                  </p>
                </div>
              </div>

              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">1. Pricing & Stock Availability</h4>
              <p>
                All prices listed on the storefront are inclusive of applicable 5%, 12%, and 18% Goods and Services Tax (GST). Prices for fresh produce and perishables may adjust dynamically based on daily agricultural market rates.
              </p>

              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">2. User Accounts & Security</h4>
              <p>
                Users are responsible for maintaining confidentiality of account login credentials and OTP codes. Pothys Mart staff will never ask for your password or OTP over the phone.
              </p>

              <h4 className="font-extrabold text-base text-slate-900 dark:text-white">3. Governing Law & Jurisdiction</h4>
              <p>
                These terms are governed by the laws of India. Any disputes arising in connection with orders or services shall be subject to the exclusive jurisdiction of the courts in Chennai, Tamil Nadu.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-bold">
            © 2026 Pothys Mart & SmartMart Pro. All Rights Reserved.
          </span>
          <button
            onClick={() => { playClick(); onClose(); }}
            className="px-5 py-2 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs shadow-md transition-all active:scale-95"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
}
