'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { 
  MessageCircle, Users, Star, Music, Heart, ThumbsUp,
  ArrowLeft, Loader2, User, Calendar, Plus, Search,
  Pin, Lock, Eye, Clock, Send, Filter, Hash, MessageSquare, Globe
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useNotifications } from '../../hooks/useNotifications';
import OptimizedThreadCard from '../../components/OptimizedThreadCard';

const ForumPage = () => {
  const { user, isAuthenticated } = useAuth();
  const { success, error } = useNotifications();
  
  // Mapa de códigos de idioma a nombres
  const languageNames = {
    'es': 'Español',
    'en': 'English',
    'fr': 'Français',
    'de': 'Deutsch',
    'it': 'Italiano',
    'pt': 'Português',
    'ru': 'Русский',
    'ja': '日本語',
    'ko': '한국어',
    'zh': '中文',
    'ar': 'العربية',
    'hi': 'हिन्दी',
    'other': 'Otro'
  };
  
  // Estados principales
  const [threads, setThreads] = useState([]);
  const [categories, setCategories] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('threads');
  
  // Estados para filtros y búsqueda
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Estados para crear nuevo hilo
  const [showCreateThread, setShowCreateThread] = useState(false);
  const [newThread, setNewThread] = useState({
    title: '',
    content: '',
    category: 'general',
    language: 'es'
  });
  const [isCreating, setIsCreating] = useState(false);

  // Prevenir llamadas duplicadas
  const fetchingRef = useRef(false);

  const fetchForumData = useCallback(async () => {
    // Prevenir llamadas duplicadas
    if (fetchingRef.current) {
      return;
    }
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      
      // Usar API unificada (1 request en lugar de 3)
      let dataUrl = '/api/forum/data?limit=20';
      if (selectedCategory) {
        dataUrl += `&category=${selectedCategory}`;
      }
      if (selectedLanguage) {
        dataUrl += `&language=${selectedLanguage}`;
      }
      
      const response = await fetch(dataUrl);
      if (response.ok) {
        const data = await response.json();
        setThreads(data.threads || []);
        setCategories(data.categories || []);
        setLanguages(data.languages || []);
        
        // Log si viene del cache para debugging
        if (data.fromCache) {
          console.log('📋 Datos cargados desde cache');
        }
      }

    } catch (error) {
      console.error('Error cargando datos del foro:', error);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [selectedCategory, selectedLanguage]);

  useEffect(() => {
    if (!fetchingRef.current) {
      fetchForumData();
    }
  }, [selectedCategory, fetchForumData]);

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
        setNewThread({ title: '', content: '', category: 'general', language: 'es' });
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

  // Memoizar la función de formateo de tiempo para evitar recálculos
  const formatTimeAgo = useCallback((dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'hace unos segundos';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)} h`;
    if (diffInSeconds < 2592000) return `hace ${Math.floor(diffInSeconds / 86400)} días`;
    
    return date.toLocaleDateString('es');
  }, []);

  // Usar el componente optimizado en lugar del inline
  const ThreadCard = OptimizedThreadCard;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center">
          <MessageCircle className="w-16 h-16 text-theme-muted mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-theme-primary mb-4">Comunidad</h1>
          <p className="text-theme-secondary mb-6">
            Inicia sesión para participar en las discusiones de la comunidad
          </p>
          <div className="space-x-4">
            <Link 
              href="/login"
              className="inline-flex items-center px-6 py-3 bg-theme-accent text-theme-button rounded-lg hover:bg-theme-hover transition-colors"
            >
              Iniciar Sesión
            </Link>
            <Link 
              href="/register"
              className="inline-flex items-center px-6 py-3 bg-theme-card text-theme-primary rounded-lg hover:bg-theme-hover transition-colors border border-theme-border"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-theme-primary">
      {/* Header */}
      <div className="bg-theme-card backdrop-blur-sm border-b border-theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center space-x-2 text-theme-primary hover:text-theme-accent transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver al inicio</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-theme-primary flex items-center space-x-2">
                <MessageCircle className="w-8 h-8" />
                <span>Comunidad</span>
              </h1>
            </div>

            <button
              onClick={() => setShowCreateThread(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-theme-accent hover:bg-theme-hover text-theme-button rounded-lg font-medium transition-colors"
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
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-muted w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Buscar hilos..."
                className="w-full pl-10 pr-4 py-3 bg-theme-card border border-theme-border rounded-xl text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-accent"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={isSearching}
              className="px-6 py-3 bg-theme-accent hover:bg-theme-hover text-theme-button rounded-xl font-medium transition-colors disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Buscar'}
            </button>
          </div>

          {/* Filters */}
          <div className="bg-theme-card rounded-xl p-4 border border-theme-border">
            <div className="flex flex-col lg:flex-row gap-4 lg:items-center">
              {/* Category Filter */}
              <div className="flex-1">
                <h3 className="text-theme-primary font-medium mb-2 flex items-center">
                  <Hash className="w-4 h-4 mr-1" />
                  Categorías:
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === ''
                        ? 'bg-theme-accent text-theme-button'
                        : 'bg-theme-primary/50 text-theme-secondary hover:bg-theme-hover border border-theme-border'
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
                          ? 'bg-theme-accent text-theme-button'
                          : 'bg-theme-primary/50 text-theme-secondary hover:bg-theme-hover border border-theme-border'
                      }`}
                    >
                      #{category.category} ({category.thread_count})
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Filter */}
              <div className="lg:w-64">
                <label className="text-theme-primary font-medium mb-2 flex items-center">
                  <Globe className="w-4 h-4 mr-1" />
                  Idioma:
                </label>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-theme-border rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-theme-accent hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <option value="">Todos los idiomas</option>
                  {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name} ({lang.thread_count})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && searchResults.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-theme-primary mb-6">
              Resultados de búsqueda para &quot;{searchQuery}&quot;
            </h2>
            <div className="space-y-8">
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
              <Loader2 className="w-12 h-12 text-theme-primary animate-spin" />
              <p className="text-theme-primary text-lg">Cargando hilos del foro...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Threads List */}
            {threads.length > 0 ? (
              <div className="space-y-8">
                <h2 className="text-xl font-bold text-theme-primary mb-8">
                  {selectedCategory && selectedLanguage ? 
                    `Hilos en #${selectedCategory} - ${languageNames[selectedLanguage]}` :
                    selectedCategory ? 
                    `Hilos en #${selectedCategory}` :
                    selectedLanguage ?
                    `Hilos en ${languageNames[selectedLanguage]}` :
                    'Todos los hilos'}
                </h2>
                {threads.map((thread) => (
                  <ThreadCard key={thread.id} thread={thread} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <MessageCircle className="w-16 h-16 text-theme-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-theme-primary mb-2">
                  {selectedCategory || selectedLanguage ? 
                    'No hay hilos con estos filtros' : 
                    'No hay hilos aún'}
                </h3>
                <p className="text-theme-muted mb-6">
                  {selectedCategory || selectedLanguage ? 
                    'Intenta con otros filtros o sé el primero en crear un hilo aquí.' : 
                    '¡Sé el primero en iniciar una conversación!'}
                </p>
                <button
                  onClick={() => setShowCreateThread(true)}
                  className="inline-flex items-center px-6 py-3 bg-theme-accent text-theme-button rounded-xl hover:bg-theme-hover transition-all duration-200 shadow-lg"
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
          <div className="bg-theme-primary rounded-2xl p-6 w-full max-w-2xl border border-theme-border shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-theme-primary">Crear Nuevo Hilo</h3>
              <button
                onClick={() => setShowCreateThread(false)}
                className="text-theme-muted hover:text-theme-primary transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Category */}
              <div>
                <label className="block text-theme-primary font-medium mb-2">Categoría</label>
                <select
                  value={newThread.category}
                  onChange={(e) => setNewThread(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-4 py-3 bg-theme-card border border-theme-border rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-theme-accent"
                >
                  <option value="general">General</option>
                  <option value="música">Música</option>
                  <option value="recomendaciones">Recomendaciones</option>
                  <option value="discusión">Discusión</option>
                  <option value="ayuda">Ayuda</option>
                </select>
              </div>

              {/* Language */}
              <div>
                <label className="block text-theme-primary font-medium mb-2">Idioma</label>
                <select
                  value={newThread.language}
                  onChange={(e) => setNewThread(prev => ({ ...prev, language: e.target.value }))}
                  className="w-full px-4 py-3 bg-theme-card border border-theme-border rounded-lg text-theme-primary focus:outline-none focus:ring-2 focus:ring-theme-accent"
                >
                  {Object.entries(languageNames).map(([code, name]) => (
                    <option key={code} value={code}>{name}</option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-theme-primary font-medium mb-2">Título *</label>
                <input
                  type="text"
                  value={newThread.title}
                  onChange={(e) => setNewThread(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Título del hilo..."
                  className="w-full px-4 py-3 bg-theme-card border border-theme-border rounded-lg text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-accent"
                  maxLength={200}
                />
                <div className="text-right text-theme-muted text-xs mt-1">
                  {newThread.title.length}/200
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-theme-primary font-medium mb-2">Contenido (opcional)</label>
                <textarea
                  value={newThread.content}
                  onChange={(e) => setNewThread(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Describe tu hilo, haz una pregunta, comparte una opinión..."
                  rows={6}
                  className="w-full px-4 py-3 bg-theme-card border border-theme-border rounded-lg text-theme-primary placeholder-theme-muted focus:outline-none focus:ring-2 focus:ring-theme-accent resize-none"
                  maxLength={5000}
                />
                <div className="text-right text-theme-muted text-xs mt-1">
                  {newThread.content.length}/5000
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-3 pt-4">
                <button
                  onClick={() => setShowCreateThread(false)}
                  className="flex-1 px-4 py-3 bg-theme-card hover:bg-theme-hover text-theme-primary rounded-lg font-medium transition-colors border border-theme-border"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateThread}
                  disabled={isCreating || !newThread.title.trim()}
                  className="flex-1 px-4 py-3 bg-theme-accent hover:bg-theme-hover text-theme-button rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
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