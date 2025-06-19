'use client';

import React, { useState } from 'react';
import { RefreshCw, Database, Trash2, Check, AlertCircle } from 'lucide-react';

export default function CacheStatus({ onRefresh, showCacheControls = false }) {
  const [clearing, setClearing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);

  const clearAllCaches = async () => {
    setClearing(true);
    try {
      // Limpiar cache del navegador
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Limpiar localStorage relacionado con cache
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('cache') || key.includes('etag'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      setLastUpdate(new Date());
      
      // Refrescar la página actual
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error) {
      console.error('Error limpiando cache:', error);
    } finally {
      setClearing(false);
    }
  };

  const refreshData = () => {
    setLastUpdate(new Date());
    if (onRefresh) {
      onRefresh();
    }
  };

  if (!showCacheControls) {
    return (
      <button
        onClick={refreshData}
        className="flex items-center space-x-2 px-3 py-2 text-theme-secondary hover:text-theme-primary transition-colors"
        title="Refrescar datos"
      >
        <RefreshCw className="w-4 h-4" />
        <span className="text-sm">Refrescar</span>
      </button>
    );
  }

  return (
    <div className="bg-theme-card border border-theme-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-theme-primary flex items-center space-x-2">
          <Database className="w-4 h-4" />
          <span>Estado del Cache</span>
        </h3>
        {lastUpdate && (
          <div className="flex items-center space-x-1 text-xs text-theme-secondary">
            <Check className="w-3 h-3 text-green-500" />
            <span>Actualizado {lastUpdate.toLocaleTimeString()}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <button
          onClick={refreshData}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-theme-accent text-theme-button rounded-md hover:bg-theme-hover transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refrescar Datos</span>
        </button>

        <button
          onClick={clearAllCaches}
          disabled={clearing}
          className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
        >
          {clearing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Limpiando...</span>
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4" />
              <span>Limpiar Cache</span>
            </>
          )}
        </button>

        <div className="text-xs text-theme-muted">
          <div className="flex items-center space-x-1">
            <AlertCircle className="w-3 h-3" />
            <span>El cache mejora la velocidad de carga</span>
          </div>
        </div>
      </div>
    </div>
  );
}
