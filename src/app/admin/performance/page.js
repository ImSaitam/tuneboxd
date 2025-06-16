// Página de administración para monitorear rendimiento del sistema
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Activity, Database, Zap, RefreshCw, 
  TrendingUp, Server, Clock, Users, MessageSquare,
  BarChart3, PieChart, LineChart
} from 'lucide-react';
import PerformanceStats from '../../../components/PerformanceStats';

const AdminPerformancePage = () => {
  const [systemInfo, setSystemInfo] = useState({
    uptime: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    diskUsage: 0
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    fetchSystemInfo();
    const interval = setInterval(fetchSystemInfo, 10000); // Cada 10 segundos
    return () => clearInterval(interval);
  }, []);

  const fetchSystemInfo = async () => {
    try {
      // En un entorno real, esto vendría de una API del sistema
      setSystemInfo({
        uptime: Math.floor(process.uptime ? process.uptime() : 0),
        memoryUsage: Math.random() * 100,
        cpuUsage: Math.random() * 100,
        diskUsage: Math.random() * 100
      });
    } catch (error) {
      console.error('Error fetching system info:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSystemInfo();
    setLastRefresh(new Date());
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / (24 * 3600));
    const hours = Math.floor((seconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (percentage) => {
    if (percentage < 50) return 'text-green-400';
    if (percentage < 80) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getStatusBg = (percentage) => {
    if (percentage < 50) return 'bg-green-500/20 border-green-500/30';
    if (percentage < 80) return 'bg-yellow-500/20 border-yellow-500/30';
    return 'bg-red-500/20 border-red-500/30';
  };

  return (
    <div className="min-h-screen bg-theme-primary">
      {/* Header */}
      <div className="bg-theme-card backdrop-blur-sm border-b border-theme-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link 
                href="/community"
                className="flex items-center space-x-2 text-theme-primary hover:text-theme-accent transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Volver a Comunidad</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-theme-primary flex items-center space-x-2">
                <Activity className="w-8 h-8" />
                <span>Performance Dashboard</span>
              </h1>
            </div>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-theme-accent hover:bg-theme-hover text-theme-button rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Actualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* System Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className={`p-6 rounded-xl border backdrop-blur-sm ${getStatusBg(systemInfo.memoryUsage)}`}>
              <div className="flex items-center space-x-3">
                <Server className="w-8 h-8" />
                <div>
                  <div className={`text-2xl font-bold ${getStatusColor(systemInfo.memoryUsage)}`}>
                    {systemInfo.memoryUsage.toFixed(1)}%
                  </div>
                  <div className="text-sm opacity-80">Memoria RAM</div>
                  <div className="text-xs opacity-60">Sistema</div>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl border backdrop-blur-sm ${getStatusBg(systemInfo.cpuUsage)}`}>
              <div className="flex items-center space-x-3">
                <Zap className="w-8 h-8" />
                <div>
                  <div className={`text-2xl font-bold ${getStatusColor(systemInfo.cpuUsage)}`}>
                    {systemInfo.cpuUsage.toFixed(1)}%
                  </div>
                  <div className="text-sm opacity-80">CPU Usage</div>
                  <div className="text-xs opacity-60">Procesador</div>
                </div>
              </div>
            </div>

            <div className={`p-6 rounded-xl border backdrop-blur-sm ${getStatusBg(systemInfo.diskUsage)}`}>
              <div className="flex items-center space-x-3">
                <Database className="w-8 h-8" />
                <div>
                  <div className={`text-2xl font-bold ${getStatusColor(systemInfo.diskUsage)}`}>
                    {systemInfo.diskUsage.toFixed(1)}%
                  </div>
                  <div className="text-sm opacity-80">Disco</div>
                  <div className="text-xs opacity-60">Almacenamiento</div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-xl border backdrop-blur-sm bg-blue-500/20 text-blue-400 border-blue-500/30">
              <div className="flex items-center space-x-3">
                <Clock className="w-8 h-8" />
                <div>
                  <div className="text-2xl font-bold">
                    {formatUptime(systemInfo.uptime)}
                  </div>
                  <div className="text-sm opacity-80">Uptime</div>
                  <div className="text-xs opacity-60">Sistema activo</div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Stats Component */}
          <PerformanceStats />

          {/* Optimization Status */}
          <div className="bg-theme-card rounded-xl p-6 border border-theme-border">
            <h3 className="text-xl font-semibold text-theme-primary mb-6 flex items-center space-x-2">
              <TrendingUp className="w-6 h-6" />
              <span>Estado de Optimizaciones</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-green-400">Cache en Memoria</span>
                </div>
                <p className="text-sm text-theme-muted">
                  Sistema de cache TTL implementado con invalidación automática
                </p>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-green-400">API Unificada</span>
                </div>
                <p className="text-sm text-theme-muted">
                  Reducción de 3 requests a 1 solo endpoint optimizado
                </p>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-green-400">Pool de Conexiones</span>
                </div>
                <p className="text-sm text-theme-muted">
                  Gestión eficiente de conexiones a la base de datos
                </p>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-green-400">Índices de DB</span>
                </div>
                <p className="text-sm text-theme-muted">
                  Índices optimizados para consultas frecuentes
                </p>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-green-400">React.memo</span>
                </div>
                <p className="text-sm text-theme-muted">
                  Componentes memoizados para evitar re-renders innecesarios
                </p>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium text-green-400">Compresión</span>
                </div>
                <p className="text-sm text-theme-muted">
                  Compresión gzip habilitada para respuestas de API
                </p>
              </div>
            </div>
          </div>

          {/* Last Update Info */}
          <div className="text-center text-sm text-theme-muted">
            <p>Última actualización: {lastRefresh.toLocaleString()}</p>
            <p className="mt-1">
              Dashboard de rendimiento • TuneBoxd v1.0 • 
              <span className="text-theme-accent"> Performance Mode Enabled</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPerformancePage;
