'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Users, Star, Music, Heart, ArrowLeft, Loader2, User, 
  Calendar, Plus, Search, Clock, TrendingUp, BookOpen,
  UserPlus, UserCheck, RefreshCw
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

const SocialPage = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { success, error } = useNotifications();
  
  // Estados principales
  const [activities, setActivities] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');
  const [refreshing, setRefreshing] = useState(false);
  
  // Estados para búsqueda de usuarios
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    console.log('Social page: Auth status changed', { isAuthenticated, authLoading, user: user?.username });
    
    if (isAuthenticated && !authLoading) {
      fetchSocialData();
    }
  }, [isAuthenticated, authLoading, user?.username]);

  const fetchSocialData = async () => {
    try {
      setLoading(true);
      
      // Obtener actividad del timeline social
      const activityResponse = await fetch('/api/social/activity', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setActivities(activityData.activities || []);
      }

      // Obtener usuarios seguidos
      const followingResponse = await fetch('/api/users/following', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (followingResponse.ok) {
        const followingData = await followingResponse.json();
        setFollowedUsers(followingData.users || []);
      }

    } catch (error) {
      console.error('Error cargando datos sociales:', error);
      error('Error cargando el timeline social');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSocialData();
    setRefreshing(false);
    success('Timeline actualizado');
  };

  const handleUnfollowUser = async (userId) => {
    try {
      const response = await fetch(`/api/users/follow?user_id=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        setFollowedUsers(prev => prev.filter(user => user.id !== userId));
        setActivities(prev => prev.filter(activity => activity.user_id !== userId));
        success('Dejaste de seguir al usuario');
      } else {
        const errorData = await response.json();
        error(errorData.message || 'Error al dejar de seguir');
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      error('Error al dejar de seguir al usuario');
    }
  };

  const handleSearchUsers = useCallback(async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(searchQuery)}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery]);

  // Búsqueda automática con debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        handleSearchUsers();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, handleSearchUsers]);

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Hace unos minutos';
    if (diffInHours < 24) return `Hace ${diffInHours}h`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `Hace ${diffInDays}d`;
    
    return date.toLocaleDateString('es');
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

  const ActivityItem = ({ activity }) => {
    const isReview = activity.activity_type === 'review';
    const isFollowArtist = activity.activity_type === 'follow_artist';

    return (
      <div className="bg-theme-card backdrop-blur-sm rounded-xl p-6 border border-theme-border hover:bg-theme-hover transition-all duration-300">
        <div className="flex items-start gap-4">
          {/* User Avatar */}
          <Link href={`/profile/${activity.username}`}>
            <div className="w-12 h-12 bg-theme-accent rounded-full flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
              <User className="w-6 h-6 text-theme-primary" />
            </div>
          </Link>

          <div className="flex-1">
            {/* Activity Header */}
            <div className="flex items-center gap-2 mb-3">
              <Link 
                href={`/profile/${activity.username}`}
                className="font-semibold text-theme-primary hover:text-theme-accent transition-colors"
              >
                @{activity.username}
              </Link>
              
              {isReview && (
                <>
                  <span className="text-theme-muted">reseñó</span>
                  <BookOpen className="w-4 h-4 text-theme-accent" />
                </>
              )}
              
              {isFollowArtist && (
                <>
                  <span className="text-theme-muted">ahora sigue a</span>
                  <Music className="w-4 h-4 text-green-400" />
                </>
              )}
              
              <span className="text-theme-muted text-sm ml-auto">
                {formatTimeAgo(activity.created_at)}
              </span>
            </div>

            {/* Activity Content */}
            <div className="flex items-start gap-4">
              {/* Album/Artist Image */}
              <div className="flex-shrink-0">
                <Image
                  src={activity.image_url || '/placeholder-artist.jpg'}
                  alt={activity.album_name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              </div>

              <div className="flex-1">
                {isReview && (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <Link 
                        href={`/album/${activity.album_spotify_id}`}
                        className="font-bold text-theme-primary hover:text-theme-accent transition-colors"
                      >
                        {activity.album_name}
                      </Link>
                      <div className="flex items-center gap-1">
                        {renderStars(activity.rating)}
                      </div>
                    </div>
                    
                    <p className="text-theme-secondary text-sm mb-2">{activity.artist}</p>
                    
                    {activity.review_title && (
                      <h4 className="font-semibold text-theme-accent mb-2">
                        {activity.review_title}
                      </h4>
                    )}
                    
                    {activity.review_content && (
                      <p className="text-theme-secondary leading-relaxed text-sm line-clamp-3">
                        {activity.review_content}
                      </p>
                    )}
                  </>
                )}

                {isFollowArtist && (
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/artist/${activity.album_spotify_id}`}
                      className="font-bold text-theme-primary hover:text-green-300 transition-colors"
                    >
                      {activity.album_name}
                    </Link>
                    <span className="text-theme-muted text-sm">• Artista</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Mostrar pantalla de carga mientras se verifica la autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-theme-primary animate-spin" />
          <p className="text-theme-primary text-lg">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <Users className="w-16 h-16 text-theme-primary mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-theme-primary mb-4">Timeline Social</h1>
          <p className="text-theme-secondary mb-8">
            Inicia sesión para ver la actividad de otros usuarios y conectar con la comunidad musical.
          </p>
          <div className="space-x-4">
            <Link 
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-theme-accent text-theme-button rounded-lg hover:opacity-90 transition-opacity"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/register"
              className="inline-flex items-center px-6 py-3 bg-theme-card text-theme-primary rounded-lg hover:bg-theme-hover transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-primary">
      {/* Header */}
      <div className="bg-theme-card backdrop-blur-sm border-b border-theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center space-x-2 text-theme-primary hover:text-theme-accent transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver al inicio</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-theme-primary flex items-center gap-2">
                <Users className="w-6 h-6" />
                Timeline Social
              </h1>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-theme-accent hover:bg-theme-hover text-theme-button rounded-lg transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'timeline'
                ? 'bg-theme-card text-theme-primary shadow-lg backdrop-blur-sm border border-theme-border'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-hover'
            }`}
          >
            <Clock className="w-5 h-5" />
            Timeline
          </button>
          
          <button
            onClick={() => setActiveTab('following')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'following'
                ? 'bg-theme-card text-theme-primary shadow-lg backdrop-blur-sm border border-theme-border'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-hover'
            }`}
          >
            <Users className="w-5 h-5" />
            Siguiendo ({followedUsers.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-theme-primary animate-spin" />
              <p className="text-theme-primary text-lg">Cargando timeline social...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-theme-primary">
                      Actividad Reciente
                    </h2>
                    <span className="text-theme-muted text-sm">
                      {activities.length} actividades
                    </span>
                  </div>

                  {activities.length > 0 ? (
                    activities.map((activity, index) => (
                      <ActivityItem key={`${activity.activity_type}-${activity.activity_id}-${index}`} activity={activity} />
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <Clock className="w-16 h-16 text-theme-muted mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-theme-primary mb-2">
                        No hay actividad reciente
                      </h3>
                      <p className="text-theme-muted mb-6">
                        Sigue a otros usuarios para ver su actividad musical aquí
                      </p>
                      <Link 
                        href="/reviews"
                        className="inline-flex items-center px-6 py-3 bg-theme-accent text-theme-button rounded-xl hover:bg-theme-hover transition-all duration-200"
                      >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Explorar Usuarios
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'following' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-theme-primary">
                      Usuarios que Sigues
                    </h2>
                  </div>

                  {followedUsers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {followedUsers.map((followedUser) => (
                        <div 
                          key={followedUser.id}
                          className="bg-theme-card backdrop-blur-sm rounded-xl p-6 border border-theme-border hover:bg-theme-hover transition-all duration-300"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <Link href={`/profile/${followedUser.username}`} className="flex items-center gap-3 group">
                              <div className="w-12 h-12 bg-theme-accent rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                                <User className="w-6 h-6 text-theme-primary" />
                              </div>
                              <div>
                                <h3 className="font-bold text-theme-primary group-hover:text-theme-accent transition-colors">
                                  @{followedUser.username}
                                </h3>
                                <p className="text-theme-muted text-sm">{followedUser.email}</p>
                              </div>
                            </Link>

                            <button
                              onClick={() => handleUnfollowUser(followedUser.id)}
                              className="flex items-center gap-1 px-3 py-1 bg-theme-card hover:bg-red-600 text-theme-primary rounded-lg text-sm transition-colors border border-theme-border"
                            >
                              <UserCheck className="w-4 h-4" />
                              Siguiendo
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-theme-primary">{followedUser.total_reviews}</div>
                              <div className="text-theme-muted text-xs">Reseñas</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-theme-primary">
                                {followedUser.avg_rating ? parseFloat(followedUser.avg_rating).toFixed(1) : '0.0'}
                              </div>
                              <div className="text-theme-muted text-xs">Promedio</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-theme-muted text-xs">
                            <Calendar className="w-3 h-3" />
                            <span>Siguiendo desde {new Date(followedUser.followed_at).toLocaleDateString('es')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Users className="w-16 h-16 text-theme-muted mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-theme-primary mb-2">
                        No sigues a ningún usuario
                      </h3>
                      <p className="text-theme-muted mb-6">
                        Explora perfiles de otros usuarios y síguelos para ver su actividad
                      </p>
                      <Link 
                        href="/reviews"
                        className="inline-flex items-center px-6 py-3 bg-theme-accent text-theme-button rounded-xl hover:bg-theme-hover transition-all duration-200"
                      >
                        <UserPlus className="w-5 h-5 mr-2" />
                        Explorar Usuarios
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Search Users */}
              <div className="bg-theme-card backdrop-blur-sm rounded-xl p-6 border border-theme-border">
                <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Buscar Usuarios
                </h3>
                
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()}
                    placeholder="Buscar por nombre de usuario..."
                    className="flex-1 px-3 py-2 bg-theme-card border border-theme-border rounded-lg text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-accent"
                  />
                  <button
                    onClick={handleSearchUsers}
                    disabled={isSearching}
                    className="px-4 py-2 bg-theme-accent hover:bg-theme-hover text-theme-button rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                  </button>
                </div>

                {searchResults.length > 0 && (
                  <div className="space-y-2">
                    {searchResults.map((user) => (
                      <Link
                        key={user.id}
                        href={`/profile/${user.username}`}
                        className="flex items-center gap-3 p-3 bg-theme-hover rounded-lg hover:bg-theme-card transition-colors border border-theme-border"
                      >
                        {user.profile_picture ? (
                          <div className="w-10 h-10 rounded-full overflow-hidden">
                            <Image
                              src={user.profile_picture}
                              alt={`Foto de perfil de ${user.username}`}
                              width={40}
                              height={40}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 bg-theme-accent rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-theme-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-theme-primary">@{user.username}</div>
                          {user.bio ? (
                            <div className="text-theme-muted text-xs truncate">{user.bio}</div>
                          ) : (
                            <div className="text-theme-muted text-xs">{user.total_reviews} reseñas</div>
                          )}
                        </div>
                        {user.is_following && (
                          <div className="text-green-400 text-xs">
                            <UserCheck className="w-4 h-4" />
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="bg-theme-card backdrop-blur-sm rounded-xl p-6 border border-theme-border">
                <h3 className="text-lg font-bold text-theme-primary mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Tu Actividad
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-theme-secondary">Usuarios siguiendo</span>
                    <span className="font-bold text-theme-primary">{followedUsers.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-theme-secondary">Actividades hoy</span>
                    <span className="font-bold text-theme-primary">
                      {activities.filter(a => {
                        const today = new Date().toDateString();
                        const activityDate = new Date(a.created_at).toDateString();
                        return today === activityDate;
                      }).length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Suggested Actions */}
              <div className="bg-theme-card backdrop-blur-sm rounded-xl p-6 border border-theme-border">
                <h3 className="text-lg font-bold text-theme-primary mb-4">
                  Acciones Sugeridas
                </h3>
                
                <div className="space-y-3">
                  <Link 
                    href="/reviews"
                    className="flex items-center gap-3 p-3 bg-theme-hover rounded-lg hover:bg-theme-card transition-colors border border-theme-border"
                  >
                    <BookOpen className="w-5 h-5 text-theme-accent" />
                    <div>
                      <div className="font-medium text-theme-primary">Explorar Reseñas</div>
                      <div className="text-theme-muted text-sm">Descubre nuevos usuarios</div>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/artists"
                    className="flex items-center gap-3 p-3 bg-theme-hover rounded-lg hover:bg-theme-card transition-colors border border-theme-border"
                  >
                    <Music className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="font-medium text-theme-primary">Explorar Artistas</div>
                      <div className="text-theme-muted text-sm">Encuentra nueva música</div>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialPage;
