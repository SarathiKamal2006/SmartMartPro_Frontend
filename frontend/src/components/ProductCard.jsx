import React, { useState } from 'react';
import { ShoppingCart, Heart, Trash2, Check, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { useSoundEffects } from '../hooks/useCustomHooks';
import { getProductImage } from '../data/productImages';

export default function ProductCard({ 
  product, 
  onOpenDetails, 
  wishlist = [], 
  toggleWishlist, 
  onDelete,
  variant = 'default' 
}) {
  const { cart, addToCart, showToast } = useApp();
  const { t } = useLanguage();
  const { playSuccess, playClick } = useSoundEffects();

  const defaultWeight = product.selectedWeight || product.packSize || product.unit || '1 Unit';
  const [currentWeight, setCurrentWeight] = useState(defaultWeight);
  const [justAdded, setJustAdded] = useState(false);

  const weightOptions = product.weightOptions || product.packSizes || [];

  // Weight price multiplier calculation
  const getWeightMultiplier = (baseWeight, selectedWeight) => {
    if (!selectedWeight || !baseWeight || selectedWeight === baseWeight) return 1;
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
    const currG = parseGrams(selectedWeight);
    if (!baseG || isNaN(baseG) || baseG === 0) return 1;
    return currG / baseG;
  };

  const multiplier = getWeightMultiplier(product.baseWeight || defaultWeight, currentWeight);
  const displayPrice = (product.price || 0) * multiplier;
  const rawOrig = product.originalPrice || (product.price ? product.price * 1.15 : 0);
  const displayOriginalPrice = rawOrig * multiplier;

  const formatPrice = (val) => (val % 1 === 0 ? val.toFixed(0) : val.toFixed(2));

  const isWishlisted = wishlist.includes(product.id || product.sku);
  const cartItem = cart.find((item) => item.product.id === product.id || item.product.sku === product.sku);
  const qtyInCart = cartItem ? cartItem.quantity : 0;

  const isOutOfStock = product.stock <= 0 || product.status === 'Out of Stock';

  const handleAdd = (e) => {
    e.stopPropagation();
    if (isOutOfStock) return;
    playSuccess();
    const itemToAdd = {
      ...product,
      price: displayPrice,
      unit: currentWeight,
      name: `${product.name} (${currentWeight})`
    };
    addToCart(itemToAdd);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const rawDiscount = product.discount || (product.discountPercentage ? `${product.discountPercentage}% OFF` : null);
  const isPercentageOffer = typeof rawDiscount === 'string' && (rawDiscount.includes('%') || rawDiscount.includes('OFF'));
  const hasOffer = Boolean(product.discountPercentage > 0 || isPercentageOffer || (displayOriginalPrice > displayPrice));
  const discountLabel = product.discount || (product.discountPercentage ? `${product.discountPercentage}% OFF` : 'OFFER');

  return (
    <div
      onClick={() => onOpenDetails && onOpenDetails(product)}
      className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 flex flex-col justify-between h-full shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative"
    >
      <div>
        {/* Product Image Area */}
        <div className="relative h-36 sm:h-40 flex items-center justify-center p-2 mb-2 bg-slate-50/50 dark:bg-slate-950/40 rounded-xl overflow-hidden">
          {hasOffer && discountLabel && !product.hideDiscountTag && (
            <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs uppercase tracking-wider z-10">
              {discountLabel}
            </span>
          )}

          {/* Stock Status if out or low */}
          {isOutOfStock && (
            <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500 text-white z-10">
              Out of Stock
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
              if (idOrSku.startsWith('RTE-') || cat.includes('ready to eat') || cat.includes('rte')) {
                if (idOrSku === 'RTE-001') e.target.src = '/products/aachi_mango_thokku_pickle.svg';
                else if (idOrSku === 'RTE-002') e.target.src = '/products/aachi_tomato_garlic_pickle.svg';
                else if (idOrSku === 'RTE-003') e.target.src = '/products/kissan_schezwan_sauce.svg';
                else if (idOrSku === 'RTE-004') e.target.src = '/products/slurrp_farm_banana_choco_pancake.svg';
                else if (idOrSku === 'RTE-005') e.target.src = '/products/knorr_pizza_pasta_sauce.svg';
                else if (idOrSku === 'RTE-006') e.target.src = '/products/mambalam_iyers_mango_thokku.svg';
                else if (idOrSku === 'RTE-007') e.target.src = '/products/saffola_oats_classic_masala.svg';
                else if (idOrSku === 'RTE-008') e.target.src = '/products/aachi_mango_avakkai_pickle.svg';
                else if (idOrSku === 'RTE-009') e.target.src = '/products/lion_kashmir_honey.svg';
                else if (idOrSku === 'RTE-010') e.target.src = '/products/bauli_savoriz_cheese_jalapeno.svg';
                else if (idOrSku === 'RTE-011') e.target.src = '/products/kwality_muesli_fruit_nut.svg';
                else if (idOrSku === 'RTE-012') e.target.src = '/products/aachi_lime_pickle_pouch.svg';
                else if (idOrSku === 'RTE-013') e.target.src = '/products/aachi_mango_ginger_pickle.svg';
                else if (idOrSku === 'RTE-014') e.target.src = '/products/disano_pastalicious_penne.svg';
                else if (idOrSku === 'RTE-015') e.target.src = '/products/kelloggs_oats_nutritionists.svg';
                else if (idOrSku === 'RTE-016') e.target.src = '/products/kelloggs_muesli_fruit_magic.svg';
                else if (name.includes('pickle') || name.includes('thokku')) e.target.src = '/products/aachi_mango_thokku_pickle.svg';
                else if (name.includes('sauce') || name.includes('mayo')) e.target.src = '/products/kissan_schezwan_sauce.svg';
                else if (name.includes('oats')) e.target.src = '/products/saffola_oats_classic_masala.svg';
                else if (name.includes('muesli')) e.target.src = '/products/kwality_muesli_fruit_nut.svg';
                else e.target.src = '/products/aachi_mango_thokku_pickle.svg';
              } else if (idOrSku.startsWith('CHK-') || name.includes('chocolate') || name.includes('polo') || name.includes('snickers') || name.includes('bar') || name.includes('munch')) {
                e.target.src = '/products/snickers_chocolate_bar.jpg';
              } else if (cat.includes('bev') || idOrSku.startsWith('TEA-') || idOrSku.startsWith('COF-') || idOrSku.startsWith('BEV-') || name.includes('tea') || name.includes('coffee') || name.includes('juice') || name.includes('drink')) {
                if (name.includes('coffee') || idOrSku.startsWith('COF-')) {
                  e.target.src = '/products/nescafe_sunrise_coffee.png';
                } else if (name.includes('tea') || idOrSku.startsWith('TEA-')) {
                  e.target.src = '/products/avt_natures_cup_tea.png';
                } else {
                  e.target.src = '/products/frooti_mango_drink.png';
                }
              } else if (cat.includes('dairy') || cat.includes('chilled') || idOrSku.startsWith('CHE-') || idOrSku.startsWith('DY-')) {
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
            className="max-h-32 sm:max-h-36 max-w-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-xs"
          />

        </div>

        {/* Title */}
        <h4 className="font-semibold text-xs sm:text-sm text-slate-800 dark:text-slate-100 line-clamp-2 h-9 leading-snug">
          {t(product.name)}
        </h4>

        {/* Pack Size / Weight Selection */}
        <div className="mt-2 min-h-[28px]" onClick={(e) => e.stopPropagation()}>
          {weightOptions && weightOptions.length > 1 ? (
            <select
              value={currentWeight}
              onChange={(e) => {
                playClick();
                setCurrentWeight(e.target.value);
              }}
              className="w-full border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer shadow-2xs"
            >
              {weightOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <div className="text-xs text-slate-500 font-medium py-1">
              {currentWeight}
            </div>
          )}
        </div>

        {/* Price Row: Original Price Strikethrough & Bold Red Sale Price */}
        <div className="flex items-center gap-2 pt-2 pb-1">
          {displayOriginalPrice > displayPrice && (
            <span className="text-xs text-slate-500 line-through font-medium">
              ₹{formatPrice(displayOriginalPrice)}
            </span>
          )}
          <span className="text-sm font-black text-red-600 dark:text-red-500">
            ₹{formatPrice(displayPrice)}
          </span>
        </div>
      </div>

      {/* Add To Cart & Actions Row */}
      <div className="pt-2 mt-auto">
        <div className="flex items-center gap-1.5">
          <button
            disabled={isOutOfStock}
            onClick={handleAdd}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              justAdded
                ? 'bg-emerald-800 text-white'
                : qtyInCart > 0
                ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                : 'bg-emerald-700 hover:bg-emerald-600 text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-200" />
                <span>Added!</span>
              </>
            ) : qtyInCart > 0 ? (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Add to Cart ({qtyInCart})</span>
              </>
            ) : (
              <span>Add to Cart</span>
            )}
          </button>

          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(product.id || product.sku);
              }}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-600 hover:border-rose-300 transition-colors shrink-0"
              title="Delete SKU"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}

          {toggleWishlist && !onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleWishlist(product.id || product.sku);
              }}
              className={`p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-200 transition-colors shrink-0 ${
                isWishlisted ? 'text-rose-500 bg-rose-50 dark:bg-rose-950/40 border-rose-300' : ''
              }`}
              title="Add to Wishlist"
            >
              <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
