"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { User, Star, Calendar, TrendingUp, BarChart3, BookOpen, ArrowLeft, Loader2, UserCheck, UserPlus, Music, Edit, Trash2, X, Save, Clock, Users } from 'lucide-react';
import { useAuth } from '../../../hooks/useAuth';
import { useNotifications } from '../../../hooks/useNotifications';

const UserProfilePage = () => {
  const params = useParams();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { success: showSuccess, error: showError } = useNotifications();
  const [activeTab, setActiveTab] = useState('reviews');
  const [profileUser, setProfileUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [userReviews, setUserReviews] = useState([]);
  const [followedArtists, setFollowedArtists] = useState([]);
  const [listeningHistory, setListeningHistory] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followStateLoading, setFollowStateLoading] = useState(true);
  
  // Control de peticiones duplicadas
  const isLoadingRef = useRef(false);
  const loadedUsernameRef = useRef(null);
  const abortControllerRef = useRef(null);
  
  // Estados para edición de reseñas
  const [editingReview, setEditingReview] = useState(null);
  const [editForm, setEditForm] = useState({
    rating: 5,
    title: '',
    content: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Función para detectar si es un GIF
  const isGif = (url) => {
    if (!url) return false;
    return url.toLowerCase().includes('.gif') || url.toLowerCase().includes('giphy') || url.toLowerCase().includes('tenor');
  };

  const username = params.username;
  const isOwnProfile = currentUser?.username === username;
  
  const fetchUserProfile = useCallback(async () => {
    // Evitar peticiones duplicadas
    if (isLoadingRef.current || loadedUsernameRef.current === username) {
      return;
    }

    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo controlador de cancelación
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    isLoadingRef.current = true;
    loadedUsernameRef.current = username;

    try {
      setLoading(true);
      setError(null);
      
      
      // Obtener datos del usuario por username
      const userResponse = await fetch(`/api/user/profile/${username}`, { signal });
      if (!userResponse.ok) {
        if (userResponse.status === 404) {
          setError('Usuario no encontrado');
          return;
        }
        throw new Error('Error cargando perfil del usuario');
      }
      
      const userData = await userResponse.json();
      setProfileUser(userData.user);

      // Realizar todas las peticiones en paralelo para mejorar rendimiento
      const requests = [];

      // Estadísticas del usuario
      requests.push(
        fetch(`/api/user/stats?userId=${userData.user.id}`, { signal })
          .then(res => res.ok ? res.json() : null)
          .then(data => data && setUserStats(data.stats))
          .catch(() => null)
      );

      // Reseñas del usuario
      requests.push(
        fetch(`/api/user/${userData.user.id}/reviews`, { signal })
          .then(res => res.ok ? res.json() : null)
          .then(data => data && setUserReviews(data.reviews || []))
          .catch(() => null)
      );

      // Seguidores y seguidos
      requests.push(
        fetch(`/api/users/followers/${userData.user.id}`, {
          signal,
          headers: isAuthenticated ? {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          } : {}
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => data && setFollowers(data.followers || []))
          .catch(() => null)
      );

      requests.push(
        fetch(`/api/users/following/${userData.user.id}`, {
          signal,
          headers: isAuthenticated ? {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          } : {}
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => data && setFollowing(data.following || []))
          .catch(() => null)
      );

      // Si es el perfil del usuario actual autenticado
      if (isAuthenticated && currentUser?.username === username) {
        // Artistas seguidos
        requests.push(
          fetch('/api/artists/following', {
            signal,
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          })
            .then(res => res.ok ? res.json() : null)
            .then(data => data && setFollowedArtists(data.artists || []))
            .catch(() => null)
        );
      }

      // Historial de escucha - disponible para todos los usuarios
      requests.push(
        fetch(`/api/listening-history?userId=${userData.user.id}&grouped=true&limit=20`, {
          signal,
          headers: isAuthenticated ? {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          } : {}
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => data && setListeningHistory(data.listeningHistory || []))
          .catch(() => null)
      );

      // Si no es su propio perfil, verificar si lo sigue
      if (isAuthenticated && currentUser?.username !== username) {
        setFollowStateLoading(true);
        
        // Crear una promesa separada para la verificación de seguimiento
        const followVerification = fetch(`/api/users/follow?user_id=${userData.user.id}`, {
          signal,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        })
          .then(res => {
            return res.ok ? res.json() : { isFollowing: false };
          })
          .then(data => {
            setIsFollowing(data.isFollowing || false);
            setFollowStateLoading(false);
          })
          .catch((error) => {
            console.error('Error verificando estado de seguimiento:', error);
            setIsFollowing(false);
            setFollowStateLoading(false);
          });
        
        // Agregar la verificación de seguimiento a las requests
        requests.push(followVerification);
      } else {
        // Si es su propio perfil o no está autenticado, no está siguiendo
        setIsFollowing(false);
        setFollowStateLoading(false);
      }

      // Ejecutar todas las peticiones en paralelo
      await Promise.allSettled(requests);

    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }
      console.error('Error cargando perfil del usuario:', error);
      setError('Error cargando los datos del perfil');
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [username, isAuthenticated, currentUser?.username]);

  // Resetear estado cuando cambie el username
  useEffect(() => {
    // Cancelar petición anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Resetear refs de control
    isLoadingRef.current = false;
    loadedUsernameRef.current = null;
    
    // Resetear estados
    setProfileUser(null);
    setUserStats(null);
    setUserReviews([]);
    setFollowedArtists([]);
    setListeningHistory([]);
    setFollowers([]);
    setFollowing([]);
    // NO resetear isFollowing aquí - se establecerá correctamente en fetchUserProfile
    setFollowStateLoading(true); // Inicializar como cargando
    setError(null);
  }, [username]);

  useEffect(() => {
    if (username && loadedUsernameRef.current !== username) {
      fetchUserProfile();
    }
  }, [username, fetchUserProfile]);

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Función optimizada para recargar datos de seguidores/seguidos
  const refreshFollowData = useCallback(async () => {
    if (!profileUser) return;
    
    try {
      // Realizar todas las peticiones en paralelo para mejor rendimiento
      const requests = [
        fetch(`/api/users/followers/${profileUser.id}`, {
          headers: isAuthenticated ? {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          } : {}
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => data && setFollowers(data.followers || []))
          .catch(() => null),

        fetch(`/api/users/following/${profileUser.id}`, {
          headers: isAuthenticated ? {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          } : {}
        })
          .then(res => res.ok ? res.json() : null)
          .then(data => data && setFollowing(data.following || []))
          .catch(() => null),

        fetch(`/api/user/stats?userId=${profileUser.id}`)
          .then(res => res.ok ? res.json() : null)
          .then(data => data && setUserStats(data.stats))
          .catch(() => null)
      ];

      // Si no es mi propio perfil, también verificar el estado de seguimiento
      if (isAuthenticated && currentUser?.username !== profileUser.username) {
        setFollowStateLoading(true);
        requests.push(
          fetch(`/api/users/follow?user_id=${profileUser.id}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
            }
          })
            .then(res => res.ok ? res.json() : { isFollowing: false })
            .then(data => {
              setIsFollowing(data.isFollowing || false);
              setFollowStateLoading(false);
            })
            .catch(() => {
              setIsFollowing(false);
              setFollowStateLoading(false);
            })
        );
      } else {
        setFollowStateLoading(false);
      }

      await Promise.allSettled(requests);
    } catch (error) {
      console.error('Error refrescando datos de seguimiento:', error);
    }
  }, [profileUser, isAuthenticated, currentUser?.username]);

  // Función específica para verificar el estado de seguimiento
  const verifyFollowState = useCallback(async () => {
    if (!profileUser || !isAuthenticated || currentUser?.username === profileUser.username) {
      setIsFollowing(false);
      setFollowStateLoading(false);
      return;
    }

    try {
      setFollowStateLoading(true);
      
      const response = await fetch(`/api/users/follow?user_id=${profileUser.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFollowing(data.isFollowing || false);
      } else {
        setIsFollowing(false);
      }
    } catch (error) {
      console.error('Error verificando estado de seguimiento:', error);
      setIsFollowing(false);
    } finally {
      setFollowStateLoading(false);
    }
  }, [profileUser, isAuthenticated, currentUser?.username]);

  // Detectar recarga de página para verificar estado de seguimiento
  useEffect(() => {
    // Verificar si es una recarga de página directa
    const isPageReload = performance.getEntriesByType('navigation')[0]?.type === 'reload';
    
    
    // Si es una recarga y tenemos los datos necesarios, verificar el estado de seguimiento
    if (isPageReload && profileUser && isAuthenticated && currentUser?.username !== profileUser.username) {
      // Esperar un poco para asegurar que todo esté inicializado
      setTimeout(() => {
        verifyFollowState();
      }, 100);
    }
  }, [profileUser, isAuthenticated, currentUser?.username, verifyFollowState]);

  const handleFollowToggle = async () => {
    if (!isAuthenticated || !profileUser) return;
    
    try {
      if (isFollowing) {
        // Dejar de seguir
        const response = await fetch(`/api/users/follow?user_id=${profileUser.id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        if (response.ok) {
          setIsFollowing(false);
          showSuccess('Dejaste de seguir a este usuario');
          // Usar la nueva función optimizada
          await refreshFollowData();
        } else {
          const errorData = await response.json();
          showError(errorData.message || 'Error al dejar de seguir');
        }
      } else {
        // Seguir
        const response = await fetch('/api/users/follow', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({
            user_id: profileUser.id
          })
        });

        if (response.ok) {
          setIsFollowing(true);
          showSuccess('Ahora sigues a este usuario');
          // Usar la nueva función optimizada
          await refreshFollowData();
        } else {
          const errorData = await response.json();
          showError(errorData.message || 'Error al seguir');
        }
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
      showError('Error al procesar la solicitud');
    }
  };

  // Función para abrir el modal de edición
  const handleEditReview = (review) => {
    setEditingReview(review);
    setEditForm({
      rating: review.rating,
      title: review.title || '',
      content: review.content || ''
    });
  };

  // Función para cerrar el modal de edición
  const handleCancelEdit = () => {
    setEditingReview(null);
    setEditForm({
      rating: 5,
      title: '',
      content: ''
    });
  };

  // Función para guardar la reseña editada
  const handleSaveEdit = async () => {
    if (!editingReview) return;
    
    setIsEditing(true);
    try {
      const response = await fetch(`/api/reviews/${editingReview.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          rating: editForm.rating,
          title: editForm.title.trim(),
          content: editForm.content.trim()
        })
      });

      if (response.ok) {
        // Actualizar la reseña en la lista local
        setUserReviews(prevReviews => 
          prevReviews.map(review => 
            review.id === editingReview.id 
              ? { ...review, ...editForm }
              : review
          )
        );
        
        handleCancelEdit();
        showSuccess('Reseña actualizada correctamente');
      } else {
        const errorData = await response.json();
        showError(errorData.message || 'Error al actualizar la reseña');
      }
    } catch (error) {
      console.error('Error updating review:', error);
      showError('Error al actualizar la reseña');
    } finally {
      setIsEditing(false);
    }
  };

  // Función para eliminar reseña
  const handleDeleteReview = async (reviewId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta reseña? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      if (response.ok) {
        // Remover la reseña de la lista local
        setUserReviews(prevReviews => 
          prevReviews.filter(review => review.id !== reviewId)
        );
        
        showSuccess('Reseña eliminada correctamente');
        
        // Refrescar estadísticas del usuario
        if (userStats) {
          setUserStats(prev => ({
            ...prev,
            totalReviews: prev.totalReviews - 1
          }));
        }
      } else {
        const errorData = await response.json();
        showError(errorData.message || 'Error al eliminar la reseña');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      showError('Error al eliminar la reseña');
    } finally {
      setIsDeleting(false);
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
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-theme-accent animate-spin" />
          <p className="text-theme-primary text-lg">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-theme-primary mb-4">{error}</h1>
          <p className="text-theme-secondary mb-6">El usuario que buscas no existe o no se pudo cargar su perfil.</p>
          <div className="space-x-4">
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-theme-accent text-theme-button rounded-lg hover:bg-theme-hover transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Volver al inicio
            </Link>
            <button 
              onClick={fetchUserProfile}
              className="inline-flex items-center px-6 py-3 bg-theme-card text-theme-button rounded-lg hover:bg-theme-hover transition-colors"
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
    <div className="min-h-screen bg-theme-primary overflow-x-hidden">
      {/* Header */}
      <div className="bg-theme-card border-b border-theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link 
              href="/"
              className="flex items-center space-x-2 text-theme-primary hover:text-theme-accent transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al inicio</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-theme-card rounded-3xl p-8 border border-theme-border shadow-2xl">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profileUser.profile_picture ? (
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-white/20">
                  {isGif(profileUser.profile_picture) ? (
                    <img
                      src={profileUser.profile_picture}
                      alt={`Foto de perfil de ${profileUser.username}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Image
                      src={profileUser.profile_picture}
                      alt={`Foto de perfil de ${profileUser.username}`}
                      fill
                      className="object-cover"
                      sizes="96px"
                    />
                  )}
                </div>
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-12 h-12 text-theme-button" />
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-theme-primary mb-2">@{profileUser.username}</h1>
              <div className="flex items-center space-x-2 text-theme-secondary">
                <Calendar className="w-4 h-4" />
                <span>Miembro desde {userStats?.memberSince ? new Date(userStats.memberSince).toLocaleDateString('es') : 'N/A'}</span>
              </div>
            </div>

            {/* Quick Stats and Actions */}
            <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="grid grid-cols-2 sm:flex sm:space-x-6 gap-4 sm:gap-0 w-full sm:w-auto">
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-theme-primary">{userStats?.totalReviews || 0}</div>
                  <div className="text-xs sm:text-sm text-theme-secondary">Reseñas</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-theme-primary">{userStats?.averageRating || '0.0'}</div>
                  <div className="text-xs sm:text-sm text-theme-secondary">Promedio</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-theme-primary">{userStats?.followers || 0}</div>
                  <div className="text-xs sm:text-sm text-theme-secondary">Seguidores</div>
                </div>
                <div className="text-center">
                  <div className="text-xl sm:text-2xl font-bold text-theme-primary">{userStats?.following || 0}</div>
                  <div className="text-xs sm:text-sm text-theme-secondary">Siguiendo</div>
                </div>
              </div>

              {/* Follow Button (only if not own profile and user is authenticated) */}
              {!isOwnProfile && isAuthenticated && (
                <button
                  onClick={handleFollowToggle}
                  disabled={followStateLoading}
                  data-testid="follow-button"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    followStateLoading
                      ? 'bg-theme-card cursor-not-allowed text-theme-muted'
                      : isFollowing
                      ? 'bg-theme-card hover:bg-theme-hover text-theme-button'
                      : 'bg-theme-accent hover:bg-theme-hover text-theme-button'
                  }`}
                >
                  {followStateLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Cargando...</span>
                    </>
                  ) : isFollowing ? (
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
                  className="flex items-center space-x-2 px-4 py-2 bg-theme-accent hover:bg-theme-hover text-theme-button rounded-lg font-medium transition-all duration-200"
                >
                  <User className="w-4 h-4" />
                  <span>Editar Perfil</span>
                </Link>
              )}
            </div>
          </div>
          
          {/* Biografía - Al final del contenedor Profile Header abarcando todo el ancho */}
          {profileUser.bio && (
            <div className="mt-6 pt-6 border-t border-theme-border">
              <p className="text-theme-secondary text-base leading-relaxed text-center">
                {profileUser.bio}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap gap-2 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === 'reviews'
                ? 'bg-theme-card text-theme-primary shadow-lg backdrop-blur-sm border border-theme-border'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-hover'
            }`}
          >
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
            <span className="hidden sm:inline">Reseñas</span>
            <span className="sm:hidden">Reviews</span>
          </button>
          <button
            onClick={() => setActiveTab('registro')}
            className={`px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === 'registro'
                ? 'bg-theme-card text-theme-primary shadow-lg backdrop-blur-sm border border-theme-border'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-hover'
            }`}
          >
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
            <span className="hidden sm:inline">Registro</span>
            <span className="sm:hidden">Log</span>
          </button>
          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('artists')}
              className={`px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
                activeTab === 'artists'
                  ? 'bg-theme-card text-theme-primary shadow-lg backdrop-blur-sm border border-theme-border'
                  : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-hover'
              }`}
            >
              <Music className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
              <span className="hidden sm:inline">Mis Artistas</span>
              <span className="sm:hidden">Artists</span>
            </button>
          )}
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === 'stats'
                ? 'bg-theme-card text-theme-primary shadow-lg backdrop-blur-sm border border-theme-border'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-hover'
            }`}
          >
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
            <span className="hidden sm:inline">Estadísticas</span>
            <span className="sm:hidden">Stats</span>
          </button>
          <button
            onClick={() => setActiveTab('followers')}
            className={`px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === 'followers'
                ? 'bg-theme-card text-theme-primary shadow-lg backdrop-blur-sm border border-theme-border'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-hover'
            }`}
          >
            <Users className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
            <span className="hidden sm:inline">Seguidores ({userStats?.followers || 0})</span>
            <span className="sm:hidden">Followers</span>
          </button>
          <button
            onClick={() => setActiveTab('following')}
            className={`px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-200 whitespace-nowrap ${
              activeTab === 'following'
                ? 'bg-theme-card text-theme-primary shadow-lg backdrop-blur-sm border border-theme-border'
                : 'text-theme-secondary hover:text-theme-primary hover:bg-theme-hover'
            }`}
          >
            <UserCheck className="w-4 h-4 sm:w-5 sm:h-5 inline mr-2" />
            <span className="hidden sm:inline">Siguiendo ({userStats?.following || 0})</span>
            <span className="sm:hidden">Following</span>
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
                    <Image
                      src={review.image_url}
                      alt={review.album_name}
                      width={96}
                      height={96}
                      className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-theme-primary">{review.album_name}</h3>
                          <p className="text-theme-secondary">{review.artist}</p>
                        </div>
                        <div className="flex items-center space-x-1">
                          {renderStars(review.rating)}
                        </div>
                      </div>
                      
                      {review.title && (
                        <h4 className="text-lg font-semibold text-theme-accent mb-2">{review.title}</h4>
                      )}
                      {review.content && (
                        <p className="text-theme-secondary leading-relaxed">{review.content}</p>
                      )}
                      
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-theme-muted">
                          {new Date(review.created_at).toLocaleDateString('es')}
                        </span>
                        {isOwnProfile && (
                          <div className="flex items-center space-x-2">
                            <button 
                              onClick={() => handleEditReview(review)}
                              className="flex items-center space-x-1 text-theme-accent hover:text-theme-hover text-sm font-medium transition-colors"
                            >
                              <Edit className="w-4 h-4" />
                              <span>Editar</span>
                            </button>
                            <button 
                              onClick={() => handleDeleteReview(review.id)}
                              disabled={isDeleting}
                              className="flex items-center space-x-1 text-red-400 hover:text-red-300 text-sm font-medium transition-colors disabled:opacity-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Eliminar</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16">
                <BookOpen className="w-16 h-16 text-theme-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-theme-primary mb-2">
                  {isOwnProfile ? 'No has escrito reseñas aún' : `${profileUser.username} no ha escrito reseñas aún`}
                </h3>
                {isOwnProfile && (
                  <>
                    <p className="text-theme-muted mb-6">¡Comienza escribiendo tu primera reseña!</p>
                    <Link 
                      href="/"
                      className="inline-flex items-center px-6 py-3 bg-theme-accent text-theme-button rounded-xl hover:bg-theme-hover transition-all duration-200 shadow-lg"
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
              <div className="bg-theme-card backdrop-blur-sm rounded-2xl p-6 border border-theme-border">
                <h3 className="text-xl font-bold text-theme-primary mb-6">Actividad Mensual</h3>
                <div className="space-y-4">
                  {userStats.monthlyStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-theme-secondary">{stat.month}</span>
                      <div className="flex items-center space-x-4">
                        <span className="text-theme-primary font-medium">{stat.reviews} reseñas</span>
                        <span className="text-yellow-400">★ {stat.avg_rating.toFixed(1)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top Genres - Placeholder */}
            <div className="bg-theme-card backdrop-blur-sm rounded-2xl p-6 border border-theme-border">
              <h3 className="text-xl font-bold text-theme-primary mb-6">Géneros Favoritos</h3>
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-theme-muted mx-auto mb-4" />
                <p className="text-theme-muted">Funcionalidad en desarrollo</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'artists' && isOwnProfile && (
          <div className="space-y-6">
            {followedArtists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {followedArtists.map((artist) => (
                  <div 
                    key={artist.artist_id} 
                    className="bg-theme-card backdrop-blur-sm rounded-2xl p-6 border border-theme-border hover:bg-theme-hover transition-all duration-300 group"
                  >
                    {/* Artist Image */}
                    <div className="relative mb-4">
                      <div className="w-24 h-24 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-red-400 to-teal-400">
                        {artist.artist_image ? (
                          <Image
                            src={artist.artist_image}
                            alt={artist.artist_name}
                            width={96}
                            height={96}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white">
                            <User className="w-8 h-8" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Artist Info */}
                    <div className="text-center">
                      <h3 className="font-bold text-theme-primary text-lg mb-2 group-hover:text-theme-accent transition-colors">
                        {artist.artist_name}
                      </h3>
                      
                      <div className="flex items-center justify-center gap-1 text-theme-muted text-sm mb-4">
                        <Calendar className="w-4 h-4" />
                        <span>Desde {new Date(artist.followed_at).toLocaleDateString('es')}</span>
                      </div>

                      <Link
                        href={`/artist/${artist.artist_id}`}
                        className="inline-flex items-center gap-2 bg-theme-accent hover:bg-theme-hover text-theme-button px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                      >
                        <Music className="w-4 h-4" />
                        Ver Perfil
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Music className="w-16 h-16 text-theme-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-theme-primary mb-2">No sigues a ningún artista</h3>
                <p className="text-theme-secondary mb-6">
                  Busca artistas en la página principal y empieza a seguir a tus favoritos
                </p>
                <Link 
                  href="/"
                  className="bg-theme-accent hover:bg-theme-hover text-theme-button px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                >
                  Explorar Artistas
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'registro' && (
          <div className="space-y-6">
            {listeningHistory.length > 0 ? (
              <div className="space-y-8">
                {listeningHistory.map((day, index) => (
                  <div key={index} className="bg-theme-card backdrop-blur-sm rounded-2xl p-6 border border-theme-border">
                    {/* Fecha */}
                    <div className="flex items-center space-x-3 mb-6">
                      <Calendar className="w-5 h-5 text-theme-accent" />
                      <h3 className="text-lg font-bold text-theme-primary">
                        {new Date(day.date).toLocaleDateString('es-ES', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </h3>
                      <span className="text-sm text-theme-muted">
                        ({day.albumCount} álbum{day.albumCount !== 1 ? 'es' : ''} escuchado{day.albumCount !== 1 ? 's' : ''})
                      </span>
                    </div>

                    {/* Lista de álbumes */}
                    <div className="space-y-4">
                      {day.albums.map((album, albumIndex) => (
                        <div key={albumIndex} className="flex items-center space-x-4 p-4 bg-theme-hover rounded-xl hover:bg-theme-card transition-all duration-200 group">
                          {/* Album Cover */}
                          <div className="flex-shrink-0">
                            <Image
                              src={album.image_url || '/placeholder-album.png'}
                              alt={album.album_name}
                              width={64}
                              height={64}
                              className="w-16 h-16 rounded-lg object-cover group-hover:scale-105 transition-transform duration-200 cursor-pointer"
                              onClick={() => window.location.href = `/album/${album.spotify_id}`}
                            />
                          </div>

                          {/* Album Info */}
                          <div className="flex-1 min-w-0">
                            <h4 
                              className="text-theme-primary font-semibold text-lg cursor-pointer hover:text-theme-accent transition-colors truncate"
                              onClick={() => window.location.href = `/album/${album.spotify_id}`}
                            >
                              {album.album_name}
                            </h4>
                            <p className="text-theme-secondary">{album.artist}</p>
                            <div className="flex items-center space-x-1 text-theme-muted text-sm mt-1">
                              <Clock className="w-4 h-4" />
                              <span>
                                {new Date(album.listened_at).toLocaleTimeString('es-ES', { 
                                  hour: '2-digit', 
                                  minute: '2-digit' 
                                })}
                              </span>
                            </div>
                          </div>

                          {/* Action Button */}
                          <div className="flex-shrink-0">
                            <button
                              onClick={() => window.location.href = `/album/${album.spotify_id}`}
                              className="bg-theme-accent hover:bg-theme-hover text-theme-button px-4 py-2 rounded-lg font-medium transition-colors opacity-0 group-hover:opacity-100"
                            >
                              Ver Álbum
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Clock className="w-16 h-16 text-theme-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-theme-primary mb-2">
                  {isOwnProfile ? 'Tu registro está vacío' : `${profileUser.username} no tiene historial de escucha`}
                </h3>
                <p className="text-theme-secondary mb-6">
                  {isOwnProfile 
                    ? 'Empieza a escuchar álbumes para ver tu historial de escucha aquí'
                    : 'Este usuario aún no ha marcado álbumes como escuchados'
                  }
                </p>
                {isOwnProfile && (
                  <Link 
                    href="/"
                    className="bg-theme-accent hover:bg-theme-hover text-theme-button px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    Explorar Música
                  </Link>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'followers' && (
          <div className="space-y-6">
            {followers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {followers.map((follower) => (
                  <div
                    key={follower.id}
                    className="bg-theme-card backdrop-blur-sm rounded-2xl p-6 border border-theme-border hover:bg-theme-hover transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      {follower.profile_picture ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-theme-border">
                          {isGif(follower.profile_picture) ? (
                            <img
                              src={follower.profile_picture}
                              alt={`Foto de perfil de ${follower.username}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image
                              src={follower.profile_picture}
                              alt={`Foto de perfil de ${follower.username}`}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-theme-primary">@{follower.username}</h3>
                        <p className="text-theme-secondary text-sm">{follower.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-1 text-theme-muted text-sm mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>Siguiendo desde {new Date(follower.followed_at).toLocaleDateString('es')}</span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/profile/${follower.username}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-theme-accent hover:bg-theme-hover text-theme-button px-4 py-2 rounded-lg font-semibold transition-all duration-300"
                      >
                        <User className="w-4 h-4" />
                        Ver Perfil
                      </Link>
                      
                      {/* Follow/Unfollow button - only if authenticated and not own profile */}
                      {isAuthenticated && currentUser?.id !== follower.id && (
                        <button
                          onClick={async () => {
                            try {
                              const method = follower.isFollowing ? 'DELETE' : 'POST';
                              const url = follower.isFollowing 
                                ? `/api/users/follow?user_id=${follower.id}`
                                : '/api/users/follow';
                              
                              const response = await fetch(url, {
                                method,
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                                },
                                ...(method === 'POST' && {
                                  body: JSON.stringify({ user_id: follower.id })
                                })
                              });

                              if (response.ok) {
                                // Update local state
                                setFollowers(prev => prev.map(f => 
                                  f.id === follower.id 
                                    ? { ...f, isFollowing: !f.isFollowing }
                                    : f
                                ));
                                showSuccess(follower.isFollowing ? 'Dejaste de seguir a este usuario' : 'Ahora sigues a este usuario');
                              }
                            } catch (error) {
                              showError('Error al procesar la solicitud');
                            }
                          }}
                          className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                            follower.isFollowing
                              ? 'bg-theme-card hover:bg-theme-hover text-theme-button'
                              : 'bg-theme-accent hover:bg-theme-hover text-theme-button'
                          }`}
                        >
                          {follower.isFollowing ? (
                            <UserCheck className="w-4 h-4" />
                          ) : (
                            <UserPlus className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-theme-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-theme-primary mb-2">
                  {isOwnProfile ? 'Aún no tienes seguidores' : 'Este usuario no tiene seguidores'}
                </h3>
                <p className="text-theme-secondary mb-6">
                  {isOwnProfile 
                    ? 'Comparte tu perfil para empezar a ganar seguidores'
                    : 'Sé el primero en seguir a este usuario'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'following' && (
          <div className="space-y-6">
            {following.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {following.map((followedUser) => (
                  <div
                    key={followedUser.id}
                    className="bg-theme-card backdrop-blur-sm rounded-2xl p-6 border border-theme-border hover:bg-theme-hover transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4 mb-4">
                      {followedUser.profile_picture ? (
                        <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-theme-border">
                          {isGif(followedUser.profile_picture) ? (
                            <img
                              src={followedUser.profile_picture}
                              alt={`Foto de perfil de ${followedUser.username}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image
                              src={followedUser.profile_picture}
                              alt={`Foto de perfil de ${followedUser.username}`}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          )}
                        </div>
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-600 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-theme-primary">@{followedUser.username}</h3>
                        <p className="text-theme-secondary text-sm">{followedUser.email}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center gap-1 text-theme-muted text-sm mb-4">
                      <Calendar className="w-4 h-4" />
                      <span>Siguiendo desde {new Date(followedUser.followed_at).toLocaleDateString('es')}</span>
                    </div>

                    <div className="flex gap-2">
                      <Link
                        href={`/profile/${followedUser.username}`}
                        className="flex-1 inline-flex items-center justify-center gap-2 bg-theme-accent hover:bg-theme-hover text-theme-button px-4 py-2 rounded-lg font-semibold transition-all duration-300"
                      >
                        <User className="w-4 h-4" />
                        Ver Perfil
                      </Link>
                      
                      {/* Follow/Unfollow button */}
                      {isAuthenticated && (
                        <button
                          onClick={async () => {
                            try {
                              // Si es mi propio perfil viendo mi lista de seguidos, siempre es "dejar de seguir"
                              // Si es otro perfil, depende del estado isFollowing del usuario
                              const shouldUnfollow = isOwnProfile || followedUser.isFollowing;
                              const method = shouldUnfollow ? 'DELETE' : 'POST';
                              const url = shouldUnfollow
                                ? `/api/users/follow?user_id=${followedUser.id}`
                                : '/api/users/follow';
                              
                              const response = await fetch(url, {
                                method,
                                headers: {
                                  'Content-Type': 'application/json',
                                  'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                                },
                                ...(method === 'POST' && {
                                  body: JSON.stringify({ user_id: followedUser.id })
                                })
                              });

                              if (response.ok) {
                                if (isOwnProfile) {
                                  // Si es mi perfil, remover de la lista (ya no lo sigo)
                                  setFollowing(prev => prev.filter(f => f.id !== followedUser.id));
                                  showSuccess('Dejaste de seguir a este usuario');
                                } else {
                                  // Si no es mi perfil, actualizar el estado
                                  setFollowing(prev => prev.map(f => 
                                    f.id === followedUser.id 
                                      ? { ...f, isFollowing: !f.isFollowing }
                                      : f
                                  ));
                                  showSuccess(followedUser.isFollowing ? 'Dejaste de seguir a este usuario' : 'Ahora sigues a este usuario');
                                }
                              }
                            } catch (error) {
                              showError('Error al procesar la solicitud');
                            }
                          }}
                          className={`px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                            (isOwnProfile || followedUser.isFollowing)
                              ? 'bg-theme-card hover:bg-theme-hover text-theme-primary'
                              : 'bg-theme-accent hover:bg-theme-hover text-theme-button'
                          }`}
                        >
                          {(isOwnProfile || followedUser.isFollowing) ? (
                            <UserCheck className="w-4 h-4" />
                          ) : (
                            <UserPlus className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <UserCheck className="w-16 h-16 text-theme-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-theme-primary mb-2">
                  {isOwnProfile ? 'Aún no sigues a nadie' : 'Este usuario no sigue a nadie'}
                </h3>
                <p className="text-theme-secondary mb-6">
                  {isOwnProfile 
                    ? 'Explora perfiles de otros usuarios para empezar a seguir a gente interesante'
                    : 'Este usuario aún no ha comenzado a seguir a otros usuarios'
                  }
                </p>
                {isOwnProfile && (
                  <Link 
                    href="/"
                    className="bg-theme-accent hover:bg-theme-hover text-theme-button px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    Explorar Usuarios
                  </Link>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Edición de Reseña */}
      {editingReview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-theme-card rounded-2xl p-6 w-full max-w-lg border border-theme-border shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-theme-primary">Editar Reseña</h3>
              <button
                onClick={handleCancelEdit}
                className="text-theme-muted hover:text-theme-primary transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Album Info */}
              <div className="flex items-center space-x-3 p-3 bg-theme-hover rounded-lg">
                <Image
                  src={editingReview.image_url}
                  alt={editingReview.album_name}
                  width={48}
                  height={48}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div>
                  <h4 className="font-semibold text-theme-primary">{editingReview.album_name}</h4>
                  <p className="text-theme-secondary text-sm">{editingReview.artist}</p>
                </div>
              </div>

              {/* Rating */}
              <div>
                <label className="block text-theme-primary font-medium mb-2">Puntuación</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditForm(prev => ({ ...prev, rating: star }))}
                      className="transition-colors"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= editForm.rating
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-theme-muted hover:text-yellow-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-theme-primary font-medium mb-2">Título (opcional)</label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-theme-card border border-theme-border rounded-lg text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-accent"
                  placeholder="Título de tu reseña..."
                  maxLength={100}
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-theme-primary font-medium mb-2">Reseña (opcional)</label>
                <textarea
                  value={editForm.content}
                  onChange={(e) => setEditForm(prev => ({ ...prev, content: e.target.value }))}
                  className="w-full px-4 py-2 bg-theme-card border border-theme-border rounded-lg text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-accent resize-none"
                  placeholder="Escribe tu reseña aquí..."
                  rows={4}
                  maxLength={1000}
                />
                <div className="text-right text-theme-muted text-xs mt-1">
                  {editForm.content.length}/1000
                </div>
              </div>

              {/* Buttons */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 px-4 py-2 bg-theme-card hover:bg-theme-hover text-theme-primary rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={isEditing}
                  className="flex-1 px-4 py-2 bg-theme-accent hover:bg-theme-hover text-theme-button rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isEditing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Guardar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente para las estadísticas
const StatCard = ({ icon: Icon, title, value, description, gradient }) => (
  <div className={`bg-gradient-to-r ${gradient} p-6 rounded-2xl text-white`}>
    <div className="flex items-center space-x-4">
      <Icon className="w-8 h-8" />
      <div>
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-white/80 font-medium">{title}</p>
        <p className="text-white/60 text-sm">{description}</p>
      </div>
    </div>
  </div>
);

export default UserProfilePage;
