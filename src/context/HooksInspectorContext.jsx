import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const HooksInspectorContext = createContext();

export const HOOKS_LIST = [
  { id: 'useState', name: 'useState', category: 'State', desc: 'Manages component local state & reactive triggers.', activeIn: ['Cart', 'Products', 'Theme', 'Dashboard'] },
  { id: 'useEffect', name: 'useEffect', category: 'Effect', desc: 'Synchronizes audio synth, local storage, timers & canvas animations.', activeIn: ['ThemeContext', 'AmbientCanvas', 'AIChat'] },
  { id: 'useContext', name: 'useContext', category: 'Context', desc: 'Subscribes components to global Theme, App & Language contexts.', activeIn: ['Header', 'Sidebar', 'BillingPOS'] },
  { id: 'useReducer', name: 'useReducer', category: 'State', desc: 'Handles complex cart dispatch state (ADD, REMOVE, DISCOUNT, CHECKOUT).', activeIn: ['AppContext (Cart Engine)'] },
  { id: 'useCallback', name: 'useCallback', category: 'Performance', desc: 'Memoizes POS scanner handlers & audio triggers to prevent re-renders.', activeIn: ['BillingPOS', 'AmbientCanvas', 'Header'] },
  { id: 'useMemo', name: 'useMemo', category: 'Performance', desc: 'Calculates high-precision POS tax, total, and analytics charts.', activeIn: ['AppContext', 'DashboardView', 'FinanceReports'] },
  { id: 'useRef', name: 'useRef', category: 'DOM / Persistence', desc: 'Holds particle canvas context, audio oscillator refs, and scroll nodes.', activeIn: ['AmbientCanvas', 'BarcodeScannerModal', 'AIChat'] },
  { id: 'useLayoutEffect', name: 'useLayoutEffect', category: 'DOM Sync', desc: 'Synchronously measures layout bounds for responsive header & invoice modals.', activeIn: ['InvoiceModal', 'Header', 'BarcodeScannerModal'] },
  { id: 'useImperativeHandle', name: 'useImperativeHandle', category: 'DOM Ref', desc: 'Exposes imperative methods (.triggerScan(), .focusInput()) from child modals.', activeIn: ['BarcodeScannerModal', 'HeaderSearch'] },
  { id: 'useId', name: 'useId', category: 'Accessibility', desc: 'Generates unique accessible IDs for POS inputs, coupons, and forms.', activeIn: ['BillingPOSView', 'ProductsView', 'EmployeesView'] },
  { id: 'useDeferredValue', name: 'useDeferredValue', category: 'Concurrent', desc: 'Defers non-urgent search query updates for 60fps product list rendering.', activeIn: ['Header', 'ProductsView', 'InventoryView'] },
  { id: 'useTransition', name: 'useTransition', category: 'Concurrent', desc: 'Executes non-blocking view tab switches with pending status indication.', activeIn: ['App / Sidebar Navigation', 'DashboardView'] },
];

export function HooksInspectorProvider({ children }) {
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [selectedHook, setSelectedHook] = useState(HOOKS_LIST[0]);
  const [hookCounters, setHookCounters] = useState({
    useState: 142,
    useEffect: 38,
    useContext: 94,
    useReducer: 27,
    useCallback: 56,
    useMemo: 41,
    useRef: 18,
    useLayoutEffect: 12,
    useImperativeHandle: 8,
    useId: 24,
    useDeferredValue: 31,
    useTransition: 19,
  });

  const recordHookTrigger = useCallback((hookId) => {
    setHookCounters(prev => ({
      ...prev,
      [hookId]: (prev[hookId] || 0) + 1
    }));
  }, []);

  const totalTriggers = useMemo(() => {
    return Object.values(hookCounters).reduce((sum, count) => sum + count, 0);
  }, [hookCounters]);

  return (
    <HooksInspectorContext.Provider value={{
      inspectorOpen,
      setInspectorOpen,
      selectedHook,
      setSelectedHook,
      hookCounters,
      recordHookTrigger,
      totalTriggers,
      HOOKS_LIST,
    }}>
      {children}
    </HooksInspectorContext.Provider>
  );
}

export function useHooksInspector() {
  const context = useContext(HooksInspectorContext);
  if (!context) {
    throw new Error('useHooksInspector must be used within HooksInspectorProvider');
  }
  return context;
}
