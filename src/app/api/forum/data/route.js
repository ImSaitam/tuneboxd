// /src/app/api/forum/data/route.js - API unificada optimizada con tracking
import { NextResponse } from 'next/server';
import { forumService } from '../../../../lib/database.js';
import { forumCache } from '../../../../lib/cache.js';
import { trackRequest, trackCacheHit, trackCacheMiss } from '../stats/route.js';

export async function GET(request) {
  const startTime = Date.now();
  
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const language = searchParams.get('language');
    const limit = parseInt(searchParams.get('limit')) || 20;
    const offset = parseInt(searchParams.get('offset')) || 0;

    // Crear clave de cache basada en parámetros
    const cacheKey = `forum-data:${category || 'all'}:${language || 'all'}:${limit}:${offset}`;
    
    // Intentar obtener de cache
    const cached = forumCache.get(cacheKey);
    if (cached) {
      trackCacheHit();
      const responseTime = Date.now() - startTime;
      trackRequest(responseTime);
      
      return NextResponse.json({
        ...cached,
        fromCache: true,
        responseTime
      });
    }

    // Si no está en cache, marcar como cache miss
    trackCacheMiss();

    // Obtener datos de DB usando la versión optimizada
    const [threads, categories, languages] = await Promise.all([
      forumService.getThreadsOptimized ? 
        forumService.getThreadsOptimized(limit, offset, category, language) :
        forumService.getThreads(limit, offset, category, language),
      forumService.getCategories(),
      forumService.getLanguages()
    ]);

    const result = {
      success: true,
      threads: threads || [],
      categories: categories || [],
      languages: languages || [],
      pagination: {
        limit,
        offset,
        hasMore: threads && threads.length === limit
      }
    };

    // Guardar en cache por 5 minutos
    forumCache.set(cacheKey, result, 300000);

    const responseTime = Date.now() - startTime;
    trackRequest(responseTime);

    return NextResponse.json({
      ...result,
      fromCache: false,
      responseTime
    });
  } catch (error) {
    console.error('Error obteniendo datos del foro:', error);
    const responseTime = Date.now() - startTime;
    trackRequest(responseTime);
    
    return NextResponse.json(
      { success: false, message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
