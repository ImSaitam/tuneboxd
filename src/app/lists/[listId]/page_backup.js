'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Music, 
  Eye, 
  EyeOff,
  Calendar,
  User,
  Plus,
  ExternalLink,
  X,
  Loader2,
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal
} from 'lucide-react';

export default function ListDetailPage() {
  const params = useParams();
  const listId = params.listId;
  const [list, setList] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [removingAlbums, setRemovingAlbums] = useState(new Set());
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Estados para likes y comentarios
  const [likesCount, setLikesCount] = useState(0);
  const [commentsCount, setCommentsCount] = useState(0);
  const [userHasLiked, setUserHasLiked] = useState(false);
  const [likingInProgress, setLikingInProgress] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentText, setEditCommentText] = useState('');
  
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (listId) {
      loadList();
    }
  }, [listId]);

  const loadList = async () => {
    try {
      setLoading(true);
      const headers = {};
      if (isAuthenticated) {
        headers['Authorization'] = `Bearer ${localStorage.getItem('auth_token')}`;
      }

      const response = await fetch(`/api/lists/${listId}`, { headers });
      const data = await response.json();
      
      if (data.success) {
        setList(data.list);
        
        // Cargar estadísticas de likes y comentarios
        await loadListStats();
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error cargando lista:', error);
      setError('Error al cargar la lista');
    } finally {
      setLoading(false);
    }
  };

  const loadListStats = async () => {
    try {
      // Cargar likes
      const likesResponse = await fetch(`/api/lists/${listId}/likes`);
      const likesData = await likesResponse.json();
      if (likesData.success) {
        setLikesCount(likesData.pagination.totalCount);
      }

      // Cargar comentarios count
      const commentsResponse = await fetch(`/api/lists/${listId}/comments?limit=1`);
      const commentsData = await commentsResponse.json();
      if (commentsData.success) {
        setCommentsCount(commentsData.pagination.totalCount);
      }

      // Verificar si el usuario le dio like (solo si está autenticado)
      if (isAuthenticated) {
        const userLikeResponse = await fetch(`/api/lists/${listId}/likes`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        const userLikeData = await userLikeResponse.json();
        if (userLikeData.success) {
          const userLike = userLikeData.likes.find(like => like.username === user?.username);
          setUserHasLiked(!!userLike);
        }
      }
    } catch (error) {
      console.error('Error cargando estadísticas:', error);
    }
  };
        setError(data.message);
      }
    } catch (error) {
      console.error('Error cargando lista:', error);
      setError('Error al cargar la lista');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAlbum = async (albumId) => {
    if (!confirm('¿Quieres remover este álbum de la lista?')) {
      return;
    }

    setRemovingAlbums(prev => new Set(prev).add(albumId));
    
    try {
      const response = await fetch(`/api/lists/${listId}/albums?albumId=${albumId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setList(prev => ({
          ...prev,
          albums: prev.albums.filter(album => album.album_id !== albumId)
        }));
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error removiendo álbum:', error);
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
    window.location.href = `/album/${album.spotify_id}`;
  };

  const isOwner = isAuthenticated && user && list && user.id === list.user_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="bg-white/10 rounded-lg p-6">
              <div className="space-y-4">
                <div className="h-6 bg-gray-700 rounded w-1/2"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/4"></div>
              </div>
            </div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white/10 rounded-lg p-4">
                <div className="flex gap-4">
                  <div className="w-20 h-20 bg-gray-700 rounded-lg"></div>
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                  </div>
                </div>
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
        <div className="text-center">
          <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <Link 
            href="/lists"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Volver a Listas
          </Link>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Lista no encontrada</h1>
          <p className="text-gray-300 mb-6">La lista que buscas no existe o no tienes permisos para verla</p>
          <Link 
            href="/lists"
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            Volver a Listas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-start gap-4">
            <Link href="/lists" className="text-white hover:text-gray-300 transition-colors mt-1">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{list.name}</h1>
              {list.description && (
                <p className="text-gray-300 mb-4 max-w-2xl">{list.description}</p>
              )}
              
              {/* Meta info */}
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <User size={14} />
                  <span>{list.username || 'Usuario'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Music size={14} />
                  <span>{list.albums?.length || 0} álbum{(list.albums?.length || 0) !== 1 ? 'es' : ''}</span>
                </div>
                <div className="flex items-center gap-1">
                  {list.is_public ? <Eye size={14} /> : <EyeOff size={14} />}
                  <span>{list.is_public ? 'Pública' : 'Privada'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span>Actualizada {new Date(list.updated_at).toLocaleDateString('es')}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Actions (solo para el propietario) */}
          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/50 hover:bg-blue-600/70 text-white rounded-lg transition-colors"
              >
                <Edit3 size={16} />
                Editar
              </button>
            </div>
          )}
        </div>

        {/* Albums Grid */}
        {list.albums && list.albums.length > 0 ? (
          <div className="space-y-4">
            {list.albums.map((album) => (
              <AlbumCard 
                key={album.album_id} 
                album={album}
                isOwner={isOwner}
                onAlbumClick={handleAlbumClick}
                onRemove={handleRemoveAlbum}
                isRemoving={removingAlbums.has(album.album_id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Music size={64} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Esta lista está vacía</h3>
            <p className="text-gray-300 mb-6">
              {isOwner 
                ? 'Agrega álbumes desde cualquier página de álbum usando el botón "Agregar a lista"'
                : 'El propietario de esta lista aún no ha agregado álbumes'
              }
            </p>
            {isOwner && (
              <Link 
                href="/"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Explorar Música
              </Link>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditListModal
          list={list}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            loadList();
            setShowEditModal(false);
          }}
        />
      )}
    </div>
  );
}

// Componente para cada álbum en la lista
function AlbumCard({ album, isOwner, onAlbumClick, onRemove, isRemoving }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 hover:bg-white/15 transition-all duration-300 border border-white/10">
      <div className="flex gap-4">
        {/* Album Cover */}
        <div 
          className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer"
          onClick={() => onAlbumClick(album)}
        >
          {album.image_url ? (
            <img 
              src={album.image_url} 
              alt={album.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gray-700 flex items-center justify-center">
              <Music size={24} className="text-gray-500" />
            </div>
          )}
        </div>

        {/* Album Info */}
        <div className="flex-1 min-w-0">
          <h3 
            className="text-lg font-bold text-white mb-1 cursor-pointer hover:text-purple-300 transition-colors truncate"
            onClick={() => onAlbumClick(album)}
          >
            {album.name}
          </h3>
          <p className="text-gray-300 mb-2 truncate">{album.artist}</p>
          
          <div className="flex items-center gap-4 text-sm text-gray-400">
            {album.release_date && (
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{new Date(album.release_date).getFullYear()}</span>
              </div>
            )}
            
            <div className="flex items-center gap-1">
              <Plus size={14} />
              <span>Agregado {new Date(album.added_at).toLocaleDateString('es')}</span>
            </div>
          </div>

          {/* Notes */}
          {album.notes && (
            <div className="mt-2 p-2 bg-white/5 rounded text-sm text-gray-300">
              <span className="font-medium">Nota:</span> {album.notes}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 flex-shrink-0">
          <button
            onClick={() => onAlbumClick(album)}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600/50 hover:bg-blue-600/70 text-white rounded-lg transition-colors text-sm"
          >
            <Music size={14} />
            Ver Álbum
          </button>
          
          {album.spotify_url && (
            <a
              href={album.spotify_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 bg-green-600/50 hover:bg-green-600/70 text-white rounded-lg transition-colors text-sm"
            >
              <ExternalLink size={14} />
              Spotify
            </a>
          )}

          {isOwner && (
            <button
              onClick={() => onRemove(album.album_id)}
              disabled={isRemoving}
              className="flex items-center gap-2 px-3 py-2 bg-red-600/50 hover:bg-red-600/70 text-white rounded-lg transition-colors text-sm disabled:opacity-50"
            >
              {isRemoving ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
              Remover
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Modal para editar lista
function EditListModal({ list, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: list.name || '',
    description: list.description || '',
    is_public: list.is_public ?? true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/lists/${list.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        onSave();
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error actualizando lista:', error);
      setError('Error al actualizar la lista');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">Editar Lista</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nombre de la lista *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={100}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Descripción (opcional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={500}
            />
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_public}
                onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                className="w-4 h-4 text-purple-600 bg-gray-800 border-gray-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-300">Hacer esta lista pública</span>
            </label>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving || !formData.name.trim()}
              className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving && <Loader2 size={16} className="animate-spin" />}
              Actualizar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
