'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, User, ExternalLink, Heart, HeartOff, Music, Tag, Info, X, Clock } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useNotifications } from '../../../hooks/useNotifications';
import { useTheme } from '../../../hooks/useTheme';
import Link from 'next/link';

export default function ArtistPage() {
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const { success, error: showError } = useNotifications();
  const { theme } = useTheme();
  const [artist, setArtist] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [appFollowersCount, setAppFollowersCount] = useState(0);
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [albumTracks, setAlbumTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [isAlbumModalAnimating, setIsAlbumModalAnimating] = useState(false);

  // Obtener el ID del artista de los parámetros de URL
  const artistId = params.artistId;

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

        // Obtener seguidores de la aplicación (para todos los usuarios)
        try {
          const statsResponse = await fetch(`/api/artists/stats?artist_id=${artistId}`);
          const statsData = await statsResponse.json();
          if (statsData.success) {
            setAppFollowersCount(statsData.followers);
          }
        } catch (error) {
          console.error('Error obteniendo estadísticas del artista:', error);
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
          setAppFollowersCount(prev => Math.max(0, prev - 1)); // Decrementar contador
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
          setAppFollowersCount(prev => prev + 1); // Incrementar contador
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

  const handleAlbumInfo = async (album) => {
    setSelectedAlbum(album);
    setIsAlbumModalAnimating(true);
    setLoadingTracks(true);
    
    try {
      const response = await fetch(`/api/spotify/album/${album.id}`);
      const data = await response.json();
      
      if (data.success && data.album?.tracks?.items) {
        setAlbumTracks(data.album.tracks.items);
      } else {
        console.error('Error obteniendo canciones del álbum:', data);
        setAlbumTracks([]);
      }
    } catch (error) {
      console.error('Error cargando canciones del álbum:', error);
      setAlbumTracks([]);
    } finally {
      setLoadingTracks(false);
    }
  };

  const closeAlbumModal = () => {
    setIsAlbumModalAnimating(false);
    setTimeout(() => {
      setSelectedAlbum(null);
      setAlbumTracks([]);
    }, 300); // Esperar a que termine la animación
  };

  const formatDuration = (durationMs) => {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // useEffect para animación de entrada del modal del álbum
  useEffect(() => {
    if (selectedAlbum) {
      // Pequeño delay para que se vea la animación
      setTimeout(() => setIsAlbumModalAnimating(true), 10);
    }
  }, [selectedAlbum]);

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className={`h-8 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded w-1/3 mb-6`}></div>
            <div className="grid md:grid-cols-4 gap-8">
              <div className={`h-80 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded-lg`}></div>
              <div className="md:col-span-3">
                <div className={`h-10 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded w-3/4 mb-4`}></div>
                <div className={`h-6 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded w-1/2 mb-6`}></div>
                <div className="space-y-3">
                  <div className={`h-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded`}></div>
                  <div className={`h-4 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded w-3/4`}></div>
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
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className={`text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <h1 className="text-2xl font-bold mb-4">
            {error || 'Artista no encontrado'}
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            {error ? 'Hubo un error al cargar el artista.' : 'No se pudo encontrar el artista solicitado.'}
          </p>
          <Link href="/" className="text-blue-500 hover:text-blue-600">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className={`${theme === 'dark' ? 'text-white hover:text-gray-300' : 'text-gray-900 hover:text-gray-700'} transition-colors`}>
            <ArrowLeft size={24} />
          </Link>
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Detalles del Artista</h1>
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
                <div className="w-80 h-80 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full shadow-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <User size={120} className="text-white/70" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>

          {/* Artist Details */}
          <div className="md:col-span-3">
            <h2 className={`text-4xl font-bold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{artist.name}</h2>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <User size={20} className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>
                  {appFollowersCount.toLocaleString()} seguidores en Tuneboxd
                </span>
              </div>
              <a
                href={artist.external_urls?.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-500 hover:text-green-600 transition-colors"
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
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white'
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
                <div className={`${theme === 'dark' ? 'bg-blue-500/20 border-blue-500/30' : 'bg-blue-100 border-blue-300'} border rounded-lg p-4`}>
                  <p className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'} text-center`}>
                    <Link href="/login" className={`underline ${theme === 'dark' ? 'hover:text-blue-200' : 'hover:text-blue-600'}`}>
                      Inicia sesión
                    </Link> para seguir artistas
                  </p>
                </div>
              )}
            </div>

            {/* Official Genres from Spotify */}
            {artist.genres && artist.genres.length > 0 && (
              <div>
                <h4 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Géneros</h4>
                <div className="flex flex-wrap gap-2">
                  {artist.genres.map((genre, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} rounded-full text-sm`}
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
        <div className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-md rounded-lg p-6 mb-8 shadow-lg`}>
          <h3 className={`text-2xl font-bold mb-6 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Álbumes</h3>
          
          {albums && albums.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {albums.map((album) => (
                <div key={album.id} className={`${theme === 'dark' ? 'bg-gray-700/30 hover:bg-gray-700/50' : 'bg-white/70 hover:bg-white/90'} rounded-lg p-4 transition-colors shadow-md`}>
                  <Link
                    href={`/album/${album.id}`}
                    className="block group"
                  >
                    <img
                      src={album.images[0]?.url || '/placeholder-album.jpg'}
                      alt={album.name}
                      className="w-full aspect-square object-cover rounded-lg mb-3 group-hover:scale-105 transition-transform duration-300"
                    />
                    <h4 className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold text-sm mb-1 truncate`}>
                      {album.name}
                    </h4>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs truncate mb-3`}>
                      {album.release_date?.split('-')[0]} • {album.total_tracks} tracks
                    </p>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleAlbumInfo(album);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-lg transition-colors"
                  >
                    <Info size={14} />
                    Más info
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-center py-8`}>
              No se encontraron álbumes para este artista.
            </p>
          )}
        </div>

        {/* Modal para información del álbum */}
        {selectedAlbum && (
          <div 
            className={`fixed inset-0 bg-black/50 modal-backdrop flex items-center justify-center z-50 p-4 ${
              isAlbumModalAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
            }`}
            onClick={closeAlbumModal}
          >
            <div 
              className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'} shadow-2xl ${
                isAlbumModalAnimating ? 'modal-scale-enter' : 'modal-scale-exit'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del modal */}
              <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                <div className="flex items-center gap-4">
                  <img
                    src={selectedAlbum.images[0]?.url || '/placeholder-album.jpg'}
                    alt={selectedAlbum.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{selectedAlbum.name}</h3>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {artist?.name} • {selectedAlbum.release_date?.split('-')[0]} • {selectedAlbum.total_tracks} canciones
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeAlbumModal}
                  className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors p-2`}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                {loadingTracks ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center space-y-4">
                      <div className={`w-8 h-8 border-2 ${theme === 'dark' ? 'border-gray-600 border-t-white' : 'border-gray-300 border-t-gray-900'} rounded-full animate-spin`}></div>
                      <p className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Cargando canciones...</p>
                    </div>
                  </div>
                ) : albumTracks.length > 0 ? (
                  <div className="space-y-2">
                    <div className={`grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} uppercase tracking-wider border-b ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                      <div className="col-span-1">#</div>
                      <div className="col-span-8">Título</div>
                      <div className="col-span-3 text-right">
                        <Clock size={14} className="inline mr-1" />
                        Duración
                      </div>
                    </div>
                    {albumTracks.map((track, index) => (
                      <Link
                        key={track.id}
                        href={`/track/${track.id}`}
                        className={`grid grid-cols-12 gap-4 px-4 py-3 ${theme === 'dark' ? 'hover:bg-gray-700/30' : 'hover:bg-gray-100'} rounded-lg transition-colors group cursor-pointer`}
                      >
                        <div className="col-span-1 flex items-center">
                          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm font-medium`}>
                            {index + 1}
                          </span>
                        </div>
                        <div className="col-span-8 flex items-center min-w-0">
                          <div className="min-w-0">
                            <h4 className={`${theme === 'dark' ? 'text-white group-hover:text-blue-300' : 'text-gray-900 group-hover:text-blue-600'} font-medium truncate transition-colors`}>
                              {track.name}
                            </h4>
                            {track.explicit && (
                              <span className={`inline-block ${theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-300 text-gray-700'} text-xs px-1.5 py-0.5 rounded mt-1`}>
                                Explícito
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="col-span-3 flex items-center justify-end">
                          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                            {formatDuration(track.duration_ms)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Music className={`w-16 h-16 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} mx-auto mb-4`} />
                    <h3 className={`text-xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-2`}>
                      No se pudieron cargar las canciones
                    </h3>
                    <p className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                      No hay información disponible sobre las canciones de este álbum.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer del modal */}
              <div className={`flex items-center justify-between p-6 border-t ${theme === 'dark' ? 'border-gray-600' : 'border-gray-300'}`}>
                <Link
                  href={`/album/${selectedAlbum.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors"
                >
                  <ExternalLink size={16} />
                  Ver página del álbum
                </Link>
                <button
                  onClick={closeAlbumModal}
                  className={`px-4 py-2 ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-300 hover:bg-gray-400'} ${theme === 'dark' ? 'text-white' : 'text-gray-900'} rounded-lg font-medium transition-colors`}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
