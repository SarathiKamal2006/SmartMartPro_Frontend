import React, { createContext, useContext, useState, useReducer, useMemo, useCallback, useTransition, useDeferredValue, useEffect } from 'react';
import api from '../services/api';
import { 
  INITIAL_USER, 
  INITIAL_PRODUCTS, 
  INITIAL_CUSTOMERS, 
  INITIAL_SUPPLIERS, 
  INITIAL_EMPLOYEES, 
  INITIAL_TRANSACTIONS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_DELIVERIES,
  INITIAL_EXPENSES,
  BRANCHES,
  BRANCH_PROFILES 
} from '../data/mockData';
import { hashPassword, generateJWT, verifyJWT, isValidEmail } from '../utils/auth';
import { useToast } from './ToastContext';
import { loadRazorpayScript, startRazorpayPayment } from '../services/paymentService';

const AppContext = createContext();

export const GLOBAL_DELETED_SKUS = new Set([
  'CHK-004', 'CHK-005', 'CHK-006',
  'TEA-001', 'COF-001', 'COF-002', 'COF-003',
  'CHE-001', 'CHE-002', 'CHE-004', 'CHE-005', 'CHE-006',
  'MAS-109', 'MAS-110', 'MAS-111', 'MAS-112'
]);

// Reducer for Cart state management (demonstrating useReducer hook)
const cartInitialState = [
  { product: INITIAL_PRODUCTS[0], quantity: 2 }, // Bananas
  { product: INITIAL_PRODUCTS[1], quantity: 1 }, // Whole Milk
  { product: INITIAL_PRODUCTS[5], quantity: 2 }, // Sourdough Bread
  { product: INITIAL_PRODUCTS[3], quantity: 4 }, // Yogurt
];

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find(item => item.product.id === action.payload.id);
      if (existing) {
        return state.map(item =>
          item.product.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...state, { product: action.payload, quantity: 1 }];
    }
    case 'UPDATE_QUANTITY': {
      return state.map(item => {
        if (item.product.id === action.payload.productId) {
          const newQty = item.quantity + action.payload.delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      }).filter(Boolean);
    }
    case 'REMOVE_ITEM':
      return state.filter(item => item.product.id !== action.payload);
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
}


export function AppProvider({ children }) {
  const { showToast } = useToast();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [jwtToken, setJwtToken] = useState('');
  const [currentView, setCurrentView] = useState('dashboard');
  const [isPendingViewChange, startViewTransition] = useTransition();

  // Simulated Database Collections
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('smartmart_sidebar_collapsed');
      return saved !== null ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('smartmart_sidebar_collapsed', JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [products, setProducts] = useState(() => 
    INITIAL_PRODUCTS.filter(p => !GLOBAL_DELETED_SKUS.has(p.sku) && !GLOBAL_DELETED_SKUS.has(p.id))
  );
  const [customers, setCustomers] = useState(INITIAL_CUSTOMERS);
  const [suppliers, setSuppliers] = useState(INITIAL_SUPPLIERS);
  const [employees, setEmployees] = useState(INITIAL_EMPLOYEES);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);

  // ── Branch-derived computed data ──
  const branchProfile = useMemo(() => {
    return BRANCH_PROFILES[selectedBranch.id] || BRANCH_PROFILES['BR-01'];
  }, [selectedBranch]);

  const branchProducts = useMemo(() => {
    const mult = branchProfile.stockMultiplier;
    return products.map(p => {
      const adjustedStock = Math.round(p.stock * mult);
      return {
        ...p,
        stock: adjustedStock,
        status: adjustedStock === 0 ? 'Out of Stock' : adjustedStock <= p.threshold ? 'Low Stock' : 'In Stock'
      };
    });
  }, [products, branchProfile]);

  const branchEmployees = useMemo(() => {
    // Match employees whose branch name includes part of the selected branch name
    const branchKeyword = selectedBranch.name.split(' ')[0]; // e.g. "Chennai", "Bengaluru"
    return employees.filter(emp => 
      emp.branch && emp.branch.toLowerCase().includes(branchKeyword.toLowerCase())
    );
  }, [employees, selectedBranch]);

  const branchExpenses = useMemo(() => {
    const branchKeyword = selectedBranch.name.split(' ')[0];
    return expenses.filter(exp => 
      exp.branch && exp.branch.toLowerCase().includes(branchKeyword.toLowerCase())
    );
  }, [expenses, selectedBranch]);

  const branchTransactions = useMemo(() => {
    // For the main branch show all transactions; for others show a subset scaled by multiplier
    if (selectedBranch.id === 'BR-01') return transactions;
    const count = Math.max(1, Math.round(transactions.length * branchProfile.stockMultiplier));
    return transactions.slice(0, count).map(t => ({
      ...t,
      amount: Math.round(t.amount * branchProfile.stockMultiplier)
    }));
  }, [transactions, selectedBranch, branchProfile]);
  const [deliveries, setDeliveries] = useState(INITIAL_DELIVERIES);

  // Procurement States
  const [purchaseRequests, setPurchaseRequests] = useState([
    { id: "REQ-001", productId: "PRD-284", productName: "Organic Fresh Bananas", quantity: 100, supplierId: "SUP-02", supplierName: "Green Valley Organic Farms (Coimbatore)", status: "Pending Approval" }
  ]);
  const [purchaseOrders, setPurchaseOrders] = useState([
    { id: "PO-1025", productId: "DY-401", productName: "A2 Fresh Whole Milk 1L", quantity: 50, supplierId: "SUP-01", supplierName: "Aavin Dairy Co-op (Madurai)", status: "Pending Acceptance", amount: 3400.00 }
  ]);

  // Registered Users (Simulated Database Table with Hashed Passwords)
  const [registeredUsers, setRegisteredUsers] = useState(() => {
    // Populate base users from mock data and add default credentials
    const baseUsers = [
      { id: "USR-001", name: "Sarathi Kamal N", email: "admin@smartmart.pro", passwordHash: hashPassword("admin123"), role: "Super Admin", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80", branch: "Chennai Central Superstore (Main)" },
      { id: "USR-002", name: "Sarah Jenkins", email: "manager@smartmart.pro", passwordHash: hashPassword("manager123"), role: "Branch Manager", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80", branch: "Chennai Central Superstore (Main)" },
      { id: "USR-003", name: "Marcus Sterling", email: "inventory@smartmart.pro", passwordHash: hashPassword("inventory123"), role: "Inventory Manager", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80", branch: "Chennai Central Superstore (Main)" },
      { id: "USR-004", name: "Elena Rostova", email: "cashier@smartmart.pro", passwordHash: hashPassword("cashier123"), role: "Cashier", avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=200&q=80", branch: "Chennai Central Superstore (Main)" },
      { id: "USR-005", name: "S. Murugan", email: "supplier@smartmart.pro", passwordHash: hashPassword("supplier123"), role: "Supplier", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80", branch: "Coimbatore Warehouse" },
      { id: "USR-006", name: "Amira Patel", email: "delivery@smartmart.pro", passwordHash: hashPassword("delivery123"), role: "Delivery Partner", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80", branch: "Chennai Central Superstore (Main)" },
      { id: "USR-007", name: "David Kim", email: "warehouse@smartmart.pro", passwordHash: hashPassword("warehouse123"), role: "Warehouse Staff", avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80", branch: "Chennai Central Superstore (Main)" },
      { id: "USR-008", name: "Michael Chang", email: "accountant@smartmart.pro", passwordHash: hashPassword("accountant123"), role: "Accountant", avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80", branch: "Chennai Central Superstore (Main)" }
    ];
    
    // Add customers to registration database
    INITIAL_CUSTOMERS.forEach(cust => {
      baseUsers.push({
        id: cust.id,
        name: cust.name,
        email: cust.email,
        phone: cust.phone,
        passwordHash: hashPassword("customer123"),
        role: "Customer",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        walletBalance: cust.wallet,
        loyaltyPoints: cust.points
      });
    });

    return baseUsers;
  });

  // Cart state via useReducer
  const [cart, dispatchCart] = useReducer(cartReducer, cartInitialState);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState({ code: 'FRESH10', discount: 10.00 });
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [activeInvoice, setActiveInvoice] = useState(null);

  // UI Drawers & Modals
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [razorpayModalOpen, setRazorpayModalOpen] = useState(false);
  const [razorpayOrderDetails, setRazorpayOrderDetails] = useState(null);
  
  // Search Term
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);

  // Store Settings (reactive across entire app)
  const DEFAULT_STORE_SETTINGS = {
    storeName: 'SmartMart Pro Supermarket',
    tagline: 'Fresh Organic Groceries & Supermarket ERP',
    email: 'contact@smartmart.pro',
    phone: '+91 98401 23456',
    address: '14 Anna Salai, T. Nagar, Chennai - 600017, Tamil Nadu',
    currency: 'INR (₹) - Indian Rupee',
    timezone: 'Asia/Kolkata (IST +05:30)',
    operatingHours: '07:00 AM - 11:00 PM (Mon - Sun)',
    lowStockThreshold: 15,
    taxRate: 18,
    gstin: '33AAACS1429B1ZB',
    legalBusinessName: 'SmartMart Pro Supermarket Private Limited',
    stateRegistration: 'Tamil Nadu (State Code: 33)',
    taxInvoicePrefix: 'SMP/2026/INV-',
    taxInclusive: true,
    hsnPrint: true,
    paymentMethods: { cod: true, upi: true, card: true, wallet: true, netbanking: true },
    notifications: { emailAlerts: true, smsAlerts: true, pushAlerts: true },
    appearance: { accentColor: 'emerald', compactMode: false, soundEnabled: true }
  };

  const [storeSettings, setStoreSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('smartmart_store_settings');
      return cached ? { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(cached) } : DEFAULT_STORE_SETTINGS;
    } catch (e) {
      return DEFAULT_STORE_SETTINGS;
    }
  });

  const currencySymbol = useMemo(() => {
    const cur = storeSettings?.currency || 'INR (₹)';
    if (cur.includes('$')) return '$';
    if (cur.includes('€')) return '€';
    if (cur.includes('£')) return '£';
    if (cur.includes('د.إ') || cur.includes('AED')) return 'AED ';
    return '₹';
  }, [storeSettings?.currency]);

  const updateStoreSettings = useCallback((newSettings) => {
    setStoreSettings(prev => {
      const merged = { ...prev, ...newSettings };
      try {
        localStorage.setItem('smartmart_store_settings', JSON.stringify(merged));
      } catch (e) {}
      return merged;
    });
  }, []);

  // Sync state with MongoDB Atlas backend on startup
  useEffect(() => {
    async function syncWithBackend() {
      try {
        const setRes = await api.settings.get();
        if (setRes && setRes.success && setRes.data) {
          updateStoreSettings(setRes.data);
        }

        const prodRes = await api.products.getAll();
        if (prodRes && prodRes.success && Array.isArray(prodRes.data) && prodRes.data.length > 0) {
          setProducts(prodRes.data
            .filter(p => !GLOBAL_DELETED_SKUS.has(p.sku) && !GLOBAL_DELETED_SKUS.has(p.id))
            .map(p => ({
              ...p,
              id: p._id || p.sku || p.id,
              threshold: p.threshold || 10,
              status: p.stock === 0 ? 'Out of Stock' : p.stock <= (p.threshold || 10) ? 'Low Stock' : 'In Stock'
            }))
          );
        }

        const custRes = await api.customers.getAll();
        if (custRes && custRes.success && Array.isArray(custRes.data)) {
          setCustomers(custRes.data.map(c => ({
            ...c,
            id: c._id || c.id,
            wallet: c.walletBalance !== undefined ? c.walletBalance : 1000,
            points: c.loyaltyPoints !== undefined ? c.loyaltyPoints : 0,
            totalSpent: c.totalSpent || 0,
            tier: c.totalSpent > 30000 ? 'Gold' : c.totalSpent > 10000 ? 'Silver' : 'Bronze'
          })));
        }

        const suppRes = await api.suppliers.getAll();
        if (suppRes && suppRes.success && Array.isArray(suppRes.data) && suppRes.data.length > 0) {
          setSuppliers(suppRes.data.map(s => ({
            ...s,
            id: s._id || s.supplierId || s.id,
            contact: s.contactPerson || s.contact
          })));
        }

        const empRes = await api.users.getAll();
        if (empRes && empRes.success && Array.isArray(empRes.data) && empRes.data.length > 0) {
          setEmployees(empRes.data.map(e => ({
            ...e,
            id: e._id || e.id
          })));
        }

        const orderRes = await api.orders.getAll();
        if (orderRes && orderRes.success && Array.isArray(orderRes.data) && orderRes.data.length > 0) {
          setTransactions(orderRes.data.map(o => ({
            id: o.orderId || o._id,
            customer: o.customerName || 'Customer',
            amount: o.total,
            status: o.status === 'Cancelled' ? 'Pending' : 'Completed',
            date: new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            items: o.items ? o.items.length : 1,
            paymentMethod: o.paymentMethod || 'Cash'
          })));
        }

        const poRes = await api.purchaseOrders.getAll();
        if (poRes && poRes.success && Array.isArray(poRes.data) && poRes.data.length > 0) {
          setPurchaseOrders(poRes.data.map(po => ({
            id: po.poNumber || po._id,
            _id: po._id,
            productId: po.items && po.items[0] ? po.items[0].sku : '',
            productName: po.items && po.items[0] ? po.items[0].productName : 'PO Items',
            quantity: po.items && po.items[0] ? po.items[0].qty : 1,
            supplierId: po.supplierId,
            supplierName: po.supplierName,
            status: po.status,
            amount: po.totalCost
          })));
        }
      } catch (e) {
        console.log('Backend sync note:', e.message);
      }
    }

    syncWithBackend();
  }, [updateStoreSettings]);

  // Check JWT simulation on startup
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      const decoded = verifyJWT(token);
      if (decoded) {
        setUser(decoded);
        setJwtToken(token);
        setIsAuthenticated(true);
        // Load default view for role
        if (decoded.role === 'Customer') {
          setCurrentView('products');
        } else if (decoded.role === 'Cashier') {
          setCurrentView('billing');
        } else if (decoded.role === 'Delivery Partner') {
          setCurrentView('deliveries');
        } else if (decoded.role === 'Warehouse Staff') {
          setCurrentView('warehouse');
        } else if (decoded.role === 'Supplier') {
          setCurrentView('suppliers');
        } else if (decoded.role === 'Accountant') {
          setCurrentView('accountant');
        } else {
          setCurrentView('dashboard');
        }
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }, []);

  // Auth Methods
  const login = useCallback((role, email, name) => {
    // Direct login used by quick login buttons
    const matchedUser = registeredUsers.find(u => u.role === role) || registeredUsers[0];
    const payload = {
      id: matchedUser.id,
      name: name || matchedUser.name,
      email: email || matchedUser.email,
      role: role,
      avatar: matchedUser.avatar,
      branch: matchedUser.branch || 'Chennai Central Superstore (Main)',
      walletBalance: matchedUser.walletBalance || 4500.00,
      loyaltyPoints: matchedUser.loyaltyPoints || 340
    };
    const token = generateJWT(payload);
    localStorage.setItem('auth_token', token);
    setUser(payload);
    setJwtToken(token);
    setIsAuthenticated(true);
    
    if (role === 'Customer') {
      setCurrentView('products');
    } else if (role === 'Cashier') {
      setCurrentView('billing');
    } else if (role === 'Delivery Partner') {
      setCurrentView('deliveries');
    } else if (role === 'Warehouse Staff') {
      setCurrentView('warehouse');
    } else if (role === 'Supplier') {
      setCurrentView('suppliers');
    } else if (role === 'Accountant') {
      setCurrentView('accountant');
    } else {
      setCurrentView('dashboard');
    }
  }, [registeredUsers]);

  const loginWithCredentials = useCallback(async (email, password) => {
    // First try backend login for registered customers
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        const payload = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          avatar: data.user.avatar,
          branch: 'Chennai Central Superstore (Main)',
          walletBalance: data.user.walletBalance || 2000,
          loyaltyPoints: data.user.loyaltyPoints || 0
        };
        localStorage.setItem('auth_token', data.token);
        setUser(payload);
        setJwtToken(data.token);
        setIsAuthenticated(true);
        setCurrentView('products');
        return { success: true };
      }
    } catch (err) {
      // Backend not available — fall through to local auth
      console.log('Backend auth unavailable, using local auth');
    }

    // Fallback: local hardcoded user auth (admin, staff, etc.)
    const matchedUser = registeredUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!matchedUser) {
      return { success: false, message: 'Invalid credentials. User does not exist.' };
    }
    const hashed = hashPassword(password);
    if (matchedUser.passwordHash !== hashed) {
      return { success: false, message: 'Incorrect password.' };
    }

    const payload = {
      id: matchedUser.id,
      name: matchedUser.name,
      email: matchedUser.email,
      role: matchedUser.role,
      avatar: matchedUser.avatar,
      branch: matchedUser.branch || 'Chennai Central Superstore (Main)',
      walletBalance: matchedUser.walletBalance || 4500.00,
      loyaltyPoints: matchedUser.loyaltyPoints || 340
    };
    const token = generateJWT(payload);
    localStorage.setItem('auth_token', token);
    setUser(payload);
    setJwtToken(token);
    setIsAuthenticated(true);

    if (matchedUser.role === 'Customer') {
      setCurrentView('products');
    } else if (matchedUser.role === 'Cashier') {
      setCurrentView('billing');
    } else if (matchedUser.role === 'Delivery Partner') {
      setCurrentView('deliveries');
    } else if (matchedUser.role === 'Warehouse Staff') {
      setCurrentView('warehouse');
    } else if (matchedUser.role === 'Supplier') {
      setCurrentView('suppliers');
    } else if (matchedUser.role === 'Accountant') {
      setCurrentView('accountant');
    } else {
      setCurrentView('dashboard');
    }

    return { success: true };
  }, [registeredUsers]);

  const loginWithGoogle = useCallback(async (customEmail, customPassword, customName) => {
    const userEmail = customEmail || 'ananya.s@gmail.com';
    const rawName = customName || (customEmail ? customEmail.split('@')[0].replace(/[^a-zA-Z]/g, ' ') : 'Ananya Sundaram');
    const userName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

    try {
      const res = await api.auth.oauth({
        provider: 'Google',
        email: userEmail,
        password: customPassword,
        name: userName,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
      });
      if (res && res.success) {
        localStorage.setItem('auth_token', res.token);
        localStorage.setItem('smartmart_token', res.token);
        const payload = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          role: res.user.role || 'Customer',
          avatar: res.user.avatar,
          branch: res.user.branch || 'Chennai Central Superstore (Main)',
          walletBalance: res.user.walletBalance || 2000,
          loyaltyPoints: res.user.loyaltyPoints || 100
        };
        setUser(payload);
        setJwtToken(res.token);
        setIsAuthenticated(true);
        setCurrentView('products');
        return { success: true, user: payload };
      }
    } catch (err) {
      console.log('Backend Google OAuth failed, using local fallback:', err.message);
    }

    // Local fallback if backend is unreachable
    const payload = {
      id: `CUST-GOOGLE-${Date.now().toString().slice(-4)}`,
      name: userName,
      email: userEmail,
      role: 'Customer',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      branch: 'Chennai Central Superstore (Main)',
      walletBalance: 2000.00,
      loyaltyPoints: 100
    };
    const token = generateJWT(payload);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('smartmart_token', token);
    setUser(payload);
    setJwtToken(token);
    setIsAuthenticated(true);
    setCurrentView('products');
    return { success: true, user: payload };
  }, []);

  const registerCustomer = useCallback(async (name, email, phone, password) => {
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password })
      });
      const data = await res.json();
      return data;
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, message: 'Server not reachable. Make sure the backend is running.' };
    }
  }, []);

  const completeCustomerRegistration = useCallback(async (email, otp) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();

      if (data.success) {
        const payload = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          avatar: data.user.avatar,
          branch: 'Chennai Central Superstore (Main)',
          walletBalance: data.user.walletBalance || 2000,
          loyaltyPoints: data.user.loyaltyPoints || 0
        };
        localStorage.setItem('auth_token', data.token);
        setUser(payload);
        setJwtToken(data.token);
        setIsAuthenticated(true);
        setCurrentView('products');

        // Also add to local customers list for UI display
        setCustomers(prev => [...prev, {
          id: data.user.id,
          name: data.user.name,
          phone: data.user.phone,
          email: data.user.email,
          totalSpent: 0,
          points: 0,
          lastVisit: 'Just registered',
          tier: 'Bronze',
          wallet: 2000.00
        }]);
      }

      return data;
    } catch (err) {
      console.error('OTP verification error:', err);
      return { success: false, message: 'Server not reachable. Make sure the backend is running.' };
    }
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    try {
      const res = await api.auth.forgotPassword({ email });
      return res;
    } catch (err) {
      console.log('Backend forgot-password error, using local fallback:', err.message);
      const cleanEmail = email.toLowerCase().trim();
      const exists = registeredUsers.some(u => u.email.toLowerCase() === cleanEmail);
      if (!exists && cleanEmail !== 'ananya.s@gmail.com' && cleanEmail !== 'admin@smartmart.pro') {
        return { success: false, message: 'No registered user found with this email address.' };
      }
      return { success: true, message: `Password reset code sent to ${cleanEmail}` };
    }
  }, [registeredUsers]);

  const confirmPasswordReset = useCallback(async (email, otp, newPassword) => {
    try {
      const res = await api.auth.resetPassword({ email, otp, newPassword });
      return res;
    } catch (err) {
      console.log('Backend reset-password error, using local fallback:', err.message);
      const cleanEmail = email.toLowerCase().trim();
      setRegisteredUsers(prev => prev.map(u => {
        if (u.email.toLowerCase() === cleanEmail) {
          return { ...u, passwordHash: hashPassword(newPassword) };
        }
        return u;
      }));
      return { success: true, message: 'Password updated successfully! You can now log in.' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    setUser(null);
    setJwtToken('');
    setIsAuthenticated(false);
  }, []);

  // Navigation
  const changeView = useCallback((viewName) => {
    startViewTransition(() => {
      setCurrentView(viewName);
    });
  }, []);

  // Role-Targeted Notification Dispatcher
  const addNotification = useCallback((notifData) => {
    const newNotif = {
      id: notifData.id || `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      title: notifData.title,
      description: notifData.description,
      time: notifData.time || "Just now",
      type: notifData.type || "Orders",
      targetRoles: notifData.targetRoles || ["Customer", "Super Admin", "Store Manager"],
      customerEmail: notifData.customerEmail,
      isNew: notifData.isNew !== undefined ? notifData.isNew : true
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  // Cart Dispatchers
  const addToCart = useCallback((product) => {
    dispatchCart({ type: 'ADD_ITEM', payload: product });
    showToast({
      title: `${product.name} added to basket! 🛒`,
      message: `₹${Number(product.price || 0).toFixed(2)} • Added to your shopping basket`,
      type: 'success',
      category: 'cart',
      duration: 3000
    });

    // Customer-exclusive notification: Item Added to Basket
    addNotification({
      title: `Added to Shopping Basket 🛒`,
      description: `${product.name} (1 unit • ₹${Number(product.price || 0).toFixed(2)}) was added to your grocery basket.`,
      type: 'Orders',
      targetRoles: ['Customer'],
      customerEmail: user?.email || 'ananya.s@gmail.com',
      isNew: true
    });
  }, [showToast, user, addNotification]);

  const updateCartQuantity = useCallback((productId, delta) => {
    dispatchCart({ type: 'UPDATE_QUANTITY', payload: { productId, delta } });
    if (delta > 0) {
      showToast({ title: 'Basket Updated 🛒', message: 'Quantity increased (+1)', type: 'info', category: 'cart', duration: 1800 });
    } else {
      showToast({ title: 'Basket Updated 🛒', message: 'Quantity decreased (-1)', type: 'info', category: 'cart', duration: 1800 });
    }
  }, [showToast]);

  const removeFromCart = useCallback((productId) => {
    const item = cart.find(i => i.product.id === productId);
    dispatchCart({ type: 'REMOVE_ITEM', payload: productId });
    showToast({
      title: item ? `Removed ${item.product.name}` : 'Item removed from basket',
      message: 'Removed from shopping basket',
      type: 'warning',
      category: 'cart',
      duration: 2500
    });
  }, [cart, showToast]);

  const clearCart = useCallback(() => {
    dispatchCart({ type: 'CLEAR_CART' });
    showToast({
      title: 'Basket Cleared 🗑️',
      message: 'All items removed from your basket',
      type: 'info',
      category: 'cart',
      duration: 2200
    });
  }, [showToast]);

  // Billing calculations
  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const gst = subtotal * 0.18;
    const discount = appliedCoupon ? appliedCoupon.discount : 0;
    const grandTotal = Math.max(0, subtotal + gst - discount);
    return { subtotal, gst, discount, grandTotal };
  }, [cart, appliedCoupon]);

  // Stock alert threshold checks (Staff/Admin ONLY - Never sent to Customer)
  const checkStockAlerts = useCallback((updatedProducts) => {
    updatedProducts.forEach(p => {
      const reorderLevel = p.threshold;
      const criticalLevel = Math.floor(p.threshold / 2);
      
      if (p.stock <= criticalLevel && p.stock >= 0) {
        // Red alert
        const redNotif = {
          id: `crit-alert-${p.id}-${Date.now()}`,
          title: `🔴 Critical Stock Alert: ${p.name}`,
          description: `SKU '${p.sku}' stock has fallen to CRITICAL level of ${p.stock} ${p.unit}s (Critical Limit: ${criticalLevel}). Please submit an immediate reorder.`,
          time: "Just now",
          type: "Stock Alerts",
          targetRoles: ["Super Admin", "Store Manager", "Branch Manager", "Inventory Manager", "Warehouse Staff"],
          isNew: true
        };
        setNotifications(prev => [redNotif, ...prev]);
      } else if (p.stock <= reorderLevel && p.stock >= 0) {
        // Orange alert
        const orangeNotif = {
          id: `reorder-alert-${p.id}-${Date.now()}`,
          title: `🟠 Low Stock Alert: ${p.name}`,
          description: `SKU '${p.sku}' stock is low (${p.stock} ${p.unit}s remaining). Reorder Threshold: ${reorderLevel}. Request procurement.`,
          time: "Just now",
          type: "Stock Alerts",
          targetRoles: ["Super Admin", "Store Manager", "Branch Manager", "Inventory Manager", "Warehouse Staff"],
          isNew: true
        };
        setNotifications(prev => [orangeNotif, ...prev]);
      }
    });
  }, []);

  // Complete checkout (Supports Cash, Card, UPI, Wallet, and Razorpay)
  const completeCheckout = useCallback(async (paymentDetails = null) => {
    const finalMethod = paymentDetails?.method || (paymentMethod === 'Razorpay' ? 'Razorpay (Online)' : paymentMethod);
    const invoiceId = `#TRX-${Math.floor(1000 + Math.random() * 9000)}`;

    // Sync order with backend MongoDB Atlas
    try {
      await api.orders.create({
        orderId: invoiceId,
        customerName: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
        customerEmail: selectedCustomer ? selectedCustomer.email : '',
        phone: selectedCustomer ? selectedCustomer.phone : '',
        items: cart.map(i => ({
          productId: i.product.id || i.product._id,
          sku: i.product.sku,
          name: i.product.name,
          quantity: i.quantity,
          price: i.product.price,
          unit: i.product.unit || 'kg'
        })),
        paymentMethod: finalMethod,
        paymentId: paymentDetails?.paymentId,
        razorpayOrderId: paymentDetails?.orderId,
        type: 'POS',
        branch: selectedBranch.name,
        discount: cartTotals.discount
      });
    } catch (e) {
      console.warn('API order creation note:', e.message);
    }

    const newTx = {
      id: invoiceId,
      customer: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
      amount: cartTotals.grandTotal,
      status: 'Completed',
      date: 'Just now',
      items: cart.length,
      paymentMethod: finalMethod,
      details: {
        cartItems: [...cart],
        subtotal: cartTotals.subtotal,
        gst: cartTotals.gst,
        discount: cartTotals.discount,
        grandTotal: cartTotals.grandTotal,
        branch: selectedBranch.name,
        cashier: user?.name || ' Elena Rostova',
        razorpayPaymentId: paymentDetails?.paymentId,
        razorpayOrderId: paymentDetails?.orderId,
        razorpaySignature: paymentDetails?.signature,
        isRazorpayVerified: Boolean(paymentDetails?.paymentId)
      }
    };

    // Deduct stock levels in products database
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(item => item.product.id === p.id || item.product._id === p.id);
      if (cartItem) {
        const newStock = Math.max(0, p.stock - cartItem.quantity);
        return {
          ...p,
          stock: newStock,
          status: newStock === 0 ? 'Out of Stock' : newStock <= p.threshold ? 'Low Stock' : 'In Stock'
        };
      }
      return p;
    });

    setProducts(updatedProducts);
    setTransactions(prev => [newTx, ...prev]);
    setActiveInvoice(newTx);

    // If customer selected, add loyalty reward points (1 point per ₹100 spent)
    if (selectedCustomer) {
      const addedPoints = Math.floor(cartTotals.grandTotal / 100);
      setCustomers(prev => prev.map(c => {
        if (c.id === selectedCustomer.id) {
          const updatedPoints = c.points + addedPoints;
          const updatedSpent = c.totalSpent + cartTotals.grandTotal;
          const updatedTier = updatedSpent > 30000 ? 'Gold' : updatedSpent > 10000 ? 'Silver' : 'Bronze';
          return {
            ...c,
            points: updatedPoints,
            totalSpent: updatedSpent,
            tier: updatedTier,
            lastVisit: "Just now"
          };
        }
        return c;
      }));
    }

    checkStockAlerts(updatedProducts);
    clearCart();

    showToast({
      title: paymentDetails?.paymentId ? 'Razorpay Payment Verified! ⚡' : 'POS Bill Generated! 🧾',
      message: `Invoice ${invoiceId} generated. Total: ₹${cartTotals.grandTotal.toFixed(2)} (${finalMethod})`,
      type: 'success',
      category: 'cart',
      duration: 5000
    });
  }, [selectedCustomer, cart, paymentMethod, selectedBranch, cartTotals, user, products, checkStockAlerts, clearCart, showToast]);

  // Initiate Razorpay checkout for POS or Online customer payment
  const initiateRazorpayPOSCheckout = useCallback(async () => {
    if (cart.length === 0) return;

    setRazorpayOrderDetails({
      amount: cartTotals.grandTotal,
      customer: selectedCustomer || { name: 'Walk-in Customer' },
      orderId: `order_pos_${Date.now()}`
    });

    try {
      const configRes = await fetch('/api/payment/config').then(r => r.json()).catch(() => null);
      const keyId = configRes?.keyId || '';
      const isLoaded = await loadRazorpayScript();

      // If user configured a real Razorpay account key, launch external popup
      if (keyId && keyId.startsWith('rzp_') && !keyId.includes('SmartMart') && keyId.length >= 18 && isLoaded && window.Razorpay) {
        startRazorpayPayment({
          amount: cartTotals.grandTotal,
          customer: {
            name: selectedCustomer?.name || 'Walk-in Customer',
            email: selectedCustomer?.email || 'customer@smartmart.pro',
            phone: selectedCustomer?.phone || '+91 98401 23456'
          },
          description: `SmartMart Pro POS Bill (${cart.length} items)`,
          onSuccess: (details) => {
            completeCheckout(details);
          },
          onError: () => {
            setRazorpayModalOpen(true);
          }
        });
      } else {
        // Open authentic Razorpay Standard Checkout modal
        setRazorpayModalOpen(true);
      }
    } catch (err) {
      setRazorpayModalOpen(true);
    }
  }, [cart, cartTotals, selectedCustomer, completeCheckout]);

  // Online checkout
  const completeOnlineCheckout = useCallback((checkoutPayload, legacyGateway) => {
    if (cart.length === 0) return null;
    const orderId = `#ORD-${Math.floor(8000 + Math.random() * 2000)}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    let shippingAddress = "14 Anna Salai, T. Nagar, Chennai - 600017";
    let customerName = user?.name || "Ananya Sundaram";
    let customerPhone = "+91 98401 23456";
    let customerEmail = user?.email || "ananya.s@gmail.com";
    let gateway = legacyGateway || "Wallet";
    let branch = "SmartMart Pro Central (Main)";
    let deliveryNotes = "";

    if (typeof checkoutPayload === 'object' && checkoutPayload !== null) {
      shippingAddress = checkoutPayload.customerAddress || checkoutPayload.shippingAddress || shippingAddress;
      customerName = checkoutPayload.customerName || customerName;
      customerPhone = checkoutPayload.customerPhone || customerPhone;
      customerEmail = checkoutPayload.customerEmail || customerEmail;
      gateway = checkoutPayload.paymentMethod || checkoutPayload.gateway || gateway;
      branch = checkoutPayload.selectedBranch || checkoutPayload.branch || branch;
      deliveryNotes = checkoutPayload.deliveryNotes || "";
    } else if (typeof checkoutPayload === 'string') {
      shippingAddress = checkoutPayload;
    }

    const originAddress = branch.includes('Bengaluru')
      ? 'SmartMart Express Hub, 102 MG Road, Indiranagar, Bengaluru - 560038'
      : branch.includes('Mumbai')
      ? 'SmartMart Superstore, 45 Hill Road, Bandra West, Mumbai - 400050'
      : 'SmartMart Pro Central Hub, 120 Anna Salai, T. Nagar, Chennai - 600017';

    // Deduct stock
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(item => item.product.id === p.id);
      if (cartItem) {
        const newStock = Math.max(0, p.stock - cartItem.quantity);
        return {
          ...p,
          stock: newStock,
          status: newStock === 0 ? 'Out of Stock' : newStock <= p.threshold ? 'Low Stock' : 'In Stock'
        };
      }
      return p;
    });

    setProducts(updatedProducts);

    // Create delivery partner item
    const newDelivery = {
      id: `DEL-${Math.floor(800 + Math.random() * 200)}`,
      orderId: orderId,
      customer: customerName,
      customerName: customerName,
      address: shippingAddress,
      deliveryAddress: shippingAddress,
      phone: customerPhone,
      customerPhone: customerPhone,
      email: customerEmail,
      customerEmail: customerEmail,
      branch: branch,
      originBranch: branch,
      originAddress: originAddress,
      deliveryNotes: deliveryNotes,
      items: cart.length,
      amount: `₹${cartTotals.grandTotal.toFixed(2)}`,
      totalAmount: cartTotals.grandTotal,
      status: "In Transit",
      otp: otp,
      deliveryOtp: otp,
      driver: "Amira Patel",
      partnerName: "Amira Patel",
      driverPhone: "+91 98842 00924",
      vehicleNo: "TN-01-BK-2024 (Smart EV Bike)",
      time: "10 mins away",
      estimatedTime: "10 Mins",
      distanceKm: 2.4,
      speedKmH: 32,
      progress: 25,
      createdAt: new Date().toISOString()
    };

    setDeliveries(prev => [newDelivery, ...prev]);

    // Save structured customer address to profile memory & localStorage (Method 3)
    try {
      localStorage.setItem('smartmart_saved_customer_address', JSON.stringify({
        customerName,
        customerPhone,
        customerEmail,
        customerAddress: shippingAddress,
        branch,
        deliveryNotes
      }));
      if (user) {
        setUser(prev => ({ ...prev, address: shippingAddress, phone: customerPhone }));
      }
    } catch (e) {
      console.log('Error saving customer address to memory:', e);
    }

    // Record Transaction
    const newTx = {
      id: orderId,
      customer: customerName,
      amount: cartTotals.grandTotal,
      status: 'Completed',
      date: 'Just now',
      items: cart.length,
      paymentMethod: `Online Gateway (${gateway})`
    };
    setTransactions(prev => [newTx, ...prev]);

    // Award loyalty points
    const addedPoints = Math.floor(cartTotals.grandTotal / 100);
    setCustomers(prev => prev.map(c => {
      if (c.email.toLowerCase() === customerEmail.toLowerCase()) {
        return {
          ...c,
          points: c.points + addedPoints,
          totalSpent: c.totalSpent + cartTotals.grandTotal,
          tier: (c.totalSpent + cartTotals.grandTotal) > 30000 ? 'Gold' : (c.totalSpent + cartTotals.grandTotal) > 10000 ? 'Silver' : 'Bronze',
          lastVisit: "Just now"
        };
      }
      return c;
    }));

    // Update user wallet balance if wallet payment chosen
    if (gateway === 'Wallet' || gateway === 'wallet') {
      setUser(prev => ({
        ...prev,
        walletBalance: Math.max(0, (prev?.walletBalance || 4500) - cartTotals.grandTotal)
      }));
      setRegisteredUsers(prev => prev.map(u => {
        if (u.email === user?.email) {
          return { ...u, walletBalance: Math.max(0, (u.walletBalance || 4500) - cartTotals.grandTotal) };
        }
        return u;
      }));
    }

    // Trigger Alerts
    checkStockAlerts(updatedProducts);
    clearCart();

    // Create system notification
    const orderNotif = {
      id: `order-notif-${orderId}`,
      title: `🛍️ New Online Order Placed: ${orderId}`,
      description: `Order total: ₹${cartTotals.grandTotal.toFixed(2)}. Out for delivery with driver Amira Patel. OTP: ${otp}`,
      time: "Just now",
      type: "Deliveries",
      isNew: true
    };
    setNotifications(prev => [orderNotif, ...prev]);

    showToast({
      title: 'Order Placed! Live Tracking Active 🛵',
      message: `Order ${orderId} dispatched! Security OTP: ${otp}. Live GPS telemetry started.`,
      type: 'success',
      category: 'cart',
      duration: 6000
    });

    return newDelivery;
  }, [cartTotals, cart, user, products, clearCart, checkStockAlerts, showToast]);

  // OTP Delivery Verification
  const verifyDeliveryOTP = useCallback((deliveryId, enteredOtp) => {
    const del = deliveries.find(d => d.id === deliveryId);
    if (!del) return { success: false, message: "Delivery order not found." };
    
    if (del.otp === enteredOtp) {
      setDeliveries(prev => prev.map(d => 
        d.id === deliveryId 
          ? { ...d, status: "Delivered", time: "Delivered just now" } 
          : d
      ));
      
      // Notify customer
      const delNotif = {
        id: `del-verify-${deliveryId}`,
        title: `✅ Order Delivered: ${del.orderId}`,
        description: `Order ${del.orderId} successfully verified with OTP and delivered by fleet driver ${del.driver}.`,
        time: "Just now",
        type: "Deliveries",
        isNew: true
      };
      setNotifications(prev => [delNotif, ...prev]);

      showToast({
        title: 'Delivery Completed! 🛵',
        message: `Order ${del.orderId} delivered and verified with OTP.`,
        type: 'success',
        category: 'delivery',
        duration: 4000
      });
      return { success: true };
    } else {
      showToast({
        title: 'Verification Failed ❌',
        message: 'Invalid OTP code entered. Verification failed.',
        type: 'error',
        category: 'delivery',
        duration: 4000
      });
      return { success: false, message: "Invalid OTP. Verification failed." };
    }
  }, [deliveries, showToast]);

  // Product reviews
  const submitReview = useCallback((productId, rating, reviewText) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        // update review rating
        const oldRating = p.rating || 4.7;
        const newRating = parseFloat(((oldRating + rating) / 2).toFixed(1));
        return {
          ...p,
          rating: newRating,
          discount: p.discount || "REVIEWED"
        };
      }
      return p;
    }));
  }, []);

  // Procurement Flow: Create Purchase Request
  const createPurchaseRequest = useCallback((productId, quantity, supplierId, unitCost, purchaseSource) => {
    const prod = products.find(p => p.id === productId);
    const supp = suppliers.find(s => s.id === supplierId);
    if (!prod || !supp) return;

    const reqId = `REQ-${Math.floor(100 + Math.random() * 900)}`;
    const totalAmount = unitCost ? unitCost * quantity : prod.price * 0.6 * quantity;
    const newReq = {
      id: reqId,
      productId: prod.id,
      productName: prod.name,
      quantity,
      supplierId: supp.id,
      supplierName: supp.name,
      unitCost: unitCost || prod.price * 0.6,
      totalAmount,
      purchaseSource: purchaseSource || supp.name,
      status: "Pending Approval"
    };

    setPurchaseRequests(prev => [newReq, ...prev]);

    // Send notification
    const reqNotif = {
      id: `req-notif-${reqId}`,
      title: `🟠 Purchase Request Created: ${reqId}`,
      description: `Reorder request for ${quantity} units of ${prod.name} from ${purchaseSource || supp.name} (₹${totalAmount.toFixed(2)} total). Awaiting Branch Manager approval.`,
      time: "Just now",
      type: "Stock Alerts",
      isNew: true
    };
    setNotifications(prev => [reqNotif, ...prev]);
  }, [products, suppliers]);

  // Procurement Flow: Approve Purchase Request
  const approvePurchaseRequest = useCallback((reqId) => {
    const req = purchaseRequests.find(r => r.id === reqId);
    if (!req) return;

    const prod = products.find(p => p.id === req.productId);
    const poId = `PO-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // cost calculation: 60% of consumer price
    const unitCost = prod ? prod.price * 0.6 : 50;
    const amount = unitCost * req.quantity;

    const newPO = {
      id: poId,
      productId: req.productId,
      productName: req.productName,
      quantity: req.quantity,
      supplierId: req.supplierId,
      supplierName: req.supplierName,
      status: "Pending Acceptance",
      amount
    };

    setPurchaseRequests(prev => prev.filter(r => r.id !== reqId));
    setPurchaseOrders(prev => [newPO, ...prev]);

    // Send notification to supplier & manager
    const poNotif = {
      id: `po-notif-${poId}`,
      title: `📄 Purchase Order Issued: ${poId}`,
      description: `PO for ${req.quantity} units of ${req.productName} (₹${amount.toFixed(2)}) sent to ${req.supplierName}.`,
      time: "Just now",
      type: "Stock Alerts",
      isNew: true
    };
    setNotifications(prev => [poNotif, ...prev]);
  }, [purchaseRequests, products]);

  // Procurement Flow: Update Purchase Order Status
  const updatePOStatus = useCallback((poId, status) => {
    setPurchaseOrders(prev => prev.map(po => 
      po.id === poId ? { ...po, status } : po
    ));

    const po = purchaseOrders.find(o => o.id === poId);
    if (!po) return;

    const statusEmoji = status === "Accepted" ? "✅" : status === "Shipped" ? "🚚" : "📦";
    const statusNotif = {
      id: `po-status-${poId}-${status}`,
      title: `${statusEmoji} PO Status Update: ${poId}`,
      description: `Supplier ${po.supplierName} updated PO status to: ${status}.`,
      time: "Just now",
      type: "Stock Alerts",
      isNew: true
    };
    setNotifications(prev => [statusNotif, ...prev]);
  }, [purchaseOrders]);

  // Procurement Flow: Warehouse Goods Received & Verification
  const receiveWarehouseGoods = useCallback(async (poId, receivedQty, damagedQty) => {
    const po = purchaseOrders.find(o => o.id === poId || o._id === poId);
    if (!po) return;

    // Call backend API if PO has database _id
    if (po._id) {
      try {
        await api.purchaseOrders.receive(po._id);
      } catch (e) {
        console.warn('API PO receive note:', e.message);
      }
    }

    // Deduct damaged quantity from valid inventory intake
    const netReceived = Math.max(0, receivedQty - damagedQty);

    // Update product stock levels
    setProducts(prev => prev.map(p => {
      if (p.id === po.productId || p.sku === po.productId) {
        const finalStock = p.stock + netReceived;
        return {
          ...p,
          stock: finalStock,
          status: finalStock > p.threshold ? 'In Stock' : finalStock > 0 ? 'Low Stock' : 'Out of Stock'
        };
      }
      return p;
    }));

    // Record purchase expense in accountant ledger
    const newExpense = {
      id: `EXP-${Math.floor(100 + Math.random() * 900)}`,
      title: `Procurement: PO ${poId} - ${po.productName}`,
      category: "Inventory Intake",
      amount: po.amount,
      date: "Just now",
      status: "Paid",
      branch: selectedBranch.name
    };
    setExpenses(prev => [newExpense, ...prev]);

    // Mark PO completed
    setPurchaseOrders(prev => prev.filter(o => o.id !== poId && o._id !== poId));

    // Send global verified notification
    const recNotif = {
      id: `goods-rec-${poId}`,
      title: `📥 Goods Received & Verified: ${poId}`,
      description: `Received ${receivedQty} units of ${po.productName} (${damagedQty} damaged). Added ${netReceived} units to stock. Expense ledger noted.`,
      time: "Just now",
      type: "Stock Alerts",
      isNew: true
    };
    setNotifications(prev => [recNotif, ...prev]);
  }, [purchaseOrders, selectedBranch]);

  // Product CRUD
  const addProduct = useCallback(async (newProd) => {
    let created = null;

    try {
      const res = await api.products.create(newProd);
      if (res && res.success && res.data) {
        const p = res.data;
        created = {
          ...p,
          id: p._id || p.sku,
          status: p.stock > (p.threshold || 10) ? 'In Stock' : p.stock > 0 ? 'Low Stock' : 'Out of Stock'
        };
      }
    } catch (e) {
      console.warn('Backend product add note:', e.message);
    }

    if (!created) {
      created = {
        ...newProd,
        id: `PRD-${Math.floor(100 + Math.random() * 900)}`,
        sku: newProd.sku || `PRD-${Math.floor(100 + Math.random() * 900)}`,
        status: newProd.stock > newProd.threshold ? 'In Stock' : newProd.stock > 0 ? 'Low Stock' : 'Out of Stock'
      };
    }

    setProducts(prev => [created, ...prev]);
    showToast({
      title: `Product Added: ${created.name} 📦`,
      message: `SKU: ${created.sku} • Stock: ${created.stock} ${created.unit || 'units'}`,
      type: 'success',
      category: 'product',
      duration: 3500
    });
  }, [showToast]);

  const updateProduct = useCallback(async (updatedProd) => {
    if (updatedProd._id || updatedProd.id) {
      try {
        await api.products.update(updatedProd._id || updatedProd.id, updatedProd);
      } catch (e) {
        console.warn('Backend product update note:', e.message);
      }
    }

    setProducts(prev => prev.map(p => (p.id === updatedProd.id || p._id === updatedProd._id) ? updatedProd : p));
    showToast({
      title: `Product Updated: ${updatedProd.name} ✏️`,
      message: `Stock: ${updatedProd.stock} • Price: ₹${updatedProd.price}`,
      type: 'info',
      category: 'product',
      duration: 3000
    });
  }, [showToast]);

  const deleteProduct = useCallback(async (id) => {
    try {
      await api.products.delete(id);
    } catch (e) {
      console.warn('Backend product delete note:', e.message);
    }

    const found = products.find(p => p.id === id || p._id === id);
    setProducts(prev => prev.filter(p => p.id !== id && p._id !== id));
    showToast({
      title: found ? `Deleted ${found.name} 🗑️` : 'Product Deleted',
      message: 'Item removed from product catalog',
      type: 'warning',
      category: 'product',
      duration: 3000
    });
  }, [products, showToast]);

  // Role-Based Notification Access Filter (Method 3: Customer sees only Orders, Deliveries, Cart & Promos)
  const userNotifications = useMemo(() => {
    const role = user?.role || 'Super Admin';
    const userEmail = (user?.email || '').toLowerCase().trim();

    return notifications.filter(n => {
      // If notification has explicit targetRoles array
      if (Array.isArray(n.targetRoles) && n.targetRoles.length > 0) {
        const hasRoleAccess = n.targetRoles.includes(role);
        if (!hasRoleAccess) return false;

        // If it's a Customer role, strictly block Stock Alerts, Expiry, System, and Warehouse messages
        if (role === 'Customer') {
          if (n.type === 'Stock Alerts' || n.type === 'Expiry' || n.type === 'Warehouse' || n.type === 'System') {
            return false;
          }
          // If notification is tied to a specific customer email, only show if it belongs to this customer
          if (n.customerEmail && userEmail && n.customerEmail.toLowerCase().trim() !== userEmail) {
            return false;
          }
        }
        return true;
      }

      // Fallback for notifications without explicit targetRoles:
      if (role === 'Customer') {
        return n.type === 'Orders' || n.type === 'Deliveries';
      }

      return true;
    });
  }, [notifications, user]);

  // Notifications Handlers
  const markNotificationRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isNew: false } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isNew: false })));
  }, []);

  return (
    <AppContext.Provider value={{
      isAuthenticated, login, loginWithCredentials, loginWithGoogle, registerCustomer, completeCustomerRegistration, requestPasswordReset, confirmPasswordReset, logout,
      user, setUser, jwtToken,
      sidebarCollapsed, setSidebarCollapsed, toggleSidebar,
      currentView, setCurrentView: changeView, isPendingViewChange,
      selectedBranch, setSelectedBranch,
      products, setProducts, addProduct, updateProduct, deleteProduct,
      customers, setCustomers,
      suppliers, setSuppliers,
      employees, setEmployees,
      transactions, completeCheckout, completeOnlineCheckout,
      notifications: userNotifications, rawNotifications: notifications, addNotification, markNotificationRead, markAllNotificationsRead,
      cart, addToCart, updateCartQuantity, removeFromCart, clearCart,
      selectedCustomer, setSelectedCustomer,
      appliedCoupon, setAppliedCoupon,
      paymentMethod, setPaymentMethod,
      activeInvoice, setActiveInvoice,
      aiDrawerOpen, setAiDrawerOpen,
      notifDrawerOpen, setNotifDrawerOpen,
      scannerModalOpen, setScannerModalOpen,
      razorpayModalOpen, setRazorpayModalOpen,
      razorpayOrderDetails, setRazorpayOrderDetails,
      initiateRazorpayPOSCheckout,
      searchTerm, setSearchTerm, deferredSearchTerm,
      cartTotals,
      calculateTotals: () => cartTotals,
      branches: BRANCHES,
      
      // Branch-derived data
      branchProfile, branchProducts, branchEmployees, branchExpenses, branchTransactions,
      
      // Procurement Flow Context
      purchaseRequests, createPurchaseRequest, approvePurchaseRequest,
      purchaseOrders, updatePOStatus, receiveWarehouseGoods,
      
      // Logistics/Fleet
      deliveries, verifyDeliveryOTP,
      submitReview,
      expenses, setExpenses,
      storeSettings, setStoreSettings, updateStoreSettings, currencySymbol,
      showToast
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

