"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useNotifications } from '../../../hooks/useNotifications';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, 
  Save, 
  ArrowLeft, 
  AlertCircle, 
  Clock,
  Loader2,
  X
} from 'lucide-react';

const EditProfilePage = () => {
  const { user, isAuthenticated, loading: authLoading, updateUserData } = useAuth();
  const { success: showSuccess, error: showError } = useNotifications();
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    profilePicture: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [canChangeUsername, setCanChangeUsername] = useState(true);
  const [daysUntilUsernameChange, setDaysUntilUsernameChange] = useState(0);
  const [previewImage, setPreviewImage] = useState(null);

  // Cargar datos del usuario
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        bio: user.bio || '',
        profilePicture: user.profile_picture || ''
      });
      setPreviewImage(user.profile_picture);
    }
  }, [user]);

  // Verificar estado de cambio de username
  useEffect(() => {
    const checkUsernameStatus = async () => {
      if (!isAuthenticated) return;
      
      try {
        const response = await fetch('/api/auth/profile', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setCanChangeUsername(data.canChangeUsername);
          setDaysUntilUsernameChange(data.daysUntilUsernameChange);
        }
      } catch (error) {
        console.error('Error verificando estado del username:', error);
      }
    };

    checkUsernameStatus();
  }, [isAuthenticated]);

  // Redirigir si no está autenticado
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData(prev => ({
      ...prev,
      profilePicture: url
    }));
    setPreviewImage(url);
  };

  const removeImage = () => {
    setPreviewImage(null);
    setFormData(prev => ({
      ...prev,
      profilePicture: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        // Actualizar datos del usuario en el contexto
        await updateUserData(data.user);
        
        showSuccess('Perfil actualizado exitosamente');
        
        // Redirigir al perfil del usuario
        router.push(`/profile/${data.user.username}`);
      } else {
        showError(data.message);
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      showError('Error al actualizar el perfil. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-theme-primary animate-spin" />
          <p className="text-theme-primary text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-theme-primary">
      {/* Header */}
      <div className="bg-theme-card backdrop-blur-sm border-b border-theme-border">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href={`/profile/${user?.username}`}
              className="flex items-center space-x-2 text-theme-primary hover:text-theme-accent transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al perfil</span>
            </Link>
            <h1 className="text-xl font-bold text-theme-primary">Editar Perfil</h1>
            <div className="w-20"></div> {/* Spacer para centrar el título */}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-theme-card backdrop-blur-sm rounded-3xl p-8 border border-theme-border shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Profile Picture Section */}
            <div className="text-center">
              <h2 className="text-2xl font-bold text-theme-primary mb-6">Foto de Perfil</h2>
              
              <div className="relative inline-block mb-6">
                {previewImage ? (
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt="Preview"
                      className="w-32 h-32 rounded-full object-cover border-4 border-theme-border"
                      onError={() => {
                        setPreviewImage(null);
                        showError('Error al cargar la imagen. Verifica que la URL sea válida.');
                      }}
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-32 rounded-full bg-theme-accent flex items-center justify-center border-4 border-theme-border">
                    <User className="w-16 h-16 text-theme-primary" />
                  </div>
                )}
              </div>

              <div className="space-y-3">
                <label className="block text-theme-primary font-medium text-left">
                  URL de la imagen
                </label>
                <input
                  type="url"
                  value={formData.profilePicture}
                  onChange={handleImageUrlChange}
                  className="w-full px-4 py-3 bg-theme-card border border-theme-border rounded-lg text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-accent transition-all"
                  placeholder="https://ejemplo.com/mi-foto.jpg"
                />
                
                <p className="text-theme-secondary text-sm">
                  Ingresa la URL de tu imagen de perfil. Formatos soportados: JPG, PNG, WebP, GIF.
                </p>
              </div>
            </div>

            {/* Username Section */}
            <div>
              <label className="block text-theme-primary font-medium mb-2">
                Nombre de Usuario
              </label>
              <div className="space-y-3">
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled={!canChangeUsername}
                  className={`w-full px-4 py-3 bg-theme-card border border-theme-border rounded-lg text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-accent transition-all ${
                    !canChangeUsername ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="Tu nombre de usuario"
                  maxLength={20}
                  pattern="[a-zA-Z0-9_]+"
                />
                
                {!canChangeUsername && (
                  <div className="flex items-start space-x-2 p-3 bg-orange-500/20 border border-orange-400/30 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div className="text-orange-200 text-sm">
                      <p className="font-medium">No puedes cambiar tu nombre de usuario aún</p>
                      <p>Debes esperar {daysUntilUsernameChange} días más. Los cambios de username están limitados a una vez cada 14 días.</p>
                    </div>
                  </div>
                )}

                <div className="text-right text-theme-secondary text-xs">
                  {formData.username.length}/20
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div>
              <label className="block text-theme-primary font-medium mb-2">
                Biografía
              </label>
              <div className="space-y-3">
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-theme-card border border-theme-border rounded-lg text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-accent resize-none transition-all"
                  placeholder="Cuéntanos algo sobre ti y tus gustos musicales..."
                  rows={4}
                  maxLength={500}
                />
                
                <div className="text-right text-theme-secondary text-xs">
                  {formData.bio.length}/500
                </div>
              </div>
            </div>

            {/* Guidelines */}
            <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-blue-200 text-sm space-y-2">
                  <p className="font-medium">Pautas para el perfil:</p>
                  <ul className="space-y-1 text-xs">
                    <li>• El nombre de usuario debe tener entre 3-20 caracteres</li>
                    <li>• Solo se permiten letras, números y guiones bajos</li>
                    <li>• Puedes cambiar tu nombre de usuario una vez cada 14 días</li>
                    <li>• La biografía debe ser apropiada y respetuosa</li>
                    <li>• Usa URLs de imágenes públicas para tu foto de perfil</li>
                    <li>• Soportamos JPG, PNG, WebP y GIF (incluyendo GIFs animados)</li>
                    <li>• Las imágenes deben ser apropiadas para todos los públicos</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex space-x-4 pt-6">
              <Link
                href={`/profile/${user?.username}`}
                className="flex-1 px-6 py-3 bg-theme-secondary hover:bg-theme-card text-theme-primary rounded-lg font-medium transition-colors text-center"
              >
                Cancelar
              </Link>
              
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-theme-accent hover:opacity-90 text-theme-button rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Guardar Cambios</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfilePage;
