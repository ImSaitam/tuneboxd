'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useGlobalModal } from '../../../components/ModalContext';
import { useParams, useRouter } from 'next/navigation';
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
  const router = useRouter();
  const listId = params.listId;
  const { alert, confirm, success, error: showError, notify, notifyError, notifySuccess } = useGlobalModal();
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
  const commentsSectionRef = useRef(null);
  
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (listId) {
      loadList();
    }
  }, [listId]); // eslint-disable-line react-hooks/exhaustive-deps

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
        showError(data.message || 'Error al procesar like');
      }
    } catch (error) {
      console.error('Error con like:', error);
      showError('Error al procesar like');
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
    setTimeout(() => {
      if (commentsSectionRef.current) {
        commentsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
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
        notify('Comentario agregado exitosamente');
      } else {
        notifyError(data.message || 'Error al enviar comentario');
      }
    } catch (error) {
      console.error('Error enviando comentario:', error);
      notifyError('Error al enviar comentario');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    const confirmed = await confirm('¿Eliminar este comentario?');
    if (!confirmed) return;

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
        notify('Comentario eliminado');
      } else {
        notifyError(data.message || 'Error al eliminar comentario');
      }
    } catch (error) {
      console.error('Error eliminando comentario:', error);
      notifyError('Error al eliminar comentario');
    }
  };

  const handleRemoveAlbum = async (albumId) => {
    const confirmed = await confirm('¿Quieres remover este álbum de la lista?');
    if (!confirmed) return;

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
    router.push(`/album/${album.spotify_id}`);
  };

  const isOwner = isAuthenticated && user && list && user.id === list.user_id;

  if (loading) {
    return (
      <div className="min-h-screen bg-theme-primary">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-theme-card rounded w-1/3"></div>
            <div className="h-4 bg-theme-card rounded w-1/2"></div>
            <div className="grid gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-theme-card rounded-lg p-6">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 bg-theme-card-hover rounded-lg"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-6 bg-theme-card-hover rounded w-3/4"></div>
                      <div className="h-4 bg-theme-card-hover rounded w-1/2"></div>
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
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-theme-primary mb-4">Error</h1>
          <p className="text-theme-secondary mb-6">{error}</p>
          <Link 
            href="/lists"
            className="bg-theme-accent hover:bg-theme-hover text-theme-button px-6 py-3 rounded-lg transition-colors"
          >
            Volver a Listas
          </Link>
        </div>
      </div>
    );
  }

  if (!list) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-theme-primary mb-4">Lista no encontrada</h1>
          <Link 
            href="/lists"
            className="bg-theme-accent hover:bg-theme-hover text-theme-button px-6 py-3 rounded-lg transition-colors"
          >
            Volver a Listas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-primary overflow-x-hidden">
      <div className="container mx-auto px-4 py-8">
        {/* Header visual destacado */}
        <div className="relative w-full max-w-4xl mx-auto mt-8 mb-12">
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 z-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#059669] to-[#0891b2] blur-2xl opacity-40"></div>
          </div>
          <div className="relative z-10 flex flex-col items-center text-center">
            <span style={{
              display: 'inline-flex',
              filter: 'drop-shadow(0 0 16px #059669) drop-shadow(0 0 32px #0891b2)'
            }}>
              {list.is_public ? (
                <Eye className="w-14 h-14 text-theme-accent mb-2" />
              ) : (
                <EyeOff className="w-14 h-14 text-yellow-400 mb-2" />
              )}
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-theme-accent mb-2 tracking-tight">{list.name}</h1>
            {list.description && (
              <p className="text-theme-secondary max-w-xl mb-2">{list.description}</p>
            )}
            <div className="flex flex-wrap gap-4 justify-center mt-2 text-sm text-theme-muted">
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
            {isOwner && (
              <button
                onClick={() => setShowEditModal(true)}
                className="flex items-center gap-2 mt-4 px-6 py-3 bg-gradient-to-r from-[#059669] to-[#0891b2] hover:from-[#0891b2] hover:to-[#059669] text-white font-semibold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition-all duration-300 justify-center"
              >
                <Edit3 size={18} />
                Editar
              </button>
            )}
          </div>
        </div>

        {/* Likes y Comentarios */}
        <div className="bg-theme-card backdrop-blur-md rounded-xl p-6 mb-8 border border-theme">
          <div className="flex items-center justify-center gap-6 flex-wrap">
            {/* Botón de Like */}
            <button
              onClick={handleLike}
              disabled={likingInProgress}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-semibold shadow-lg hover:scale-105 hover:shadow-2xl justify-center ${
                userHasLiked 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'bg-gradient-to-r from-[#059669] to-[#0891b2] hover:from-[#0891b2] hover:to-[#059669] text-white'
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
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 justify-center shadow-lg"
            >
              <MessageCircle size={20} />
              <span>{commentsCount} {commentsCount === 1 ? 'comentario' : 'comentarios'}</span>
            </button>
          </div>
        </div>

        {/* Lista de Álbumes */}
        {list.albums && list.albums.length > 0 ? (
          <div className="space-y-6">
            {list.albums.map((album) => (
              <div key={album.id} className="bg-theme-card backdrop-blur-md rounded-lg p-6 border border-theme hover:bg-theme-card-hover transition-all duration-300">
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
                      className="text-xl font-bold text-theme-primary mb-1 cursor-pointer hover:text-theme-accent transition-colors"
                      onClick={() => handleAlbumClick(album)}
                    >
                      {album.name}
                    </h3>
                    <p className="text-theme-secondary mb-2 truncate">{album.artist}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-theme-muted">
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
                      <div className="mt-3 p-3 bg-theme-card-hover rounded-lg">
                        <p className="text-theme-secondary text-sm">{album.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleAlbumClick(album)}
                      className="flex items-center gap-2 px-4 py-2 bg-theme-accent hover:bg-theme-hover text-theme-button rounded-lg transition-colors"
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
            <Music size={64} className="text-theme-muted mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-theme-primary mb-2">Lista vacía</h3>
            <p className="text-theme-secondary mb-6">Esta lista no tiene álbumes aún</p>
            {isOwner && (
              <Link 
                href="/"
                className="bg-theme-accent hover:bg-theme-hover text-theme-button font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
              >
                Explorar Música
              </Link>
            )}
          </div>
        )}

        {/* Sección de Comentarios al final de la página */}
        {showComments && (
          <div ref={commentsSectionRef} className="mt-12 bg-theme-card backdrop-blur-md rounded-xl p-6 border border-theme">
            {/* Formulario para nuevo comentario */}
            {isAuthenticated && (
              <form onSubmit={handleSubmitComment} className="mb-6">
                <div className="flex gap-3">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escribe un comentario..."
                    className="flex-1 bg-theme-card border border-theme rounded-lg px-4 py-3 text-theme-primary placeholder-theme-muted resize-none focus:outline-none focus:ring-2 focus:ring-theme-accent"
                    rows={3}
                    maxLength={500}
                  />
                  <button
                    type="submit"
                    disabled={submittingComment || !newComment.trim()}
                    className="px-6 py-3 bg-theme-accent hover:bg-theme-hover text-theme-button rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingComment ? (
                      <Loader2 size={20} className="animate-spin" />
                    ) : (
                      <Send size={20} />
                    )}
                  </button>
                </div>
                <div className="text-xs text-theme-muted mt-2">
                  {newComment.length}/500 caracteres
                </div>
              </form>
            )}

            {/* Lista de comentarios */}
            {loadingComments ? (
              <div className="flex justify-center py-8">
                <Loader2 size={32} className="animate-spin text-theme-primary" />
              </div>
            ) : comments.length > 0 ? (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-theme-card-hover rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-theme-primary">{comment.username}</span>
                          <span className="text-xs text-theme-muted">
                            {new Date(comment.created_at).toLocaleDateString('es')}
                          </span>
                        </div>
                        <p className="text-theme-secondary">{comment.content}</p>
                      </div>
                      
                      {(isAuthenticated && (user?.username === comment.username || isOwner)) && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-theme-muted hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-theme-muted">
                <MessageCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
