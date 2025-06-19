"use client";

import { useState, useEffect, createContext, useContext, useCallback } from 'react';

// Contexto de autenticación
const AuthContext = createContext();

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Provider del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar si hay un token válido en localStorage
      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          // Validar el token con el servidor
          const userData = await validateToken(token);
          setUser(userData.user);
        } catch (validationError) {
          console.error('Error validando token:', validationError);
          
          // Solo eliminar token si es definitivamente inválido (no errores de red)
          if (validationError.message === 'Token inválido') {
            localStorage.removeItem('auth_token');
          }
          setUser(null);
        }
      } else {
        // No hay token, usuario no autenticado
        setUser(null);
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      // Error general, no eliminar token automáticamente
      setUser(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Verificar si hay un usuario autenticado al cargar la aplicación
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const validateToken = async (token) => {
    // Hacer llamada al API para validar el token
    const response = await fetch('/api/auth/validate', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      // Si es un error de red (500, etc.) no invalidar el token
      if (response.status >= 500) {
        throw new Error('Error de servidor al validar token');
      }
      // Solo para errores 401/403 (token inválido/expirado)
      throw new Error('Token inválido');
    }
    
    return await response.json();
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Manejar casos específicos de error
        if (data.needsVerification) {
          const error = new Error(data.message || 'Verificación requerida');
          error.needsVerification = true;
          error.email = data.email;
          throw error;
        }
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Guardar token y datos del usuario
      localStorage.setItem('auth_token', data.token);
      setUser(data.user);
      
      return { success: true, user: data.user };
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar usuario');
      }

      return { success: true, message: data.message };
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      
      // Llamar al endpoint de logout si existe
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
    } catch (error) {
      console.error('Error en logout:', error);
    } finally {
      // Limpiar datos locales
      localStorage.removeItem('auth_token');
      setUser(null);
      setLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al enviar correo de recuperación');
      }

      return { success: true, message: data.message };
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password: newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al restablecer contraseña');
      }

      return { success: true, message: data.message };
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(profileData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar perfil');
      }

      setUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateUserData = async (userData) => {
    try {
      setUser(userData);
      return { success: true };
    } catch (error) {
      console.error('Error actualizando datos del usuario:', error);
      setError(error.message);
      throw error;
    }
  };

  const refreshAuth = useCallback(async () => {
    await checkAuthStatus();
  }, [checkAuthStatus]);

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    updateUserData,
    refreshAuth,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado con funcionalidades adicionales
export const useAuthForm = () => {
  const [formData, setFormData] = useState({});
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const setFieldError = (field, error) => {
    setFormErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const clearErrors = () => {
    setFormErrors({});
  };

  const resetForm = () => {
    setFormData({});
    setFormErrors({});
    setIsSubmitting(false);
  };

  return {
    formData,
    formErrors,
    isSubmitting,
    updateField,
    setFieldError,
    clearErrors,
    resetForm,
    setIsSubmitting
  };
};
