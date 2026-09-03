import React, { useState, useId, useDeferredValue } from 'react';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { 
  Plus, 
  Grid, 
  List, 
  Search, 
  Trash2, 
  X, 
  Barcode,
  ShoppingCart,
  Star,
  Store
} from 'lucide-react';

export default function ProductsView() {
  const { products, addProduct, deleteProduct, addToCart } = useApp();
  const { playClick, playSuccess, playBeep } = useSoundEffects();
  
  const [viewMode, setViewMode] = useState('grid');
  const [selectedCat, setSelectedCat] = useState('All');
  const [search, setSearch] = useState('');
  
  const deferredSearch = useDeferredValue(search);

  const prodNameId = useId();
  const prodPriceId = useId();

  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Fruits & Vegetables',
    price: '',
    unit: 'pack',
    stock: '',
    threshold: '25',
    supplier: 'Green Valley Farms',
    expiryDate: '2026-09-01',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80'
  });

  const filteredProducts = products.filter(p => {
    const matchesCat = selectedCat === 'All' || p.category === selectedCat;
    const matchesSearch = p.name.toLowerCase().includes(deferredSearch.toLowerCase()) || p.sku.toLowerCase().includes(deferredSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.stock) return;
    addProduct({
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      threshold: parseInt(formData.threshold),
    });
    playSuccess();
    setShowAddModal(false);
    setFormData({
      name: '',
      category: 'Fruits & Vegetables',
      price: '',
      unit: 'pack',
      stock: '',
      threshold: '25',
      supplier: 'Green Valley Farms',
      expiryDate: '2026-09-01',
      image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">SmartMart Pro Supermarket Product Catalog</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Manage retail pricing, barcode taxonomy, and inventory stock across catalog categories.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-1">
            <button
              onClick={() => { playClick(); setViewMode('grid'); }}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>GRID</span>
            </button>
            <button
              onClick={() => { playClick(); setViewMode('list'); }}
              className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'list' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>LIST</span>
            </button>
          </div>
          <button
            onClick={() => { playClick(); setShowAddModal(true); }}
            className="bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-md shadow-red-600/20 transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>ADD PRODUCT SKU</span>
          </button>
        </div>
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['All', 'Fruits & Vegetables', 'Dairy & Eggs', 'Beverages', 'Bakery & Bread', 'Snacks & Pantry'].map((cat) => (
            <button
              key={cat}
              onClick={() => { playClick(); setSelectedCat(cat); }}
              className={`px-4 py-2 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all ${
                selectedCat === cat
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search product title or SKU..."
            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>
      </div>

      {/* Grid Mode View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredProducts.map((p) => (
            <div key={p.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col justify-between">
              <div>
                <div className="h-44 relative bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  
                  <span className={`absolute top-3 right-3 text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm ${
                    p.status === 'In Stock' ? 'bg-red-600 text-white' :
                    p.status === 'Low Stock' ? 'bg-amber-500 text-slate-950 font-black' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {p.status}
                  </span>

                  <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-0.5 rounded-lg">
                    {p.category}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white line-clamp-1">{p.name}</h3>
                  
                  <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                    <span className="font-mono">SKU: {p.sku}</span>
                    <div className="flex items-center text-amber-500 font-bold gap-1">
                      <Star className="w-3 h-3 fill-amber-500" />
                      <span>4.8</span>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-semibold">Retail Price</span>
                      <span className="text-base font-black text-emerald-600 dark:text-emerald-400">₹{p.price.toFixed(2)} / {p.unit}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Stock Qty</span>
                      <span className={`text-sm font-extrabold ${p.stock < p.threshold ? 'text-amber-600 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                        {p.stock} {p.unit}s
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 mt-3 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <Barcode className="w-3.5 h-3.5 text-slate-400" />
                  <span>{p.barcode}</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => { playSuccess(); addToCart(p); }}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
                  >
                    <ShoppingCart className="w-3.5 h-3.5" /> ADD TO BASKET
                  </button>
                  <button
                    onClick={() => { playBeep(); deleteProduct(p.id); }}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List Mode View */
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 font-extrabold uppercase text-[10px] border-b border-slate-200 dark:border-slate-800">
                <th className="p-4">PRODUCT NAME</th>
                <th className="p-4">SKU</th>
                <th className="p-4">CATEGORY</th>
                <th className="p-4">PRICE</th>
                <th className="p-4">STOCK</th>
                <th className="p-4">STATUS</th>
                <th className="p-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-bold flex items-center gap-3">
                    <img src={p.image} alt={p.name} className="w-9 h-9 rounded-xl object-cover" />
                    <span className="text-slate-900 dark:text-white font-black">{p.name}</span>
                  </td>
                  <td className="p-4 font-mono text-[11px] text-slate-500">{p.sku}</td>
                  <td className="p-4">{p.category}</td>
                  <td className="p-4 font-black text-emerald-600 dark:text-emerald-400">₹{p.price.toFixed(2)}</td>
                  <td className="p-4 font-bold">{p.stock} {p.unit}</td>
                  <td className="p-4">
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                      p.status === 'In Stock' ? 'bg-red-600 text-white' :
                      p.status === 'Low Stock' ? 'bg-amber-500 text-slate-950' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => { playBeep(); deleteProduct(p.id); }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Add SmartMart Pro Product SKU</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label htmlFor={prodNameId} className="block text-slate-700 dark:text-slate-300 font-bold mb-1">PRODUCT TITLE</label>
                <input
                  id={prodNameId}
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Royal Basmati Rice 5kg"
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">CATEGORY</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold"
                  >
                    <option>Fruits & Vegetables</option>
                    <option>Dairy & Eggs</option>
                    <option>Beverages</option>
                    <option>Bakery & Bread</option>
                    <option>Snacks & Pantry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">UNIT</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={e => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="pack / kg / bag"
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor={prodPriceId} className="block text-slate-700 dark:text-slate-300 font-bold mb-1">PRICE ($)</label>
                  <input
                    id={prodPriceId}
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">STOCK</label>
                  <input
                    type="number"
                    required
                    value={formData.stock}
                    onChange={e => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 dark:text-slate-300 font-bold mb-1">THRESHOLD</label>
                  <input
                    type="number"
                    value={formData.threshold}
                    onChange={e => setFormData({ ...formData, threshold: e.target.value })}
                    className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 font-semibold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-4 bg-gradient-to-r from-red-600 to-amber-600 hover:brightness-110 text-white font-extrabold py-3 rounded-2xl text-xs shadow-md shadow-red-600/20"
              >
                SAVE SKU TO CATALOG
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
