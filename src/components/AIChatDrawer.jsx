import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { X, Sparkles, Send, User, ArrowRight, Lightbulb } from 'lucide-react';

export default function AIChatDrawer() {
  const { aiDrawerOpen, setAiDrawerOpen, products, user, deliveries } = useApp();
  const { playBeep, playClick } = useSoundEffects();

  const [inputMsg, setInputMsg] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Derive initial greeting dynamically based on role
  const initialGreeting = useMemo(() => {
    const name = user?.name || 'Partner';
    switch (user?.role) {
      case 'Customer':
        return `Greetings ${name}! 🍎 I am your SmartMart Shopping Assistant. Ask me about fresh organic produce, healthy recipe recommendations, or your loyalty club rewards points!`;
      case 'Supplier':
        return `Hello Supplier Partner ${name}! 🚛 I am your procurement log assistant. Ask me about your issued Purchase Orders, status logs, or delivery updates.`;
      case 'Accountant':
        return `Greetings Accountant ${name}. 📊 I can help you analyze the general ledger, review operating expenses, or prepare tax sheets for your 18% GST filing.`;
      case 'Delivery Partner':
        return `Welcome Fleet Driver ${name}! 🛵 Ask me about route addresses, ETA estimates, or how to verify secure customer handover OTP codes.`;
      case 'Warehouse Staff':
        return `Hello Warehouse Team! 📦 I am your inventory intake assistant. Ask me about incoming supplier shipments, damage logging, or branch stock levels.`;
      default:
        return `Greetings Admin ${name}! ⚡ I am your SmartMart Pro executive assistant. Ask me about real-time stock levels, branch revenues, expiring batches, or automated reorders.`;
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
          "Suggest a healthy recipe",
          "Show my loyalty rewards points",
          "Track my active delivery order"
        ];
      case 'Supplier':
        return [
          "What is my active PO status?",
          "How to submit invoice?",
          "View supplier contract detail"
        ];
      case 'Accountant':
        return [
          "Break down expenses",
          "Calculate GST tax collections",
          "What is YTD net operating profit?"
        ];
      case 'Delivery Partner':
        return [
          "Show my next delivery route",
          "Where to verify customer OTP?",
          "List my active deliveries"
        ];
      case 'Warehouse Staff':
        return [
          "List incoming shipments",
          "Check Basmati Rice stock level",
          "How to register damaged goods?"
        ];
      default:
        return [
          "How many rice bags are left?",
          "Show today's sales summary",
          "Which products are expiring this week?",
          "Give me an AI business summary"
        ];
    }
  }, [user]);

  const handleSend = (textToSend) => {
    const text = textToSend || inputMsg;
    if (!text.trim()) return;

    playBeep();

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMsg('');
    setIsTyping(true);

    setTimeout(() => {
      let responseText = "";
      const lower = text.toLowerCase();

      // CUSTOM CO-PILOT RESPONSE MATRIX BASED ON ROLE
      if (user?.role === 'Customer') {
        if (lower.includes("recipe") || lower.includes("healthy")) {
          responseText = `🥗 **AI Recipe Recommendation**: \nHow about a fresh **Organic Banana Avocado Salad**? \n\n• **Ingredients**: Fresh Bananas (SKU PRD-284), Organic Greek Yogurt (SKU DY-504), Honey.\n• **Benefits**: Energy boost, high potassium, and healthy fats! Add them to your basket.`;
        } else if (lower.includes("rewards") || lower.includes("points") || lower.includes("loyalty")) {
          responseText = `🪙 **Loyalty Club Balance**: \nYou currently have **${user.loyaltyPoints || 450} Points**!\n\n*SmartMart Reward Rules*: Redeem 100 points for ₹10.00 cash voucher credit during checkout.`;
        } else if (lower.includes("delivery") || lower.includes("order") || lower.includes("track")) {
          const myDel = deliveries ? deliveries[deliveries.length - 1] : null;
          if (myDel) {
            responseText = `🛵 **Live Delivery Dispatch**: \n• **Order ID**: ${myDel.orderId}\n• **Driver**: ${myDel.driver}\n• **Status**: ${myDel.status} (${myDel.time})\n• **Secure Handover OTP**: ${myDel.otp}`;
          } else {
            responseText = `🛵 **Delivery Tracking**: You do not have any active delivery orders right now. Try placing an order in the Checkout tab!`;
          }
        } else {
          responseText = `🤖 **Customer Service Assistant**: I can look up category listings, count items in your cart, or track active 10-minute delivery orders. Just ask!`;
        }
      } else if (user?.role === 'Supplier') {
        if (lower.includes("po") || lower.includes("status")) {
          responseText = `%PO_STATUS%`;
          responseText = `🚛 **Purchase Orders Summary**: \nYou have active POs issued by the store procurement manager. \n\n*Action Required*: Head to the Supplier tab to **Accept, Ship, and Deliver** pending POs (e.g. A2 Fresh Whole Milk).`;
        } else if (lower.includes("invoice")) {
          responseText = `📄 **Invoice Guidelines**: \nPlease upload digital tax invoices showing the 18% GST breakdown. Send invoices to **billing@smartmart.pro** for immediate accountant ledger clearance.`;
        } else {
          responseText = `🤖 **Supplier Log Co-Pilot**: Connected. System ratings indicate healthy supplier delivery performance (Rating: 4.8★).`;
        }
      } else if (user?.role === 'Accountant') {
        if (lower.includes("expense") || lower.includes("break")) {
          responseText = `📉 **Operational Expense breakdown**:\n• Utilities: 40%\n• Payroll: 35%\n• Procurement: 25%\n\n*Ledger health*: Expense vouchers are correctly matched.`;
        } else if (lower.includes("gst") || lower.includes("tax")) {
          responseText = `Receipts compiled: GST tax at 18% is calculated. \n\n*Filing Status*: Ready for Q3 compliance filing. Click the **FILE GST RETURN** button at the top to complete standard returns.`;
        } else {
          responseText = `🤖 **Financial Ledger AI**: Balance sheet calculations compiled. Gross profit margin is healthy at ~29.5%.`;
        }
      } else if (user?.role === 'Delivery Partner') {
        if (lower.includes("route")) {
          responseText = `📍 **Delivery Routing**: Optimal route mapped via T. Nagar. Estimated delivery time is 10 minutes. Avoid main road traffic.`;
        } else if (lower.includes("otp") || lower.includes("verify")) {
          responseText = `🔑 **OTP Handover Verification**: \nAsk the customer for the 4-digit verification code. Enter this code into the Verification Modal to complete the delivery process.`;
        } else {
          responseText = `🤖 **Driver Fleet Co-Pilot**: Active vehicle Refrigerator Van #04 status healthy. Gas allowance approved for Q3.`;
        }
      } else if (user?.role === 'Warehouse Staff') {
        if (lower.includes("shipment") || lower.includes("incoming")) {
          responseText = `📦 **Incoming Shipments**: \nSupplier deliveries marked 'Delivered' are waiting for verification. Check received vs damaged counts in the verification dashboard.`;
        } else if (lower.includes("stock") || lower.includes("rice")) {
          const rice = products.find(p => p.name.toLowerCase().includes("rice"));
          const count = rice ? rice.stock : 12;
          responseText = `🌾 **Stock Check**: Basmati Rice has **${count} units** remaining. Threshold is 40. Orange Stock alert triggered.`;
        } else {
          responseText = `🤖 **Warehouse Log**: Global multi-branch transfer channel active. Perform stock allocations securely.`;
        }
      } else {
        // ADMIN / DEFAULT RESPONSES
        if (lower.includes("rice") || lower.includes("rice bags")) {
          const rice = products.find(p => p.name.toLowerCase().includes("rice"));
          const count = rice ? rice.stock : 12;
          responseText = `🌾 **Stock Alert**: We currently have **${count} bags** of Royal Basmati Rice 5kg remaining at Downtown Superstore. Reorder threshold is 40 bags. \n\n*AI Recommendation*: Generate a PO with Apex Foods Ltd for **50 bags** to prevent stockout.`;
        } else if (lower.includes("sales") || lower.includes("today's sales")) {
          responseText = `📈 **TODAY'S SALES**:\n• **Total Revenue**: $42,850.50 (+14.2% vs last week)\n• **Total Transactions**: 540 orders\n• **Avg Order Basket**: $32.40\n• **Top Category**: Fresh Produce ($18,450.00)`;
        } else if (lower.includes("expir") || lower.includes("week")) {
          responseText = `⚠️ **Expiring Batches (Next 7 Days)**:\n1. **Greek Yogurt Blueberry 5oz** (SKU DY-504) - 18 cups expiring Aug 11, 2026.\n2. **Whole Milk 1 Gallon** (SKU DY-401) - 8 units expiring Aug 12, 2026.\n\n*Action*: Apply 20% discount on Yogurt to clear stock.`;
        } else if (lower.includes("summary") || lower.includes("business")) {
          responseText = `📊 **AI Executive Summary**:\n"Overall sales increased by 15% this week. Fresh Produce and Dairy were the fastest-growing categories. Milk and Basmati Rice inventory should be replenished within 3 days to avoid revenue loss of ~$2,400."`;
        } else {
          responseText = `🤖 Real-time database query across all 4 branches complete:\n\nSystem metrics are healthy. Total 842 tracked SKUs, with 6 items currently flagged for low-stock reorder. Is there a specific supplier or item SKU you want me to inspect?`;
        }
      }

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: responseText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 700);
  };

  if (!aiDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-950/60 backdrop-blur-xs transition-opacity font-sans">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 animate-slide-left">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">SmartMart Pro AI Assistant</h3>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">Analyzing {user?.role || 'User'} Console Stream</p>
            </div>
          </div>
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
              placeholder="Ask SmartMart Pro AI..."
              className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5 rounded-2xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
            />
            <button
              type="submit"
              disabled={!inputMsg.trim()}
              className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold shadow-md shadow-emerald-600/20 transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
