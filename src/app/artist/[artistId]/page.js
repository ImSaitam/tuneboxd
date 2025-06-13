
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, User, ExternalLink, Heart, HeartOff, Music, Tag } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useNotifications } from '../../../hooks/useNotifications';
import Link from 'next/link';

export default function ArtistPage() {
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const { success, error: showError } = useNotifications();
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [topTracks, setTopTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);

  // Obtener el ID del artista de los parámetros de URL
  const artistId = params.artistId;

  // Tags predefinidos para géneros musicales
  const availableTags = [
    'Rock', 'Pop', 'Hip Hop', 'Jazz', 'Blues', 'Electronic', 'Classical',
    'Country', 'R&B', 'Reggae', 'Folk', 'Punk', 'Metal', 'Indie',
    'Alternative', 'Funk', 'Soul', 'Disco', 'House', 'Techno'
  ];

  useEffect(() => {
    let mounted = true;
    
    const initializeArtist = async () => {
      if (!artistId) return;
      
      try {
        // Obtener datos del artista desde Spotify
        const response = await fetch(`/api/spotify/artist/${artistId}`);
        
        if (!response.ok) {
          console.error('Error obteniendo artista de Spotify');
          if (mounted) {
            setError('No se pudo obtener el artista de Spotify');
            setLoading(false);
          }
          return;
        }
        
        const data = await response.json();
        
        if (!data.success) {
          console.error('Error en respuesta de Spotify:', data);
          if (mounted) {
            setError('Error al obtener datos del artista');
            setLoading(false);
          }
          return;
        }
        
        if (!mounted) return;
        
        setArtist(data.artist);
        setAlbums(data.albums || []);
        setTopTracks(data.topTracks || []);
        
        // Verificar si el usuario sigue al artista y obtener tags
        if (isAuthenticated) {
          try {
            // Verificar seguimiento
            const followResponse = await fetch(`/api/artists/follow?artist_id=${artistId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
              }
            });
            const followData = await followResponse.json();
            if (followData.success) {
              setIsFollowing(followData.isFollowing);
            }

            // Obtener tags del usuario
            const tagsResponse = await fetch(`/api/artists/tags?artist_id=${artistId}`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
              }
            });
            const tagsData = await tagsResponse.json();
            if (tagsData.success && tagsData.tags.length > 0) {
              setSelectedTags(tagsData.tags);
            } else {
              // Si no hay tags guardadas, usar géneros de Spotify
              const artistTags = data.artist.genres?.slice(0, 3).map(genre => 
                genre.charAt(0).toUpperCase() + genre.slice(1)
              ) || [];
              setSelectedTags(artistTags);
            }
          } catch (error) {
            console.error('Error cargando datos del usuario:', error);
            // Tags por defecto basadas en géneros de Spotify
            const artistTags = data.artist.genres?.slice(0, 3).map(genre => 
              genre.charAt(0).toUpperCase() + genre.slice(1)
            ) || [];
            setSelectedTags(artistTags);
          }
        } else {
          // Tags basadas en géneros de Spotify para usuarios no autenticados
          const artistTags = data.artist.genres?.slice(0, 3).map(genre => 
            genre.charAt(0).toUpperCase() + genre.slice(1)
          ) || [];
          setSelectedTags(artistTags);
        }
        
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error inicializando artista:', error);
        if (mounted) {
          setError('Error al cargar el artista');
          setLoading(false);
        }
      }
    };

    initializeArtist();
    
    return () => {
      mounted = false;
    };
  }, [artistId, isAuthenticated]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) {
      showError('Debes iniciar sesión para seguir artistas');
      return;
    }

    setFollowLoading(true);
    
    try {
      if (isFollowing) {
        // Dejar de seguir
        const response = await fetch(`/api/artists/follow?artist_id=${artistId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        const data = await response.json();
        if (data.success) {
          setIsFollowing(false);
          success(`Dejaste de seguir a ${artist?.name || 'este artista'}`);
        } else {
          showError(data.message || 'Error al dejar de seguir el artista');
        }
      } else {
        // Seguir artista
        const response = await fetch('/api/artists/follow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            artist_id: artistId,
            artist_name: artist?.name || 'Artista desconocido',
            artist_image: artist?.images?.[0]?.url || null
          })
        });
        
        const data = await response.json();
        if (data.success) {
          setIsFollowing(true);
          success(`Ahora sigues a ${artist?.name || 'este artista'}`);
        } else {
          showError(data.message || 'Error al seguir el artista');
        }
      }
    } catch (error) {
      console.error('Error al actualizar seguimiento:', error);
      showError('Error de conexión. Inténtalo nuevamente');
    } finally {
      setFollowLoading(false);
    }
  };

  const handleTagToggle = async (tag) => {
    if (!isAuthenticated) {
      showError('Debes iniciar sesión para personalizar tags');
      return;
    }

    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);

    // Guardar tags en la base de datos
    try {
      const response = await fetch('/api/artists/tags', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          artist_id: artistId,
          tags: newTags
        })
      });

      const data = await response.json();
      if (!data.success) {
        console.error('Error guardando tags:', data.message);
        showError('Error al guardar las tags');
        // Revertir cambios si falló
        setSelectedTags(selectedTags);
      } else {
        success('Tags actualizadas correctamente');
      }
    } catch (error) {
      console.error('Error guardando tags:', error);
      showError('Error de conexión al guardar las tags');
      // Revertir cambios si falló
      setSelectedTags(selectedTags);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="grid md:grid-cols-4 gap-8">
              <div className="h-80 bg-gray-700 rounded-lg"></div>
              <div className="md:col-span-3">
                <div className="h-10 bg-gray-700 rounded w-3/4 mb-4"></div>
                <div className="h-6 bg-gray-700 rounded w-1/2 mb-6"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">
            {error || 'Artista no encontrado'}
          </h1>
          <p className="text-gray-300 mb-4">
            {error ? 'Hubo un error al cargar el artista.' : 'No se pudo encontrar el artista solicitado.'}
          </p>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-white hover:text-gray-300 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-2xl font-bold text-white">Detalles del Artista</h1>
        </div>

        {/* Artist Info */}
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Artist Image */}
          <div className="flex justify-center">
            <div className="relative group">
              {artist.images && artist.images.length > 0 ? (
                <img
                  src={artist.images[0]?.url}
                  alt={artist.name}
                  className="w-80 h-80 object-cover rounded-full shadow-2xl group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-80 h-80 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full shadow-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <User size={120} className="text-white/70" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>

          {/* Artist Details */}
          <div className="md:col-span-3 text-white">
            <h2 className="text-4xl font-bold mb-4">{artist.name}</h2>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <User size={20} className="text-gray-400" />
                <span className="text-gray-300">
                  {artist.followers?.total?.toLocaleString()} seguidores
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Music size={20} className="text-gray-400" />
                <span className="text-gray-300">Popularidad: {artist.popularity}/100</span>
              </div>
              <a
                href={artist.external_urls?.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
              >
                <ExternalLink size={20} />
                <span>Abrir en Spotify</span>
              </a>
            </div>

            {/* Follow Button */}
            <div className="mb-6">
              {isAuthenticated ? (
                <button
                  onClick={handleFollowToggle}
                  disabled={followLoading}
                  className={`flex items-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                    isFollowing
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white'
                  } disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed`}
                >
                  {followLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : isFollowing ? (
                    <HeartOff size={20} />
                  ) : (
                    <Heart size={20} />
                  )}
                  {followLoading 
                    ? 'Actualizando...' 
                    : isFollowing 
                      ? 'Dejar de seguir' 
                      : 'Seguir artista'
                  }
                </button>
              ) : (
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-300 text-center">
                    <Link href="/login" className="underline hover:text-blue-200">
                      Inicia sesión
                    </Link> para seguir artistas
                  </p>
                </div>
              )}
            </div>

            {/* Genres/Tags */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Tag size={20} />
                Géneros y Tags
              </h3>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagToggle(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
                {selectedTags.length > 0 && (
                  <div className="text-sm text-gray-400">
                    Tags seleccionados: {selectedTags.join(', ')}
                  </div>
                )}
              </div>
            </div>

            {/* Official Genres from Spotify */}
            {artist.genres && artist.genres.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-2">Géneros oficiales</h4>
                <div className="flex flex-wrap gap-2">
                  {artist.genres.map((genre, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Albums Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8">
          <h3 className="text-2xl font-bold text-white mb-6">Álbumes</h3>
          
          {albums && albums.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {albums.map((album) => (
                <Link
                  key={album.id}
                  href={`/album/${album.id}`}
                  className="group cursor-pointer"
                >
                  <div className="bg-white/5 rounded-lg p-4 hover:bg-white/10 transition-colors">
                    <img
                      src={album.images[0]?.url || '/placeholder-album.jpg'}
                      alt={album.name}
                      className="w-full aspect-square object-cover rounded-lg mb-3 group-hover:scale-105 transition-transform duration-300"
                    />
                    <h4 className="text-white font-semibold text-sm mb-1 truncate">
                      {album.name}
                    </h4>
                    <p className="text-gray-400 text-xs truncate">
                      {album.release_date?.split('-')[0]} • {album.total_tracks} tracks
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-gray-300 text-center py-8">
              No se encontraron álbumes para este artista.
            </p>
          )}
        </div>

        {/* Top Tracks Section */}
        {topTracks && topTracks.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
            <h3 className="text-2xl font-bold text-white mb-6">Canciones Populares</h3>
            
            <div className="space-y-3">
              {topTracks.slice(0, 10).map((track, index) => (
                <div
                  key={track.id}
                  className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-lg transition-colors"
                >
                  <span className="text-gray-400 text-sm w-6">{index + 1}</span>
                  <img
                    src={track.album.images[0]?.url || '/placeholder-album.jpg'}
                    alt={track.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-white font-medium truncate">{track.name}</h4>
                    <p className="text-gray-400 text-sm truncate">{track.album.name}</p>
                  </div>
                  <div className="text-gray-400 text-sm">
                    {Math.floor(track.duration_ms / 60000)}:{String(Math.floor((track.duration_ms % 60000) / 1000)).padStart(2, '0')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
