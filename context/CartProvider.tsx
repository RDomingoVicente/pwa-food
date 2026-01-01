"use client"

import { createContext, useContext, useState, ReactNode } from 'react'

// Definimos la forma de un item en el carrito
type CartItem = {
  id: string
  name: string
  price: number
  quantity: number
}

// Definimos qué funciones tendrá nuestro cerebro
type CartContextType = {
  items: CartItem[]
  addItem: (product: { id: string; name: string; price: number }) => void
  removeItem: (id: string) => void
  clearCart: () => void
  totalPrice: number
  totalItems: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addItem = (product: { id: string; name: string; price: number }) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id)
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const removeItem = (id: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id)
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.id === id ? { ...i, quantity: i.quantity - 1 } : i
        )
      }
      return prev.filter((i) => i.id !== id)
    })
  }

  const clearCart = () => {
    setItems([])
  }

  // Calculamos totales automágicamente
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, totalPrice, totalItems, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

// Hook para usar el carrito fácil en cualquier sitio
export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart debe usarse dentro de un CartProvider')
  return context
}