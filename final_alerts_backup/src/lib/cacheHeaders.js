/**
 * Utilidad para manejar headers de cache HTTP
 */

/**
 * Genera un ETag basado en el contenido
 */
export function generateETag(content) {
  const crypto = require('crypto');
  return crypto.createHash('md5').update(JSON.stringify(content)).digest('hex');
}

/**
 * Añade headers de cache a una respuesta
 */
export function addCacheHeaders(response, data, maxAge = 300) { // 5 minutos por defecto
  const etag = generateETag(data);
  const lastModified = new Date().toUTCString();
  
  response.headers.set('ETag', `"${etag}"`);
  response.headers.set('Last-Modified', lastModified);
  response.headers.set('Cache-Control', `public, max-age=${maxAge}, must-revalidate`);
  
  return { etag, lastModified };
}

/**
 * Verifica si el contenido ha cambiado basado en headers del request
 */
export function hasContentChanged(request, currentData) {
  const ifNoneMatch = request.headers.get('If-None-Match');
  const currentETag = generateETag(currentData);
  
  // Si el ETag coincide, el contenido no ha cambiado
  if (ifNoneMatch && ifNoneMatch.includes(currentETag)) {
    return false;
  }
  
  return true;
}

/**
 * Respuesta 304 Not Modified
 */
export function notModifiedResponse() {
  return new Response(null, { 
    status: 304,
    headers: {
      'Cache-Control': 'public, max-age=300, must-revalidate'
    }
  });
}
