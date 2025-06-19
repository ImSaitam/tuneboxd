"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Music, Eye, EyeOff, Lock, ArrowLeft, Check, X } from 'lucide-react';

const ResetPasswordContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Validaciones de contraseña
  const passwordValidations = {
    minLength: formData.password.length >= 8,
    hasUppercase: /[A-Z]/.test(formData.password),
    hasLowercase: /[a-z]/.test(formData.password),
    hasNumber: /\d/.test(formData.password),
    hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password)
  };

  const isPasswordValid = Object.values(passwordValidations).every(Boolean);
  const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  useEffect(() => {
    if (!token) {
      setError('Token de recuperación no válido o faltante.');
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!token) {
      setError('Token de recuperación no válido.');
      return;
    }

    if (!isPasswordValid) {
      setError('La contraseña no cumple con los requisitos de seguridad.');
      return;
    }

    if (!passwordsMatch) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        return;
      }
      
      setSuccess(true);
      
    } catch (err) {
      setError('Error al conectar con el servidor. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const ValidationItem = ({ isValid, text }) => (
    <div className={`flex items-center text-sm transition-colors duration-300 ${
      isValid ? 'text-green-400' : 'text-theme-muted'
    }`}>
      {isValid ? (
        <Check className="w-4 h-4 mr-2" />
      ) : (
        <X className="w-4 h-4 mr-2" />
      )}
      {text}
    </div>
  );

  if (success) {
    return (
      <div className="min-h-screen bg-theme-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-theme-card backdrop-blur-md rounded-3xl p-8 border border-theme shadow-2xl text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-theme-accent rounded-full mb-6">
              <Check className="w-10 h-10 text-theme-primary" />
            </div>
            <h1 className="text-3xl font-bold text-theme-primary mb-4">
              ¡Contraseña actualizada!
            </h1>
            <p className="text-theme-secondary mb-8">
              Tu contraseña ha sido restablecida exitosamente. 
              Ya puedes iniciar sesión con tu nueva contraseña.
            </p>
            <Link
              href="/login"
              className="block w-full bg-theme-accent text-theme-button py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:-translate-y-1 text-center hover:opacity-90"
            >
              Ir al inicio de sesión
            </Link>
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
              Nueva contraseña
            </h1>
            <p className="text-theme-secondary">
              Ingresa tu nueva contraseña segura
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
            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-theme-secondary text-sm font-medium mb-2">
                Nueva contraseña
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
                  placeholder="Tu nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-muted hover:text-theme-secondary transition-colors duration-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Requirements */}
              {formData.password && (
                <div className="mt-3 space-y-1">
                  <ValidationItem isValid={passwordValidations.minLength} text="Mínimo 8 caracteres" />
                  <ValidationItem isValid={passwordValidations.hasUppercase} text="Una letra mayúscula" />
                  <ValidationItem isValid={passwordValidations.hasLowercase} text="Una letra minúscula" />
                  <ValidationItem isValid={passwordValidations.hasNumber} text="Un número" />
                  <ValidationItem isValid={passwordValidations.hasSpecial} text="Un carácter especial" />
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-theme-secondary text-sm font-medium mb-2">
                Confirmar nueva contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-theme-muted w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className={`w-full pl-11 pr-12 py-3 bg-theme-card border rounded-2xl text-theme-primary placeholder-theme-muted focus:outline-none focus:bg-theme-card-hover transition-all duration-300 ${
                    formData.confirmPassword && !passwordsMatch 
                      ? 'border-red-400 focus:border-red-400' 
                      : 'border-theme focus:border-theme-accent'
                  }`}
                  placeholder="Confirma tu nueva contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme-muted hover:text-theme-secondary transition-colors duration-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && !passwordsMatch && (
                <p className="text-red-400 text-sm mt-2">Las contraseñas no coinciden</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch || !token}
              className="w-full bg-theme-accent text-theme-button py-3 rounded-2xl font-semibold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-theme-accent focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-70 disabled:transform-none disabled:shadow-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-theme-primary/30 border-t-theme-primary rounded-full animate-spin mr-2"></div>
                  Actualizando...
                </div>
              ) : (
                'Restablecer contraseña'
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
          </div>      </div>
    </div>
  </div>
  );
};

const ResetPasswordPage = () => {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
};

export default ResetPasswordPage;
