"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  Music, 
  Play, 
  Clock, 
  Calendar,
  Search,
  Filter,
  Grid,
  List,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';

const FavoritesPage = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { success: showSuccess, error: showError } = useNotifications();

  // Estados
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, alphabetical, artist
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(0);

  // Cargar favoritos
  const loadFavorites = useCallback(async (loadMore = false) => {
    if (!isAuthenticated) return;

    try {
      setLoading(!loadMore);
      const currentPage = loadMore ? page : 0;
      const limit = 20;
      const offset = currentPage * limit;

      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/track-favorites?limit=${limit}&offset=${offset}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        if (loadMore) {
          setFavorites(prev => [...prev, ...data.favorites]);
        } else {
          setFavorites(data.favorites);
        }
        
        setTotalCount(data.count);
        setHasMore(data.hasMore);
        setPage(currentPage + 1);
      } else {
        setError('Error cargando favoritos');
      }
    } catch (error) {
      console.error('Error cargando favoritos:', error);
      setError('Error cargando favoritos');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, page]);

  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadFavorites();
  }, [isAuthenticated, router, loadFavorites]);

  // Remover de favoritos
  const removeFromFavorites = async (trackId) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/track-favorites', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ trackId })
      });

      if (response.ok) {
        setFavorites(prev => prev.filter(fav => fav.spotify_track_id !== trackId));
        setTotalCount(prev => prev - 1);
        showSuccess('Eliminado de favoritos');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al eliminar de favoritos');
      }
    } catch (error) {
      console.error('Error eliminando de favoritos:', error);
      showError('Error al eliminar de favoritos');
    }
  };

  // Formatear duración
  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Filtrar y ordenar favoritos
  const filteredAndSortedFavorites = favorites
    .filter(track => 
      track.track_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.artist_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      track.album_name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'alphabetical':
          return a.track_name.localeCompare(b.track_name);
        case 'artist':
          return a.artist_name.localeCompare(b.artist_name);
        default:
          return 0;
      }
    });

  if (loading && favorites.length === 0) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-theme-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-theme-secondary">Cargando tus favoritos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-primary overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Heart className="w-8 h-8 text-red-400" />
            <h1 className="text-3xl font-bold text-theme-primary">Mis Favoritos</h1>
          </div>
          <p className="text-theme-secondary">
            {totalCount} canciones favoritas
          </p>
        </div>

        {/* Controles */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Búsqueda */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-theme-muted" />
            <input
              type="text"
              placeholder="Buscar en tus favoritos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-theme-card border border-theme rounded-full focus:outline-none focus:ring-2 focus:ring-theme-accent focus:border-transparent text-theme-primary placeholder-theme-muted"
            />
          </div>

          {/* Filtros */}
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-theme-card border border-theme rounded-full focus:outline-none focus:ring-2 focus:ring-theme-accent text-theme-primary"
            >
              <option value="newest">Más recientes</option>
              <option value="oldest">Más antiguos</option>
              <option value="alphabetical">A-Z</option>
              <option value="artist">Por artista</option>
            </select>

            <button
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="p-3 bg-theme-card border border-theme rounded-full hover:bg-theme-card-hover transition-colors text-theme-primary"
            >
              {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Favoritos */}
        {filteredAndSortedFavorites.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="w-16 h-16 text-theme-muted mx-auto mb-4" />
            <h3 className="text-xl font-bold text-theme-primary mb-2">
              {searchQuery ? 'No se encontraron favoritos' : 'No tienes favoritos aún'}
            </h3>
            <p className="text-theme-secondary mb-6">
              {searchQuery 
                ? 'Intenta con otros términos de búsqueda'
                : 'Explora música y agrega canciones a tus favoritos'
              }
            </p>
            {!searchQuery && (
              <Link
                href="/"
                className="bg-theme-accent text-theme-button px-6 py-3 rounded-full hover:bg-theme-accent/90 transition-colors"
              >
                Explorar música
              </Link>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {filteredAndSortedFavorites.map((track) => (
                  <div key={track.id} className="group">
                    <div className="relative">
                      <Link href={`/track/${track.spotify_track_id}`}>
                        <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-red-400 to-teal-400 mb-3 group-hover:scale-105 transition-transform duration-200">
                          {track.image_url ? (
                            <Image
                              src={track.image_url}
                              alt={track.track_name}
                              width={200}
                              height={200}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Music className="w-12 h-12 text-white" />
                            </div>
                          )}
                        </div>
                      </Link>
                      
                      {/* Botón de eliminar */}
                      <button
                        onClick={() => removeFromFavorites(track.spotify_track_id)}
                        className="absolute top-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white hover:bg-black/70"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <Link href={`/track/${track.spotify_track_id}`}>
                      <h3 className="font-semibold text-theme-primary truncate mb-1 group-hover:text-theme-accent transition-colors">
                        {track.track_name}
                      </h3>
                    </Link>
                    
                    <Link href={`/artist/${track.spotify_track_id}`} className="text-sm text-theme-secondary hover:text-theme-accent transition-colors truncate block">
                      {track.artist_name}
                    </Link>
                    
                    <div className="text-xs text-theme-muted mt-1">
                      {formatDate(track.created_at)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredAndSortedFavorites.map((track) => (
                  <div key={track.id} className="flex items-center space-x-4 p-4 bg-theme-card rounded-xl hover:bg-theme-card-hover transition-colors border border-theme group">
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      {track.image_url ? (
                        <Image
                          src={track.image_url}
                          alt={track.track_name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-400 to-teal-400 flex items-center justify-center">
                          <Music className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <Link href={`/track/${track.spotify_track_id}`}>
                        <h3 className="font-medium text-theme-primary truncate group-hover:text-theme-accent transition-colors">
                          {track.track_name}
                        </h3>
                      </Link>
                      <p className="text-sm text-theme-secondary truncate">
                        {track.artist_name} • {track.album_name}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-theme-muted">
                      <span className="text-sm">
                        {formatDuration(track.duration_ms)}
                      </span>
                      <span className="text-sm">
                        {formatDate(track.created_at)}
                      </span>
                      <button
                        onClick={() => removeFromFavorites(track.spotify_track_id)}
                        className="p-2 rounded-full hover:bg-theme-primary/10 text-theme-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Cargar más */}
            {hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={() => loadFavorites(true)}
                  disabled={loading}
                  className="bg-theme-card text-theme-primary px-6 py-3 rounded-full hover:bg-theme-card-hover transition-colors border border-theme disabled:opacity-50"
                >
                  {loading ? 'Cargando...' : 'Cargar más'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
