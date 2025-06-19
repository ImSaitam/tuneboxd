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
  console.log('SW: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('SW: Cache opened');
        // Cachear URLs individualmente para mejor manejo de errores
        return Promise.allSettled(
          urlsToCache.map(url => {
            return cache.add(url).catch(err => {
              console.warn(`SW: Failed to cache ${url}:`, err);
              return null; // Continuar con otras URLs
            });
          })
        );
      })
      .then(() => {
        console.log('SW: Cache setup completed');
        return self.skipWaiting(); // Activar inmediatamente
      })
      .catch(err => {
        console.error('SW: Installation failed:', err);
      })
  );
});

// Activar Service Worker y limpiar caches antiguos
self.addEventListener('activate', (event) => {
  console.log('SW: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
            console.log('SW: Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('SW: Activated and controlling clients');
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
              console.warn('SW: Failed to cache page:', err);
            });
          });
        }
        return networkResponse;
      }).catch(err => {
        console.error('SW: Fetch failed for:', url.pathname, err);
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
