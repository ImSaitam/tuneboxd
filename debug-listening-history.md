# 🐛 DEBUG: LISTENING HISTORY ERROR 400

## Problema
Error 400 (Bad Request) al hacer POST a `/api/listening-history` con fecha personalizada.

## Cambios Realizados
1. ✅ Corregido service worker para no cachear requests POST
2. ✅ Corregido formato del payload: `albumData` → `album`
3. ✅ Agregado logging temporal para debuggear

## Logging Temporal Agregado

### Frontend (page.js)
```javascript
const payload = {
  album: {
    spotify_id: albumData.id,
    name: albumData.name,
    artist: albumData.artists[0]?.name,
    release_date: albumData.release_date,
    image_url: albumData.images[0]?.url,
    spotify_url: albumData.external_urls?.spotify
  },
  listenedAt: new Date(listenDate + 'T12:00:00.000Z').toISOString()
};

console.log('Enviando al historial:', JSON.stringify(payload, null, 2));
```

### Backend (route.js)
```javascript
// DEBUG: Log de datos recibidos
console.log('POST /api/listening-history - Datos recibidos:');
console.log('album:', JSON.stringify(album, null, 2));
console.log('listenedAt:', listenedAt);

// Validar datos del álbum
if (!album || !album.spotify_id || !album.name || !album.artist) {
  console.log('Validación fallida - album:', !!album, 'spotify_id:', !!album?.spotify_id, 'name:', !!album?.name, 'artist:', !!album?.artist);
  return Response.json(
    { success: false, message: 'Datos del álbum incompletos' },
    { status: 400 }
  );
}
```

## Estado de Fecha
- `listenDate`: Inicializado como `new Date().toISOString().split('T')[0]` (formato YYYY-MM-DD)
- `listenedAt`: Se convierte a `new Date(listenDate + 'T12:00:00.000Z').toISOString()`

## Posibles Causas del Error 400
1. Campo `album.artist` faltante o null
2. Campo `album.spotify_id` faltante o null
3. Campo `album.name` faltante o null
4. Formato de fecha inválido
5. Token de autenticación inválido

## Próximos Pasos
1. Probar funcionalidad y revisar logs de consola
2. Revisar logs de Vercel
3. Identificar cuál validación está fallando
4. Corregir el problema específico
5. Remover logging temporal
