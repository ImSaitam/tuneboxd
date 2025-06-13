'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { ArrowLeft, User, Music, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function FollowingArtistsPage() {
  const { user, isAuthenticated } = useAuth();
  const [followedArtists, setFollowedArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchFollowedArtists = async () => {
      try {
        const response = await fetch('/api/artists/following', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });

        const data = await response.json();
        if (data.success) {
          setFollowedArtists(data.artists);
        } else {
          setError(data.message);
        }
      } catch (error) {
        console.error('Error obteniendo artistas seguidos:', error);
        setError('Error al cargar los artistas seguidos');
      } finally {
        setLoading(false);
      }
    };

    fetchFollowedArtists();
  }, [isAuthenticated]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Acceso Requerido</h1>
          <p className="text-gray-300 mb-6">Necesitas iniciar sesión para ver tus artistas seguidos</p>
          <Link 
            href="/login"
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-4 mb-8">
            <Link 
              href="/"
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </Link>
            <h1 className="text-3xl font-bold text-white">Artistas Seguidos</h1>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 animate-pulse">
                <div className="w-32 h-32 bg-gray-600 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded mb-4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-2xl font-bold mb-4">Error</h1>
          <p className="text-gray-300 mb-4">{error}</p>
          <Link href="/" className="text-blue-400 hover:text-blue-300">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/"
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white">Artistas Seguidos</h1>
            <p className="text-gray-300 mt-1">
              {followedArtists.length} artista{followedArtists.length !== 1 ? 's' : ''} seguido{followedArtists.length !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <Link
              href="/profile"
              className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
            >
              También disponible en tu perfil →
            </Link>
          </div>
        </div>

        {followedArtists.length === 0 ? (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">No sigues a ningún artista</h2>
            <p className="text-gray-300 mb-6">
              Busca artistas en la página principal y empieza a seguir a tus favoritos
            </p>
            <Link 
              href="/"
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Explorar Artistas
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {followedArtists.map((artist) => (
              <div key={artist.artist_id} className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300 group">
                {/* Artist Image */}
                <div className="relative mb-4">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden bg-gradient-to-br from-red-400 to-teal-400">
                    {artist.artist_image ? (
                      <img
                        src={artist.artist_image}
                        alt={artist.artist_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white">
                        <User className="w-12 h-12" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Artist Info */}
                <div className="text-center">
                  <h3 className="font-bold text-white text-lg mb-2 group-hover:text-teal-300 transition-colors">
                    {artist.artist_name}
                  </h3>
                  
                  <div className="flex items-center justify-center gap-1 text-gray-400 text-sm mb-4">
                    <Calendar className="w-4 h-4" />
                    <span>Siguiendo desde {formatDate(artist.followed_at)}</span>
                  </div>

                  <Link
                    href={`/artist/${artist.artist_id}`}
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Ver Perfil
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
