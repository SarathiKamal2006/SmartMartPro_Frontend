import React, { createContext, useContext, useState, useReducer, useMemo, useCallback, useTransition, useDeferredValue, useEffect } from 'react';
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

const AppContext = createContext();

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
  const [selectedBranch, setSelectedBranch] = useState(BRANCHES[0]);
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
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
  
  // Search Term
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);

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
          setCurrentView('customerStorefront');
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
      setCurrentView('customerStorefront');
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

  const loginWithCredentials = useCallback((email, password) => {
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
      setCurrentView('customerStorefront');
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

  const registerCustomer = useCallback((name, email, phone, password) => {
    // Unique check
    const exists = registeredUsers.some(u => u.email.toLowerCase() === email.toLowerCase());
    if (exists) {
      return { success: false, message: 'An account with this email already exists.' };
    }
    if (!isValidEmail(email)) {
      return { success: false, message: 'Please enter a valid email address.' };
    }

    // Generate random 4-digit OTP code
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Trigger visual notification of OTP sending
    const newNotif = {
      id: `otp-${Date.now()}`,
      title: "SmartMart Pro Security Verification Code",
      description: `Verification OTP for registration of ${name} (${email}): ${otp}`,
      time: "Just now",
      type: "Security",
      isNew: true
    };
    setNotifications(prev => [newNotif, ...prev]);

    return { success: true, otp };
  }, [registeredUsers]);

  const completeCustomerRegistration = useCallback((name, email, phone, password) => {
    const custId = `CUST-${100 + registeredUsers.length + 1}`;
    const newCust = {
      id: custId,
      name,
      email,
      phone,
      passwordHash: hashPassword(password),
      role: 'Customer',
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      walletBalance: 2000.00, // starting gift balance
      loyaltyPoints: 0
    };

    setRegisteredUsers(prev => [...prev, newCust]);
    setCustomers(prev => [...prev, {
      id: newCust.id,
      name: newCust.name,
      phone: newCust.phone,
      email: newCust.email,
      totalSpent: 0,
      points: 0,
      lastVisit: "Just registered",
      tier: "Bronze",
      wallet: 2000.00
    }]);

    // Auto login
    const payload = {
      id: newCust.id,
      name: newCust.name,
      email: newCust.email,
      role: 'Customer',
      avatar: newCust.avatar,
      branch: 'Chennai Central Superstore (Main)',
      walletBalance: 2000.00,
      loyaltyPoints: 0
    };
    const token = generateJWT(payload);
    localStorage.setItem('auth_token', token);
    setUser(payload);
    setJwtToken(token);
    setIsAuthenticated(true);
    setCurrentView('customerStorefront');
  }, [registeredUsers]);

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
  }, [showToast]);

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

  // stock alert threshold checks
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
          isNew: true
        };
        setNotifications(prev => [orangeNotif, ...prev]);
      }
    });
  }, []);

  // Complete checkout
  const completeCheckout = useCallback(() => {
    const invoiceId = `#TRX-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTx = {
      id: invoiceId,
      customer: selectedCustomer ? selectedCustomer.name : 'Walk-in Customer',
      amount: cartTotals.grandTotal,
      status: 'Completed',
      date: 'Just now',
      items: cart.length,
      paymentMethod,
      details: {
        cartItems: [...cart],
        subtotal: cartTotals.subtotal,
        gst: cartTotals.gst,
        discount: cartTotals.discount,
        grandTotal: cartTotals.grandTotal,
        branch: selectedBranch.name,
        cashier: user?.name || ' Elena Rostova'
      }
    };

    // Deduct stock levels in products database
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
      title: 'POS Bill Generated! 🧾',
      message: `Invoice ${invoiceId} generated. Total: ₹${cartTotals.grandTotal.toFixed(2)} (${paymentMethod})`,
      type: 'success',
      category: 'cart',
      duration: 5000
    });
  }, [cartTotals, cart, selectedCustomer, paymentMethod, selectedBranch, user, products, clearCart, checkStockAlerts, showToast]);

  // Online checkout
  const completeOnlineCheckout = useCallback((shippingAddress, gateway) => {
    if (cart.length === 0) return;
    const orderId = `#ORD-${Math.floor(8000 + Math.random() * 2000)}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

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
      customer: user?.name || "Ananya Sundaram",
      address: shippingAddress || "14 Anna Salai, T. Nagar, Chennai - 600017",
      phone: "+91 98401 23456",
      items: cart.length,
      amount: `₹${cartTotals.grandTotal.toFixed(2)}`,
      status: "Assigned",
      otp: otp,
      driver: "Amira Patel",
      time: "Pending Pickup"
    };

    setDeliveries(prev => [newDelivery, ...prev]);

    // Record Transaction
    const newTx = {
      id: orderId,
      customer: user?.name || 'Online Customer',
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
      if (c.email.toLowerCase() === user?.email.toLowerCase()) {
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
    if (gateway === 'Wallet') {
      setUser(prev => ({
        ...prev,
        walletBalance: Math.max(0, prev.walletBalance - cartTotals.grandTotal)
      }));
      setRegisteredUsers(prev => prev.map(u => {
        if (u.email === user.email) {
          return { ...u, walletBalance: Math.max(0, u.walletBalance - cartTotals.grandTotal) };
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
      description: `Order total: ₹${cartTotals.grandTotal.toFixed(2)}. Sent to Warehouse Staff for packing. OTP: ${otp}`,
      time: "Just now",
      type: "Deliveries",
      isNew: true
    };
    setNotifications(prev => [orderNotif, ...prev]);

    showToast({
      title: 'Order Placed Successfully! 🛍️',
      message: `Order ${orderId} confirmed! OTP: ${otp} for delivery verification.`,
      type: 'success',
      category: 'cart',
      duration: 6000
    });

    return { orderId, otp };
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
  const createPurchaseRequest = useCallback((productId, quantity, supplierId) => {
    const prod = products.find(p => p.id === productId);
    const supp = suppliers.find(s => s.id === supplierId);
    if (!prod || !supp) return;

    const reqId = `REQ-${Math.floor(100 + Math.random() * 900)}`;
    const newReq = {
      id: reqId,
      productId: prod.id,
      productName: prod.name,
      quantity,
      supplierId: supp.id,
      supplierName: supp.name,
      status: "Pending Approval"
    };

    setPurchaseRequests(prev => [newReq, ...prev]);

    // Send notification
    const reqNotif = {
      id: `req-notif-${reqId}`,
      title: `🟠 Purchase Request Created: ${reqId}`,
      description: `Reorder request for ${quantity} units of ${prod.name} submitted. Awaiting Branch Manager approval.`,
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
  const receiveWarehouseGoods = useCallback((poId, receivedQty, damagedQty) => {
    const po = purchaseOrders.find(o => o.id === poId);
    if (!po) return;

    // Deduct damaged quantity from valid inventory intake
    const netReceived = Math.max(0, receivedQty - damagedQty);

    // Update product stock levels
    setProducts(prev => prev.map(p => {
      if (p.id === po.productId) {
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
    setPurchaseOrders(prev => prev.filter(o => o.id !== poId));

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
  const addProduct = useCallback((newProd) => {
    const created = {
      ...newProd,
      id: `PRD-${Math.floor(100 + Math.random() * 900)}`,
      sku: `PRD-${Math.floor(100 + Math.random() * 900)}`,
      status: newProd.stock > newProd.threshold ? 'In Stock' : newProd.stock > 0 ? 'Low Stock' : 'Out of Stock'
    };
    setProducts(prev => [created, ...prev]);
    showToast({
      title: `Product Added: ${created.name} 📦`,
      message: `SKU: ${created.sku} • Stock: ${created.stock} ${created.unit || 'units'}`,
      type: 'success',
      category: 'product',
      duration: 3500
    });
  }, [showToast]);

  const updateProduct = useCallback((updatedProd) => {
    setProducts(prev => prev.map(p => p.id === updatedProd.id ? updatedProd : p));
    showToast({
      title: `Product Updated: ${updatedProd.name} ✏️`,
      message: `Stock: ${updatedProd.stock} • Price: ₹${updatedProd.price}`,
      type: 'info',
      category: 'product',
      duration: 3000
    });
  }, [showToast]);

  const deleteProduct = useCallback((id) => {
    const found = products.find(p => p.id === id);
    setProducts(prev => prev.filter(p => p.id !== id));
    showToast({
      title: found ? `Deleted ${found.name} 🗑️` : 'Product Deleted',
      message: 'Item removed from product catalog',
      type: 'warning',
      category: 'product',
      duration: 3000
    });
  }, [products, showToast]);

  // Notifications
  const markNotificationRead = useCallback((id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isNew: false } : n));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isNew: false })));
  }, []);

  return (
    <AppContext.Provider value={{
      isAuthenticated, login, loginWithCredentials, registerCustomer, completeCustomerRegistration, logout,
      user, setUser, jwtToken,
      currentView, setCurrentView: changeView, isPendingViewChange,
      selectedBranch, setSelectedBranch,
      products, setProducts, addProduct, updateProduct, deleteProduct,
      customers, setCustomers,
      suppliers, setSuppliers,
      employees, setEmployees,
      transactions, completeCheckout, completeOnlineCheckout,
      notifications, markNotificationRead, markAllNotificationsRead,
      cart, addToCart, updateCartQuantity, removeFromCart, clearCart,
      selectedCustomer, setSelectedCustomer,
      appliedCoupon, setAppliedCoupon,
      paymentMethod, setPaymentMethod,
      activeInvoice, setActiveInvoice,
      aiDrawerOpen, setAiDrawerOpen,
      notifDrawerOpen, setNotifDrawerOpen,
      scannerModalOpen, setScannerModalOpen,
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

