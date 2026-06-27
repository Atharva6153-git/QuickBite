import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Star, Clock, Tag } from 'lucide-react'
import MenuItem from '../components/MenuItem'
import { getRestaurant } from '../api'

const MOCK_MENUS = {
  '1': {
    _id: '1', name: 'Burger Brothers', cuisine: 'Burgers • American',
    rating: 4.3, deliveryTime: 25, offer: '20% OFF above ₹299', imageEmoji: '🍔',
    categories: [
      { name: 'Bestsellers', items: [
        { _id: 'b1', name: 'Classic Smash Burger', description: 'Double patty, cheddar, secret sauce', price: 199, isVeg: false, emoji: '🍔' },
        { _id: 'b2', name: 'Veggie Delight Burger', description: 'Aloo tikki, mint chutney, lettuce', price: 149, isVeg: true, emoji: '🥦' },
        { _id: 'b3', name: 'Crispy Chicken Burger', description: 'Fried chicken thigh, coleslaw', price: 229, isVeg: false, emoji: '🍗' },
      ]},
      { name: 'Sides', items: [
        { _id: 'b4', name: 'Loaded Fries', description: 'Cheese sauce, jalapeños, onions', price: 129, isVeg: true, emoji: '🍟' },
        { _id: 'b5', name: 'Onion Rings', description: 'Crispy battered rings, dipping sauce', price: 99, isVeg: true, emoji: '🧅' },
      ]},
    ]
  },
  '2': {
    _id: '2', name: 'Pizza Palace', cuisine: 'Pizza • Italian',
    rating: 4.5, deliveryTime: 35, offer: 'Buy 1 Get 1 Free', imageEmoji: '🍕',
    categories: [
      { name: 'Pizzas', items: [
        { _id: 'p1', name: 'Margherita', description: 'Tomato, fresh mozzarella, basil', price: 279, isVeg: true, emoji: '🍕' },
        { _id: 'p2', name: 'Pepperoni Blast', description: 'Extra pepperoni, mushrooms, olives', price: 349, isVeg: false, emoji: '🍕' },
        { _id: 'p3', name: 'Paneer Tikka Pizza', description: 'Tandoori paneer, capsicum, onion', price: 319, isVeg: true, emoji: '🍕' },
      ]},
      { name: 'Sides', items: [
        { _id: 'p4', name: 'Garlic Bread', description: 'Butter garlic, herb seasoning', price: 99, isVeg: true, emoji: '🥖' },
      ]},
    ]
  },
  '3': {
    _id: '3', name: 'Desi Dhaba', cuisine: 'North Indian • Mughlai',
    rating: 4.6, deliveryTime: 30, offer: 'Free delivery', imageEmoji: '🍛',
    categories: [
      { name: 'Main Course', items: [
        { _id: 'd1', name: 'Butter Chicken', description: 'Creamy tomato gravy, naan', price: 249, isVeg: false, emoji: '🍗' },
        { _id: 'd2', name: 'Dal Makhani', description: 'Black lentils slow cooked overnight', price: 179, isVeg: true, emoji: '🫘' },
        { _id: 'd3', name: 'Paneer Butter Masala', description: 'Cottage cheese in rich onion gravy', price: 219, isVeg: true, emoji: '🧀' },
      ]},
      { name: 'Rice & Bread', items: [
        { _id: 'd4', name: 'Jeera Rice', description: 'Basmati, cumin tempering', price: 99, isVeg: true, emoji: '🍚' },
        { _id: 'd5', name: 'Butter Naan', description: 'Tandoor-baked, generous butter', price: 49, isVeg: true, emoji: '🫓' },
      ]},
    ]
  },
  '4': {
    _id: '4', name: 'Wok This Way', cuisine: 'Chinese • Asian',
    rating: 4.1, deliveryTime: 20, offer: '15% OFF', imageEmoji: '🍜',
    categories: [
      { name: 'Noodles & Rice', items: [
        { _id: 'w1', name: 'Veg Hakka Noodles', description: 'Wok-tossed, soya sauce', price: 159, isVeg: true, emoji: '🍜' },
        { _id: 'w2', name: 'Chicken Fried Rice', description: 'Egg, chicken, spring onion', price: 189, isVeg: false, emoji: '🍳' },
      ]},
      { name: 'Starters', items: [
        { _id: 'w3', name: 'Veg Manchurian', description: 'Crispy balls in tangy sauce', price: 149, isVeg: true, emoji: '🥦' },
        { _id: 'w4', name: 'Spring Rolls', description: 'Crispy, cabbage & carrot filling', price: 119, isVeg: true, emoji: '🌯' },
      ]},
    ]
  },
  '5': {
    _id: '5', name: 'Sweet Tooth', cuisine: 'Desserts • Bakery',
    rating: 4.7, deliveryTime: 15, offer: '10% OFF', imageEmoji: '🍦',
    categories: [
      { name: 'Desserts', items: [
        { _id: 's1', name: 'Gulab Jamun', description: 'Warm syrup, 4 pieces', price: 89, isVeg: true, emoji: '🍮' },
        { _id: 's2', name: 'Chocolate Lava Cake', description: 'Warm centre, vanilla ice cream', price: 149, isVeg: true, emoji: '🎂' },
        { _id: 's3', name: 'Mango Kulfi', description: 'Creamy, real mango, stick', price: 79, isVeg: true, emoji: '🥭' },
      ]},
    ]
  },
  '6': {
    _id: '6', name: 'Mumbai Rolls', cuisine: 'Rolls • Street Food',
    rating: 4.2, deliveryTime: 18, offer: 'Combo deals', imageEmoji: '🌯',
    categories: [
      { name: 'Rolls', items: [
        { _id: 'r1', name: 'Chicken Kathi Roll', description: 'Egg, chicken tikka, chutney', price: 139, isVeg: false, emoji: '🌯' },
        { _id: 'r2', name: 'Paneer Roll', description: 'Grilled paneer, onion, lemon', price: 119, isVeg: true, emoji: '🌯' },
        { _id: 'r3', name: 'Pav Bhaji', description: 'Mumbai-style thick bhaji, 2 pav', price: 129, isVeg: true, emoji: '🍞' },
      ]},
    ]
  },
}

export default function RestaurantMenu() {
  const { id } = useParams()
  const [restaurant, setRestaurant] = useState(null)
  const [activeCategory, setActiveCategory] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getRestaurant(id)
        setRestaurant(res.data)
      } catch {
        setRestaurant(MOCK_MENUS[id] || MOCK_MENUS['1'])
      }
    }
    fetchData()
  }, [id])

  if (!restaurant) return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-100 rounded w-48" />
        <div className="h-32 bg-gray-100 rounded-xl" />
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">

      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-4">
        <ArrowLeft size={15} /> Back
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 flex items-center gap-4">
        <div className="text-4xl w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
          {restaurant.imageEmoji}
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">{restaurant.name}</h1>
          <p className="text-xs text-gray-400 mb-1.5">{restaurant.cuisine}</p>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1 text-green-600 font-medium">
              <Star size={11} fill="currentColor" /> {restaurant.rating}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={11} /> {restaurant.deliveryTime} min
            </span>
            {restaurant.offer && (
              <span className="flex items-center gap-1 text-green-700 bg-green-50 px-2 py-0.5 rounded">
                <Tag size={10} /> {restaurant.offer}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {restaurant.categories?.map((cat, i) => (
          <button
            key={i}
            onClick={() => setActiveCategory(i)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
              ${activeCategory === i
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-300'
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 px-4">
        {restaurant.categories?.[activeCategory]?.items.map(item => (
          <MenuItem key={item._id} item={item} restaurant={restaurant} />
        ))}
      </div>

    </div>
  )
}