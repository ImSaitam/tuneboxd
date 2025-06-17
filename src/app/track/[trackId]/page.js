"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Clock, 
  Calendar, 
  Music, 
  ExternalLink,
  Star,
  User,
  Album,
  Headphones,
  Plus,
  Eye,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSpotify } from '@/hooks/useSpotify';
import { useNotifications } from '@/hooks/useNotifications';

const TrackDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { getTrackById, getArtistTopTracks, searchMusic } = useSpotify();
  const { success: showSuccess, error: showError } = useNotifications();

  // Estados principales
  const [track, setTrack] = useState(null);
  const [album, setAlbum] = useState(null);
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de interacción
  const [isLiked, setIsLiked] = useState(false);
  const [inListenList, setInListenList] = useState(false);
  
  // Estados de datos relacionados
  const [relatedTracks, setRelatedTracks] = useState([]);
  const [artistTopTracks, setArtistTopTracks] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [trackStats, setTrackStats] = useState(null);
  
  // Estados de UI
  const [activeTab, setActiveTab] = useState('info');
  const [showAddToListModal, setShowAddToListModal] = useState(false);

  const trackId = params.trackId;

  // Cargar datos del track
  useEffect(() => {
    const loadTrackData = async () => {
      if (!trackId) return;

      try {
        setLoading(true);
        setError(null);

        // Obtener datos del track desde Spotify
        const trackData = await getTrackById(trackId);
        
        if (!trackData) {
          setError('Track no encontrado');
          return;
        }

        setTrack(trackData);
        setAlbum(trackData.album);
        setArtist(trackData.artists[0]);

        // Cargar datos relacionados en paralelo
        await Promise.allSettled([
          loadRelatedTracks(trackData),
          loadArtistTopTracks(trackData.artists[0].id),
          loadTrackReviews(trackId),
          loadTrackStats(trackId)
        ]);

      } catch (error) {
        console.error('Error cargando datos del track:', error);
        setError('Error cargando los datos del track');
      } finally {
        setLoading(false);
      }
    };

    loadTrackData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackId, getTrackById, getArtistTopTracks, searchMusic]);

  // Verificar si el track está en favoritos
  const checkIfLiked = useCallback(async (trackId) => {
    if (!isAuthenticated || !user) return;
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/track-favorites?trackId=${trackId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setIsLiked(data.isInFavorites);
      }
    } catch (error) {
      console.error('Error verificando favoritos:', error);
    }
  }, [isAuthenticated, user]);

  // Verificar si el track está en lista de escucha
  const checkIfInListenList = useCallback(async (trackId) => {
    if (!isAuthenticated) return;
    // Implementar lógica para verificar si está en lista de escucha
    setInListenList(false);
  }, [isAuthenticated]);

  // useEffect separado para verificar estado de favoritos cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated && user && trackId && track) {
      checkIfLiked(trackId);
      checkIfInListenList(trackId);
    }
  }, [isAuthenticated, user, trackId, track, checkIfLiked, checkIfInListenList]);

  // Función para cargar tracks relacionados
  const loadRelatedTracks = async (trackData) => {
    try {
      // Buscar tracks similares del mismo artista
      const artistTracks = await searchMusic(trackData.artists[0].name, 'track', 10);
      const filtered = artistTracks.items?.filter(t => t.id !== trackData.id).slice(0, 5) || [];
      setRelatedTracks(filtered);
    } catch (error) {
      console.error('Error cargando tracks relacionados:', error);
    }
  };

  // Función para cargar top tracks del artista
  const loadArtistTopTracks = async (artistId) => {
    try {
      const topTracks = await getArtistTopTracks(artistId);
      setArtistTopTracks(topTracks.slice(0, 5));
    } catch (error) {
      console.error('Error cargando top tracks del artista:', error);
    }
  };

  // Función para cargar reseñas del track
  const loadTrackReviews = async (trackId) => {
    try {
      // Nota: Necesitarás implementar una API para reseñas de tracks
      // Por ahora, usamos datos mock
      setReviews([]);
    } catch (error) {
      console.error('Error cargando reseñas:', error);
    }
  };

  // Función para cargar estadísticas del track
  const loadTrackStats = async (trackId) => {
    try {
      // Obtener estadísticas del track desde la API (sin autenticación requerida)
      const response = await fetch(`/api/track-favorites?trackId=${trackId}&stats=true`);
      
      if (response.ok) {
        const data = await response.json();
        setTrackStats({
          plays: track?.popularity || 0,
          likes: data.stats?.likes || 0,
          inLists: 0, // Por implementar cuando tengamos listas
          averageRating: 0 // Por implementar cuando tengamos ratings
        });
      } else {
        // Fallback a stats por defecto
        setTrackStats({
          plays: track?.popularity || 0,
          likes: 0,
          inLists: 0,
          averageRating: 0
        });
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
      // Fallback a stats por defecto
      setTrackStats({
        plays: track?.popularity || 0,
        likes: 0,
        inLists: 0,
        averageRating: 0
      });
    }
  };

  // Función para agregar/quitar de favoritos
  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      
      if (isLiked) {
        // Eliminar de favoritos
        const response = await fetch('/api/track-favorites', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            trackId: trackId
          })
        });

        if (response.ok) {
          setIsLiked(false);
          showSuccess('Eliminado de favoritos');
        } else {
          const errorData = await response.json();
          showError(errorData.error || 'Error al eliminar de favoritos');
        }
      } else {
        // Agregar a favoritos
        const response = await fetch('/api/track-favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            trackId: trackId,
            trackName: track.name,
            artistName: track.artists[0].name,
            albumName: track.album.name,
            imageUrl: track.album.images?.[0]?.url || null,
            durationMs: track.duration_ms
          })
        });

        if (response.ok) {
          setIsLiked(true);
          showSuccess('Agregado a favoritos');
          
          // Actualizar estadísticas localmente
          if (trackStats) {
            setTrackStats(prev => ({
              ...prev,
              likes: prev.likes + 1
            }));
          }
        } else {
          const errorData = await response.json();
          showError(errorData.error || 'Error al agregar a favoritos');
        }
      }
    } catch (error) {
      console.error('Error al actualizar favoritos:', error);
      showError('Error al actualizar favoritos');
    }
  };

  // Función para agregar a lista de escucha
  const handleAddToListenList = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      // Implementar lógica de lista de escucha
      setInListenList(!inListenList);
      showSuccess(inListenList ? 'Eliminado de lista de escucha' : 'Agregado a lista de escucha');
    } catch (error) {
      showError('Error al actualizar lista de escucha');
    }
  };

  // Función para compartir
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${track.name} - ${track.artists[0].name}`,
          text: `Escucha "${track.name}" de ${track.artists[0].name} en TuneBoxd`,
          url: window.location.href
        });
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(window.location.href);
        showSuccess('Enlace copiado al portapapeles');
      }
    } catch (error) {
      showError('Error al compartir');
    }
  };

  // Función para formatear duración
  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-theme-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-theme-secondary">Cargando información del track...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center">
          <Music className="w-16 h-16 text-theme-muted mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-theme-primary mb-2">Track no encontrado</h1>
          <p className="text-theme-secondary mb-6">{error}</p>
          <Link 
            href="/"
            className="bg-theme-accent text-theme-button px-6 py-3 rounded-full hover:bg-theme-accent/90 transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-primary">
      {/* Header con información principal */}
      <div className="relative">
        {/* Fondo con imagen del álbum */}
        <div className="absolute inset-0">
          {track?.album?.images?.[0]?.url && (
            <div
              className="w-full h-full bg-cover bg-center filter blur-sm"
              style={{
                backgroundImage: `url(${track.album.images[0].url})`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-black/70" />
        </div>

        {/* Contenido del header */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Botón de volver */}
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-white/80 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Volver</span>
          </button>

          {/* Información principal del track */}
          <div className="flex flex-col md:flex-row items-start md:items-end space-y-6 md:space-y-0 md:space-x-8">
            {/* Artwork del álbum */}
            <div className="flex-shrink-0">
              <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl">
                {track?.album?.images?.[0]?.url ? (
                  <Image
                    src={track.album.images[0].url}
                    alt={`${track.name} - ${track.artists[0].name}`}
                    width={256}
                    height={256}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-400 to-teal-400 flex items-center justify-center">
                    <Music className="w-24 h-24 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Información del track */}
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white/60 mb-2 uppercase tracking-wide">Canción</div>
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight">
                {track?.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-white/80 mb-6">
                <Link 
                  href={`/artist/${track?.artists[0]?.id}`}
                  className="text-xl font-semibold hover:text-white transition-colors"
                >
                  {track?.artists[0]?.name}
                </Link>
                <span>•</span>
                <Link 
                  href={`/album/${track?.album?.id}`}
                  className="hover:text-white transition-colors"
                >
                  {track?.album?.name}
                </Link>
                <span>•</span>
                <span>{track?.album?.release_date?.substring(0, 4)}</span>
                <span>•</span>
                <span>{formatDuration(track?.duration_ms)}</span>
              </div>

              {/* Controles de acciones */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLikeToggle}
                  className={`p-3 rounded-full transition-colors ${
                    isLiked 
                      ? 'text-red-400 hover:text-red-300' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={handleAddToListenList}
                  className={`p-3 rounded-full transition-colors ${
                    inListenList 
                      ? 'text-theme-accent hover:text-theme-accent/80' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Plus className="w-6 h-6" />
                </button>

                <button
                  onClick={handleShare}
                  className="p-3 rounded-full text-white/60 hover:text-white transition-colors"
                >
                  <Share2 className="w-6 h-6" />
                </button>

                {track?.external_urls?.spotify && (
                  <a
                    href={track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-full text-white/60 hover:text-white transition-colors"
                  >
                    <ExternalLink className="w-6 h-6" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navegación por pestañas */}
        <div className="flex space-x-8 border-b border-theme mb-8">
          {[
            { key: 'info', label: 'Información', icon: Eye },
            { key: 'stats', label: 'Estadísticas', icon: BarChart3 },
            { key: 'related', label: 'Relacionados', icon: Music }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center space-x-2 px-4 py-3 font-medium transition-colors ${
                activeTab === key
                  ? 'text-theme-accent border-b-2 border-theme-accent'
                  : 'text-theme-secondary hover:text-theme-primary'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Contenido de las pestañas */}
        {activeTab === 'info' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Información del track */}
            <div className="lg:col-span-2 space-y-8">
              {/* Detalles técnicos */}
              <div className="bg-theme-card rounded-2xl p-6 border border-theme">
                <h3 className="text-xl font-bold text-theme-primary mb-4">Detalles</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-theme-muted text-sm">Duración</div>
                    <div className="text-theme-primary font-medium">
                      {formatDuration(track?.duration_ms)}
                    </div>
                  </div>
                  <div>
                    <div className="text-theme-muted text-sm">Popularidad</div>
                    <div className="text-theme-primary font-medium">
                      {track?.popularity}/100
                    </div>
                  </div>
                  <div>
                    <div className="text-theme-muted text-sm">Álbum</div>
                    <Link 
                      href={`/album/${track?.album?.id}`}
                      className="text-theme-accent hover:underline font-medium"
                    >
                      {track?.album?.name}
                    </Link>
                  </div>
                  <div>
                    <div className="text-theme-muted text-sm">Fecha de lanzamiento</div>
                    <div className="text-theme-primary font-medium">
                      {formatDate(track?.album?.release_date)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Créditos */}
              <div className="bg-theme-card rounded-2xl p-6 border border-theme">
                <h3 className="text-xl font-bold text-theme-primary mb-4">Artistas</h3>
                <div className="space-y-3">
                  {track?.artists?.map((artist, index) => (
                    <Link
                      key={artist.id}
                      href={`/artist/${artist.id}`}
                      className="flex items-center space-x-3 p-3 rounded-xl hover:bg-theme-card-hover transition-colors"
                    >
                      <User className="w-5 h-5 text-theme-muted" />
                      <span className="text-theme-primary font-medium">{artist.name}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar con información adicional */}
            <div className="space-y-6">
              {/* Álbum */}
              <div className="bg-theme-card rounded-2xl p-6 border border-theme">
                <h3 className="text-lg font-bold text-theme-primary mb-4">Del álbum</h3>
                <Link href={`/album/${track?.album?.id}`} className="block group">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                      {track?.album?.images?.[0]?.url ? (
                        <Image
                          src={track.album.images[0].url}
                          alt={track.album.name}
                          width={64}
                          height={64}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-400 to-teal-400 flex items-center justify-center">
                          <Album className="w-6 h-6 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-theme-primary group-hover:text-theme-accent transition-colors">
                        {track?.album?.name}
                      </div>
                      <div className="text-sm text-theme-secondary">
                        {track?.album?.total_tracks} canciones
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Estadísticas rápidas */}
              {trackStats && (
                <div className="bg-theme-card rounded-2xl p-6 border border-theme">
                  <h3 className="text-lg font-bold text-theme-primary mb-4">Estadísticas</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">Popularidad</span>
                      <span className="text-theme-primary font-medium">{track?.popularity}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">Me gusta</span>
                      <span className="text-theme-primary font-medium">{trackStats.likes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">En listas</span>
                      <span className="text-theme-primary font-medium">{trackStats.inLists}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Aquí irían las estadísticas detalladas */}
            <div className="bg-theme-card rounded-2xl p-6 border border-theme text-center">
              <Headphones className="w-8 h-8 text-theme-accent mx-auto mb-3" />
              <div className="text-2xl font-bold text-theme-primary mb-1">{track?.popularity || 0}</div>
              <div className="text-theme-secondary text-sm">Popularidad</div>
            </div>
            {/* Más estadísticas... */}
          </div>
        )}

        {activeTab === 'related' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Top tracks del artista */}
            <div>
              <h3 className="text-xl font-bold text-theme-primary mb-6">
                Más de {track?.artists[0]?.name}
              </h3>
              <div className="space-y-4">
                {artistTopTracks.map((relatedTrack, index) => (
                  <Link
                    key={relatedTrack.id}
                    href={`/track/${relatedTrack.id}`}
                    className="flex items-center space-x-4 p-4 rounded-xl hover:bg-theme-card-hover transition-colors border border-theme"
                  >
                    <div className="text-theme-muted font-medium text-sm w-6">
                      {index + 1}
                    </div>
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      {relatedTrack.album?.images?.[0]?.url ? (
                        <Image
                          src={relatedTrack.album.images[0].url}
                          alt={relatedTrack.name}
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
                      <div className="font-medium text-theme-primary truncate">
                        {relatedTrack.name}
                      </div>
                      <div className="text-sm text-theme-secondary truncate">
                        {relatedTrack.album.name}
                      </div>
                    </div>
                    <div className="text-sm text-theme-muted">
                      {formatDuration(relatedTrack.duration_ms)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Tracks relacionados */}
            <div>
              <h3 className="text-xl font-bold text-theme-primary mb-6">
                Canciones similares
              </h3>
              <div className="space-y-4">
                {relatedTracks.map((relatedTrack, index) => (
                  <Link
                    key={relatedTrack.id}
                    href={`/track/${relatedTrack.id}`}
                    className="flex items-center space-x-4 p-4 rounded-xl hover:bg-theme-card-hover transition-colors border border-theme"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                      {relatedTrack.album?.images?.[0]?.url ? (
                        <Image
                          src={relatedTrack.album.images[0].url}
                          alt={relatedTrack.name}
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
                      <div className="font-medium text-theme-primary truncate">
                        {relatedTrack.name}
                      </div>
                      <div className="text-sm text-theme-secondary truncate">
                        {relatedTrack.artists[0].name}
                      </div>
                    </div>
                    <div className="text-sm text-theme-muted">
                      {formatDuration(relatedTrack.duration_ms)}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TrackDetailPage;
