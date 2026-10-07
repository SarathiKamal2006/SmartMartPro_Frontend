import React, { useId } from 'react';
import { Cpu, X, Zap, Code, CheckCircle2, Activity, Sparkles, Layers } from 'lucide-react';
import { useHooksInspector } from '../context/HooksInspectorContext';
import { useSoundEffects } from '../hooks/useCustomHooks';

export default function HooksInspectorModal() {
  const { inspectorOpen, setInspectorOpen, selectedHook, setSelectedHook, hookCounters, recordHookTrigger, totalTriggers, HOOKS_LIST } = useHooksInspector();
  const { playClick, playBeep } = useSoundEffects();
  const searchInputId = useId();

  if (!inspectorOpen) return null;

  const handleTestTrigger = (hookId) => {
    recordHookTrigger(hookId);
    playBeep();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg animate-fadeIn">
      <div className="w-full max-w-4xl h-[85vh] cyber-glass rounded-2xl border border-cyan-500/40 p-6 shadow-neon-cyan flex flex-col relative overflow-hidden">
        
        {/* Header HUD */}
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/30 to-purple-500/30 text-cyan-300 border border-cyan-400/40 shadow-neon-cyan">
              <Cpu className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold font-mono tracking-wider text-cyan-300">REACT HOOKS ARCHITECTURE MATRIX</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[10px] font-mono text-cyan-300">12 / 12 HOOKS IMPLEMENTED</span>
              </div>
              <p className="text-xs text-slate-400">Live inspection of all 12 standard React Hooks & Custom Hooks in SmartMart Pro</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right font-mono hidden sm:block">
              <span className="text-[10px] text-slate-400 block">TOTAL HOOK EVENTS</span>
              <span className="text-sm font-bold text-emerald-400 flex items-center justify-end gap-1">
                <Activity className="w-3.5 h-3.5 animate-pulse" /> {totalTriggers} EXECUTIONS
              </span>
            </div>
            <button
              onClick={() => { playClick(); setInspectorOpen(false); }}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-4 overflow-hidden">
          
          {/* Left Column: Hook Selector Tabs */}
          <div className="md:col-span-5 flex flex-col overflow-y-auto pr-1 space-y-2">
            <h3 className="text-xs font-mono text-cyan-400/80 mb-1 tracking-wider uppercase flex items-center justify-between">
              <span>HOOK CONCEPTS REGISTER</span>
              <span className="text-[10px] text-slate-500">CLICK TO INSPECT</span>
            </h3>
            {HOOKS_LIST.map((h) => {
              const isSelected = selectedHook.id === h.id;
              const count = hookCounters[h.id] || 0;
              return (
                <button
                  key={h.id}
                  onClick={() => { playClick(); setSelectedHook(h); }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 border-cyan-400 shadow-neon-cyan'
                      : 'bg-slate-900/60 border-slate-800 hover:border-cyan-500/30 hover:bg-slate-900/90'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>
                      <Code className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-mono text-sm font-bold text-slate-200">{h.name}</div>
                      <div className="text-[10px] text-slate-400">{h.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-[11px] font-mono text-cyan-300">
                      {count}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Selected Hook Detail View */}
          <div className="md:col-span-7 cyber-glass rounded-xl border border-cyan-500/20 p-5 flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between mb-4 border-b border-cyan-500/20 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-mono border border-purple-500/30 uppercase">
                  {selectedHook.category}
                </span>
                <h3 className="text-2xl font-bold font-mono text-cyan-300 mt-1">{selectedHook.name}</h3>
              </div>
              <button
                onClick={() => handleTestTrigger(selectedHook.id)}
                className="px-3.5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 hover:bg-cyan-500/30 font-mono text-xs font-bold flex items-center gap-1.5 transition-all shadow-neon-cyan"
              >
                <Zap className="w-4 h-4 text-cyan-400" /> TRIGGER EVENT
              </button>
            </div>

            <p className="text-sm text-slate-300 mb-4 leading-relaxed font-sans">
              {selectedHook.desc}
            </p>

            <div className="mb-4">
              <h4 className="text-xs font-mono text-cyan-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> ACTIVE IMPLEMENTATIONS IN CODEBASE:
              </h4>
              <div className="flex flex-wrap gap-2">
                {selectedHook.activeIn.map((loc, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-mono text-slate-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> {loc}
                  </span>
                ))}
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="mt-auto">
              <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">SAMPLE PATTERN SNIPPET:</h4>
              <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden font-sans p-4 text-xs text-slate-800 dark:text-cyan-200 overflow-x-auto">
                <pre>{getHookCodeSnippet(selectedHook.id)}</pre>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info bar */}
        <div className="mt-4 pt-3 border-t border-cyan-500/20 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
            <span>CUSTOM HOOKS: <code className="text-cyan-300">useLocalStorage</code>, <code className="text-cyan-300">useSoundEffects</code>, <code className="text-cyan-300">useKeyboardShortcuts</code>, <code className="text-cyan-300">useDebounce</code></span>
          </div>
          <button
            onClick={() => setInspectorOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 transition-all text-xs"
          >
            CLOSE MATRIX
          </button>
        </div>

      </div>
    </div>
  );
}

function getHookCodeSnippet(id) {
  const snippets = {
    useState: `const [theme, setTheme] = useState('cyberpunk');\nconst [cart, setCart] = useState([]);`,
    useEffect: `useEffect(() => {\n  localStorage.setItem('smartmart_theme', theme);\n}, [theme]);`,
    useContext: `const { theme, toggleTheme } = useContext(ThemeContext);\nconst { user } = useApp();`,
    useReducer: `const [cart, dispatchCart] = useReducer(cartReducer, initialState);\ndispatchCart({ type: 'ADD_ITEM', payload: product });`,
    useCallback: `const handleSearch = useCallback((query) => {\n  setFilterQuery(query);\n}, []);`,
    useMemo: `const grandTotal = useMemo(() => {\n  return subtotal + tax - discount;\n}, [subtotal, tax, discount]);`,
    useRef: `const canvasRef = useRef(null);\nconst audioCtxRef = useRef(null);`,
    useLayoutEffect: `useLayoutEffect(() => {\n  if (containerRef.current) {\n    containerRef.current.focus();\n  }\n}, [isOpen]);`,
    useImperativeHandle: `useImperativeHandle(ref, () => ({\n  triggerScan: (code) => { ... },\n  focusInput: () => { ... }\n}));`,
    useId: `const formInputId = useId();\n<label htmlFor={formInputId}>Product SKU</label>`,
    useDeferredValue: `const [searchTerm, setSearchTerm] = useState('');\nconst deferredSearch = useDeferredValue(searchTerm);`,
    useTransition: `const [isPending, startTransition] = useTransition();\nstartTransition(() => {\n  setCurrentView('dashboard');\n});`,
  };
  return snippets[id] || `// React Hook concept pattern implementation`;
}
