"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Music, Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Head from 'next/head';

const LoginPage = () => {
  const router = useRouter();
  const { login, refreshAuth } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [needsVerification, setNeedsVerification] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error cuando el usuario empiece a escribir
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setNeedsVerification(false);

    try {
      // Usar el hook useAuth para manejar el login
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        // Refrescar el estado de autenticación para asegurar sincronización
        await refreshAuth();
        
        // Redirigir a la página principal
        router.push('/');
      }
      
    } catch (err) {
      // Manejar errores específicos del login
      if (err.needsVerification) {
        setNeedsVerification(true);
        setUserEmail(err.email || formData.email);
      }
      setError(err.message || 'Error al conectar con el servidor. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: userEmail }),
      });

      const data = await response.json();
      setError(data.message);
      
    } catch (err) {
      setError('Error al reenviar el email. Inténtalo de nuevo.');
    }
  };

  return (
    <>
      <Head>
        <title>Iniciar Sesión - Tuneboxd</title>
        <meta name="description" content="Accede a tu cuenta de Tuneboxd para gestionar tus reseñas musicales y listas de reproducción" />
        <meta name="robots" content="noindex, nofollow" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
      </Head>
      
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
            href="/"
            className="inline-flex items-center text-theme-secondary hover:text-theme-primary mb-8 transition-colors duration-300 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
            Volver al inicio
          </Link>

          {/* Formulario de Login */}
          <div className="bg-theme-card backdrop-blur-md rounded-3xl p-8 border border-theme shadow-2xl">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-theme-accent rounded-full mb-4">
                <Music className="w-8 h-8 text-theme-primary" />
              </div>
              <h1 className="text-3xl font-bold text-theme-primary mb-2">
                Bienvenido de vuelta
              </h1>
              <p className="text-theme-secondary">
                Inicia sesión para continuar tu viaje musical
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/20 border border-red-400/30 rounded-2xl p-4 mb-6">
                <p className="text-red-200 text-sm text-center">{error}</p>
                {needsVerification && (
                  <div className="mt-4 pt-4 border-t border-red-400/20">
                    <button
                      onClick={handleResendVerification}
                      className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-theme-button rounded-lg font-medium transition-colors"
                    >
                      Reenviar email de verificación
                    </button>
                  </div>
                )}
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
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-11 pr-4 py-3 bg-theme-card border border-theme rounded-2xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-theme-accent focus:bg-theme-card-hover transition-all duration-300"
                    placeholder="tu@email.com"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-theme-secondary text-sm font-medium mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-muted w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-11 pr-12 py-3 bg-theme-card border border-theme rounded-2xl text-theme-primary placeholder-theme-muted focus:outline-none focus:border-theme-accent focus:bg-theme-card-hover transition-all duration-300"
                    placeholder="Tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-muted hover:text-theme-secondary transition-colors duration-300"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="sr-only"
                  />
                  <div className="relative">
                    <div className="w-4 h-4 bg-theme-card border border-theme rounded"></div>
                  </div>
                  <span className="ml-2 text-theme-secondary text-sm">Recordarme</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-theme-accent hover:opacity-80 text-sm transition-colors duration-300"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-theme-accent text-theme-button py-3 rounded-2xl font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-theme-accent focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-70 disabled:transform-none disabled:shadow-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Iniciando sesión...
                  </div>
                ) : (
                  'Iniciar sesión'
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center mt-8">
              <p className="text-theme-secondary">
                ¿No tienes una cuenta?{' '}
                <Link
                  href="/register"
                  className="text-theme-accent hover:opacity-80 font-semibold transition-colors duration-300"
                >
                  Regístrate aquí
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;
