import { useState, useCallback } from 'react';

export const useSpotify = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Función para obtener el access token
  const getAccessToken = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/spotify/token');
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para buscar música
  const searchMusic = useCallback(async (query, type = 'album', limit = 20) => {
    if (!query.trim()) {
      return { items: [] };
    }

    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        q: query,
        type,
        limit: limit.toString()
      });
      
      const response = await fetch(`/api/spotify/search?${params}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      return data.data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener un track por ID
  const getTrackById = useCallback(async (trackId) => {
    if (!trackId) {
      throw new Error('Track ID es requerido');
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/spotify/track/${trackId}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      return data.track;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para obtener top tracks de un artista
  const getArtistTopTracks = useCallback(async (artistId, market = 'US') => {
    if (!artistId) {
      throw new Error('Artist ID es requerido');
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/spotify/artist/${artistId}/top-tracks?market=${market}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error);
      }
      
      return data.tracks;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getAccessToken,
    searchMusic,
    getTrackById,
    getArtistTopTracks
  };
};
