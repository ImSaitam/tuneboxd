'use client';

import { useState, useEffect, createContext, useContext } from 'react';

// Contexto del tema
const ThemeContext = createContext();

// Hook para usar el tema
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
};

// Proveedor del tema
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');
  const [isClient, setIsClient] = useState(false);

  // Cargar tema guardado del localStorage
  useEffect(() => {
    setIsClient(true);
    const savedTheme = localStorage.getItem('tuneboxd-theme');
    if (savedTheme) {
      setTheme(savedTheme);
    } else {
      // Por defecto usar dark mode
      setTheme('dark');
    }
  }, []);

  // Aplicar tema al DOM
  useEffect(() => {
    if (isClient) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('tuneboxd-theme', theme);
    }
  }, [theme, isClient]);

  // Función para alternar tema
  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  // Función para establecer tema específico
  const setSpecificTheme = (newTheme) => {
    if (newTheme === 'dark' || newTheme === 'light') {
      setTheme(newTheme);
    }
  };

  const value = {
    theme,
    toggleTheme,
    setTheme: setSpecificTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default useTheme;
