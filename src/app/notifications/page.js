'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserNotifications } from '../../hooks/useUserNotifications';
import { useAuth } from '../../hooks/useAuth';
import { Bell, ArrowLeft, Check, Trash2, RefreshCw, Filter } from 'lucide-react';

export default function NotificationsPage() {
  const [filterType, setFilterType] = useState('all'); // all, unread, follow, list_like, list_comment, thread_comment
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchNotifications,
    getNotificationIcon,
    getNotificationColor,
    getNotificationUrl
  } = useUserNotifications();

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications(filterType === 'unread', 50, 0);
    }
  }, [isAuthenticated, filterType, fetchNotifications]);

  const handleRefresh = async () => {
    setLoading(true);
    await fetchNotifications(filterType === 'unread', 50, 0);
    setLoading(false);
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} minuto${diffMins !== 1 ? 's' : ''}`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours !== 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) !== 1 ? 's' : ''}`;
    return date.toLocaleDateString('es', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !notification.is_read;
    return notification.type === filterType;
  });

  const getFilterLabel = (type) => {
    switch (type) {
      case 'all': return 'Todas';
      case 'unread': return 'No leídas';
      case 'follow': return 'Seguidores';
      case 'list_like': return 'Likes en listas';
      case 'list_comment': return 'Comentarios en listas';
      case 'thread_comment': return 'Comentarios en hilos';
      default: return type;
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center">
          <Bell className="w-16 h-16 text-theme-secondary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-theme-primary mb-4">Acceso Requerido</h1>
          <p className="text-theme-secondary mb-6">Necesitas iniciar sesión para ver tus notificaciones</p>
          <Link 
            href="/login"
            className="bg-theme-accent text-theme-primary px-6 py-3 rounded-lg transition-colors hover:opacity-90"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-theme-primary hover:text-theme-secondary transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-theme-primary">Notificaciones</h1>
              <p className="text-theme-secondary mt-1">
                {unreadCount > 0 
                  ? `${unreadCount} notificación${unreadCount !== 1 ? 'es' : ''} sin leer`
                  : 'Todas las notificaciones están al día'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-2 text-theme-secondary hover:text-theme-primary transition-colors disabled:opacity-50"
              title="Actualizar"
            >
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>

            {/* Mark All as Read */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-theme-accent text-theme-primary px-4 py-2 rounded-lg transition-colors hover:opacity-90 flex items-center gap-2"
              >
                <Check size={16} />
                Marcar todas como leídas
              </button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-theme-card rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={16} className="text-theme-secondary" />
            <span className="text-theme-primary font-medium">Filtros:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'unread', 'follow', 'list_like', 'list_comment', 'thread_comment'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-full text-sm transition-colors ${
                  filterType === type
                    ? 'bg-theme-accent text-theme-primary'
                    : 'bg-theme-card-hover text-theme-secondary hover:bg-theme-card-hover'
                }`}
              >
                {getFilterLabel(type)}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {notificationsLoading && filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-theme-card rounded-lg p-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-theme-card-hover rounded-full"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-theme-card-hover rounded w-3/4"></div>
                      <div className="h-3 bg-theme-card-hover rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-12">
            <Bell size={64} className="text-theme-secondary mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-theme-primary mb-2">
              {filterType === 'unread' 
                ? 'No tienes notificaciones sin leer'
                : 'No hay notificaciones'
              }
            </h3>
            <p className="text-theme-secondary">
              {filterType === 'unread'
                ? '¡Estás al día con todas tus notificaciones!'
                : 'Las notificaciones aparecerán aquí cuando recibas alguna.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-theme-card rounded-lg border border-theme-border hover:bg-theme-card-hover transition-all duration-300 ${
                  !notification.is_read ? 'ring-2 ring-theme-accent/50' : ''
                }`}
              >
                <Link 
                  href={getNotificationUrl(notification)}
                  onClick={() => handleNotificationClick(notification)}
                  className="block p-6"
                >
                  <div className="flex items-start gap-4">
                    {/* Icono de notificación */}
                    <div className={`text-3xl ${getNotificationColor(notification.type)} flex-shrink-0`}>
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-theme-primary">
                          {notification.title}
                        </h3>
                        <span className="text-sm text-theme-secondary flex-shrink-0 ml-4">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-theme-secondary mb-3">
                        {notification.message}
                      </p>
                      
                      {/* Metadatos adicionales */}
                      <div className="flex items-center gap-4 text-sm text-theme-secondary">
                        {notification.from_username && (
                          <span>De: {notification.from_username}</span>
                        )}
                        {notification.list_name && (
                          <span>Lista: {notification.list_name}</span>
                        )}
                        {notification.thread_title && (
                          <span>Hilo: {notification.thread_title}</span>
                        )}
                      </div>
                    </div>

                    {/* Indicadores */}
                    <div className="flex flex-col items-center gap-2">
                      {!notification.is_read && (
                        <div className="w-3 h-3 bg-theme-accent rounded-full"></div>
                      )}
                      
                      {/* Botones de acción */}
                      <div className="flex gap-2">
                        {!notification.is_read && (
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="p-1 text-theme-secondary hover:text-emerald-400 transition-colors"
                            title="Marcar como leída"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 text-theme-secondary hover:text-red-400 transition-colors"
                          title="Eliminar notificación"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
