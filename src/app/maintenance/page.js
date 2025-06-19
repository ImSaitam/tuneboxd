'use client';

import { useEffect, useState } from 'react';

export default function MaintenancePage() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Logo/Brand */}
        <div className="mb-8">
          <h1 className="text-6xl font-bold text-white mb-2">
            🎵 Tuneboxd
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-400 to-pink-400 mx-auto rounded-full"></div>
        </div>

        {/* Maintenance Icon */}
        <div className="mb-8">
          <div className="relative inline-block">
            <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
              <svg className="w-16 h-16 text-white animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">!</span>
            </div>
          </div>
        </div>

        {/* Main Message */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Sitio en Mantenimiento
          </h2>
          <p className="text-xl text-gray-300 mb-6 leading-relaxed">
            Estamos mejorando la experiencia para ti. 
            <br />
            Volveremos pronto con nuevas funcionalidades.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-700 rounded-full h-3 mb-4">
            <div className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full animate-pulse" style={{width: '75%'}}></div>
          </div>
          <p className="text-sm text-gray-400">Progreso estimado: 75%</p>
        </div>

        {/* Time */}
        <div className="mb-8 p-4 bg-black/20 rounded-lg backdrop-blur-sm">
          <p className="text-gray-300 text-sm mb-2">Hora actual:</p>
          <p className="text-2xl font-mono text-white">
            {currentTime.toLocaleString('es-ES', {
              timeZone: 'America/Argentina/Buenos_Aires',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit'
            })}
          </p>
        </div>

        {/* Expected Return */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 p-6 rounded-xl backdrop-blur-sm border border-blue-500/30">
            <h3 className="text-xl font-semibold text-white mb-2">
              ⏰ Tiempo Estimado de Retorno
            </h3>
            <p className="text-2xl font-bold text-blue-300">
              Próximamente
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            © 2025 TuneBoxd. Todos los derechos reservados.
          </p>
          <p className="text-gray-600 text-xs mt-2">
            Página de mantenimiento temporal
          </p>
        </div>
      </div>
    </div>
  );
}
