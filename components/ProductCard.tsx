"use client"

import { useCart } from '@/context/CartProvider' // Importamos el cerebro

interface ProductProps {
  id: string
  name: string
  price: number
  image_url: string | null
  description: string | null
  stock: number
}

export default function ProductCard({ product }: { product: ProductProps }) {
  // 👇 En vez de useState, usamos el contexto global
  const { items, addItem, removeItem } = useCart()
  
  // Buscamos cuántas de ESTAS tarjetas hay en el carrito
  const cartItem = items.find((i) => i.id === product.id)
  const quantity = cartItem ? cartItem.quantity : 0

  return (
    <article className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden flex flex-col h-full">
      <div className="h-48 bg-gray-200 relative">
         <img 
           src={product.image_url || "https://placehold.co/600x400"} 
           alt={product.name}
           className="w-full h-full object-cover"
         />
         {quantity > 0 && (
           <div className="absolute top-2 right-2 bg-black text-white text-xs font-bold px-2 py-1 rounded-full">
             {quantity}
           </div>
         )}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <h2 className="font-bold text-lg text-gray-800 leading-tight">{product.name}</h2>
          <span className="font-bold text-blue-600">{product.price.toFixed(2)} €</span>
        </div>
        
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{product.description}</p>

        <div className="flex justify-between items-center pt-4 border-t mt-auto">
          <span className="text-xs text-gray-500">Stock: {product.stock - quantity}</span>
          
          {quantity === 0 ? (
             <button 
               onClick={() => addItem({ id: product.id, name: product.name, price: product.price })}
               disabled={product.stock === 0}
               className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium active:scale-95 transition-transform"
             >
               {product.stock === 0 ? 'Agotado' : 'Añadir'}
             </button>
          ) : (
            <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
              <button onClick={() => removeItem(product.id)} className="w-8 h-8 bg-white rounded shadow font-bold text-black">-</button>
              <span className="font-bold w-4 text-center">{quantity}</span>
              <button 
                onClick={() => addItem({ id: product.id, name: product.name, price: product.price })} 
                className="w-8 h-8 bg-black text-white rounded shadow font-bold"
                disabled={quantity >= product.stock}
              >+</button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}