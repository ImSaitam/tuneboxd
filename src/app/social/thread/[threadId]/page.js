'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { 
  MessageCircle, Users, Star, Music, Heart, ThumbsUp,
  ArrowLeft, Loader2, User, Calendar, Plus, Search,
  Pin, Lock, Eye, Clock, Send, Reply, Trash2, Edit3
} from 'lucide-react';
import { useAuth } from '../../../../hooks/useAuth';
import { useNotifications } from '../../../../hooks/useNotifications';

const ThreadDetailPage = () => {
  const params = useParams();
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useNotifications();
  
  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [userLikes, setUserLikes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingReplies, setLoadingReplies] = useState(false);
  
  // Estados para nueva respuesta
  const [newReply, setNewReply] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const threadId = params.threadId;

  // Prevenir llamadas duplicadas
  const fetchingRef = useRef(false);

  const fetchThreadData = useCallback(async () => {
    // Prevenir llamadas duplicadas
    if (fetchingRef.current) {
      return;
    }
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      
      const headers = {};
      if (isAuthenticated) {
        headers['Authorization'] = `Bearer ${localStorage.getItem('auth_token')}`;
      }
      
      const response = await fetch(`/api/forum/threads/${threadId}`, {
        headers
      });
      
      if (response.ok) {
        const data = await response.json();
        setThread(data.thread);
        setReplies(data.replies || []);
        setUserLikes(data.userLikes);
      } else if (response.status === 404) {
        error('Hilo no encontrado');
      } else {
        error('Error cargando el hilo');
      }
    } catch (err) {
      console.error('Error fetching thread:', err);
      error('Error cargando el hilo');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [threadId, isAuthenticated, error]);

  useEffect(() => {
    if (threadId && !fetchingRef.current) {
      fetchThreadData();
    }
  }, [threadId, fetchThreadData]);

  const handleSubmitReply = async () => {
    if (!newReply.trim()) {
      error('El contenido de la respuesta es requerido');
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`/api/forum/threads/${threadId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({
          content: newReply.trim()
        })
      });

      if (response.ok) {
        success('Respuesta enviada exitosamente');
        setNewReply('');
        fetchThreadData(); // Recargar datos
      } else {
        const errorData = await response.json();
        error(errorData.message || 'Error enviando la respuesta');
      }
    } catch (err) {
      console.error('Error submitting reply:', err);
      error('Error enviando la respuesta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeThread = async () => {
    if (!isAuthenticated) {
      error('Debes iniciar sesión para dar like');
      return;
    }

    try {
      const isLiked = userLikes?.thread;
      const method = isLiked ? 'DELETE' : 'POST';
      const url = isLiked 
        ? `/api/forum/likes?thread_id=${threadId}`
        : '/api/forum/likes';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        ...(method === 'POST' && {
          body: JSON.stringify({ thread_id: parseInt(threadId) })
        })
      });

      if (response.ok) {
        // Actualizar estado local
        setThread(prev => ({
          ...prev,
          likes_count: isLiked ? prev.likes_count - 1 : prev.likes_count + 1
        }));
        setUserLikes(prev => ({
          ...prev,
          thread: !isLiked
        }));
      }
    } catch (err) {
      console.error('Error toggling thread like:', err);
      error('Error al procesar el like');
    }
  };

  const handleLikeReply = async (replyId) => {
    if (!isAuthenticated) {
      error('Debes iniciar sesión para dar like');
      return;
    }

    try {
      const isLiked = userLikes?.replies?.[replyId];
      const method = isLiked ? 'DELETE' : 'POST';
      const url = isLiked 
        ? `/api/forum/likes?reply_id=${replyId}`
        : '/api/forum/likes';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        ...(method === 'POST' && {
          body: JSON.stringify({ reply_id: parseInt(replyId) })
        })
      });

      if (response.ok) {
        // Actualizar estado local
        setReplies(prev => prev.map(reply => 
          reply.id === replyId 
            ? { ...reply, likes_count: isLiked ? reply.likes_count - 1 : reply.likes_count + 1 }
            : reply
        ));
        setUserLikes(prev => ({
          ...prev,
          replies: {
            ...prev.replies,
            [replyId]: !isLiked
          }
        }));
      }
    } catch (err) {
      console.error('Error toggling reply like:', err);
      error('Error al procesar el like');
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'hace unos segundos';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
    
    return date.toLocaleDateString('es');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
          <p className="text-white text-lg">Cargando hilo...</p>
        </div>
      </div>
    );
  }

  if (!thread) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">Hilo no encontrado</h1>
          <p className="text-gray-300 mb-6">
            El hilo que buscas no existe o ha sido eliminado
          </p>
          <Link 
            href="/social"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al foro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link 
              href="/social"
              className="flex items-center space-x-2 text-white hover:text-blue-300 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Volver al foro</span>
            </Link>
            
            <div className="flex items-center space-x-4">
              <span className="bg-blue-600/30 px-3 py-1 rounded-lg text-blue-300 text-sm">
                #{thread.category}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Thread Header */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-8">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3 flex-1">
              {thread.is_pinned && (
                <Pin className="w-5 h-5 text-yellow-400 flex-shrink-0" />
              )}
              {thread.is_locked && (
                <Lock className="w-5 h-5 text-red-400 flex-shrink-0" />
              )}
              <h1 className="text-3xl font-bold text-white flex-1">
                {thread.title}
              </h1>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-400 mb-6">
            <Link 
              href={`/profile/${thread.author_username}`}
              className="flex items-center space-x-2 hover:text-white transition-colors"
            >
              <User className="w-4 h-4" />
              <span>@{thread.author_username}</span>
            </Link>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatTimeAgo(thread.created_at)}</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{thread.views_count} vistas</span>
            </div>
          </div>

          {thread.content && (
            <div className="text-gray-300 leading-relaxed mb-6 whitespace-pre-wrap">
              {thread.content}
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex items-center space-x-6">
              <button
                onClick={handleLikeThread}
                disabled={!isAuthenticated}
                className={`flex items-center space-x-2 transition-colors ${
                  userLikes?.thread 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-gray-400 hover:text-blue-400'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <ThumbsUp className="w-5 h-5" />
                <span>{thread.likes_count}</span>
              </button>
              
              <div className="flex items-center space-x-2 text-gray-400">
                <MessageCircle className="w-5 h-5" />
                <span>{replies.length} respuestas</span>
              </div>
            </div>

            {isAuthenticated && user?.id === thread.author_id && (
              <div className="flex items-center space-x-2">
                <button className="flex items-center space-x-1 text-gray-400 hover:text-blue-400 transition-colors">
                  <Edit3 className="w-4 h-4" />
                  <span>Editar</span>
                </button>
                <button className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* New Reply Form */}
        {isAuthenticated && !thread.is_locked ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8">
            <h3 className="text-lg font-bold text-white mb-4">Escribir respuesta</h3>
            <textarea
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              placeholder="Escribe tu respuesta..."
              rows={4}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-4"
              maxLength={2000}
            />
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-xs">
                {newReply.length}/2000
              </span>
              <button
                onClick={handleSubmitReply}
                disabled={isSubmitting || !newReply.trim()}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Enviar Respuesta</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : !isAuthenticated ? (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8 text-center">
            <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">¿Quieres participar?</h3>
            <p className="text-gray-300 mb-4">
              Inicia sesión para escribir respuestas y dar likes
            </p>
            <div className="space-x-4">
              <Link 
                href="/login"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link 
                href="/register"
                className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Registrarse
              </Link>
            </div>
          </div>
        ) : thread.is_locked && (
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 mb-8 text-center">
            <Lock className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Hilo Bloqueado</h3>
            <p className="text-gray-300">
              Este hilo está bloqueado y no acepta nuevas respuestas
            </p>
          </div>
        )}

        {/* Replies */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white">
            Respuestas ({replies.length})
          </h2>

          {replies.length > 0 ? (
            replies.map((reply) => (
              <div 
                key={reply.id}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <Link href={`/profile/${reply.author_username}`}>
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-600 rounded-full flex items-center justify-center hover:scale-105 transition-transform cursor-pointer">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  </Link>

                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Link 
                        href={`/profile/${reply.author_username}`}
                        className="font-semibold text-white hover:text-blue-300 transition-colors"
                      >
                        @{reply.author_username}
                      </Link>
                      <span className="text-gray-400 text-sm">
                        {formatTimeAgo(reply.created_at)}
                      </span>
                    </div>

                    <div className="text-gray-300 leading-relaxed mb-4 whitespace-pre-wrap">
                      {reply.content}
                    </div>

                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => handleLikeReply(reply.id)}
                        disabled={!isAuthenticated}
                        className={`flex items-center space-x-1 transition-colors ${
                          userLikes?.replies?.[reply.id] 
                            ? 'text-blue-400 hover:text-blue-300' 
                            : 'text-gray-400 hover:text-blue-400'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span className="text-sm">{reply.likes_count}</span>
                      </button>

                      {isAuthenticated && user?.id === reply.author_id && (
                        <div className="flex items-center space-x-2">
                          <button className="flex items-center space-x-1 text-gray-400 hover:text-red-400 transition-colors text-sm">
                            <Trash2 className="w-3 h-3" />
                            <span>Eliminar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                No hay respuestas aún
              </h3>
              <p className="text-gray-400">
                ¡Sé el primero en responder a este hilo!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreadDetailPage;
