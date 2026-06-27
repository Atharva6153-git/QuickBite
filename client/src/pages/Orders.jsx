import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Clock, ChevronRight } from 'lucide-react'
import { getMyOrders } from '../api'
import { useAuth } from '../context/AuthContext'

const STATUS_COLORS = {
  pending:          'bg-yellow-50 text-yellow-700',
  confirmed:        'bg-blue-50 text-blue-700',
  preparing:        'bg-orange-50 text-orange-700',
  out_for_delivery: 'bg-purple-50 text-purple-700',
  delivered:        'bg-green-50 text-green-700',
  cancelled:        'bg-red-50 text-red-700',
}

const MOCK_ORDERS = [
  {
    _id: 'ord1',
    restaurantName: 'Burger Brothers',
    items: [
      { name: 'Classic Smash Burger', qty: 2 },
      { name: 'Loaded Fries', qty: 1 }
    ],
    total: 527,
    status: 'delivered',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: 'ord2',
    restaurantName: 'Desi Dhaba',
    items: [
      { name: 'Butter Chicken', qty: 1 },
      { name: 'Jeera Rice', qty: 1 }
    ],
    total: 378,
    status: 'out_for_delivery',
    createdAt: new Date(Date.now() - 1800000).toISOString()
  },
]

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) { setLoading(false); return }
    getMyOrders()
      .then(res => setOrders(res.data?.length ? res.data : MOCK_ORDERS))
      .catch(() => setOrders(MOCK_ORDERS))
      .finally(() => setLoading(false))
  }, [user])

  if (!user) return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <p className="text-4xl mb-3">🔒</p>
      <p className="text-gray-500 text-sm mb-4">
        Please log in to view your orders
      </p>
      <Link
        to="/login"
        className="bg-orange-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
      >
        Log in
      </Link>
    </div>
  )

  if (loading) return (
    <div className="max-w-xl mx-auto px-4 py-8 space-y-3">
      {[1, 2, 3].map(i => (
        <div key={i} className="h-24 bg-white border border-gray-100 rounded-2xl animate-pulse" />
      ))}
    </div>
  )

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-xl font-bold text-gray-900 mb-5">Your orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">📦</p>
          <p className="text-gray-400 text-sm">No orders yet. Time to eat!</p>
          <Link
            to="/"
            className="mt-4 inline-block text-orange-500 text-sm font-medium"
          >
            Browse restaurants →
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(order => (
            <Link
              key={order._id}
              to={`/track/${order._id}`}
              className="block bg-white border border-gray-100 rounded-2xl p-4 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">
                    {order.restaurantName}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {order.items.map(i => `${i.name} x${i.qty}`).join(', ')}
                  </p>
                </div>
                <ChevronRight size={16} className="text-gray-300 mt-0.5 flex-shrink-0" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(order.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                  <span className="font-medium text-gray-700">
                    ₹{order.total}
                  </span>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[order.status] || 'bg-gray-50 text-gray-600'}`}>
                  {order.status.replace(/_/g, ' ')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}