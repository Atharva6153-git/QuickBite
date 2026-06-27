import { Plus, Minus } from 'lucide-react'
import { useCart } from '../context/CartContext'

export default function MenuItem({ item, restaurant }) {
  const { cart, addToCart, removeFromCart } = useCart()
  const inCart = cart.find(i => i._id === item._id)

  return (
    <div className="flex items-center gap-4 py-4 border-b border-gray-50 last:border-0">

      <div className="text-3xl flex-shrink-0 w-12 text-center">
        {item.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className={`w-2.5 h-2.5 rounded-sm border flex-shrink-0
            ${item.isVeg ? 'border-green-600' : 'border-red-500'}`}>
            <span className={`block w-1 h-1 rounded-full m-0.5
              ${item.isVeg ? 'bg-green-600' : 'bg-red-500'}`}>
            </span>
          </span>
          <h4 className="font-medium text-gray-900 text-sm truncate">
            {item.name}
          </h4>
        </div>

        <p className="text-xs text-gray-400 mb-1 line-clamp-2">
          {item.description}
        </p>

        <p className="text-sm font-semibold text-gray-800">
          ₹{item.price}
        </p>
      </div>

      <div className="flex-shrink-0">
        {!inCart ? (
          <button
            onClick={() => addToCart(item, restaurant)}
            className="flex items-center gap-1 bg-white border border-orange-400 text-orange-500 hover:bg-orange-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={14} /> Add
          </button>
        ) : (
          <div className="flex items-center gap-2 bg-orange-500 text-white rounded-lg overflow-hidden">
            <button
              onClick={() => removeFromCart(item._id)}
              className="px-2 py-1.5 hover:bg-orange-600 transition-colors"
            >
              <Minus size={14} />
            </button>
            <span className="text-sm font-medium min-w-4 text-center">
              {inCart.qty}
            </span>
            <button
              onClick={() => addToCart(item, restaurant)}
              className="px-2 py-1.5 hover:bg-orange-600 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        )}
      </div>

    </div>
  )
}