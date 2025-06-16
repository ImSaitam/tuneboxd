'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Star, ArrowLeft, User, Calendar, ExternalLink, Heart, HeartOff, Clock, Info, X, Music, List } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import Link from 'next/link';
import AddToListModal from '../../../components/AddToListModal';

export default function AlbumPage() {
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const [album, setAlbum] = useState(null);
  const [albumData, setAlbumData] = useState(null); // Datos de Spotify
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isInListenList, setIsInListenList] = useState(false);
  const [listenListLoading, setListenListLoading] = useState(false);
  const [markingAsListened, setMarkingAsListened] = useState(false);
  const [showTracksModal, setShowTracksModal] = useState(false);
  const [albumTracks, setAlbumTracks] = useState([]);
  const [loadingTracks, setLoadingTracks] = useState(false);
  const [isTracksModalAnimating, setIsTracksModalAnimating] = useState(false);
  const [isReviewModalAnimating, setIsReviewModalAnimating] = useState(false);
  const [showAddToListModal, setShowAddToListModal] = useState(false);

  // Obtener el ID del álbum de los parámetros de URL
  const albumId = params.albumId;

  useEffect(() => {
    let mounted = true;
    
    const initializeAlbum = async () => {
      if (!albumId) return;
      
      try {
        // Primero obtener datos del álbum desde Spotify
        const spotifyResponse = await fetch(`/api/spotify/album/${albumId}`);
        
        if (!spotifyResponse.ok) {
          console.error('Error obteniendo álbum de Spotify');
          if (mounted) {
            setError('No se pudo obtener el álbum de Spotify');
            setLoading(false);
          }
          return;
        }
        
        const spotifyData = await spotifyResponse.json();
        
        if (!spotifyData.success) {
          console.error('Error en respuesta de Spotify:', spotifyData);
          if (mounted) {
            setError('Error al obtener datos del álbum');
            setLoading(false);
          }
          return;
        }
        
        if (!mounted) return;
        
        setAlbumData(spotifyData.album);
        
        // Crear/encontrar el álbum en nuestra base de datos
        const response = await fetch('/api/albums', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            album: {
              spotify_id: spotifyData.album.id,
              name: spotifyData.album.name,
              artist: spotifyData.album.artists[0]?.name,
              release_date: spotifyData.album.release_date,
              image_url: spotifyData.album.images[0]?.url,
              spotify_url: spotifyData.album.external_urls?.spotify
            }
          })
        });

        if (response.ok && mounted) {
          const result = await response.json();
          setAlbum(result.album);
          
          // Cargar estadísticas y reseñas del álbum
          await loadAlbumStats(result.album.id, mounted);
          
          // Verificar estado de lista de escucha si está autenticado
          if (isAuthenticated && result.album) {
            await checkListenListStatus(result.album.id, mounted);
            await checkUserReview(result.album.id, mounted);
          }
        } else if (!response.ok) {
          console.error('Error creando/obteniendo álbum en la base de datos');
          if (mounted) {
            setError('Error al procesar el álbum');
            setLoading(false);
          }
          return;
        }
        
        // Finalmente, establecer loading en false
        if (mounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error inicializando álbum:', error);
        if (mounted) {
          setError('Error al cargar el álbum');
          setLoading(false);
        }
      }
    };

    const checkListenListStatus = async (albumDbId, mounted) => {
      try {
        const response = await fetch('/api/listen-list', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        if (response.ok && mounted) {
          const result = await response.json();
          if (result.success) {
            const isInList = result.listenList.some(item => item.album_id === albumDbId);
            setIsInListenList(isInList);
          }
        }
      } catch (error) {
        console.error('Error checking listen list status:', error);
      }
    };

    const checkUserReview = async (albumDbId, mounted) => {
      try {
        const response = await fetch(`/api/user/stats?albumId=${albumDbId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        if (response.ok && mounted) {
          const result = await response.json();
          if (result.success && result.userReview) {
            setUserReview(result.userReview);
          }
        }
      } catch (error) {
        console.error('Error checking user review:', error);
      }
    };

    initializeAlbum();
    
    return () => {
      mounted = false;
    };
  }, [albumId, isAuthenticated]);

  const loadAlbumStats = async (albumDbId, mounted) => {
    try {
      const response = await fetch(`/api/albums/${albumDbId}`);
      if (response.ok && mounted) {
        const result = await response.json();
        if (result.success) {
          setStats(result.stats);
          setReviews(result.recent_reviews || []);
        }
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };

  const handleReviewSubmit = async (reviewData) => {
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
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
          ...reviewData
        })
      });

      const result = await response.json();
      if (result.success) {
        setUserReview(result.review);
        closeReviewModal();
        // Recargar estadísticas y reseñas
        if (album) {
          await loadAlbumStats(album.id, true);
        }
      } else {
        alert(result.message || 'Error al enviar reseña');
      }
    } catch (error) {
      console.error('Error enviando reseña:', error);
      alert('Error al enviar reseña');
    }
  };

  const handleListenListToggle = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para usar la lista de escucha');
      return;
    }

    if (!album) {
      alert('Error: álbum no encontrado');
      return;
    }

    setListenListLoading(true);
    
    try {
      if (isInListenList) {
        // Remover de la listen list usando el ID interno del álbum
        const response = await fetch(`/api/listen-list?albumId=${album.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        const result = await response.json();
        if (result.success) {
          setIsInListenList(false);
        } else {
          alert(result.message || 'Error al remover de la lista de escucha');
        }
      } else {
        // Añadir a la listen list
        const response = await fetch('/api/listen-list', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
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

        const result = await response.json();
        if (result.success) {
          setIsInListenList(true);
        } else {
          alert(result.message || 'Error al añadir a la lista de escucha');
        }
      }
    } catch (error) {
      console.error('Error con la lista de escucha:', error);
      alert('Error al actualizar la lista de escucha');
    } finally {
      setListenListLoading(false);
    }
  };

  const handleMarkAsListened = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para marcar álbumes como escuchados');
      return;
    }

    if (!albumData) {
      alert('Error: álbum no encontrado');
      return;
    }

    setMarkingAsListened(true);
    
    try {
      const response = await fetch('/api/listening-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
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

      const result = await response.json();
      if (result.success) {
        alert('¡Álbum marcado como escuchado!');
      } else {
        alert(result.message || 'Error al marcar como escuchado');
      }
    } catch (error) {
      console.error('Error marcando como escuchado:', error);
      alert('Error al marcar álbum como escuchado');
    } finally {
      setMarkingAsListened(false);
    }
  };

  // Funciones para el modal de canciones
  const handleShowTracks = async () => {
    setShowTracksModal(true);
    setIsTracksModalAnimating(true);
    setLoadingTracks(true);
    
    try {
      // Los datos del álbum ya incluyen las canciones
      if (albumData?.tracks?.items) {
        setAlbumTracks(albumData.tracks.items);
      } else {
        console.error('No se encontraron canciones en los datos del álbum');
        setAlbumTracks([]);
      }
    } catch (error) {
      console.error('Error cargando canciones del álbum:', error);
      setAlbumTracks([]);
    } finally {
      setLoadingTracks(false);
    }
  };

  const closeTracksModal = () => {
    setIsTracksModalAnimating(false);
    setTimeout(() => {
      setShowTracksModal(false);
      setAlbumTracks([]);
    }, 300); // Esperar a que termine la animación
  };

  const formatDuration = (durationMs) => {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // useEffect para animaciones de entrada de modales
  useEffect(() => {
    if (showTracksModal) {
      // Pequeño delay para que se vea la animación
      setTimeout(() => setIsTracksModalAnimating(true), 10);
    }
  }, [showTracksModal]);

  useEffect(() => {
    if (showReviewForm) {
      // Pequeño delay para que se vea la animación
      setTimeout(() => setIsReviewModalAnimating(true), 10);
    }
  }, [showReviewForm]);

  const closeReviewModal = () => {
    setIsReviewModalAnimating(false);
    setTimeout(() => {
      setShowReviewForm(false);
    }, 300); // Esperar a que termine la animación
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className={`h-8 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded w-1/3 mb-6`}></div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className={`h-80 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} rounded-lg`}></div>
              <div className="md:col-span-2">
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

  if (error || !albumData) {
    return (
      <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center`}>
        <div className={`text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          <h1 className="text-2xl font-bold mb-4">
            {error || 'Álbum no encontrado'}
          </h1>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} mb-4`}>
            {error ? 'Hubo un error al cargar el álbum.' : 'No se pudo encontrar el álbum solicitado.'}
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
          <h1 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Detalles del Álbum</h1>
        </div>

        {/* Album Info */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Album Cover */}
          <div className="flex flex-col items-center">
            <div className="relative group mb-4">
              <img
                src={albumData.images[0]?.url || '/placeholder-album.jpg'}
                alt={albumData.name}
                className="w-80 h-80 object-cover rounded-lg shadow-2xl group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:scale-105 transition-transform duration-300"></div>
            </div>
            
            {/* Ver Canciones Button */}
            <button
              onClick={handleShowTracks}
              className="w-full max-w-80 flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white shadow-lg"
            >
              <Info size={20} />
              Ver Canciones
            </button>
          </div>

          {/* Album Details */}
          <div className="md:col-span-2">
            <h2 className={`text-4xl font-bold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{albumData.name}</h2>
            <Link 
              href={`/artist/${albumData.artists[0]?.id}`}
              className={`text-2xl ${theme === 'dark' ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors mb-4 inline-block`}
            >
              {albumData.artists[0]?.name}
            </Link>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <Calendar size={20} className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'}`}>{albumData.release_date}</span>
              </div>
              <a
                href={albumData.external_urls?.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-500 hover:text-green-600 transition-colors"
              >
                <ExternalLink size={20} />
                <span>Abrir en Spotify</span>
              </a>
            </div>

            {/* Stats */}
            {stats && (
              <div className={`${theme === 'dark' ? 'bg-gray-800/50' : 'bg-white/80'} backdrop-blur-md rounded-lg p-6 mb-6 shadow-lg`}>
                <h4 className={`text-xl font-semibold mb-4 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Estadísticas</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-3xl font-bold text-yellow-500">
                      {stats.avg_rating > 0 ? stats.avg_rating : '--'}
                    </div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Rating promedio</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-500">{stats.total_reviews}</div>
                    <div className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Reseñas</div>
                  </div>
                </div>
              </div>
            )}

            {/* Review Actions */}
            <div className="space-y-4">
              {isAuthenticated ? (
                <div className="space-y-3">
                  {userReview ? (
                    <div className="space-y-3">
                      <div className={`${theme === 'dark' ? 'bg-green-500/20 border-green-500/30' : 'bg-green-100 border-green-300'} border rounded-lg p-4`}>
                        <p className={`${theme === 'dark' ? 'text-green-300' : 'text-green-700'} mb-2`}>Ya has reseñado este álbum</p>
                        <div className="flex items-center gap-2 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={20}
                              className={star <= userReview.rating ? 'text-yellow-500 fill-current' : `${theme === 'dark' ? 'text-gray-400' : 'text-gray-300'}`}
                            />
                          ))}
                        </div>
                        {userReview.title && (
                          <h4 className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold mb-2`}>{userReview.title}</h4>
                        )}
                        {userReview.content && (
                          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} text-sm`}>{userReview.content}</p>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setShowReviewForm(true);
                          setIsReviewModalAnimating(true);
                        }}
                        className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                      >
                        Editar Reseña
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setShowReviewForm(true);
                        setIsReviewModalAnimating(true);
                      }}
                      className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                    >
                      Escribir Reseña
                    </button>
                  )}
                  
                  {/* Listen List Button */}
                  <button
                    onClick={handleListenListToggle}
                    disabled={listenListLoading}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                      isInListenList
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white'
                    } disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed`}
                  >
                    {listenListLoading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : isInListenList ? (
                      <HeartOff size={20} />
                    ) : (
                      <Heart size={20} />
                    )}
                    {listenListLoading 
                      ? 'Actualizando...' 
                      : isInListenList 
                        ? 'Remover de Lista de Escucha' 
                        : 'Añadir a Lista de Escucha'
                    }
                  </button>
                  
                  {/* Mark as Listened Button */}
                  <button
                    onClick={handleMarkAsListened}
                    disabled={markingAsListened}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed"
                  >
                    {markingAsListened ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Clock size={20} />
                    )}
                    {markingAsListened ? 'Marcando...' : 'Marcar como Escuchado'}
                  </button>
                  
                  {/* Add to Custom List Button */}
                  <button
                    onClick={() => setShowAddToListModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white"
                  >
                    <List size={20} />
                    Agregar a Lista
                  </button>
                </div>
              ) : (
                <div className={`${theme === 'dark' ? 'bg-blue-500/20 border-blue-500/30' : 'bg-blue-100 border-blue-300'} border rounded-lg p-4`}>
                  <p className={`${theme === 'dark' ? 'text-blue-300' : 'text-blue-700'} text-center`}>
                    <Link href="/login" className={`underline ${theme === 'dark' ? 'hover:text-blue-200' : 'hover:text-blue-600'}`}>
                      Inicia sesión
                    </Link> para escribir reseñas y añadir álbumes a tu lista de escucha
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Review Form Modal */}
        {showReviewForm && (
          <div 
            className={`fixed inset-0 bg-black/50 modal-backdrop flex items-center justify-center z-50 p-4 ${
              isReviewModalAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
            }`}
            onClick={closeReviewModal}
          >
            <div 
              className={`${
                isReviewModalAnimating ? 'modal-content-enter' : 'modal-content-exit'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <ReviewForm
                onSubmit={handleReviewSubmit}
                onCancel={closeReviewModal}
                albumName={albumData.name}
                artistName={albumData.artists[0]?.name}
                theme={theme}
              />
            </div>
          </div>
        )}

        {/* Reviews Section */}
        <div className={`${theme === 'dark' ? 'bg-white/10' : 'bg-white/80'} backdrop-blur-md rounded-lg p-6`}>
          <h3 className={`text-2xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'} mb-6`}>Reseñas Recientes</h3>
          
          {reviews && reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} theme={theme} />
              ))}
            </div>
          ) : (
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-center py-8`}>
              No hay reseñas aún. ¡Sé el primero en escribir una!
            </p>
          )}
        </div>

        {/* Tracks Modal */}
        {showTracksModal && (
          <div 
            className={`fixed inset-0 bg-black/50 modal-backdrop flex items-center justify-center z-50 p-4 ${
              isTracksModalAnimating ? 'modal-backdrop-enter' : 'modal-backdrop-exit'
            }`}
            onClick={closeTracksModal}
          >
            <div 
              className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-2xl ${
                isTracksModalAnimating ? 'modal-scale-enter' : 'modal-scale-exit'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header del modal */}
              <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center gap-4">
                  <img
                    src={albumData.images[0]?.url || '/placeholder-album.jpg'}
                    alt={albumData.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{albumData.name}</h3>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      {albumData.artists[0]?.name} • {albumData.release_date?.split('-')[0]} • {albumData.total_tracks} canciones
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeTracksModal}
                  className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors p-2`}
                >
                  <X size={24} />
                </button>
              </div>

              {/* Contenido del modal */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {loadingTracks ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className={`w-12 h-12 border-4 ${theme === 'dark' ? 'border-white/30 border-t-white' : 'border-gray-300 border-t-gray-600'} rounded-full animate-spin mb-4`}></div>
                    <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>Cargando canciones...</p>
                  </div>
                ) : albumTracks.length > 0 ? (
                  <div className="space-y-2">
                    {albumTracks.map((track, index) => (
                      <div key={track.id} className={`grid grid-cols-12 items-center gap-4 p-3 rounded-lg ${theme === 'dark' ? 'hover:bg-white/10' : 'hover:bg-gray-100'} transition-colors`}>
                        <div className="col-span-1 text-center">
                          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm font-medium`}>{index + 1}</span>
                        </div>
                        <div className="col-span-8 flex items-center gap-3">
                          <div>
                            <h4 className={`${theme === 'dark' ? 'text-white hover:text-blue-300' : 'text-gray-900 hover:text-blue-600'} font-medium transition-colors`}>
                              {track.name}
                            </h4>
                            {track.explicit && (
                              <span className={`inline-block ${theme === 'dark' ? 'bg-gray-600 text-gray-300' : 'bg-gray-200 text-gray-700'} text-xs px-1.5 py-0.5 rounded mt-1`}>
                                Explícito
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="col-span-3 flex items-center justify-end">
                          <span className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-sm`}>
                            {formatDuration(track.duration_ms)}
                          </span>
                        </div>
                      </div>
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
              <div className={`flex items-center justify-between p-6 border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                  {albumTracks.length > 0 && `${albumTracks.length} canciones`}
                </div>
                <button
                  onClick={closeTracksModal}
                  className={`px-4 py-2 ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} ${theme === 'dark' ? 'text-white' : 'text-gray-900'} rounded-lg font-medium transition-colors`}
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Add to List Modal */}
        {showAddToListModal && albumData && (
          <AddToListModal
            album={{
              spotify_id: albumData.id,
              name: albumData.name,
              artist: albumData.artists[0]?.name,
              release_date: albumData.release_date,
              image_url: albumData.images[0]?.url,
              spotify_url: albumData.external_urls?.spotify
            }}
            isOpen={showAddToListModal}
            onClose={() => setShowAddToListModal(false)}
          />
        )}
      </div>
    </div>
  );
}

// Componente ReviewForm
function ReviewForm({ onSubmit, onCancel, albumName, artistName, theme }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }

    setSubmitting(true);
    
    try {
      await onSubmit({
        rating,
        title: title.trim(),
        content: content.trim()
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-2xl w-full max-w-lg border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} shadow-2xl`}>
      {/* Header del modal */}
      <div className={`flex items-center justify-between p-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
        <div>
          <h3 className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Escribir Reseña</h3>
          <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} text-sm`}>
            &quot;{albumName}&quot; - {artistName}
          </p>
        </div>
        <button
          onClick={onCancel}
          className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'} transition-colors p-2`}
        >
          <X size={24} />
        </button>
      </div>

      {/* Contenido del modal */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div>
            <label className={`block ${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold mb-3`}>Calificación *</label>
            <div className="flex gap-2 justify-center">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="transition-all duration-200 hover:scale-110"
                >
                  <Star
                    size={40}
                    className={star <= rating ? 'text-yellow-400 fill-current' : `${theme === 'dark' ? 'text-gray-400 hover:text-yellow-300' : 'text-gray-300 hover:text-yellow-400'}`}
                  />
                </button>
              ))}
            </div>
            <p className={`text-center ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm mt-2`}>
              {rating === 0 ? 'Selecciona una calificación' : `${rating} de 5 estrellas`}
            </p>
          </div>

          {/* Title */}
          <div>
            <label className={`block ${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold mb-2`}>Título (opcional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-4 py-3 ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all`}
              placeholder="Un título para tu reseña..."
              maxLength={100}
            />
            <div className={`text-right ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs mt-1`}>
              {title.length}/100
            </div>
          </div>

          {/* Content */}
          <div>
            <label className={`block ${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold mb-2`}>Reseña (opcional)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className={`w-full px-4 py-3 ${theme === 'dark' ? 'bg-white/10 border-white/20 text-white placeholder-gray-400' : 'bg-gray-100 border-gray-300 text-gray-900 placeholder-gray-500'} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all`}
              placeholder="Comparte tus pensamientos sobre este álbum..."
              rows={4}
              maxLength={1000}
            />
            <div className={`text-right ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-xs mt-1`}>
              {content.length}/1000
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className={`flex-1 px-6 py-3 ${theme === 'dark' ? 'bg-gray-600 hover:bg-gray-700' : 'bg-gray-200 hover:bg-gray-300'} ${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold rounded-lg transition-all duration-300`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={rating === 0 || submitting}
              className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:cursor-not-allowed transform hover:scale-105 disabled:hover:scale-100"
            >
              {submitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Enviando...
                </div>
              ) : (
                'Publicar Reseña'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente ReviewCard
function ReviewCard({ review, theme }) {
  return (
    <div className={`border ${theme === 'dark' ? 'border-white/20' : 'border-gray-200'} rounded-lg p-4`}>
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <User size={20} className="text-white" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold`}>{review.username}</span>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={16}
                  className={star <= review.rating ? 'text-yellow-400 fill-current' : `${theme === 'dark' ? 'text-gray-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
          </div>
          
          {review.title && (
            <h4 className={`${theme === 'dark' ? 'text-white' : 'text-gray-900'} font-semibold mb-2`}>{review.title}</h4>
          )}
          
          {review.content && (
            <p className={`${theme === 'dark' ? 'text-gray-300' : 'text-gray-700'} mb-2`}>{review.content}</p>
          )}
          
          <div className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            {new Date(review.created_at).toLocaleDateString('es')}
          </div>
        </div>
      </div>
    </div>
  );
}
