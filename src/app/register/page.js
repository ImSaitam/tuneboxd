"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Music, Eye, EyeOff, Mail, Lock, User, ArrowLeft, Check, X } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1); // 1: formulario, 2: verificación
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

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
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!data.success) {
        setError(data.message);
        return;
      }
      
      // Ir al paso de verificación
      setStep(2);
      
    } catch (err) {
      setError('Error al conectar con el servidor. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = async () => {
    setResendLoading(true);
    setResendMessage('');

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();
      setResendMessage(data.message);
      
    } catch (err) {
      setResendMessage('Error al reenviar el email. Inténtalo de nuevo.');
    } finally {
      setResendLoading(false);
    }
  };

  const ValidationItem = ({ isValid, text }) => (
    <div className={`flex items-center text-sm transition-colors duration-300 ${
      isValid ? 'text-green-400' : 'text-white/60'
    }`}>
      {isValid ? (
        <Check className="w-4 h-4 mr-2" />
      ) : (
        <X className="w-4 h-4 mr-2" />
      )}
      {text}
    </div>
  );

  if (step === 2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-800 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-green-400 to-teal-400 rounded-full mb-6">
              <Check className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              ¡Cuenta creada!
            </h1>
            <p className="text-white/70 mb-8">
              Te hemos enviado un correo de verificación a <strong>{formData.email}</strong>.
              Por favor, revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta.
            </p>
            
            {/* Mensaje de reenvío */}
            {resendMessage && (
              <div className={`rounded-2xl p-4 mb-6 ${
                resendMessage.includes('Error') 
                  ? 'bg-red-500/20 border border-red-400/30' 
                  : 'bg-green-500/20 border border-green-400/30'
              }`}>
                <p className={`text-sm text-center ${
                  resendMessage.includes('Error') ? 'text-red-200' : 'text-green-200'
                }`}>
                  {resendMessage}
                </p>
              </div>
            )}
            
            <div className="space-y-4">
              <button 
                onClick={handleResendEmail}
                disabled={resendLoading}
                className="w-full bg-gradient-to-r from-red-400 to-teal-400 text-white py-3 rounded-2xl font-semibold hover:from-red-500 hover:to-teal-500 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-70 disabled:transform-none"
              >
                {resendLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                    Reenviando...
                  </div>
                ) : (
                  'Reenviar correo de verificación'
                )}
              </button>
              <Link
                href="/login"
                className="block w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-2xl font-medium transition-all duration-300 transform hover:-translate-y-1 text-center"
              >
                Ir al inicio de sesión
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
          href="/"
          className="inline-flex items-center text-white/80 hover:text-white mb-8 transition-colors duration-300 group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform duration-300" />
          Volver al inicio
        </Link>

        {/* Formulario de Registro */}
        <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-400 to-teal-400 rounded-full mb-4">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Únete a Tuneboxd
            </h1>
            <p className="text-white/70">
              Crea tu cuenta y comienza tu viaje musical
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
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-white/80 text-sm font-medium mb-2">
                Nombre de usuario
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-teal-400 focus:bg-white/20 transition-all duration-300"
                  placeholder="tu_nombre_usuario"
                />
              </div>
            </div>

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
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-teal-400 focus:bg-white/20 transition-all duration-300"
                  placeholder="tu@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-white/80 text-sm font-medium mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-11 pr-12 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:border-teal-400 focus:bg-white/20 transition-all duration-300"
                  placeholder="Tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors duration-300"
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
              <label htmlFor="confirmPassword" className="block text-white/80 text-sm font-medium mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  required
                  className={`w-full pl-11 pr-12 py-3 bg-white/10 border rounded-2xl text-white placeholder-white/50 focus:outline-none focus:bg-white/20 transition-all duration-300 ${
                    formData.confirmPassword && !passwordsMatch 
                      ? 'border-red-400 focus:border-red-400' 
                      : 'border-white/20 focus:border-teal-400'
                  }`}
                  placeholder="Confirma tu contraseña"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors duration-300"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {formData.confirmPassword && !passwordsMatch && (
                <p className="text-red-400 text-sm mt-2">Las contraseñas no coinciden</p>
              )}
            </div>

            {/* Terms */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 mr-3"
              />
              <label htmlFor="terms" className="text-white/70 text-sm">
                Acepto los{' '}
                <Link href="/terms" className="text-teal-400 hover:text-teal-300 transition-colors duration-300">
                  Términos de Servicio
                </Link>{' '}
                y la{' '}
                <Link href="/privacy" className="text-teal-400 hover:text-teal-300 transition-colors duration-300">
                  Política de Privacidad
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isPasswordValid || !passwordsMatch}
              className="w-full bg-gradient-to-r from-red-400 to-teal-400 text-white py-3 rounded-2xl font-semibold hover:from-red-500 hover:to-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-transparent transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-70 disabled:transform-none disabled:shadow-none"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Creando cuenta...
                </div>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-white/20"></div>
            <span className="px-4 text-white/50 text-sm">o</span>
            <div className="flex-1 border-t border-white/20"></div>
          </div>

          {/* Social Registration */}
          <div className="space-y-3">
            <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-2xl font-medium transition-all duration-300 transform hover:-translate-y-1">
              Registrarse con Google
            </button>
            <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-2xl font-medium transition-all duration-300 transform hover:-translate-y-1">
              Registrarse con Spotify
            </button>
          </div>

          {/* Login Link */}
          <div className="text-center mt-8">
            <p className="text-white/70">
              ¿Ya tienes una cuenta?{' '}
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

export default RegisterPage;
