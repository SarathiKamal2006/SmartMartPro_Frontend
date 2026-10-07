import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AIChatDrawer from './components/AIChatDrawer';
import NotificationsModal from './components/NotificationsModal';
import InvoiceModal from './components/InvoiceModal';
import BarcodeScannerModal from './components/BarcodeScannerModal';
import RazorpayModal from './components/RazorpayModal';
import SplashScreen from './components/SplashScreen';

import LoginView from './views/LoginView';
import DashboardView from './views/DashboardView';
import ProductsView from './views/ProductsView';
import InventoryView from './views/InventoryView';
import BillingPOSView from './views/BillingPOSView';
import SuppliersView from './views/SuppliersView';
import CustomersView from './views/CustomersView';
import EmployeesView from './views/EmployeesView';
import WarehouseBranchesView from './views/WarehouseBranchesView';
import FinanceReportsView from './views/FinanceReportsView';
import AIForecastingView from './views/AIForecastingView';
import SettingsView from './views/SettingsView';

import CustomerStorefrontView from './views/CustomerStorefrontView';
import DeliveryPartnerView from './views/DeliveryPartnerView';
import AccountantView from './views/AccountantView';

import { ROLE_VIEWS } from './components/Sidebar';
import { ShieldAlert, Home, Sparkles, ShoppingCart } from 'lucide-react';

function AccessDenied({ role, requestedView, onRedirect }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-6 max-w-lg mx-auto bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl mt-10">
      <div className="w-16 h-16 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center animate-bounce">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-2">
        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Access Denied & Blocked</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
          JWT Role-Based Access Control (RBAC) Protection
        </p>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
        Your current credentials role <strong className="text-rose-500 font-bold">{role}</strong> does not have authorization clearance to access the <strong className="text-slate-900 dark:text-white font-bold">{requestedView}</strong> view panel. Administrators have locked this module.
      </p>

      <button
        onClick={onRedirect}
        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-600 text-white font-black text-xs flex items-center gap-2 hover:brightness-110 shadow-lg shadow-rose-500/20 transition-transform active:scale-95"
      >
        <Home className="w-4 h-4" />
        <span>Return to Authorized Workspace</span>
      </button>
    </div>
  );
}
function MainLayout() {
  const { 
    currentView, 
    setCurrentView, 
    scannerModalOpen, 
    setScannerModalOpen, 
    razorpayModalOpen, 
    setRazorpayModalOpen, 
    razorpayOrderDetails, 
    completeCheckout,
    completeOnlineCheckout,
    user, 
    setAiDrawerOpen 
  } = useApp();
  const allowedViews = ROLE_VIEWS[user?.role] || ['dashboard', 'products', 'aiForecasting'];
  const isAuthorized = allowedViews.includes(currentView);

  const handleRedirect = () => {
    if (allowedViews.includes('dashboard')) {
      setCurrentView('dashboard');
    } else if (allowedViews.includes('products')) {
      setCurrentView('products');
    } else if (allowedViews.includes('billing')) {
      setCurrentView('billing');
    } else {
      setCurrentView(allowedViews[0] || 'dashboard');
    }
  };

  const renderView = () => {
    if (!isAuthorized) {
      return <AccessDenied role={user?.role} requestedView={currentView} onRedirect={handleRedirect} />;
    }

    switch (currentView) {
      case 'dashboard': return <DashboardView />;
      case 'customerStorefront': return <ProductsView />;
      case 'products': return <ProductsView />;
      case 'inventory': return <InventoryView />;
      case 'billing': return <BillingPOSView />;
      case 'deliveries': return <DeliveryPartnerView />;
      case 'suppliers': return <SuppliersView />;
      case 'customers': return <CustomersView />;
      case 'employees': return <EmployeesView />;
      case 'warehouse': return <WarehouseBranchesView />;
      case 'accountant': return <AccountantView />;
      case 'reports': return <FinanceReportsView />;
      case 'aiForecasting': return <AIForecastingView />;
      case 'settings': return <SettingsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden pothys-grocery-bg text-slate-900 dark:text-slate-100 selection:bg-emerald-500 selection:text-white transition-colors duration-300">
      {/* Sidebar Navigation */}
      <div className="relative z-50 shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative z-10">
        <Header />

        {/* Ambient background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute top-[-8%] right-[10%] w-[500px] h-[500px] rounded-full bg-amber-500/5 dark:bg-amber-500/8 blur-[120px] transition-colors duration-300" />
          <div className="absolute bottom-[5%] left-[15%] w-[400px] h-[400px] rounded-full bg-orange-400/4 dark:bg-orange-400/6 blur-[100px] transition-colors duration-300" />
          <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] rounded-full bg-amber-300/4 dark:bg-amber-600/5 blur-[80px] transition-colors duration-300" />
        </div>

        <main className="flex-1 p-6 overflow-y-auto relative z-10 pothys-grocery-bg">
          <div className="max-w-7xl mx-auto space-y-6">
            {renderView()}
          </div>
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <AIChatDrawer />
      <NotificationsModal />
      <InvoiceModal />
      <BarcodeScannerModal
        isOpen={scannerModalOpen}
        onClose={() => setScannerModalOpen(false)}
      />
      <RazorpayModal
        isOpen={razorpayModalOpen}
        onClose={() => setRazorpayModalOpen(false)}
        amount={razorpayOrderDetails?.amount}
        customer={razorpayOrderDetails?.customer}
        orderId={razorpayOrderDetails?.orderId}
        onSuccess={(paymentDetails) => {
          if (currentView === 'billing') {
            completeCheckout(paymentDetails);
          } else {
            completeOnlineCheckout({
              customerName: razorpayOrderDetails?.customer?.name || user?.name || 'Customer',
              customerEmail: razorpayOrderDetails?.customer?.email || user?.email || '',
              customerPhone: razorpayOrderDetails?.customer?.phone || user?.phone || '+91 98401 23456',
              paymentMethod: 'Razorpay (Online Verified)',
              paymentId: paymentDetails?.paymentId,
              orderId: paymentDetails?.orderId
            });
            setCurrentView('customerStorefront');
          }
        }}
      />

      {/* Floating AI Assistant FAB — with orbiting shopping carts */}
      <div className="fixed bottom-6 right-6 z-40 group">

        {/* Orbit field — larger than button to give cart orbit space */}
        <div className="absolute inset-[-30px] pointer-events-none">

          {/* Pulsing ring */}
          <div
            className="absolute inset-0 rounded-full border-2 border-emerald-400/40"
            style={{ animation: 'ai-ring-pulse 2.5s ease-in-out infinite' }}
          />

          {/* Orbit arm 1 — fast, large radius */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ animation: 'ai-orbit-arm 3.5s linear infinite' }}
          >
            <span style={{ animation: 'ai-orbit-icon-lg 3.5s linear infinite' }}>
              <ShoppingCart className="w-4 h-4 text-emerald-300 drop-shadow-[0_0_5px_rgba(52,211,153,0.9)]" />
            </span>
          </div>

          {/* Orbit arm 2 — slower, smaller radius, offset start */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ animation: 'ai-orbit-arm 5.5s linear infinite', animationDelay: '-2.75s' }}
          >
            <span style={{ animation: 'ai-orbit-icon-sm 5.5s linear infinite', animationDelay: '-2.75s' }}>
              <ShoppingCart className="w-3 h-3 text-teal-200/80 drop-shadow-[0_0_4px_rgba(45,212,191,0.7)]" />
            </span>
          </div>

          {/* Orbit arm 3 — medium speed, opposite side start */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ animation: 'ai-orbit-arm 4.5s linear infinite', animationDelay: '-1.5s' }}
          >
            <span style={{ animation: 'ai-orbit-icon-lg 4.5s linear infinite', animationDelay: '-1.5s' }}>
              <ShoppingCart className="w-3.5 h-3.5 text-emerald-200/60" />
            </span>
          </div>
        </div>

        {/* Main FAB Button */}
        <button
          onClick={() => setAiDrawerOpen(true)}
          className="ai-fab-glow relative w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 hover:brightness-110 text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-transform duration-200 cursor-pointer border-2 border-emerald-300/40"
          title="Open Smart AI Co-Pilot"
        >
          <Sparkles className="w-6 h-6 animate-pulse group-hover:rotate-12 transition-transform duration-300" />
          <span className="absolute right-16 bg-slate-950/95 dark:bg-slate-900/95 text-white text-xs font-extrabold px-3 py-1.5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap shadow-md border border-slate-800">
            Smart AI Assistant
          </span>
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return <MainLayout />;
}

export default function App() {
  const [showSplash, setShowSplash] = useState(
    () => !sessionStorage.getItem('smartmart_splashed')
  );

  const handleSplashDone = () => {
    sessionStorage.setItem('smartmart_splashed', '1');
    setShowSplash(false);
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <ToastProvider>
          <AppProvider>
            {showSplash && <SplashScreen onDone={handleSplashDone} />}
            <AppContent />
          </AppProvider>
        </ToastProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
