"use client";

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook personalizado para verificar permisos de administrador
 * @returns {Object} - { isAdmin, loading, error, checkAdminStatus }
 */
export const useAdminAuth = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAdminStatus = async () => {
    if (!isAuthenticated || !user) {
      setIsAdmin(false);
      setLoading(false);
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      // Verificar directamente desde el usuario en el contexto
      const adminStatus = user.role === 'admin';
      setIsAdmin(adminStatus);
      
      // Opcionalmente, hacer una verificación adicional con el servidor
      const token = localStorage.getItem('auth_token');
      if (token && adminStatus) {
        const response = await fetch('/api/auth/admin-check', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        } else {
          // Si la verificación del servidor falla, usar el estado local
          console.warn('Verificación de admin en servidor falló, usando estado local');
        }
      }

      setLoading(false);
      return adminStatus;
    } catch (err) {
      console.error('Error verificando permisos de admin:', err);
      setError(err.message);
      setIsAdmin(false);
      setLoading(false);
      return false;
    }
  };

  useEffect(() => {
    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, isAuthenticated, authLoading, checkAdminStatus]);

  return {
    isAdmin,
    loading: loading || authLoading,
    error,
    checkAdminStatus
  };
};
