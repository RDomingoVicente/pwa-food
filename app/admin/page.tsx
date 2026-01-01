import AdminSender from '@/components/AdminSender'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-100 p-8 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-800 mb-2 text-center">
          👨‍🍳 Panel de Gerencia
        </h1>
        <p className="text-slate-500 text-sm mb-8 text-center">
          Desde aquí puedes enviar notificaciones a todos tus clientes suscritos.
        </p>
        
        {/* Aquí cargamos el formulario que antes estaba en la home */}
        <AdminSender />

        <div className="mt-8 pt-4 border-t text-center">
            <a href="/" className="text-blue-600 hover:underline text-sm">
                ← Volver a la App pública
            </a>
        </div>
      </div>
    </div>
  )
}