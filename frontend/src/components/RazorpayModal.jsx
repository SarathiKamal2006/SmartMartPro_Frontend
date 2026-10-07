import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { 
  X, 
  ShieldCheck, 
  QrCode, 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet,
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Lock,
  ChevronRight,
  Info,
  HelpCircle,
  RefreshCw
} from 'lucide-react';

// Official Razorpay Blue Bolt Logo
function RazorpayLogo({ className = "h-5" }) {
  return (
    <div className="flex items-center gap-1.5 select-none">
      <svg className={className} viewBox="0 0 120 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14.5 3L4 29H9.5L13.2 19.8H18.2C22.6 19.8 25.5 17.1 25.5 12.8C25.5 7.1 21.3 3 14.5 3ZM15 14.8H11.2L13.7 8.2H15C17.8 8.2 19.6 9.6 19.6 11.5C19.6 13.4 17.8 14.8 15 14.8Z" fill="#0C2340"/>
        <path d="M22.5 13.5L20 29H25L27.5 13.5H22.5Z" fill="#3395FF"/>
        <path d="M29 3L22 29H27L34 3H29Z" fill="#0C2340" opacity="0.3"/>
        {/* Wordmark */}
        <text x="36" y="22" fontFamily="Inter, Outfit, sans-serif" fontWeight="900" fontSize="18" fill="#0C2340" letterSpacing="-0.5px">Razorpay</text>
      </svg>
    </div>
  );
}

// Card Brand Detector
function detectCardBrand(num) {
  const clean = num.replace(/\s+/g, '');
  if (clean.startsWith('4')) return { name: 'Visa', color: 'bg-blue-700 text-white' };
  if (/^5[1-5]/.test(clean)) return { name: 'Mastercard', color: 'bg-orange-600 text-white' };
  if (/^(60|65|81|82|508)/.test(clean)) return { name: 'RuPay', color: 'bg-emerald-700 text-white' };
  if (/^3[47]/.test(clean)) return { name: 'Amex', color: 'bg-sky-600 text-white' };
  return { name: 'Card', color: 'bg-slate-700 text-white' };
}

export default function RazorpayModal({
  isOpen,
  onClose,
  amount,
  customer,
  orderId,
  onSuccess
}) {
  const { t } = useLanguage();
  const { playSuccess, playBeep, playClick } = useSoundEffects();

  // Navigation: 'upi' | 'cards' | 'netbanking' | 'wallet'
  const [selectedNav, setSelectedNav] = useState('upi');
  
  // UPI Tab State: 'apps' | 'qr' | 'vpa'
  const [upiSubTab, setUpiSubTab] = useState('qr');
  const [vpaInput, setVpaInput] = useState(customer?.email ? `${customer.email.split('@')[0]}@okaxis` : 'customer@okhdfcbank');

  // Cards Tab State
  const [cardNum, setCardNum] = useState('4532 8921 7741 9024');
  const [cardExp, setCardExp] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('892');
  const [cardName, setCardName] = useState(customer?.name || 'Sarathi Kamal N');
  const [saveCard, setSaveCard] = useState(true);

  // Net Banking Tab State
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');

  // Processing & 3D Secure State
  const [step, setStep] = useState('checkout'); // 'checkout' | 'otp_screen' | 'success'
  const [otpValue, setOtpValue] = useState('123456');
  const [otpTimer, setOtpTimer] = useState(30);
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrSeconds, setQrSeconds] = useState(300);

  // QR Timer Countdown
  useEffect(() => {
    if (!isOpen) return;
    setStep('checkout');
    setIsProcessing(false);
    setQrSeconds(300);

    const interval = setInterval(() => {
      setQrSeconds((prev) => (prev > 0 ? prev - 1 : 300));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatCardInput = (val) => {
    const v = val.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return val;
    }
  };

  const formatExpiryInput = (val) => {
    const v = val.replace(/[^0-9]/g, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handlePayClick = (methodName) => {
    playClick();
    setIsProcessing(true);

    // If card or netbanking, simulate 3D Secure OTP
    if (selectedNav === 'cards' || selectedNav === 'netbanking') {
      setTimeout(() => {
        setIsProcessing(false);
        setStep('otp_screen');
        setOtpTimer(30);
      }, 900);
    } else {
      // Instant UPI / QR Payment capture
      setTimeout(() => {
        finalizePayment(methodName || 'UPI QR');
      }, 1400);
    }
  };

  const finalizePayment = (methodName) => {
    setIsProcessing(false);
    setStep('success');
    playSuccess();

    setTimeout(() => {
      const paymentDetails = {
        paymentId: `pay_${Date.now().toString(36)}${Math.random().toString(36).substring(2, 7)}`,
        orderId: orderId || `order_${Date.now().toString(36)}`,
        signature: `rzp_sig_${Date.now()}`,
        verified: true,
        method: `Razorpay (${methodName})`,
        amount: amount,
        paidAt: new Date().toISOString()
      };

      if (onSuccess) {
        onSuccess(paymentDetails);
      }
      onClose();
    }, 1500);
  };

  const cardBrand = detectCardBrand(cardNum);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn select-none font-sans">
      
      {/* ── Official Razorpay Standard Modal Container ── */}
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col relative text-slate-800 dark:text-slate-100 animate-scaleUp">
        
        {/* ── Top Razorpay Merchant Header ── */}
        <div className="bg-[#0c2340] text-white px-5 py-4 flex items-center justify-between border-b border-slate-800 shadow-md">
          <div className="flex items-center gap-3">
            {/* Merchant Logo Badge */}
            <div className="w-10 h-10 rounded-xl bg-white text-[#0c2340] flex items-center justify-center font-black text-sm shadow-md ring-2 ring-blue-400/30 shrink-0">
              <span className="text-emerald-700 font-extrabold text-xs">SMART</span>
            </div>

            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5">
                <span>SmartMart Pro Supermarket</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
              </h3>
              <p className="text-[11px] text-slate-300 font-medium">
                {orderId ? `Order #${orderId.slice(-8)}` : 'Instant Supermarket Checkout'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-300 uppercase font-black tracking-wider block">Total Amount</span>
              <span className="text-xl sm:text-2xl font-black text-white font-mono">
                ₹{Number(amount || 0).toFixed(2)}
              </span>
            </div>

            <button
              onClick={() => { playClick(); onClose(); }}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Cancel payment"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── 3D SECURE BANK OTP SIMULATION SCREEN ── */}
        {step === 'otp_screen' ? (
          <div className="p-6 sm:p-8 space-y-6 max-w-md mx-auto text-center animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <span className="font-black text-xs text-[#0c2340] dark:text-blue-400 uppercase tracking-wider">
                {selectedNav === 'cards' ? `${cardBrand.name} 3D Secure Verification` : `${selectedBank} NetBanking Gateway`}
              </span>
              <span className="text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded">
                Verified by Bank
              </span>
            </div>

            <div className="space-y-2">
              <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-inner">
                <Lock className="w-6 h-6" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white">Enter One-Time Password (OTP)</h4>
              <p className="text-xs text-slate-500">
                OTP sent to registered mobile <strong className="text-slate-800 dark:text-slate-200">+91 98**** 23456</strong> for transaction of <strong className="text-emerald-600 font-bold">₹{Number(amount || 0).toFixed(2)}</strong>.
              </p>
            </div>

            <div className="space-y-3">
              <div className="relative max-w-xs mx-auto">
                <input
                  type="text"
                  maxLength={6}
                  value={otpValue}
                  onChange={(e) => setOtpValue(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full text-center text-xl font-mono font-black tracking-[0.4em] py-3 bg-slate-50 dark:bg-slate-800 border-2 border-blue-500 rounded-xl focus:outline-none shadow-sm"
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 max-w-xs mx-auto">
                <span>Auto-filled Test OTP: <strong>123456</strong></span>
                <span className="text-blue-600 font-bold">Resend ({otpTimer}s)</span>
              </div>
            </div>

            <div className="flex gap-2.5 max-w-xs mx-auto">
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => {
                  setIsProcessing(true);
                  setTimeout(() => finalizePayment(selectedNav === 'cards' ? `${cardBrand.name} Card` : selectedBank), 1200);
                }}
                className="flex-2 py-3 rounded-xl bg-[#3395ff] hover:bg-blue-600 text-white font-extrabold text-xs shadow-md shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>SUBMIT & PAY</span>
                )}
              </button>
            </div>
          </div>
        ) : step === 'success' ? (
          /* ── SUCCESS AUTHORIZATION SCREEN ── */
          <div className="p-8 sm:p-12 text-center space-y-4 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-lg animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">Payment Successful!</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Authorized via Razorpay Secure Gateway. Printing official GST tax invoice...
              </p>
              <div className="inline-block mt-3 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                Amount Paid: ₹{Number(amount || 0).toFixed(2)}
              </div>
            </div>
          </div>
        ) : (
          /* ── MAIN RAZORPAY 2-COLUMN CHECKOUT SCREEN ── */
          <div className="flex flex-col md:flex-row min-h-[380px]">
            
            {/* ── Left Sidebar Navigation (Razorpay Standard) ── */}
            <div className="w-full md:w-52 bg-slate-50 dark:bg-slate-950/80 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-2 sm:p-3 flex md:flex-col gap-1 overflow-x-auto">
              {[
                { id: 'upi', label: 'UPI / QR', subtitle: 'Google Pay, PhonePe, QR', icon: QrCode, badge: 'FASTEST' },
                { id: 'cards', label: 'Cards', subtitle: 'Visa, MasterCard, RuPay', icon: CreditCard },
                { id: 'netbanking', label: 'Netbanking', subtitle: 'All Indian Banks', icon: Building2 },
                { id: 'wallet', label: 'Wallets', subtitle: 'Mobikwik, Airtel & More', icon: Wallet },
              ].map((nav) => {
                const Icon = nav.icon;
                const isSelected = selectedNav === nav.id;
                return (
                  <button
                    key={nav.id}
                    onClick={() => { playClick(); setSelectedNav(nav.id); }}
                    className={`w-full p-2.5 rounded-xl text-left transition-all flex items-center justify-between cursor-pointer group ${
                      isSelected
                        ? 'bg-white dark:bg-slate-900 text-[#0c2340] dark:text-blue-400 font-extrabold shadow-sm border border-slate-200 dark:border-slate-800 ring-1 ring-blue-500/20'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-blue-50 dark:bg-slate-800 text-[#3395ff]' : 'text-slate-400'}`}>
                        <Icon className="w-4 h-4 shrink-0" />
                      </div>
                      <div className="min-w-0 hidden md:block">
                        <span className="text-xs block font-bold leading-tight truncate">{nav.label}</span>
                        <span className="text-[10px] text-slate-400 block font-normal truncate">{nav.subtitle}</span>
                      </div>
                      <span className="text-xs md:hidden font-bold">{nav.label}</span>
                    </div>

                    {nav.badge && (
                      <span className="hidden md:inline text-[8px] font-black bg-emerald-500 text-white px-1.5 py-0.2 rounded uppercase">
                        {nav.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* ── Right Content Area ── */}
            <div className="flex-1 p-5 sm:p-6 bg-white dark:bg-slate-900 flex flex-col justify-between">
              
              {/* ── 1. UPI & QR CODE VIEW ── */}
              {selectedNav === 'upi' && (
                <div className="space-y-4 animate-fadeIn">
                  
                  {/* UPI Subtabs: QR Code vs UPI ID */}
                  <div className="flex border-b border-slate-200 dark:border-slate-800 pb-2 gap-4 text-xs font-bold">
                    <button
                      onClick={() => setUpiSubTab('qr')}
                      className={`pb-1 cursor-pointer flex items-center gap-1.5 ${
                        upiSubTab === 'qr' ? 'text-[#3395ff] border-b-2 border-[#3395ff] font-extrabold' : 'text-slate-500'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Instant Dynamic QR</span>
                    </button>

                    <button
                      onClick={() => setUpiSubTab('apps')}
                      className={`pb-1 cursor-pointer flex items-center gap-1.5 ${
                        upiSubTab === 'apps' ? 'text-[#3395ff] border-b-2 border-[#3395ff] font-extrabold' : 'text-slate-500'
                      }`}
                    >
                      <Smartphone className="w-3.5 h-3.5" />
                      <span>UPI Apps (GPay / PhonePe)</span>
                    </button>

                    <button
                      onClick={() => setUpiSubTab('vpa')}
                      className={`pb-1 cursor-pointer ${
                        upiSubTab === 'vpa' ? 'text-[#3395ff] border-b-2 border-[#3395ff] font-extrabold' : 'text-slate-500'
                      }`}
                    >
                      <span>UPI ID / VPA</span>
                    </button>
                  </div>

                  {/* Subtab A: QR Code */}
                  {upiSubTab === 'qr' && (
                    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                      <div className="p-3 bg-white rounded-2xl shadow-md border-2 border-slate-200 relative group cursor-pointer" onClick={() => handlePayClick('UPI QR Scanner')}>
                        {/* High-def SVG QR Code */}
                        <svg className="w-32 h-32 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-2h4v2h-4v-2zm-4 0h2v4h-2v-4zm2 4h4v4h-4v-4zm-4 2h2v2h-2v-2zm4-4h2v2h-2v-2zm-8-3h2v2H8v-2zm4 0h2v2h-2v-2zm0-4h2v2h-2V7zm-4 0h2v2H8V7zm2 2h2v2h-2V9z" />
                        </svg>

                        {/* Center Razorpay Badge */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-7 h-7 rounded-full bg-[#3395ff] text-white flex items-center justify-center font-black text-xs shadow-md">
                            ₹
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 text-center sm:text-left flex-1">
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-black text-[#0c2340] dark:text-blue-400">
                          <span>Scan QR with any UPI App</span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed">
                          Open Google Pay, PhonePe, Paytm, or BHIM to scan & authorize instantly.
                        </p>
                        
                        <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                          <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded">
                            Auto-expires in: {Math.floor(qrSeconds / 60)}:{(qrSeconds % 60).toString().padStart(2, '0')}
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => handlePayClick('UPI QR Instant')}
                          className="w-full sm:w-auto mt-2 px-4 py-2 bg-[#3395ff] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                        >
                          <span>Simulate QR Scan (Pay ₹{Number(amount || 0).toFixed(2)})</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Subtab B: UPI Apps */}
                  {upiSubTab === 'apps' && (
                    <div className="grid grid-cols-2 gap-2.5">
                      {[
                        { name: 'Google Pay', icon: 'GPay', color: 'bg-white border border-slate-200 text-slate-800' },
                        { name: 'PhonePe', icon: 'PhonePe', color: 'bg-purple-50 text-purple-900 border border-purple-200' },
                        { name: 'Paytm UPI', icon: 'Paytm', color: 'bg-sky-50 text-sky-900 border border-sky-200' },
                        { name: 'BHIM UPI', icon: 'BHIM', color: 'bg-orange-50 text-orange-900 border border-orange-200' },
                        { name: 'CRED UPI', icon: 'CRED', color: 'bg-slate-900 text-white' },
                        { name: 'WhatsApp Pay', icon: 'WhatsApp', color: 'bg-emerald-50 text-emerald-900 border border-emerald-200' },
                      ].map(app => (
                        <button
                          key={app.name}
                          type="button"
                          onClick={() => handlePayClick(app.name)}
                          className={`p-3 rounded-xl font-bold text-xs flex items-center justify-between shadow-xs hover:scale-102 transition-all cursor-pointer ${app.color}`}
                        >
                          <span>{app.name}</span>
                          <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Subtab C: VPA Entry */}
                  {upiSubTab === 'vpa' && (
                    <div className="space-y-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Enter UPI ID / VPA</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={vpaInput}
                            onChange={(e) => setVpaInput(e.target.value)}
                            placeholder="username@okhdfcbank"
                            className="flex-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => handlePayClick(`UPI ID (${vpaInput})`)}
                            className="px-5 py-2.5 bg-[#3395ff] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                          >
                            Verify & Pay
                          </button>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400">A payment collect request will be sent to your UPI app.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── 2. CARDS VIEW ── */}
              {selectedNav === 'cards' && (
                <div className="space-y-3.5 animate-fadeIn">
                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={19}
                        value={cardNum}
                        onChange={(e) => setCardNum(formatCardInput(e.target.value))}
                        className="w-full px-3.5 py-2.5 pl-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <CreditCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <span className={`absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-black px-2 py-0.5 rounded ${cardBrand.color}`}>
                        {cardBrand.name}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Valid Thru (MM/YY)</label>
                      <input
                        type="text"
                        maxLength={5}
                        value={cardExp}
                        onChange={(e) => setCardExp(formatExpiryInput(e.target.value))}
                        placeholder="MM/YY"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">CVV / Security Code</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="3 digits"
                        className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                    />
                  </div>

                  <label className="flex items-center gap-2 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      checked={saveCard}
                      onChange={(e) => setSaveCard(e.target.checked)}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[11px] text-slate-500">Save card securely as per RBI guidelines</span>
                  </label>
                </div>
              )}

              {/* ── 3. NETBANKING VIEW ── */}
              {selectedNav === 'netbanking' && (
                <div className="space-y-3 animate-fadeIn">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Popular Banks</span>
                  <div className="grid grid-cols-3 gap-2">
                    {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank', 'Bank of Baroda'].map(bank => (
                      <button
                        key={bank}
                        type="button"
                        onClick={() => { playClick(); setSelectedBank(bank); }}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                          selectedBank === bank
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-extrabold ring-1 ring-blue-500/30'
                            : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {bank}
                      </button>
                    ))}
                  </div>

                  <div className="pt-2">
                    <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">Or Select from All Banks</label>
                    <select
                      value={selectedBank}
                      onChange={(e) => setSelectedBank(e.target.value)}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-900 dark:text-white"
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="State Bank of India">State Bank of India (SBI)</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                      <option value="Canara Bank">Canara Bank</option>
                      <option value="Union Bank of India">Union Bank of India</option>
                      <option value="IndusInd Bank">IndusInd Bank</option>
                      <option value="Federal Bank">Federal Bank</option>
                    </select>
                  </div>
                </div>
              )}

              {/* ── 4. WALLETS VIEW ── */}
              {selectedNav === 'wallet' && (
                <div className="space-y-3 animate-fadeIn">
                  <span className="text-[11px] font-bold text-slate-500 uppercase block">Supported Wallets</span>
                  <div className="grid grid-cols-2 gap-2.5">
                    {[
                      { name: 'Mobikwik Wallet', balance: '₹1,200.00' },
                      { name: 'Airtel Money', balance: '₹450.00' },
                      { name: 'Freecharge', balance: '₹80.00' },
                      { name: 'JioMoney', balance: '₹320.00' }
                    ].map(w => (
                      <button
                        key={w.name}
                        type="button"
                        onClick={() => handlePayClick(w.name)}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-blue-500 text-left transition-all cursor-pointer"
                      >
                        <span className="text-xs font-extrabold block text-slate-900 dark:text-white">{w.name}</span>
                        <span className="text-[10px] text-slate-400">Available: {w.balance}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Primary Action Button ── */}
              <div className="pt-5 border-t border-slate-100 dark:border-slate-800 space-y-2 mt-4">
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={() => handlePayClick(selectedNav === 'cards' ? `${cardBrand.name} Card` : selectedNav === 'netbanking' ? selectedBank : 'UPI')}
                  className="w-full py-3.5 rounded-xl bg-[#3395ff] hover:bg-blue-600 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition-transform active:scale-95 cursor-pointer disabled:opacity-60"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Contacting Bank & Authorizing...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>PAY ₹{Number(amount || 0).toFixed(2)}</span>
                    </>
                  )}
                </button>

                {/* Footer Security Badge */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    <span>PCI-DSS Level 1 Encrypted</span>
                  </div>
                  <div className="flex items-center gap-1 font-bold text-slate-500 dark:text-slate-400">
                    <span>Secured by</span>
                    <span className="font-extrabold text-[#0c2340] dark:text-blue-400">Razorpay</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
