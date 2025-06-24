'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, User, ExternalLink, Heart, HeartOff, Music, Tag, Info, X, Clock } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useNotifications } from '../../../hooks/useNotifications';
import { useTheme } from '../../../hooks/useTheme';
import Link from 'next/link';
import Image from 'next/image';

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
  const [activeTab, setActiveTab] = useState('albums');
  const [albumSearch, setAlbumSearch] = useState("");
  const [albumSort, setAlbumSort] = useState("recent");
  const [releaseType, setReleaseType] = useState("all");

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
      <div className="min-h-screen bg-theme-background">
        <div className="animate-pulse">
          <div className="h-96 bg-gradient-to-b from-theme-card-hover to-theme-background relative">
            <div className="absolute inset-0 bg-black/20" />
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8 flex items-end">
              <div className="h-64 w-64 bg-theme-card rounded-2xl mr-8" />
              <div className="flex-1">
                <div className="h-4 bg-theme-card rounded w-20 mb-4" />
                <div className="h-12 bg-theme-card rounded w-80 mb-4" />
                <div className="h-6 bg-theme-card rounded w-60" />
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-theme-card rounded-2xl p-4 border border-theme-border">
                  <div className="aspect-square bg-theme-card-hover rounded-xl mb-4" />
                  <div className="h-4 bg-theme-card-hover rounded mb-2" />
                  <div className="h-3 bg-theme-card-hover rounded w-3/4" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen bg-theme-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <User className="w-16 h-16 text-theme-muted mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-theme-primary mb-4">
            {error || 'Artista no encontrado'}
          </h1>
          <p className="text-theme-secondary mb-4">
            {error ? 'Hubo un error al cargar el artista.' : 'No se pudo encontrar el artista solicitado.'}
          </p>
          <Link 
            href="/" 
            className="inline-flex items-center px-6 py-3 bg-theme-accent hover:bg-theme-hover text-theme-button rounded-xl transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-background">
      {/* Header con imagen de fondo */}
      <div className="relative pb-8" style={{ minHeight: '400px' }}>
        {/* Imagen de fondo */}
        {artist?.images?.[0]?.url && (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(${artist.images[0].url})`,
            }}
          />
        )}
        {/* Gradiente de overlay */}
        <div className="absolute inset-0 bg-gradient-album-header" />
        {/* Overlay adicional para mejorar legibilidad */}
        <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-black/40' : 'bg-white/40'}`} />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          {/* Botón de retroceso */}
          <Link 
            href="/"
            className={`inline-flex items-center transition-colors mb-8 ${
              theme === 'dark' 
                ? 'text-white/80 hover:text-white' 
                : 'text-black/80 hover:text-black'
            }`}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </Link>

          {/* Información principal del artista */}
          <div className="flex flex-col md:flex-row items-start md:items-end space-y-6 md:space-y-0 md:space-x-8 min-w-0 w-full">
            {/* Foto del artista */}
            <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
              {artist?.images?.[0]?.url ? (
                <Image
                  src={artist.images[0].url}
                  alt={artist.name}
                  width={256}
                  height={256}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-400 to-cyan-400 flex items-center justify-center">
                  <User className="w-16 h-16 text-white" />
                </div>
              )}
            </div>

            {/* Información del artista */}
            <div className="flex-1 min-w-0 max-w-full">
              <div className={`text-sm mb-2 uppercase tracking-wide ${
                theme === 'dark' ? 'text-white/60' : 'text-black/60'
              }`}>Artista</div>
              
              {/* Nombre del artista */}
              <h1 className={`font-bold mb-4 leading-tight ${
                theme === 'dark' ? 'text-white' : 'text-black'
              } ${
                artist?.name?.length > 50 
                  ? 'text-xl md:text-2xl' 
                  : artist?.name?.length > 30 
                    ? 'text-2xl md:text-3xl' 
                    : 'text-3xl md:text-4xl lg:text-5xl'
              }`} style={{ 
                wordBreak: 'break-word', 
                overflowWrap: 'break-word', 
                hyphens: 'auto',
                lineHeight: '1.1'
              }}>
                {artist?.name}
              </h1>
              
              {/* Información adicional */}
              <div className={`flex flex-wrap items-center gap-2 md:gap-4 mb-6 text-sm md:text-base ${
                theme === 'dark' ? 'text-white/70' : 'text-black/70'
              }`}>
                <span>{appFollowersCount.toLocaleString()} seguidores en TuneBoxd</span>
                <span>•</span>
                <span>{albums?.length || 0} álbumes</span>
              </div>

              {/* Controles de acciones */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Botones de acciones rápidas */}
                <div className="flex items-center space-x-3">
                  {/* Botón de seguir/dejar de seguir */}
                  {isAuthenticated ? (
                    <button
                      onClick={handleFollowToggle}
                      disabled={followLoading}
                      title={isFollowing ? "Dejar de seguir artista" : "Seguir artista"}
                      className={`p-3 rounded-full transition-colors ${
                        isFollowing 
                          ? 'text-red-400 hover:text-red-300' 
                          : theme === 'dark' 
                            ? 'text-white/60 hover:text-white'
                            : 'text-black/60 hover:text-black'
                      }`}
                    >
                      {isFollowing ? (
                        <HeartOff className={`w-6 h-6 ${isFollowing ? 'fill-current' : ''}`} />
                      ) : (
                        <Heart className="w-6 h-6" />
                      )}
                    </button>
                  ) : null}

                  {artist?.external_urls?.spotify && (
                    <a
                      href={artist.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Abrir en Spotify"
                      className={`p-3 rounded-full transition-colors ${
                        theme === 'dark' 
                          ? 'text-white/60 hover:text-white'
                          : 'text-black/60 hover:text-black'
                      }`}
                    >
                      <ExternalLink className="w-6 h-6" />
                    </a>
                  )}
                </div>

                {/* Botón de seguir prominente */}
                {isAuthenticated && (
                  <button
                    onClick={handleFollowToggle}
                    disabled={followLoading}
                    title={isFollowing ? "Dejar de seguir este artista" : "Seguir este artista"}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg relative overflow-hidden group ${
                      followLoading
                        ? 'bg-gray-500 cursor-not-allowed'
                        : isFollowing
                          ? 'bg-gradient-to-r from-red-600 via-red-500 to-pink-600 hover:from-red-700 hover:via-red-600 hover:to-pink-700'
                          : 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700'
                    }`}
                  >
                    {/* Efecto de brillo animado */}
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                    
                    {followLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin relative z-10" />
                    ) : isFollowing ? (
                      <HeartOff className="w-5 h-5 relative z-10" />
                    ) : (
                      <Heart className="w-5 h-5 relative z-10" />
                    )}
                    <span className="hidden sm:inline relative z-10 text-lg">
                      {followLoading 
                        ? 'Actualizando...' 
                        : isFollowing 
                          ? 'Dejar de seguir' 
                          : 'Seguir artista'
                      }
                    </span>
                    <span className="sm:hidden relative z-10 font-bold">
                      {followLoading 
                        ? 'Cargando...' 
                        : isFollowing 
                          ? 'Dejar de seguir' 
                          : 'Seguir'
                      }
                    </span>
                  </button>
                )}

                {/* LLAMADA A LA ACCIÓN PARA USUARIOS NO AUTENTICADOS */}
                {!isAuthenticated && (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Mensaje motivacional */}
                    <div className={`text-center sm:text-left ${
                      theme === 'dark' ? 'text-white' : 'text-black'
                    }`}>
                      <p className="text-lg font-semibold mb-1">¿Te gusta {artist?.name}?</p>
                      <p className={`text-sm ${theme === 'dark' ? 'text-white/70' : 'text-black/70'}`}>
                        ¡Crea una cuenta GRATIS para seguir al artista!
                      </p>
                    </div>

                    {/* Botones de acción súper llamativos */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        href="/register"
                        title="Regístrate gratis para seguir artistas, escribir reseñas y más"
                        className="flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-700 text-white rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg relative overflow-hidden group animate-pulse"
                      >
                        {/* Efecto de brillo súper llamativo */}
                        <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-800 ease-in-out" />
                        
                        <Heart className="w-6 h-6 relative z-10" />
                        <span className="relative z-10">Crear cuenta GRATIS</span>
                      </Link>

                      <Link
                        href="/login"
                        title="Inicia sesión para acceder a todas las funciones"
                        className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg border-2 ${
                          theme === 'dark' 
                            ? 'border-white/30 text-white hover:bg-white/10' 
                            : 'border-black/30 text-black hover:bg-black/10'
                        }`}
                      >
                        <span className="text-lg">Iniciar sesión</span>
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Géneros */}
              {artist?.genres && artist.genres.length > 0 && (
                <div className="mt-6">
                  <div className="flex flex-wrap gap-2">
                    {artist.genres.slice(0, 5).map((genre, index) => (
                      <span
                        key={index}
                        className={`px-3 py-1 rounded-full text-sm ${
                          theme === 'dark' 
                            ? 'bg-white/10 text-white/80' 
                            : 'bg-black/10 text-black/80'
                        }`}
                      >
                        {genre.charAt(0).toUpperCase() + genre.slice(1)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navegación por pestañas */}
        <div className="flex gap-3 mb-8 overflow-x-auto scrollbar-hide pb-2 border-b border-theme">
          {[
            { key: 'albums', label: 'Álbumes', icon: Music },
            { key: 'info', label: 'Información', icon: Info },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center space-x-2 px-6 py-4 sm:px-6 sm:py-3 font-medium transition-colors whitespace-nowrap flex-shrink-0 rounded-xl ${
                activeTab === key
                  ? 'text-theme-accent bg-theme-accent/10 border-2 border-theme-accent'
                  : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-card-hover border-2 border-transparent'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Contenido de las pestañas */}
        {activeTab === 'albums' && (
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <input
                  type="text"
                  value={albumSearch}
                  onChange={e => setAlbumSearch(e.target.value)}
                  placeholder="Buscar álbum..."
                  className="px-4 py-2 rounded-xl border border-theme bg-theme-card text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-accent transition-all w-56 shadow"
                />
                <select
                  value={albumSort}
                  onChange={e => setAlbumSort(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-theme bg-theme-card text-theme-primary focus:outline-none focus:ring-2 focus:ring-theme-accent transition-all shadow"
                >
                  <option value="recent">Más reciente</option>
                  <option value="oldest">Más antiguo</option>
                  <option value="az">A-Z</option>
                  <option value="za">Z-A</option>
                </select>
                <select
                  value={releaseType}
                  onChange={e => setReleaseType(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-theme bg-theme-card text-theme-primary focus:outline-none focus:ring-2 focus:ring-theme-accent transition-all shadow"
                >
                  <option value="all">Todos</option>
                  <option value="album">Álbumes</option>
                  <option value="single">Singles</option>
                  <option value="compilation">Compilaciones</option>
                  <option value="appears_on">Apariciones</option>
                </select>
              </div>
              <div>
                <span className="text-theme-muted text-sm">{albums?.length || 0} álbumes</span>
              </div>
            </div>

            {/* Filtrado, tipo y ordenado de álbumes */}
            {albums && albums.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                {albums
                  .filter(album =>
                    (releaseType === "all" || album.album_group === releaseType || album.album_type === releaseType)
                    && album.name.toLowerCase().includes(albumSearch.toLowerCase())
                  )
                  .sort((a, b) => {
                    if (albumSort === "recent") {
                      return (b.release_date || "").localeCompare(a.release_date || "");
                    } else if (albumSort === "oldest") {
                      return (a.release_date || "").localeCompare(b.release_date || "");
                    } else if (albumSort === "az") {
                      return a.name.localeCompare(b.name);
                    } else if (albumSort === "za") {
                      return b.name.localeCompare(a.name);
                    }
                    return 0;
                  })
                  .map((album) => (
                    <div 
                      key={album.id} 
                      className="bg-theme-card backdrop-blur-sm rounded-2xl p-4 border border-theme-border hover:bg-theme-hover transition-all duration-300 group"
                    >
                      <Link
                        href={`/album/${album.id}`}
                        className="block"
                      >
                        <div className="relative mb-4">
                          <Image
                            src={album.images[0]?.url || '/placeholder-album.jpg'}
                            alt={album.name}
                            width={200}
                            height={200}
                            className="w-full aspect-square object-cover rounded-xl group-hover:scale-105 transition-transform duration-300 shadow-lg"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-xl transition-colors duration-300" />
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-theme-primary font-semibold text-sm line-clamp-2 group-hover:text-theme-accent transition-colors">
                            {album.name}
                          </h4>
                          <p className="text-theme-secondary text-xs">
                            {album.release_date?.split('-')[0]} • {album.total_tracks} canciones
                          </p>
                        </div>
                      </Link>
                      
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleAlbumInfo(album);
                        }}
                        className="w-full flex items-center justify-center gap-2 mt-3 px-3 py-2 bg-theme-accent hover:bg-theme-accent/80 text-theme-button text-xs rounded-xl transition-colors font-medium"
                      >
                        <Info className="w-4 h-4" />
                        Más información
                      </button>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Music className="w-16 h-16 text-theme-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-theme-primary mb-2">
                  No se encontraron álbumes
                </h3>
                <p className="text-theme-muted">
                  No hay álbumes disponibles para este artista en este momento.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modal para información del álbum */}
        {selectedAlbum && (
          <div 
            className={`fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 ${
              isAlbumModalAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
            }`}
            onClick={closeAlbumModal}
          >
            <div 
              className={`bg-theme-card backdrop-blur-sm rounded-2xl w-full max-w-4xl max-h-[90vh] border border-theme-border shadow-2xl flex flex-col ${
                isAlbumModalAnimating ? 'modal-scale-enter' : 'modal-scale-exit'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del modal */}
              <div className="flex items-center justify-between p-6 border-b border-theme-border flex-shrink-0">
                <div className="flex items-center gap-4">
                  <Image
                    src={selectedAlbum.images[0]?.url || '/placeholder-album.jpg'}
                    alt={selectedAlbum.name}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded-xl shadow-lg"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-theme-primary">{selectedAlbum.name}</h3>
                    <p className="text-theme-secondary">
                      {artist?.name} • {selectedAlbum.release_date?.split('-')[0]} • {selectedAlbum.total_tracks} canciones
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeAlbumModal}
                  className="text-theme-muted hover:text-theme-primary transition-colors p-2 rounded-lg hover:bg-theme-hover"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="p-6 overflow-y-auto flex-1 min-h-0">
                {loadingTracks ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-8 h-8 border-2 border-theme-accent border-t-transparent rounded-full animate-spin"></div>
                      <p className="text-theme-primary">Cargando canciones...</p>
                    </div>
                  </div>
                ) : albumTracks.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-semibold text-theme-muted uppercase tracking-wider border-b border-theme-border">
                      <div className="col-span-1">#</div>
                      <div className="col-span-8">Título</div>
                      <div className="col-span-3 text-right">
                        <Clock className="inline w-4 h-4 mr-1" />
                        Duración
                      </div>
                    </div>
                    {albumTracks.map((track, index) => (
                      <Link
                        key={track.id}
                        href={`/track/${track.id}`}
                        className="grid grid-cols-12 gap-4 px-4 py-3 hover:bg-theme-hover rounded-xl transition-colors group cursor-pointer"
                      >
                        <div className="col-span-1 flex items-center">
                          <span className="text-theme-muted text-sm font-medium">
                            {index + 1}
                          </span>
                        </div>
                        <div className="col-span-8 flex items-center min-w-0">
                          <div className="min-w-0">
                            <h4 className="text-theme-primary group-hover:text-theme-accent font-medium truncate transition-colors">
                              {track.name}
                            </h4>
                            {track.explicit && (
                              <span className="inline-block bg-theme-muted/20 text-theme-muted text-xs px-1.5 py-0.5 rounded mt-1">
                                Explícito
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="col-span-3 flex items-center justify-end">
                          <span className="text-theme-muted text-sm">
                            {formatDuration(track.duration_ms)}
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Music className="w-16 h-16 text-theme-muted mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-theme-primary mb-2">
                      No se pudieron cargar las canciones
                    </h3>
                    <p className="text-theme-muted">
                      No hay información disponible sobre las canciones de este álbum.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer del modal */}
              <div className="flex items-center justify-between p-6 border-t border-theme-border flex-shrink-0">
                <Link
                  href={`/album/${selectedAlbum.id}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-theme-accent hover:bg-theme-accent/80 text-theme-button rounded-xl font-medium transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Ver página del álbum
                </Link>
                <button
                  onClick={closeAlbumModal}
                  className="px-6 py-3 bg-theme-card hover:bg-theme-hover text-theme-primary rounded-xl font-medium transition-colors border border-theme-border"
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
