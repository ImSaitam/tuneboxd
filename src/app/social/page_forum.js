'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  MessageCircle, Users, Star, Music, Heart, ThumbsUp,
  ArrowLeft, Loader2, User, Calendar, Plus, Search,
  Pin, Lock, Eye, Clock, Send, Filter, Hash, MessageSquare
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';

const ForumPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useNotifications();
  
  // Estados principales
  const [threads, setThreads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('threads');
  
  // Estados para filtros y búsqueda
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Estados para crear nuevo hilo
  const [showCreateThread, setShowCreateThread] = useState(false);
  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    category: 'general'
  });
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchForumData();
  }, [selectedCategory]);

  const fetchForumData = async () => {
    try {
      setLoading(true);
      
      // Obtener hilos
      let threadsUrl = '/api/forum/threads?limit=20';
      if (selectedCategory) {
        threadsUrl += `&category=${selectedCategory}`;
      }
      
      const threadsResponse = await fetch(threadsUrl);
      if (threadsResponse.ok) {
        const threadsData = await threadsResponse.json();
        setThreads(threadsData.threads || []);
      }

      // Obtener categorías
      const categoriesResponse = await fetch('/api/forum/categories');
      if (categoriesResponse.ok) {
        const categoriesData = await categoriesResponse.json();
        setCategories(categoriesData.categories || []);
      }

    } catch (error) {
      console.error('Error cargando datos del foro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(`/api/forum/threads?search=${encodeURIComponent(searchQuery)}&limit=10`);
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.threads || []);
      }
    } catch (error) {
      console.error('Error en búsqueda:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleCreateThread = async () => {
    if (!newThread.title.trim()) {
      error('El título es requerido');
      return;
    }

    try {
      setIsCreating(true);
      const response = await fetch('/api/forum/threads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(newThread)
      });

      if (response.ok) {
        success('Hilo creado exitosamente');
        setShowCreateThread(false);
        setNewThread({ title: '', content: '', category: 'general' });
        fetchForumData(); // Recargar hilos
      } else {
        const errorData = await response.json();
        error(errorData.message || 'Error al crear el hilo');
      }
    } catch (err) {
      console.error('Error creando hilo:', err);
      error('Error al crear el hilo');
    } finally {
      setIsCreating(false);
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

  const ThreadCard = ({ thread }) => (
    <Link href={`/social/thread/${thread.id}`}>
      <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3 flex-1">
            {thread.is_pinned && (
              <Pin className="w-4 h-4 text-yellow-400 flex-shrink-0" />
            )}
            {thread.is_locked && (
              <Lock className="w-4 h-4 text-red-400 flex-shrink-0" />
            )}
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg group-hover:text-blue-300 transition-colors line-clamp-1">
                {thread.title}
              </h3>
              <div className="flex items-center space-x-3 text-sm text-gray-400 mt-1">
                <span>por @{thread.author_username}</span>
                <span>•</span>
                <span>{formatTimeAgo(thread.created_at)}</span>
                <span>•</span>
                <span className="bg-blue-600/30 px-2 py-1 rounded-lg text-blue-300">
                  #{thread.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        {thread.content && (
          <p className="text-gray-300 mb-4 line-clamp-2">
            {thread.content}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{thread.views_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <MessageSquare className="w-4 h-4" />
              <span>{thread.replies_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <ThumbsUp className="w-4 h-4" />
              <span>{thread.likes_count}</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {thread.last_activity !== thread.created_at && (
              <span>Última actividad: {formatTimeAgo(thread.last_activity)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-white mb-4">Foro de la Comunidad</h1>
          <p className="text-gray-300 mb-6">
            Inicia sesión para participar en las discusiones de la comunidad
          </p>
          <div className="space-x-4">
            <Link 
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/register"
              className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center space-x-2 text-white hover:text-blue-300 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver al inicio</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-white flex items-center space-x-2">
                <MessageCircle className="w-8 h-8" />
                <span>Foro de la Comunidad</span>
              </h1>
            </div>

            <button
              onClick={() => setShowCreateThread(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Hilo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar hilos..."
                className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buscar'}
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCategory === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-white/10 text-gray-300 hover:bg-white/20'
              }`}
            >
              Todas
            </button>
            {categories.map((category) => (
              <button
                key={category.category}
                onClick={() => setSelectedCategory(category.category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category.category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                #{category.category} ({category.thread_count})
              </button>
            ))}
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-white mb-4">
              Resultados de búsqueda para "{searchQuery}"
            </h2>
            <div className="space-y-4">
              {searchResults.map((thread) => (
                <ThreadCard key={thread.id} thread={thread} />
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
              <p className="text-white text-lg">Cargando hilos del foro...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Threads List */}
            {threads.length > 0 ? (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white">
                  {selectedCategory ? `Hilos en #${selectedCategory}` : 'Todos los hilos'}
                </h2>
                {threads.map((thread) => (
                  <ThreadCard key={thread.id} thread={thread} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {selectedCategory ? `No hay hilos en la categoría ${selectedCategory}` : 'No hay hilos aún'}
                </h3>
                <p className="text-gray-400 mb-6">
                  {selectedCategory ? 'Intenta con otra categoría o sé el primero en crear un hilo aquí.' : '¡Sé el primero en iniciar una conversación!'}
                </p>
                <button
                  onClick={() => setShowCreateThread(true)}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Crear Primer Hilo
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Thread Modal */}
      {showCreateThread && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 rounded-2xl p-6 w-full max-w-2xl border border-white/20 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-white">Crear Nuevo Hilo</h3>
              <button
                onClick={() => setShowCreateThread(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-white font-medium mb-2">Categoría</label>
                <select
                  value={newThread.category}
                  onChange={(e) => setNewThread(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">General</option>
                  <option value="música">Música</option>
                  <option value="recomendaciones">Recomendaciones</option>
                  <option value="discusión">Discusión</option>
                  <option value="ayuda">Ayuda</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-white font-medium mb-2">Título *</label>
                <input
                  type="text"
                  value={newThread.title}
                  onChange={(e) => setNewThread(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título del hilo..."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={200}
                />
                <div className="text-right text-gray-400 text-xs mt-1">
                  {newThread.title.length}/200
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-white font-medium mb-2">Contenido (opcional)</label>
                <textarea
                  value={newThread.content}
                  onChange={(e) => setNewThread(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Describe tu hilo, haz una pregunta, comparte una opinión..."
                  rows={6}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  maxLength={5000}
                />
                <div className="text-right text-gray-400 text-xs mt-1">
                  {newThread.content.length}/5000
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateThread(false)}
                  className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateThread}
                  disabled={isCreating || !newThread.title.trim()}
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Crear Hilo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForumPage;
