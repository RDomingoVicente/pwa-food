import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import webpush from 'web-push'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Configurar WebPush con tus claves
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@tuapp.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

export async function POST(request: Request) {
  try {
    const { title, message, url } = await request.json()

    // 1. Obtener todos los suscriptores
    const { data: subscribers, error } = await supabase
      .from('push_subscriptions')
      .select('*')

    if (error) throw error
    if (!subscribers || subscribers.length === 0) {
        return NextResponse.json({ success: true, count: 0, message: "No hay suscriptores" })
    }

    console.log(`📣 Intentando enviar a ${subscribers.length} usuarios...`)

    // 2. Preparar el mensaje (Payload)
    const payload = JSON.stringify({
      title: title || 'Hola',
      body: message || 'Nuevo mensaje',
      icon: '/icon.png', // Asegúrate de que esta imagen existe en /public
      url: url || '/' 
    })

    // 3. Enviar uno a uno (reconstruyendo el objeto keys)
    const promises = subscribers.map(sub => {
      
      // ⚠️ AQUÍ ESTÁ LA MAGIA: Reconstruimos el formato que quiere web-push
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          auth: sub.auth,      // Sacamos de la columna plana
          p256dh: sub.p256dh   // Sacamos de la columna plana
        }
      }

      // Enviamos y controlamos errores individuales
      return webpush.sendNotification(pushSubscription as any, payload)
        .catch(err => {
            console.error(`❌ Fallo al enviar a ${sub.id}:`, err.statusCode)
            // Si el error es 410 (Gone), el usuario ya no existe -> Lo borramos
            if (err.statusCode === 410 || err.statusCode === 404) {
                console.log(`🗑️ Borrando suscripción caducada: ${sub.id}`)
                supabase.from('push_subscriptions').delete().match({ id: sub.id }).then()
            }
            return null // Retornamos null para filtrar fallos luego
        })
    })

    // Esperar a que todos terminen (con éxito o error)
    const results = await Promise.all(promises)
    const sentCount = results.filter(r => r !== null).length

    console.log(`✅ Enviados correctamente: ${sentCount}/${subscribers.length}`)

    return NextResponse.json({ success: true, count: sentCount })

  } catch (err: any) {
    console.error('🔥 Error Global Send:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}