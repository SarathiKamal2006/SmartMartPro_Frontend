/**
 * SmartMart Pro — Centralised API Client
 * Connects React Frontend with Node/Express + MongoDB Atlas Backend
 */

const API_BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const token = localStorage.getItem('smartmart_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `API error (${response.status})`);
    }

    return data;
  } catch (err) {
    console.warn(`API call failed for ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Auth
  auth: {
    sendOtp: (body) => request('/auth/send-otp', { method: 'POST', body: JSON.stringify(body) }),
    verifyOtp: (body) => request('/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) }),
    login: (body) => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
    oauth: (body) => request('/auth/oauth', { method: 'POST', body: JSON.stringify(body) }),
    forgotPassword: (body) => request('/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
    resetPassword: (body) => request('/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),
    getMe: () => request('/auth/me')
  },

  // Users / Staff Directory
  users: {
    getAll: () => request('/users'),
    create: (body) => request('/users', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/users/${id}`, { method: 'DELETE' })
  },

  // Products Catalog
  products: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/products${query ? `?${query}` : ''}`);
    },
    getOne: (id) => request(`/products/${id}`),
    create: (body) => request('/products', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
    reseed: () => request('/products/reseed', { method: 'POST' })
  },

  // Inventory & Stock
  inventory: {
    getLogs: () => request('/inventory/logs'),
    adjust: (body) => request('/inventory/adjust', { method: 'POST', body: JSON.stringify(body) }),
    transfer: (body) => request('/inventory/transfer', { method: 'POST', body: JSON.stringify(body) }),
    getAlerts: () => request('/inventory/alerts')
  },

  // Billing & Orders
  orders: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/orders${query ? `?${query}` : ''}`);
    },
    getOne: (id) => request(`/orders/${id}`),
    create: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
    updateStatus: (id, body) => request(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) })
  },

  // Customers & Wallet
  customers: {
    getAll: () => request('/customers'),
    getOne: (id) => request(`/customers/${id}`),
    topupWallet: (id, amount) => request(`/customers/${id}/wallet`, { method: 'POST', body: JSON.stringify({ amount }) }),
    getOrders: (id) => request(`/customers/${id}/orders`),
    create: (body) => request('/customers', { method: 'POST', body: JSON.stringify(body) })
  },

  // Suppliers Directory
  suppliers: {
    getAll: () => request('/suppliers'),
    create: (body) => request('/suppliers', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) => request(`/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(body) })
  },

  // Purchase Orders
  purchaseOrders: {
    getAll: () => request('/purchase-orders'),
    create: (body) => request('/purchase-orders', { method: 'POST', body: JSON.stringify(body) }),
    receive: (id) => request(`/purchase-orders/${id}/receive`, { method: 'PATCH' })
  },

  // Finance & Accounting
  finance: {
    getSummary: () => request('/finance/summary'),
    getTransactions: (type) => request(`/finance/transactions${type ? `?type=${type}` : ''}`),
    createExpense: (body) => request('/finance/expenses', { method: 'POST', body: JSON.stringify(body) })
  },

  // AI Forecasting & Analytics
  analytics: {
    getForecasting: () => request('/analytics/forecasting'),
    getTopSelling: () => request('/analytics/top-selling')
  },

  // Settings
  settings: {
    get: () => request('/settings'),
    update: (body) => request('/settings', { method: 'PUT', body: JSON.stringify(body) })
  },

  // Deliveries Fleet & OTP
  deliveries: {
    getAll: () => request('/deliveries'),
    create: (body) => request('/deliveries', { method: 'POST', body: JSON.stringify(body) }),
    verifyOtp: (body) => request('/deliveries/verify-otp', { method: 'POST', body: JSON.stringify(body) }),
    sendEmailOtp: (body) => request('/deliveries/send-email-otp', { method: 'POST', body: JSON.stringify(body) })
  },

  // Stock Batches & Expiry Tracking
  stockBatches: {
    getAll: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/stock-batches${query ? `?${query}` : ''}`);
    },
    create: (body) => request('/stock-batches', { method: 'POST', body: JSON.stringify(body) }),
    getExpiring: () => request('/stock-batches/expiring')
  }
};

export default api;
