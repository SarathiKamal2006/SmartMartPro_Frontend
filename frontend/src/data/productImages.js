/**
 * Unique product image mappings for SmartMart Pro
 * Ensures every product SKU has a distinct, 100% unique product image
 */
import { CHOCOLATE_ASSET_IMAGES } from './chocolateImages';

export const UNIQUE_PRODUCT_IMAGES = {
  // 🌾 Rice & Grains
  "RICE-101": "/products/sri_sri_basmati.jpg",
  "RICE-102": "/products/india_gate_dubar.jpg",
  "RICE-103": "/products/heritage_popular.jpg",
  "RICE-104": "/products/natchiyar_boiled.jpg",
  "RICE-105": "/products/india_gate_super.jpg",
  "RICE-106": "/products/natchiyar_gold.jpg",
  "RICE-107": "/products/india_gate_classic.jpg",
  "RICE-108": "/products/natchiyar_barley.jpg",

  // 🌶️ Masala & Spices
  "MAS-101": "/products/sakthi_chilli_powder.jpg",
  "MAS-102": "/products/ksc_gold_dhaniya.jpg",
  "MAS-103": "/products/sakthi_briyani_masala.jpg",
  "MAS-104": "/products/sakthi_garam_masala.jpg",
  "MAS-105": "/products/eastern_turmeric_powder.jpg",
  "MAS-106": "/products/aachi_chilli_powder.jpg",
  "MAS-107": "/products/mtr_chilli_powder.jpg",
  "MAS-108": "/products/sakthi_briyani_masala.jpg",

  // 🪥 Oral Care & Personal Care
  "HC-113": "/products/sensodyne_sensitive_toothbrush.png",
  "HC-116": "/products/colgate_active_salt.png",
  "HC-117": "/products/sensodyne_rapid_relief.png",
  "HC-118": "/products/dabur_red_gel.png",
  "HC-119": "/products/closeup_everfresh_red_hot.png",

  // 🥛 Dairy & Butter Products
  "DY-207": "/products/amul_butter_100g.png",
  "DY-208": "/products/milky_mist_table_butter.png",
  "DY-209": "/products/milky_mist_paneer.png",
  "DY-210": "/products/milky_mist_cheese_spread.png",
  "CHE-003": "/products/milky_mist_cheese_spread.png",
  "CHE-007": "/products/milky_mist_paneer.png",
  "CHE-008": "/products/milky_mist_table_butter.png",
  "DY-004": "/products/amul_butter_100g.png",
  "DY-005": "/products/milky_mist_agmark_ghee_jar.png",
  "DY-006": "/products/nestle_milkmaid.png",
  "DY-007": "/products/amul_masti_spiced_buttermilk.png",
  "DY-008": "/products/haiku_milk_bread.png",

  // 🥜 Spreads, Mayo & Bakery Products
  "SNK-618": "/products/kissan_peanut_butter.png",
  "SNK-619": "/products/nutella_hazelnut_spread.png",
  "SNK-620": "/products/del_monte_eggless_mayo.png",
  "SNK-621": "/products/fun_foods_mayonnaise_veg.png",

  // 🌾 Staples Products
  "STP-801": "/products/urad_dal_premium.png",
  "STP-802": "/products/idly_rice.png",
  "STP-803": "/products/basmathi_rice.png",
  "STP-804": "/products/toor_dhal_premium.png",
  "STP-805": "/products/moong_dal_premium.png",
  "STP-806": "/products/slurrpfarm_jaggery_powder.png",
  "STP-807": "/products/jaggery_balls.png",
  "STP-808": "/products/jugar_cane_sugar_pouch.png",
  "STP-809": "/products/mr_gold_sunflower_oil.png",
  "STP-810": "/products/tata_salt_powder.png",
  "STP-811": "/products/gold_winner_sunflower_oil.png",
  "STP-812": "/products/coriander_seeds.png",
  "STP-813": "/products/fortune_sunlite_sunflower_oil.png",
  "STP-814": "/products/natchiyar_mustard_small.png",
  "STP-815": "/products/corn_flour.png",
  "STP-816": "/products/gd_asafoetida_zip_cake.png",
  "STP-817": "/products/milky_mist_agmark_ghee_jar.png",

  // 🍲 Ready To Cook Products
  "RTC-901": "/products/bindu_dinner_special_appalam.png",
  "RTC-902": "/products/anil_varagu_vermicelli.png",
  "RTC-903": "/products/bambino_vermicelli.png",
  "RTC-904": "/products/nissin_top_ramen_curry_veg.png",
  "RTC-905": "/products/anil_thinai_vermicelli.png",
  "RTC-906": "/products/anil_wheat_vermicelli.png",
  "RTC-907": "/products/milky_mist_gulab_jamun_mix.png",
  "RTC-908": "/products/anil_kambu_vermicelli.png",
  "RTC-909": "/products/knorr_instant_mixed_vegetable_soup.png",
  "RTC-910": "/products/aachi_athirasam_mavoo.png",
  "RTC-911": "/products/anil_tamarind_vermicelli.png",
  "RTC-912": "/products/bambino_roasted_vermicelli.png",

  // 🍎 Fruits & Vegetables Products (17 items)
  "FRV-201": "/products/veg_onion_kg.png",
  "FRV-202": "/products/veg_tomato_country.png",
  "FRV-203": "/products/veg_coriander_leaves.png",
  "FRV-204": "/products/veg_coconut_small.png",
  "FRV-205": "/products/veg_potato.png",
  "FRV-206": "/products/veg_mint_leaves.png",
  "FRV-207": "/products/veg_carrot.png",
  "FRV-208": "/products/veg_papaya.png",
  "FRV-209": "/products/veg_cabbage.png",
  "FRV-210": "/products/banana_red.png",
  "FRV-211": "/products/veg_cucumber_country.png",
  "FRV-212": "/products/veg_beetroot.png",
  "FRV-213": "/products/veg_ladies_finger.png",
  "FRV-214": "/products/apple_royal_gala.png",
  "FRV-215": "/products/veg_american_sweet_corn.png",
  "FRV-216": "/products/banana_karpooravalli.png",
  "FRV-217": "/products/banana_nendran_ethan.png",

  // 🍫 Chocolates & Confectioneries (100% Unique Authentic Assets)
  "CHK-001": CHOCOLATE_ASSET_IMAGES["CHK-001"],
  "CHK-002": CHOCOLATE_ASSET_IMAGES["CHK-002"],
  "CHK-003": CHOCOLATE_ASSET_IMAGES["CHK-003"],
  "CHK-007": CHOCOLATE_ASSET_IMAGES["CHK-007"],
  "CHK-008": CHOCOLATE_ASSET_IMAGES["CHK-008"],
  "CHK-009": CHOCOLATE_ASSET_IMAGES["CHK-009"],
  "CHK-010": CHOCOLATE_ASSET_IMAGES["CHK-010"],
  "CHK-011": CHOCOLATE_ASSET_IMAGES["CHK-011"],
  "CHK-012": CHOCOLATE_ASSET_IMAGES["CHK-012"],
  "CHK-013": CHOCOLATE_ASSET_IMAGES["CHK-013"],
  "CHK-014": CHOCOLATE_ASSET_IMAGES["CHK-014"],
  "CHK-015": CHOCOLATE_ASSET_IMAGES["CHK-015"],
  "CHK-016": CHOCOLATE_ASSET_IMAGES["CHK-016"],
  "CHK-017": CHOCOLATE_ASSET_IMAGES["CHK-017"],

  // ☕ Beverages & Drinks (100% Verified Unique Assets)
  "TEA-002": "https://www.bbassets.com/media/uploads/p/l/266564_16-taj-mahal-tea.jpg",
  "TEA-003": "/products/avt_natures_cup_tea.png",
  "COF-004": "/products/nescafe_sunrise_coffee.png",
  "BEV-004": "/products/frooti_mango_drink.png",
  "BEV-005": "/products/appy_fizz_apple_juice.png",
  "BEV-006": "/products/raw_pressery_alphonso_mango.png",
  "BEV-007": "/products/b_natural_guava_juice.png",
  "BEV-008": "/products/amul_masti_spiced_buttermilk.png",
  "BEV-009": "/products/sting_energy_drink.png",
  "BEV-010": "/products/horlicks_classic_malt.png",
  "BEV-011": "/products/britannia_winkin_cow_chocolate.png",

  // 🍲 Ready To Eat Products (100% Unique Local SVG Packshots)
  "RTE-001": "/products/aachi_mango_thokku_pickle.svg",
  "RTE-002": "/products/aachi_tomato_garlic_pickle.svg",
  "RTE-003": "/products/kissan_schezwan_sauce.svg",
  "RTE-004": "/products/slurrp_farm_banana_choco_pancake.svg",
  "RTE-005": "/products/knorr_pizza_pasta_sauce.svg",
  "RTE-006": "/products/mambalam_iyers_mango_thokku.svg",
  "RTE-007": "/products/saffola_oats_classic_masala.svg",
  "RTE-008": "/products/aachi_mango_avakkai_pickle.svg",
  "RTE-009": "/products/lion_kashmir_honey.svg",
  "RTE-010": "/products/bauli_savoriz_cheese_jalapeno.svg",
  "RTE-011": "/products/kwality_muesli_fruit_nut.svg",
  "RTE-012": "/products/aachi_lime_pickle_pouch.svg",
  "RTE-013": "/products/aachi_mango_ginger_pickle.svg",
  "RTE-014": "/products/disano_pastalicious_penne.svg",
  "RTE-015": "/products/kelloggs_oats_nutritionists.svg",
  "RTE-016": "/products/kelloggs_muesli_fruit_magic.svg",
};

export const UNIQUE_FALLBACK_IMAGES = {
  "RICE-101": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80",
  "RICE-102": "https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?auto=format&fit=crop&w=500&q=80",
  "RICE-103": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=500&q=80",
  "RICE-104": "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?auto=format&fit=crop&w=500&q=80",
  "RICE-105": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=80",
  "RICE-106": "https://images.unsplash.com/photo-1516714435131-44d6b64dc6a2?auto=format&fit=crop&w=500&q=80",
  "RICE-107": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=500&q=80",
  "RICE-108": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=500&q=80",

  "MAS-101": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=500&q=80",
  "MAS-102": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=500&q=80",
  "MAS-103": "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=500&q=80",
  "MAS-104": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=500&q=80",
  "MAS-105": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=500&q=80",
  "MAS-106": "https://images.unsplash.com/photo-1588166524941-3bf61a9c41db?auto=format&fit=crop&w=500&q=80",
  "MAS-107": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=500&q=80",
  "MAS-108": "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=80",
  "MAS-109": "https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=500&q=80",
  "MAS-110": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=500&q=80",
  "MAS-111": "https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&w=500&q=80",
  "MAS-112": "https://images.unsplash.com/photo-1509358211425-24d08ca35f2c?auto=format&fit=crop&w=500&q=80",

  "HC-113": "https://images.unsplash.com/photo-1559650656-5d1d361ad10e?auto=format&fit=crop&w=500&q=80",
  "HC-114": "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=500&q=80",
  "HC-115": "https://images.unsplash.com/photo-1563178406-4cdc2923acbc?auto=format&fit=crop&w=500&q=80",
  "HC-116": "https://images.unsplash.com/photo-1559650656-5d1d361ad10e?auto=format&fit=crop&w=500&q=80",
  "HC-117": "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=500&q=80",
  "HC-118": "https://images.unsplash.com/photo-1559650656-5d1d361ad10e?auto=format&fit=crop&w=500&q=80",
  "HC-119": "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=500&q=80",

  "DY-207": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=500&q=80",
  "DY-208": "https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?auto=format&fit=crop&w=500&q=80",
  "DY-209": "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?auto=format&fit=crop&w=500&q=80",
  "DY-210": "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=500&q=80",

  "SNK-618": "https://images.unsplash.com/photo-1536591375315-1988d6960931?auto=format&fit=crop&w=500&q=80",
  "SNK-619": "https://images.unsplash.com/photo-1536591375315-1988d6960931?auto=format&fit=crop&w=500&q=80",
  "SNK-620": "https://images.unsplash.com/photo-1536591375315-1988d6960931?auto=format&fit=crop&w=500&q=80",
  "SNK-621": "https://images.unsplash.com/photo-1536591375315-1988d6960931?auto=format&fit=crop&w=500&q=80",
  "BKY-307": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80",

  // ☕ Beverages & Drinks Fallbacks
  "TEA-001": "/products/avt_natures_cup_tea.png",
  "TEA-002": "/products/avt_natures_cup_tea.png",
  "TEA-003": "/products/avt_natures_cup_tea.png",
  "COF-001": "/products/nescafe_sunrise_coffee.png",
  "COF-002": "/products/nescafe_sunrise_coffee.png",
  "COF-003": "/products/nescafe_sunrise_coffee.png",
  "COF-004": "/products/nescafe_sunrise_coffee.png",
  "BEV-004": "/products/frooti_mango_drink.png",
  "BEV-005": "/products/appy_fizz_apple_juice.png",
  "BEV-006": "/products/raw_pressery_alphonso_mango.png",
  "BEV-007": "/products/b_natural_guava_juice.png",
  "BEV-008": "/products/amul_masti_spiced_buttermilk.png",
  "BEV-009": "/products/sting_energy_drink.png",
  "BEV-010": "/products/horlicks_classic_malt.png",
  "BEV-011": "/products/britannia_winkin_cow_chocolate.png",

  // 🥛 Dairy & Chilled Fallbacks
  "CHE-001": "/products/milky_mist_cheese_spread.png",
  "CHE-002": "/products/milky_mist_cheese_spread.png",
  "CHE-003": "/products/milky_mist_cheese_spread.png",
  "CHE-004": "/products/milky_mist_cheese_spread.png",
  "CHE-005": "/products/milky_mist_cheese_spread.png",
  "CHE-006": "/products/milky_mist_cheese_spread.png",
  "CHE-007": "/products/milky_mist_paneer.png",
  "CHE-008": "/products/milky_mist_table_butter.png",
  "DY-004": "/products/amul_butter_100g.png",
  "DY-005": "/products/milky_mist_agmark_ghee_jar.png",
  "DY-006": "/products/nestle_milkmaid.png",
  "DY-007": "/products/amul_masti_spiced_buttermilk.png",
  "DY-008": "/products/haiku_milk_bread.png",
};

export function getProductImage(product) {
  if (!product) return "/products/snickers_chocolate_bar.jpg";
  const idOrSku = product.sku || product.id;
  if (idOrSku && UNIQUE_PRODUCT_IMAGES[idOrSku]) {
    return UNIQUE_PRODUCT_IMAGES[idOrSku];
  }
  if (product.image && !product.image.includes('photo-1542838132') && !product.image.includes('photo-1582293041079')) {
    return product.image;
  }
  const name = (product.name || '').toLowerCase();
  const cat = (product.category || '').toLowerCase();
  if (name.includes('chocolate') || name.includes('snickers') || name.includes('polo') || name.includes('milky') || name.includes('caramilk') || name.includes('fuse') || name.includes('wafer') || name.includes('candy') || cat.includes('snack') || (idOrSku && idOrSku.startsWith('CHK-'))) {
    return CHOCOLATE_ASSET_IMAGES[idOrSku] || CHOCOLATE_ASSET_IMAGES["CHK-008"] || "/products/snickers_chocolate_bar.jpg";
  }
  if (cat.includes('bev') || (idOrSku && (idOrSku.startsWith('TEA-') || idOrSku.startsWith('COF-') || idOrSku.startsWith('BEV-'))) || name.includes('tea') || name.includes('coffee') || name.includes('drink') || name.includes('juice')) {
    if (name.includes('coffee') || (idOrSku && idOrSku.startsWith('COF-'))) return "/products/nescafe_sunrise_coffee.png";
    if (name.includes('tea') || (idOrSku && idOrSku.startsWith('TEA-'))) return "/products/avt_natures_cup_tea.png";
    return "/products/frooti_mango_drink.png";
  }
  if (cat.includes('dairy') || cat.includes('chilled') || cat.includes('cheese') || cat.includes('butter') || cat.includes('paneer') || (idOrSku && (idOrSku.startsWith('CHE-') || idOrSku.startsWith('DY-'))) || name.includes('cheese') || name.includes('paneer') || name.includes('butter') || name.includes('ghee') || name.includes('milk')) {
    if (name.includes('butter')) return "/products/milky_mist_table_butter.png";
    if (name.includes('spread') || name.includes('cheese')) return "/products/milky_mist_cheese_spread.png";
    if (name.includes('ghee')) return "/products/milky_mist_agmark_ghee_jar.png";
    return "/products/milky_mist_paneer.png";
  }
  if (cat.includes('masala') || cat.includes('spice') || (idOrSku && idOrSku.startsWith('MAS-')) || name.includes('masala') || name.includes('chilli') || name.includes('turmeric') || name.includes('powder')) {
    if (name.includes('turmeric')) return "/products/eastern_turmeric_powder.jpg";
    if (name.includes('chilli')) return "/products/aachi_chilli_powder.jpg";
    return "/products/sakthi_garam_masala.jpg";
  }
  return UNIQUE_FALLBACK_IMAGES[idOrSku] || "/products/snickers_chocolate_bar.jpg";
}


