'use client'
import { useState } from 'react'

export default function AdminSender() {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault() // Evita que se recargue la página
    setLoading(true)
    setStatus('Enviando...')

    try {
      const res = await fetch('/api/send-broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message }),
      })
      
      const data = await res.json()
      
      if (data.success) {
        setStatus(`✅ ¡Enviado a ${data.sent} personas!`)
        setTitle('')   // Limpiar campos
        setMessage('')
      } else {
        setStatus('❌ Error: ' + (data.error || data.message))
      }
    } catch (err) {
      setStatus('❌ Error de conexión con el servidor')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white border border-gray-200 rounded-xl shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">📢 Panel de Avisos</h2>
      
      <form onSubmit={handleSend} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Título del Aviso</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ej: ¡Tortilla recién hecha!"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Mensaje</label>
          <textarea 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            placeholder="Ven antes de que se acabe..."
            rows={3}
            required
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className={`w-full py-3 px-4 rounded-md text-white font-bold transition-colors ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Enviando...' : '🚀 Enviar Notificación'}
        </button>

        {status && (
          <div className={`mt-3 p-2 rounded text-center text-sm font-semibold ${status.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {status}
          </div>
        )}
      </form>
    </div>
  )
}