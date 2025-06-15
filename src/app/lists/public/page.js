'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Music, 
  Eye, 
  Calendar,
  User,
  Album,
  Search,
  Filter,
  Loader2,
  Heart,
  MessageCircle
} from 'lucide-react';

export default function PublicListsPage() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [listStats, setListStats] = useState({}); // Para almacenar stats de cada lista

  useEffect(() => {
    loadPublicLists();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadPublicLists = async (offset = 0, reset = true) => {
    try {
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }
      
      const response = await fetch(`/api/lists/public?limit=20&offset=${offset}`);
      const data = await response.json();
      
      if (data.success) {
        if (reset) {
          setLists(data.lists);
        } else {
          setLists(prev => [...prev, ...data.lists]);
        }
        setHasMore(data.pagination.hasMore);
        
        // Cargar estadísticas para las nuevas listas
        loadListsStats(data.lists);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error cargando listas públicas:', error);
      setError('Error al cargar las listas');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadListsStats = async (listsToLoad) => {
    try {
      // Cargar estadísticas en paralelo para todas las listas
      const statsPromises = listsToLoad.map(async (list) => {
        try {
          const [likesResponse, commentsResponse] = await Promise.all([
            fetch(`/api/lists/${list.id}/likes`),
            fetch(`/api/lists/${list.id}/comments?limit=1`)
          ]);

          const [likesData, commentsData] = await Promise.all([
            likesResponse.json(),
            commentsResponse.json()
          ]);

          return {
            listId: list.id,
            likes: likesData.success ? likesData.pagination.totalCount : 0,
            comments: commentsData.success ? commentsData.pagination.totalCount : 0
          };
        } catch (error) {
          console.error(`Error cargando stats para lista ${list.id}:`, error);
          return {
            listId: list.id,
            likes: 0,
            comments: 0
          };
        }
      });

      const stats = await Promise.all(statsPromises);
      
      // Actualizar el estado con las nuevas estadísticas
      setListStats(prev => {
        const newStats = { ...prev };
        stats.forEach(stat => {
          newStats[stat.listId] = {
            likes: stat.likes,
            comments: stat.comments
          };
        });
        return newStats;
      });
    } catch (error) {
      console.error('Error cargando estadísticas de listas:', error);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      loadMoreLists(lists.length);
    }
  };

  const loadMoreLists = (offset) => {
    loadPublicLists(offset, false);
  };

  const filteredLists = lists.filter(list =>
    list.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    list.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (list.description && list.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleListClick = (list) => {
    window.location.href = `/lists/${list.id}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-1/3"></div>
            <div className="h-12 bg-gray-700 rounded w-full"></div>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white/10 rounded-lg p-6">
                <div className="space-y-4">
                  <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-700 rounded w-1/4"></div>
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
              <h1 className="text-3xl font-bold text-white">Listas Públicas</h1>
              <p className="text-gray-300 mt-1">Descubre listas creadas por otros usuarios</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar listas por nombre, autor o descripción..."
              className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white/10 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Album size={20} className="text-purple-400" />
                <span className="text-white font-medium">
                  {searchTerm ? filteredLists.length : lists.length} lista{(searchTerm ? filteredLists.length : lists.length) !== 1 ? 's' : ''}
                  {searchTerm && ` encontrada${filteredLists.length !== 1 ? 's' : ''}`}
                </span>
              </div>
            </div>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
            <button 
              onClick={() => loadPublicLists()}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Lists Grid */}
        {filteredLists.length > 0 ? (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredLists.map((list) => (
                <PublicListCard 
                  key={list.id} 
                  list={list} 
                  onListClick={handleListClick}
                  stats={listStats[list.id]}
                />
              ))}
            </div>

            {/* Load More Button */}
            {!searchTerm && hasMore && (
              <div className="text-center mt-8">
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="flex items-center gap-2 mx-auto px-6 py-3 bg-purple-600/50 hover:bg-purple-600/70 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loadingMore && <Loader2 size={18} className="animate-spin" />}
                  {loadingMore ? 'Cargando...' : 'Cargar más listas'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <Album size={64} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              {searchTerm ? 'No se encontraron listas' : 'No hay listas públicas'}
            </h3>
            <p className="text-gray-300 mb-6">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : 'Aún no hay listas públicas disponibles'
              }
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Ver todas las listas
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para cada lista pública
function PublicListCard({ list, onListClick, stats }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-all duration-300 border border-white/10 cursor-pointer"
         onClick={() => onListClick(list)}>
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-bold text-white mb-2 hover:text-purple-300 transition-colors">
          {list.name}
        </h3>
        {list.description && (
          <p className="text-gray-300 text-sm mb-3 line-clamp-2">{list.description}</p>
        )}
      </div>

      {/* Creator Info */}
      <div className="flex items-center gap-2 mb-4 text-sm text-gray-400">
        <User size={14} />
        <span>Por {list.username}</span>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Music size={14} />
            <span>{list.album_count || 0} álbum{(list.album_count || 0) !== 1 ? 'es' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye size={14} />
            <span>Pública</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>{new Date(list.updated_at).toLocaleDateString('es')}</span>
        </div>
      </div>

      {/* Likes and Comments Stats */}
      {stats && (
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <Heart size={14} className="text-red-400" />
            <span>{stats.likes} like{stats.likes !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle size={14} className="text-blue-400" />
            <span>{stats.comments} comentario{stats.comments !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {/* Action Hint */}
      <div className="text-center">
        <div className="inline-block px-4 py-2 bg-purple-600/30 text-purple-300 rounded-lg text-sm font-medium">
          Click para ver lista
        </div>
      </div>
    </div>
  );
}
