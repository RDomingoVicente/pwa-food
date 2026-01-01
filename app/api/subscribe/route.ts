import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// Configuración segura
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // --- AQUÍ ESTÁ EL TRUCO ---
    // El navegador nos envía: { endpoint, keys: { auth, p256dh } }
    // Nosotros extraemos los datos para "aplanarlos"
    const { endpoint, keys } = body

    if (!endpoint || !keys || !keys.auth || !keys.p256dh) {
      return NextResponse.json({ error: 'Faltan datos de suscripción' }, { status: 400 })
    }

    // Insertamos en Supabase asignando cada pieza a su columna real
    // NO pasamos el objeto 'keys', pasamos 'auth' y 'p256dh' sueltos
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        endpoint: endpoint,
        auth: keys.auth,      // <--- Sacamos auth de keys
        p256dh: keys.p256dh,  // <--- Sacamos p256dh de keys
        updated_at: new Date()
      }, { onConflict: 'endpoint' })

    if (error) {
        console.error("Error Supabase:", error)
        throw error
    }

    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error('Error al suscribir:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}