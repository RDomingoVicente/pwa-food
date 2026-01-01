import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import webpush from 'web-push'

// 1. Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// 2. Configuración de WebPush (Claves VAPID)
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ''
const vapidEmail = process.env.VAPID_SUBJECT || 'mailto:test@ejemplo.com'

if (!vapidPublicKey || !vapidPrivateKey) {
  console.error("❌ ERROR CRÍTICO: Faltan claves VAPID en .env");
}

// Configuramos la librería de notificaciones
webpush.setVapidDetails(
  vapidEmail,
  vapidPublicKey,
  vapidPrivateKey
)

export async function GET() {
  console.log("🔔 [API Test] Iniciando envío masivo...");

  try {
    // A. Obtener suscriptores de la BD
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*')

    if (error) throw error;

    if (!subscriptions || subscriptions.length === 0) {
      console.warn("⚠️ [API Test] Base de datos vacía. Nadie a quien escribir.");
      return NextResponse.json({ message: 'No hay suscriptores en la base de datos' })
    }

    console.log(`📬 [API Test] Encontrados ${subscriptions.length} destinatarios.`);

    // B. El mensaje a enviar
    const payload = JSON.stringify({
      title: '¡Funciona! 🚀',
      body: 'Tu sistema PWA está conectado y listo para recibir alertas del clima.',
      icon: '/icon.png' // Asegúrate de tener una imagen aquí o quita esta línea
    })

    // C. Enviar a todos en paralelo
    const results = await Promise.allSettled(
      subscriptions.map((sub) => {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: sub.keys // Supabase devuelve esto como JSON automáticamente
        }
        return webpush.sendNotification(pushSubscription, payload)
      })
    )

    // D. Contar resultados
    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failCount = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ [API Test] Resultado: ${successCount} enviados, ${failCount} fallidos.`);

    return NextResponse.json({ 
      success: true, 
      sent: successCount, 
      failed: failCount 
    })

  } catch (err: any) {
    console.error("🔥 [API Test] Error fatal:", err);
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}