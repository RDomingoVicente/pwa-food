"use client"
import { useCart } from '@/context/CartProvider' // O CartContext, revisa tu nombre
import Link from 'next/link'

export default function CartSummary() {
  // 👇 AQUÍ ES DONDE SE DEBE LLAMAR AL HOOK (Arriba del todo)
  // Extraemos 'clearCart' junto con lo demás
  const { totalItems, totalPrice, clearCart } = useCart()

  if (totalItems === 0) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="bg-black text-white rounded-xl shadow-2xl p-4 flex justify-between items-center max-w-4xl mx-auto">
        
        <div className="flex flex-col gap-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-gray-400">{totalItems} productos</span>
            {/* 👇 Botón de papelera para vaciar */}
            <button 
              onClick={() => clearCart()} 
              className="text-xs text-red-400 underline hover:text-red-300"
            >
              Vaciar
            </button>
          </div>
          <span className="font-bold text-xl">{totalPrice.toFixed(2)} €</span>
        </div>

        <Link href="/checkout">
          <button className="bg-white text-black font-bold px-6 py-2 rounded-lg hover:bg-gray-200 transition-colors">
            Ver Pedido →
          </button>
        </Link>
        
      </div>
    </div>
  )
}

