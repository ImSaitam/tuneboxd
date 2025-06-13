'use client';

import { useState, useEffect } from 'react';
import { Star, Calendar, User, Music, ArrowLeft, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reviews?type=recent&limit=20');
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.reviews);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error cargando reseñas:', error);
      setError('Error al cargar las reseñas');
    } finally {
      setLoading(false);
    }
  };

  const handleAlbumClick = (album) => {
    window.location.href = `/album/${album.spotify_id}`;
  };

  const handleArtistClick = async (artistName) => {
    try {
      // Buscar el artista en Spotify para obtener su ID
      const response = await fetch(`/api/spotify/search?q=${encodeURIComponent(artistName)}&type=artist&limit=1`);
      const data = await response.json();
      
      if (data.success && data.data.items && data.data.items.length > 0) {
        const artist = data.data.items[0];
        window.location.href = `/artist/${artist.id}`;
      } else {
        // Si no se encuentra, hacer una búsqueda general
        window.location.href = `/?search=${encodeURIComponent(artistName)}&type=artist`;
      }
    } catch (error) {
      console.error('Error buscando artista:', error);
      // Fallback a búsqueda general
      window.location.href = `/?search=${encodeURIComponent(artistName)}&type=artist`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white/10 rounded-lg p-6">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-700 rounded-lg"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-700 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-white hover:text-gray-300 transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white">Reseñas de la Comunidad</h1>
              <p className="text-gray-300 mt-1">Descubre qué opina la comunidad sobre los últimos álbumes</p>
            </div>
          </div>
          
          {isAuthenticated && (
            <div className="text-right">
              <p className="text-white">¡Hola, {user?.username}!</p>
              <p className="text-gray-300 text-sm">¿Ya escribiste tu reseña hoy?</p>
            </div>
          )}
        </div>

        {/* Stats Banner */}
        <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-md border border-white/20 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-white">{reviews.length}</div>
              <div className="text-gray-300">Reseñas Recientes</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-400">
                {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '0'}
              </div>
              <div className="text-gray-300">Rating Promedio</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400">
                {new Set(reviews.map(r => r.album_id)).size}
              </div>
              <div className="text-gray-300">Álbumes Únicos</div>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        {error ? (
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 text-center">
            <p className="text-red-300">{error}</p>
            <button
              onClick={loadReviews}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        ) : reviews.length > 0 ? (
          <div className="space-y-6">
            {reviews.map((review) => (
              <ReviewCard 
                key={review.id} 
                review={review} 
                onAlbumClick={handleAlbumClick}
                onArtistClick={handleArtistClick}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Music size={64} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No hay reseñas aún</h3>
            <p className="text-gray-300 mb-6">¡Sé el primero en escribir una reseña!</p>
            {isAuthenticated ? (
              <Link 
                href="/"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Buscar Álbumes
              </Link>
            ) : (
              <Link 
                href="/login"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Iniciar Sesión
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para cada reseña
function ReviewCard({ review, onAlbumClick, onArtistClick }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg p-6 hover:bg-white/15 transition-all duration-300">
      <div className="flex gap-4">
        {/* Album Cover */}
        <div 
          className="w-20 h-20 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform duration-300 flex-shrink-0"
          onClick={() => onAlbumClick(review)}
        >
          {review.image_url ? (
            <img
              src={review.image_url}
              alt={review.album_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
              <Music className="w-8 h-8 text-white" />
            </div>
          )}
        </div>

        {/* Review Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <User size={16} className="text-gray-400 flex-shrink-0" />
                <span className="text-white font-medium">{review.username}</span>
                <span className="text-gray-400">•</span>
                <Calendar size={16} className="text-gray-400 flex-shrink-0" />
                <span className="text-gray-300 text-sm">{formatDate(review.created_at)}</span>
              </div>
              
              <div>
                <h3 
                  className="text-lg font-bold text-white truncate cursor-pointer hover:text-blue-300 transition-colors"
                  onClick={() => onAlbumClick(review)}
                >
                  {review.album_name}
                </h3>
                <p 
                  className="text-gray-300 text-sm hover:text-teal-300 transition-colors cursor-pointer"
                  onClick={() => onArtistClick(review.artist)}
                >
                  {review.artist}
                </p>
              </div>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 ml-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={20}
                  className={
                    star <= review.rating
                      ? 'text-yellow-400 fill-current'
                      : 'text-gray-400'
                  }
                />
              ))}
            </div>
          </div>

          {/* Review Title */}
          {review.title && (
            <h4 className="text-white font-semibold mb-2 text-lg">{review.title}</h4>
          )}

          {/* Review Content */}
          {review.content && (
            <p className="text-gray-300 leading-relaxed mb-3 line-clamp-3">
              {review.content}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={() => onAlbumClick(review)}
              className="text-blue-400 hover:text-blue-300 transition-colors text-sm font-medium"
            >
              Ver Álbum
            </button>
            
            {review.spotify_url && (
              <a
                href={review.spotify_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-green-400 hover:text-green-300 transition-colors text-sm font-medium"
              >
                <ExternalLink size={14} />
                Spotify
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
