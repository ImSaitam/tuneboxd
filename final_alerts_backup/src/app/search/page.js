'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Search, ArrowLeft, Music, User, Disc, Clock, Filter,
  ChevronLeft, ChevronRight, Loader2, Album, Headphones
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useRouter, useSearchParams } from 'next/navigation';

const GlobalSearchContent = () => {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [activeFilter, setActiveFilter] = useState('all');
  const [results, setResults] = useState({
    artists: [],
    albums: [],
    tracks: [],
    users: []
  });
  const [pagination, setPagination] = useState({
    artists: { page: 1, hasMore: true, total: 0 },
    albums: { page: 1, hasMore: true, total: 0 },
    tracks: { page: 1, hasMore: true, total: 0 },
    users: { page: 1, hasMore: true, total: 0 }
  });
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [hasSearched, setHasSearched] = useState(false); // Nueva bandera para saber si se ha buscado



  const filters = [
    { id: 'all', label: 'Todo', icon: Search },
    { id: 'artists', label: 'Artistas', icon: User },
    { id: 'albums', label: 'Álbumes', icon: Album },
    { id: 'tracks', label: 'Canciones', icon: Headphones },
    { id: 'users', label: 'Usuarios', icon: User }
  ];

  const searchSpotifyContent = useCallback(async (type, query, page = 1) => {
    try {
      const offset = (page - 1) * 25;
      const response = await fetch(
        `/api/spotify/search?q=${encodeURIComponent(query)}&type=${type}&limit=25&offset=${offset}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          return {
            items: data.data.items || [],
            total: data.data.total || 0,
            hasMore: (data.data.items?.length || 0) === 25
          };
        }
      }
    } catch (error) {
      console.error(`Error searching ${type}:`, error);
    }
    return { items: [], total: 0, hasMore: false };
  }, []);

  const searchUsers = useCallback(async (query, page = 1) => {
    try {
      const offset = (page - 1) * 25;
      const response = await fetch(
        `/api/users/search?q=${encodeURIComponent(query)}&limit=25&offset=${offset}`,
        {
          headers: isAuthenticated ? {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          } : {}
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        return {
          items: data.users || [],
          total: data.total || data.users?.length || 0,
          hasMore: data.users?.length === 25
        };
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
    return { items: [], total: 0, hasMore: false };
  }, [isAuthenticated]);

  const performSearch = useCallback(async (searchQuery, filter = 'all', page = 1, append = false) => {
    if (!searchQuery.trim()) {
      setResults({ artists: [], albums: [], tracks: [], users: [] });
      setTotalResults(0);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setHasSearched(true); // Marcar que se ha hecho una búsqueda;
    try {
      const searches = [];
      let searchTypes = [];
      
      if (filter === 'all') {
        searches.push(searchSpotifyContent('artist', searchQuery, page));
        searches.push(searchSpotifyContent('album', searchQuery, page));
        searches.push(searchSpotifyContent('track', searchQuery, page));
        searches.push(searchUsers(searchQuery, page));
        searchTypes = ['artists', 'albums', 'tracks', 'users'];
      } else if (filter === 'artists') {
        searches.push(searchSpotifyContent('artist', searchQuery, page));
        searchTypes = ['artists'];
      } else if (filter === 'albums') {
        searches.push(searchSpotifyContent('album', searchQuery, page));
        searchTypes = ['albums'];
      } else if (filter === 'tracks') {
        searches.push(searchSpotifyContent('track', searchQuery, page));
        searchTypes = ['tracks'];
      } else if (filter === 'users') {
        searches.push(searchUsers(searchQuery, page));
        searchTypes = ['users'];
      }

      const searchResults = await Promise.all(searches);
      
      let newResults = { artists: [], albums: [], tracks: [], users: [] };
      let total = 0;

      searchResults.forEach((result, index) => {
        if (result && result.items) {
          const type = searchTypes[index];
          newResults[type] = result.items;
          total += result.total || result.items.length;
        }
      });

      setResults(prev => {
        if (append) {
          return {
            artists: searchTypes.includes('artists') ? [...(prev.artists || []), ...newResults.artists] : prev.artists,
            albums: searchTypes.includes('albums') ? [...(prev.albums || []), ...newResults.albums] : prev.albums,
            tracks: searchTypes.includes('tracks') ? [...(prev.tracks || []), ...newResults.tracks] : prev.tracks,
            users: searchTypes.includes('users') ? [...(prev.users || []), ...newResults.users] : prev.users
          };
        } else {
          return newResults;
        }
      });

      setTotalResults(total);

      // Actualizar paginación
      searchTypes.forEach((type, index) => {
        const result = searchResults[index];
        setPagination(prev => ({
          ...prev,
          [type]: {
            page: page,
            hasMore: result?.hasMore || false,
            total: result?.total || 0
          }
        }));
      });

    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  }, [searchSpotifyContent, searchUsers]);

  // Solo inicializar el query desde la URL, pero NO ejecutar búsqueda automática
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery && urlQuery.trim()) {
      setQuery(urlQuery);
      // NO ejecutar performSearch automáticamente
    }
  }, [searchParams]); // Solo depender de searchParams

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      // Actualizar URL
      const url = new URL(window.location);
      url.searchParams.set('q', query);
      router.push(url.pathname + url.search);
      
      performSearch(query, activeFilter);
    }
  };

  const loadMore = (type) => {
    const nextPage = pagination[type].page + 1;
    performSearch(query, type, nextPage, true);
  };

  const renderArtistCard = (artist) => (
    <Link
      key={artist.id}
      href={`/artist/${artist.id}`}
      className="bg-theme-card rounded-xl p-4 border border-theme-border hover:bg-theme-card-hover transition-all duration-300 group"
    >
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600">
          {artist.images?.[0]?.url ? (
            <Image
              src={artist.images[0].url}
              alt={artist.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-8 h-8 text-theme-primary" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-theme-primary group-hover:text-theme-accent transition-colors">
            {artist.name}
          </h3>
          <p className="text-theme-secondary text-sm">
            Artista
          </p>
          {artist.genres?.length > 0 && (
            <p className="text-gray-500 text-xs mt-1">
              {artist.genres.slice(0, 2).join(', ')}
            </p>
          )}
        </div>
      </div>
    </Link>
  );

  const renderAlbumCard = (album) => (
    <Link
      key={album.id}
      href={`/album/${album.id}`}
      className="bg-theme-card rounded-xl p-4 border border-theme-border hover:bg-theme-card-hover transition-all duration-300 group"
    >
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-purple-500 to-pink-600">
          {album.images?.[0]?.url ? (
            <Image
              src={album.images[0].url}
              alt={album.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Album className="w-8 h-8 text-theme-primary" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-theme-primary group-hover:text-theme-accent transition-colors line-clamp-1">
            {album.name}
          </h3>
          <p className="text-theme-secondary text-sm">
            {album.artists?.[0]?.name}
          </p>
          <p className="text-theme-muted text-xs mt-1">
            {album.release_date ? new Date(album.release_date).getFullYear() : ''} • {album.total_tracks} canciones
          </p>
        </div>
      </div>
    </Link>
  );

  const renderTrackCard = (track) => (
    <Link
      key={track.id}
      href={`/track/${track.id}`}
      className="bg-theme-card rounded-xl p-4 border border-theme-border hover:bg-theme-card-hover transition-all duration-300 group block"
    >
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-green-500 to-blue-600">
          {track.album?.images?.[0]?.url ? (
            <Image
              src={track.album.images[0].url}
              alt={track.name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Headphones className="w-8 h-8 text-theme-primary" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-theme-primary group-hover:text-theme-accent transition-colors line-clamp-1">
            {track.name}
          </h3>
          <p className="text-theme-secondary text-sm">
            {track.artists?.[0]?.name}
          </p>
          <p className="text-theme-muted text-xs mt-1">
            {track.album?.name} • {Math.floor(track.duration_ms / 60000)}:{((track.duration_ms % 60000) / 1000).toFixed(0).padStart(2, '0')}
          </p>
        </div>
      </div>
    </Link>
  );

  const renderUserCard = (user) => (
    <Link
      key={user.id}
      href={`/profile/${user.username}`}
      className="bg-theme-card rounded-xl p-4 border border-theme-border hover:bg-theme-card-hover transition-all duration-300 group"
    >
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-yellow-500 to-orange-600">
          {user.profile_picture ? (
            <Image
              src={user.profile_picture}
              alt={`Foto de perfil de ${user.username}`}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <User className="w-8 h-8 text-theme-primary" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-theme-primary group-hover:text-theme-accent transition-colors">
            {user.username}
          </h3>
          <p className="text-theme-secondary text-sm">
            {user.total_reviews} reseñas • {user.followers_count} seguidores
          </p>
          {user.bio && (
            <p className="text-theme-muted text-xs mt-1 line-clamp-1">
              {user.bio}
            </p>
          )}
        </div>
      </div>
    </Link>
  );

  const getFilteredResults = () => {
    if (activeFilter === 'all') {
      return [
        ...results.artists.slice(0, 5).map(item => ({ ...item, type: 'artist' })),
        ...results.albums.slice(0, 5).map(item => ({ ...item, type: 'album' })),
        ...results.tracks.slice(0, 5).map(item => ({ ...item, type: 'track' })),
        ...results.users.slice(0, 5).map(item => ({ ...item, type: 'user' }))
      ];
    }
    return results[activeFilter] || [];
  };

  return (
    <div className="min-h-screen bg-theme-primary overflow-x-hidden">
      {/* Header */}
      <div className="bg-theme-card-hover border-b border-theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center space-x-2 text-theme-primary hover:text-theme-accent transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver al inicio</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-theme-secondary w-5 h-5" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar artistas, álbumes, canciones o usuarios..."
                className="w-full pl-12 pr-4 py-4 bg-theme-card border border-theme-border rounded-2xl text-theme-primary placeholder-theme-secondary focus:outline-none focus:ring-2 focus:ring-theme-accent focus:border-transparent"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-theme-accent text-theme-button px-6 py-2 rounded-xl transition-colors hover:opacity-90"
              >
                Buscar
              </button>
            </div>
          </div>
        </form>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {filters.map((filter) => {
            const Icon = filter.icon;
            return (
              <button
                key={filter.id}
                onClick={() => {
                  setActiveFilter(filter.id);
                  // Limpiar resultados para que el usuario sepa que debe buscar nuevamente
                  if (filter.id !== activeFilter) {
                    setResults({ artists: [], albums: [], tracks: [], users: [] });
                    setTotalResults(0);
                    setHasSearched(false); // Reset de la bandera de búsqueda
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                  activeFilter === filter.id
                    ? 'bg-theme-accent text-theme-button shadow-lg'
                    : 'bg-theme-card text-theme-secondary hover:bg-theme-card-hover hover:text-theme-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                {filter.label}
                {activeFilter === filter.id && results[filter.id]?.length > 0 && (
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                    {results[filter.id].length}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Results */}
        {loading && !results.artists.length && !results.albums.length && !results.tracks.length && !results.users.length ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-theme-accent animate-spin" />
              <p className="text-theme-primary text-lg">Buscando...</p>
            </div>
          </div>
        ) : hasSearched && query && totalResults === 0 && !loading ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-theme-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-theme-primary mb-2">
              No se encontraron resultados
            </h3>
            <p className="text-theme-secondary">
              Intenta con otros términos de búsqueda
            </p>
          </div>
        ) : getFilteredResults().length > 0 ? (
          <div className="space-y-8">
            {activeFilter === 'all' ? (
              // Vista de todos los resultados
              <>
                {results.artists.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Artistas ({results.artists.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {results.artists.slice(0, 4).map(renderArtistCard)}
                    </div>
                    {results.artists.length > 4 && (
                      <button
                        onClick={() => setActiveFilter('artists')}
                        className="text-theme-accent hover:text-theme-accent/80 text-sm font-medium"
                      >
                        Ver todos los artistas →
                      </button>
                    )}
                  </div>
                )}

                {results.albums.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary mb-4 flex items-center gap-2">
                      <Album className="w-5 h-5" />
                      Álbumes ({results.albums.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {results.albums.slice(0, 4).map(renderAlbumCard)}
                    </div>
                    {results.albums.length > 4 && (
                      <button
                        onClick={() => setActiveFilter('albums')}
                        className="text-theme-accent hover:text-theme-accent/80 text-sm font-medium"
                      >
                        Ver todos los álbumes →
                      </button>
                    )}
                  </div>
                )}

                {results.tracks.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary mb-4 flex items-center gap-2">
                      <Headphones className="w-5 h-5" />
                      Canciones ({results.tracks.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {results.tracks.slice(0, 4).map(renderTrackCard)}
                    </div>
                    {results.tracks.length > 4 && (
                      <button
                        onClick={() => setActiveFilter('tracks')}
                        className="text-theme-accent hover:text-theme-accent/80 text-sm font-medium"
                      >
                        Ver todas las canciones →
                      </button>
                    )}
                  </div>
                )}

                {results.users.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-theme-primary mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Usuarios ({results.users.length})
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      {results.users.slice(0, 4).map(renderUserCard)}
                    </div>
                    {results.users.length > 4 && (
                      <button
                        onClick={() => setActiveFilter('users')}
                        className="text-theme-accent hover:text-theme-accent/80 text-sm font-medium"
                      >
                        Ver todos los usuarios →
                      </button>
                    )}
                  </div>
                )}
              </>
            ) : (
              // Vista filtrada
              <div>
                <h2 className="text-xl font-bold text-theme-primary mb-6">
                  {filters.find(f => f.id === activeFilter)?.label} ({getFilteredResults().length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {activeFilter === 'artists' && results.artists.map(renderArtistCard)}
                  {activeFilter === 'albums' && results.albums.map(renderAlbumCard)}
                  {activeFilter === 'tracks' && results.tracks.map(renderTrackCard)}
                  {activeFilter === 'users' && results.users.map(renderUserCard)}
                </div>

                {/* Load More Button */}
                {pagination[activeFilter]?.hasMore && (
                  <div className="text-center mt-8">
                    <button
                      onClick={() => loadMore(activeFilter)}
                      disabled={loading}
                      className="bg-theme-accent hover:bg-theme-accent/90 text-theme-button px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Cargando...
                        </>
                      ) : (
                        'Cargar más resultados'
                      )}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ) : !query ? (
          <div className="text-center py-16">
            <Search className="w-16 h-16 text-theme-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-theme-primary mb-2">
              Búsqueda
            </h3>
            <p className="text-theme-secondary">
              Busca artistas, álbumes, canciones y usuarios en toda la plataforma
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

const GlobalSearchPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Cargando búsqueda...</div>
      </div>
    }>
      <GlobalSearchContent />
    </Suspense>
  );
};

export default GlobalSearchPage;
