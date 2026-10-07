import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ShoppingCart, Star, ShieldCheck, Truck, RefreshCw, Plus, Minus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { getProductImage } from '../data/productImages';

export default function ProductDetailsModal({ product, isOpen, onClose, onSelectProduct }) {
  if (!isOpen || !product) return null;

  const { products, addToCart } = useApp();
  const { playSuccess, playClick } = useSoundEffects();

  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState(
    product.selectedWeight || product.packSize || product.unit || '1 Kg'
  );

  // Sync state when active product changes
  useEffect(() => {
    if (product) {
      setSelectedWeight(product.selectedWeight || product.packSize || product.unit || '1 Kg');
      setQuantity(1);
    }
  }, [product?.id, product?.sku]);

  // Handle ESC key to dismiss modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock body scroll while modal is active
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const weightOptions = product.weightOptions || product.packSizes || ['100 gm', '250 gm', '1 Kg', '2 Kg'];

  const getWeightMultiplier = (baseWeight, currentWeight) => {
    if (!currentWeight || !baseWeight || currentWeight === baseWeight) return 1;
    const parseGrams = (w) => {
      if (!w) return 1000;
      const str = String(w).toLowerCase();
      let num = 1;
      if (str.includes('*')) {
        num = str.split('*').reduce((acc, p) => acc * (parseFloat(p) || 1), 1);
      } else if (str.includes('x')) {
        num = str.split('x').reduce((acc, p) => acc * (parseFloat(p) || 1), 1);
      } else {
        num = parseFloat(str) || 1;
      }
      if (str.includes('kg')) return num * 1000;
      if (str.includes('gm') || str.includes('g')) return num;
      return num;
    };
    const baseG = parseGrams(baseWeight);
    const currG = parseGrams(currentWeight);
    if (!baseG || isNaN(baseG) || baseG === 0) return 1;
    return currG / baseG;
  };

  const multiplier = getWeightMultiplier(product.baseWeight || '1 Kg', selectedWeight);
  const displayPrice = (product.price || 0) * multiplier;
  const rawOrig = product.originalPrice || (product.price ? product.price * 1.2 : 0);
  const displayOriginalPrice = rawOrig * multiplier;

  const formatPrice = (val) => (val % 1 === 0 ? val.toFixed(0) : val.toFixed(2));

  const isOutOfStock = product.stock <= 0 || product.status === 'Out of Stock';

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    playSuccess();
    const itemToAdd = {
      ...product,
      price: displayPrice,
      unit: selectedWeight,
      name: `${product.name} (${selectedWeight})`
    };
    for (let i = 0; i < quantity; i++) {
      addToCart(itemToAdd);
    }
  };

  // Find related products in same category
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.sku !== product.sku)
    .slice(0, 4);

  const hasOffer = product.discount || (product.discountPercentage && product.discountPercentage > 0) || product.offerAvailable;
  const discountLabel = product.discount || (product.discountPercentage ? `${product.discountPercentage}% OFF` : 'SPECIAL OFFER');

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-fadeIn"
      style={{ animationDuration: '150ms' }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto relative p-5 sm:p-6 space-y-4 text-slate-800 dark:text-slate-100 my-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close product modal"
          className="absolute top-3.5 right-3.5 p-2 rounded-full bg-slate-100/90 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer z-20 hover:scale-105 active:scale-95 shadow-xs"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Product Section: Compact 2-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
          {/* Left: Image Container */}
          <div className="sm:col-span-5 bg-slate-50 dark:bg-slate-950/70 rounded-2xl p-3 sm:p-4 border border-slate-200/70 dark:border-slate-800/80 flex items-center justify-center relative h-48 sm:h-56 group">
            {hasOffer && (
              <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-xs uppercase tracking-wider z-10">
                {discountLabel}
              </span>
            )}
            <img
              src={getProductImage(product)}
              alt={product.name}
              onError={(e) => {
                e.target.onerror = null;
                const idOrSku = product.sku || product.id || '';
                const name = (product.name || '').toLowerCase();
                const cat = (product.category || '').toLowerCase();
                if (idOrSku.startsWith('CHK-') || name.includes('chocolate') || name.includes('polo') || name.includes('snickers')) {
                  e.target.src = '/products/snickers_chocolate_bar.jpg';
                } else if (cat.includes('bev') || idOrSku.startsWith('TEA-') || idOrSku.startsWith('COF-') || idOrSku.startsWith('BEV-') || name.includes('tea') || name.includes('coffee') || name.includes('juice') || name.includes('drink')) {
                  if (name.includes('coffee') || idOrSku.startsWith('COF-')) {
                    e.target.src = '/products/nescafe_sunrise_coffee.png';
                  } else if (name.includes('tea') || idOrSku.startsWith('TEA-')) {
                    e.target.src = '/products/avt_natures_cup_tea.png';
                  } else {
                    e.target.src = '/products/frooti_mango_drink.png';
                  }
                } else if (cat.includes('dairy') || cat.includes('chilled') || cat.includes('cheese') || cat.includes('butter') || cat.includes('paneer') || idOrSku.startsWith('CHE-') || idOrSku.startsWith('DY-') || name.includes('cheese') || name.includes('paneer') || name.includes('butter') || name.includes('ghee') || name.includes('milk')) {
                  if (name.includes('butter')) {
                    e.target.src = '/products/milky_mist_table_butter.png';
                  } else if (name.includes('spread') || name.includes('cheese')) {
                    e.target.src = '/products/milky_mist_cheese_spread.png';
                  } else {
                    e.target.src = '/products/milky_mist_paneer.png';
                  }
                } else if (cat.includes('masala') || cat.includes('spice') || idOrSku.startsWith('MAS-') || name.includes('masala') || name.includes('chilli') || name.includes('turmeric') || name.includes('powder')) {
                  if (name.includes('turmeric')) {
                    e.target.src = '/products/eastern_turmeric_powder.jpg';
                  } else if (name.includes('chilli')) {
                    e.target.src = '/products/aachi_chilli_powder.jpg';
                  } else {
                    e.target.src = '/products/sakthi_garam_masala.jpg';
                  }
                } else {
                  e.target.src = '/products/veg_potato.png';
                }
              }}
              className="max-h-40 sm:max-h-48 max-w-full object-contain drop-shadow-sm group-hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Right: Product Meta & Purchase Panel */}
          <div className="sm:col-span-7 space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  {product.category}
                </span>
                {product.brand && (
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Brand: {product.brand}
                  </span>
                )}
              </div>

              <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white leading-tight">
                {product.name}
              </h2>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-medium mt-1">
                <div className="flex items-center text-amber-500 font-bold gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500" />
                  <span>{product.rating || 4.8} / 5.0</span>
                </div>
                <span className="font-mono text-slate-400">SKU: {product.sku}</span>
                {product.expiryDate && (
                  <span className="text-amber-600 dark:text-amber-400 font-semibold">
                    Exp: {product.expiryDate}
                  </span>
                )}
              </div>
            </div>

            {/* Pricing Section */}
            <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 line-through font-semibold block leading-tight">
                  MRP: ₹{formatPrice(displayOriginalPrice)}
                </span>
                <span className="text-xl sm:text-2xl font-black text-red-600 dark:text-red-500 leading-none">
                  ₹{formatPrice(displayPrice)}
                </span>
                <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold block mt-0.5">
                  (Inclusive of all taxes)
                </span>
              </div>

              <div className="text-right">
                <span className={`inline-block text-[10px] sm:text-xs font-bold px-2.5 py-1 rounded-full ${isOutOfStock ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'}`}>
                  {isOutOfStock ? 'Out of Stock' : `${product.stock} Units Available`}
                </span>
              </div>
            </div>

            {/* Pack Size Selector */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">
                Select Pack Size:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {weightOptions.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => {
                      playClick();
                      setSelectedWeight(opt);
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                      selectedWeight === opt
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/20'
                        : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-emerald-500/50'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Counter & Add Buttons */}
            <div className="flex items-center gap-2.5 pt-0.5">
              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 p-0.5">
                <button
                  onClick={() => {
                    playClick();
                    setQuantity((q) => Math.max(1, q - 1));
                  }}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-8 text-center font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => {
                    playClick();
                    setQuantity((q) => q + 1);
                  }}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 text-white font-bold py-2.5 px-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer transition-all"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>ADD TO BASKET</span>
              </button>
            </div>

            {/* Delivery & Quality Badges */}
            <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
              <div className="flex items-center justify-center gap-1 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60 text-center">
                <Truck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">10-Min Delivery</span>
              </div>
              <div className="flex items-center justify-center gap-1 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">100% Authentic</span>
              </div>
              <div className="flex items-center justify-center gap-1 p-1.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800/60 text-center">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">Easy Return</span>
              </div>
            </div>
          </div>
        </div>

        {/* Description & Specification */}
        <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-1">
          <h3 className="font-bold text-xs text-slate-900 dark:text-white uppercase tracking-wider">Product Overview</h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            {product.description ||
              `Premium quality ${product.name} sourced from trusted supplier ${
                product.supplier || 'SmartMart Approved Vendors'
              }. Carefully packaged under hygienic conditions to retain max freshness, flavor, and essential nutrients.`}
          </p>
        </div>

        {/* Related Products Section */}
        {relatedProducts.length > 0 && (
          <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
            <h3 className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
              <span>Related {product.category} Products</span>
              <span className="text-[11px] font-bold text-emerald-600 hover:text-emerald-500 cursor-pointer">View All</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {relatedProducts.map((rel) => (
                <div
                  key={rel.sku}
                  onClick={() => onSelectProduct && onSelectProduct(rel)}
                  className="bg-slate-50 dark:bg-slate-950 rounded-xl p-2 border border-slate-200/70 dark:border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="h-16 flex items-center justify-center p-1 bg-white dark:bg-slate-900 rounded-lg mb-1.5">
                    <img
                      src={getProductImage(rel)}
                      alt={rel.name}
                      onError={(e) => {
                        e.target.onerror = null;
                        const idOrSku = rel.sku || rel.id || '';
                        const name = (rel.name || '').toLowerCase();
                        const cat = (rel.category || '').toLowerCase();
                        if (idOrSku.startsWith('CHK-') || name.includes('chocolate') || name.includes('polo') || name.includes('snickers')) {
                          e.target.src = '/products/snickers_chocolate_bar.jpg';
                        } else if (cat.includes('bev') || idOrSku.startsWith('TEA-') || idOrSku.startsWith('COF-') || idOrSku.startsWith('BEV-') || name.includes('tea') || name.includes('coffee') || name.includes('juice') || name.includes('drink')) {
                          if (name.includes('coffee') || idOrSku.startsWith('COF-')) {
                            e.target.src = '/products/nescafe_sunrise_coffee.png';
                          } else if (name.includes('tea') || idOrSku.startsWith('TEA-')) {
                            e.target.src = '/products/avt_natures_cup_tea.png';
                          } else {
                            e.target.src = '/products/frooti_mango_drink.png';
                          }
                        } else if (cat.includes('dairy') || cat.includes('chilled') || cat.includes('cheese') || cat.includes('butter') || cat.includes('paneer') || idOrSku.startsWith('CHE-') || idOrSku.startsWith('DY-') || name.includes('cheese') || name.includes('paneer') || name.includes('butter') || name.includes('ghee') || name.includes('milk')) {
                          if (name.includes('butter')) {
                            e.target.src = '/products/milky_mist_table_butter.png';
                          } else if (name.includes('spread') || name.includes('cheese')) {
                            e.target.src = '/products/milky_mist_cheese_spread.png';
                          } else {
                            e.target.src = '/products/milky_mist_paneer.png';
                          }
                        } else if (cat.includes('masala') || cat.includes('spice') || idOrSku.startsWith('MAS-') || name.includes('masala') || name.includes('chilli') || name.includes('turmeric') || name.includes('powder')) {
                          if (name.includes('turmeric')) {
                            e.target.src = '/products/eastern_turmeric_powder.jpg';
                          } else if (name.includes('chilli')) {
                            e.target.src = '/products/aachi_chilli_powder.jpg';
                          } else {
                            e.target.src = '/products/sakthi_garam_masala.jpg';
                          }
                        } else {
                          e.target.src = '/products/veg_potato.png';
                        }
                      }}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[11px] text-slate-900 dark:text-white line-clamp-1">{rel.name}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-[11px] text-red-600">₹{rel.price}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playSuccess();
                          addToCart(rel);
                        }}
                        className="p-1 rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition-colors"
                        title="Add to cart"
                      >
                        <ShoppingCart className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
