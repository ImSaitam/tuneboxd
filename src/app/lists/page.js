'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Link from 'next/link';
import { 
  Plus, 
  ArrowLeft, 
  Edit3, 
  Trash2, 
  Music, 
  Eye, 
  EyeOff,
  Calendar,
  Album,
  Users,
  Loader2
} from 'lucide-react';

export default function CustomListsPage() {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingList, setEditingList] = useState(null);
  const [deletingLists, setDeletingLists] = useState(new Set());
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadLists();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  const loadLists = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/lists', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setLists(data.lists);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error cargando listas:', error);
      setError('Error al cargar las listas');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteList = async (listId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta lista? Esta acción no se puede deshacer.')) {
      return;
    }

    setDeletingLists(prev => new Set(prev).add(listId));
    
    try {
      const response = await fetch(`/api/lists/${listId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });

      const data = await response.json();
      
      if (data.success) {
        setLists(prev => prev.filter(list => list.id !== listId));
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error eliminando lista:', error);
      setError('Error al eliminar la lista');
    } finally {
      setDeletingLists(prev => {
        const newSet = new Set(prev);
        newSet.delete(listId);
        return newSet;
      });
    }
  };

  const handleListClick = (list) => {
    window.location.href = `/lists/${list.id}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center">
        <div className="text-center">
          <Album className="w-16 h-16 text-theme-secondary mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-theme-primary mb-4">Acceso Requerido</h1>
          <p className="text-theme-secondary mb-6">Necesitas iniciar sesión para ver tus listas personalizadas</p>
          <Link 
            href="/login"
            className="bg-theme-accent text-theme-button font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:opacity-90"
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
            <div className="h-8 bg-theme-card-hover rounded w-1/3"></div>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-theme-card rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-theme-card-hover rounded w-1/2"></div>
                    <div className="h-4 bg-theme-card-hover rounded w-3/4"></div>
                    <div className="h-4 bg-theme-card-hover rounded w-1/4"></div>
                  </div>
                  <div className="w-20 h-10 bg-theme-card-hover rounded"></div>
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
            <Link href="/" className="text-theme-primary hover:text-theme-secondary transition-colors">
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-theme-primary">Mis Listas Personalizadas</h1>
              <p className="text-gray-300 mt-1">Organiza tus álbumes favoritos en listas temáticas</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <Plus size={20} />
            Nueva Lista
          </button>
          
          <Link 
            href="/lists/public"
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <Eye size={20} />
            Explorar Públicas
          </Link>
        </div>

        {/* User Info */}
        {isAuthenticated && (
          <div className="bg-white/10 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-semibold">¡Hola, {user?.username}!</p>
                <p className="text-gray-300 text-sm">
                  {lists.length} lista{lists.length !== 1 ? 's' : ''} creada{lists.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-300 text-sm">
                  Total de álbumes: {lists.reduce((acc, list) => acc + (list.album_count || 0), 0)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200">{error}</p>
            <button 
              onClick={loadLists}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Lists Content */}
        {lists.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lists.map((list) => (
              <ListCard 
                key={list.id} 
                list={list} 
                onListClick={handleListClick}
                onEdit={setEditingList}
                onDelete={handleDeleteList}
                isDeleting={deletingLists.has(list.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Album size={64} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No tienes listas personalizadas</h3>
            <p className="text-gray-300 mb-6">Crea tu primera lista para organizar tus álbumes favoritos</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 transform hover:scale-105"
            >
              Crear Mi Primera Lista
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || editingList) && (
        <ListModal
          list={editingList}
          onClose={() => {
            setShowCreateModal(false);
            setEditingList(null);
          }}
          onSave={loadLists}
        />
      )}
    </div>
  );
}

// Componente para cada lista
function ListCard({ list, onListClick, onEdit, onDelete, isDeleting }) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 hover:bg-white/15 transition-all duration-300 border border-white/10">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 
            className="text-xl font-bold text-white mb-2 cursor-pointer hover:text-purple-300 transition-colors"
            onClick={() => onListClick(list)}
          >
            {list.name}
          </h3>
          {list.description && (
            <p className="text-gray-300 text-sm mb-3 line-clamp-2">{list.description}</p>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onEdit(list)}
            className="p-2 text-gray-400 hover:text-blue-400 transition-colors"
            title="Editar lista"
          >
            <Edit3 size={16} />
          </button>
          <button
            onClick={() => onDelete(list.id)}
            disabled={isDeleting}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50"
            title="Eliminar lista"
          >
            {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-gray-400 mb-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Music size={14} />
            <span>{list.album_count || 0} álbum{(list.album_count || 0) !== 1 ? 'es' : ''}</span>
          </div>
          <div className="flex items-center gap-1">
            {list.is_public ? <Eye size={14} /> : <EyeOff size={14} />}
            <span>{list.is_public ? 'Pública' : 'Privada'}</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Calendar size={14} />
          <span>{new Date(list.updated_at).toLocaleDateString('es')}</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onListClick(list)}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600/50 hover:bg-purple-600/70 text-white rounded-lg transition-all duration-300"
      >
        <Album size={16} />
        Ver Lista
      </button>
    </div>
  );
}

// Modal para crear/editar listas
function ListModal({ list, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: list?.name || '',
    description: list?.description || '',
    is_public: list?.is_public ?? true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const url = list ? `/api/lists/${list.id}` : '/api/lists';
      const method = list ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        onSave();
        onClose();
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error('Error guardando lista:', error);
      setError('Error al guardar la lista');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-white/10">
        <h2 className="text-xl font-bold text-white mb-4">
          {list ? 'Editar Lista' : 'Crear Nueva Lista'}
        </h2>

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
              placeholder="Ej: Mis álbumes favoritos del 2024"
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
              placeholder="Describe el tema o criterio de tu lista..."
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
            <p className="text-xs text-gray-400 mt-1">
              Las listas públicas pueden ser vistas por otros usuarios
            </p>
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
              {list ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
