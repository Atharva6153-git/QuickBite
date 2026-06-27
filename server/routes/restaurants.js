import express from 'express'
import Restaurant from '../models/Restaurant.js'

const router = express.Router()

const SEED = [
  {
    name: 'Burger Brothers', cuisine: 'Burgers • American',
    rating: 4.3, deliveryTime: 25, offer: '20% OFF above ₹299',
    imageEmoji: '🍔', priceForTwo: 400, category: 'Burgers',
    categories: [
      { name: 'Bestsellers', items: [
        { name: 'Classic Smash Burger', description: 'Double patty, cheddar, secret sauce', price: 199, isVeg: false, emoji: '🍔' },
        { name: 'Veggie Delight Burger', description: 'Aloo tikki, mint chutney, lettuce', price: 149, isVeg: true, emoji: '🥦' },
        { name: 'Crispy Chicken Burger', description: 'Fried chicken thigh, coleslaw', price: 229, isVeg: false, emoji: '🍗' },
      ]},
      { name: 'Sides', items: [
        { name: 'Loaded Fries', description: 'Cheese sauce, jalapeños, onions', price: 129, isVeg: true, emoji: '🍟' },
        { name: 'Onion Rings', description: 'Crispy battered rings, dipping sauce', price: 99, isVeg: true, emoji: '🧅' },
      ]},
    ]
  },
  {
    name: 'Pizza Palace', cuisine: 'Pizza • Italian',
    rating: 4.5, deliveryTime: 35, offer: 'Buy 1 Get 1 Free',
    imageEmoji: '🍕', priceForTwo: 500, category: 'Pizza',
    categories: [
      { name: 'Pizzas', items: [
        { name: 'Margherita', description: 'Tomato, fresh mozzarella, basil', price: 279, isVeg: true, emoji: '🍕' },
        { name: 'Pepperoni Blast', description: 'Extra pepperoni, mushrooms, olives', price: 349, isVeg: false, emoji: '🍕' },
        { name: 'Paneer Tikka Pizza', description: 'Tandoori paneer, capsicum, onion', price: 319, isVeg: true, emoji: '🍕' },
      ]},
      { name: 'Sides', items: [
        { name: 'Garlic Bread', description: 'Butter garlic, herb seasoning', price: 99, isVeg: true, emoji: '🥖' },
      ]},
    ]
  },
  {
    name: 'Desi Dhaba', cuisine: 'North Indian • Mughlai',
    rating: 4.6, deliveryTime: 30, offer: 'Free delivery',
    imageEmoji: '🍛', priceForTwo: 350, category: 'Indian',
    categories: [
      { name: 'Main Course', items: [
        { name: 'Butter Chicken', description: 'Creamy tomato gravy, naan', price: 249, isVeg: false, emoji: '🍗' },
        { name: 'Dal Makhani', description: 'Black lentils slow cooked overnight', price: 179, isVeg: true, emoji: '🫘' },
        { name: 'Paneer Butter Masala', description: 'Cottage cheese in rich onion gravy', price: 219, isVeg: true, emoji: '🧀' },
      ]},
      { name: 'Rice & Bread', items: [
        { name: 'Jeera Rice', description: 'Basmati, cumin tempering', price: 99, isVeg: true, emoji: '🍚' },
        { name: 'Butter Naan', description: 'Tandoor-baked, generous butter', price: 49, isVeg: true, emoji: '🫓' },
      ]},
    ]
  },
  {
    name: 'Wok This Way', cuisine: 'Chinese • Asian',
    rating: 4.1, deliveryTime: 20, offer: '15% OFF',
    imageEmoji: '🍜', priceForTwo: 300, category: 'Chinese',
    categories: [
      { name: 'Noodles & Rice', items: [
        { name: 'Veg Hakka Noodles', description: 'Wok-tossed, soya sauce', price: 159, isVeg: true, emoji: '🍜' },
        { name: 'Chicken Fried Rice', description: 'Egg, chicken, spring onion', price: 189, isVeg: false, emoji: '🍳' },
      ]},
      { name: 'Starters', items: [
        { name: 'Veg Manchurian', description: 'Crispy balls in tangy sauce', price: 149, isVeg: true, emoji: '🥦' },
        { name: 'Spring Rolls', description: 'Crispy, cabbage & carrot filling', price: 119, isVeg: true, emoji: '🌯' },
      ]},
    ]
  },
  {
    name: 'Sweet Tooth', cuisine: 'Desserts • Bakery',
    rating: 4.7, deliveryTime: 15, offer: '10% OFF',
    imageEmoji: '🍦', priceForTwo: 200, category: 'Desserts',
    categories: [
      { name: 'Desserts', items: [
        { name: 'Gulab Jamun', description: 'Warm syrup, 4 pieces', price: 89, isVeg: true, emoji: '🍮' },
        { name: 'Chocolate Lava Cake', description: 'Warm centre, vanilla ice cream', price: 149, isVeg: true, emoji: '🎂' },
        { name: 'Mango Kulfi', description: 'Creamy, real mango, stick', price: 79, isVeg: true, emoji: '🥭' },
      ]},
    ]
  },
  {
    name: 'Mumbai Rolls', cuisine: 'Rolls • Street Food',
    rating: 4.2, deliveryTime: 18, offer: 'Combo deals',
    imageEmoji: '🌯', priceForTwo: 250, category: 'Rolls',
    categories: [
      { name: 'Rolls', items: [
        { name: 'Chicken Kathi Roll', description: 'Egg, chicken tikka, chutney', price: 139, isVeg: false, emoji: '🌯' },
        { name: 'Paneer Roll', description: 'Grilled paneer, onion, lemon', price: 119, isVeg: true, emoji: '🌯' },
        { name: 'Pav Bhaji', description: 'Mumbai-style thick bhaji, 2 pav', price: 129, isVeg: true, emoji: '🍞' },
      ]},
    ]
  },
]

// GET /api/restaurants
router.get('/', async (req, res) => {
  try {
    const count = await Restaurant.countDocuments()
    if (count === 0) await Restaurant.insertMany(SEED)

    const { search, category } = req.query
    const query = {}
    if (search)   query.name = { $regex: search, $options: 'i' }
    if (category) query.category = category

    const restaurants = await Restaurant.find(query).select('-categories')
    res.json(restaurants)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/restaurants/:id
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id)
    if (!restaurant)
      return res.status(404).json({ message: 'Restaurant not found' })
    res.json(restaurant)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

export default router