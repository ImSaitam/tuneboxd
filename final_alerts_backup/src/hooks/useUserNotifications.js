'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { useAuth } from './useAuth';

// Contexto para las notificaciones
const UserNotificationContext = createContext();

// Hook para usar las notificaciones
export const useUserNotifications = () => {
  const context = useContext(UserNotificationContext);
  if (!context) {
    throw new Error('useUserNotifications debe usarse dentro de un UserNotificationProvider');
  }
  return context;
};

// Proveedor de notificaciones de usuario
export const UserNotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(null);
  const { isAuthenticated } = useAuth();

  // Cargar notificaciones
  const fetchNotifications = useCallback(async (unreadOnly = false, limit = 20, offset = 0) => {
    if (!isAuthenticated) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: offset.toString(),
        unread_only: unreadOnly.toString()
      });

      const response = await fetch(`/api/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        if (offset === 0) {
          setNotifications(data.notifications);
        } else {
          setNotifications(prev => [...prev, ...data.notifications]);
        }
        setUnreadCount(data.pagination.totalUnread);
        setLastFetch(new Date());
      } else {
        console.error('Error fetching notifications:', data.message);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Marcar notificación como leída
  const markAsRead = useCallback(async (notificationId) => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          action: 'mark_read',
          notificationId
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId 
              ? { ...notif, is_read: true }
              : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, [isAuthenticated]);

  // Marcar todas como leídas
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          action: 'mark_read'
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, is_read: true }))
        );
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  }, [isAuthenticated]);

  // Eliminar notificación
  const deleteNotification = useCallback(async (notificationId) => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch(`/api/notifications?id=${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
        // Recalcular unread count
        setUnreadCount(prev => {
          const deletedNotif = notifications.find(n => n.id === notificationId);
          return deletedNotif && !deletedNotif.is_read ? Math.max(0, prev - 1) : prev;
        });
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  }, [isAuthenticated, notifications]);

  // Eliminar todas las notificaciones
  const deleteAllNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch('/api/notifications', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setNotifications([]);
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error deleting all notifications:', error);
    }
  }, [isAuthenticated]);

  // Obtener solo notificaciones no leídas
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await fetch('/api/notifications?unread_only=true&limit=1', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setUnreadCount(data.pagination.totalUnread);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [isAuthenticated]);

  // Función para obtener el icono según el tipo de notificación
  const getNotificationIcon = useCallback((type) => {
    switch (type) {
      case 'follow':
        return '👤';
      case 'list_like':
        return '❤️';
      case 'list_comment':
        return '💬';
      case 'thread_comment':
        return '💭';
      default:
        return '🔔';
    }
  }, []);

  // Función para obtener el color según el tipo
  const getNotificationColor = useCallback((type) => {
    switch (type) {
      case 'follow':
        return 'text-blue-400';
      case 'list_like':
        return 'text-red-400';
      case 'list_comment':
        return 'text-green-400';
      case 'thread_comment':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  }, []);

  // Función para obtener la URL de destino
  const getNotificationUrl = useCallback((notification) => {
    switch (notification.type) {
      case 'follow':
        return `/profile/${notification.from_username}`;
      case 'list_like':
      case 'list_comment':
        return `/lists/${notification.list_id}`;
      case 'thread_comment':
        return `/community/thread/${notification.thread_id}`;
      default:
        return '/';
    }
  }, []);

  // Auto-fetch inicial y periódico
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
      
      // Fetch unread count cada 30 segundos
      const interval = setInterval(fetchUnreadCount, 30000);
      
      return () => clearInterval(interval);
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  const value = {
    notifications,
    unreadCount,
    loading,
    lastFetch,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    fetchUnreadCount,
    getNotificationIcon,
    getNotificationColor,
    getNotificationUrl
  };

  return (
    <UserNotificationContext.Provider value={value}>
      {children}
    </UserNotificationContext.Provider>
  );
};

export default useUserNotifications;
