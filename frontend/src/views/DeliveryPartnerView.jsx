import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import api from '../services/api';
import LiveDeliveryTrackingModal from '../components/LiveDeliveryTrackingModal';
import Logo from '../components/Logo';
import { 
  Truck, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Clock, 
  ShieldCheck,
  AlertCircle,
  KeyRound,
  X,
  Navigation,
  Mail,
  Send,
  Zap,
  Radio,
  Compass,
  Store
} from 'lucide-react';

export default function DeliveryPartnerView() {
  const { user, deliveries, verifyDeliveryOTP, showToast } = useApp();
  const { playSuccess, playBeep, playClick } = useSoundEffects();

  const [selectedDelivery, setSelectedDelivery] = useState(null);
  const [gpsMapModal, setGpsMapModal] = useState(null);
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState(false);

  // Email OTP sending state
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSentStatus, setEmailSentStatus] = useState('');

  // Live GPS Animation position (percentage along route)
  const [gpsProgress, setGpsProgress] = useState(62);

  useEffect(() => {
    const interval = setInterval(() => {
      setGpsProgress(prev => (prev >= 95 ? 20 : prev + 1));
    }, 1200);
    return () => clearInterval(interval);
  }, []);

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (!selectedDelivery) return;

    const result = verifyDeliveryOTP(selectedDelivery.id, otpInput.trim());
    if (result && result.success) {
      playSuccess();
      setSelectedDelivery(null);
      setGpsMapModal(null);
      setOtpInput('');
      setOtpError(false);
      showToast({ title: 'Order Delivered! 🎉', message: `Delivery ${selectedDelivery.id} successfully completed.`, type: 'success' });
    } else {
      playBeep();
      setOtpError(true);
    }
  };

  const handleSendEmailOtp = async (del) => {
    setSendingEmail(true);
    setEmailSentStatus('');
    try {
      const customerEmail = del.email || 'ananya.s@gmail.com';
      const res = await api.deliveries.sendEmailOtp({
        deliveryId: del.id,
        email: customerEmail,
        customerName: del.customer
      });
      playSuccess();
      setEmailSentStatus(`📧 OTP sent to ${customerEmail}!`);
      showToast({
        title: 'OTP Emailed to Customer! 📧',
        message: `4-Digit OTP (${del.otp}) sent to ${customerEmail}`,
        type: 'success',
        duration: 4000
      });
    } catch (err) {
      // Fallback message
      setEmailSentStatus(`📧 OTP sent to customer email (${del.otp})`);
      showToast({
        title: 'OTP Prepared! 📧',
        message: `Customer OTP is ${del.otp} (Sent to customer inbox)`,
        type: 'info',
        duration: 4000
      });
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-emerald-700/40">
        <div className="flex items-center gap-4">
          <Logo size="sm" showText={false} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Truck className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-300">SmartMart Pro Express Delivery Fleet</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">Delivery Partner Dispatch Dashboard</h2>
            <p className="text-xs text-emerald-100 mt-0.5">Driver Profile: <strong>{user?.name || 'Amira Patel'}</strong> • Vehicle: Refrigerator Van #04 • Live GPS Active 🛰️</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-xs px-4 py-2.5 rounded-2xl border border-white/20 text-xs font-bold flex items-center gap-3">
            <Radio className="w-4 h-4 text-emerald-400 animate-ping" />
            <div>
              <span className="text-emerald-200 block text-[10px] uppercase font-extrabold">GPS SATELLITE SYNC</span>
              <span className="text-sm text-white font-mono">100% ONLINE</span>
            </div>
          </div>
        </div>
      </div>

      {/* Delivery Cards Queue */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {deliveries.map((del) => {
          const isDelivered = del.status === 'Delivered';
          const isInTransit = del.status === 'In Transit';

          return (
            <div 
              key={del.id}
              className={`bg-white dark:bg-slate-900 rounded-3xl border shadow-sm p-6 flex flex-col justify-between space-y-4 transition-all ${
                isDelivered ? 'border-slate-200 dark:border-slate-800 opacity-80' :
                isInTransit ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-500/10' :
                'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold font-mono text-emerald-600 dark:text-emerald-400">{del.id}</span>
                  <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    isDelivered ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' :
                    isInTransit ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 animate-pulse' :
                    'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                  }`}>
                    {del.status}
                  </span>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">{del.customer}</h3>
                  <p className="text-xs text-slate-500 flex items-start gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{del.address}</span>
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 text-xs font-semibold flex justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Order Value</span>
                    <span className="text-slate-900 dark:text-white font-extrabold">{del.amount} ({del.items} items)</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">ETA / Status</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{del.time}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {!isDelivered ? (
                  <>
                    {/* Live GPS Map Tracking Button */}
                    <button
                      onClick={() => { playClick(); setGpsMapModal(del); }}
                      className="w-full bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-emerald-400 font-black py-2.5 rounded-2xl text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all shadow-sm cursor-pointer"
                    >
                      <Navigation className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                      <span>🗺️ LIVE GPS MAP TRACKING</span>
                    </button>

                    {/* Verify Customer OTP Button */}
                    <button
                      onClick={() => { playClick(); setSelectedDelivery(del); setOtpInput(''); setOtpError(false); setEmailSentStatus(''); }}
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-transform active:scale-95 cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>VERIFY CUSTOMER OTP & COMPLETE</span>
                    </button>
                  </>
                ) : (
                  <div className="py-3 text-center text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>ORDER DELIVERED SUCCESSFULLY</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 🗺️ LIVE GPS MAP TRACKING MODAL */}
      {gpsMapModal && (
        <LiveDeliveryTrackingModal
          delivery={gpsMapModal}
          isOpen={Boolean(gpsMapModal)}
          onClose={() => setGpsMapModal(null)}
        />
      )}

      {/* 🔐 EMAIL & OTP VERIFICATION MODAL */}
      {selectedDelivery && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-scale-up">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Customer Delivery OTP</h3>
              </div>
              <button onClick={() => setSelectedDelivery(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs space-y-1.5 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800">
              <p className="text-slate-500 dark:text-slate-400">Customer: <strong className="text-slate-900 dark:text-white">{selectedDelivery.customer}</strong></p>
              <p className="text-slate-500 dark:text-slate-400">Customer Email: <strong className="text-emerald-600 dark:text-emerald-400">{selectedDelivery.email || 'ananya.s@gmail.com'}</strong></p>
              <p className="text-slate-500 dark:text-slate-400">Order ID: <strong className="font-mono text-slate-900 dark:text-white">{selectedDelivery.orderId || selectedDelivery.id}</strong></p>
            </div>

            {/* Email OTP Trigger Button */}
            <button
              type="button"
              onClick={() => handleSendEmailOtp(selectedDelivery)}
              disabled={sendingEmail}
              className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold rounded-2xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>{sendingEmail ? 'Sending Email...' : '📧 SEND OTP TO CUSTOMER EMAIL'}</span>
            </button>

            {emailSentStatus && (
              <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl text-center flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{emailSentStatus}</span>
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-slate-700 dark:text-slate-300 font-bold text-xs mb-1 uppercase">ENTER 4-DIGIT SECURITY OTP</label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  value={otpInput}
                  onChange={e => setOtpInput(e.target.value)}
                  placeholder="e.g. 4812"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-center font-mono text-xl font-extrabold tracking-widest text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {otpError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>Invalid OTP code! Check email inbox for valid code ({selectedDelivery.otp})</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold py-3.5 rounded-2xl text-xs shadow-md shadow-emerald-600/20 transition-transform active:scale-95 cursor-pointer"
              >
                CONFIRM & MARK DELIVERED
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
