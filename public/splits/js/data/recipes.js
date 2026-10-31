// High-protein recipes for bulking and getting lean, heavy on eggs and
// chicken. Macros are per serving and estimated from the ingredients (USDA
// values); they shift with brands and portion sizes. "Watch" links open a
// YouTube search for the recipe, so they never point at a deleted video.
//
// goal: bulk (calorie-dense, carbs for training) and/or lean (high protein
// per calorie). main: the protein source(s), used by the filters.
(function (WS) {
  WS.RECIPE_MAINS = {
    egg: 'Eggs', chicken: 'Chicken', fish: 'Fish & seafood', meat: 'Red meat',
    dairy: 'Paneer & dairy', soy: 'Tofu & soy', legumes: 'Beans & lentils',
  };
  WS.MEALS = { breakfast: 'Breakfast', lunch: 'Lunch / dinner', snack: 'Snack / shake' };
  WS.CUISINES = { indian: 'Indian', chinese: 'Chinese', japanese: 'Japanese', american: 'American', british: 'British', mediterranean: 'Mediterranean', mexican: 'Mexican' };

  // R(id, name, main[], diet, goal[], meal, cuisine, minutes, kcal, protein, carbs, fat, ingredients[], tip)
  const R = (id, name, main, diet, goal, meal, cuisine, mins, kcal, p, c, f, ingredients, tip) =>
    ({ id, name, main, diet, goal, meal, cuisine, mins, kcal, p, c, f, ingredients, tip: tip || '' });

  WS.RECIPES = [
    // Eggs
    R('masala-omelette', 'Masala Omelette', ['egg'], 'egg', ['lean'], 'breakfast', 'indian', 10, 290, 20, 8, 20,
      ['3 eggs', '1 small onion, chopped', '1 tomato, chopped', '1 green chilli', 'Handful of coriander', '¼ tsp turmeric', 'Salt to taste', '1 tsp oil'],
      'Add 2 whole-wheat toasts or rotis to make it a bulking breakfast.'),
    R('egg-white-scramble', 'Egg White Veggie Scramble', ['egg'], 'egg', ['lean'], 'breakfast', 'american', 10, 200, 28, 6, 7,
      ['6 egg whites + 1 whole egg', '1 cup spinach', '½ red bell pepper', '4 mushrooms, sliced', '1 tsp olive oil', 'Salt, pepper, chilli flakes'],
      'One of the leanest breakfasts there is: about 14 g protein per 100 kcal.'),
    R('anda-bhurji', 'Anda Bhurji with Rotis', ['egg'], 'egg', ['bulk'], 'breakfast', 'indian', 15, 620, 32, 50, 32,
      ['4 eggs', '1 onion, chopped', '1 tomato, chopped', '1 green chilli', '½ tsp each turmeric, chilli powder, garam masala', '1 tbsp butter or oil', '2 whole-wheat rotis', 'Coriander to finish']),
    R('shakshuka', 'Shakshuka', ['egg'], 'egg', ['lean'], 'breakfast', 'mediterranean', 25, 300, 16, 16, 18,
      ['2 eggs', '1 can (200 g) chopped tomatoes', '½ red bell pepper', '½ onion', '2 garlic cloves', '½ tsp cumin, ½ tsp paprika', '2 tsp olive oil', 'Parsley or coriander'],
      'Serve with crusty bread to bulk.'),
    R('egg-fried-rice', 'Egg Fried Rice', ['egg'], 'egg', ['bulk'], 'lunch', 'chinese', 15, 680, 27, 85, 25,
      ['3 eggs', '250 g cooked rice (day-old is best)', '½ cup peas and carrots', '2 spring onions', '1 tbsp soy sauce', '1 tbsp oil', '1 tsp sesame oil']),
    R('tamagoyaki', 'Tamagoyaki (Japanese Rolled Omelette)', ['egg'], 'egg', ['lean'], 'breakfast', 'japanese', 15, 260, 19, 6, 17,
      ['3 eggs', '2 tbsp dashi or water', '1 tsp soy sauce', '1 tsp mirin', '1 tsp sugar', '1 tsp oil']),
    R('egg-muffins', 'Egg Muffins (meal prep)', ['egg'], 'egg', ['lean'], 'breakfast', 'american', 25, 300, 29, 5, 18,
      ['3 eggs + 2 egg whites (makes 3 muffins)', '½ cup spinach', '¼ red bell pepper', '2 tbsp onion', '20 g feta', 'Salt and pepper'],
      'Bake a batch of 12 on Sunday; they keep 4 days in the fridge.'),
    R('egg-curry', 'Egg Curry with Rice', ['egg'], 'egg', ['bulk'], 'lunch', 'indian', 30, 650, 30, 62, 30,
      ['4 boiled eggs', '1 onion', '2 tomatoes', '1 tsp ginger-garlic paste', '½ tsp each turmeric, chilli, coriander powder, garam masala', '1 tbsp oil', '150 g cooked rice']),
    R('protein-french-toast', 'Protein French Toast', ['egg'], 'egg', ['bulk'], 'breakfast', 'american', 15, 520, 32, 62, 14,
      ['2 slices whole-wheat bread', '2 eggs + 2 egg whites', '60 ml milk', '½ tsp cinnamon', '1 banana, sliced', '1 tsp honey']),
    R('avocado-egg-toast', 'Avocado Toast with Poached Eggs', ['egg'], 'egg', ['bulk'], 'breakfast', 'american', 10, 480, 21, 40, 26,
      ['2 slices sourdough or whole-wheat bread', '½ avocado', '2 eggs, poached', 'Squeeze of lemon', 'Chilli flakes, salt, pepper']),
    R('ramen-eggs', 'Ramen Eggs (Ajitsuke Tamago)', ['egg'], 'egg', ['lean'], 'snack', 'japanese', 15, 170, 13, 4, 10,
      ['2 eggs, boiled 6½ minutes', '2 tbsp soy sauce', '2 tbsp mirin', '4 tbsp water'],
      'Marinate overnight; a ready high-protein snack all week.'),
    R('egg-chickpea-salad', 'Egg & Chickpea Salad', ['egg', 'legumes'], 'egg', ['lean'], 'lunch', 'mediterranean', 10, 380, 22, 30, 18,
      ['2 boiled eggs', '100 g cooked chickpeas', '½ cucumber', '1 tomato', '¼ red onion', 'Juice of ½ lemon', '1 tsp olive oil', 'Salt, pepper, parsley']),
    R('tomato-egg-stirfry', 'Tomato & Egg Stir-Fry', ['egg'], 'egg', ['lean', 'bulk'], 'lunch', 'chinese', 10, 330, 19, 10, 24,
      ['3 eggs', '2 tomatoes, cut in wedges', '1 spring onion', 'Pinch of sugar', '1 tbsp oil', 'Salt'],
      'Lean on its own; add 200 g rice to bulk.'),
    R('chicken-egg-wrap', 'Chicken & Egg Breakfast Wrap', ['egg', 'chicken'], 'nonveg', ['lean', 'bulk'], 'breakfast', 'american', 10, 480, 42, 32, 20,
      ['2 eggs, scrambled', '80 g cooked shredded chicken', '1 whole-wheat wrap', '2 tbsp salsa', 'Handful of spinach']),
    R('oyakodon', 'Oyakodon (Chicken & Egg Rice Bowl)', ['egg', 'chicken'], 'nonveg', ['bulk'], 'lunch', 'japanese', 25, 720, 45, 85, 20,
      ['150 g chicken thigh, sliced', '2 eggs, lightly beaten', '½ onion, sliced', '100 ml dashi', '1 tbsp soy sauce', '1 tbsp mirin', '200 g cooked rice', 'Spring onion to finish']),

    // Chicken
    R('tandoori-chicken', 'Tandoori Chicken', ['chicken'], 'nonveg', ['lean'], 'lunch', 'indian', 40, 380, 62, 8, 10,
      ['250 g chicken breast or skinless thighs', '75 g Greek yogurt or curd', '1 tsp ginger-garlic paste', '1 tbsp lemon juice', '1 tsp Kashmiri chilli powder', '½ tsp garam masala', 'Salt'],
      'Marinate 2+ hours, then oven or air-fry at 220 °C for 20–25 min.'),
    R('chicken-tikka-masala', 'Chicken Tikka Masala with Rice', ['chicken'], 'nonveg', ['bulk'], 'lunch', 'indian', 45, 780, 55, 70, 30,
      ['200 g chicken breast, cubed', '50 g yogurt (marinade)', '150 ml tomato purée', '1 onion', '2 tbsp cream', '1 tsp ginger-garlic paste', '1 tsp each garam masala, cumin, paprika', '1 tbsp butter', '200 g cooked basmati rice']),
    R('butter-chicken', 'Butter Chicken with Rotis', ['chicken'], 'nonveg', ['bulk'], 'lunch', 'indian', 45, 820, 50, 55, 42,
      ['200 g chicken thigh', '1 tbsp butter', '2 tbsp cream', '150 ml tomato purée', '10 cashews, soaked and blended', '1 tsp kasuri methi', '1 tsp each garam masala, chilli powder', '2 whole-wheat rotis']),
    R('chicken-biryani', 'Chicken Biryani', ['chicken'], 'nonveg', ['bulk'], 'lunch', 'indian', 60, 750, 45, 85, 22,
      ['200 g chicken (bone-in or boneless)', '80 g basmati rice (dry)', '50 g yogurt', '1 onion, thinly sliced and fried', 'Mint and coriander', '1 tsp biryani masala', '1 tbsp ghee', 'Saffron or turmeric']),
    R('chicken-quinoa-bowl', 'Grilled Chicken & Quinoa Bowl', ['chicken'], 'nonveg', ['lean'], 'lunch', 'american', 25, 520, 52, 40, 15,
      ['180 g chicken breast', '150 g cooked quinoa', '1 cup broccoli', '6 cherry tomatoes', '1 tbsp lemon juice + 2 tsp olive oil', 'Garlic, paprika, salt']),
    R('chicken-veg-stirfry', 'Chicken & Vegetable Stir-Fry', ['chicken'], 'nonveg', ['lean'], 'lunch', 'chinese', 20, 360, 46, 18, 10,
      ['180 g chicken breast, sliced', '1 bell pepper', '1 cup broccoli', 'Handful of snap peas', '2 garlic cloves + 1 tsp ginger', '1 tbsp soy sauce', '1 tbsp oyster sauce', '1 tsp oil', '1 tsp cornflour'],
      'Add 200 g rice to turn it into a bulking meal (+260 kcal).'),
    R('kung-pao-chicken', 'Kung Pao Chicken with Rice', ['chicken'], 'nonveg', ['bulk'], 'lunch', 'chinese', 25, 760, 45, 80, 27,
      ['180 g chicken thigh, diced', '25 g peanuts', '6 dried red chillies', '½ tsp Sichuan pepper', '1 tbsp soy sauce', '1 tbsp black vinegar', '1 tsp sugar', '1 tbsp oil', '200 g cooked rice']),
    R('chicken-teriyaki', 'Chicken Teriyaki', ['chicken'], 'nonveg', ['lean', 'bulk'], 'lunch', 'japanese', 20, 420, 38, 18, 20,
      ['180 g chicken thigh', '2 tbsp soy sauce', '2 tbsp mirin', '1 tbsp sake (optional)', '1 tsp sugar', '1 tsp oil', 'Sesame seeds'],
      'Use breast to make it leaner; serve with rice to bulk.'),
    R('chicken-yakitori', 'Chicken Yakitori', ['chicken'], 'nonveg', ['lean'], 'snack', 'japanese', 25, 400, 40, 14, 20,
      ['200 g chicken thigh, cubed', '2 spring onions, cut in pieces', 'Tare: 2 tbsp soy sauce, 2 tbsp mirin, 1 tsp sugar', 'Skewers']),
    R('chicken-shawarma-wrap', 'Chicken Shawarma Wrap', ['chicken'], 'nonveg', ['bulk'], 'lunch', 'mediterranean', 30, 610, 42, 50, 25,
      ['150 g chicken thigh', '1 tsp each cumin, paprika, coriander, garlic powder', '1 whole-wheat wrap or pita', '3 tbsp garlic yogurt sauce', 'Lettuce, tomato, cucumber, pickled onion']),
    R('lemon-herb-chicken', 'Lemon Herb Chicken & Roast Veg (meal prep)', ['chicken'], 'nonveg', ['lean'], 'lunch', 'mediterranean', 40, 420, 50, 15, 17,
      ['200 g chicken breast', '1 courgette', '1 bell pepper', '1 red onion', '1 tbsp olive oil', '2 garlic cloves', 'Lemon zest + juice, oregano, thyme']),
    R('chicken-caesar', 'Chicken Caesar Salad (light)', ['chicken'], 'nonveg', ['lean'], 'lunch', 'american', 15, 400, 45, 15, 17,
      ['150 g grilled chicken breast', '1 romaine heart', '3 tbsp Greek-yogurt Caesar dressing', '15 g parmesan', 'Small handful of croutons']),
    R('chicken-burrito-bowl', 'Chicken Burrito Bowl', ['chicken', 'legumes'], 'nonveg', ['bulk'], 'lunch', 'mexican', 25, 820, 60, 85, 25,
      ['180 g chicken breast, fajita-spiced', '150 g cooked rice', '100 g black beans', '3 tbsp sweetcorn', '3 tbsp salsa', '¼ avocado', '20 g grated cheese', 'Lime and coriander']),
    R('chicken-pasta', 'High-Protein Chicken Pasta', ['chicken'], 'nonveg', ['bulk'], 'lunch', 'mediterranean', 25, 760, 60, 85, 18,
      ['180 g chicken breast', '90 g whole-wheat pasta (dry)', '150 ml tomato pasta sauce', '1 cup spinach', '15 g parmesan', '1 tsp olive oil', 'Garlic, basil']),
    R('chicken-keema', 'Chicken Keema with Peas', ['chicken'], 'nonveg', ['lean', 'bulk'], 'lunch', 'indian', 30, 420, 45, 18, 18,
      ['200 g chicken mince', '½ cup peas', '1 onion', '1 tomato', '1 tsp ginger-garlic paste', '1 tsp each cumin, coriander powder, garam masala', '2 tsp oil'],
      'With 2 rotis or pav it becomes a bulking meal.'),
    R('chilli-chicken', 'Chilli Chicken (Indo-Chinese, lighter)', ['chicken'], 'nonveg', ['lean', 'bulk'], 'lunch', 'chinese', 25, 450, 48, 22, 18,
      ['200 g chicken breast, cubed', '1 tbsp cornflour', '1 bell pepper', '1 onion, petals', '2 green chillies', '1 tbsp soy sauce', '1 tbsp chilli sauce', '3 garlic cloves', '1 tbsp oil']),
    R('ginger-chicken-soup', 'Ginger Chicken Soup', ['chicken'], 'nonveg', ['lean'], 'lunch', 'chinese', 30, 260, 38, 10, 6,
      ['150 g chicken breast', '500 ml chicken stock', '3 slices ginger', '2 garlic cloves', '1 bok choy', '1 carrot', '4 shiitake mushrooms', 'Spring onion, white pepper']),
    R('grilled-chicken-burger', 'Grilled Chicken Burger', ['chicken'], 'nonveg', ['bulk'], 'lunch', 'american', 20, 520, 45, 45, 15,
      ['150 g chicken breast, flattened', '1 whole-wheat bun', 'Lettuce, tomato, red onion', '1 tbsp light mayo', 'Paprika, garlic powder']),
    R('peri-peri-chicken', 'Peri-Peri Chicken', ['chicken'], 'nonveg', ['lean', 'bulk'], 'lunch', 'british', 40, 420, 44, 4, 25,
      ['200 g chicken thighs', 'Marinade: 2 red chillies, 3 garlic cloves, 1 tsp smoked paprika, juice of ½ lemon, 1 tbsp oil, 1 tsp oregano'],
      'Nando\'s-style; serve with rice or sweet potato wedges to bulk.'),
    R('chicken-katsu-curry', 'Chicken Katsu Curry', ['chicken'], 'nonveg', ['bulk'], 'lunch', 'japanese', 40, 900, 55, 110, 25,
      ['180 g chicken breast', '30 g panko breadcrumbs', '1 egg + 1 tbsp flour (to coat)', '2 cubes Japanese curry roux', '1 carrot, 1 potato, ½ onion', '200 g cooked rice', 'Bake or air-fry instead of deep-frying']),

    // Other proteins
    R('paneer-tikka', 'Paneer Tikka', ['dairy'], 'veg', ['lean', 'bulk'], 'snack', 'indian', 30, 450, 30, 12, 32,
      ['150 g paneer, cubed', '50 g yogurt', '1 bell pepper + 1 onion, chunks', '1 tsp ginger-garlic paste', '1 tsp each chilli powder, garam masala', '1 tsp lemon juice'],
      'Use light paneer to cut fat; add rotis to bulk.'),
    R('greek-yogurt-bowl', 'Greek Yogurt Protein Bowl', ['dairy'], 'veg', ['lean'], 'snack', 'american', 5, 330, 28, 35, 9,
      ['250 g non-fat Greek yogurt', '½ cup berries', '1 tsp honey', '15 g almonds or granola']),
    R('mass-gainer-shake', 'Peanut Butter Banana Mass-Gainer Shake', ['dairy'], 'veg', ['bulk'], 'snack', 'american', 5, 900, 55, 100, 30,
      ['400 ml milk', '1 banana', '2 tbsp peanut butter', '40 g oats', '1 scoop whey protein', '1 tsp honey'],
      'An easy 900 kcal for hard-gainers; drink between meals.'),
    R('tofu-scramble', 'Tofu Scramble', ['soy'], 'vegan', ['lean'], 'breakfast', 'american', 15, 340, 32, 10, 19,
      ['200 g firm tofu, crumbled', '1 cup spinach', '½ bell pepper', '¼ tsp turmeric', '1 tbsp nutritional yeast', '1 tsp oil', 'Black salt (kala namak) for an eggy taste']),
    R('mapo-tofu', 'Mapo Tofu (mushroom, vegan)', ['soy'], 'vegan', ['bulk'], 'lunch', 'chinese', 25, 560, 30, 55, 24,
      ['250 g silken or soft tofu', '1 tbsp doubanjiang (chilli bean paste)', '100 g mushrooms, finely chopped', '2 garlic cloves + 1 tsp ginger', '½ tsp Sichuan pepper', '1 tsp cornflour', '1 tbsp oil', '150 g cooked rice']),
    R('soya-chunk-curry', 'Soya Chunk Curry', ['soy'], 'vegan', ['lean'], 'lunch', 'indian', 25, 300, 28, 25, 9,
      ['50 g soya chunks (dry), soaked', '1 onion', '1 tomato', '1 tsp ginger-garlic paste', '½ tsp each turmeric, chilli, garam masala', '1 tsp oil']),
    R('dal-tadka', 'Dal Tadka with Rice', ['legumes'], 'vegan', ['bulk'], 'lunch', 'indian', 35, 560, 22, 88, 14,
      ['70 g toor or masoor dal (dry)', '150 g cooked rice', '1 onion + 1 tomato', '3 garlic cloves', '1 tsp cumin seeds', '½ tsp turmeric', '1 tbsp oil (or ghee if not vegan)']),
    R('rajma-chawal', 'Rajma Chawal', ['legumes'], 'vegan', ['bulk'], 'lunch', 'indian', 45, 640, 21, 110, 12,
      ['150 g cooked kidney beans', '200 g cooked rice', '1 onion + 2 tomatoes', '1 tsp ginger-garlic paste', '1 tsp rajma masala', '1 tbsp oil']),
    R('overnight-oats', 'Vegan Overnight Oats', ['soy'], 'vegan', ['bulk'], 'breakfast', 'british', 5, 640, 25, 85, 22,
      ['80 g oats', '250 ml soy milk', '15 g chia seeds', '1 tbsp peanut butter', '1 banana']),
    R('salmon-teriyaki', 'Salmon Teriyaki with Rice', ['fish'], 'nonveg', ['bulk'], 'lunch', 'japanese', 20, 700, 40, 75, 22,
      ['150 g salmon fillet', '2 tbsp teriyaki sauce', '200 g cooked rice', '1 cup broccoli', 'Sesame seeds, spring onion']),
    R('tuna-bean-salad', 'Tuna & Bean Salad', ['fish', 'legumes'], 'nonveg', ['lean'], 'lunch', 'mediterranean', 10, 400, 40, 22, 15,
      ['1 can tuna (120 g drained)', '100 g cannellini beans', '¼ red onion', 'Parsley', 'Juice of ½ lemon', '1 tbsp olive oil']),
    R('beef-broccoli', 'Beef & Broccoli with Rice', ['meat'], 'nonveg', ['bulk'], 'lunch', 'chinese', 25, 690, 48, 75, 18,
      ['170 g lean beef, sliced thin', '2 cups broccoli', '1 tbsp soy sauce', '1 tbsp oyster sauce', '2 garlic cloves + 1 tsp ginger', '1 tsp cornflour', '1 tsp oil', '200 g cooked rice']),
  ];

  const per100 = (r) => (r.kcal ? (r.p / r.kcal) * 100 : 0);
  WS.RECIPE_SORTS = {
    protein: { label: 'Most protein', key: (r) => -r.p },
    lean: { label: 'Protein per 100 kcal (leanest)', key: (r) => -per100(r) },
    lowCal: { label: 'Fewest calories', key: (r) => r.kcal },
    highCal: { label: 'Most calories (bulking)', key: (r) => -r.kcal },
    quick: { label: 'Quickest', key: (r) => r.mins },
  };
  WS.recipeProteinPer100 = per100;
  WS.ytSearch = (q) => 'https://www.youtube.com/results?search_query=' + encodeURIComponent(q);
})(window.WS = window.WS || {});
