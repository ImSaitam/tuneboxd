// API para obtener estadísticas de rendimiento del sistema
import { NextResponse } from 'next/server';
import { forumCache } from '../../../../lib/cache.js';
import { forumService } from '../../../../lib/database-adapter.js';

// Estadísticas globales del sistema
let globalStats = {
  cacheHits: 0,
  cacheMisses: 0,
  totalRequests: 0,
  responseTimes: [],
  startTime: Date.now()
};

export async function GET(request) {
  try {
    // Obtener estadísticas de cache
    const cacheStats = forumCache.cache.size;
    
    // Obtener estadísticas del pool de conexiones
    const poolStats = dbPool.getStats();
    
    // Obtener conteo de hilos
    const threadsCount = await dbPool.executeGet(
      'SELECT COUNT(*) as count FROM forum_threads'
    );
    
    // Obtener usuarios activos (últimos 15 minutos)
    const usersOnline = await dbPool.executeGet(
      `SELECT COUNT(DISTINCT user_id) as count 
       FROM (
         SELECT user_id FROM forum_threads WHERE created_at > datetime('now', '-15 minutes')
         UNION
         SELECT user_id FROM reviews WHERE created_at > datetime('now', '-15 minutes')
       )`
    );
    
    // Calcular tiempo promedio de respuesta
    const avgResponseTime = globalStats.responseTimes.length > 0
      ? Math.round(globalStats.responseTimes.reduce((a, b) => a + b, 0) / globalStats.responseTimes.length)
      : 0;
    
    // Calcular uptime
    const uptime = Math.floor((Date.now() - globalStats.startTime) / 1000);
    
    const stats = {
      // Cache
      cacheHits: globalStats.cacheHits,
      cacheMisses: globalStats.cacheMisses,
      cacheSize: cacheStats,
      
      // Performance
      avgResponseTime,
      totalRequests: globalStats.totalRequests,
      uptime,
      
      // Database
      activeConnections: poolStats.activeConnections,
      poolSize: poolStats.poolSize,
      waitingQueue: poolStats.waitingQueue,
      
      // Content
      threadsCount: threadsCount?.count || 0,
      usersOnline: usersOnline?.count || 0,
      
      // System info
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// Función helper para tracking de estadísticas (se puede llamar desde otros endpoints)
export function trackRequest(responseTime) {
  globalStats.totalRequests++;
  globalStats.responseTimes.push(responseTime);
  
  // Mantener solo las últimas 100 mediciones
  if (globalStats.responseTimes.length > 100) {
    globalStats.responseTimes = globalStats.responseTimes.slice(-100);
  }
}

export function trackCacheHit() {
  globalStats.cacheHits++;
}

export function trackCacheMiss() {
  globalStats.cacheMisses++;
}
