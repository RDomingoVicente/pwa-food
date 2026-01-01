import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import webpush from 'web-push'

// 1. Configuración de Supabase (Lectura segura)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// 2. Configuración de WebPush (Tus llaves)
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@tuapp.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
)

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, message } = body

    // Validación básica
    if (!title || !message) {
      return NextResponse.json({ error: "Falta título o mensaje" }, { status: 400 })
    }

    console.log(`📢 Iniciando envío masivo: "${title}"`)

    // A. Buscar a todos los suscriptores en Supabase
    const { data: subscribers, error } = await supabase
      .from('push_subscriptions')
      .select('*')

    if (error) throw error;

    if (!subscribers || subscribers.length === 0) {
      return NextResponse.json({ message: 'No hay nadie suscrito todavía' })
    }

    console.log(`📬 Destinatarios encontrados: ${subscribers.length}`)

    // B. Preparar el mensaje
    const payload = JSON.stringify({
      title: title,
      body: message,
      icon: '/icon.png', // Asegúrate de tener un icono o comenta esta línea
      url: '/' // Para que al hacer clic abran la app
    })

    // C. Enviar a todos en paralelo
    // Usamos Promise.allSettled para que si falla uno, no se detenga el resto
    const results = await Promise.allSettled(
      subscribers.map((sub) => 
        webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload)
      )
    )

    // Contar éxitos
    const successCount = results.filter(r => r.status === 'fulfilled').length

    console.log(`✅ Enviado con éxito a ${successCount} dispositivos`)

    return NextResponse.json({ success: true, sent: successCount })

  } catch (err: any) {
    console.error("🔥 Error en envío masivo:", err);
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}