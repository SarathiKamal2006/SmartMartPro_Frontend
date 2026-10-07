import React, { useState, useId } from 'react';
import { useApp } from '../context/AppContext';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';

import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';
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
  const { loginWithCredentials, registerCustomer, completeCustomerRegistration, loginWithGoogle, requestPasswordReset, confirmPasswordReset } = useApp();
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
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [otpResendCooldown, setOtpResendCooldown] = useState(0);

  // Forgot Password Modal State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState(1); // 1: Email, 2: OTP & New Password
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotSuccessMsg, setForgotSuccessMsg] = useState('');

  // Google OAuth Dialog Modal States
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleStep, setGoogleStep] = useState(1); // 1: Email step, 2: Password step
  const [googleEmail, setGoogleEmail] = useState('');
  const [googlePassword, setGooglePassword] = useState('');
  const [googleShowPassword, setGoogleShowPassword] = useState(false);
  const [googleError, setGoogleError] = useState('');

  const handleGoogleNextEmail = (e) => {
    e.preventDefault();
    if (!googleEmail.trim()) {
      setGoogleError('Enter an email address');
      return;
    }
    if (!googleEmail.includes('@')) {
      setGoogleError('Enter a valid Google email address');
      return;
    }
    setGoogleError('');
    setGoogleStep(2);
  };

  const handleGoogleSignInSubmit = async (e) => {
    e.preventDefault();
    if (!googlePassword) {
      setGoogleError('Enter a password');
      return;
    }
    setGoogleError('');
    setIsLoading(true);
    try {
      const result = await loginWithGoogle(googleEmail, googlePassword);
      if (result && result.success) {
        playSuccess();
        setShowGoogleModal(false);
        showToast({
          title: 'Google Sign-In Successful! 🔐',
          message: `Welcome back, ${result.user?.name || googleEmail}!`,
          type: 'success',
          category: 'login'
        });
      } else {
        playBeep();
        setGoogleError(result?.message || 'Google OAuth Sign-In failed.');
      }
    } catch (err) {
      playBeep();
      setGoogleError('Failed to authenticate with Google OAuth.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestResetSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail || isLoading) return;

    setForgotError('');
    setIsLoading(true);
    try {
      const result = await requestPasswordReset(forgotEmail);
      if (result && result.success) {
        playSuccess();
        setForgotStep(2);
        setForgotSuccessMsg(`Verification code sent to ${forgotEmail}. Check your email inbox!`);
        showToast({ title: 'Reset Code Sent 📧', message: `Security code sent to ${forgotEmail}`, type: 'info', category: 'security' });
      } else {
        playBeep();
        const msg = result?.message || 'Failed to send reset code.';
        setForgotError(msg);
        showToast({ title: 'Password Reset Failed', message: msg, type: 'error', category: 'security' });
      }
    } catch (err) {
      playBeep();
      setForgotError('Error connecting to server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmResetSubmit = async (e) => {
    e.preventDefault();
    setForgotError('');

    if (newPassword !== confirmNewPassword) {
      playBeep();
      setForgotError('New passwords do not match.');
      showToast({ title: 'Password Mismatch', message: 'Both passwords must be identical.', type: 'error', category: 'security' });
      return;
    }

    if (newPassword.length < 4) {
      playBeep();
      setForgotError('Password must be at least 4 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await confirmPasswordReset(forgotEmail, forgotOtp, newPassword);
      if (result && result.success) {
        playSuccess();
        setShowForgotModal(false);
        setEmail(forgotEmail);
        setPassword(newPassword);
        showToast({
          title: 'Password Updated! 🎉',
          message: 'Your password has been changed successfully. You can now log in.',
          type: 'success',
          category: 'security',
          duration: 5000
        });
        setForgotEmail(''); setForgotOtp(''); setNewPassword(''); setConfirmNewPassword('');
      } else {
        playBeep();
        const msg = result?.message || 'Invalid 4-digit code. Please try again.';
        setForgotError(msg);
        showToast({ title: 'Reset Failed', message: msg, type: 'error', category: 'security' });
      }
    } catch (err) {
      playBeep();
      setForgotError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password || isLoading) return;

    setErrorMessage('');
    setIsLoading(true);
    try {
      const result = await loginWithCredentials(email, password);
      if (result && result.success) {
        playSuccess();
        showToast({ title: `Welcome back! 👋`, message: `Signed in successfully.`, type: 'success', category: 'login' });
      } else {
        playBeep();
        const msg = result?.message || 'Invalid security credentials. Access Denied.';
        setErrorMessage(msg);
        showToast({ title: 'Login Failed', message: msg, type: 'error', category: 'security' });
      }
    } catch (err) {
      playBeep();
      setErrorMessage('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (regPassword !== regConfirmPassword) {
      playBeep();
      setErrorMessage('Passwords do not match.');
      showToast({ title: 'Password Mismatch', message: 'Both passwords must be identical.', type: 'error', category: 'security' });
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerCustomer(regName, regEmail, regPhone, regPassword);
      if (result && result.success) {
        playSuccess();
        setOtpError('');
        setShowOtpModal(true);
        // Start resend cooldown (60 seconds)
        setOtpResendCooldown(60);
        const timer = setInterval(() => {
          setOtpResendCooldown(prev => {
            if (prev <= 1) { clearInterval(timer); return 0; }
            return prev - 1;
          });
        }, 1000);
        showToast({ title: 'OTP Sent! 📧', message: `Verification code sent to ${regEmail}. Check your inbox!`, type: 'info', category: 'security', duration: 5000 });
      } else {
        playBeep();
        const msg = result?.message || 'Registration failed. Please try again.';
        setErrorMessage(msg);
        showToast({ title: 'Registration Failed', message: msg, type: 'error', category: 'security' });
      }
    } catch (err) {
      playBeep();
      setErrorMessage('Failed to connect to server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (otpResendCooldown > 0 || isLoading) return;
    setIsLoading(true);
    try {
      const result = await registerCustomer(regName, regEmail, regPhone, regPassword);
      if (result && result.success) {
        playSuccess();
        setOtpResendCooldown(60);
        const timer = setInterval(() => {
          setOtpResendCooldown(prev => {
            if (prev <= 1) { clearInterval(timer); return 0; }
            return prev - 1;
          });
        }, 1000);
        setOtpError('');
        setEnteredOtp('');
        showToast({ title: 'OTP Resent! 📧', message: `New verification code sent to ${regEmail}.`, type: 'info', category: 'security' });
      } else {
        setOtpError(result?.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      setOtpError('Server error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!enteredOtp || isLoading) return;

    setIsLoading(true);
    try {
      const result = await completeCustomerRegistration(regEmail, enteredOtp);
      if (result && result.success) {
        playSuccess();
        setShowOtpModal(false);
        showToast({ title: '🎉 Account Created!', message: `Welcome to SmartMart, ${regName}!`, type: 'success', category: 'login', duration: 5000 });
        setRegName(''); setRegEmail(''); setRegPhone('');
        setRegPassword(''); setRegConfirmPassword(''); setEnteredOtp('');
      } else {
        playBeep();
        const msg = result?.message || 'Invalid verification code. Please try again.';
        setOtpError(msg);
        showToast({ title: 'Wrong OTP', message: msg, type: 'error', category: 'security' });
      }
    } catch (err) {
      playBeep();
      setOtpError('Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
            <div className="mb-8">
              <Logo 
                size="xl" 
                subtitle={t("Enterprise Supermarket & Grocery ERP System")}
              />
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
                      <a
                        href="#forgot"
                        onClick={(e) => {
                          e.preventDefault();
                          playClick();
                          setForgotStep(1);
                          setForgotError('');
                          setForgotSuccessMsg('');
                          setForgotEmail(email || '');
                          setForgotOtp('');
                          setNewPassword('');
                          setConfirmNewPassword('');
                          setShowForgotModal(true);
                        }}
                        className="text-sm text-emerald-500 font-semibold hover:underline"
                      >
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
                    disabled={isLoading}
                    className={`w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 text-slate-950 font-black py-4 rounded-2xl text-base flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-transform active:scale-98 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? (
                      <><span className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" /><span>Authenticating...</span></>
                    ) : (
                      <><span>{t("LOG IN & DECODE SECURE JWT")}</span><ArrowRight className="w-5 h-5 stroke-[2.5]" /></>
                    )}
                  </button>

                  {/* ── Google OAuth Button ── */}
                  <div className="relative my-5 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className={`w-full border-t ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />
                    </div>
                    <span className={`relative px-3 text-xs font-bold uppercase tracking-wider ${isDark ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-500'}`}>
                      {t("OR CONNECT WITH GOOGLE")}
                    </span>
                  </div>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      playClick();
                      setGoogleEmail('');
                      setGooglePassword('');
                      setGoogleError('');
                      setGoogleStep(1);
                      setShowGoogleModal(true);
                    }}
                    className={`w-full flex items-center justify-center gap-3 py-3.5 px-4 border rounded-2xl text-sm font-bold transition-all shadow-sm active:scale-98 cursor-pointer ${
                      isDark
                        ? 'bg-slate-950 border-slate-700 text-slate-200 hover:bg-slate-800 hover:border-slate-600'
                        : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400'
                    }`}
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                    <span>{t("Continue with Google")}</span>
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
                    disabled={isLoading}
                    className={`w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:brightness-110 text-slate-950 font-black py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-transform active:scale-98 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isLoading ? (
                      <><span className="w-4 h-4 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" /><span>Sending OTP to Email...</span></>
                    ) : (
                      <><span>{t("SEND VERIFICATION CODE")}</span><ArrowRight className="w-4 h-4 stroke-[2.5]" /></>
                    )}
                  </button>
                </form>
              </>
            )}
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
                We sent a 4-digit code to <strong className="text-emerald-400">{regEmail}</strong>.
                Check your email inbox.
              </p>
            </div>

            {/* Real email notice */}
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-[11px] font-bold text-center">
              📧 A real OTP has been sent to your email. Check your inbox (and spam folder).
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
                autoFocus
              />

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={otpResendCooldown > 0 || isLoading}
                  className={`text-xs font-bold transition-colors ${
                    otpResendCooldown > 0 ? 'text-slate-600 cursor-not-allowed' : 'text-emerald-400 hover:text-emerald-300 cursor-pointer'
                  }`}
                >
                  {otpResendCooldown > 0 ? `Resend OTP in ${otpResendCooldown}s` : 'Resend OTP'}
                </button>
              </div>

              <div className="flex gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => { playClick(); setShowOtpModal(false); setOtpError(''); setEnteredOtp(''); }}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-center"
                >
                  {t("Cancel")}
                </button>
                <button
                  type="submit"
                  disabled={isLoading || enteredOtp.length < 4}
                  className={`flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-2xl text-center shadow-lg shadow-emerald-500/20 ${
                    isLoading || enteredOtp.length < 4 ? 'opacity-70 cursor-not-allowed' : ''
                  }`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2"><span className="w-3 h-3 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />Verifying...</span>
                  ) : (
                    t("Verify OTP")
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════ FORGOT PASSWORD MODAL ════════════ */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative animate-scale-up space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-white">{t("Reset Password")}</h3>
              <p className="text-xs text-slate-400 mt-1">
                {forgotStep === 1
                  ? "Enter your registered email address below. We will send a 4-digit security code to reset your password."
                  : `Enter the 4-digit security code sent to ${forgotEmail} and create your new password.`}
              </p>
            </div>

            {forgotError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotSuccessMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl text-xs font-bold text-center">
                📧 {forgotSuccessMsg}
              </div>
            )}

            {forgotStep === 1 ? (
              <form onSubmit={handleRequestResetSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">{t("REGISTERED EMAIL ADDRESS")}</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. user@gmail.com"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-sm font-medium text-white focus:outline-none focus:border-emerald-500"
                      autoFocus
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { playClick(); setShowForgotModal(false); }}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-center"
                  >
                    {t("Cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !forgotEmail}
                    className={`flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-2xl text-center shadow-lg shadow-emerald-500/20 ${
                      isLoading || !forgotEmail ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2"><span className="w-3 h-3 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />Sending Code...</span>
                    ) : (
                      t("SEND RESET CODE")
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleConfirmResetSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">{t("4-DIGIT SECURITY CODE")}</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="4-digit code"
                    className="w-full text-center py-3 bg-slate-950 border border-slate-800 rounded-2xl text-base tracking-[0.8em] font-black text-white focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">{t("NEW PASSWORD")}</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new strong password"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">{t("CONFIRM NEW PASSWORD")}</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-xs font-medium text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { playClick(); setForgotStep(1); setForgotError(''); }}
                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-2xl text-center"
                  >
                    {t("Back")}
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || forgotOtp.length < 4 || !newPassword}
                    className={`flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black rounded-2xl text-center shadow-lg shadow-emerald-500/20 ${
                      isLoading || forgotOtp.length < 4 || !newPassword ? 'opacity-70 cursor-not-allowed' : ''
                    }`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2"><span className="w-3 h-3 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />Updating...</span>
                    ) : (
                      t("UPDATE PASSWORD")
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ════════════ GOOGLE OAUTH POPUP MODAL ════════════ */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className={`w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl relative border animate-scale-up space-y-6 ${
            isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            
            {/* Top Bar / Close */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span className="font-semibold text-sm tracking-tight text-slate-400">Google Account</span>
              </div>
              <button
                type="button"
                onClick={() => { playClick(); setShowGoogleModal(false); setGoogleError(''); }}
                className={`p-1.5 rounded-full transition-colors ${
                  isDark ? 'text-slate-400 hover:bg-slate-800 hover:text-white' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                ✕
              </button>
            </div>

            {/* Header */}
            <div>
              <h3 className="text-2xl font-semibold tracking-tight">
                {googleStep === 1 ? "Sign in with Google" : "Welcome"}
              </h3>
              <p className={`text-sm mt-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                to continue to <strong className="text-emerald-500">SmartMart Pro</strong>
              </p>
            </div>

            {/* Selected Account pill on Step 2 */}
            {googleStep === 2 && (
              <div className={`flex items-center justify-between p-2.5 px-3.5 rounded-full border text-xs font-semibold ${
                isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}>
                <div className="flex items-center gap-2 truncate">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                    {googleEmail.charAt(0).toUpperCase()}
                  </div>
                  <span className="truncate">{googleEmail}</span>
                </div>
                <button
                  type="button"
                  onClick={() => { playClick(); setGoogleStep(1); setGoogleError(''); }}
                  className="text-blue-500 hover:underline shrink-0 ml-2 font-bold"
                >
                  Change
                </button>
              </div>
            )}

            {/* Error Message */}
            {googleError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{googleError}</span>
              </div>
            )}

            {/* STEP 1: EMAIL ENTRY */}
            {googleStep === 1 && (
              <form onSubmit={handleGoogleNextEmail} className="space-y-5">
                <div>
                  <label className={`block text-xs font-bold tracking-wider uppercase mb-2 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Email or phone
                  </label>
                  <input
                    type="email"
                    required
                    value={googleEmail}
                    onChange={(e) => { setGoogleEmail(e.target.value); setGoogleError(''); }}
                    placeholder="Enter your Google email address"
                    className={`w-full px-4 py-3.5 rounded-2xl text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                      isDark ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                    }`}
                    autoFocus
                  />
                </div>

                {/* Demo Google Email Quick Select Chips */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 mb-2">Or select a demo Google account:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: 'Ananya Sundaram', email: 'ananya.s@gmail.com' },
                      { name: 'Sarathi Kamal', email: 'sarathi.k@gmail.com' },
                      { name: 'Customer Demo', email: 'user@gmail.com' }
                    ].map((acc) => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => {
                          playClick();
                          setGoogleEmail(acc.email);
                          setGoogleError('');
                        }}
                        className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 ${
                          googleEmail === acc.email
                            ? 'bg-blue-600 border-blue-600 text-white font-bold'
                            : isDark ? 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800' : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        <span>📧</span>
                        <span>{acc.email}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => { playClick(); setShowGoogleModal(false); }}
                    className={`text-sm font-bold text-blue-500 hover:underline`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-full text-sm shadow-md transition-all active:scale-95"
                  >
                    Next
                  </button>
                </div>
              </form>
            )}

            {/* STEP 2: PASSWORD ENTRY */}
            {googleStep === 2 && (
              <form onSubmit={handleGoogleSignInSubmit} className="space-y-5">
                <div>
                  <label className={`block text-xs font-bold tracking-wider uppercase mb-2 ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    Enter your password
                  </label>
                  <div className="relative">
                    <input
                      type={googleShowPassword ? 'text' : 'password'}
                      required
                      value={googlePassword}
                      onChange={(e) => { setGooglePassword(e.target.value); setGoogleError(''); }}
                      placeholder="Enter Google password"
                      className={`w-full pl-4 pr-12 py-3.5 rounded-2xl text-sm font-medium border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                        isDark ? 'bg-slate-950 border-slate-700 text-white placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      }`}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setGoogleShowPassword(prev => !prev)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 ${
                        isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {googleShowPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <label className={`flex items-center gap-2 cursor-pointer text-xs font-semibold ${
                    isDark ? 'text-slate-400' : 'text-slate-600'
                  }`}>
                    <input
                      type="checkbox"
                      checked={googleShowPassword}
                      onChange={(e) => setGoogleShowPassword(e.target.checked)}
                      className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                    />
                    <span>Show password</span>
                  </label>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => { playClick(); setGoogleStep(1); setGoogleError(''); }}
                    className="text-sm font-bold text-blue-500 hover:underline"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-70 text-white font-bold rounded-full text-sm shadow-md transition-all active:scale-95 flex items-center gap-2"
                  >
                    {isLoading ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /><span>Signing in...</span></>
                    ) : (
                      <span>Sign in</span>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
