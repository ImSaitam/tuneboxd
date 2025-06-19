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
      // Cargar likes count
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

  const handleLike = async () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para dar like');
      return;
    }

    setLikingInProgress(true);
    try {
      const method = userHasLiked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/lists/${listId}/likes`, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setUserHasLiked(!userHasLiked);
        setLikesCount(prev => userHasLiked ? prev - 1 : prev + 1);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error con like:', error);
      alert('Error al procesar like');
    } finally {
      setLikingInProgress(false);
    }
  };

  const loadComments = async () => {
    if (loadingComments) return;
    
    setLoadingComments(true);
    try {
      const response = await fetch(`/api/lists/${listId}/comments`);
      const data = await response.json();
      
      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error cargando comentarios:', error);
    } finally {
      setLoadingComments(false);
    }
  };

  const handleShowComments = () => {
    setShowComments(true);
    if (comments.length === 0) {
      loadComments();
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para comentar');
      return;
    }
    
    if (!newComment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/lists/${listId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ content: newComment.trim() })
      });

      const data = await response.json();
      if (data.success) {
        setComments(prev => [data.comment, ...prev]);
        setCommentsCount(prev => prev + 1);
        setNewComment('');
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error enviando comentario:', error);
      alert('Error al enviar comentario');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('¿Eliminar este comentario?')) return;

    try {
      const response = await fetch(`/api/lists/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setComments(prev => prev.filter(c => c.id !== commentId));
        setCommentsCount(prev => prev - 1);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error eliminando comentario:', error);
      alert('Error al eliminar comentario');
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
      setError('Error al remover álbum');
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
            <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            <div className="grid gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white/10 rounded-lg p-6">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-gray-700 rounded-lg"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-gray-300 mb-6">{error}</p>
          <Link 
            href="/lists"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
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
          <h1 className="text-2xl font-bold text-white mb-4">Lista no encontrada</h1>
          <Link 
            href="/lists"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
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
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/lists" className="text-white hover:text-gray-300 transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white">{list.name}</h1>
                {list.is_public ? (
                  <Eye size={20} className="text-green-400" />
                ) : (
                  <EyeOff size={20} className="text-yellow-400" />
                )}
              </div>
              {list.description && (
                <p className="text-gray-300">{list.description}</p>
              )}
              <div className="flex items-center gap-6 mt-3 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                  <User size={16} />
                  <span>Por {list.username || 'Usuario'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>Creada el {new Date(list.created_at).toLocaleDateString('es')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Music size={16} />
                  <span>{list.albums?.length || 0} álbumes</span>
                </div>
              </div>
            </div>
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Edit3 size={16} />
                Editar
              </button>
            </div>
          )}
        </div>

        {/* Likes y Comentarios */}
        <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 mb-8 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Botón de Like */}
              <button
                onClick={handleLike}
                disabled={likingInProgress}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  userHasLiked 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-white/20 hover:bg-white/30 text-white'
                } disabled:opacity-50`}
              >
                <Heart 
                  size={20} 
                  className={userHasLiked ? 'fill-current' : ''} 
                />
                <span>{likesCount} {likesCount === 1 ? 'like' : 'likes'}</span>
              </button>

              {/* Botón de Comentarios */}
              <button
                onClick={handleShowComments}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors"
              >
                <MessageCircle size={20} />
                <span>{commentsCount} {commentsCount === 1 ? 'comentario' : 'comentarios'}</span>
              </button>
            </div>
          </div>

          {/* Sección de Comentarios */}
          {showComments && (
            <div className="mt-6 border-t border-white/20 pt-6">
              {/* Formulario para nuevo comentario */}
              {isAuthenticated && (
                <form onSubmit={handleSubmitComment} className="mb-6">
                  <div className="flex gap-3">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Escribe un comentario..."
                      className="flex-1 bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      maxLength={500}
                    />
                    <button
                      type="submit"
                      disabled={submittingComment || !newComment.trim()}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submittingComment ? (
                        <Loader2 size={20} className="animate-spin" />
                      ) : (
                        <Send size={20} />
                      )}
                    </button>
                  </div>
                  <div className="text-xs text-gray-400 mt-2">
                    {newComment.length}/500 caracteres
                  </div>
                </form>
              )}

              {/* Lista de comentarios */}
              {loadingComments ? (
                <div className="flex justify-center py-8">
                  <Loader2 size={32} className="animate-spin text-white" />
                </div>
              ) : comments.length > 0 ? (
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="bg-white/5 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold text-white">{comment.username}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(comment.created_at).toLocaleDateString('es')}
                            </span>
                          </div>
                          <p className="text-gray-300">{comment.content}</p>
                        </div>
                        
                        {(isAuthenticated && (user?.username === comment.username || isOwner)) && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lista de Álbumes */}
        {list.albums && list.albums.length > 0 ? (
          <div className="space-y-6">
            {list.albums.map((album) => (
              <div key={album.id} className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-all duration-300">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  {/* Album Cover */}
                  <div className="flex-shrink-0">
                    <img
                      src={album.image_url || '/placeholder-album.png'}
                      alt={album.name}
                      className="w-24 h-24 rounded-lg object-cover cursor-pointer hover:scale-105 transition-transform duration-200"
                      onClick={() => handleAlbumClick(album)}
                    />
                  </div>

                  {/* Album Info */}
                  <div className="flex-1 min-w-0">
                    <h3 
                      className="text-xl font-bold text-white mb-1 cursor-pointer hover:text-blue-300 transition-colors"
                      onClick={() => handleAlbumClick(album)}
                    >
                      {album.name}
                    </h3>
                    <p className="text-gray-300 mb-2 truncate">{album.artist}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      {album.release_date && (
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          {new Date(album.release_date).getFullYear()}
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Plus size={16} />
                        Añadido el {new Date(album.added_at).toLocaleDateString('es')}
                      </div>
                    </div>

                    {album.notes && (
                      <div className="mt-3 p-3 bg-white/5 rounded-lg">
                        <p className="text-gray-300 text-sm">{album.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleAlbumClick(album)}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Music size={16} />
                      Ver Álbum
                    </button>
                    
                    {album.spotify_url && (
                      <a
                        href={album.spotify_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                      >
                        <ExternalLink size={16} />
                        Spotify
                      </a>
                    )}
                    
                    {isOwner && (
                      <button
                        onClick={() => handleRemoveAlbum(album.album_id)}
                        disabled={removingAlbums.has(album.album_id)}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={16} />
                        {removingAlbums.has(album.album_id) ? 'Removiendo...' : 'Remover'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Music size={64} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Lista vacía</h3>
            <p className="text-gray-300 mb-6">Esta lista no tiene álbumes aún</p>
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
    </div>
  );
}
