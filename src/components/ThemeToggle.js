'use client';

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

export default function ThemeToggle() {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative p-2 rounded-full border border-theme bg-theme-card hover:bg-theme-card-hover transition-all duration-300 hover:scale-110"
      title={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
      aria-label={`Cambiar a modo ${isDark ? 'claro' : 'oscuro'}`}
    >
      <div className="relative w-5 h-5">
        {isDark ? (
          <Sun className="w-5 h-5 text-theme-accent transition-transform duration-300 rotate-0 scale-100" />
        ) : (
          <Moon className="w-5 h-5 text-theme-accent transition-transform duration-300 rotate-0 scale-100" />
        )}
      </div>
    </button>
  );
}
