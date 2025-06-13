"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Music, Mail, ArrowLeft, Check } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        return;
      }
      
      // Mostrar información de desarrollo si está disponible
      if (process.env.NODE_ENV === 'development' && data.resetLink) {
        console.log('Enlace de recuperación (desarrollo):', data.resetLink);
      }
      
      setSubmitted(true);
      
    } catch (err) {
      setError('Error al conectar con el servidor. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-teal-400 rounded-full mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              ¡Correo enviado!
            </h1>
            <p className="text-white/70 mb-8">
              Te hemos enviado un enlace para restablecer tu contraseña a <strong>{email}</strong>.
              Por favor, revisa tu bandeja de entrada y sigue las instrucciones.
            </p>
            <div className="space-y-4">
              <button 
                onClick={() => setSubmitted(false)}
                className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-2xl font-medium transition-all duration-300 transform hover:-translate-y-1"
              >
                Enviar otro correo
              </button>
              <Link
                href="/login"
                className="block w-full bg-gradient-to-r from-red-400 to-teal-400 text-white py-3 rounded-2xl font-semibold hover:from-red-500 hover:to-teal-500 transition-all duration-300 transform hover:-translate-y-1 text-center"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-800 flex items-center justify-center p-4">
      {/* Floating Music Notes Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="absolute text-white/5 text-4xl animate-pulse"
            style={{
              left: `${10 + (i * 6)}%`,
              top: `${10 + (i * 5)}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + (i % 3)}s`
            }}
          >
            ♪
          </div>
        ))}
      </div>

      <div className="w-full max-w-md relative">
        {/* Botón de regreso */}
        <Link
          href="/login"
          className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors duration-300 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          Volver al inicio de sesión
        </Link>

        {/* Formulario */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-400 to-teal-400 rounded-full mb-4">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-white/70">
              No te preocupes, te enviaremos un enlace para restablecerla
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-400/30 rounded-2xl p-4 mb-6">
              <p className="text-red-200 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-white/80 text-sm font-medium mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-teal-400 focus:bg-white/20 transition-all duration-300"
                  placeholder="Ingresa tu correo electrónico"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-400 to-teal-400 text-white py-3 rounded-2xl font-semibold hover:from-red-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-70 disabled:transform-none disabled:shadow-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Enviando...
                </div>
              ) : (
                'Enviar enlace de recuperación'
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
            <p className="text-white/60 text-sm text-center">
              ¿Recordaste tu contraseña?{' '}
              <Link
                href="/login"
                className="text-teal-400 hover:text-teal-300 font-semibold transition-colors duration-300"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
