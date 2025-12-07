export interface DietPlanEntry {
  id: string;
  title: string;
  focus: string;
  breakfast: string[];
  lunch: string[];
  dinner: string[];
}

export interface GoalDietPlan {
  id: string;
  title: string;
  meals: {
    breakfast: string[];
    lunch: string[];
    dinner: string[];
  };
}

export const CONDITION_DIETS: DietPlanEntry[] = [
  {
    id: 'knee',
    title: 'Knee Pain',
    focus: 'Inflammation control + joint strength',
    breakfast: ['Dal + ruti (2 pcs)', 'Dim bhuna (1 egg)', 'Halud-gura warm water', 'Banana'],
    lunch: ['Bhath + masoor dal', 'Rui/Tilapia/Pabda fish curry', 'Lau / Data / Pui shak', 'Tomato-cucumber salad'],
    dinner: ['Moong dal khichuri', 'Grilled chicken (small piece)', 'Warm milk (½ cup)'],
  },
  {
    id: 'shoulder',
    title: 'Shoulder Pain',
    focus: 'Tendon healing + muscle relaxation',
    breakfast: ['Thin paratha + dim jhol', 'Peanuts (small handful)', 'Lebur shorbot (no sugar)'],
    lunch: ['Rice + light chicken curry', 'Seasonal veggies (lau, begun, beans)', 'Dal'],
    dinner: ['Vegetable soup (carrot, lau, beans)', 'Whole wheat ruti (1–2)', 'Ginger tea (ada cha)'],
  },
  {
    id: 'lower_back',
    title: 'Lower Back Pain',
    focus: 'Stronger bones • calm gas • reduce inflammation',
    breakfast: ['Chirer pulao with vegetables', '1 boiled egg', 'Warm ginger water'],
    lunch: ['Rice + fish curry (ilish/rui/pangash)', 'Moong dal', 'Lau, kachu shak, jhinga', 'Green salad'],
    dinner: ['Light khichuri', 'Grilled tilapia/chicken', 'Apple or guava'],
  },
  {
    id: 'upper_back',
    title: 'Upper Back Stiffness',
    focus: 'Posture muscles + tension release',
    breakfast: ['Oats cooked with milk', 'Mixed nuts (badam, chhola)', 'Tea (low sugar)'],
    lunch: ['Rice + chicken/beef bhuna (light oil)', 'Seasonal vegetables', 'Dal'],
    dinner: ['Vegetable khichuri', 'Cucumber-carrot salad', 'Herbal tea'],
  },
  {
    id: 'general',
    title: 'General Wellness',
    focus: 'Balanced fuel for whole-body recovery',
    breakfast: ['Ruti + dim bhuna', 'Banana / papaya / apple'],
    lunch: ['Rice + chicken/fish curry', 'Dal + vegetables'],
    dinner: ['Khichuri or light rice', 'Vegetable curry', 'Yogurt'],
  },
];

export const GOAL_DIETS: GoalDietPlan[] = [
  {
    id: 'reduce_pain',
    title: 'Reduce Pain',
    meals: {
      breakfast: ['Halud water', 'Ruti + egg', 'Banana'],
      lunch: ['Fish (rui/tilapia)', 'Dal', 'Lau/pui shak'],
      dinner: ['Light khichuri', 'Warm milk'],
    },
  },
  {
    id: 'flexibility',
    title: 'Flexibility',
    meals: {
      breakfast: ['Chirer pulao with vegetables', 'Lemon water'],
      lunch: ['Chicken + vegetables', 'Dal'],
      dinner: ['Vegetable soup', 'One fruit'],
    },
  },
  {
    id: 'posture',
    title: 'Posture',
    meals: {
      breakfast: ['Egg + ruti', 'Nuts (chhola/badam)'],
      lunch: ['Chicken or beef', 'Rice + vegetables', 'Dal'],
      dinner: ['Ruti + vegetable jhol', 'Tea'],
    },
  },
  {
    id: 'active',
    title: 'Active / Energy',
    meals: {
      breakfast: ['Oats + banana', 'Peanut butter toast (optional)'],
      lunch: ['Rice + chicken or fish', 'Dal + vegetables'],
      dinner: ['Khichuri', 'Cucumber salad'],
    },
  },
];

export const HYDRATION_TIPS = [
  'Drink 2.5–3 liters of water daily.',
  'Add electrolyte (ORS) 2–3 times per week if dehydrated.',
  'Coconut water is excellent for muscle recovery.',
];

export const VITAMIN_D_TIPS = [
  'Take 10–15 minutes of sunlight daily (8–10 AM).',
  'Expose arms and face for better vitamin D synthesis.',
];

export const CALCIUM_SOURCES = [
  'Milk or yogurt',
  'Small fish with bones (ilish macher matha, choto mach)',
  'Green leafy vegetables',
  'Sesame seeds (til)',
  'Beans and lentils',
];
