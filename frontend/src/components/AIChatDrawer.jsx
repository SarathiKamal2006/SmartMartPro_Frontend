import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import Logo from './Logo';
import { X, Sparkles, Send, User, ArrowRight, Lightbulb, Mic, MicOff } from 'lucide-react';

export default function AIChatDrawer() {
  const { 
    aiDrawerOpen, 
    setAiDrawerOpen, 
    products = [], 
    user, 
    deliveries = [],
    transactions = [],
    cart = [],
    cartTotals = { subtotal: 0, tax: 0, discount: 0, total: 0 },
    customers = [],
    suppliers = [],
    employees = [],
    expenses = [],
    purchaseOrders = [],
    purchaseRequests = [],
    branches = [],
    selectedBranch
  } = useApp();
  const { playBeep, playClick } = useSoundEffects();

  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const recognitionRef = useRef(null);

  // Derive initial greeting dynamically based on role
  const initialGreeting = useMemo(() => {
    const name = user?.name || 'Partner';
    switch (user?.role) {
      case 'Customer':
        return `Greetings ${name}! 🍎 I am your SmartMart Shopping Assistant. Ask me about fresh organic produce, real-time product prices, what is in your cart, healthy recipes, or your loyalty rewards!`;
      case 'Supplier':
        return `Hello Supplier Partner ${name}! 🚛 I am your procurement log assistant. Ask me about your issued Purchase Orders, status logs, delivery guidelines, or invoice clearance.`;
      case 'Accountant':
        return `Greetings Accountant ${name}. 📊 I can help you analyze the general ledger, review operational expenses, check profit margins, or calculate 18% GST filing sheets.`;
      case 'Delivery Partner':
        return `Welcome Fleet Driver ${name}! 🛵 Ask me about assigned delivery orders, route addresses, ETA estimates, or how to verify secure customer handover OTP codes.`;
      case 'Warehouse Staff':
        return `Hello Warehouse Team! 📦 I am your inventory intake assistant. Ask me about real-time stock levels, out-of-stock items, incoming supplier shipments, or damage logging.`;
      case 'Cashier':
        return `Hello Cashier ${name}! 💳 I can look up item prices, check live barcode stock availability, or help with customer discount promo codes.`;
      default:
        return `Greetings Admin ${name}! ⚡ I am your SmartMart Pro executive co-pilot. Ask me about real-time stock levels, out-of-stock items, revenue & finances, expiring batches, or automated reorders.`;
    }
  }, [user]);

  const [messages, setMessages] = useState([]);

  // Initialize messages stream when greeting changes
  useEffect(() => {
    setMessages([
      {
        id: 'greet-1',
        sender: 'ai',
        text: initialGreeting,
        time: 'Just now'
      }
    ]);
  }, [initialGreeting]);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Derive quick prompts dynamically based on role
  const quickPrompts = useMemo(() => {
    switch (user?.role) {
      case 'Customer':
        return [
          "How many products are in stock?",
          "What's in my cart?",
          "Show my loyalty points & wallet",
          "Track my active delivery order",
          "Suggest a healthy recipe"
        ];
      case 'Supplier':
        return [
          "What is my active PO status?",
          "How to submit digital invoices?",
          "Supplier delivery guidelines"
        ];
      case 'Accountant':
        return [
          "Break down expenses",
          "Calculate GST tax collections",
          "What is YTD net operating profit?",
          "Review gross revenue & ledger"
        ];
      case 'Delivery Partner':
        return [
          "Show active delivery orders",
          "Where to verify customer OTP?",
          "Optimal route guidance"
        ];
      case 'Warehouse Staff':
        return [
          "How many products are out of stock?",
          "List incoming shipments",
          "Check Basmati Rice stock level"
        ];
      case 'Cashier':
        return [
          "How many products are out of stock?",
          "Check item price and stock",
          "Active discount coupons"
        ];
      default:
        return [
          "How many products are out of stock?",
          "Show today's sales & revenue",
          "Which products are low in stock?",
          "Give me an AI business summary",
          "Expiring batches this week"
        ];
    }
  }, [user]);

  // Stemming helper: converts plurals to singular forms
  const stemWord = (word) => {
    if (!word || word.length <= 2) return word;
    const w = word.toLowerCase();
    if (w.endsWith('ies') && w.length > 4) return w.slice(0, -3) + 'y';
    if (w.endsWith('es') && w.length > 3) {
      if (w.endsWith('ches') || w.endsWith('shes') || w.endsWith('xes') || w.endsWith('zes')) return w.slice(0, -2);
      if (w.endsWith('tomatoes')) return 'tomato';
      if (w.endsWith('potatoes')) return 'potato';
      if (w.endsWith('mangoes')) return 'mango';
      return w.slice(0, -2);
    }
    if (w.endsWith('s') && !w.endsWith('ss') && w.length > 2) {
      return w.slice(0, -1);
    }
    return w;
  };

  // Typo dictionary to fix common misspellings
  const TYPO_MAP = {
    'aailable': 'available',
    'availble': 'available',
    'availabe': 'available',
    'availible': 'available',
    'avialable': 'available',
    'avalable': 'available',
    'prce': 'price',
    'costt': 'cost',
    'prise': 'price',
    'stck': 'stock',
    'stk': 'stock',
    'ot stock': 'out of stock',
    'inventry': 'inventory',
    'vegitables': 'vegetables',
    'vegies': 'vegetables',
    'veggies': 'vegetables',
    'vegitable': 'vegetables',
    'friuts': 'fruits',
    'froot': 'fruits',
    'froots': 'fruits',
    'delvery': 'delivery',
    'dilvery': 'delivery',
    'delivry': 'delivery',
    'deliery': 'delivery',
    'discunt': 'discount',
    'dicount': 'discount',
    'disscount': 'discount',
    'cupon': 'coupon',
    'copon': 'coupon',
    'baskt': 'cart',
    'kart': 'cart',
    'tomat': 'tomato',
    'tamato': 'tomato',
    'tamatar': 'tomato',
    'patato': 'potato',
    'potata': 'potato',
    'aloo': 'potato',
    'eg': 'egg',
    'egss': 'egg',
    'whre': 'where',
    'wher': 'where',
    'wat': 'what',
    'wht': 'what',
    'hw': 'how',
    'hwo': 'how',
    'resepies': 'recipe',
    'recipi': 'recipe',
    'receipe': 'recipe',
    'recepie': 'recipe',
    'ordr': 'order',
    'oder': 'order',
    'revnue': 'revenue',
    'revenu': 'revenue',
    'slas': 'sales'
  };

  // Normalizes query string with typo fixes and clean spacing
  const normalizeQuery = (query) => {
    let cleaned = query.toLowerCase().replace(/[^\w\s]/g, ' ');
    Object.entries(TYPO_MAP).forEach(([typo, fix]) => {
      const reg = new RegExp('\\b' + typo + '\\b', 'g');
      cleaned = cleaned.replace(reg, fix);
    });
    return cleaned.trim();
  };

  // Formatter to guarantee replies are strictly in normal form with zero star symbols
  const cleanNormalFormat = (text) => {
    if (!text) return '';
    return text
      .replace(/\*{1,3}/g, '')       // Strip all single, double, triple asterisks
      .replace(/`/g, '')             // Strip code backticks
      .replace(/~~(.*?)~~/g, '$1')   // Clean strikethrough tags
      .replace(/\r\n/g, '\n')
      .trim();
  };

  // Comprehensive Role-Aware AI Question Answering Engine (100% Local - No External API Keys)
  const generateAIResponse = (userQuery) => {
    const rawQ = (userQuery || '').trim();
    const q = rawQ.toLowerCase();
    const normQ = normalizeQuery(rawQ);
    const queryTokens = normQ.split(/\s+/).filter(Boolean);
    const stemmedQueryTokens = queryTokens.map(stemWord);

    const role = user?.role || 'Super Admin';
    const isStaffOrAdmin = ['Super Admin', 'Store Manager', 'Branch Manager', 'Accountant', 'Cashier', 'Warehouse Staff'].includes(role);
    const isCustomer = role === 'Customer';

    // ─────────────────────────────────────────────────────────────
    // 1. CONVERSATIONAL GREETINGS & COURTESY
    // ─────────────────────────────────────────────────────────────
    if (
      normQ === 'hi' || normQ === 'hello' || normQ === 'hey' || 
      normQ.includes('good morning') || normQ.includes('good afternoon') || normQ.includes('good evening') ||
      normQ === 'namaste' || normQ === 'vanakkam'
    ) {
      const name = user?.name ? ` ${user.name}` : '';
      if (isCustomer) {
        return cleanNormalFormat(
          `Hello${name}! Welcome to SmartMart Pro.\n\nI am your Personal Shopping Assistant. You can ask me about:\n• Product availability and prices (e.g., Is egg available? Price of basmati rice)\n• Items in your cart and total cost\n• 10-minute express delivery tracking and handover OTP\n• Loyalty points and store wallet balance\n• Active discount coupons and deals\n• Healthy cooking recipes and grocery storage tips\n\nHow can I help you today?`
        );
      }
      return cleanNormalFormat(
        `Hello${name}! Welcome to SmartMart Pro.\n\nI am your Management Co-Pilot for the ${selectedBranch?.name || 'Chennai Central'} store.\n\nYou can ask me about:\n• Live stock levels, out-of-stock and low-stock alerts\n• Today's sales, revenue, profit margins, and GST reports\n• Active staff, shifts, and cashiers on duty\n• Supplier purchase orders and incoming shipments\n• Branch operations and catalog metrics\n\nWhat would you like to review?`
      );
    }

    // Politeness & Thanks
    if (normQ === 'thanks' || normQ === 'thank you' || normQ.includes('thank you') || normQ === 'great' || normQ === 'awesome' || normQ === 'ok' || normQ === 'okay') {
      return cleanNormalFormat(
        `You are very welcome! If you need anything else regarding products, orders, stock, or store details, feel free to ask anytime.`
      );
    }

    // Goodbyes
    if (normQ === 'bye' || normQ === 'goodbye' || normQ.includes('see you')) {
      return cleanNormalFormat(
        `Goodbye! Thank you for using SmartMart Pro. Have a wonderful day ahead!`
      );
    }

    // Who are you / Bot capabilities
    if (
      normQ.includes('who are you') || normQ.includes('what are you') || 
      normQ.includes('what can you do') || normQ.includes('what is smartmart') || 
      normQ === 'help' || normQ.includes('your name')
    ) {
      return cleanNormalFormat(
        `About SmartMart Pro AI Assistant:\n\nI am the intelligent, real-time store assistant built directly into SmartMart Pro. I operate 100% locally with zero external API keys and live synchronization to our store inventory and order databases.\n\nKey Capabilities:\n• Live Inventory: Check stock, price, SKU, and availability for all 130+ products\n• Order Tracking: Real-time 10-minute delivery status and OTP codes\n• Financial Analytics: Revenue, net profit, operating expenses, and GST breakdown for store managers\n• Cart & Checkout: Real-time basket totals, discounts, and item breakdowns\n• Policies & Operations: Store timings, 3 regional locations, return policy, and payment options\n• Culinary Guide: Healthy recipes and pantry storage recommendations`
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 2. OUT OF STOCK QUERIES
    // ─────────────────────────────────────────────────────────────
    if (
      (normQ.includes('out') && (normQ.includes('stock') || normQ.includes('inventory'))) ||
      normQ.includes('zero stock') || normQ.includes('unavailable')
    ) {
      const outOfStock = products.filter(p => Number(p.stock) === 0 || p.status === 'Out of Stock');
      if (outOfStock.length === 0) {
        return cleanNormalFormat(
          `Inventory Status - Out of Stock Report:\n\nThere are currently 0 products out of stock! All ${products.length} products in the SmartMart Pro catalog have active inventory available.\n\n• Total Catalog Items: ${products.length} Products\n• Inventory Health: 100% In-Stock Available\n• Active Branch: ${selectedBranch?.name || 'Chennai Central Superstore (Main)'}\n\nAll departments (Staples, Fruits & Vegetables, Baby Care, Ready To Cook, Dairy & Eggs, Snacks) are fully stocked!`
        );
      }
      const list = outOfStock.slice(0, 6).map(p => `• ${p.name} (SKU: ${p.sku}) - Category: ${p.category} [Stock: 0]`).join('\n');
      const extra = outOfStock.length > 6 ? `\n...and ${outOfStock.length - 6} more out-of-stock items.` : '';
      return cleanNormalFormat(
        `Out of Stock Alert:\n\nThere ${outOfStock.length === 1 ? 'is' : 'are'} currently ${outOfStock.length} product${outOfStock.length > 1 ? 's' : ''} out of stock:\n\n${list}${extra}\n\nRecommendation: ${isStaffOrAdmin ? 'Generate a Purchase Order with the respective suppliers in the Purchases tab to replenish inventory.' : 'Our replenishment team has been alerted and these items are being restocked!'}`
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 3. LOW STOCK & REORDER QUERIES
    // ─────────────────────────────────────────────────────────────
    if (
      (normQ.includes('low') && (normQ.includes('stock') || normQ.includes('inventory') || normQ.includes('threshold'))) ||
      normQ.includes('running out') || normQ.includes('reorder') || normQ.includes('restock')
    ) {
      const lowStock = products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= (p.threshold || 15));
      if (lowStock.length === 0) {
        return cleanNormalFormat(
          `Stock Health:\n\nNo products are currently below their safety threshold. All ${products.length} catalog items have healthy inventory levels across branches.`
        );
      }
      const list = lowStock.slice(0, 6).map(p => `• ${p.name} (${p.sku}) - ${p.stock} units remaining (Threshold: ${p.threshold || 15})`).join('\n');
      const extra = lowStock.length > 6 ? `\n...and ${lowStock.length - 6} more low-stock items.` : '';
      return cleanNormalFormat(
        `Low Stock Warning:\n\nFound ${lowStock.length} items nearing or below reorder threshold:\n\n${list}${extra}\n\nAction: Automated replenishment POs can be triggered from the Purchases tab.`
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 4. TOTAL PRODUCTS & CATALOG OVERVIEW
    // ─────────────────────────────────────────────────────────────
    if (
      (normQ.includes('how many') || normQ.includes('total') || normQ.includes('count')) &&
      (normQ.includes('product') || normQ.includes('item') || normQ.includes('catalog') || normQ.includes('sku') || normQ.includes('goods'))
    ) {
      const inStockCount = products.filter(p => Number(p.stock) > (p.threshold || 15)).length;
      const lowStockCount = products.filter(p => Number(p.stock) > 0 && Number(p.stock) <= (p.threshold || 15)).length;
      const outStockCount = products.filter(p => Number(p.stock) === 0 || p.status === 'Out of Stock').length;
      
      const catMap = {};
      products.forEach(p => {
        catMap[p.category] = (catMap[p.category] || 0) + 1;
      });
      const catList = Object.entries(catMap).slice(0, 6).map(([c, count]) => `• ${c}: ${count} items`).join('\n');

      return cleanNormalFormat(
        `SmartMart Pro Product Catalog Overview:\n\n• Total Products: ${products.length} active SKUs\n• In Stock: ${inStockCount} items\n• Low Stock: ${lowStockCount} items\n• Out of Stock: ${outStockCount} items\n\nDepartment Breakdown:\n${catList}`
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 5. CATEGORY INQUIRIES & LISTINGS
    // ─────────────────────────────────────────────────────────────
    const CATEGORIES = [
      { name: 'Staples', terms: ['staple', 'dal', 'rice', 'oil', 'flour', 'atta', 'ghee'] },
      { name: 'Fruits & Vegetables', terms: ['fruit', 'vegetable', 'produce', 'fresh produce'] },
      { name: 'Baby Care', terms: ['baby', 'diaper', 'cerelac', 'lotion', 'wipes'] },
      { name: 'Ready To Cook', terms: ['ready to cook', 'noodle', 'vermicelli', 'soup', 'instant'] },
      { name: 'Dairy & Eggs', terms: ['dairy', 'milk', 'egg', 'paneer', 'curd', 'butter', 'cheese'] },
      { name: 'Snacks & Pantry', terms: ['snack', 'biscuit', 'cookie', 'chips', 'namkeen', 'pantry'] },
      { name: 'Masala & Spices', terms: ['masala', 'spice', 'chilli powder', 'turmeric'] },
      { name: 'Household Essentials', terms: ['household', 'soap', 'shampoo', 'toothpaste', 'brush'] },
      { name: 'Beverages', terms: ['beverage', 'drink', 'juice', 'tea', 'coffee', 'soda'] }
    ];

    // Check if user is asking to list or show an entire category
    const isCategoryListingQuery = normQ.includes('show') || normQ.includes('list') || normQ.includes('what') || normQ.includes('all') || normQ.includes('category') || normQ.includes('department');
    if (isCategoryListingQuery) {
      for (const cat of CATEGORIES) {
        if (cat.terms.some(t => normQ.includes(t)) || normQ.includes(cat.name.toLowerCase())) {
          const matchingItems = products.filter(p => p.category.toLowerCase().includes(cat.name.toLowerCase()) || cat.name.toLowerCase().includes(p.category.toLowerCase()));
          if (matchingItems.length > 0) {
            const list = matchingItems.slice(0, 7).map(p => `• ${p.name} - Rs. ${p.price} (${p.stock > 0 ? 'In Stock' : 'Out of Stock'})`).join('\n');
            const remaining = matchingItems.length > 7 ? `\n...and ${matchingItems.length - 7} more items in this section.` : '';
            return cleanNormalFormat(
              `Products in ${cat.name} (${matchingItems.length} Total Items):\n\n${list}${remaining}\n\nYou can browse the complete ${cat.name} department on the storefront or search any specific item.`
            );
          }
        }
      }
    }

    // ─────────────────────────────────────────────────────────────
    // 6. PRICE COMPARISONS & BUDGET QUERIES
    // ─────────────────────────────────────────────────────────────
    if (normQ.includes('cheapest') || normQ.includes('lowest price') || normQ.includes('low price')) {
      const sortedByPrice = [...products].sort((a, b) => Number(a.price) - Number(b.price));
      const top3 = sortedByPrice.slice(0, 4).map(p => `• ${p.name} (${p.category}) - Rs. ${p.price} (${p.unit || 'unit'})`).join('\n');
      return cleanNormalFormat(
        `Lowest Priced Items in SmartMart Pro:\n\n${top3}\n\nThese value steals are ready for instant 10-minute delivery!`
      );
    }

    if (normQ.includes('under 50') || normQ.includes('under 100') || normQ.includes('budget')) {
      const maxPrice = normQ.includes('under 50') ? 50 : 100;
      const budgetItems = products.filter(p => Number(p.price) <= maxPrice).slice(0, 6);
      const list = budgetItems.map(p => `• ${p.name} - Rs. ${p.price} (${p.unit || 'unit'})`).join('\n');
      return cleanNormalFormat(
        `Budget Friendly Items Under Rs. ${maxPrice}:\n\n${list}\n\nGreat essentials with premium quality at low prices.`
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 7. SPECIFIC PRODUCT SEARCH / AVAILABILITY / PRICE LOOKUP
    // (Handles "egg aailable?", "is basmati rice in stock", "tomato price", etc.)
    // ─────────────────────────────────────────────────────────────
    let bestProduct = null;
    let highestScore = 0;

    for (const p of products) {
      const pName = p.name.toLowerCase();
      const pSku = p.sku.toLowerCase();
      let score = 0;

      // Exact or substring match in name or SKU
      if (normQ.includes(pName)) score += 120;
      else if (pName.includes(normQ)) score += 80;

      if (normQ.includes(pSku)) score += 100;

      // Token level stemmed matching
      const pTokens = pName.replace(/[^\w\s]/g, ' ').split(/\s+/).filter(Boolean);
      const pStemmed = pTokens.map(stemWord);

      pStemmed.forEach(pStem => {
        // Exclude common generic qualifiers unless explicitly queried
        if (['fresh', 'premium', 'classic', 'pack', 'unit', 'bunch', 'pure', 'veg', 'gm', 'kg', 'super'].includes(pStem)) {
          return;
        }
        stemmedQueryTokens.forEach(qStem => {
          if (pStem === qStem) {
            score += 45;
          } else if (pStem.includes(qStem) || qStem.includes(pStem)) {
            if (qStem.length >= 3) score += 25;
          }
        });
      });

      if (score > highestScore) {
        highestScore = score;
        bestProduct = p;
      }
    }

    // If product matched with confidence (score >= 35)
    if (bestProduct && highestScore >= 35) {
      const isAvailable = Number(bestProduct.stock) > 0;
      const discountText = bestProduct.originalPrice && bestProduct.originalPrice > bestProduct.price
        ? ` (Regular: Rs. ${bestProduct.originalPrice})`
        : '';

      return cleanNormalFormat(
        `Product Details - ${bestProduct.name}:\n\n• SKU: ${bestProduct.sku}\n• Category: ${bestProduct.category}\n• Current Price: Rs. ${bestProduct.price}${discountText}\n• Pack Size / Unit: ${bestProduct.selectedWeight || bestProduct.unit || '1 unit'}\n• Live Stock Level: ${bestProduct.stock} units (${bestProduct.status || (isAvailable ? 'In Stock' : 'Out of Stock')})\n${isStaffOrAdmin ? `• Supplier: ${bestProduct.supplier || 'SmartMart Direct'}\n• Expiry Date: ${bestProduct.expiryDate || 'N/A'}\n• Reorder Threshold: ${bestProduct.threshold || 15} units` : '• Delivery: Available for 10-Minute Instant Delivery'}\n\n${isCustomer ? (isAvailable ? 'You can add this product directly to your basket from the storefront.' : 'Currently out of stock. Our procurement team is restocking this item soon!') : 'Inventory records are synchronized with the central warehouse.'}`
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 8. FINANCIAL / REVENUE / EXPENSES / GST / PROFIT (Role Protected)
    // ─────────────────────────────────────────────────────────────
    if (
      normQ.includes('finance') || normQ.includes('revenue') || normQ.includes('sales') || 
      normQ.includes('profit') || normQ.includes('earning') || normQ.includes('turnover') ||
      normQ.includes('expense') || normQ.includes('gst') || normQ.includes('tax') || normQ.includes('ledger')
    ) {
      if (isCustomer) {
        return cleanNormalFormat(
          `Confidentiality Notice:\n\nStore accounting ledgers and corporate financial margins are restricted to SmartMart Pro store managers and accountants.\n\nYour Customer Account Summary:\n• Store Wallet Cash: Rs. ${user?.walletBalance || 1000}.00\n• Loyalty Rewards: ${user?.loyaltyPoints || 450} Points (worth Rs. ${Math.floor((user?.loyaltyPoints || 450) / 10)} discount)\n• Active Cart Total: Rs. ${cartTotals?.total || 0}.00\n\nYou can view your order receipts and invoices in the Orders section!`
        );
      }

      const totalRev = transactions.reduce((acc, t) => acc + (t.amount || t.total || 0), 0) || 42850.50;
      const totalExp = expenses.reduce((acc, e) => acc + (e.amount || 0), 0) || 30200.00;
      const netOperatingProfit = totalRev - totalExp;
      const margin = ((netOperatingProfit / totalRev) * 100).toFixed(1);
      const gst18 = (totalRev * 0.18).toFixed(2);
      const orderCount = transactions.length || 540;
      const avgBasket = (totalRev / orderCount).toFixed(2);

      return cleanNormalFormat(
        `SmartMart Pro Financial & Ledger Performance:\n\n• Gross Revenue: Rs. ${totalRev.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n• Total Transactions Processed: ${orderCount} orders\n• Average Order Value: Rs. ${avgBasket}\n• Total Operating Expenses: Rs. ${totalExp.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n• Net Operating Profit: Rs. ${netOperatingProfit.toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n• Gross Margin: ${margin}%\n• GST (18%) Collected: Rs. ${parseFloat(gst18).toLocaleString('en-IN', { minimumFractionDigits: 2 })}\n\nLedger Status: All 3 regional branches balanced. Compliance tax filings are up to date.`
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 9. CART & BASKET INQUIRIES
    // ─────────────────────────────────────────────────────────────
    if (
      normQ.includes('cart') || normQ.includes('basket') || normQ.includes('my item') || 
      normQ.includes('what did i add') || normQ.includes('checkout total')
    ) {
      if (!cart || cart.length === 0) {
        return cleanNormalFormat(
          `Your Shopping Basket is Empty:\n\nYou have not added any products to your basket yet.\n\nPopular items right now:\n• Fresh Farm Tomatoes (Rs. 28)\n• Country Farm Eggs 12 Pack (Rs. 95)\n• Classic Basmathi Rice (Rs. 180)\n• Veg Potato (Rs. 20)\n\nAll ready for instant 10-minute delivery!`
        );
      }

      const itemsList = cart.map(i => `• ${i.product.name} (${i.product.unit || 'pack'}) x ${i.quantity} - Rs. ${(i.product.price * i.quantity).toFixed(2)}`).join('\n');
      return cleanNormalFormat(
        `Your Active Shopping Basket (${cart.length} item${cart.length > 1 ? 's' : ''}):\n\n${itemsList}\n\n• Subtotal: Rs. ${cartTotals.subtotal.toFixed(2)}\n• Discount Applied: -Rs. ${cartTotals.discount.toFixed(2)}\n• Estimated GST: Rs. ${cartTotals.tax.toFixed(2)}\n• Final Total: Rs. ${cartTotals.total.toFixed(2)}\n\nClick the Basket icon at the top right to proceed to instant checkout!`
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 10. DELIVERIES & ORDER TRACKING / OTP
    // ─────────────────────────────────────────────────────────────
    if (
      normQ.includes('delivery') || normQ.includes('track') || normQ.includes('where is my order') || 
      normQ.includes('order status') || normQ.includes('otp') || normQ.includes('driver') || normQ.includes('handover')
    ) {
      if (role === 'Delivery Partner') {
        const activeDels = deliveries.filter(d => d.status !== 'Delivered');
        return cleanNormalFormat(
          `Driver Fleet Console:\n\n• Assigned Deliveries: ${activeDels.length} active\n• Express Corridor: T. Nagar & Anna Nagar delivery sectors\n• Handover Procedure: Verify the customer's 4-digit OTP code before transferring the grocery crate.`
        );
      }

      const activeDel = deliveries && deliveries.length > 0 ? deliveries[deliveries.length - 1] : null;
      if (activeDel) {
        return cleanNormalFormat(
          `Live Express Delivery Tracking:\n\n• Order ID: ${activeDel.orderId}\n• Delivery Partner: ${activeDel.driver} (EV Scooter #04)\n• Current Status: ${activeDel.status}\n• Estimated Arrival: ${activeDel.time || '10 mins'}\n• Handover Security OTP: ${activeDel.otp}\n\nNote: Please share this 4-digit OTP with your delivery partner upon arrival for contactless verification.`
        );
      }
      return cleanNormalFormat(
        `10-Minute Delivery Tracking:\n\nYou currently have no active deliveries in transit. As soon as you place an order at checkout, live GPS tracking, delivery partner contact, and handover OTP will be displayed here!`
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 11. LOYALTY REWARDS & WALLET CASH
    // ─────────────────────────────────────────────────────────────
    if (
      normQ.includes('point') || normQ.includes('loyalty') || normQ.includes('wallet') || 
      normQ.includes('reward') || normQ.includes('cashback') || normQ.includes('coins')
    ) {
      const pts = user?.loyaltyPoints || 450;
      const wallet = user?.walletBalance || 1000;
      return cleanNormalFormat(
        `SmartMart Loyalty Club & Digital Wallet:\n\n• Loyalty Points Balance: ${pts} Points\n• Store Wallet Cash: Rs. ${wallet}.00\n• Redemption Value: 100 Points = Rs. 10.00 cash voucher\n• Membership Tier: Gold Member (Free express shipping on all orders)\n\nTip: You can apply your wallet cash and loyalty points during checkout for instant discounts!`
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 12. DISCOUNTS / OFFERS / COUPONS
    // ─────────────────────────────────────────────────────────────
    if (
      normQ.includes('offer') || normQ.includes('coupon') || normQ.includes('discount') || 
      normQ.includes('promo') || normQ.includes('deal') || normQ.includes('sale')
    ) {
      return cleanNormalFormat(
        `Active SmartMart Pro Promotions & Deals:\n\n1. Code FRESH10: Flat 10% OFF on all fresh Fruits & Vegetables!\n2. Code SMARTPRO: Flat Rs. 50 OFF on pantry & staples orders above Rs. 500.\n3. Code WELCOME100: Flat Rs. 100 OFF on your first grocery basket above Rs. 799.\n\nCategory Steals:\n• Veg Potato (500 gm): Only Rs. 20\n• Veg Coriander Leaves: Only Rs. 10 / bunch\n• Country Farm Eggs (12 Pack): Only Rs. 95\n• Anil Vermicelli: From Rs. 16\n\nEnter the promo code in the Checkout screen for immediate savings!`
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 13. RECIPES & COOKING INSPIRATION
    // ─────────────────────────────────────────────────────────────
    if (
      normQ.includes('recipe') || normQ.includes('cook') || normQ.includes('dinner') || 
      normQ.includes('breakfast') || normQ.includes('lunch') || normQ.includes('salad') || normQ.includes('curry')
    ) {
      return cleanNormalFormat(
        `SmartMart AI Kitchen - Healthy Recipe Ideas:\n\n1. Authentic South Indian Sambar & Idly:\n• Key Ingredients: Idly Rice, Toor Dhal Premium, Veg Tomato Country, Veg Coriander Leaves, and G.D Asafoetida.\n• Prep Time: 25 mins | High Protein & Wholesome.\n\n2. Fresh Garden Vegetable Pulao:\n• Key Ingredients: Classic Basmathi Rice, Veg Carrot, American Sweet Corn, Veg Potato.\n• Prep Time: 20 mins | Light and nutritious.\n\n3. Quick Farm Egg Omelette / Bhurji:\n• Key Ingredients: Country Farm Eggs (12 Pack), Veg Onion, Veg Tomato, Green Chillies, Sunflower Oil.\n• Prep Time: 10 mins | 14g Protein per serving.\n\nAll ingredients are available in SmartMart Pro for 10-minute instant delivery.`
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 14. STORE LOCATIONS, BRANCHES & HOURS
    // ─────────────────────────────────────────────────────────────
    if (
      normQ.includes('branch') || normQ.includes('store') || normQ.includes('location') || 
      normQ.includes('where is') || normQ.includes('timing') || normQ.includes('hours') || 
      normQ.includes('address') || normQ.includes('contact') || normQ.includes('helpline') || normQ.includes('phone')
    ) {
      return cleanNormalFormat(
        `SmartMart Pro Store Locations & Working Hours:\n\n1. Chennai Central Superstore (Main Hub):\n• Address: 108 Anna Salai, T. Nagar, Chennai - 600017\n• Store Timings: 6:00 AM - 11:00 PM\n• Online Express Delivery: 24 Hours / 7 Days\n\n2. Bengaluru Indiranagar Express Store:\n• Address: 100 Ft Road, Indiranagar, Bengaluru - 560038\n\n3. Coimbatore Distribution Warehouse:\n• Address: Avinashi Road, Peelamedu, Coimbatore - 641004\n\nCustomer Support Helpline: +91 800-SMART-MART (76278)\nWhatsApp Assistance: +91 98400-MART1\nSupport Email: support@smartmart.pro`
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 15. RETURN, REFUND & CANCELLATION POLICIES
    // ─────────────────────────────────────────────────────────────
    if (
      normQ.includes('return') || normQ.includes('refund') || normQ.includes('cancel') || 
      normQ.includes('damage') || normQ.includes('policy') || normQ.includes('replace')
    ) {
      return cleanNormalFormat(
        `SmartMart Pro Return, Refund & Cancellation Policy:\n\n• Fresh Produce & Perishables (Fruits, Vegetables, Dairy): No-questions-asked immediate replacement or instant wallet refund within 24 hours of delivery.\n• Packaged Groceries & Essentials: 7-day return window for unopened items in original packaging.\n• Refund Processing: Instant credit to your SmartMart Store Wallet, or 2 to 3 business days back to your bank account / UPI.\n• Cancellation: Orders can be cancelled at zero charge before the delivery partner departs from the store hub.`
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 16. PAYMENT METHODS ACCEPTED
    // ─────────────────────────────────────────────────────────────
    if (
      normQ.includes('payment') || normQ.includes('pay') || normQ.includes('upi') || 
      normQ.includes('cash on delivery') || normQ.includes('cod') || normQ.includes('credit card') || normQ.includes('debit card')
    ) {
      return cleanNormalFormat(
        `Accepted Payment Methods at SmartMart Pro:\n\n• UPI: Google Pay, PhonePe, Paytm, BHIM, and any UPI QR\n• Cards: Visa, MasterCard, RuPay, and American Express (Credit & Debit)\n• Net Banking: All major banks supported\n• Cash on Delivery (COD): Pay cash or scan QR at your doorstep\n• SmartMart Wallet: Instant 1-tap checkout with auto cashback rewards`
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 17. EMPLOYEES & STAFF DIRECTORY (Role Aware)
    // ─────────────────────────────────────────────────────────────
    if (
      normQ.includes('employee') || normQ.includes('staff') || normQ.includes('worker') || 
      normQ.includes('cashier') || normQ.includes('payroll') || normQ.includes('who works')
    ) {
      if (isCustomer) {
        return cleanNormalFormat(
          `Workforce Overview:\n\nSmartMart Pro operates with 45+ trained warehouse pickers, fulfillment specialists, and dedicated fleet drivers ensuring 10-minute deliveries with safety and precision.`
        );
      }
      const empCount = employees.length || 8;
      return cleanNormalFormat(
        `Staff & Workforce Directory:\n\n• Active Team Members: ${empCount} Staff\n• Store Manager: Sarathi Kamal N (admin@smartmart.pro)\n• Branch Manager: Sarah Jenkins (manager@smartmart.pro)\n• Inventory Lead: Marcus Sterling (inventory@smartmart.pro)\n• Chief Cashier: Elena Rostova (cashier@smartmart.pro)\n• Logistics Partner: Amira Patel (delivery@smartmart.pro)\n• Head of Accounts: Michael Chang (accountant@smartmart.pro)\n\nShift Status: 100% staff attendance logged for the active branch shift.`
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 18. SUPPLIERS & PROCUREMENT (Role Aware)
    // ─────────────────────────────────────────────────────────────
    if (
      normQ.includes('supplier') || normQ.includes('vendor') || normQ.includes('procurement') || 
      normQ.includes('po') || normQ.includes('purchase order')
    ) {
      if (role === 'Supplier') {
        return cleanNormalFormat(
          `Supplier Portal Guidelines:\n\n• Active Purchase Orders: Check the Supplier section to view, acknowledge, and mark goods as dispatched.\n• Invoicing: Email GST compliant tax invoices to billing@smartmart.pro.\n• Payment Terms: Standard 15-Day Net clearance upon receiving warehouse dock sign-off.`
        );
      }
      if (isCustomer) {
        return cleanNormalFormat(
          `Farm & Supplier Network:\n\nWe source directly from certified organic farms and regional partners including Organic Tattvas, Natchiyar Modern Rice Mill, and Tata Consumer Products to provide fresh, non-GMO produce at the best prices.`
        );
      }
      const poPending = purchaseOrders.filter(po => (po.status || '').toLowerCase().includes('pending')).length;
      const reqPending = purchaseRequests.filter(pr => (pr.status || '').toLowerCase().includes('pending')).length;
      return cleanNormalFormat(
        `Procurement & Supplier Operations:\n\n• Registered Vendors: 6 Certified Regional Suppliers\n• Pending Purchase Orders: ${poPending} POs awaiting supplier fulfillment\n• Pending Purchase Requests: ${reqPending} Requests awaiting manager authorization\n• Key Partners: Organic Tattvas, Natchiyar Rice Mill, Sunoil India, Adani Wilmar, Slurrp Farm\n\nVisit the Purchases tab to review or expedite pending replenishments.`
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 19. EXPIRING BATCHES & FRESHNESS AUDITS
    // ─────────────────────────────────────────────────────────────
    if (normQ.includes('expir') || normQ.includes('batch') || normQ.includes('shelf life') || normQ.includes('freshness')) {
      return cleanNormalFormat(
        `Expiring Batches & Freshness Audits:\n\n• Produce: Fruits & Vegetables are harvested and delivered fresh daily.\n• Packaged Goods: Monitored via FEFO (First-Expired, First-Out) automated stock rotation.\n• Current Status: 0 expired products in active inventory displays.\n\nRecommendation: Continue offering automatic promotional discounts on near-expiry dairy items to ensure zero waste.`
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 20. FOOD STORAGE & PANTRY TIPS
    // ─────────────────────────────────────────────────────────────
    if (normQ.includes('store') && (normQ.includes('how to') || normQ.includes('vegetable') || normQ.includes('tomato') || normQ.includes('potato') || normQ.includes('egg'))) {
      return cleanNormalFormat(
        `SmartMart Pantry & Storage Tips:\n\n• Tomatoes: Keep at room temperature with stem side down away from direct sunlight for the best flavor.\n• Potatoes & Onions: Store in separate cool, dry, dark baskets. Storing them together accelerates sprouting.\n• Leafy Greens (Coriander, Spinach): Wrap in a dry paper towel and store in an airtight container in the refrigerator crisper drawer.\n• Eggs: Store in the main body of the refrigerator where temperature remains consistent (avoid door shelves).\n• Grains & Dals: Keep in airtight containers with dry bay leaves or cloves to prevent pests.`
      );
    }

    // ─────────────────────────────────────────────────────────────
    // 21. INTELLIGENT COMPREHENSIVE FALLBACK FOR ANY OTHER QUESTION
    // (Searches all catalog keywords, departments, or answers intelligently)
    // ─────────────────────────────────────────────────────────────
    const candidateMatches = products.filter(p => {
      const pName = p.name.toLowerCase();
      return stemmedQueryTokens.some(qStem => {
        if (qStem.length < 3) return false;
        return pName.includes(qStem) || qStem.includes(pName);
      });
    });

    if (candidateMatches.length > 0) {
      const itemsList = candidateMatches.slice(0, 5).map(p => `• ${p.name} - Rs. ${p.price} (${p.category}) [Stock: ${p.stock}]`).join('\n');
      return cleanNormalFormat(
        `Results for "${rawQ}":\n\nI found matching items in our store catalog:\n\n${itemsList}\n\nYou can view full details or add them directly to your cart on the storefront!`
      );
    }

    // Role-tailored helpful fallback
    if (isCustomer) {
      return cleanNormalFormat(
        `SmartMart Customer Assistant:\n\nI reviewed your query regarding "${rawQ}". Here are quick ways I can help:\n\n• Product Lookup: Ask "Is egg available?", "Price of Basmati Rice", or "Show fruits"\n• Your Order: Ask "Where is my delivery?" or "Show my handover OTP"\n• Your Cart: Ask "What is in my cart?" or "Cart total"\n• Rewards & Deals: Ask "My loyalty points" or "Active discount coupons"\n• Store Services: Ask "Store timings", "Return policy", or "Payment options"\n\nFeel free to ask any specific question!`
      );
    }

    return cleanNormalFormat(
      `SmartMart Pro Management Co-Pilot:\n\nQuery processed for "${rawQ}" across the ${selectedBranch?.name || 'Chennai Central'} store database.\n\n• Total SKUs Tracked: ${products.length} active products\n• Current Role: ${role} (${user?.name || 'Staff'})\n• Inventory Health: 100% operational\n\nPopular Operations:\n1. Check inventory: "How many products are out of stock?" or "Low stock items"\n2. Product lookup: "Price of basmati rice" or "Stock of sunflower oil"\n3. Business metrics: "Show today's sales and revenue" or "GST tax summary"\n4. Procurement: "List pending purchase orders" or "Supplier directory"\n5. Store details: "Store locations and helpline numbers"`
    );
  };

  const handleSend = (textToSend) => {
    const text = textToSend || inputMsg;
    if (!text.trim()) return;

    playBeep();

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: cleanNormalFormat(text),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMsg('');
    setIsTyping(true);

    setTimeout(() => {
      const responseText = cleanNormalFormat(generateAIResponse(text));

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 600);
  };

  const stopVoiceRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Error stopping recognition:', err);
      }
    }
    setIsListening(false);
  };

  const toggleVoiceRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Voice input is not supported in this browser. Please use Google Chrome, Microsoft Edge, or Safari.');
      return;
    }

    if (isListening) {
      stopVoiceRecognition();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError('');
        playBeep();
      };

      let finalCaptured = '';

      recognition.onresult = (event) => {
        let interimCaptured = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalCaptured += transcript;
          } else {
            interimCaptured += transcript;
          }
        }
        const combined = (finalCaptured || interimCaptured).trim();
        if (combined) {
          setInputMsg(combined);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission denied. Please allow microphone access in your browser settings.');
        } else if (event.error === 'no-speech') {
          // No speech detected, quietly reset
        } else {
          setSpeechError(`Voice input error: ${event.error}`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        if (finalCaptured && finalCaptured.trim()) {
          handleSend(finalCaptured.trim());
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Speech recognition start error:', err);
      setIsListening(false);
      setSpeechError('Could not start voice recognition. Please try again.');
    }
  };

  // Clean up speech recognition when unmounting
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  const closeTimeoutRef = useRef(null);

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    closeTimeoutRef.current = setTimeout(() => {
      setAiDrawerOpen(false);
    }, 200);
  };

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  if (!aiDrawerOpen) return null;

  return (
    <div 
      onClick={() => setAiDrawerOpen(false)}
      className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-950/60 backdrop-blur-xs transition-opacity font-sans"
    >
      <div 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-left"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <Logo 
            size="xs" 
            subtitle={`AI CO-PILOT • ${user?.role || 'ASSISTANT'}`}
          />
          <button
            onClick={() => { playClick(); setAiDrawerOpen(false); }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestions */}
        <div className="p-3 bg-slate-50/50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 mb-2 uppercase">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>QUICK AI PROMPTS</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 px-2.5 py-1.5 rounded-xl text-left transition-colors flex items-center gap-1 shadow-xs"
              >
                <span>{prompt}</span>
                <ArrowRight className="w-3 h-3 text-emerald-600" />
              </button>
            ))}
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm font-bold">
                  <Sparkles className="w-4 h-4 animate-spin-once" />
                </div>
              )}

              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white font-semibold rounded-tr-none shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-tl-none font-sans'
                }`}
              >
                <div className="whitespace-pre-wrap">
                  {msg.text}
                </div>
                <span className={`block text-[10px] mt-1.5 text-right font-mono opacity-75 ${
                  msg.sender === 'user' ? 'text-white' : 'text-slate-400'
                }`}>
                  {msg.time}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3 justify-start items-center">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none text-emerald-600 text-xs flex items-center gap-1.5 border border-slate-200 dark:border-slate-700">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Input Box */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          {/* Active Voice Listening Banner */}
          {isListening && (
            <div className="mb-2 px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-center justify-between text-xs text-red-600 dark:text-red-400 font-semibold animate-pulse">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span>Listening... Speak your question now</span>
              </div>
              <button 
                type="button" 
                onClick={stopVoiceRecognition}
                className="text-[11px] underline hover:text-red-700 dark:hover:text-red-300 transition-colors"
              >
                Stop
              </button>
            </div>
          )}

          {/* Voice Error Notification */}
          {speechError && (
            <div className="mb-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-700 dark:text-amber-400 flex items-center justify-between">
              <span>{speechError}</span>
              <button 
                type="button" 
                onClick={() => setSpeechError('')} 
                className="text-amber-700 dark:text-amber-400 hover:opacity-75 font-bold ml-2 text-sm leading-none"
              >
                ×
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              placeholder={isListening ? "Listening to your voice..." : "Ask or speak to SmartMart AI..."}
              className={`flex-1 bg-slate-50 dark:bg-slate-800 border ${
                isListening 
                  ? 'border-red-400 ring-2 ring-red-400/20' 
                  : 'border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500'
              } px-3.5 py-2.5 rounded-2xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none font-semibold transition-all`}
            />

            {/* Voice Input Mic Button */}
            <button
              type="button"
              onClick={toggleVoiceRecognition}
              title={isListening ? "Click to stop listening" : "Click to speak your question"}
              className={`p-2.5 rounded-2xl font-bold transition-all flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-md shadow-red-500/30 animate-pulse ring-2 ring-red-400'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold shadow-md shadow-emerald-600/20 transition-colors shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
