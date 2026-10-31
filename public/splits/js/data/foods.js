// Foods for the Diet tab. Values are per 100 g as eaten (state noted), rounded
// and approximate, from USDA FoodData Central, IFCT 2017 (India) and MEXT
// (Japan). Brands and recipes vary; check labels for exact numbers.
//
// diet: vegan < veg (adds dairy) < egg < nonveg (meat, fish).
// rich: nutrients the food is a good source of (roughly >=20% of daily value
// per 100 g or a normal serving). countries: where it's commonly sold.
(function (WS) {
  WS.DIETS = {
    vegan: { label: 'Vegan', short: 'Vegan', includes: ['vegan'] },
    veg: { label: 'Vegetarian (adds dairy)', short: 'Veg', includes: ['vegan', 'veg'] },
    egg: { label: 'Vegetarian + eggs', short: 'Egg', includes: ['vegan', 'veg', 'egg'] },
    nonveg: { label: 'Everything (adds meat & fish)', short: 'Non-veg', includes: ['vegan', 'veg', 'egg', 'nonveg'] },
  };

  WS.COUNTRIES = { IN: 'India', US: 'United States', UK: 'United Kingdom', CN: 'China', JP: 'Japan' };

  WS.NUTRIENTS = {
    a: 'Vitamin A', b12: 'Vitamin B12', c: 'Vitamin C', d: 'Vitamin D', e: 'Vitamin E', k: 'Vitamin K',
    folate: 'Folate', iron: 'Iron', calcium: 'Calcium', magnesium: 'Magnesium', potassium: 'Potassium',
    zinc: 'Zinc', omega3: 'Omega-3', iodine: 'Iodine',
  };

  const ALL = ['IN', 'US', 'UK', 'CN', 'JP'];
  // F(id, name, diet, kcal, protein, carbs, fat, fibre (null = not listed), rich, countries, note)
  const F = (id, name, diet, kcal, p, c, f, fib, rich, countries, note) =>
    ({ id, name, diet, kcal, p, c, f, fib, rich, countries: countries || ALL, note: note || '' });

  WS.FOODS = [
    // Meat & fish
    F('chicken-breast', 'Chicken breast (cooked)', 'nonveg', 165, 31, 0, 3.6, 0, []),
    F('chicken-thigh', 'Chicken thigh (cooked)', 'nonveg', 209, 26, 0, 10.9, 0, ['zinc']),
    F('turkey-breast', 'Turkey breast (cooked)', 'nonveg', 147, 30, 0, 2, 0, [], ['US', 'UK']),
    F('lean-beef', 'Lean beef sirloin (cooked)', 'nonveg', 201, 29, 0, 9, 0, ['b12', 'zinc', 'iron'], ['US', 'UK', 'CN', 'JP']),
    F('pork-tenderloin', 'Pork tenderloin (cooked)', 'nonveg', 143, 26, 0, 3.5, 0, [], ['US', 'UK', 'CN', 'JP']),
    F('lamb', 'Lamb / mutton (cooked)', 'nonveg', 258, 25.5, 0, 16.5, 0, ['b12', 'zinc']),
    F('chicken-liver', 'Chicken liver (cooked)', 'nonveg', 167, 24.5, 0.9, 6.5, 0, ['a', 'b12', 'folate', 'iron'], ALL, 'Very high in vitamin A; once or twice a week is plenty.'),
    F('beef-liver', 'Beef liver (cooked)', 'nonveg', 191, 29.1, 5.1, 5.3, 0, ['a', 'b12', 'folate', 'iron', 'zinc'], ['US', 'UK', 'CN', 'JP'], 'Very high in vitamin A; avoid large amounts in pregnancy.'),
    F('salmon', 'Salmon (cooked)', 'nonveg', 206, 22, 0, 12, 0, ['d', 'b12', 'omega3']),
    F('mackerel', 'Mackerel (cooked)', 'nonveg', 262, 23.9, 0, 17.8, 0, ['d', 'b12', 'omega3']),
    F('sardines', 'Sardines (canned, drained)', 'nonveg', 208, 24.6, 0, 11.5, 0, ['d', 'b12', 'omega3', 'calcium'], ALL, 'Eat the soft bones for the calcium.'),
    F('tuna', 'Tuna (canned in water)', 'nonveg', 116, 25.5, 0, 0.8, 0, ['b12']),
    F('cod', 'Cod (cooked)', 'nonveg', 105, 22.8, 0, 0.9, 0, ['b12', 'iodine'], ['US', 'UK', 'CN', 'JP']),
    F('tilapia', 'Tilapia (cooked)', 'nonveg', 128, 26.2, 0, 2.7, 0, ['b12'], ['US', 'UK', 'CN', 'IN']),
    F('shrimp', 'Shrimp / prawns (cooked)', 'nonveg', 99, 24, 0.2, 0.3, 0, ['b12', 'iodine']),
    F('oysters', 'Oysters (raw)', 'nonveg', 81, 9.5, 5, 2.3, 0, ['b12', 'zinc', 'iron'], ['US', 'UK', 'CN', 'JP']),
    F('eel', 'Eel / unagi (cooked)', 'nonveg', 236, 23.7, 0, 15, 0, ['a', 'd', 'b12', 'e'], ['JP', 'CN']),
    F('cod-liver-oil', 'Cod liver oil', 'nonveg', 902, 0, 0, 100, 0, ['a', 'd', 'omega3'], ['US', 'UK', 'IN'], 'A teaspoon (5 ml) covers vitamin D; do not exceed the label dose.'),

    // Eggs
    F('egg', 'Whole egg', 'egg', 143, 12.6, 0.7, 9.5, 0, ['b12']),
    F('egg-white', 'Egg white', 'egg', 52, 10.9, 0.7, 0.2, 0, []),

    // Dairy
    F('paneer', 'Paneer', 'veg', 265, 18.3, 1.2, 20.8, 0, ['calcium'], ['IN', 'UK']),
    F('greek-yogurt', 'Greek yogurt (non-fat)', 'veg', 59, 10.2, 3.6, 0.4, 0, ['calcium', 'b12'], ['US', 'UK', 'JP']),
    F('curd', 'Plain yogurt / curd (whole milk)', 'veg', 61, 3.5, 4.7, 3.3, 0, ['calcium']),
    F('milk', 'Milk (whole)', 'veg', 61, 3.2, 4.8, 3.3, 0, ['calcium', 'b12'], ALL, 'US milk is fortified with vitamin D.'),
    F('skim-milk', 'Milk (skimmed)', 'veg', 34, 3.4, 5, 0.1, 0, ['calcium', 'b12']),
    F('cottage-cheese', 'Cottage cheese (low-fat)', 'veg', 72, 12.4, 2.7, 1, 0, [], ['US', 'UK']),
    F('cheddar', 'Cheddar cheese', 'veg', 403, 24.9, 1.3, 33.1, 0, ['calcium', 'a', 'zinc'], ['US', 'UK']),
    F('whey', 'Whey protein powder (typical)', 'veg', 400, 80, 8, 6, 0, ['calcium'], ALL, 'Varies by brand; a supplement, not a must.'),
    F('ghee', 'Ghee', 'veg', 900, 0, 0, 99.5, 0, ['a'], ['IN', 'UK']),
    F('butter', 'Butter', 'veg', 717, 0.9, 0.1, 81, 0, ['a']),

    // Soy & legumes
    F('tofu', 'Tofu, firm (calcium-set)', 'vegan', 144, 17.3, 2.8, 8.7, 2.3, ['calcium', 'iron']),
    F('tempeh', 'Tempeh', 'vegan', 192, 20.3, 7.6, 10.8, null, ['iron', 'magnesium'], ['US', 'UK']),
    F('soybeans', 'Soybeans (boiled)', 'vegan', 172, 18.2, 8.4, 9, 6, ['iron', 'magnesium', 'folate', 'k']),
    F('edamame', 'Edamame', 'vegan', 121, 11.9, 8.9, 5.2, 5.2, ['folate', 'k'], ['JP', 'CN', 'US', 'UK']),
    F('soy-chunks', 'Soy chunks / TVP (dry)', 'vegan', 345, 52, 33, 0.5, 13, ['iron', 'calcium'], ['IN']),
    F('natto', 'Natto', 'vegan', 211, 19.4, 12.7, 11, 5.4, ['k', 'iron', 'magnesium'], ['JP'], 'Richest common source of vitamin K2.'),
    F('miso', 'Miso', 'vegan', 199, 11.7, 26.5, 6, 5.4, ['k'], ['JP', 'CN'], 'Very salty; used a spoonful at a time.'),
    F('soy-milk', 'Soy milk (fortified, unsweetened)', 'vegan', 33, 2.9, 1.7, 1.6, 0.5, ['calcium', 'b12', 'd'], ALL, 'Only fortified brands carry B12, D and calcium.'),
    F('lentils', 'Lentils / masoor dal (cooked)', 'vegan', 116, 9, 20.1, 0.4, 7.9, ['folate', 'iron']),
    F('chickpeas', 'Chickpeas / chana (cooked)', 'vegan', 164, 8.9, 27.4, 2.6, 7.6, ['folate', 'iron'], ['IN', 'US', 'UK']),
    F('rajma', 'Kidney beans / rajma (cooked)', 'vegan', 127, 8.7, 22.8, 0.5, 6.4, ['folate', 'iron'], ['IN', 'US', 'UK', 'CN']),
    F('black-beans', 'Black beans (cooked)', 'vegan', 132, 8.9, 23.7, 0.5, 8.7, ['folate', 'magnesium'], ['US', 'UK']),
    F('moong', 'Mung beans / moong dal (cooked)', 'vegan', 105, 7, 19.2, 0.4, 7.6, ['folate'], ['IN', 'CN']),
    F('peas', 'Green peas (cooked)', 'vegan', 84, 5.4, 15.6, 0.2, 5.5, ['k', 'c']),
    F('baked-beans', 'Baked beans (canned)', 'vegan', 94, 4.8, 15, 0.5, 4.4, [], ['UK', 'US']),

    // Nuts & seeds
    F('peanuts', 'Peanuts', 'vegan', 567, 25.8, 16.1, 49.2, 8.5, ['e', 'magnesium', 'folate']),
    F('peanut-butter', 'Peanut butter', 'vegan', 588, 25, 20, 50, 6, ['e', 'magnesium']),
    F('almonds', 'Almonds', 'vegan', 579, 21.2, 21.6, 49.9, 12.5, ['e', 'magnesium', 'calcium']),
    F('walnuts', 'Walnuts', 'vegan', 654, 15.2, 13.7, 65.2, 6.7, ['omega3', 'magnesium']),
    F('chia', 'Chia seeds', 'vegan', 486, 16.5, 42.1, 30.7, 34.4, ['omega3', 'calcium', 'magnesium', 'iron']),
    F('flax', 'Flaxseed (ground)', 'vegan', 534, 18.3, 28.9, 42.2, 27.3, ['omega3', 'magnesium']),
    F('pumpkin-seeds', 'Pumpkin seeds', 'vegan', 559, 30.2, 10.7, 49, 6, ['magnesium', 'zinc', 'iron']),
    F('sunflower-seeds', 'Sunflower seeds', 'vegan', 584, 20.8, 20, 51.5, 8.6, ['e', 'magnesium', 'folate']),
    F('hemp-seeds', 'Hemp seeds', 'vegan', 553, 31.6, 8.7, 48.8, 4, ['magnesium', 'zinc', 'iron', 'omega3'], ['US', 'UK']),
    F('sesame', 'Sesame seeds', 'vegan', 573, 17.7, 23.4, 49.7, 11.8, ['calcium', 'iron', 'magnesium', 'zinc']),

    // Grains & starches
    F('oats', 'Oats (dry)', 'vegan', 379, 13.2, 67.7, 6.5, 10.1, ['magnesium', 'iron', 'zinc']),
    F('quinoa', 'Quinoa (cooked)', 'vegan', 120, 4.4, 21.3, 1.9, 2.8, ['magnesium'], ['US', 'UK']),
    F('brown-rice', 'Brown rice (cooked)', 'vegan', 112, 2.3, 23.5, 0.8, 1.8, []),
    F('white-rice', 'White rice (cooked)', 'vegan', 130, 2.7, 28.2, 0.3, 0.4, []),
    F('atta', 'Whole-wheat flour / atta', 'vegan', 340, 13.2, 72, 2.5, 10.7, ['magnesium', 'iron']),
    F('wholewheat-bread', 'Whole-wheat bread', 'vegan', 247, 13, 41, 3.4, 7, [], ['US', 'UK']),
    F('ragi', 'Finger millet / ragi flour', 'vegan', 328, 7.3, 66.8, 1.9, 11.2, ['calcium', 'iron'], ['IN'], 'Roughly three times the calcium of milk per 100 g; the best grain source.'),
    F('soba', 'Soba noodles (cooked)', 'vegan', 99, 5.1, 21.4, 0.1, null, [], ['JP']),
    F('sweet-potato', 'Sweet potato (baked)', 'vegan', 90, 2, 20.7, 0.2, 3.3, ['a', 'c', 'potassium']),
    F('potato', 'Potato (baked, with skin)', 'vegan', 93, 2.5, 21.2, 0.1, 2.2, ['potassium', 'c']),

    // Fruit
    F('banana', 'Banana', 'vegan', 89, 1.1, 22.8, 0.3, 2.6, ['potassium']),
    F('dates', 'Dates', 'vegan', 282, 2.5, 75, 0.4, 8, ['potassium'], ['IN', 'US', 'UK']),
    F('apple', 'Apple', 'vegan', 52, 0.3, 13.8, 0.2, 2.4, []),
    F('orange', 'Orange', 'vegan', 47, 0.9, 11.8, 0.1, 2.4, ['c']),
    F('guava', 'Guava', 'vegan', 68, 2.6, 14.3, 1, 5.4, ['c'], ['IN', 'CN']),
    F('amla', 'Amla / Indian gooseberry', 'vegan', 44, 0.9, 10.2, 0.6, 4.3, ['c'], ['IN']),
    F('kiwi', 'Kiwi', 'vegan', 61, 1.1, 14.7, 0.5, 3, ['c', 'k']),
    F('mango', 'Mango', 'vegan', 60, 0.8, 15, 0.4, 1.6, ['c', 'a']),
    F('papaya', 'Papaya', 'vegan', 43, 0.5, 10.8, 0.3, 1.7, ['c', 'a', 'folate'], ['IN', 'CN', 'US']),
    F('strawberries', 'Strawberries', 'vegan', 32, 0.7, 7.7, 0.3, 2, ['c']),
    F('blueberries', 'Blueberries', 'vegan', 57, 0.7, 14.5, 0.3, 2.4, ['k'], ['US', 'UK', 'JP']),
    F('avocado', 'Avocado', 'vegan', 160, 2, 8.5, 14.7, 6.7, ['k', 'folate', 'e', 'potassium'], ['US', 'UK', 'JP']),

    // Vegetables & seaweed
    F('spinach', 'Spinach / palak (raw)', 'vegan', 23, 2.9, 3.6, 0.4, 2.2, ['a', 'c', 'k', 'folate', 'iron', 'magnesium']),
    F('kale', 'Kale (raw)', 'vegan', 49, 4.3, 8.8, 0.9, 3.6, ['a', 'c', 'k', 'calcium'], ['US', 'UK']),
    F('broccoli', 'Broccoli (raw)', 'vegan', 34, 2.8, 6.6, 0.4, 2.6, ['c', 'k', 'folate']),
    F('bok-choy', 'Bok choy / pak choi', 'vegan', 13, 1.5, 2.2, 0.2, 1, ['a', 'c', 'k', 'calcium'], ['CN', 'JP', 'US', 'UK']),
    F('moringa', 'Moringa / drumstick leaves', 'vegan', 64, 9.4, 8.3, 1.4, 2, ['a', 'c', 'calcium', 'iron'], ['IN']),
    F('carrot', 'Carrot (raw)', 'vegan', 41, 0.9, 9.6, 0.2, 2.8, ['a']),
    F('red-pepper', 'Red bell pepper', 'vegan', 31, 1, 6, 0.3, 2.1, ['c', 'a']),
    F('tomato', 'Tomato', 'vegan', 18, 0.9, 3.9, 0.2, 1.2, ['c']),
    F('mushrooms-uv', 'Mushrooms (UV-exposed)', 'vegan', 22, 3.1, 3.3, 0.3, 1, ['d'], ALL, 'Only UV-treated or sun-dried mushrooms carry much vitamin D; check the label.'),
    F('nori', 'Nori / laver seaweed', 'vegan', 35, 5.8, 5.1, 0.3, 0.3, ['iodine', 'a', 'c'], ['JP', 'CN']),
    F('wakame', 'Wakame seaweed', 'vegan', 45, 3, 9.1, 0.6, 0.5, ['iodine', 'folate', 'magnesium'], ['JP', 'CN'], 'Iodine-rich; kelp and kombu can have far too much, so keep portions small.'),

    // Fats & treats
    F('olive-oil', 'Olive oil', 'vegan', 884, 0, 0, 100, 0, ['e', 'k']),
    F('mustard-oil', 'Mustard oil', 'vegan', 884, 0, 0, 100, 0, ['omega3', 'e'], ['IN']),
    F('coconut', 'Coconut (fresh)', 'vegan', 354, 3.3, 15.2, 33.5, 9, []),
    F('dark-chocolate', 'Dark chocolate (70–85%)', 'vegan', 598, 7.8, 45.9, 42.6, 10.9, ['iron', 'magnesium'], ALL, 'Check the label: some brands add milk.'),
    F('nutritional-yeast', 'Nutritional yeast (fortified)', 'vegan', 375, 50, 36, 4, 20, ['b12', 'folate', 'zinc'], ['US', 'UK'], 'Only fortified flakes contain B12.'),
  ];

  // How each ranking orders foods.
  const per100kcal = (food) => (food.kcal ? (food.p / food.kcal) * 100 : 0);
  WS.FOOD_SORTS = {
    protein: { label: 'Highest protein', key: (x) => -x.p },
    leanProtein: { label: 'Protein per 100 kcal (leanest)', key: (x) => -per100kcal(x) },
    lowCarb: { label: 'Lowest carbs', key: (x) => x.c },
    carbs: { label: 'Highest carbs (energy)', key: (x) => -x.c },
    lowFat: { label: 'Lowest fat', key: (x) => x.f },
    fat: { label: 'Highest fat', key: (x) => -x.f },
    fiber: { label: 'Highest fibre', key: (x) => -(x.fib || 0) },
    lowCal: { label: 'Lowest calories', key: (x) => x.kcal },
  };
  WS.proteinPer100kcal = per100kcal;
})(window.WS = window.WS || {});
