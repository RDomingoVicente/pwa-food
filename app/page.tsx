import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'
import CartSummary from '@/components/CartSummary'
import NotificationButton from '@/components/NotificationButton' // Solo dejamos este

export default async function Home() {
  const products = await prisma.product.findMany({
    orderBy: { category: 'desc' }
  })

  return (
    <main className="min-h-screen bg-gray-50 pb-32">
      
      {/* Cabecera */}
      <div className="bg-white shadow-sm sticky top-0 z-10 px-6 py-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-900">🍔 MyApp Food</h1>
      </div>

      {/* Grid de Productos */}
      <div className="px-4 max-w-5xl mx-auto mb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard 
              key={product.id} 
              product={{
                ...product,
                price: Number(product.price)
              }} 
            />
          ))}
        </div>
      </div>

      {/* --- SOLO VISTA CLIENTE --- */}
      <div className="px-4 max-w-lg mx-auto mt-8 border-t pt-8">
         <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-center">
            <p className="text-sm text-blue-800 mb-3 font-medium">
                ¿Quieres saber el menú del día antes que nadie?
            </p>
            {/* El cliente solo ve esto */}
            <div className="flex justify-center">
                <NotificationButton />
            </div>
         </div>
      </div>

      <CartSummary />
    </main>
  )
}