'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, X, Check, Trash2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useUserNotifications } from '../hooks/useUserNotifications';

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    fetchNotifications,
    getNotificationIcon,
    getNotificationColor,
    getNotificationUrl
  } = useUserNotifications();

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen && notifications.length === 0) {
      fetchNotifications();
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification.is_read) {
      await markAsRead(notification.id);
    }
    setIsOpen(false);
  };

  const handleMarkAsRead = async (notificationId, event) => {
    event.stopPropagation();
    await markAsRead(notificationId);
  };

  const handleDelete = async (notificationId, event) => {
    event.stopPropagation();
    await deleteNotification(notificationId);
  };

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('es');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Campana de notificaciones */}
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-300 hover:text-white transition-colors"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Notificaciones</h3>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  onClick={deleteAllNotifications}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  title="Borrar todas las notificaciones"
                >
                  Borrar todas
                </button>
              )}
              {unreadCount > 0 && notifications.length > 0 && (
                <span className="text-gray-600">|</span>
              )}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  title="Marcar todas como leídas"
                >
                  Marcar todas como leídas
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Lista de notificaciones */}
          <div className="max-h-80 overflow-y-auto">
            {loading && notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <div className="animate-pulse">Cargando notificaciones...</div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell size={48} className="mx-auto mb-4 opacity-50" />
                <p>No tienes notificaciones</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`relative border-b border-gray-700 hover:bg-gray-700/50 transition-colors group ${
                    !notification.is_read ? 'bg-blue-500/10' : ''
                  }`}
                >
                  <Link 
                    href={getNotificationUrl(notification)}
                    onClick={() => handleNotificationClick(notification)}
                    className="block p-4"
                  >
                    <div className="flex items-start gap-3">
                      {/* Icono de notificación */}
                      <div className={`text-2xl ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-semibold text-white truncate">
                            {notification.title}
                          </h4>
                          <span className="text-xs text-gray-400 flex-shrink-0 ml-2">
                            {formatTimeAgo(notification.created_at)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 line-clamp-2">
                          {notification.message}
                        </p>
                      </div>

                      {/* Indicador no leído */}
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                      )}
                    </div>
                  </Link>

                  {/* Botones de acción */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!notification.is_read && (
                      <button
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        className="p-1 text-gray-400 hover:text-green-400 transition-colors"
                        title="Marcar como leída"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={(e) => handleDelete(notification.id, e)}
                      className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-700 bg-gray-800/50">
              <Link
                href="/notifications"
                onClick={() => setIsOpen(false)}
                className="w-full text-center text-sm text-blue-400 hover:text-blue-300 transition-colors block"
              >
                Ver todas las notificaciones
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Overlay para cerrar en móvil */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
