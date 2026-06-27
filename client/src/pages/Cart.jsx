import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, Plus, Minus, Trash2, ArrowRight } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { createOrder } from '../api'
import PaymentModal from '../components/PaymentModal'

export default function Cart() {
  const { cart, addToCart, removeFromCart, clearCart, cartTotal } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState('')
  const [showPayment, setShowPayment] = useState(false)

  const delivery = 30
  const gst = Math.round(cartTotal * 0.05)
  const total = cartTotal + delivery + gst

  // Step 1: validate address/login, then open the payment modal
  const handleCheckout = () => {
    if (!user) return navigate('/login')
    if (!address.trim()) return alert('Please enter a delivery address')
    setShowPayment(true)
  }

  // Step 2: runs only after PaymentModal confirms payment succeeded
  const placeOrder = async () => {
    try {
      setLoading(true)
      const orderData = {
        items: cart.map(i => ({
          item: i._id,
          name: i.name,
          price: i.price,
          qty: i.qty
        })),
        restaurantId: cart[0]?.restaurantId,
        restaurantName: cart[0]?.restaurantName,
        deliveryAddress: address,
        subtotal: cartTotal,
        deliveryFee: delivery,
        gst,
        total,
      }
      const { data: order } = await createOrder(orderData)
      clearCart()
      setShowPayment(false)
      navigate(`/track/${order._id}`)
    } catch (err) {
      console.error(err)
      setShowPayment(false)
      clearCart()
      navigate('/orders')
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-4">🛒</div>
      <h2 className="text-lg font-semibold text-gray-800 mb-2">
        Your cart is empty
      </h2>
      <p className="text-sm text-gray-400 mb-6">
        Add some delicious food to get started
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
      >
        Browse restaurants <ArrowRight size={15} />
      </Link>
    </div>
  )

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-5 flex items-center gap-2">
        <ShoppingCart size={20} /> Your cart
      </h1>

      <div className="bg-white rounded-2xl border border-gray-100 divide-y divide-gray-50 mb-4">
        {cart.map(item => (
          <div key={item._id} className="flex items-center gap-3 p-3.5">
            <span className="text-2xl">{item.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {item.name}
              </p>
              <p className="text-xs text-gray-400">₹{item.price} each</p>
            </div>
            <div className="flex items-center gap-2 bg-orange-500 text-white rounded-lg overflow-hidden">
              <button
                onClick={() => removeFromCart(item._id)}
                className="px-2 py-1.5 hover:bg-orange-600 transition-colors"
              >
                {item.qty === 1 ? <Trash2 size={13} /> : <Minus size={13} />}
              </button>
              <span className="text-sm font-medium min-w-4 text-center">
                {item.qty}
              </span>
              <button
                onClick={() => addToCart(item, {
                  _id: item.restaurantId,
                  name: item.restaurantName
                })}
                className="px-2 py-1.5 hover:bg-orange-600 transition-colors"
              >
                <Plus size={13} />
              </button>
            </div>
            <span className="text-sm font-semibold text-gray-800 min-w-12 text-right">
              ₹{item.price * item.qty}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <label className="text-sm font-medium text-gray-700 block mb-2">
          Delivery address
        </label>
        <textarea
          rows={2}
          placeholder="Enter your full delivery address..."
          value={address}
          onChange={e => setAddress(e.target.value)}
          className="w-full text-sm text-gray-800 placeholder-gray-400 outline-none resize-none border border-gray-200 rounded-lg p-2.5 focus:border-orange-300 transition-colors"
        />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-4">
        <h3 className="text-sm font-semibold text-gray-800 mb-3">
          Bill details
        </h3>
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex justify-between">
            <span>Item total</span><span>₹{cartTotal}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery fee</span><span>₹{delivery}</span>
          </div>
          <div className="flex justify-between">
            <span>GST (5%)</span><span>₹{gst}</span>
          </div>
          <div className="flex justify-between font-semibold text-gray-900 border-t border-gray-100 pt-2 mt-2">
            <span>To pay</span><span>₹{total}</span>
          </div>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        {loading ? 'Processing...' : `Pay ₹${total}`}
        {!loading && <ArrowRight size={16} />}
      </button>

      <p className="text-center text-xs text-gray-400 mt-2">
        Secured by Stripe · Test mode
      </p>

      {showPayment && (
        <PaymentModal
          amount={total}
          onSuccess={placeOrder}
          onClose={() => setShowPayment(false)}
        />
      )}
    </div>
  )
}