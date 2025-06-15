"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2, Mail, ArrowLeft } from 'lucide-react';

export default function VerifyEmailPage() {
  const [status, setStatus] = useState('loading'); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token de verificación no proporcionado');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (data.success) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.message);
        }
      } catch (error) {
        console.error('Error verificando email:', error);
        setStatus('error');
        setMessage('Error al verificar el email. Inténtalo de nuevo.');
      }
    };

    verifyEmail();
  }, [token]);

  const handleGoToLogin = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mb-4">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Verificación de Email
            </h1>
          </div>

          {/* Content */}
          <div className="text-center">
            {status === 'loading' && (
              <>
                <div className="flex justify-center mb-6">
                  <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
                </div>
                <p className="text-white/70 text-lg">
                  Verificando tu cuenta...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="flex justify-center mb-6">
                  <CheckCircle className="w-16 h-16 text-green-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  ✅ ¡Verificación Exitosa!
                </h2>
                <p className="text-white/80 mb-8 leading-relaxed">
                  {message}
                </p>
                <div className="space-y-4">
                  <button
                    onClick={handleGoToLogin}
                    className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-2xl hover:from-green-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-400/50"
                  >
                    Iniciar Sesión
                  </button>
                  <Link
                    href="/"
                    className="block w-full py-3 px-6 bg-white/10 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 text-center border border-white/20"
                  >
                    Explorar Tuneboxd
                  </Link>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="flex justify-center mb-6">
                  <XCircle className="w-16 h-16 text-red-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-4">
                  ❌ Error de Verificación
                </h2>
                <p className="text-red-200 mb-8 leading-relaxed">
                  {message}
                </p>
                <div className="bg-red-500/20 border border-red-400/30 rounded-2xl p-4 mb-6">
                  <p className="text-red-200 text-sm">
                    <strong>Posibles causas:</strong>
                  </p>
                  <ul className="text-red-200 text-sm mt-2 space-y-1 text-left">
                    <li>• El enlace ha expirado (válido por 24 horas)</li>
                    <li>• El enlace ya fue usado</li>
                    <li>• El enlace está dañado o es inválido</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <Link
                    href="/register"
                    className="block w-full py-3 px-6 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-2xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 text-center"
                  >
                    Crear Nueva Cuenta
                  </Link>
                  <Link
                    href="/login"
                    className="block w-full py-3 px-6 bg-white/10 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 text-center border border-white/20"
                  >
                    Intentar Iniciar Sesión
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-white/10 text-center">
            <Link
              href="/"
              className="inline-flex items-center text-white/60 hover:text-white transition-colors duration-300"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
