import React, { useState, useId } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { ROLES } from '../data/mockData';
import { useToast } from '../context/ToastContext';
import { 
  ShoppingCart, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles, 
  Sun, 
  Moon, 
  CheckCircle2,
  User,
  Phone,
  AlertCircle,
  Globe,
  ShoppingBag,
  Package,
  Tag,
  Apple,
  Carrot
} from 'lucide-react';

export default function LoginView() {
  const { login, loginWithCredentials, registerCustomer, completeCustomerRegistration } = useApp();
  const { theme, toggleTheme } = useTheme();
  const { lang, setLang, t } = useLanguage();
  const { playSuccess, playClick, playBeep } = useSoundEffects();
  const { showToast } = useToast();

  const emailId = useId();
  const passwordId = useId();

  // Mode state: 'login' | 'register'
  const [authMode, setAuthMode] = useState('login');
  
  // Login states
  const [email, setEmail] = useState('admin@smartmart.pro');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Registration states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regShowPassword, setRegShowPassword] = useState(false);
  
  // OTP Verification Modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) return;

    setErrorMessage('');
    const result = loginWithCredentials(email, password);
    if (result && result.success) {
      playSuccess();
      showToast({ title: `Welcome back! 👋`, message: `Signed in successfully.`, type: 'success', category: 'login' });
    } else {
      playBeep();
      const msg = result?.message || 'Invalid security credentials. Access Denied.';
      setErrorMessage(msg);
      showToast({ title: 'Login Failed', message: msg, type: 'error', category: 'security' });
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (regPassword !== regConfirmPassword) {
      playBeep();
      setErrorMessage('Passwords do not match.');
      showToast({ title: 'Password Mismatch', message: 'Both passwords must be identical.', type: 'error', category: 'security' });
      return;
    }

    const otp = registerCustomer(regName, regEmail, regPhone, regPassword);
    if (otp && otp.success !== false) {
      playSuccess();
      setGeneratedOtp(otp.otp || otp);
      setOtpError('');
      setShowOtpModal(true);
      showToast({ title: 'OTP Sent! 📧', message: `Verification code sent to ${regEmail}.`, type: 'info', category: 'security', duration: 5000 });
    } else if (otp && otp.success === false) {
      playBeep();
      setErrorMessage(otp.message);
      showToast({ title: 'Registration Failed', message: otp.message, type: 'error', category: 'security' });
    }
  };

  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (enteredOtp === generatedOtp) {
      playSuccess();
      completeCustomerRegistration(regEmail);
      setShowOtpModal(false);
      showToast({ title: '🎉 Account Created!', message: `Welcome to SmartMart, ${regName}!`, type: 'success', category: 'login', duration: 5000 });
      setEmail(regEmail);
      setPassword(regPassword);
      setAuthMode('login');
      setRegName(''); setRegEmail(''); setRegPhone('');
      setRegPassword(''); setRegConfirmPassword(''); setEnteredOtp('');
    } else {
      playBeep();
      setOtpError('Invalid verification code. Please try again.');
      showToast({ title: 'Wrong OTP', message: 'The code you entered is incorrect.', type: 'error', category: 'security' });
    }
  };

  const handleQuickLogin = (roleObj) => {
    playSuccess();
    const demoEmail = roleObj.id === 'Super Admin' ? 'admin@smartmart.pro' : `${roleObj.id.toLowerCase().replace(/\s+/g, '')}@smartmart.pro`;
    const demoName = roleObj.id === 'Super Admin' ? 'Sarathi Kamal N' : roleObj.title;
    login(roleObj.id, demoEmail, demoName);
    showToast({ title: `Signed in as ${roleObj.title} 🚀`, message: `JWT token decoded. Access granted.`, type: 'success', category: 'login', duration: 4500 });
  };

  const isDark = theme === 'dark';

  return (
    <div
      className={`min-h-screen w-screen flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-slate-950 transition-colors duration-300 ${
        isDark ? 'bg-slate-950' : 'bg-slate-100'
      }`}
      style={{
        backgroundImage: isDark
          ? `linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.50)), url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920&q=80')`
          : `linear-gradient(to bottom, rgba(255,255,255,0.15), rgba(255,255,255,0.25)), url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1920&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Theme-aware soft overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors duration-300"
        style={{ background: isDark ? 'rgba(2,6,23,0.20)' : 'rgba(240,253,244,0.30)' }}
      />

      {/* Background Glow Orbs */}
      <div className={`absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-colors duration-300 ${
        isDark ? 'bg-emerald-500/10' : 'bg-emerald-400/20'
      }`} />
      <div className={`absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none transition-colors duration-300 ${
        isDark ? 'bg-teal-500/10' : 'bg-teal-400/20'
      }`} />

      {/* ════════════ GROCERY ANIMATIONS LAYER ════════════ */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-[1]">

        {/* ── Rolling Trolley 1 – large, fast ── */}
        <div
          className="absolute bottom-10 left-0"
          style={{ animation: 'trolley-roll 11s linear infinite' }}
        >
          <div className="relative">
            <ShoppingCart className={`w-14 h-14 drop-shadow-lg ${ isDark ? 'text-emerald-400/60' : 'text-emerald-600/70' }`} />
            {/* Mini grocery items inside the cart */}
            <div className="absolute -top-4 left-2 flex gap-1">
              <div className={`w-2 h-4 rounded-sm ${ isDark ? 'bg-red-400/70' : 'bg-red-500/80' }`} />
              <div className={`w-2 h-5 rounded-sm ${ isDark ? 'bg-yellow-400/70' : 'bg-amber-400/80' }`} />
              <div className={`w-2 h-3 rounded-sm ${ isDark ? 'bg-green-400/70' : 'bg-green-500/80' }`} />
            </div>
          </div>
        </div>

        {/* ── Rolling Trolley 2 – small, slow, offset ── */}
        <div
          className="absolute bottom-28 left-0"
          style={{ animation: 'trolley-roll-slow 16s linear infinite', animationDelay: '-7s' }}
        >
          <ShoppingCart className={`w-8 h-8 ${ isDark ? 'text-teal-400/45' : 'text-teal-600/55' }`} />
        </div>

        {/* ── Floating ShoppingBag – top left ── */}
        <div
          className="absolute top-14 left-8 hidden md:block"
          style={{ animation: 'grocery-float-a 5s ease-in-out infinite', animationDelay: '0s' }}
        >
          <ShoppingBag className={`w-12 h-12 drop-shadow ${ isDark ? 'text-emerald-300/50' : 'text-emerald-500/60' }`} />
        </div>

        {/* ── Floating Apple – top right ── */}
        <div
          className="absolute top-20 right-10 hidden md:block"
          style={{ animation: 'grocery-float-b 4.5s ease-in-out infinite', animationDelay: '-1.5s' }}
        >
          <Apple className={`w-10 h-10 drop-shadow ${ isDark ? 'text-red-400/50' : 'text-red-500/60' }`} />
        </div>

        {/* ── Floating Carrot – mid left ── */}
        <div
          className="absolute top-1/2 left-6 -translate-y-24 hidden lg:block"
          style={{ animation: 'grocery-float-c 6s ease-in-out infinite', animationDelay: '-2s' }}
        >
          <Carrot className={`w-9 h-9 drop-shadow ${ isDark ? 'text-orange-400/50' : 'text-orange-500/65' }`} />
        </div>

        {/* ── Floating Package – mid right ── */}
        <div
          className="absolute top-1/2 right-6 -translate-y-16 hidden lg:block"
          style={{ animation: 'grocery-float-a 5.5s ease-in-out infinite', animationDelay: '-3s' }}
        >
          <Package className={`w-10 h-10 drop-shadow ${ isDark ? 'text-amber-400/50' : 'text-amber-500/60' }`} />
        </div>

        {/* ── Spinning Price Tag – bottom left ── */}
        <div
          className="absolute bottom-20 left-10 hidden md:block"
          style={{ animation: 'tag-spin 4s ease-in-out infinite', animationDelay: '-1s' }}
        >
          <Tag className={`w-8 h-8 drop-shadow ${ isDark ? 'text-teal-400/55' : 'text-teal-600/65' }`} />
        </div>

        {/* ── Floating ShoppingBag – bottom right ── */}
        <div
          className="absolute bottom-16 right-10 hidden md:block"
          style={{ animation: 'grocery-float-b 3.8s ease-in-out infinite', animationDelay: '-0.5s' }}
        >
          <ShoppingBag className={`w-9 h-9 drop-shadow ${ isDark ? 'text-emerald-400/45' : 'text-emerald-600/55' }`} />
        </div>

        {/* ── Small Apple & Carrot cluster – bottom center ── */}
        <div className="absolute bottom-6 left-1/2 -translate-x-20 flex gap-4 hidden sm:flex">
          <Apple
            className={`w-6 h-6 ${ isDark ? 'text-red-400/40' : 'text-red-500/50' }`}
            style={{ animation: 'grocery-float-c 3s ease-in-out infinite' }}
          />
          <Carrot
            className={`w-6 h-6 ${ isDark ? 'text-orange-400/40' : 'text-orange-500/50' }`}
            style={{ animation: 'grocery-float-a 3.5s ease-in-out infinite', animationDelay: '-1s' }}
          />
          <ShoppingCart
            className={`w-6 h-6 ${ isDark ? 'text-emerald-400/40' : 'text-emerald-600/50' }`}
            style={{ animation: 'grocery-float-b 4s ease-in-out infinite', animationDelay: '-0.5s' }}
          />
        </div>
      </div>
      {/* ════════════════════════════════════════════════ */}

      {/* Theme & Language Selector Toggle */}
      <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
        <div className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-xs font-bold shadow-lg border ${
          isDark ? 'bg-slate-900/90 border-slate-700 text-slate-300' : 'bg-white/90 border-slate-200 text-slate-700'
        }`}>
          <Globe className="w-3.5 h-3.5 text-emerald-500" />
          <select
            value={lang}
            onChange={(e) => {
              setLang(e.target.value);
              showToast({ title: 'Language Changed 🌐', message: `Switched language to ${e.target.value.toUpperCase()}`, type: 'info', duration: 2000 });
            }}
            className={`bg-transparent focus:outline-none cursor-pointer text-xs font-bold ${
              isDark ? 'text-slate-300' : 'text-slate-700'
            }`}
          >
            <option value="en">EN</option>
            <option value="hi">HI</option>
            <option value="ml">ML</option>
            <option value="ta">TA</option>
          </select>
        </div>

        <button
          onClick={() => {
            toggleTheme();
            showToast({
              title: isDark ? 'Light Theme Activated ☀️' : 'Dark Theme Activated 🌙',
              message: isDark ? 'Switched to clean daytime mode' : 'Switched to sleek dark mode',
              type: 'info',
              duration: 2000
            });
          }}
          className={`p-2.5 rounded-2xl border transition-all shadow-lg ${
            isDark ? 'bg-slate-900/90 border-slate-700 text-slate-300 hover:bg-slate-800' : 'bg-white/90 border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>
      </div>

      {/* Main Login Box */}
      <div className={`w-full max-w-xl backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden relative z-10 border transition-colors duration-300 ${
        isDark
          ? 'bg-slate-900/88 border-slate-700/60 text-slate-100'
          : 'bg-white/88 border-white/60 text-slate-900'
      }`}>
        
        {/* Login Form Panel */}
        <div className="p-10 sm:p-12 flex flex-col justify-between space-y-7">
          <div>
            {/* Header Brand */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/30">
                <ShoppingCart className="w-8 h-8 stroke-[2.5]" />
              </div>
              <div>
                <h1 className={`font-extrabold text-4xl tracking-tight leading-tight ${
                  isDark ? 'text-white' : 'text-emerald-900'
                }`}>
                  SmartMart <span className="text-emerald-500 font-black">Pro</span>
                </h1>
                <p className={`text-base font-medium mt-1 ${
                  isDark ? 'text-slate-400' : 'text-emerald-700/80'
                }`}>{t("Enterprise Supermarket & Grocery ERP System")}</p>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-4 mb-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-sm font-bold flex items-center gap-2 animate-shake">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{t(errorMessage)}</span>
              </div>
            )}

            {/* View Mode Tabs */}
            <div className={`flex gap-2 p-2 rounded-2xl border mb-6 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
            }`}>
              <button
                type="button"
                onClick={() => { playClick(); setAuthMode('login'); setErrorMessage(''); }}
                className={`flex-1 py-3 rounded-xl text-base font-bold transition-all text-center ${
                  authMode === 'login'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t("Sign In")}
              </button>
              <button
                type="button"
                onClick={() => { playClick(); setAuthMode('register'); setErrorMessage(''); }}
                className={`flex-1 py-3 rounded-xl text-base font-bold transition-all text-center ${
                  authMode === 'register'
                    ? 'bg-emerald-500 text-slate-950 shadow-md font-extrabold'
                    : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {t("Register Customer")}
              </button>
            </div>

            {authMode === 'login' ? (
              <>
                <div className="mb-6">
                  <h2 className={`text-3xl font-extrabold tracking-tight ${
                    isDark ? 'text-white' : 'text-emerald-900'
                  }`}>{t("Security Credentials Login")}</h2>
                  <p className={`text-base mt-2 ${
                    isDark ? 'text-slate-400' : 'text-emerald-700/70'
                  }`}>{t("Enter your registered email and password to login.")}</p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div>
                    <label htmlFor={emailId} className={`block text-base font-bold mb-2 tracking-wide ${
                      isDark ? 'text-slate-300' : 'text-emerald-800'
                    }`}>
                      {t("EMAIL ADDRESS")}
                    </label>
                    <div className="relative">
                      <Mail className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id={emailId}
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. admin@smartmart.pro"
                        className={`w-full pl-12 pr-4 py-4 border rounded-2xl text-base font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                          isDark
                            ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor={passwordId} className={`block text-base font-bold tracking-wide ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>
                        {t("PASSWORD")}
                      </label>
                      <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Verification link sent to registered email."); }} className="text-sm text-emerald-500 font-semibold hover:underline">
                        {t("Forgot Password?")}
                      </a>
                    </div>
                    <div className="relative">
                      <Lock className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        id={passwordId}
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className={`w-full pl-12 pr-12 py-4 border rounded-2xl text-base font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all ${
                          isDark
                            ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => !prev)}
                        className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                          isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-400 hover:text-slate-700'
                        }`}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center pt-1">
                    <label className={`flex items-center gap-3 cursor-pointer font-semibold text-base ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
                      />
                      <span>{t("Remember this device")}</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 text-slate-950 font-black py-4 rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-transform active:scale-98"
                  >
                    <span>{t("LOG IN & DECODE SECURE JWT")}</span>
                    <ArrowRight className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="mb-5">
                  <h2 className={`text-2xl font-extrabold tracking-tight ${
                    isDark ? 'text-white' : 'text-slate-900'
                  }`}>{t("Create SmartMart Customer Account")}</h2>
                  <p className={`text-sm mt-1.5 ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>{t("Register using your email. We will send a 4-digit security code (OTP) to verify ownership.")}</p>
                </div>

                {/* Registration Form */}
                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-sm">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block font-bold mb-1.5 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>{t("FULL NAME")}</label>
                      <div className="relative">
                        <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          required
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="Ananya Sundaram"
                          className={`w-full pl-10 pr-4 py-3 border rounded-2xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition-all ${
                            isDark
                              ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                              : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block font-bold mb-1.5 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>{t("EMAIL ADDRESS")}</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          required
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="ananya.s@gmail.com"
                          className={`w-full pl-10 pr-4 py-3 border rounded-2xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition-all ${
                            isDark
                              ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                              : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className={`block font-bold mb-1.5 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>PHONE NUMBER</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          required
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          placeholder="+91 98401 23456"
                          className={`w-full pl-10 pr-4 py-3 border rounded-2xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition-all ${
                            isDark
                              ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                              : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                          }`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className={`block font-bold mb-1.5 ${
                        isDark ? 'text-slate-300' : 'text-slate-700'
                      }`}>{t("PASSWORD")}</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type={regShowPassword ? 'text' : 'password'}
                          required
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Create strong password"
                          className={`w-full pl-10 pr-10 py-3 border rounded-2xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition-all ${
                            isDark
                              ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                              : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className={`block font-bold mb-1.5 ${
                      isDark ? 'text-slate-300' : 'text-slate-700'
                    }`}>{t("CONFIRM PASSWORD")}</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={regShowPassword ? 'text' : 'password'}
                        required
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className={`w-full pl-10 pr-10 py-3 border rounded-2xl text-sm font-medium focus:outline-none focus:border-emerald-500 transition-all ${
                          isDark
                            ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500'
                            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                        }`}
                      />
                    </div>
                  </div>

                  <div className="flex items-center pt-1">
                    <label className={`flex items-center gap-2 cursor-pointer font-medium text-sm ${
                      isDark ? 'text-slate-400' : 'text-slate-600'
                    }`}>
                      <input
                        type="checkbox"
                        checked={regShowPassword}
                        onChange={(e) => setRegShowPassword(e.target.checked)}
                        className="w-4 h-4 accent-emerald-500 rounded cursor-pointer"
                      />
                      <span>Show passwords</span>
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 text-slate-950 font-black py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-transform active:scale-98"
                  >
                    <span>{t("SEND VERIFICATION CODE")}</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Quick Demo Buttons */}
          <div className={`pt-5 border-t ${
            isDark ? 'border-slate-800/80' : 'border-slate-200'
          }`}>
            <div className="flex flex-wrap gap-2">
              {ROLES.filter(r => r.id !== 'AI Assistant').map((r) => (
                <button
                  key={r.id}
                  onClick={() => handleQuickLogin(r)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border hover:bg-emerald-500/20 hover:text-emerald-500 hover:border-emerald-500/30 ${
                    isDark
                      ? 'bg-slate-950 text-slate-300 border-slate-800'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {t(r.title)}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* OTP Verification Modal */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative animate-scale-up space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">{t("Enter Verification Code")}</h3>
              <p className="text-xs text-slate-400 mt-1">
                We sent a 4-digit code to verify ownership of <strong>{regEmail}</strong>.
              </p>
            </div>

            {/* Notification alert displaying code (for easy testing) */}
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-[11px] font-bold text-center">
              🔑 SIMULATED SMS/EMAIL CODE: <strong className="text-white text-sm tracking-widest">{generatedOtp}</strong>
            </div>

            {otpError && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs font-bold text-center">
                {otpError}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <input
                type="text"
                required
                maxLength={4}
                value={enteredOtp}
                onChange={(e) => setEnteredOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="4-digit code"
                className="w-full text-center py-3 bg-slate-950 border border-slate-800 rounded-2xl text-lg tracking-[1em] font-black text-white focus:outline-none focus:border-emerald-500"
              />

              <div className="flex gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => { playClick(); setShowOtpModal(false); }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-center"
                >
                  {t("Cancel")}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-2xl text-center shadow-lg shadow-emerald-500/20"
                >
                  {t("Verify OTP")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
