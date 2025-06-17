"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, XCircle, Loader2, Mail, ArrowLeft } from 'lucide-react';

function VerifyEmailContent() {
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
    <div className="min-h-screen bg-theme-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-theme-card backdrop-blur-md rounded-3xl p-8 border border-theme shadow-2xl">
          
          {/* Botón de regreso */}
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-theme-secondary hover:text-theme-primary transition-colors duration-300 group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
              Volver al inicio
            </Link>
          </div>

          <div className="text-center">
            {status === 'loading' && (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-theme-accent rounded-full mb-6">
                  <Loader2 className="w-10 h-10 text-theme-primary animate-spin" />
                </div>
                <h1 className="text-3xl font-bold text-theme-primary mb-4">
                  Verificando email
                </h1>
                <p className="text-theme-secondary">
                  Por favor espera mientras verificamos tu cuenta...
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-500 rounded-full mb-6">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-theme-primary mb-4">
                  ¡Email verificado!
                </h1>
                <p className="text-theme-secondary mb-8">
                  {message || 'Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión.'}
                </p>
                <div className="space-y-4">
                  <button
                    onClick={handleGoToLogin}
                    className="w-full bg-theme-accent text-theme-button py-3 rounded-2xl font-semibold hover:opacity-90 transition-all duration-300 transform hover:-translate-y-1"
                  >
                    Iniciar sesión
                  </button>
                  <Link
                    href="/"
                    className="block w-full bg-theme-card hover:bg-theme-card-hover border border-theme text-theme-primary py-3 rounded-2xl font-medium transition-all duration-300 transform hover:-translate-y-1 text-center"
                  >
                    Ir al inicio
                  </Link>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-500 rounded-full mb-6">
                  <XCircle className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-theme-primary mb-4">
                  Error de verificación
                </h1>
                <p className="text-theme-secondary mb-8">
                  {message || 'Hubo un problema al verificar tu email. El enlace puede haber expirado.'}
                </p>
                <div className="space-y-4">
                  <Link
                    href="/register"
                    className="block w-full bg-theme-accent text-theme-button py-3 rounded-2xl font-semibold hover:opacity-90 transition-all duration-300 transform hover:-translate-y-1 text-center"
                  >
                    Registrarse de nuevo
                  </Link>
                  <Link
                    href="/login"
                    className="block w-full bg-theme-card hover:bg-theme-card-hover border border-theme text-theme-primary py-3 rounded-2xl font-medium transition-all duration-300 transform hover:-translate-y-1 text-center"
                  >
                    Iniciar sesión
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Información adicional */}
          {status === 'error' && (
            <div className="mt-8 p-4 bg-theme-card-hover rounded-2xl border border-theme">
              <div className="flex items-center justify-center mb-3">
                <Mail className="w-5 h-5 text-theme-accent mr-2" />
                <span className="text-theme-primary font-medium">¿Necesitas ayuda?</span>
              </div>
              <p className="text-theme-muted text-sm text-center">
                Si sigues teniendo problemas, ponte en contacto con nuestro equipo de soporte o intenta registrarte nuevamente.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Verificando email...</div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
