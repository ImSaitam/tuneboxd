import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

/**
 * Hook personalizado para hacer fetch con cache básico en memoria
 */
export function useCachedFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Cache en memoria simple
  const cacheRef = useRef(new Map());
  const lastFetchRef = useRef(new Map());
  
  const {
    cacheDuration = 5 * 60 * 1000, // 5 minutos por defecto
    dependencies = [],
    skipCache = false
  } = options;

  // Memoizar dependencias
  const dependenciesStr = useMemo(() => JSON.stringify(dependencies), [dependencies]);

  const fetchData = useCallback(async (forceRefresh = false) => {
    if (!url) return;

    const cacheKey = url + dependenciesStr;
    const now = Date.now();
    const lastFetch = lastFetchRef.current.get(cacheKey);
    
    // Verificar cache si no es un refresh forzado
    if (!forceRefresh && !skipCache && lastFetch && (now - lastFetch < cacheDuration)) {
      const cachedData = cacheRef.current.get(cacheKey);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        setError(null);
        return cachedData;
      }
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      // Guardar en cache
      cacheRef.current.set(cacheKey, result);
      lastFetchRef.current.set(cacheKey, now);
      
      setData(result);
      setLoading(false);
      return result;

    } catch (err) {
      setError(err.message);
      setLoading(false);
      
      // En caso de error, usar datos del cache si están disponibles
      const cachedData = cacheRef.current.get(cacheKey);
      if (cachedData) {
        setData(cachedData);
      }
      
      throw err;
    }
  }, [url, cacheDuration, skipCache, dependenciesStr]);

  // Función para refrescar datos
  const refresh = useCallback(() => fetchData(true), [fetchData]);

  // Función para limpiar cache
  const clearCache = useCallback(() => {
    const cacheKey = url + dependenciesStr;
    cacheRef.current.delete(cacheKey);
    lastFetchRef.current.delete(cacheKey);
  }, [url, dependenciesStr]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
    clearCache,
    refetch: fetchData
  };
}

/**
 * Hook especializado para datos del foro
 */
export function useForumData(category = '', options = {}) {
  const url = category 
    ? `/api/forum/threads?category=${category}&limit=20`
    : '/api/forum/threads?limit=20';
    
  return useCachedFetch(url, {
    cacheDuration: 2 * 60 * 1000, // 2 minutos para foro (más dinámico)
    dependencies: [category],
    ...options
  });
}

/**
 * Hook para listas con cache más largo
 */
export function useListsData(options = {}) {
  return useCachedFetch('/api/lists', {
    cacheDuration: 10 * 60 * 1000, // 10 minutos para listas
    ...options
  });
}

/**
 * Hook para datos de perfil
 */
export function useProfileData(username, options = {}) {
  const url = username ? `/api/profile/${username}` : null;
  
  return useCachedFetch(url, {
    cacheDuration: 5 * 60 * 1000, // 5 minutos para perfiles
    dependencies: [username],
    ...options
  });
}

/**
 * Hook para reviews con cache
 */
export function useReviewsData(options = {}) {
  return useCachedFetch('/api/reviews', {
    cacheDuration: 3 * 60 * 1000, // 3 minutos para reviews
    ...options
  });
}

/**
 * Hook para datos de artista con cache
 */
export function useArtistData(artistId, options = {}) {
  const url = artistId ? `/api/artists/${artistId}` : null;
  
  return useCachedFetch(url, {
    cacheDuration: 15 * 60 * 1000, // 15 minutos para datos de artista (cambian poco)
    dependencies: [artistId],
    ...options
  });
}

/**
 * Hook para buscar artistas con cache
 */
export function useArtistSearch(query, options = {}) {
  const url = query ? `/api/artists/search?q=${encodeURIComponent(query)}` : null;
  
  return useCachedFetch(url, {
    cacheDuration: 5 * 60 * 1000, // 5 minutos para búsquedas
    dependencies: [query],
    ...options
  });
}

/**
 * Hook para obtener thread específico con cache
 */
export function useThreadData(threadId, options = {}) {
  const url = threadId ? `/api/forum/threads/${threadId}` : null;
  
  return useCachedFetch(url, {
    cacheDuration: 2 * 60 * 1000, // 2 minutos para threads específicos
    dependencies: [threadId],
    ...options
  });
}

/**
 * Hook para categorías del foro con cache
 */
export function useForumCategories(options = {}) {
  return useCachedFetch('/api/forum/categories', {
    cacheDuration: 15 * 60 * 1000, // 15 minutos para categorías (cambian muy poco)
    ...options
  });
}

/**
 * Hook para lenguajes del foro con cache
 */
export function useForumLanguages(options = {}) {
  return useCachedFetch('/api/forum/languages', {
    cacheDuration: 15 * 60 * 1000, // 15 minutos para lenguajes (cambian muy poco)
    ...options
  });
}
