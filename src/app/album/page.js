'use client';

import { useState, useEffect, useRef, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Star, ArrowLeft, User, Calendar, ExternalLink, Heart, HeartOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useGlobalModal } from '../../components/ModalContext';
import Link from 'next/link';

function AlbumPageContent() {
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();
  const { alert, confirm, success, error: showError, notify, notifyError } = useGlobalModal();
  const [album, setAlbum] = useState(null);
  const [stats, setStats] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userReview, setUserReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [isInListenList, setIsInListenList] = useState(false);
  const [listenListLoading, setListenListLoading] = useState(false);
  const hasLoadedRef = useRef(false);

  // Obtener datos del álbum de los parámetros de URL - memorizado para evitar re-creación
  const albumData = useMemo(() => {
    const data = searchParams.get('data');
    return data ? JSON.parse(decodeURIComponent(data)) : null;
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;
    
    const initializeAlbum = async () => {
      if (!albumData?.id || hasLoadedRef.current) return;
      
      hasLoadedRef.current = true;
      
      if (!mounted) return;
      
      try {
        const response = await fetch('/api/albums', {
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
        }
      } catch (error) {
        console.error('Error cargando datos del álbum:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Función para cargar estadísticas y reseñas
    const loadAlbumStats = async (albumId, mounted) => {
      try {
        const response = await fetch(`/api/albums/${albumId}`);
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

    // Función para verificar estado de lista de escucha
    const checkListenListStatus = async (albumId, mounted) => {
      try {
        const listenListResponse = await fetch('/api/listen-list', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        if (listenListResponse.ok && mounted) {
          const listenListResult = await listenListResponse.json();
          const isInList = listenListResult.listenList.some(item => item.album_id === albumId);
          setIsInListenList(isInList);
        }
      } catch (error) {
        console.error('Error checking listen list status:', error);
      }
    };

    // Función para verificar si el usuario ya reseñó este álbum
    const checkUserReview = async (albumId, mounted) => {
      try {
        const response = await fetch(`/api/user/stats?albumId=${albumId}`, {
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
  }, [albumData?.id, isAuthenticated]);

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
        setShowReviewForm(false);
        
        // Recargar estadísticas y reseñas después de crear una reseña
        if (album?.id) {
          await loadAlbumStats(album.id);
        }
      } else {
        showError(result.message || 'Error al crear la reseña');
      }
    } catch (error) {
      console.error('Error creando reseña:', error);
      showError('Error al crear la reseña');
    }
  };

  // Función separada para recargar estadísticas (usada también después de crear reseña)
  const loadAlbumStats = async (albumId) => {
    try {
      const response = await fetch(`/api/albums/${albumId}`);
      if (response.ok) {
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

  const handleListenListToggle = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para usar la lista de escucha');
      return;
    }

    if (!album) {
      showError('Error: álbum no encontrado');
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
          notify('Removido de la lista de escucha');
        } else {
          notifyError(result.message || 'Error al remover de la lista de escucha');
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
          notify('Añadido a la lista de escucha');
        } else {
          notifyError(result.message || 'Error al añadir a la lista de escucha');
        }
      }
    } catch (error) {
      console.error('Error con la lista de escucha:', error);
      notifyError('Error al actualizar la lista de escucha');
    } finally {
      setListenListLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-1/3 mb-6"></div>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="h-80 bg-gray-700 rounded-lg"></div>
              <div className="md:col-span-2">
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

  if (!albumData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Álbum no encontrado</h1>
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
          <h1 className="text-2xl font-bold text-white">Detalles del Álbum</h1>
        </div>

        {/* Album Info */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Album Cover */}
          <div className="flex justify-center">
            <div className="relative group">
              <img
                src={albumData.images[0]?.url || '/placeholder-album.jpg'}
                alt={albumData.name}
                className="w-80 h-80 object-cover rounded-lg shadow-2xl group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          </div>

          {/* Album Details */}
          <div className="md:col-span-2 text-white">
            <h2 className="text-4xl font-bold mb-2">{albumData.name}</h2>
            <h3 className="text-2xl text-gray-300 mb-4">{albumData.artists[0]?.name}</h3>
            
            <div className="flex items-center gap-6 mb-6">
              <div className="flex items-center gap-2">
                <Calendar size={20} className="text-gray-400" />
                <span className="text-gray-300">{albumData.release_date}</span>
              </div>
              <a
                href={albumData.external_urls?.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors"
              >
                <ExternalLink size={20} />
                <span>Abrir en Spotify</span>
              </a>
            </div>

            {/* Rating promedio destacado */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center bg-yellow-400/20 border border-yellow-400/40 rounded-xl px-5 py-2 shadow-lg">
                <Star className="w-7 h-7 text-yellow-400 mr-2" />
                <span className="text-3xl font-bold text-yellow-300">
                  {stats && stats.avg_rating > 0 ? Number(stats.avg_rating).toFixed(2) : '--'}
                </span>
                <span className="ml-2 text-lg text-yellow-200 font-semibold">/ 5</span>
              </div>
              <span className="text-white/80 text-base">Rating promedio</span>
              {(!stats || !stats.avg_rating || Number(stats.avg_rating) === 0) && (
                <span className="ml-4 flex items-center gap-2 text-yellow-200 bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-3 py-1 animate-pulse">
                  <Star className="w-4 h-4 text-yellow-300" />
                  ¡Sé el primero en calificar este álbum!
                </span>
              )}
            </div>
            {/* Fin rating promedio destacado */}

            {/* Stats */}
            {stats && (
              <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-6">
                <h4 className="text-xl font-semibold mb-4">Estadísticas</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-3xl font-bold text-yellow-400">
                      {stats.avg_rating > 0 ? stats.avg_rating : '--'}
                    </div>
                    <div className="text-sm text-gray-300">Rating promedio</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-blue-400">{stats.total_reviews}</div>
                    <div className="text-sm text-gray-300">Reseñas</div>
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
                      <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4">
                        <p className="text-green-300 mb-2">Ya has reseñado este álbum</p>
                        <div className="flex items-center gap-2 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              size={20}
                              className={star <= userReview.rating ? 'text-yellow-400 fill-current' : 'text-gray-400'}
                            />
                          ))}
                        </div>
                        {userReview.title && (
                          <h4 className="text-white font-semibold mb-2">{userReview.title}</h4>
                        )}
                        {userReview.content && (
                          <p className="text-gray-300 text-sm">{userReview.content}</p>
                        )}
                      </div>
                      <button
                        onClick={() => setShowReviewForm(true)}
                        className="w-full bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
                      >
                        Editar Reseña
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowReviewForm(true)}
                      className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
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
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white'
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
                </div>
              ) : (
                <div className="bg-blue-500/20 border border-blue-500/30 rounded-lg p-4">
                  <p className="text-blue-300 mb-2">Inicia sesión para escribir una reseña</p>
                  <Link href="/login" className="text-blue-400 hover:text-blue-300 underline">
                    Iniciar Sesión
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Review Form Modal */}
        {showReviewForm && (
          <ReviewForm
            onSubmit={handleReviewSubmit}
            onCancel={() => setShowReviewForm(false)}
            albumName={albumData.name}
            artistName={albumData.artists[0]?.name}
          />
        )}

        {/* Reviews Section */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6">
          <h3 className="text-2xl font-bold text-white mb-6">Reseñas</h3>
          {reviews.length > 0 ? (
            <div className="space-y-6">
              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          ) : (
            <p className="text-gray-300 text-center py-8">
              No hay reseñas aún. ¡Sé el primero en escribir una!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para el formulario de reseña
function ReviewForm({ onSubmit, onCancel, albumName, artistName }) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [hoveredStar, setHoveredStar] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert('Por favor selecciona una calificación');
      return;
    }
    onSubmit({ rating, title, content });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-purple-800 to-blue-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-bold text-white mb-4">
          Reseñar &quot;{albumName}&quot; de {artistName}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Rating */}
          <div>
            <label className="block text-white font-medium mb-2">Calificación</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  onMouseLeave={() => setHoveredStar(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={
                      star <= (hoveredStar || rating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-400'
                    }
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-white font-medium mb-2">Título (opcional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Un título para tu reseña..."
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-white font-medium mb-2">Reseña (opcional)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Comparte tus pensamientos sobre este álbum..."
              rows={4}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
            >
              Publicar Reseña
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente para mostrar una reseña
function ReviewCard({ review }) {
  return (
    <div className="bg-white/5 rounded-lg p-4 border border-white/10">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <User size={20} className="text-gray-400" />
          <span className="text-white font-medium">{review.username}</span>
        </div>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={16}
              className={
                star <= review.rating
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-400'
              }
            />
          ))}
        </div>
      </div>
      
      {review.title && (
        <h4 className="text-white font-semibold mb-2">{review.title}</h4>
      )}
      
      {review.content && (
        <p className="text-gray-300 mb-3">{review.content}</p>
      )}
      
      <div className="text-sm text-gray-400">
        {new Date(review.created_at).toLocaleDateString()}
      </div>
    </div>
  );
}

export default function AlbumPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    }>
      <AlbumPageContent />
    </Suspense>
  );
}
