import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { useToast } from '../context/ToastContext';
import Logo from './Logo';
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
  ChevronLeft,
  LogOut,
  ShoppingBag,
  Calculator,
  Bike,
  ShoppingCart,
  PanelLeftClose,
  PanelLeftOpen,
  Menu
} from 'lucide-react';

export const ROLE_VIEWS = {
  'Super Admin': ['dashboard', 'products', 'inventory', 'billing', 'deliveries', 'suppliers', 'customers', 'employees', 'warehouse', 'accountant', 'reports', 'aiForecasting', 'settings'],
  'Branch Manager': ['dashboard', 'products', 'inventory', 'employees', 'warehouse', 'suppliers', 'accountant', 'reports', 'aiForecasting', 'settings'],
  'Inventory Manager': ['products', 'inventory', 'warehouse', 'suppliers', 'aiForecasting'],
  'Cashier': ['billing', 'products', 'customers'],
  'Supplier': ['suppliers'],
  'Customer': ['products', 'deliveries', 'aiForecasting'],
  'Warehouse Staff': ['warehouse'],
  'Delivery Partner': ['deliveries'],
  'Accountant': ['accountant', 'reports']
};

export default function Sidebar() {
  const { currentView, setCurrentView, isPendingViewChange, user, logout, sidebarCollapsed, toggleSidebar } = useApp();
  const { t } = useLanguage();
  const { playClick } = useSoundEffects();
  const { showToast } = useToast();

  const allNavItems = [
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

  const allowedViews = ROLE_VIEWS[user?.role] || ['dashboard', 'products', 'aiForecasting'];
  const navItems = allNavItems.filter(item => allowedViews.includes(item.id));

  const VIEW_LABELS = {
    dashboard: 'Dashboard', products: 'Products Catalog', inventory: 'Inventory & Stock',
    billing: 'Billing & POS', deliveries: 'Delivery Fleet & OTP', suppliers: 'Suppliers & POs',
    customers: 'Customers & CRM', employees: 'Employees & Roster', warehouse: 'Warehouse & Logistics',
    accountant: 'Accounting & GST', reports: 'Financial Reports', aiForecasting: 'AI Engine & Insights',
    settings: 'Settings',
  };

  const handleNavClick = (id) => {
    playClick();
    setCurrentView(id);
    if (id !== currentView) {
      showToast({ title: `Navigated to ${VIEW_LABELS[id] || id}`, type: 'info', duration: 2000 });
    }
  };

  const handleToggle = () => {
    playClick();
    toggleSidebar();
    showToast({
      title: sidebarCollapsed ? 'Sidebar Expanded 📂' : 'Sidebar Collapsed 📁',
      type: 'info',
      duration: 1500
    });
  };

  return (
    <aside 
      className={`relative ${sidebarCollapsed ? 'w-20' : 'w-64'} pothys-grocery-bg text-slate-700 dark:text-slate-200 flex flex-col h-screen sticky top-0 border-r border-amber-900/10 dark:border-slate-800 shadow-xl z-50 transition-all duration-300 ease-in-out select-none`}
    >
      {/* ── Outer Border Floating Toggle Button (Pixel-perfect vertical alignment with Header row) ── */}
      <button
        onClick={handleToggle}
        title={sidebarCollapsed ? "Expand Sidebar (Open)" : "Collapse Sidebar (Close)"}
        aria-label={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        className="absolute -right-3.5 top-[44px] z-50 w-7 h-7 rounded-full bg-white dark:bg-slate-900 border-2 border-emerald-600 dark:border-emerald-500 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-500 dark:hover:text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-950/20 hover:scale-115 active:scale-95 transition-all duration-200 cursor-pointer group"
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-0.5 transition-transform" />
        ) : (
          <ChevronLeft className="w-4 h-4 stroke-[2.5] group-hover:-translate-x-0.5 transition-transform" />
        )}
      </button>

      {/* Brand Header */}
      <div className={`py-4 px-3 flex flex-col items-center justify-center border-b border-amber-900/10 dark:border-slate-800 relative bg-white/40 dark:bg-slate-900/40 backdrop-blur-md transition-all duration-300`}>
        {sidebarCollapsed ? (
          <div className="flex flex-col items-center gap-1.5 cursor-pointer pt-1" onClick={handleToggle} title="Click to expand sidebar">
            <Logo 
              size="xs" 
              iconOnly={true}
            />
            <span className="text-[8px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              MART
            </span>
          </div>
        ) : (
          <Logo 
            size="lg" 
            layout="vertical"
            subtitle="GROCERY & RETAIL ERP"
            onClick={() => { playClick(); setCurrentView('dashboard'); }}
          />
        )}
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <div key={item.id} className="relative group">
              <button
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-0 py-3' : 'justify-between px-3.5 py-2.5'} rounded-2xl text-xs font-bold transition-all duration-200 relative overflow-hidden ${
                  isActive
                    ? 'bg-emerald-700 dark:bg-emerald-600 text-white font-extrabold shadow-md'
                    : 'bg-white/40 dark:bg-slate-900/30 hover:bg-white/80 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-amber-900/5 dark:border-slate-800/40'
                }`}
              >
                <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'} relative z-10`}>
                  <Icon className={`w-5 h-5 transition-all duration-200 group-hover:scale-110 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-600 dark:text-slate-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400'
                  }`} />
                  {!sidebarCollapsed && (
                    <span className="font-sans text-xs tracking-wide">{item.label}</span>
                  )}
                </div>

                {!sidebarCollapsed && (
                  <div className="flex items-center gap-1 relative z-10 shrink-0">
                    {item.badge ? (
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                        {item.badge}
                      </span>
                    ) : item.highlight ? (
                      <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded shadow-xs">
                        POS
                      </span>
                    ) : isActive ? (
                      <ChevronRight className="w-3.5 h-3.5 text-emerald-200 dark:text-emerald-300" />
                    ) : null}
                  </div>
                )}
              </button>

              {/* Floating Tooltip Label in Collapsed Mode */}
              {sidebarCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-slate-900 dark:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50 flex items-center gap-2">
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] bg-emerald-500/30 text-emerald-300 px-1.5 py-0.5 rounded font-bold">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && (
                    <span className="text-[9px] bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded font-black">
                      POS
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* User Card & Logout */}
      <div className={`p-2.5 border-t border-amber-900/10 dark:border-slate-800 bg-white/40 dark:bg-slate-950/40 backdrop-blur-md transition-all duration-300`}>
        {sidebarCollapsed ? (
          <div className="flex flex-col items-center gap-2 py-1 relative group">
            <img
              src={user?.avatar}
              alt={user?.name}
              className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500 shadow-sm cursor-pointer hover:scale-105 transition-transform"
            />
            <button
              onClick={() => {
                playClick();
                showToast({ title: 'Signed Out', message: `Goodbye, ${user?.name?.split(' ')[0]}! See you soon.`, type: 'warning', category: 'logout', duration: 3000 });
                logout();
              }}
              title="Sign Out"
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>

            {/* Profile Tooltip on Hover */}
            <div className="absolute left-full bottom-2 ml-3 px-3 py-2 bg-slate-900 dark:bg-slate-800 text-white text-xs rounded-xl shadow-xl border border-slate-700 whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-200 z-50">
              <p className="font-extrabold">{user?.name}</p>
              <p className="text-[10px] text-emerald-400 font-bold">{user?.role}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-amber-900/10 dark:border-slate-800 hover:border-emerald-300 dark:hover:border-slate-700 transition-colors shadow-sm">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={user?.avatar}
                alt={user?.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-emerald-500 shadow-sm shrink-0"
              />
              <div className="min-w-0">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate">{user?.name}</h4>
                <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold truncate">{user?.role}</p>
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
        )}
      </div>
    </aside>
  );
}
