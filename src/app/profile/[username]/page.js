"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { User, Star, Calendar, TrendingUp, BarChart3, BookOpen, ArrowLeft, Loader2, UserCheck, UserPlus } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';

const UserProfilePage = () => {
  const params = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('reviews');
  const [profileUser, setProfileUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);

  const username = params.username;
  
  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener datos del usuario por username
      const userResponse = await fetch(`/api/user/profile/${username}`);
      if (!userResponse.ok) {
        if (userResponse.status === 404) {
          setError('Usuario no encontrado');
          return;
        }
        throw new Error('Error cargando perfil del usuario');
      }
      
      const userData = await userResponse.json();
      setProfileUser(userData.user);

      // Obtener estadísticas del usuario
      const statsResponse = await fetch(`/api/user/stats?userId=${userData.user.id}`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setUserStats(statsData.stats);
      }

      // Obtener reseñas del usuario
      const reviewsResponse = await fetch(`/api/user/${userData.user.id}/reviews`);
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        setUserReviews(reviewsData.reviews || []);
      }

      // Si el usuario actual está autenticado y no es su propio perfil, verificar si lo sigue
      const isOwnProfile = currentUser?.username === username;
      if (isAuthenticated && !isOwnProfile) {
        // TODO: Implementar lógica de seguimiento
        setIsFollowing(false);
      }

    } catch (error) {
      console.error('Error cargando perfil del usuario:', error);
      setError('Error cargando los datos del perfil');
    } finally {
      setLoading(false);
    }
  }, [username, isAuthenticated, currentUser?.username]);

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    if (username) {
      fetchUserProfile();
    }
  }, [username, fetchUserProfile]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated) return;
    
    try {
      // TODO: Implementar lógica de seguimiento/dejar de seguir
      const action = isFollowing ? 'unfollow' : 'follow';
      const response = await fetch(`/api/user/${profileUser.id}/${action}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        setIsFollowing(!isFollowing);
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
        }`}
      />
    ));
  };

  const StatCard = ({ icon: Icon, title, value, description, gradient }) => (
    <div className={`bg-gradient-to-br ${gradient} p-6 rounded-2xl text-white shadow-lg transform hover:scale-105 transition-all duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className="w-8 h-8 opacity-80" />
        <div className="text-right">
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm opacity-90">{title}</div>
        </div>
      </div>
      <div className="text-sm opacity-80">{description}</div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
          <p className="text-white text-lg">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">{error}</h1>
          <p className="text-gray-300 mb-6">El usuario que buscas no existe o no se pudo cargar su perfil.</p>
          <div className="space-x-4">
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al inicio
            </Link>
            <button 
              onClick={fetchUserProfile}
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-white hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al inicio</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-white" />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-white mb-2">@{profileUser.username}</h1>
              <p className="text-blue-200 mb-2">{profileUser.email}</p>
              <div className="flex items-center space-x-2 text-gray-300">
                <Calendar className="w-4 h-4" />
                <span>Miembro desde {userStats?.memberSince ? new Date(userStats.memberSince).toLocaleDateString('es') : 'N/A'}</span>
              </div>
            </div>

            {/* Quick Stats and Actions */}
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userStats?.totalReviews || 0}</div>
                  <div className="text-sm text-gray-300">Reseñas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">{userStats?.averageRating || '0.0'}</div>
                  <div className="text-sm text-gray-300">Promedio</div>
                </div>
              </div>

              {/* Follow Button (only if not own profile and user is authenticated) */}
              {!isOwnProfile && isAuthenticated && (
                <button
                  onClick={handleFollowToggle}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    isFollowing
                      ? 'bg-gray-600 hover:bg-gray-700 text-white'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>Siguiendo</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4" />
                      <span>Seguir</span>
                    </>
                  )}
                </button>
              )}

              {/* Edit Profile Button (only for own profile) */}
              {isOwnProfile && (
                <Link
                  href="/profile/edit"
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-all duration-200"
                >
                  <User className="w-4 h-4" />
                  <span>Editar Perfil</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'reviews'
                ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-5 h-5 inline mr-2" />
            Reseñas
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'stats'
                ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-5 h-5 inline mr-2" />
            Estadísticas
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {activeTab === 'reviews' && (
          <div className="space-y-6">
            {userReviews.length > 0 ? (
              userReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
                >
                  <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
                    <img
                      src={review.image_url}
                      alt={review.album_name}
                      className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-white">{review.album_name}</h3>
                          <p className="text-gray-300">{review.artist}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      
                      {review.title && (
                        <h4 className="text-lg font-semibold text-blue-200 mb-2">{review.title}</h4>
                      )}
                      {review.content && (
                        <p className="text-gray-300 leading-relaxed">{review.content}</p>
                      )}
                      
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-gray-400">
                          {new Date(review.created_at).toLocaleDateString('es')}
                        </span>
                        {isOwnProfile && (
                          <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
                            Editar reseña
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {isOwnProfile ? 'No has escrito reseñas aún' : `${profileUser.username} no ha escrito reseñas aún`}
                </h3>
                {isOwnProfile && (
                  <>
                    <p className="text-gray-400 mb-6">¡Comienza escribiendo tu primera reseña!</p>
                    <Link 
                      href="/"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                    >
                      Explorar música
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && userStats && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={BookOpen}
                title="Total Reseñas"
                value={userStats.totalReviews}
                description="Álbumes reseñados"
                gradient="from-blue-500 to-blue-700"
              />
              <StatCard
                icon={Star}
                title="Promedio"
                value={parseFloat(userStats.averageRating).toFixed(1)}
                description="Puntuación media"
                gradient="from-yellow-500 to-orange-600"
              />
              <StatCard
                icon={TrendingUp}
                title="Este mes"
                value={userStats.recentActivity || 0}
                description="Reseñas recientes"
                gradient="from-green-500 to-emerald-600"
              />
              <StatCard
                icon={Calendar}
                title="Miembro desde"
                value={userStats.memberSince ? new Date(userStats.memberSince).getFullYear() : 'N/A'}
                description="Años en la plataforma"
                gradient="from-purple-500 to-pink-600"
              />
            </div>

            {/* Monthly Activity */}
            {userStats.monthlyStats && userStats.monthlyStats.length > 0 && (
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <h3 className="text-xl font-bold text-white mb-6">Actividad Mensual</h3>
                <div className="space-y-4">
                  {userStats.monthlyStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-300">{stat.month}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-white font-medium">{stat.reviews} reseñas</span>
                        <span className="text-yellow-400">★ {stat.avg_rating.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Genres - Placeholder */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-6">Géneros Favoritos</h3>
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Funcionalidad en desarrollo</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfilePage;
