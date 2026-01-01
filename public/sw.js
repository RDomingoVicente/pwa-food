// public/sw.js

self.addEventListener('push', function (event) {
  // Si no hay datos, no hacemos nada
  if (!event.data) return;

  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/icon-512.png', // Usamos tu icono de hamburguesa
    badge: '/icon-512.png', // Icono pequeño para la barra de estado
    vibrate: [100, 50, 100], // Patrón de vibración
    data: {
      url: data.url || '/', // A dónde ir si hacen clic
    },
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  // Al hacer clic, abrimos la app
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});