import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// 1. Lectura segura de variables (sin signos !)
// Si no existen, usamos una cadena vacía '' para que TypeScript no se queje
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

// 2. Comprobación para avisarte si algo va mal
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ ERROR CRÍTICO EN /api/subscribe: Faltan claves en el archivo .env");
}

// 3. Inicializar cliente con variables seguras
const supabase = createClient(supabaseUrl, supabaseKey)

export async function POST(request: Request) {
  console.log("📥 [API Subscribe] Recibida petición de suscripción...");

  try {
    const body = await request.json()

    // Validamos que lleguen los datos necesarios
    if (!body || !body.endpoint || !body.keys) {
      console.error("⚠️ [API Subscribe] Datos incompletos:", body);
      return NextResponse.json({ error: "Faltan datos de suscripción" }, { status: 400 })
    }

    console.log("🔑 [API Subscribe] Guardando usuario en la base de datos...");

    // Insertar en la tabla 'push_subscriptions'
    const { error } = await supabase
      .from('push_subscriptions')
      .insert({
        endpoint: body.endpoint,
        keys: body.keys
      })

    if (error) {
      // Si el error es código 23505 significa que ya existe (duplicado), no es grave
      if (error.code === '23505') {
        console.log("ℹ️ [API Subscribe] El usuario ya estaba suscrito.");
        return NextResponse.json({ success: true, message: "Ya existía" })
      }
      
      console.error("❌ [API Subscribe] Error Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("✅ [API Subscribe] ¡Guardado correctamente!");
    return NextResponse.json({ success: true })

  } catch (err: any) {
    console.error("🔥 [API Subscribe] Error servidor:", err);
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
