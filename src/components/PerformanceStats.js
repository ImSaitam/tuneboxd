// Componente para mostrar estadísticas de rendimiento del sistema
'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Database, Zap, Clock, Users, MessageSquare } from 'lucide-react';

const PerformanceStats = () => {
  const [stats, setStats] = useState({
    cacheHits: 0,
    cacheMisses: 0,
    avgResponseTime: 0,
    activeConnections: 0,
    threadsCount: 0,
    usersOnline: 0,
    isLoading: true
  });

  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 5000); // Actualizar cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/forum/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setStats(prev => ({ ...prev, isLoading: false }));
    }
  };

  const cacheHitRate = stats.cacheHits + stats.cacheMisses > 0 
    ? ((stats.cacheHits / (stats.cacheHits + stats.cacheMisses)) * 100).toFixed(1)
    : 0;

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }) => {
    const colorClasses = {
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      red: 'bg-red-500/20 text-red-400 border-red-500/30',
      cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
    };

    return (
      <div className={`p-4 rounded-xl border backdrop-blur-sm ${colorClasses[color]}`}>
        <div className="flex items-center space-x-3">
          <Icon className="w-8 h-8" />
          <div>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-sm opacity-80">{title}</div>
            {subtitle && <div className="text-xs opacity-60">{subtitle}</div>}
          </div>
        </div>
      </div>
    );
  };

  if (stats.isLoading) {
    return (
      <div className="bg-theme-card rounded-xl p-6 border border-theme-border">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="w-5 h-5 text-theme-accent animate-pulse" />
          <h3 className="text-lg font-semibold text-theme-primary">Estadísticas del Sistema</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-accent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-theme-card rounded-xl p-6 border border-theme-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-theme-accent" />
          <h3 className="text-lg font-semibold text-theme-primary">Estadísticas del Sistema</h3>
        </div>
        <div className="text-xs text-theme-muted">
          Actualizado: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          icon={Zap}
          title="Cache Hit Rate"
          value={`${cacheHitRate}%`}
          subtitle={`${stats.cacheHits} hits / ${stats.cacheMisses} misses`}
          color="green"
        />
        
        <StatCard
          icon={Clock}
          title="Tiempo Promedio"
          value={`${stats.avgResponseTime}ms`}
          subtitle="Respuesta API"
          color="blue"
        />
        
        <StatCard
          icon={Database}
          title="Conexiones"
          value={stats.activeConnections}
          subtitle="Base de datos activas"
          color="purple"
        />
        
        <StatCard
          icon={MessageSquare}
          title="Hilos Totales"
          value={stats.threadsCount}
          subtitle="En la comunidad"
          color="cyan"
        />
        
        <StatCard
          icon={Users}
          title="Usuarios Activos"
          value={stats.usersOnline}
          subtitle="Últimos 15 min"
          color="orange"
        />
        
        <StatCard
          icon={Activity}
          title="Rendimiento"
          value={cacheHitRate > 80 ? 'Excelente' : cacheHitRate > 60 ? 'Bueno' : 'Regular'}
          subtitle={`Optimización ${cacheHitRate > 80 ? '🚀' : cacheHitRate > 60 ? '⚡' : '📈'}`}
          color={cacheHitRate > 80 ? 'green' : cacheHitRate > 60 ? 'blue' : 'orange'}
        />
      </div>

      <div className="mt-6 p-4 bg-theme-primary/50 rounded-lg">
        <h4 className="text-sm font-medium text-theme-primary mb-2">Optimizaciones Activas:</h4>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">✅ Cache en Memoria</span>
          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">✅ API Unificada</span>
          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">✅ Pool de Conexiones</span>
          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">✅ Índices DB</span>
          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">✅ React.memo</span>
          <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded">✅ Compresión</span>
        </div>
      </div>
    </div>
  );
};

export default PerformanceStats;
