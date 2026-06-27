import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, LogOut, ClipboardList, Zap, User } from 'lucide-react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function Navbar() {
  const { cartCount } = useCart()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">

        <Link to="/" className="flex items-center gap-2 font-bold text-orange-500 text-lg">
          <Zap size={20} fill="currentColor" />
          QuickBite
        </Link>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <span className="text-sm text-gray-500 hidden sm:block">
                Hi, {user.name.split(' ')[0]}
              </span>
              <Link to="/orders" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                <ClipboardList size={16} />
                <span className="hidden sm:inline">Orders</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <Link to="/login" className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-50">
              <User size={16} />
              Login
            </Link>
          )}

          <Link to="/cart" className="relative flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm px-3 py-1.5 rounded-lg transition-colors">
            <ShoppingCart size={16} />
            <span>Cart</span>
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gray-900 text-white text-xs w-4 h-4 rounded-full flex items-center justify-center font-medium">
                {cartCount}
              </span>
            )}
          </Link>
        </div>

      </div>
    </nav>
  )
}