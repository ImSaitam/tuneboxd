'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WatchlistRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir a la nueva URL de lista de escucha
    router.replace('/listen-list');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="text-center text-white">
        <h1 className="text-2xl font-bold mb-4">Redirigiendo...</h1>
        <p className="text-gray-300">Te estamos redirigiendo a tu Lista de Escucha</p>
      </div>
    </div>
  );
}
