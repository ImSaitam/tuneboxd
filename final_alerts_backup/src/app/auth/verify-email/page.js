'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

function VerifyEmailContent() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage('Token de verificación no encontrado');
        return;
      }

      try {
        const response = await fetch('/api/auth/verify-email/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });
        
        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.message);
        }
      } catch (error) {
        setStatus('error');
        setMessage('Error al verificar la cuenta');
      }
    };

    verifyEmail();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">🎵</div>
          <h1 className="text-2xl font-bold text-white mb-2">Tuneboxd</h1>
          <h2 className="text-lg text-gray-300">Verificación de Email</h2>
        </div>

        {/* Status Content */}
        <div className="text-center">
          {status === 'loading' && (
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
              </div>
              <p className="text-gray-300">Verificando tu cuenta...</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6">
              <div className="text-6xl text-green-500">✅</div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-green-400">¡Verificación Exitosa!</h3>
                <p className="text-gray-300">{message}</p>
              </div>
              <div className="space-y-3">
                <Link 
                  href="/auth/login"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link 
                  href="/"
                  className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Ir al Inicio
                </Link>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="text-6xl text-red-500">❌</div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-red-400">Error de Verificación</h3>
                <p className="text-gray-300">{message}</p>
              </div>
              <div className="space-y-3">
                <Link 
                  href="/auth/register"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  Registrarse Nuevamente
                </Link>
                <Link 
                  href="/auth/login"
                  className="block w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                >
                  ¿Ya tienes cuenta? Inicia Sesión
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-700 text-center">
          <p className="text-sm text-gray-400">
            ¿Problemas con la verificación?{' '}
            <Link 
              href="/support" 
              className="text-blue-400 hover:text-blue-300 hover:underline"
            >
              Contacta soporte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 p-8">
          <div className="text-center">
            <div className="text-4xl mb-4">🎵</div>
            <h1 className="text-2xl font-bold text-white mb-2">Tuneboxd</h1>
            <div className="w-16 h-16 mx-auto mt-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
            </div>
            <p className="text-gray-300 mt-4">Cargando...</p>
          </div>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
