const CACHE_NAME = 'tuneboxd-v3';
const API_CACHE_NAME = 'tuneboxd-api-v3';

// URLs que queremos cachear para uso offline (solo las que sabemos que existen)
const urlsToCache = [
  '/',
  '/community',
  '/social',
  '/lists',
  '/favorites'
];

// Instalar Service Worker con manejo de errores mejorado
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Cachear URLs individualmente para mejor manejo de errores
        return Promise.allSettled(
          urlsToCache.map(url => {
            return cache.add(url).catch(err => {
              // Continuar con otras URLs si una falla
              return null;
            });
          })
        );
      })
      .then(() => {
        return self.skipWaiting(); // Activar inmediatamente
      })
      .catch(err => {
        // Error en instalación - manejado silenciosamente
      })
  );
});

// Activar Service Worker y limpiar caches antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim(); // Controlar páginas inmediatamente
    })
  );
});

// Interceptar peticiones de red con manejo mejorado de errores
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo interceptar requests del mismo origen
  if (url.origin !== location.origin) {
    return;
  }

  // Cache estratégico para APIs
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then(async (cache) => {
        try {
          // Intentar petición de red primero (Network First)
          const networkResponse = await fetch(request.clone());
          
          // Si la respuesta es exitosa, cachearla
          if (networkResponse.ok && networkResponse.status === 200) {
            try {
              cache.put(request.clone(), networkResponse.clone());
            } catch (cacheError) {
              console.warn('SW: Failed to cache API response:', cacheError);
            }
          }
          
          return networkResponse;
        } catch (networkError) {
          console.log('SW: Network failed, trying cache for:', url.pathname);
          // Si falla la red, usar cache
          const cachedResponse = await cache.match(request);
          if (cachedResponse) {
            console.log('SW: Serving from cache:', url.pathname);
            return cachedResponse;
          }
          
          // Si no hay cache, devolver error de red
          console.error('SW: No cache available for:', url.pathname);
          throw networkError;
        }
      })
    );
    return;
  }

  // Cache-first para páginas y recursos estáticos
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        console.log('SW: Serving page from cache:', url.pathname);
        return cachedResponse;
      }
      
      // Si no está en cache, hacer petición de red
      return fetch(request).then((networkResponse) => {
        // Clonar la respuesta inmediatamente para evitar errores
        const responseToCache = networkResponse.clone();
        
        // Cachear páginas exitosas
        if (networkResponse.ok && request.method === 'GET') {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache).catch(err => {
              // Error cacheando página - manejado silenciosamente
            });
          });
        }
        return networkResponse;
      }).catch(err => {
        // Error de fetch - no exponer URL o detalles
        throw err;
      });
    })
  );
});

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('SW: Service Worker loaded');
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
