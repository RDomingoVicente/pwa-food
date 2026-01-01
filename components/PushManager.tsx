"use client";

import { useState, useEffect } from "react";

// Función auxiliar para convertir tu clave VAPID (Criptografía necesaria)
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function PushManager() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  // Al cargar, instalamos el Service Worker (sw.js)
  useEffect(() => {
    if ("serviceWorker" in navigator && "PushManager" in window) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((registration) => {
          console.log("Service Worker registrado con éxito:", registration);
          // Comprobamos si ya estaba suscrito de antes
          registration.pushManager.getSubscription().then((sub) => {
            if (sub) setIsSubscribed(true);
          });
        })
        .catch((error) => console.error("Error en SW:", error));
    }
  }, []);

  const subscribeToPush = async () => {
    setLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // 1. Pedimos permiso al usuario (Sale el popup del navegador)
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY! // Tu clave pública del .env
        ),
      });

      // 2. Enviamos la suscripción a TU servidor
      await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sub),
      });

      setIsSubscribed(true);
      alert("¡Activado! Te avisaremos cuando haya comida rica.");
    } catch (error) {
      console.error("Error suscribiendo:", error);
      alert("Hubo un error o denegaste el permiso.");
    } finally {
      setLoading(false);
    }
  };

  // Si ya está suscrito, no mostramos el botón (para no molestar)
  if (isSubscribed) return null;

  return (
    <button
      onClick={subscribeToPush}
      disabled={loading}
      className="fixed bottom-20 right-4 bg-blue-600 text-white p-3 rounded-full shadow-lg z-40 animate-bounce"
    >
      {loading ? "..." : "🔔 Activar Avisos"}
    </button>
  );
}