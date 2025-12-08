
import { MealDef } from './types';

export const APP_NAME = "DigiPhysio Coach";

// Local Storage Keys
export const STORAGE_KEY_USER = "flexiphysio_user";
export const STORAGE_KEY_STATS = "flexiphysio_stats";

// Color Palette (Tailwind classes used directly, but refs here)
export const COLORS = {
  primary: "teal-600",
  secondary: "emerald-500",
  warning: "orange-500",
  bg: "gray-50",
};

export const MEALS_DATA: MealDef[] = [
  {
    id: 'salmon_fennel',
    category: 'Salmon',
    name: 'Baked salmon with fennel',
    tags: ['British', 'Seafood'],
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a7270028d?q=80&w=600&auto=format&fit=crop',
    calories: 450,
    protein: '40g',
    fat: '25g',
    carbs: '10g',
    time: '25 min',
    ingredients: [
      { name: 'Salmon Fillet', amount: '400g' },
      { name: 'Fennel Bulb', amount: '1 large' },
      { name: 'Lemon', amount: '1 whole' },
      { name: 'Olive Oil', amount: '2 tbsp' }
    ],
    instructions: [
      "Heat oven to 180C/fan 160C/gas 4. Trim the fronds from the fennel and set aside.",
      "Cut the fennel bulbs in half, then cut each half into 3 wedges. Cook in boiling salted water for 10 mins.",
      "Roughly chop the fennel fronds, then mix with parsley and lemon zest.",
      "Spread the drained fennel over a shallow ovenproof dish, then add the salmon."
    ]
  },
  {
    id: 'honey_teriyaki',
    category: 'Salmon',
    name: 'Honey Teriyaki Salmon',
    tags: ['Asian', 'High Protein'],
    image: 'https://images.unsplash.com/photo-1511690656952-34342d5c2895?q=80&w=600&auto=format&fit=crop',
    calories: 520,
    protein: '45g',
    fat: '22g',
    carbs: '30g',
    time: '20 min',
    ingredients: [
      { name: 'Salmon', amount: '2 fillets' },
      { name: 'Soy Sauce', amount: '3 tbsp' },
      { name: 'Honey', amount: '2 tbsp' },
      { name: 'Sesame Seeds', amount: '1 tsp' }
    ],
    instructions: [
      "Mix soy sauce and honey in a small bowl.",
      "Pan fry salmon skin side down for 4 mins.",
      "Flip, pour glaze over, and cook for another 3 mins until sticky."
    ]
  },
  {
    id: 'grilled_chicken_salad',
    category: 'Chicken',
    name: 'Grilled Chicken Salad',
    tags: ['Low Carb', 'Lunch'],
    image: 'https://images.unsplash.com/photo-1532550907401-a500c9a57435?q=80&w=600&auto=format&fit=crop',
    calories: 380,
    protein: '35g',
    fat: '15g',
    carbs: '8g',
    time: '15 min',
    ingredients: [
      { name: 'Chicken Breast', amount: '150g' },
      { name: 'Mixed Greens', amount: '2 cups' },
      { name: 'Cherry Tomatoes', amount: '10' },
      { name: 'Cucumber', amount: '1/2' }
    ],
    instructions: [
      "Grill chicken breast until cooked through.",
      "Slice chicken and place over bed of greens.",
      "Add veggies and your favorite light dressing."
    ]
  },
  {
    id: 'avo_toast_egg',
    category: 'Eggs',
    name: 'Avocado Egg Toast',
    tags: ['Breakfast', 'Quick'],
    image: 'https://images.unsplash.com/photo-1525351484163-7529414395d8?q=80&w=600&auto=format&fit=crop',
    calories: 320,
    protein: '14g',
    fat: '18g',
    carbs: '25g',
    time: '10 min',
    ingredients: [
      { name: 'Egg', amount: '2 large' },
      { name: 'Whole Wheat Bread', amount: '2 slices' },
      { name: 'Avocado', amount: '1/2 ripe' },
      { name: 'Chili Flakes', amount: 'pinch' }
    ],
    instructions: [
      "Toast the bread to your liking.",
      "Mash avocado and spread evenly on toast.",
      "Fry or poach eggs and place on top.",
      "Sprinkle with salt and chili flakes."
    ]
  },
  {
    id: 'veggie_stir_fry',
    category: 'Veggie',
    name: 'Tofu Veggie Stir Fry',
    tags: ['Vegan', 'Dinner'],
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=600&auto=format&fit=crop',
    calories: 300,
    protein: '18g',
    fat: '12g',
    carbs: '28g',
    time: '20 min',
    ingredients: [
      { name: 'Tofu', amount: '200g' },
      { name: 'Broccoli', amount: '1 head' },
      { name: 'Carrots', amount: '2' },
      { name: 'Soy Sauce', amount: '2 tbsp' }
    ],
    instructions: [
      "Press tofu to remove water, then cube.",
      "Stir fry tofu until golden, remove from pan.",
      "Stir fry veggies, add sauce, return tofu and toss."
    ]
  }
];
