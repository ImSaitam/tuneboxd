// Sistema de tracking de vistas con debouncing
const viewCache = new Map();
const COOLDOWN_TIME = 60000; // 1 minuto entre vistas del mismo usuario/IP
const CLEANUP_INTERVAL = 3600000; // Limpiar cache cada hora

// Limpiar cache automáticamente
setInterval(() => {
  const now = Date.now();
  const cutoff = now - COOLDOWN_TIME * 2; // Mantener entradas por 2 minutos
  
  for (const [key, timestamp] of viewCache.entries()) {
    if (timestamp < cutoff) {
      viewCache.delete(key);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * Determina si se debe contar una vista
 * @param {string|number} userId - ID del usuario (null si no autenticado)
 * @param {string|number} threadId - ID del hilo
 * @param {string} ipAddress - Dirección IP del usuario
 * @returns {boolean} - true si se debe contar la vista
 */
export function shouldTrackView(userId, threadId, ipAddress) {
  // Crear clave única basada en usuario o IP
  const key = userId 
    ? `user-${userId}-${threadId}` 
    : `ip-${ipAddress.replace(/[.:]/g, '-')}-${threadId}`;
  
  const lastView = viewCache.get(key);
  const now = Date.now();
  
  // Si no hay vista previa o ha pasado el tiempo de cooldown
  if (!lastView || now - lastView > COOLDOWN_TIME) {
    viewCache.set(key, now);
    return true;
  }
  
  return false;
}

/**
 * Obtiene estadísticas del cache de vistas
 */
export function getViewCacheStats() {
  return {
    activeEntries: viewCache.size,
    oldestEntry: Math.min(...viewCache.values()),
    newestEntry: Math.max(...viewCache.values())
  };
}

/**
 * Limpia manualmente el cache (para testing)
 */
export function clearViewCache() {
  viewCache.clear();
}
