import { Product } from '@/contexts/CartContext';

export const categories = [
  { icon: '🥛', label: 'Dairy & Eggs' },
  { icon: '🥦', label: 'Vegetables' },
  { icon: '🍎', label: 'Fruits' },
  { icon: '🍪', label: 'Snacks' },
  { icon: '🥤', label: 'Beverages' },
  { icon: '🍞', label: 'Bakery' },
  { icon: '🌾', label: 'Staples' },
  { icon: '🥩', label: 'Meat & Fish' },
];

export interface ProductWithDetails extends Product {
  description: string;
  nutritionalInfo: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber?: string;
  };
  ingredients?: string;
  brand: string;
  origin?: string;
}

export const dairyProducts: ProductWithDetails[] = [
  {
    id: 'dairy-1',
    name: 'Amul Gold Full Cream Milk',
    quantity: '500 ml',
    price: 35,
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&h=400&fit=crop',
    category: 'dairy',
    deliveryTime: '13 MINS',
    description: 'Amul Gold Full Cream Milk is homogenised toned milk with rich and creamy taste. Perfect for making tea, coffee, desserts, and drinking directly. Sourced from healthy cows and processed hygienically.',
    nutritionalInfo: {
      calories: '65 kcal',
      protein: '3.2g',
      carbs: '4.8g',
      fat: '3.5g',
    },
    brand: 'Amul',
    origin: 'Gujarat, India',
  },
  {
    id: 'dairy-2',
    name: 'Amul Toned Milk',
    quantity: '500 ml',
    price: 29,
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400&h=400&fit=crop',
    category: 'dairy',
    deliveryTime: '13 MINS',
    description: 'Amul Toned Milk provides the goodness of milk with reduced fat content. Ideal for health-conscious individuals who want nutrition without extra calories.',
    nutritionalInfo: {
      calories: '50 kcal',
      protein: '3.0g',
      carbs: '4.5g',
      fat: '1.5g',
    },
    brand: 'Amul',
    origin: 'Gujarat, India',
  },
  {
    id: 'dairy-3',
    name: 'Amul Butter',
    quantity: '100 g',
    price: 58,
    image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&h=400&fit=crop',
    category: 'dairy',
    deliveryTime: '13 MINS',
    description: 'Amul Butter is made from fresh cream and has a smooth, creamy texture. Perfect for spreading on bread, parathas, or for cooking delicious dishes.',
    nutritionalInfo: {
      calories: '72 kcal',
      protein: '0.1g',
      carbs: '0g',
      fat: '8g',
    },
    ingredients: 'Pasteurized cream, salt',
    brand: 'Amul',
    origin: 'Gujarat, India',
  },
  {
    id: 'dairy-4',
    name: 'Mother Dairy Curd',
    quantity: '400 g',
    price: 35,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=400&fit=crop',
    category: 'dairy',
    deliveryTime: '13 MINS',
    description: 'Fresh and creamy curd made from pasteurized toned milk. Rich in probiotics and calcium, perfect for daily consumption and making raita, lassi, or buttermilk.',
    nutritionalInfo: {
      calories: '60 kcal',
      protein: '3.5g',
      carbs: '5g',
      fat: '3g',
    },
    brand: 'Mother Dairy',
    origin: 'Delhi, India',
  },
];

export const vegetableProducts: ProductWithDetails[] = [
  {
    id: 'veg-1',
    name: 'Fresh Tomatoes',
    quantity: '500 g',
    price: 25,
    image: 'https://images.unsplash.com/photo-1546470427-f5d9c1e3a0c7?w=400&h=400&fit=crop',
    category: 'vegetables',
    deliveryTime: '13 MINS',
    description: 'Farm-fresh red tomatoes, hand-picked for quality. Perfect for salads, curries, and sauces. Rich in lycopene and vitamin C.',
    nutritionalInfo: {
      calories: '18 kcal',
      protein: '0.9g',
      carbs: '3.9g',
      fat: '0.2g',
      fiber: '1.2g',
    },
    brand: 'Farm Fresh',
    origin: 'Local Farm',
  },
  {
    id: 'veg-2',
    name: 'Fresh Onions',
    quantity: '1 kg',
    price: 35,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82ber5f?w=400&h=400&fit=crop',
    category: 'vegetables',
    deliveryTime: '13 MINS',
    description: 'Premium quality onions with strong flavor and long shelf life. Essential for Indian cooking, perfect for curries, salads, and pickles.',
    nutritionalInfo: {
      calories: '40 kcal',
      protein: '1.1g',
      carbs: '9.3g',
      fat: '0.1g',
      fiber: '1.7g',
    },
    brand: 'Farm Fresh',
    origin: 'Maharashtra, India',
  },
  {
    id: 'veg-3',
    name: 'Fresh Potatoes',
    quantity: '1 kg',
    price: 30,
    image: 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=400&h=400&fit=crop',
    category: 'vegetables',
    deliveryTime: '13 MINS',
    description: 'Fresh and firm potatoes, perfect for frying, boiling, or making delicious curries. A staple in every kitchen.',
    nutritionalInfo: {
      calories: '77 kcal',
      protein: '2g',
      carbs: '17g',
      fat: '0.1g',
      fiber: '2.2g',
    },
    brand: 'Farm Fresh',
    origin: 'Uttar Pradesh, India',
  },
  {
    id: 'veg-4',
    name: 'Fresh Capsicum',
    quantity: '250 g',
    price: 40,
    image: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=400&fit=crop',
    category: 'vegetables',
    deliveryTime: '13 MINS',
    description: 'Crunchy and colorful bell peppers, packed with vitamin C. Great for salads, stir-fries, and stuffed recipes.',
    nutritionalInfo: {
      calories: '31 kcal',
      protein: '1g',
      carbs: '6g',
      fat: '0.3g',
      fiber: '2.1g',
    },
    brand: 'Farm Fresh',
    origin: 'Karnataka, India',
  },
];

export const snackProducts: ProductWithDetails[] = [
  {
    id: 'snack-1',
    name: 'Lays Classic Chips',
    quantity: '90 g',
    price: 20,
    image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&h=400&fit=crop',
    category: 'snacks',
    deliveryTime: '13 MINS',
    description: 'Crispy and delicious classic salted potato chips. Made from the finest potatoes, perfectly seasoned for that irresistible crunch.',
    nutritionalInfo: {
      calories: '150 kcal',
      protein: '2g',
      carbs: '15g',
      fat: '10g',
    },
    ingredients: 'Potatoes, vegetable oil, salt',
    brand: 'Lays',
    origin: 'India',
  },
  {
    id: 'snack-2',
    name: 'Haldiram Bhujia',
    quantity: '200 g',
    price: 40,
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=400&fit=crop',
    category: 'snacks',
    deliveryTime: '13 MINS',
    description: 'Traditional Indian savory snack made from besan (gram flour) with authentic spices. Perfect tea-time companion.',
    nutritionalInfo: {
      calories: '180 kcal',
      protein: '5g',
      carbs: '20g',
      fat: '9g',
    },
    ingredients: 'Gram flour, vegetable oil, spices, salt',
    brand: 'Haldiram',
    origin: 'Rajasthan, India',
  },
  {
    id: 'snack-3',
    name: 'Kurkure Masala',
    quantity: '70 g',
    price: 20,
    image: 'https://images.unsplash.com/photo-1621447504864-d8686e12698c?w=400&h=400&fit=crop',
    category: 'snacks',
    deliveryTime: '13 MINS',
    description: 'Crunchy puffed corn snacks with a tangy masala flavor. The signature twisted shape delivers an explosion of taste in every bite.',
    nutritionalInfo: {
      calories: '130 kcal',
      protein: '2g',
      carbs: '16g',
      fat: '7g',
    },
    ingredients: 'Rice meal, edible vegetable oil, corn meal, gram meal, spices',
    brand: 'Kurkure',
    origin: 'India',
  },
  {
    id: 'snack-4',
    name: 'Bingo Mad Angles',
    quantity: '90 g',
    price: 20,
    image: 'https://images.unsplash.com/photo-1600952841320-db92ec4047ca?w=400&h=400&fit=crop',
    category: 'snacks',
    deliveryTime: '13 MINS',
    description: 'Triangle-shaped corn snacks with bold achaari masti flavor. Crunchy texture with a tangy kick that keeps you coming back for more.',
    nutritionalInfo: {
      calories: '140 kcal',
      protein: '2g',
      carbs: '17g',
      fat: '7g',
    },
    ingredients: 'Corn, edible vegetable oil, spices, salt',
    brand: 'Bingo',
    origin: 'India',
  },
];

export const breakfastProducts: ProductWithDetails[] = [
  {
    id: 'breakfast-1',
    name: "Kellogg's Corn Flakes",
    quantity: '475 g',
    price: 210,
    image: 'https://images.unsplash.com/photo-1517456793572-1d8efd6dc135?w=400&h=400&fit=crop',
    category: 'breakfast',
    deliveryTime: '13 MINS',
    description: 'Start your day with the original and best corn flakes. Made from golden corn, lightly toasted to a perfect crunch. Fortified with vitamins and iron.',
    nutritionalInfo: {
      calories: '110 kcal',
      protein: '2g',
      carbs: '25g',
      fat: '0.3g',
      fiber: '1g',
    },
    ingredients: 'Corn, sugar, malt flavoring, salt, vitamins and minerals',
    brand: "Kellogg's",
    origin: 'USA',
  },
  {
    id: 'breakfast-2',
    name: 'Saffola Oats',
    quantity: '500 g',
    price: 125,
    image: 'https://images.unsplash.com/photo-1461009683693-342af2f2d6ce?w=400&h=400&fit=crop',
    category: 'breakfast',
    deliveryTime: '13 MINS',
    description: 'Heart-healthy whole grain oats, rich in fiber and protein. Helps reduce cholesterol and keeps you full longer. Perfect for a nutritious breakfast.',
    nutritionalInfo: {
      calories: '120 kcal',
      protein: '4g',
      carbs: '22g',
      fat: '2g',
      fiber: '4g',
    },
    ingredients: '100% natural rolled oats',
    brand: 'Saffola',
    origin: 'India',
  },
  {
    id: 'breakfast-3',
    name: 'Quaker Oats',
    quantity: '1 kg',
    price: 180,
    image: 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=400&h=400&fit=crop',
    category: 'breakfast',
    deliveryTime: '13 MINS',
    description: 'Premium quality whole grain oats that cook in just 3 minutes. Rich in beta-glucan fiber for heart health. Versatile for porridge, smoothies, or baking.',
    nutritionalInfo: {
      calories: '117 kcal',
      protein: '4.2g',
      carbs: '20g',
      fat: '2.5g',
      fiber: '3.5g',
    },
    ingredients: '100% whole grain oats',
    brand: 'Quaker',
    origin: 'USA',
  },
  {
    id: 'breakfast-4',
    name: 'Muesli Mix',
    quantity: '500 g',
    price: 275,
    image: 'https://images.unsplash.com/photo-1540914124281-342587941389?w=400&h=400&fit=crop',
    category: 'breakfast',
    deliveryTime: '13 MINS',
    description: 'A wholesome blend of rolled oats, dried fruits, nuts, and seeds. No added sugar, just natural goodness. Perfect with milk or yogurt.',
    nutritionalInfo: {
      calories: '140 kcal',
      protein: '5g',
      carbs: '24g',
      fat: '4g',
      fiber: '5g',
    },
    ingredients: 'Oats, raisins, almonds, cashews, dried apricots, sunflower seeds',
    brand: 'Health Mix',
    origin: 'India',
  },
];

export const beverageProducts: ProductWithDetails[] = [
  {
    id: 'bev-1',
    name: 'Real Juice',
    quantity: '1 L',
    price: 110,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&h=400&fit=crop',
    category: 'beverages',
    deliveryTime: '13 MINS',
    description: 'Made from real fruit, this refreshing juice contains no added preservatives. Available in mango flavor, it provides natural vitamins and tastes delicious.',
    nutritionalInfo: {
      calories: '50 kcal',
      protein: '0.5g',
      carbs: '12g',
      fat: '0g',
    },
    ingredients: 'Mango pulp, water, sugar, citric acid',
    brand: 'Real',
    origin: 'India',
  },
  {
    id: 'bev-2',
    name: 'Bisleri Water',
    quantity: '1 L',
    price: 20,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=400&fit=crop',
    category: 'beverages',
    deliveryTime: '13 MINS',
    description: 'Pure and safe drinking water that goes through 10 stages of purification and 114 quality tests. Trusted by millions of Indians.',
    nutritionalInfo: {
      calories: '0 kcal',
      protein: '0g',
      carbs: '0g',
      fat: '0g',
    },
    brand: 'Bisleri',
    origin: 'India',
  },
  {
    id: 'bev-3',
    name: 'Coca Cola',
    quantity: '750 ml',
    price: 40,
    image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=400&fit=crop',
    category: 'beverages',
    deliveryTime: '13 MINS',
    description: 'The original cola drink with its iconic taste. Perfectly carbonated for that refreshing fizz. Best served chilled.',
    nutritionalInfo: {
      calories: '140 kcal',
      protein: '0g',
      carbs: '39g',
      fat: '0g',
    },
    ingredients: 'Carbonated water, sugar, caramel color, phosphoric acid, natural flavors, caffeine',
    brand: 'Coca Cola',
    origin: 'USA',
  },
  {
    id: 'bev-4',
    name: 'Tropicana Orange',
    quantity: '1 L',
    price: 99,
    image: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400&h=400&fit=crop',
    category: 'beverages',
    deliveryTime: '13 MINS',
    description: '100% pure orange juice with no added sugar. Made from sun-ripened oranges, packed with Vitamin C to boost your immunity.',
    nutritionalInfo: {
      calories: '45 kcal',
      protein: '0.7g',
      carbs: '10g',
      fat: '0.2g',
    },
    ingredients: '100% orange juice from concentrate',
    brand: 'Tropicana',
    origin: 'USA',
  },
];

// Get all products as a flat array
export const getAllProducts = (): ProductWithDetails[] => {
  return [
    ...dairyProducts,
    ...vegetableProducts,
    ...snackProducts,
    ...breakfastProducts,
    ...beverageProducts,
  ];
};

// Get product by ID
export const getProductById = (id: string): ProductWithDetails | undefined => {
  return getAllProducts().find((product) => product.id === id);
};

// Get related products (same category, excluding current product)
export const getRelatedProducts = (productId: string, limit: number = 4): ProductWithDetails[] => {
  const product = getProductById(productId);
  if (!product) return [];
  
  return getAllProducts()
    .filter((p) => p.category === product.category && p.id !== productId)
    .slice(0, limit);
};
