'use client';

import { useState, useEffect } from 'react';
import { Star, Calendar, Music, ArrowLeft, ExternalLink, Trash2, Heart, Plus } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';

export default function ListenListPage() {
  const [listenList, setListenList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingAlbums, setRemovingAlbums] = useState(new Set());
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      loadListenList();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadListenList = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/listen-list', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setListenList(data.listenList);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error cargando lista de escucha:', error);
      setError('Error al cargar la lista de escucha');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromListenList = async (albumId) => {
    if (removingAlbums.has(albumId)) return;
    
    setRemovingAlbums(prev => new Set(prev).add(albumId));
    
    try {
      const response = await fetch(`/api/listen-list?albumId=${albumId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setListenList(prev => prev.filter(item => item.album_id !== albumId));
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error removiendo álbum de la lista:', error);
      setError('Error al remover el álbum');
    } finally {
      setRemovingAlbums(prev => {
        const newSet = new Set(prev);
        newSet.delete(albumId);
        return newSet;
      });
    }
  };

  const handleAlbumClick = (album) => {
    router.push(`/album/${album.spotify_id}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-theme-muted mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-theme-primary mb-4">Acceso Requerido</h1>
          <p className="text-theme-secondary mb-6">Necesitas iniciar sesión para ver tu lista de escucha</p>
          <Link 
            href="/login"
            className="bg-theme-accent hover:bg-theme-hover text-theme-button font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-primary">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-theme-card rounded w-1/3"></div>
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-theme-card rounded-lg p-6 border border-theme-border">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-theme-hover rounded-lg"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-theme-hover rounded w-3/4"></div>
                    <div className="h-4 bg-theme-hover rounded w-1/2"></div>
                    <div className="h-4 bg-theme-hover rounded"></div>
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
    <div className="min-h-screen bg-theme-primary">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-theme-primary hover:text-theme-accent transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-theme-primary">Mi Lista de Escucha</h1>
              <p className="text-theme-secondary mt-1">Álbumes que quieres escuchar más tarde</p>
            </div>
          </div>
          
          {isAuthenticated && (
            <div className="text-right">
              <p className="text-theme-primary">¡Hola, {user?.username}!</p>
              <p className="text-theme-secondary text-sm">{listenList.length} álbum{listenList.length !== 1 ? 'es' : ''} guardado{listenList.length !== 1 ? 's' : ''}</p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
            <button 
              onClick={loadListenList}
              className="mt-4 bg-red-500 hover:bg-red-600 text-theme-button px-4 py-2 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Listen List Content */}
        {listenList.length > 0 ? (
          <div className="space-y-6">
            {listenList.map((item) => (
              <ListenListCard 
                key={item.id} 
                item={item} 
                onAlbumClick={handleAlbumClick}
                onRemove={handleRemoveFromListenList}
                isRemoving={removingAlbums.has(item.album_id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Heart size={64} className="text-theme-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-theme-primary mb-2">Tu lista de escucha está vacía</h3>
            <p className="text-theme-secondary mb-6">Comienza a añadir álbumes que quieras escuchar más tarde</p>
            <Link 
              href="/"
              className="bg-theme-accent hover:bg-theme-hover text-theme-button font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Explorar Música
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para cada álbum en la lista de escucha
function ListenListCard({ item, onAlbumClick, onRemove, isRemoving }) {
  return (
    <div className="bg-theme-card backdrop-blur-md rounded-lg p-6 border border-theme-border hover:bg-theme-hover transition-all duration-300">
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Album Cover */}
        <div className="flex-shrink-0">
          <img
            src={item.image_url || '/placeholder-album.png'}
            alt={item.album_name}
            className="w-24 h-24 rounded-lg object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
            onClick={() => onAlbumClick(item)}
          />
        </div>

        {/* Album Info */}
        <div className="flex-1 min-w-0">
          <h3 
            className="text-xl font-bold text-theme-primary mb-1 cursor-pointer hover:text-theme-accent transition-colors"
            onClick={() => onAlbumClick(item)}
          >
            {item.album_name}
          </h3>
          <p className="text-theme-secondary mb-2">{item.artist}</p>
          
          {item.release_date && (
            <div className="flex items-center gap-2 text-theme-muted text-sm mb-3">
              <Calendar size={16} />
              {new Date(item.release_date).getFullYear()}
            </div>
          )}

          <div className="flex items-center gap-2 text-theme-muted text-sm">
            <Plus size={16} />
            Añadido el {new Date(item.created_at).toLocaleDateString('es')}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onAlbumClick(item)}
            className="flex items-center gap-2 px-4 py-2 bg-theme-accent hover:bg-theme-hover text-theme-button rounded-lg transition-colors"
          >
            <Music size={16} />
            Ver Álbum
          </button>
          
          {item.spotify_url && (
            <a
              href={item.spotify_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-theme-button rounded-lg transition-colors"
            >
              <ExternalLink size={16} />
              Spotify
            </a>
          )}
          
          <button
            onClick={() => onRemove(item.album_id)}
            disabled={isRemoving}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-theme-button rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={16} />
            {isRemoving ? 'Removiendo...' : 'Remover'}
          </button>
        </div>
      </div>
    </div>
  );
}
