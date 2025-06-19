'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Registrar Service Worker con manejo mejorado de errores
      navigator.serviceWorker
        .register('/sw.js', {
          scope: '/', // Especificar scope explícitamente
          updateViaCache: 'none' // Asegurar que siempre obtenga la versión más reciente
        })
        .then((registration) => {
          console.log('✅ Service Worker registrado exitosamente:', {
            scope: registration.scope,
            updatefound: !!registration.onupdatefound
          });

          // Manejar actualizaciones del SW
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    console.log('🔄 Nueva versión del Service Worker disponible');
                    // Notificar al SW que puede activarse
                    installingWorker.postMessage({ type: 'SKIP_WAITING' });
                  } else {
                    console.log('✅ Service Worker instalado por primera vez');
                  }
                }
              };
            }
          };
        })
        .catch((error) => {
          console.error('❌ Error registrando Service Worker:', error);
          // No es crítico si falla, la app seguirá funcionando
        });

      // Manejar cambios en el controlador
      navigator.serviceWorker.oncontrollerchange = () => {
        console.log('🔄 Service Worker controller cambió');
      };
    } else {
      console.warn('⚠️ Service Workers no soportados en este navegador');
    }
  }, []);

  return null; // Este componente no renderiza nada visible
}
