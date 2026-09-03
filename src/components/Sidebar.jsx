import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { useToast } from '../context/ToastContext';
import { 
  LayoutDashboard, 
  Package, 
  Boxes, 
  Receipt, 
  Truck, 
  Users, 
  UserCheck, 
  Building2, 
  BarChart3, 
  Sparkles, 
  Settings,
  ChevronRight,
  LogOut,
  ShoppingBag,
  Calculator,
  Bike,
  ShoppingCart
} from 'lucide-react';

export const ROLE_VIEWS = {
  'Super Admin': ['dashboard', 'customerStorefront', 'products', 'inventory', 'billing', 'deliveries', 'suppliers', 'customers', 'employees', 'warehouse', 'accountant', 'reports', 'aiForecasting', 'settings'],
  'Branch Manager': ['dashboard', 'products', 'inventory', 'employees', 'warehouse', 'suppliers', 'accountant', 'reports', 'aiForecasting', 'settings'],
  'Inventory Manager': ['products', 'inventory', 'warehouse', 'suppliers', 'aiForecasting'],
  'Cashier': ['billing', 'products', 'customers'],
  'Supplier': ['suppliers'],
  'Customer': ['customerStorefront', 'deliveries', 'aiForecasting'],
  'Warehouse Staff': ['warehouse'],
  'Delivery Partner': ['deliveries'],
  'Accountant': ['accountant', 'reports']
};

export default function Sidebar() {
  const { currentView, setCurrentView, isPendingViewChange, user, logout } = useApp();
  const { t } = useLanguage();
  const { playClick } = useSoundEffects();
  const { showToast } = useToast();

  const allNavItems = [
    { id: 'customerStorefront', label: t('customerStorefront'), icon: ShoppingBag, badge: 'Storefront' },
    { id: 'dashboard', label: t('dashboard'), icon: LayoutDashboard },
    { id: 'products', label: t('products'), icon: Package },
    { id: 'inventory', label: t('inventory'), icon: Boxes },
    { id: 'billing', label: t('billing'), icon: Receipt, highlight: true },
    { id: 'deliveries', label: t('deliveries'), icon: Bike, badge: 'OTP Fleet' },
    { id: 'suppliers', label: t('suppliers'), icon: Truck },
    { id: 'customers', label: t('customers'), icon: Users },
    { id: 'employees', label: t('employees'), icon: UserCheck },
    { id: 'warehouse', label: t('warehouse'), icon: Building2 },
    { id: 'accountant', label: t('accountant'), icon: Calculator },
    { id: 'reports', label: t('reports'), icon: BarChart3 },
    { id: 'aiForecasting', label: t('aiForecasting'), icon: Sparkles, badge: 'AI Engine' },
    { id: 'settings', label: t('settings'), icon: Settings },
  ];

  const allowedViews = ROLE_VIEWS[user?.role] || ['customerStorefront', 'aiForecasting'];
  const navItems = allNavItems.filter(item => allowedViews.includes(item.id));


  const VIEW_LABELS = {
    dashboard: 'Dashboard', products: 'Products Catalog', inventory: 'Inventory & Stock',
    billing: 'Billing & POS', deliveries: 'Delivery Fleet & OTP', suppliers: 'Suppliers & POs',
    customers: 'Customers & CRM', employees: 'Employees & Roster', warehouse: 'Warehouse & Logistics',
    accountant: 'Accounting & GST', reports: 'Financial Reports', aiForecasting: 'AI Engine & Insights',
    settings: 'Settings', customerStorefront: 'SmartMart Pro Online Store',
  };

  const handleNavClick = (id) => {
    playClick();
    setCurrentView(id);
    if (id !== currentView) {
      showToast({ title: `Navigated to ${VIEW_LABELS[id] || id}`, type: 'info', duration: 2000 });
    }
  };

  return (
    <aside className="w-64 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 flex flex-col h-screen sticky top-0 border-r border-slate-200 dark:border-slate-800 shadow-lg dark:shadow-xl z-20 transition-all duration-300">
      
      {/* Brand Header */}
      <div className="p-5 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 relative overflow-hidden">
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-600 to-emerald-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-emerald-500/20">
            <ShoppingCart className="w-5 h-5 font-bold" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight leading-tight">
              SmartMart <span className="text-emerald-500 dark:text-emerald-400 font-black">Pro</span>
            </h1>
            <p className="text-[10px] font-extrabold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1">
              <span>RETAIL ERP v2.4</span>
              {isPendingViewChange && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 group relative overflow-hidden ${
                isActive
                  ? 'bg-emerald-500/15 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 font-extrabold border-l-4 border-emerald-500 pl-3 shadow-inner'
                  : 'hover:bg-emerald-50 dark:hover:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3 relative z-10">
                <Icon className={`w-4 h-4 transition-all duration-200 group-hover:scale-110 shrink-0 ${
                  isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 dark:group-hover:text-emerald-400'
                }`} />
                <span className="font-sans text-xs tracking-wide">{item.label}</span>
              </div>

              <div className="flex items-center gap-1 relative z-10 shrink-0">
                {item.badge ? (
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                    {item.badge}
                  </span>
                ) : item.highlight ? (
                  <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded">
                    POS
                  </span>
                ) : isActive ? (
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                ) : null}
              </div>
            </button>
          );
        })}
      </nav>

      {/* User Card & Logout */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500 shadow-sm shrink-0"
            />
            <div className="min-w-0">
              <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">{user.name}</h4>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold truncate">{user.role}</p>
            </div>
          </div>

          <button
            onClick={() => {
              playClick();
              showToast({ title: 'Signed Out', message: `Goodbye, ${user?.name?.split(' ')[0]}! See you soon.`, type: 'warning', category: 'logout', duration: 3000 });
              logout();
            }}
            title="Sign Out / Switch Role"
            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
