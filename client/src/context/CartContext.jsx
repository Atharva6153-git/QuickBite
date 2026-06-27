import { createContext, useContext, useState } from 'react'
const CartContext = createContext()

export function CartProvider({ children }) {
    const [cart, setCart] = useState([])

    const addToCart = (item, restaurent) => {
        setCart(prev => {
            const exists = prev.find(i => i._id === item._id)
            if (exists) {
                return prev.map (i =>
                    i._id === item._id ? { ...i, qty: i.qty + 1 } : 1
                )
            }
            return [...prev, {...item, qty:1, restaurentId: restaurent._id, restaurentName: restaurent.name}]
        })
    }

    const removeFromCart = (itemId) => {
        setCart(prev => {
            const exists = prev.find(i= i._id === itemId)
            if (exists?.qty === 1) return prev.filter(i => i._id !== itemId)
                return prev.map(i =>
            i._id === itemId ? { ...i, qty: i.qty - 1} :1
        )
        })
    }

    const clearCart = () => setCart([])

    const cartTotal = cart.reduce((sum, i)=> sum + i.price * i.qty, 0)
    const cartCount = cart.reduce((sum, i) => sum + i.qty, 0)

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, cartTotal, cartCount}}>
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => useContext(CartContext)