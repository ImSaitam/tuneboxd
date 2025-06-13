'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, User, Music, TrendingUp, ArrowLeft, ExternalLink } from 'lucide-react';
import { useSpotify } from '../../hooks/useSpotify';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import Link from 'next/link';

export default function ArtistsExplorePage() {
  const { isAuthenticated } = useAuth();
  const { success, error } = useNotifications();
  const { searchMusic, loading: spotifyLoading } = useSpotify();
  const searchParams = useSearchParams();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [searchResults, setSearchResults] = useState([]);
  const [featuredArtists, setFeaturedArtists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [followingStates, setFollowingStates] = useState({});

  // Artistas destacados para mostrar cuando no hay búsqueda
  const featuredArtistNames = [
    'Taylor Swift', 'The Beatles', 'Radiohead', 'Kanye West',
    'Beyoncé', 'Pink Floyd', 'Kendrick Lamar', 'Adele',
    'Bob Dylan', 'Led Zeppelin', 'Daft Punk', 'Arctic Monkeys'
  ];

  useEffect(() => {
    // Cargar artistas destacados al inicializar
    loadFeaturedArtists();
  }, []);

  useEffect(() => {
    // Buscar automáticamente si hay query en URL
    const query = searchParams.get('q');
    if (query) {
      setSearchQuery(query);
      performSearch(query);
    }
  }, [searchParams]);

  const loadFeaturedArtists = async () => {
    try {
      setLoading(true);
      const promises = featuredArtistNames.slice(0, 8).map(async (name) => {
        try {
          const results = await searchMusic(name, 'artist', 1);
          return results.items?.[0] || null;
        } catch (error) {
          console.error(`Error buscando ${name}:`, error);
          return null;
        }
      });

      const artists = await Promise.all(promises);
      setFeaturedArtists(artists.filter(Boolean));
    } catch (error) {
      console.error('Error cargando artistas destacados:', error);
    } finally {
      setLoading(false);
    }
  };

  const performSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const results = await searchMusic(query, 'artist', 20);
      setSearchResults(results.items || []);
    } catch (error) {
      console.error('Error en búsqueda:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Actualizar URL sin recargar página
      const url = new URL(window.location);
      url.searchParams.set('q', searchQuery);
      window.history.pushState({}, '', url);
      
      performSearch(searchQuery);
    }
  };

  const checkFollowingStatus = async (artistId) => {
    if (!isAuthenticated) return false;
    
    try {
      const response = await fetch(`/api/artists/follow?artist_id=${artistId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      const data = await response.json();
      return data.isFollowing || false;
    } catch (error) {
      return false;
    }
  };

  const toggleFollow = async (artist) => {
    if (!isAuthenticated) {
      error('Debes iniciar sesión para seguir artistas');
      return;
    }

    const isCurrentlyFollowing = followingStates[artist.id];
    
    try {
      if (isCurrentlyFollowing) {
        // Dejar de seguir
        const response = await fetch(`/api/artists/follow?artist_id=${artist.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        const data = await response.json();
        if (data.success) {
          setFollowingStates(prev => ({ ...prev, [artist.id]: false }));
          success(`Dejaste de seguir a ${artist.name}`);
        } else {
          error(data.message || 'Error al dejar de seguir');
        }
      } else {
        // Seguir
        const response = await fetch('/api/artists/follow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            artist_id: artist.id,
            artist_name: artist.name,
            artist_image: artist.images?.[0]?.url || null
          })
        });
        
        const data = await response.json();
        if (data.success) {
          setFollowingStates(prev => ({ ...prev, [artist.id]: true }));
          success(`Ahora sigues a ${artist.name}`);
        } else {
          error(data.message || 'Error al seguir artista');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      error('Error de conexión');
    }
  };

  const ArtistCard = ({ artist, showFollowButton = true }) => {
    const isFollowing = followingStates[artist.id];
    
    useEffect(() => {
      if (isAuthenticated && showFollowButton) {
        checkFollowingStatus(artist.id).then(status => {
          setFollowingStates(prev => ({ ...prev, [artist.id]: status }));
        });
      }
    }, [artist.id, isAuthenticated]);

    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-white/15 transition-all duration-300 group">
        {/* Artist Image */}
        <div className="relative mb-4">
          <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-red-400 to-teal-400">
            {artist.images?.[0]?.url ? (
              <img
                src={artist.images[0].url}
                alt={artist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <User className="w-12 h-12" />
              </div>
            )}
          </div>
        </div>

        {/* Artist Info */}
        <div className="text-center">
          <h3 className="font-bold text-white text-lg mb-2 group-hover:text-teal-300 transition-colors">
            {artist.name}
          </h3>
          
          <div className="flex items-center justify-center gap-4 text-gray-400 text-sm mb-4">
            {artist.followers?.total && (
              <span>{(artist.followers.total / 1000000).toFixed(1)}M seguidores</span>
            )}
            {artist.popularity && (
              <span>Popularidad: {artist.popularity}/100</span>
            )}
          </div>

          {/* Genres */}
          {artist.genres && artist.genres.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1 mb-4">
              {artist.genres.slice(0, 3).map((genre, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-white/20 rounded-full text-xs text-white"
                >
                  {genre}
                </span>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-center">
            <Link
              href={`/artist/${artist.id}`}
              className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              <Music className="w-4 h-4" />
              Ver Perfil
            </Link>
            
            {showFollowButton && isAuthenticated && (
              <button
                onClick={() => toggleFollow(artist)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                  isFollowing
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-white/20 hover:bg-white/30 text-white'
                }`}
              >
                {isFollowing ? 'Dejar de seguir' : 'Seguir'}
              </button>
            )}
          </div>

          {/* Spotify Link */}
          {artist.external_urls?.spotify && (
            <a
              href={artist.external_urls.spotify}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors text-sm mt-2"
            >
              <ExternalLink className="w-3 h-3" />
              Spotify
            </a>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Explorar Artistas</h1>
            <p className="text-gray-300 mt-1">Descubre y sigue a tus artistas favoritos</p>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar artistas..."
              className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/70 backdrop-blur-md focus:outline-none focus:bg-white/20 focus:border-teal-400 focus:shadow-lg focus:shadow-teal-400/30 transition-all duration-300"
            />
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 animate-pulse">
                <div className="w-32 h-32 bg-gray-600 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded mb-4"></div>
                <div className="h-8 bg-gray-600 rounded"></div>
              </div>
            ))}
          </div>
        ) : searchResults.length > 0 ? (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">
              Resultados para "{searchQuery}" ({searchResults.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {searchResults.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </div>
        ) : searchQuery ? (
          <div className="text-center py-12">
            <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No se encontraron artistas</h3>
            <p className="text-gray-300">Intenta con otro término de búsqueda</p>
          </div>
        ) : featuredArtists.length > 0 ? (
          <div>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-teal-400" />
              <h2 className="text-2xl font-bold text-white">Artistas Destacados</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Explora artistas</h3>
            <p className="text-gray-300">Usa la barra de búsqueda para encontrar tus artistas favoritos</p>
          </div>
        )}
      </div>
    </div>
  );
}
