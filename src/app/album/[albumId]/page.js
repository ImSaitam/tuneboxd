"use client";

import React, { useState, useEffect } from 'react';
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
  BarChart3,
  Play,
  List,
  HeartOff,
  X,
  Info
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
// import AddToListModal from '@/components/AddToListModal';

const AlbumDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { success: showSuccess, error: showError } = useNotifications();

  // Estados principales
  const [album, setAlbum] = useState(null);
  const [albumData, setAlbumData] = useState(null);
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de interacción
  const [isLiked, setIsLiked] = useState(false);
  const [inListenList, setInListenList] = useState(false);
  const [hasUserReview, setHasUserReview] = useState(false);
  
  // Estados de datos relacionados
  const [albumTracks, setAlbumTracks] = useState([]);
  const [artistTopAlbums, setArtistTopAlbums] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [albumStats, setAlbumStats] = useState(null);
  
  // Estados de UI
  const [activeTab, setActiveTab] = useState('info');
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  
  // Estados del formulario de reseña
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const albumId = params.albumId;

  // Cargar datos del album
  useEffect(() => {
    const loadAlbumData = async () => {
      if (!albumId) return;

      try {
        setLoading(true);
        setError(null);

        // Obtener datos del album desde Spotify
        const response = await fetch(`/api/spotify/album/${albumId}`);
        
        if (!response.ok) {
          setError('Album no encontrado');
          return;
        }

        const spotifyData = await response.json();
        
        if (!spotifyData.success) {
          setError('Error al obtener datos del álbum');
          return;
        }

        const albumData = spotifyData.album;
        setAlbumData(albumData);
        setAlbumTracks(albumData.tracks?.items || []);
        setArtist(albumData.artists[0]);

        // Crear/encontrar el álbum en nuestra base de datos
        const dbResponse = await fetch('/api/albums', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            album: {
              spotify_id: albumData.id,
              name: albumData.name,
              artist: albumData.artists[0]?.name,
              release_date: albumData.release_date,
              image_url: albumData.images[0]?.url,
              spotify_url: albumData.external_urls?.spotify
            }
          })
        });

        if (dbResponse.ok) {
          const result = await dbResponse.json();
          setAlbum(result.album);

          // Cargar datos relacionados en paralelo
          await Promise.allSettled([
            loadArtistTopAlbums(albumData.artists[0].id),
            loadAlbumReviews(result.album.id),
            loadAlbumStats(result.album.id)
          ]);

          // Verificar estados si está autenticado
          if (isAuthenticated) {
            // Verificar favoritos
            try {
              const token = localStorage.getItem('auth_token');
              const checkResponse = await fetch(`/api/listen-list/check?albumId=${result.album.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (checkResponse.ok) {
                const data = await checkResponse.json();
                setInListenList(data.inListenList);
              }
            } catch (error) {
              console.error('Error verificando lista de escucha:', error);
            }

            // Verificar reseña del usuario
            try {
              const token = localStorage.getItem('auth_token');
              const reviewResponse = await fetch(`/api/reviews/user?albumId=${result.album.id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (reviewResponse.ok) {
                const data = await reviewResponse.json();
                setHasUserReview(data.hasReview);
              }
            } catch (error) {
              console.error('Error verificando reseña del usuario:', error);
            }
          }
        }

      } catch (error) {
        console.error('Error cargando datos del album:', error);
        setError('Error cargando los datos del álbum');
      } finally {
        setLoading(false);
      }
    };

    loadAlbumData();
  }, [albumId, isAuthenticated]);

  // Cargar álbumes relacionados del artista
  const loadArtistTopAlbums = async (artistId) => {
    try {
      const response = await fetch(`/api/spotify/artist/${artistId}/albums`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setArtistTopAlbums(data.albums.items.slice(0, 10));
        }
      }
    } catch (error) {
      console.error('Error cargando álbumes del artista:', error);
    }
  };
  // Cargar reseñas del album
  const loadAlbumReviews = async (albumId) => {
    try {
      const response = await fetch(`/api/reviews?type=album&albumId=${albumId}`);
      if (response.ok) {
        const data = await response.json();
        console.log('📝 Reseñas cargadas:', data.reviews);
        setReviews(data.reviews || []);
      } else {
        console.error('Error en respuesta de reseñas:', response.status);
      }
    } catch (error) {
      console.error('Error cargando reseñas:', error);
    }
  };

  // Cargar estadísticas del album
  const loadAlbumStats = async (albumId) => {
    try {
      const response = await fetch(`/api/albums/${albumId}/stats`);
      if (response.ok) {
        const data = await response.json();
        setAlbumStats(data.stats);
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  // Función para agregar/quitar de favoritos (lista de escucha)
  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');
      
      if (inListenList) {
        // Eliminar de lista de escucha
        const response = await fetch(`/api/listen-list?albumId=${album.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setInListenList(false);
          showSuccess('Eliminado de lista de escucha');
        } else {
          const errorData = await response.json();
          showError(errorData.error || 'Error al eliminar de lista de escucha');
        }
      } else {
        // Agregar a lista de escucha
        const response = await fetch('/api/listen-list', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            album: {
              spotify_id: albumData.id,
              name: albumData.name,
              artist: albumData.artists[0]?.name,
              release_date: albumData.release_date,
              image_url: albumData.images[0]?.url,
              spotify_url: albumData.external_urls?.spotify
            }
          })
        });

        if (response.ok) {
          setInListenList(true);
          showSuccess('Agregado a lista de escucha');
        } else {
          const errorData = await response.json();
          showError(errorData.error || 'Error al agregar a lista de escucha');
        }
      }
    } catch (error) {
      console.error('Error al actualizar lista de escucha:', error);
      showError('Error al actualizar lista de escucha');
    }
  };

  // Función para compartir
  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${albumData.name} - ${albumData.artists[0].name}`,
          text: `Descubre "${albumData.name}" de ${albumData.artists[0].name} en TuneBoxd`,
          url: window.location.href
        });
      } else {
        // Fallback: copiar al portapapeles
        await navigator.clipboard.writeText(window.location.href);
        showSuccess('Enlace copiado al portapapeles');
      }
    } catch (error) {
      console.error('Error compartiendo:', error);
    }
  };

  // Función para marcar como escuchado
  const handleMarkAsListened = async () => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    try {
      const token = localStorage.getItem('auth_token');      const response = await fetch('/api/listening-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          album: {
            spotify_id: albumData.id,
            name: albumData.name,
            artist: albumData.artists[0]?.name,
            release_date: albumData.release_date,
            image_url: albumData.images[0]?.url,
            spotify_url: albumData.external_urls?.spotify
          },
          // Enviar la fecha actual del cliente (zona horaria local)
          listenedAt: new Date().toISOString()
        })
      });

      if (response.ok) {
        showSuccess('Álbum marcado como escuchado');
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al marcar como escuchado');
      }
    } catch (error) {
      console.error('Error al marcar como escuchado:', error);
      showError('Error al marcar como escuchado');
    }
  };

  // Función para formatear duración
  const formatDuration = (durationMs) => {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha desconocida';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  // Función para manejar el envío de reseñas
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (reviewRating === 0) {
      showError('Por favor selecciona una calificación');
      return;
    }

    setSubmittingReview(true);

    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/reviews', {
        method: hasUserReview ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          albumId: album?.id,
          rating: reviewRating,
          title: reviewTitle.trim() || null,
          content: reviewContent.trim() || null
        })
      });

      if (response.ok) {
        const result = await response.json();
        showSuccess(hasUserReview ? 'Reseña actualizada' : 'Reseña publicada');
        setShowReviewForm(false);
        setHasUserReview(true);
        
        // Limpiar formulario
        setReviewRating(0);
        setReviewTitle('');
        setReviewContent('');
        
        // Recargar reseñas
        if (album) {
          await loadAlbumReviews(album.id);
        }
      } else {
        const errorData = await response.json();
        showError(errorData.error || 'Error al enviar reseña');
      }
    } catch (error) {
      console.error('Error enviando reseña:', error);
      showError('Error al enviar reseña');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Calcular duración total del álbum
  const getTotalDuration = () => {
    if (!albumTracks.length) return 0;
    return albumTracks.reduce((total, track) => total + (track.duration_ms || 0), 0);
  };

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
        </div>
      </div>
    );
  }

  if (error || !albumData) {
    return (
      <div className="min-h-screen bg-theme-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-theme-primary mb-4">
            {error || 'Álbum no encontrado'}
          </h1>
          <p className="text-theme-secondary mb-4">
            {error ? 'Hubo un error al cargar el álbum.' : 'No se pudo encontrar el álbum solicitado.'}
          </p>
          <Link href="/" className="text-theme-accent hover:underline">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-background">
      {/* Header con imagen de fondo */}
      <div 
        className="min-h-96 max-h-[500px] bg-gradient-to-b from-gray-900 to-theme-background relative overflow-hidden"
        style={{
          backgroundImage: albumData?.images?.[0]?.url ? `url(${albumData.images[0].url})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
          {/* Botón de retroceso */}
          <Link 
            href="/"
            className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </Link>

          {/* Información principal del álbum */}
          <div className="flex flex-col md:flex-row items-start md:items-end space-y-6 md:space-y-0 md:space-x-8 overflow-hidden min-w-0 w-full max-h-80">
            {/* Portada del álbum */}
            <div className="w-64 h-64 rounded-2xl overflow-hidden shadow-2xl flex-shrink-0">
              {albumData?.images?.[0]?.url ? (
                <Image
                  src={albumData.images[0].url}
                  alt={albumData.name}
                  width={256}
                  height={256}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-red-400 to-teal-400 flex items-center justify-center">
                  <Album className="w-16 h-16 text-white" />
                </div>
              )}
            </div>

            {/* Información del álbum */}
            <div className="flex-1 min-w-0 max-w-full text-container">
              <div className="text-sm text-white/60 mb-2 uppercase tracking-wide">Álbum</div>
              <h1 className={`font-bold text-white mb-4 leading-tight album-title overflow-hidden ${
                albumData?.name?.length > 50 
                  ? 'text-xl md:text-2xl' 
                  : albumData?.name?.length > 30 
                    ? 'text-2xl md:text-3xl' 
                    : 'text-3xl md:text-5xl'
              }`} style={{ wordBreak: 'break-word', overflowWrap: 'break-word', hyphens: 'auto' }}>
                {albumData?.name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-white/80 mb-6 max-w-full">
                <Link 
                  href={`/artist/${albumData?.artists[0]?.id}`}
                  className="text-xl font-semibold hover:text-white transition-colors break-words max-w-full"
                >
                  {albumData?.artists[0]?.name}
                </Link>
                <span>•</span>
                <span>{albumData?.release_date?.substring(0, 4)}</span>
                <span>•</span>
                <span>{albumTracks.length} canciones</span>
                <span>•</span>
                <span>{formatDuration(getTotalDuration())}</span>
              </div>

              {/* Controles de acciones */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLikeToggle}
                  className={`p-3 rounded-full transition-colors ${
                    inListenList 
                      ? 'text-red-400 hover:text-red-300' 
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Heart className={`w-6 h-6 ${inListenList ? 'fill-current' : ''}`} />
                </button>

                <button
                  onClick={handleMarkAsListened}
                  className="p-3 rounded-full text-white/60 hover:text-white transition-colors"
                >
                  <Clock className="w-6 h-6" />
                </button>

                <button
                  onClick={() => setShowAddToListModal(true)}
                  className="p-3 rounded-full text-white/60 hover:text-white transition-colors"
                >
                  <Plus className="w-6 h-6" />
                </button>

                <button
                  onClick={handleShare}
                  className="p-3 rounded-full text-white/60 hover:text-white transition-colors"
                >
                  <Share2 className="w-6 h-6" />
                </button>

                {albumData?.external_urls?.spotify && (
                  <a
                    href={albumData.external_urls.spotify}
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
            { key: 'tracks', label: 'Canciones', icon: Music },
            { key: 'reviews', label: 'Reseñas', icon: Star },
            { key: 'stats', label: 'Estadísticas', icon: BarChart3 }
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
            {/* Información del álbum */}
            <div className="lg:col-span-2 space-y-8">
              {/* Detalles técnicos */}
              <div className="bg-theme-card rounded-2xl p-6 border border-theme">
                <h3 className="text-xl font-bold text-theme-primary mb-4">Detalles</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-theme-muted text-sm">Canciones</div>
                    <div className="text-theme-primary font-medium">
                      {albumTracks.length}
                    </div>
                  </div>
                  <div>
                    <div className="text-theme-muted text-sm">Duración total</div>
                    <div className="text-theme-primary font-medium">
                      {formatDuration(getTotalDuration())}
                    </div>
                  </div>
                  <div>
                    <div className="text-theme-muted text-sm">Artista</div>
                    <Link 
                      href={`/artist/${albumData?.artists[0]?.id}`}
                      className="text-theme-accent hover:underline font-medium"
                    >
                      {albumData?.artists[0]?.name}
                    </Link>
                  </div>
                  <div>
                    <div className="text-theme-muted text-sm">Fecha de lanzamiento</div>
                    <div className="text-theme-primary font-medium">
                      {formatDate(albumData?.release_date)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Créditos */}
              <div className="bg-theme-card rounded-2xl p-6 border border-theme">
                <h3 className="text-xl font-bold text-theme-primary mb-4">Artistas</h3>
                <div className="space-y-3">
                  {albumData?.artists?.map((artist) => (
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
              {/* Estadísticas rápidas */}
              {albumStats && (
                <div className="bg-theme-card rounded-2xl p-6 border border-theme">
                  <h3 className="text-lg font-bold text-theme-primary mb-4">Estadísticas</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">Popularidad</span>
                      <span className="text-theme-primary font-medium">{albumData?.popularity || 0}/100</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">En listas</span>
                      <span className="text-theme-primary font-medium">{albumStats.inLists || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-theme-secondary">Reseñas</span>
                      <span className="text-theme-primary font-medium">{reviews.length}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Acciones rápidas */}
              <div className="bg-theme-card rounded-2xl p-6 border border-theme">
                <h3 className="text-lg font-bold text-theme-primary mb-4">Acciones</h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-theme-accent text-white rounded-lg hover:bg-theme-accent/80 transition-colors"
                  >
                    <Star className="w-4 h-4" />
                    <span>{hasUserReview ? 'Editar Reseña' : 'Escribir Reseña'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tracks' && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-theme-primary mb-6">
              Lista de canciones
            </h3>
            <div className="space-y-2">
              {albumTracks.map((track, index) => (
                <Link
                  key={track.id}
                  href={`/track/${track.id}`}
                  className="flex items-center space-x-4 p-4 rounded-xl hover:bg-theme-card-hover transition-colors border border-theme"
                >
                  <div className="text-theme-muted font-medium text-sm w-8 text-center">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-theme-primary truncate">
                      {track.name}
                    </div>
                    <div className="text-sm text-theme-secondary truncate">
                      {track.artists?.map(artist => artist.name).join(', ')}
                    </div>
                  </div>
                  <div className="text-sm text-theme-muted">
                    {formatDuration(track.duration_ms)}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {/* Header de reseñas con botón para escribir */}
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-theme-primary">
                Reseñas del álbum ({reviews.length})
              </h3>
              {isAuthenticated && (
                <button
                  onClick={() => setShowReviewForm(true)}
                  className="flex items-center space-x-2 py-2 px-4 bg-theme-accent text-white rounded-lg hover:bg-theme-accent/80 transition-colors"
                >
                  <Star className="w-4 h-4" />
                  <span>{hasUserReview ? 'Editar mi reseña' : 'Escribir reseña'}</span>
                </button>
              )}
            </div>

            {/* Lista de reseñas */}
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-theme-card rounded-2xl p-6 border border-theme">
                    {/* Header de la reseña */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-theme-accent to-theme-accent/60 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold text-theme-primary">
                            {review.user?.username || 'Usuario'}
                          </div>
                          <div className="text-sm text-theme-secondary">
                            {formatDate(review.created_at)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Calificación */}
                      <div className="flex items-center space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= (review.rating || 0)
                                ? 'text-yellow-400 fill-current'
                                : 'text-theme-muted'
                            }`}
                          />
                        ))}
                        <span className="ml-2 text-sm text-theme-secondary">
                          {review.rating}/5
                        </span>
                      </div>
                    </div>

                    {/* Título de la reseña */}
                    {review.title && (
                      <h4 className="text-lg font-semibold text-theme-primary mb-3">
                        {review.title}
                      </h4>
                    )}

                    {/* Contenido de la reseña */}
                    {review.content && (
                      <p className="text-theme-secondary leading-relaxed mb-4">
                        {review.content}
                      </p>
                    )}

                    {/* Acciones de la reseña */}
                    <div className="flex items-center space-x-4 pt-3 border-t border-theme">
                      <button className="flex items-center space-x-1 text-theme-muted hover:text-theme-accent transition-colors">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{review.likes || 0}</span>
                      </button>
                      <span className="text-theme-muted text-sm">
                        ¿Te resultó útil esta reseña?
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Estado vacío */
              <div className="text-center py-12">
                <Star className="w-16 h-16 text-theme-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-theme-primary mb-2">
                  Aún no hay reseñas
                </h3>
                <p className="text-theme-secondary mb-6">
                  Sé el primero en compartir tu opinión sobre este álbum
                </p>
                {isAuthenticated && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="flex items-center space-x-2 py-2 px-4 bg-theme-accent text-white rounded-lg hover:bg-theme-accent/80 transition-colors mx-auto"
                  >
                    <Star className="w-4 h-4" />
                    <span>Escribir primera reseña</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-theme-card rounded-2xl p-6 border border-theme text-center">
              <Album className="w-8 h-8 text-theme-accent mx-auto mb-3" />
              <div className="text-2xl font-bold text-theme-primary mb-1">{albumTracks.length}</div>
              <div className="text-theme-secondary text-sm">Canciones</div>
            </div>
            
            <div className="bg-theme-card rounded-2xl p-6 border border-theme text-center">
              <Clock className="w-8 h-8 text-theme-accent mx-auto mb-3" />
              <div className="text-2xl font-bold text-theme-primary mb-1">{formatDuration(getTotalDuration())}</div>
              <div className="text-theme-secondary text-sm">Duración</div>
            </div>
            
            <div className="bg-theme-card rounded-2xl p-6 border border-theme text-center">
              <Calendar className="w-8 h-8 text-theme-accent mx-auto mb-3" />
              <div className="text-2xl font-bold text-theme-primary mb-1">{albumData?.release_date?.substring(0, 4)}</div>
              <div className="text-theme-secondary text-sm">Año</div>
            </div>
            
            <div className="bg-theme-card rounded-2xl p-6 border border-theme text-center">
              <Star className="w-8 h-8 text-theme-accent mx-auto mb-3" />
              <div className="text-2xl font-bold text-theme-primary mb-1">{reviews.length}</div>
              <div className="text-theme-secondary text-sm">Reseñas</div>
            </div>
          </div>
        )}
      </div>

      {/* Modal para agregar a lista */}
      {/* {showAddToListModal && (
        <AddToListModal
          isOpen={showAddToListModal}
          onClose={() => setShowAddToListModal(false)}
          albumId={album?.id}
          albumData={albumData}
        />
      )} */}

      {/* Modal para escribir reseña */}
      {showReviewForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-theme-card rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-theme">
            {/* Header del modal */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-theme-primary">
                {hasUserReview ? 'Editar reseña' : 'Escribir reseña'}
              </h2>
              <button
                onClick={() => setShowReviewForm(false)}
                className="p-2 hover:bg-theme-card-hover rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-theme-muted" />
              </button>
            </div>

            {/* Información del álbum */}
            <div className="flex items-center space-x-4 mb-6 p-4 bg-theme-background rounded-xl">
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                {albumData?.images?.[0]?.url ? (
                  <Image
                    src={albumData.images[0].url}
                    alt={albumData.name}
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
              <div>
                <h3 className="font-semibold text-theme-primary break-words">{albumData?.name}</h3>
                <p className="text-theme-secondary break-words">{albumData?.artists[0]?.name}</p>
              </div>
            </div>

            {/* Formulario de reseña */}
            <form onSubmit={handleSubmitReview} className="space-y-6">
              {/* Calificación */}
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-3">
                  Calificación
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star 
                        className={`w-8 h-8 cursor-pointer transition-colors ${
                          star <= reviewRating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-theme-muted hover:text-yellow-300'
                        }`} 
                      />
                    </button>
                  ))}
                  {reviewRating > 0 && (
                    <span className="ml-3 text-theme-secondary">
                      {reviewRating}/5 estrellas
                    </span>
                  )}
                </div>
              </div>

              {/* Título */}
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Título (opcional)
                </label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="Resume tu experiencia con este álbum..."
                  className="w-full px-4 py-3 bg-theme-background border border-theme rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-transparent text-theme-primary placeholder-theme-muted"
                />
              </div>

              {/* Contenido */}
              <div>
                <label className="block text-sm font-medium text-theme-primary mb-2">
                  Reseña
                </label>
                <textarea
                  rows={6}
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  placeholder="Comparte tu opinión detallada sobre el álbum..."
                  className="w-full px-4 py-3 bg-theme-background border border-theme rounded-lg focus:ring-2 focus:ring-theme-accent focus:border-transparent text-theme-primary placeholder-theme-muted resize-none"
                />
              </div>

              {/* Acciones */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowReviewForm(false)}
                  disabled={submittingReview}
                  className="px-6 py-2 text-theme-secondary hover:text-theme-primary transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingReview || reviewRating === 0}
                  className="px-6 py-2 bg-theme-accent text-white rounded-lg hover:bg-theme-accent/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {submittingReview && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  <span>
                    {submittingReview 
                      ? 'Enviando...' 
                      : hasUserReview ? 'Actualizar reseña' : 'Publicar reseña'
                    }
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlbumDetailPage;
