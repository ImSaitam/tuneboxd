// Script temporal para forzar la actualización del Service Worker
// Ejecutar en la consola del navegador para forzar actualización de caché

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(registrations) {
    for(let registration of registrations) {
      registration.unregister();
      console.log('Service Worker desregistrado:', registration);
    }
    // Recargar la página después de desregistrar
    setTimeout(() => {
      window.location.reload(true);
    }, 1000);
  });
} else {
  console.log('Service Worker no soportado');
  // Forzar recarga sin caché
  window.location.reload(true);
}
