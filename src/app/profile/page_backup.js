'use client';

import { useState, useEffect, useCallback } from 'react';
import { Star, Calendar, Music, ArrowLeft, Edit3, Trash2, BarChart3, Heart, Clock, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

export default function ProfilePage() {
  const [userReviews, setUserReviews] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('reviews');
  const { user, isAuthenticated } = useAuth();

  const loadUserData = useCallback(async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setLoading(true);
      // Cargar reseñas del usuario y estadísticas en paralelo
      const [reviewsResponse, statsResponse] = await Promise.all([
        fetch(`/api/reviews?type=user&userId=${user.id}&limit=50`),
        fetch(`/api/user/stats?userId=${user.id}`)
      ]);
      
      const reviewsData = await reviewsResponse.json();
      const statsData = statsResponse.ok ? await statsResponse.json() : null;
      
      if (reviewsData.success) {
        setUserReviews(reviewsData.reviews);
      } else {
        setError(reviewsData.message);
      }

      if (statsData?.success) {
        setUserStats(statsData.stats);
      }
    } catch (error) {
      console.error('Error cargando datos del usuario:', error);
      setError('Error al cargar los datos del perfil');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    loadUserData();
  }, [loadUserData]);

  const handleDeleteReview = async (reviewId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reseña?')) {
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setUserReviews(prev => prev.filter(review => review.id !== reviewId));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error eliminando reseña:', error);
      alert('Error al eliminar la reseña');
    }
  };

  const handleAlbumClick = (review) => {
    const albumData = {
      id: review.spotify_id,
      name: review.album_name,
      artists: [{ name: review.artist }],
      release_date: review.release_date || '',
      images: [{ url: review.image_url }],
      external_urls: { spotify: review.spotify_url || '#' }
    };
    
    const encodedData = encodeURIComponent(JSON.stringify(albumData));
    window.location.href = `/album?data=${encodedData}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Acceso Requerido</h1>
          <p className="text-gray-300 mb-6">Necesitas iniciar sesión para ver tu perfil</p>
          <Link 
            href="/login"
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p>Cargando tu perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <Link 
              href="/"
              className="flex items-center text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al inicio
            </Link>
            <div className="text-2xl font-bold bg-gradient-to-r from-red-400 to-teal-400 bg-clip-text text-transparent">
              Tuneboxd
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 mb-8 border border-white/20">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="w-32 h-32 bg-gradient-to-br from-red-400 to-teal-400 rounded-full flex items-center justify-center text-4xl font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            
            {/* Profile Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold mb-2">{user?.username}</h1>
              <p className="text-white/70 text-lg mb-4">{user?.email}</p>
              
              {userStats && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-teal-400">{userStats.totalReviews}</div>
                    <div className="text-sm text-white/70">Reseñas</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-yellow-400">{userStats.averageRating}</div>
                    <div className="text-sm text-white/70">Promedio</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-400">{userStats.recentActivity}</div>
                    <div className="text-sm text-white/70">Este mes</div>
                  </div>
                  <div className="bg-white/10 rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400">
                      {userStats.memberSince ? new Date(userStats.memberSince).getFullYear() : '2024'}
                    </div>
                    <div className="text-sm text-white/70">Miembro desde</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/10 rounded-2xl p-2 mb-8">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 ${
              activeTab === 'reviews'
                ? 'bg-gradient-to-r from-red-400 to-teal-400 text-white font-semibold'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <Music className="w-5 h-5 inline mr-2" />
            Mis Reseñas ({userReviews.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`flex-1 py-3 px-6 rounded-xl transition-all duration-300 ${
              activeTab === 'stats'
                ? 'bg-gradient-to-r from-red-400 to-teal-400 text-white font-semibold'
                : 'text-white/70 hover:text-white hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            Estadísticas
          </button>
        </div>

        {/* Content */}
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200">
                {error}
              </div>
            )}
            
            {userReviews.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No hay reseñas aún</h3>
                <p className="text-white/70 mb-6">¡Empieza a reseñar tu música favorita!</p>
                <Link
                  href="/"
                  className="bg-gradient-to-r from-red-400 to-teal-400 text-white px-6 py-3 rounded-full font-semibold hover:-translate-y-1 transition-all duration-300"
                >
                  Buscar Música
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userReviews.map((review) => (
                  <ReviewCard 
                    key={review.id} 
                    review={review} 
                    onDelete={() => handleDeleteReview(review.id)}
                    onAlbumClick={() => handleAlbumClick(review)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-8">
            {userStats ? (
              <>
                {/* Top Genres */}
                {userStats.topGenres && userStats.topGenres.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                    <h3 className="text-2xl font-bold mb-6 flex items-center">
                      <TrendingUp className="w-6 h-6 mr-2 text-teal-400" />
                      Géneros Favoritos
                    </h3>
                    <div className="space-y-4">
                      {userStats.topGenres.map((genre, index) => (
                        <div key={genre.genre} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-red-400 to-teal-400 rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <span className="font-semibold">{genre.genre}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-32 bg-white/20 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-red-400 to-teal-400 h-2 rounded-full"
                                style={{ width: `${(genre.count / userStats.topGenres[0].count) * 100}%` }}
                              />
                            </div>
                            <span className="text-white/70 text-sm">{genre.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Monthly Activity */}
                {userStats.monthlyStats && userStats.monthlyStats.length > 0 && (
                  <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20">
                    <h3 className="text-2xl font-bold mb-6 flex items-center">
                      <Calendar className="w-6 h-6 mr-2 text-purple-400" />
                      Actividad Mensual
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userStats.monthlyStats.map((month) => (
                        <div key={month.month} className="bg-white/10 rounded-xl p-4">
                          <div className="text-lg font-semibold mb-2">
                            {new Date(month.month + '-01').toLocaleDateString('es-ES', { 
                              year: 'numeric', 
                              month: 'long' 
                            })}
                          </div>
                          <div className="flex justify-between text-sm text-white/70">
                            <span>{month.reviews} reseñas</span>
                            <span>★ {parseFloat(month.avg_rating || 0).toFixed(1)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-white/30 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Estadísticas no disponibles</h3>
                <p className="text-white/70">Escribe algunas reseñas para ver tus estadísticas</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="bg-white/10 rounded-lg p-6">
              <div className="h-20 bg-gray-700 rounded"></div>
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/10 rounded-lg p-6">
                <div className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-lg"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const averageRating = userReviews.length > 0 
    ? (userReviews.reduce((acc, review) => acc + review.rating, 0) / userReviews.length).toFixed(1)
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/" className="text-white hover:text-gray-300 transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
            <p className="text-gray-300 mt-1">Gestiona tus reseñas y actividad musical</p>
          </div>
        </div>

        {/* User Stats */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md border border-white/20 rounded-lg p-6 mb-8">
          <div className="flex items-center gap-6 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
              <span className="text-3xl font-bold text-white">
                {user.username.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user.username}</h2>
              <p className="text-gray-300">{user.email}</p>
              <p className="text-gray-400 text-sm">
                Miembro desde {new Date(user.created_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long'
                })}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{userReviews.length}</div>
              <div className="text-gray-300">Reseñas Escritas</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{averageRating}</div>
              <div className="text-gray-300">Rating Promedio</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">
                {new Set(userReviews.map(r => r.album_id)).size}
              </div>
              <div className="text-gray-300">Álbumes Reseñados</div>
            </div>
          </div>
        </div>

        {/* My Reviews */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Mis Reseñas</h3>
            <Link 
              href="/"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 text-sm"
            >
              Escribir Nueva Reseña
            </Link>
          </div>

          {error ? (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 text-center">
              <p className="text-red-300">{error}</p>
              <button
                onClick={loadUserReviews}
                className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : userReviews.length > 0 ? (
            <div className="space-y-4">
              {userReviews.map((review) => (
                <UserReviewCard 
                  key={review.id} 
                  review={review} 
                  onAlbumClick={handleAlbumClick}
                  onDelete={handleDeleteReview}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Music size={64} className="text-gray-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">Aún no has escrito reseñas</h4>
              <p className="text-gray-300 mb-6">¡Empieza a compartir tus opiniones sobre la música que amas!</p>
              <Link 
                href="/"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Buscar Álbumes
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componente para cada reseña del usuario
function UserReviewCard({ review, onAlbumClick, onDelete }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
      <div className="flex gap-4">
        {/* Album Cover */}
        <div 
          className="w-16 h-16 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 flex-shrink-0"
          onClick={() => onAlbumClick(review)}
        >
          {review.image_url ? (
            <img
              src={review.image_url}
              alt={review.album_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
          )}
        </div>

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div 
              className="cursor-pointer hover:text-blue-300 transition-colors min-w-0 flex-1"
              onClick={() => onAlbumClick(review)}
            >
              <h4 className="text-white font-semibold truncate">{review.album_name}</h4>
              <p className="text-gray-300 text-sm">{review.artist}</p>
            </div>
            
            <div className="flex items-center gap-2 ml-4">
              {/* Rating */}
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
              
              {/* Actions */}
              <button
                onClick={() => onDelete(review.id)}
                className="text-red-400 hover:text-red-300 transition-colors p-1"
                title="Eliminar reseña"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {review.title && (
            <h5 className="text-white font-medium mb-1">{review.title}</h5>
          )}

          {review.content && (
            <p className="text-gray-300 text-sm leading-relaxed mb-2 line-clamp-2">
              {review.content}
            </p>
          )}

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar size={12} />
            <span>{formatDate(review.created_at)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
