import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X, ShoppingCart, LogIn, LogOut, Package, User, ShieldCheck, Truck, Tag, Sparkles, Bell } from 'lucide-react';

const ToastContext = createContext(null);

// ── Toast type config ──────────────────────────────────────────────────────
const TOAST_CONFIG = {
  success: {
    bar:  'bg-emerald-500',
    ring: 'border-emerald-500/30',
    bg:   'bg-emerald-500/10',
    icon: CheckCircle2,
    iconColor: 'text-emerald-400',
    titleColor: 'text-emerald-300',
  },
  error: {
    bar:  'bg-rose-500',
    ring: 'border-rose-500/30',
    bg:   'bg-rose-500/10',
    icon: XCircle,
    iconColor: 'text-rose-400',
    titleColor: 'text-rose-300',
  },
  warning: {
    bar:  'bg-amber-500',
    ring: 'border-amber-500/30',
    bg:   'bg-amber-500/10',
    icon: AlertTriangle,
    iconColor: 'text-amber-400',
    titleColor: 'text-amber-300',
  },
  info: {
    bar:  'bg-sky-500',
    ring: 'border-sky-500/30',
    bg:   'bg-sky-500/10',
    icon: Info,
    iconColor: 'text-sky-400',
    titleColor: 'text-sky-300',
  },
};

// Custom icon overrides for specific action categories
const CATEGORY_ICONS = {
  login:    LogIn,
  logout:   LogOut,
  cart:     ShoppingCart,
  product:  Package,
  employee: User,
  security: ShieldCheck,
  delivery: Truck,
  price:    Tag,
  ai:       Sparkles,
  notify:   Bell,
};

// ── Single Toast item ──────────────────────────────────────────────────────
function ToastItem({ toast, onRemove }) {
  const config   = TOAST_CONFIG[toast.type] || TOAST_CONFIG.info;
  const IconComp = toast.category ? (CATEGORY_ICONS[toast.category] || config.icon) : config.icon;
  const [progress, setProgress] = useState(100);
  const [visible,  setVisible]  = useState(false);
  const intervalRef = useRef(null);
  const duration = toast.duration || 4000;

  // Slide-in on mount
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));

    // Progress bar countdown
    const step = 100 / (duration / 50);
    intervalRef.current = setInterval(() => {
      setProgress(prev => {
        const next = prev - step;
        if (next <= 0) {
          clearInterval(intervalRef.current);
          return 0;
        }
        return next;
      });
    }, 50);

    // Auto remove
    const timer = setTimeout(() => handleDismiss(), duration);
    return () => {
      clearTimeout(timer);
      clearInterval(intervalRef.current);
    };
  }, []);

  function handleDismiss() {
    setVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  }

  return (
    <div
      className={`relative flex items-start gap-3.5 w-84 max-w-[calc(100vw-32px)] rounded-2xl border backdrop-blur-2xl shadow-2xl overflow-hidden px-4.5 py-3.5 cursor-pointer select-none transition-all duration-300 ${config.ring}`}
      style={{
        background: 'rgba(15, 23, 42, 0.95)',
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(-16px) scale(0.94)',
        opacity: visible ? 1 : 0,
        boxShadow: '0 20px 30px -10px rgba(0, 0, 0, 0.6), 0 0 15px 1px rgba(16, 185, 129, 0.15)',
      }}
      onClick={handleDismiss}
      role="alert"
    >
      {/* Progress bar at top */}
      <div className={`absolute top-0 left-0 h-[3px] rounded-full ${config.bar}`} style={{ width: `${progress}%`, transition: 'width 50ms linear' }} />

      {/* Icon */}
      <div className={`mt-0.5 shrink-0 p-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60 ${config.iconColor}`}>
        <IconComp className="w-4 h-4" />
      </div>

      {/* Text content */}
      <div className="flex-1 min-w-0 pr-1">
        <p className={`text-xs font-black tracking-wide leading-tight ${config.titleColor}`}>{toast.title}</p>
        {toast.message && (
          <p className="text-[11px] text-slate-300 mt-1 leading-relaxed font-medium">{toast.message}</p>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); handleDismiss(); }}
        className="shrink-0 mt-0.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        title="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ── Toast Container ────────────────────────────────────────────────────────
export function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed top-5 right-5 z-[99999] flex flex-col gap-2.5 items-end pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastItem toast={t} onRemove={removeToast} />
        </div>
      ))}
    </div>
  );
}

// ── Provider ───────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback(({ title, message = '', type = 'info', category = null, duration = 4000 }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setToasts(prev => {
      const capped = prev.length >= 5 ? prev.slice(0, 4) : prev;
      return [{ id, title, message, type, category, duration }, ...capped];
    });
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────────────
export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
