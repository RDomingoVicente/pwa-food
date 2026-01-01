'use client'
import { useState, useEffect } from 'react'

// Función auxiliar para convertir la clave VAPID (necesaria para el navegador)
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState(false) // ¿Ya está suscrito?
  const [permission, setPermission] = useState('default') // 'default', 'granted', 'denied'
  const [loading, setLoading] = useState(false) // Para mostrar "Cargando..." al pulsar

  // 1. AL CARGAR: Comprobar si ya existe una suscripción
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Mirar si el usuario bloqueó o aceptó permisos antes
      setPermission(Notification.permission)

      // Comprobar si existe una suscripción activa en el Service Worker
      navigator.serviceWorker.ready.then(registration => {
        return registration.pushManager.getSubscription()
      }).then(subscription => {
        // Si 'subscription' no es null, es que ya está suscrito
        setIsSubscribed(!!subscription)
      })
    }
  }, [])

  const subscribeToPush = async () => {
    setLoading(true)
    try {
      // A. Registrar el Service Worker (si no estaba ya)
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })
      await navigator.serviceWorker.ready

      // B. Pedir la suscripción al navegador
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!)
      })

      // C. Guardar en tu Base de Datos (Supabase)
      const res = await fetch('/api/subscribe', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })

      if (res.ok) {
        setIsSubscribed(true)
        setPermission('granted')
        // Opcional: Enviar una notificación de bienvenida inmediata
        new Notification("¡Bienvenido!", {
          body: "Ahora recibirás nuestro menú del día.",
          icon: "/icon.png"
        })
      } else {
        alert("Hubo un error al guardar tu suscripción en el servidor.")
      }

    } catch (err: any) {
      console.error(err)
      // Si el usuario deniega el permiso
      if (Notification.permission === 'denied') {
        setPermission('denied')
      } else {
        alert('Error: ' + err.message)
      }
    }
    setLoading(false)
  }

  // --- RENDERIZADO INTELIGENTE ---

  // CASO 1: El usuario bloqueó las notificaciones en el navegador
  if (permission === 'denied') {
    return (
      <div className="text-red-600 text-sm font-medium bg-red-50 p-2 rounded border border-red-200">
        🚫 Has bloqueado las notificaciones.
        <br/>
        <span className="text-xs text-gray-500">Actívalas en el candado 🔒 de la URL.</span>
      </div>
    )
  }

  // CASO 2: Ya está suscrito correctamente
  if (isSubscribed) {
    return (
      <div className="text-green-700 font-bold bg-green-50 p-3 rounded border border-green-200 flex items-center justify-center gap-2">
        <span>✅ ¡Todo listo!</span>
        <span className="text-sm font-normal text-green-600 block">
           Recibirás el menú diario.
        </span>
      </div>
    )
  }

  // CASO 3: Aún no está suscrito (Botón normal)
  return (
    <button 
      onClick={subscribeToPush}
      disabled={loading}
      className={`w-full font-bold py-3 px-6 rounded-lg shadow transition-all transform hover:scale-105 active:scale-95 ${
        loading 
          ? 'bg-gray-400 cursor-wait text-gray-200' 
          : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white'
      }`}
    >
      {loading ? 'Activando...' : '🔔 Avísame del Menú'}
    </button>
  )
}