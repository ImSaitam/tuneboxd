'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MessageCircle, Users, Star, Music, Heart, ThumbsUp,
  ArrowLeft, Loader2, User, Calendar, Plus, Search,
  Pin, Lock, Eye, Clock, Send, Filter, Hash, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

const ForumPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useNotifications();
  
  // Estados principales
  const [threads, setThreads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('threads');
  
  // Estados para filtros y búsqueda
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Estados para crear nuevo hilo
  const [showCreateThread, setShowCreateThread] = useState(false);
  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchForumData();
  }, [selectedCategory]);

  const fetchForumData = async () => {
    try {
      setLoading(true);
      
      // Obtener hilos
      let threadsUrl = '/api/forum/threads?limit=20';
      if (selectedCategory) {
        threadsUrl += `&category=${selectedCategory}`;
      }
      
      const threadsResponse = await fetch(threadsUrl);
      if (threadsResponse.ok) {
        const threadsData = await threadsResponse.json();
        setThreads(threadsData.threads || []);
      }

      // Obtener categorías
      const categoriesResponse = await fetch('/api/forum/categories');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || []);
      }

    } catch (error) {
      console.error('Error cargando datos del foro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(`/api/forum/threads?search=${encodeURIComponent(searchQuery)}&limit=10`);
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.threads || []);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateThread = async () => {
    if (!newThread.title.trim()) {
      error('El título es requerido');
      return;
    }

    try {
      setIsCreating(true);
      const response = await fetch('/api/forum/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(newThread)
      });

      if (response.ok) {
        success('Hilo creado exitosamente');
        setShowCreateThread(false);
        setNewThread({ title: '', content: '', category: 'general' });
        fetchForumData(); // Recargar hilos
      } else {
        const errorData = await response.json();
        error(errorData.message || 'Error al crear el hilo');
      }
    } catch (err) {
      console.error('Error creando hilo:', err);
      error('Error al crear el hilo');
    } finally {
      setIsCreating(false);
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'hace unos segundos';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
    
    return date.toLocaleDateString('es');
  };

  const ThreadCard = ({ thread }) => (
    <Link href={`/social/thread/${thread.id}`}>
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1">
            {thread.is_pinned && (
              <Pin className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            )}
            {thread.is_locked && (
              <Lock className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg group-hover:text-blue-300 transition-colors line-clamp-1">
                {thread.title}
              </h3>
              <div className="flex items-center space-x-3 text-sm text-gray-400 mt-1">
                <span>por @{thread.author_username}</span>
                <span>•</span>
                <span>{formatTimeAgo(thread.created_at)}</span>
                <span>•</span>
                <span className="bg-blue-600/30 px-2 py-1 rounded-lg text-blue-300">
                  #{thread.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        {thread.content && (
          <p className="text-gray-300 mb-4 line-clamp-2">
            {thread.content}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{thread.views_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-4 h-4" />
              <span>{thread.replies_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ThumbsUp className="w-4 h-4" />
              <span>{thread.likes_count}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {thread.last_activity !== thread.created_at && (
              <span>Última actividad: {formatTimeAgo(thread.last_activity)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">Foro de la Comunidad</h1>
          <p className="text-gray-300 mb-6">
            Inicia sesión para participar en las discusiones de la comunidad
          </p>
          <div className="space-x-4">
            <Link 
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/register"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
        <div className="flex items-start gap-4">
          {/* User Avatar */}
          <Link href={`/profile/${activity.username}`}>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
              <User className="w-6 h-6 text-white" />
            </div>
          </Link>

          <div className="flex-1">
            {/* Activity Header */}
            <div className="flex items-center gap-2 mb-3">
              <Link 
                href={`/profile/${activity.username}`}
                className="font-semibold text-white hover:text-blue-300 transition-colors"
              >
                @{activity.username}
              </Link>
              
              {isReview && (
                <>
                  <span className="text-gray-400">reseñó</span>
                  <BookOpen className="w-4 h-4 text-blue-400" />
                </>
              )}
              
              {isFollowArtist && (
                <>
                  <span className="text-gray-400">ahora sigue a</span>
                  <Music className="w-4 h-4 text-green-400" />
                </>
              )}
              
              <span className="text-gray-500 text-sm ml-auto">
                {formatTimeAgo(activity.created_at)}
              </span>
            </div>

            {/* Activity Content */}
            <div className="flex items-start gap-4">
              {/* Album/Artist Image */}
              <div className="flex-shrink-0">
                <img
                  src={activity.image_url || '/placeholder-artist.jpg'}
                  alt={activity.album_name}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              </div>

              <div className="flex-1">
                {isReview && (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      <Link 
                        href={`/album/${activity.album_spotify_id}`}
                        className="font-bold text-white hover:text-blue-300 transition-colors"
                      >
                        {activity.album_name}
                      </Link>
                      <div className="flex items-center gap-1">
                        {renderStars(activity.rating)}
                      </div>
                    </div>
                    
                    <p className="text-gray-300 text-sm mb-2">{activity.artist}</p>
                    
                    {activity.review_title && (
                      <h4 className="font-semibold text-blue-200 mb-2">
                        {activity.review_title}
                      </h4>
                    )}
                    
                    {activity.review_content && (
                      <p className="text-gray-300 leading-relaxed text-sm line-clamp-3">
                        {activity.review_content}
                      </p>
                    )}
                  </>
                )}

                {isFollowArtist && (
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/artist/${activity.album_spotify_id}`}
                      className="font-bold text-white hover:text-green-300 transition-colors"
                    >
                      {activity.album_name}
                    </Link>
                    <span className="text-gray-400 text-sm">• Artista</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <Users className="w-16 h-16 text-white mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-white mb-4">Únete a la Comunidad</h1>
          <p className="text-gray-300 mb-8">
            Inicia sesión para ver la actividad de otros usuarios y conectar con la comunidad musical.
          </p>
          <div className="space-x-4">
            <Link 
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/register"
              className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center space-x-2 text-white hover:text-blue-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver al inicio</span>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="w-6 h-6" />
                Timeline Social
              </h1>
              
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
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
                ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Clock className="w-5 h-5" />
            Timeline
          </button>
          
          <button
            onClick={() => setActiveTab('following')}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
              activeTab === 'following'
                ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm border border-white/30'
                : 'text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-5 h-5" />
            Siguiendo ({followedUsers.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
              <p className="text-white text-lg">Cargando timeline social...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {activeTab === 'timeline' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">
                      Actividad Reciente
                    </h2>
                    <span className="text-gray-400 text-sm">
                      {activities.length} actividades
                    </span>
                  </div>

                  {activities.length > 0 ? (
                    activities.map((activity, index) => (
                      <ActivityItem key={`${activity.activity_type}-${activity.activity_id}-${index}`} activity={activity} />
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        No hay actividad reciente
                      </h3>
                      <p className="text-gray-400 mb-6">
                        Sigue a otros usuarios para ver su actividad musical aquí
                      </p>
                      <Link 
                        href="/reviews"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
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
                    <h2 className="text-xl font-bold text-white">
                      Usuarios que Sigues
                    </h2>
                  </div>

                  {followedUsers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {followedUsers.map((followedUser) => (
                        <div 
                          key={followedUser.id}
                          className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <Link href={`/profile/${followedUser.username}`} className="flex items-center gap-3 group">
                              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-105 transition-transform">
                                <User className="w-6 h-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-bold text-white group-hover:text-blue-300 transition-colors">
                                  @{followedUser.username}
                                </h3>
                                <p className="text-gray-400 text-sm">{followedUser.email}</p>
                              </div>
                            </Link>

                            <button
                              onClick={() => handleUnfollowUser(followedUser.id)}
                              className="flex items-center gap-1 px-3 py-1 bg-gray-600 hover:bg-red-600 text-white rounded-lg text-sm transition-colors"
                            >
                              <UserCheck className="w-4 h-4" />
                              Siguiendo
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">{followedUser.total_reviews}</div>
                              <div className="text-gray-400 text-xs">Reseñas</div>
                            </div>
                            <div className="text-center">
                              <div className="text-lg font-bold text-white">
                                {followedUser.avg_rating ? parseFloat(followedUser.avg_rating).toFixed(1) : '0.0'}
                              </div>
                              <div className="text-gray-400 text-xs">Promedio</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1 text-gray-400 text-xs">
                            <Calendar className="w-3 h-3" />
                            <span>Siguiendo desde {new Date(followedUser.followed_at).toLocaleDateString('es')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">
                        No sigues a ningún usuario
                      </h3>
                      <p className="text-gray-400 mb-6">
                        Explora perfiles de otros usuarios y síguelos para ver su actividad
                      </p>
                      <Link 
                        href="/reviews"
                        className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
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
              {/* Quick Stats */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Tu Actividad
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Usuarios siguiendo</span>
                    <span className="font-bold text-white">{followedUsers.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-300">Actividades hoy</span>
                    <span className="font-bold text-white">
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
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">
                  Acciones Sugeridas
                </h3>
                
                <div className="space-y-3">
                  <Link 
                    href="/reviews"
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <BookOpen className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="font-medium text-white">Explorar Reseñas</div>
                      <div className="text-gray-400 text-sm">Descubre nuevos usuarios</div>
                    </div>
                  </Link>
                  
                  <Link 
                    href="/artists"
                    className="flex items-center gap-3 p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <Music className="w-5 h-5 text-green-400" />
                    <div>
                      <div className="font-medium text-white">Explorar Artistas</div>
                      <div className="text-gray-400 text-sm">Encuentra nueva música</div>
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
