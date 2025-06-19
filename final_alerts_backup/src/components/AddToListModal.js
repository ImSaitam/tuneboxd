'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '../hooks/useAuth';
import { 
  Plus, 
  List, 
  Check, 
  X, 
  Loader2,
  Eye,
  EyeOff
} from 'lucide-react';

export default function AddToListModal({ album, isOpen, onClose }) {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(new Set());
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newListData, setNewListData] = useState({
    name: '',
    description: '',
    is_public: true
  });
  const [creatingList, setCreatingList] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isOpen && isAuthenticated) {
      loadUserLists();
    }
  }, [isOpen, isAuthenticated]);

  const loadUserLists = async () => {
    setLoading(true);
    setError(null);
    
    try {
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

  const handleAddToList = async (listId) => {
    if (adding.has(listId)) return;
    
    setAdding(prev => new Set(prev).add(listId));
    
    try {
      const response = await fetch(`/api/lists/${listId}/albums`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ album })
      });

      const data = await response.json();
      
      if (data.success) {
        // Actualizar la lista para mostrar que el álbum ya está agregado
        setLists(prev => prev.map(list => 
          list.id === listId 
            ? { ...list, hasAlbum: true }
            : list
        ));
      } else {
        if (data.message === 'El álbum ya está en esta lista') {
          // Marcar como que ya tiene el álbum
          setLists(prev => prev.map(list => 
            list.id === listId 
              ? { ...list, hasAlbum: true }
              : list
          ));
        } else {
          setError(data.message);
        }
      }
    } catch (error) {
      console.error('Error agregando álbum a la lista:', error);
      setError('Error al agregar el álbum a la lista');
    } finally {
      setAdding(prev => {
        const newSet = new Set(prev);
        newSet.delete(listId);
        return newSet;
      });
    }
  };

  const handleCreateList = async (e) => {
    e.preventDefault();
    if (!newListData.name.trim()) return;

    setCreatingList(true);
    setError(null);

    try {
      // Crear la lista
      const createResponse = await fetch('/api/lists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(newListData)
      });

      const createData = await createResponse.json();

      if (createData.success) {
        // Agregar el álbum a la nueva lista
        const addResponse = await fetch(`/api/lists/${createData.list.id}/albums`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          },
          body: JSON.stringify({ album })
        });

        const addData = await addResponse.json();

        if (addData.success) {
          // Recargar las listas
          await loadUserLists();
          setShowCreateForm(false);
          setNewListData({ name: '', description: '', is_public: true });
        } else {
          setError(addData.message);
        }
      } else {
        setError(createData.message);
      }
    } catch (error) {
      console.error('Error creando lista:', error);
      setError('Error al crear la lista');
    } finally {
      setCreatingList(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-theme-card rounded-xl p-6 w-full max-w-md border border-theme-border max-h-[80vh] overflow-y-auto backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-theme-primary">Agregar a Lista</h2>
          <button
            onClick={onClose}
            className="text-theme-secondary hover:text-theme-primary transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Album Info */}
        <div className="flex gap-3 mb-6 p-3 bg-theme-card-hover rounded-lg">
          <Image
            src={album.image_url || '/placeholder-album.jpg'}
            alt={album.name}
            width={48}
            height={48}
            className="w-12 h-12 rounded object-cover flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h3 className="text-theme-primary font-medium truncate">{album.name}</h3>
            <p className="text-theme-secondary text-sm truncate">{album.artist}</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4">
            <p className="text-red-200 text-sm">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={32} className="animate-spin text-theme-accent" />
          </div>
        ) : (
          <>
            {/* Create New List Button */}
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="w-full flex items-center justify-center gap-2 p-3 mb-4 bg-purple-600/20 border border-purple-500/30 rounded-lg text-purple-300 hover:bg-purple-600/30 transition-colors"
            >
              <Plus size={18} />
              {showCreateForm ? 'Cancelar' : 'Crear Nueva Lista'}
            </button>

            {/* Create List Form */}
            {showCreateForm && (
              <form onSubmit={handleCreateList} className="mb-6 p-4 bg-theme-card-hover rounded-lg border border-theme-border">
                <div className="space-y-3">
                  <div>
                    <input
                      type="text"
                      value={newListData.name}
                      onChange={(e) => setNewListData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Nombre de la lista"
                      className="w-full px-3 py-2 bg-theme-card border border-theme-border rounded-lg text-theme-primary placeholder-theme-muted focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      maxLength={100}
                      required
                    />
                  </div>
                  <div>
                    <textarea
                      value={newListData.description}
                      onChange={(e) => setNewListData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Descripción (opcional)"
                      className="w-full px-3 py-2 bg-theme-card border border-theme-border rounded-lg text-theme-primary placeholder-theme-muted focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                      rows={2}
                      maxLength={500}
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newListData.is_public}
                        onChange={(e) => setNewListData(prev => ({ ...prev, is_public: e.target.checked }))}
                        className="w-4 h-4 text-purple-600 bg-theme-card border-theme-border rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-theme-secondary">Lista pública</span>
                    </label>
                  </div>
                  <button
                    type="submit"
                    disabled={creatingList || !newListData.name.trim()}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creatingList && <Loader2 size={16} className="animate-spin" />}
                    Crear y Agregar
                  </button>
                </div>
              </form>
            )}

            {/* Existing Lists */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-theme-secondary mb-3">Mis Listas</h3>
              
              {lists.length > 0 ? (
                lists.map((list) => (
                  <ListItem
                    key={list.id}
                    list={list}
                    album={album}
                    onAdd={handleAddToList}
                    isAdding={adding.has(list.id)}
                  />
                ))
              ) : (
                <div className="text-center py-6">
                  <List size={32} className="text-theme-secondary mx-auto mb-2" />
                  <p className="text-theme-secondary text-sm">No tienes listas aún</p>
                  <p className="text-theme-muted text-xs">Crea tu primera lista arriba</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Componente para cada lista
function ListItem({ list, album, onAdd, isAdding }) {
  const [hasAlbum, setHasAlbum] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkIfAlbumInList = async () => {
      try {
        const response = await fetch(`/api/lists/${list.id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
          }
        });
        
        const data = await response.json();
        
        if (data.success && data.list.albums) {
          const albumExists = data.list.albums.some(a => a.spotify_id === album.spotify_id);
          setHasAlbum(albumExists);
        }
      } catch (error) {
        console.error('Error verificando álbum en lista:', error);
      } finally {
        setChecking(false);
      }
    };
    
    checkIfAlbumInList();
  }, [list.id, album.spotify_id]);

  const handleAdd = () => {
    onAdd(list.id);
    setHasAlbum(true);
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-theme-card-hover rounded-lg border border-theme-border hover:bg-theme-card transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-theme-primary font-medium truncate">{list.name}</h4>
          {list.is_public ? (
            <Eye size={14} className="text-theme-secondary flex-shrink-0" />
          ) : (
            <EyeOff size={14} className="text-theme-secondary flex-shrink-0" />
          )}
        </div>
        <p className="text-theme-secondary text-sm">
          {list.album_count || 0} álbum{(list.album_count || 0) !== 1 ? 'es' : ''}
        </p>
      </div>
      
      <div className="flex-shrink-0">
        {checking ? (
          <Loader2 size={18} className="animate-spin text-theme-secondary" />
        ) : hasAlbum ? (
          <div className="flex items-center gap-1 text-green-400">
            <Check size={18} />
            <span className="text-sm">Agregado</span>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            disabled={isAdding}
            className="flex items-center gap-1 px-3 py-1 bg-purple-600/50 hover:bg-purple-600/70 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAdding ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Plus size={16} />
            )}
            <span className="text-sm">Agregar</span>
          </button>
        )}
      </div>
    </div>
  );
}
