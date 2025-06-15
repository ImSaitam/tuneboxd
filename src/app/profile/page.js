"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import { Loader2 } from 'lucide-react';

const ProfileRedirect = () => {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user?.username) {
        // Redirigir al perfil dinámico del usuario actual
        router.replace(`/profile/${user.username}`);
      } else {
        // Si no está autenticado, redirigir al login
        router.replace('/login');
      }
    }
  }, [user, isAuthenticated, loading, router]);

  // Mostrar loading mientras se redirige
  return (
    <div className="min-h-screen bg-theme-primary flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="w-12 h-12 text-theme-primary animate-spin" />
        <p className="text-theme-primary text-lg">Cargando perfil...</p>
      </div>
    </div>
  );
};

export default ProfileRedirect;