"use client"

import { useCart } from '@/context/CartProvider'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function CheckoutPage() {
  const { items, totalPrice, removeItem } = useCart()
  const router = useRouter()

  // Si no hay cosas, volver al inicio
  useEffect(() => {
    if (items.length === 0) {
      router.push('/')
    }
  }, [items, router])

  // Función para generar mensaje de WhatsApp
  const handleWhatsApp = () => {
    const text = items.map(i => `• ${i.quantity}x ${i.name}`).join('%0A')
    const total = `%0ATotal: ${totalPrice.toFixed(2)}€`
    // CAMBIA ESTE NÚMERO POR EL TUYO 👇
    const phone = "34648166333" 
    window.open(`https://wa.me/${phone}?text=Hola! Quiero pedir:%0A${text}${total}`, '_blank')
  }

  if (items.length === 0) return null

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">Tu Pedido 📝</h1>

        <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-4 border-b last:border-0">
              <div className="flex items-center gap-3">
                <span className="bg-gray-100 px-2 py-1 rounded font-bold text-sm">
                  {item.quantity}x
                </span>
                <div>
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-gray-500">{(item.price * item.quantity).toFixed(2)} €</p>
                </div>
              </div>
              <button 
                onClick={() => removeItem(item.id)}
                className="text-red-500 text-sm font-bold px-2 py-1"
              >
                Eliminar
              </button>
            </div>
          ))}
          
          <div className="p-4 bg-gray-50 flex justify-between items-center border-t">
            <span className="font-bold text-gray-600">Total a pagar</span>
            <span className="font-bold text-xl text-black">{totalPrice.toFixed(2)} €</span>
          </div>
        </div>

        <button 
          onClick={handleWhatsApp}
          className="w-full bg-green-600 text-white font-bold py-4 rounded-xl shadow-lg mb-4 hover:bg-green-700 transition flex justify-center items-center gap-2"
        >
          <span>📱</span> Pedir por WhatsApp
        </button>

        <Link href="/" className="block text-center text-gray-500 text-sm hover:underline">
          ← Volver a la carta
        </Link>
      </div>
    </main>
  )
}