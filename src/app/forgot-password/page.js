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
      <div className="min-h-screen bg-theme-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-theme-card backdrop-blur-md rounded-3xl p-8 border border-theme shadow-2xl text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-theme-accent rounded-full mb-6">
              <Check className="w-10 h-10 text-theme-primary" />
            </div>
            <h1 className="text-3xl font-bold text-theme-primary mb-4">
              ¡Correo enviado!
            </h1>
            <p className="text-theme-secondary mb-8">
              Te hemos enviado un enlace para restablecer tu contraseña a <strong>{email}</strong>.
              Por favor, revisa tu bandeja de entrada y sigue las instrucciones.
            </p>
            <div className="space-y-4">
              <button 
                onClick={() => setSubmitted(false)}
                className="w-full bg-theme-card hover:bg-theme-card-hover border border-theme text-theme-primary py-3 rounded-2xl font-medium transition-all duration-300 transform hover:-translate-y-1"
              >
                Enviar otro correo
              </button>
              <Link
                href="/login"
                className="block w-full bg-theme-accent text-theme-button py-3 rounded-2xl font-semibold hover:opacity-90 transition-all duration-300 transform hover:-translate-y-1 text-center"
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
    <div className="min-h-screen bg-theme-primary flex items-center justify-center p-4">
      {/* Floating Music Notes Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 15 }, (_, i) => (
          <div
            key={i}
            className="absolute text-theme-muted text-4xl animate-pulse"
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
          className="inline-flex items-center text-theme-secondary hover:text-theme-primary mb-8 transition-colors duration-300 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          Volver al inicio de sesión
        </Link>

        {/* Formulario */}
        <div className="bg-theme-card backdrop-blur-md rounded-3xl p-8 border border-theme shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-theme-accent rounded-full mb-4">
              <Music className="w-8 h-8 text-theme-primary" />
            </div>
            <h1 className="text-3xl font-bold text-theme-primary mb-2">
              ¿Olvidaste tu contraseña?
            </h1>
            <p className="text-theme-secondary">
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
              <label htmlFor="email" className="block text-theme-secondary text-sm font-medium mb-2">
                Correo electrónico
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-muted w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-theme-card border border-theme rounded-2xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-theme-accent focus:bg-theme-card-hover transition-all duration-300"
                  placeholder="Ingresa tu correo electrónico"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-theme-accent text-theme-button py-3 rounded-2xl font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-theme-accent focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-70 disabled:transform-none disabled:shadow-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-theme-primary/30 border-t-theme-primary rounded-full animate-spin mr-2"></div>
                  Enviando...
                </div>
              ) : (
                'Enviar enlace de recuperación'
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-8 p-4 bg-theme-card-hover rounded-2xl border border-theme">
            <p className="text-theme-muted text-sm text-center">
              ¿Recordaste tu contraseña?{' '}
              <Link
                href="/login"
                className="text-theme-accent hover:opacity-80 font-semibold transition-colors duration-300"
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
