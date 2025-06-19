'use client';

import { useState, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

// Hook para manejo de toasts
export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const addToast = (options) => {
    const id = Date.now() + Math.random();
    const toast = {
      id,
      message: options.message || '',
      type: options.type || 'info', // 'success', 'error', 'warning', 'info'
      duration: options.duration || 4000,
      position: options.position || 'top-right',
      ...options
    };

    setToasts(prev => [...prev, toast]);

    // Auto-remove toast after duration
    setTimeout(() => {
      removeToast(id);
    }, toast.duration);

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Convenience methods
  const success = (message, options = {}) => {
    return addToast({ message, type: 'success', ...options });
  };

  const error = (message, options = {}) => {
    return addToast({ message, type: 'error', duration: 6000, ...options });
  };

  const warning = (message, options = {}) => {
    return addToast({ message, type: 'warning', duration: 5000, ...options });
  };

  const info = (message, options = {}) => {
    return addToast({ message, type: 'info', ...options });
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
};

// Componente Toast individual
export const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Animate in
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getBackgroundColor = () => {
    switch (toast.type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible && !isRemoving ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'}
        ${getBackgroundColor()}
        border rounded-lg shadow-lg p-4 mb-3 max-w-sm w-full
        backdrop-blur-sm
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium text-gray-800">
            {toast.message}
          </p>
          {toast.description && (
            <p className="text-xs text-gray-600 mt-1">
              {toast.description}
            </p>
          )}
        </div>
        <div className="ml-4 flex-shrink-0 flex">
          <button
            onClick={handleRemove}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Contenedor de toasts
export const ToastContainer = ({ toasts, onRemoveToast, position = 'top-right' }) => {
  if (toasts.length === 0) return null;

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-4 left-4';
      case 'top-right':
        return 'top-4 right-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'top-center':
        return 'top-4 left-1/2 transform -translate-x-1/2';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'top-4 right-4';
    }
  };

  return (
    <div className={`fixed ${getPositionClasses()} z-50 pointer-events-none`}>
      <div className="pointer-events-auto">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            toast={toast}
            onRemove={onRemoveToast}
          />
        ))}
      </div>
    </div>
  );
};
