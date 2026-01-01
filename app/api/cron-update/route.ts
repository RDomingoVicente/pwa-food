import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'
import webpush from 'web-push'

// 1. Configuración Segura
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@tuapp.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
)

export async function GET() { 
  // Usamos GET para poder probarlo fácilmente desde el navegador
  try {
    console.log("🌦️ [CRON] Iniciando comprobación del clima...")

    // 2. Coordenadas de Burgos (puedes cambiarlas por tu ciudad)
    const lat = "42.34"; 
    const lon = "-3.70";
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!apiKey) throw new Error("Falta la OPENWEATHER_API_KEY en .env");

    // 3. Consultar OpenWeather
    const weatherRes = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=es`
    );

    if (!weatherRes.ok) throw new Error("Error al conectar con OpenWeather");
    
    const weatherData = await weatherRes.json();
    const temp = Math.round(weatherData.main.temp);
    const desc = weatherData.weather[0].description; // ej: "cielo claro"
    const isRaining = weatherData.weather[0].main.toLowerCase().includes('rain');

    console.log(`📍 Burgos: ${temp}°C, ${desc}`);

    // 4. EL CEREBRO: Decidir el menú 🧠
    let title = "";
    let body = "";

    if (isRaining) {
        title = "☔ ¡Día de lluvia!";
        body = `Hoy apetece algo caliente. Tenemos SOPA DE AJO para entrar en calor a ${temp}°C.`;
    } else if (temp < 15) {
        title = `🥶 Brrr, hace fresquito (${temp}°C)`;
        body = "Ideal para nuestro COCIDO MONTAÑÉS completo. ¡Reserva mesa!";
    } else if (temp >= 15 && temp < 25) {
        title = `🌤️ ¡Día perfecto con ${temp}°C!`;
        body = "Disfruta de nuestra terraza con unas TAPAS y una cerveza fría.";
    } else {
        title = `🥵 ¡Qué calor! (${temp}°C)`;
        body = "Refresca tu día con nuestra ENSALADA CÉSAR y GAZPACHO.";
    }

    // 5. Enviar a todos los suscriptores
    const { data: subscribers } = await supabase.from('push_subscriptions').select('*');

    if (!subscribers || subscribers.length === 0) {
        return NextResponse.json({ message: 'Clima comprobado, pero no hay suscriptores.' })
    }

    const payload = JSON.stringify({
      title: title,
      body: body,
      icon: '/icon.png',
      url: '/'
    });

    const results = await Promise.allSettled(
      subscribers.map(sub => 
        webpush.sendNotification({ endpoint: sub.endpoint, keys: sub.keys }, payload)
      )
    );

    const sentCount = results.filter(r => r.status === 'fulfilled').length;

    return NextResponse.json({ 
      success: true, 
      weather: { temp, desc }, 
      offer: { title, body },
      sent_to: sentCount
    });

  } catch (error: any) {
    console.error("🔥 Error Cron:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
