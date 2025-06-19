"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Menu, X, User, LogOut, Heart, List, PlayCircle, Bell } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useUserNotifications } from '@/hooks/useUserNotifications';
import ThemeToggle from '@/components/ThemeToggle';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Hooks
  const { user, isAuthenticated, logout } = useAuth();
  const { unreadCount } = useUserNotifications();

  // Links de navegación dinámicos basados en autenticación
  const getNavLinks = () => {
    const baseLinks = [
      { href: "/social", label: "Social", isLink: true },
      { href: "/community", label: "Comunidad", isLink: true }
    ];

    if (isAuthenticated) {
      return baseLinks;
    } else {
      return [
        ...baseLinks,
        { href: "/login", label: "Iniciar Sesión", isLink: true },
        { href: "/register", label: "Registrarse", isLink: true }
      ];
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    // Cerrar menús al hacer clic fuera
    const handleClickOutside = (event) => {
      if (userMenuOpen && !event.target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? "bg-theme-card" : "bg-theme-card/80"
      } backdrop-blur-md border-b border-theme`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="text-xl sm:text-2xl font-bold text-theme-accent">
              Tuneboxd
            </div>
          </Link>
          <div className="hidden md:flex space-x-8 items-center">
            {getNavLinks().map((link) =>
              link.isLink ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-theme-primary hover:bg-theme-card-hover px-4 py-2 rounded-full transition-all duration-300 hover:-translate-y-1"
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="text-theme-primary hover:bg-theme-card-hover px-4 py-2 rounded-full transition-all duration-300 hover:-translate-y-1"
                >
                  {link.label}
                </button>
              )
            )}

            {/* Search Button */}
            <Link
              href="/search"
              className="flex items-center space-x-2 text-theme-primary hover:bg-theme-card-hover px-4 py-2 rounded-full transition-all duration-300 hover:-translate-y-1"
              title="Buscar"
            >
              <Search className="w-4 h-4" />
              <span className="hidden lg:inline">Buscar</span>
            </Link>

            {/* Notification Bell - Solo si está autenticado */}
            {isAuthenticated && (
              <Link
                href="/notifications"
                className="relative p-2 text-theme-secondary hover:text-theme-primary transition-all duration-300 hover:scale-110"
                title={`Notificaciones${unreadCount > 0 ? ` (${unreadCount} sin leer)` : ''}`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            {isAuthenticated && (
              <div className="relative user-menu">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-2 text-theme-primary hover:bg-theme-card-hover px-4 py-2 rounded-full transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">{user?.username}</span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-theme-card border border-theme-border rounded-xl shadow-xl py-2 z-[9999]">
                    <Link
                      href={`/profile/${user?.username}`}
                      className="block px-4 py-2 text-theme-primary hover:bg-theme-hover transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 inline mr-2" />
                      Mi Perfil
                    </Link>
                    <Link
                      href="/favorites"
                      className="block px-4 py-2 text-theme-primary hover:bg-theme-hover transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Heart className="w-4 h-4 inline mr-2" />
                      Favoritos
                    </Link>
                    <Link
                      href="/notifications"
                      className="block px-4 py-2 text-theme-primary hover:bg-theme-hover transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="relative mr-2">
                            <Bell className="w-4 h-4" />
                            {unreadCount > 0 && (
                              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center text-[10px]">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </span>
                            )}
                          </div>
                          Notificaciones
                        </div>
                        {unreadCount > 0 && (
                          <span className="text-xs text-blue-500 font-semibold">
                            {unreadCount} nueva{unreadCount !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </Link>
                    <Link
                      href="/listen-list"
                      className="block px-4 py-2 text-theme-primary hover:bg-theme-hover transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <PlayCircle className="w-4 h-4 inline mr-2" />
                      Mi Lista de Escucha
                    </Link>
                    <Link
                      href="/lists"
                      className="block px-4 py-2 text-theme-primary hover:bg-theme-hover transition-colors"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <List className="w-4 h-4 inline mr-2" />
                      Mis Listas
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setUserMenuOpen(false);
                      }}
                      className="block w-full text-left px-4 py-2 text-theme-primary hover:bg-theme-hover transition-colors"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-theme-primary p-2 flex-shrink-0"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-theme-card border border-theme rounded-2xl mt-4 p-4">
            {getNavLinks().map((link) =>
              link.isLink ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block text-theme-primary hover:bg-theme-card-hover px-4 py-3 rounded-xl transition-all duration-300 mb-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.href}
                  onClick={() => {
                    scrollToSection(link.href);
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-theme-primary hover:bg-theme-card-hover px-4 py-3 rounded-xl transition-all duration-300 mb-2"
                >
                  {link.label}
                </button>
              )
            )}

            {/* Search Button in Mobile */}
            <Link
              href="/search"
              className="flex items-center gap-3 text-theme-primary hover:bg-theme-card-hover px-4 py-3 rounded-xl transition-all duration-300 mb-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Search className="w-4 h-4" />
              Buscar
            </Link>

            {/* Theme Toggle in Mobile */}
            <div className="flex items-center gap-3 px-4 py-3 mb-2">
              <ThemeToggle />
              <span className="text-theme-primary font-medium">Cambiar tema</span>
            </div>

            {/* Notification Bell in Mobile - Solo si está autenticado */}
            {isAuthenticated && (
              <Link
                href="/notifications"
                className="flex items-center justify-between text-theme-primary hover:bg-theme-card-hover px-4 py-3 rounded-xl transition-all duration-300 mb-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-3 w-3 flex items-center justify-center text-[10px]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>
                  Notificaciones
                </div>
                {unreadCount > 0 && (
                  <span className="text-xs text-theme-accent font-semibold">
                    {unreadCount} nueva{unreadCount !== 1 ? 's' : ''}
                  </span>
                )}
              </Link>
            )}

            {/* User section in mobile menu */}
            {isAuthenticated && (
              <div className="border-t border-theme mt-4 pt-4">
                <div className="text-theme-secondary px-4 py-2 mb-2">
                  Hola,{" "}
                  <span className="font-semibold text-theme-primary">
                    {user?.username}
                  </span>
                </div>
                <Link
                  href={`/profile/${user?.username}`}
                  className="block text-theme-primary hover:bg-theme-card-hover px-4 py-3 rounded-xl transition-all duration-300 mb-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <User className="w-4 h-4 inline mr-2" />
                  Mi Perfil
                </Link>
                <Link
                  href="/favorites"
                  className="block text-theme-primary hover:bg-theme-card-hover px-4 py-3 rounded-xl transition-all duration-300 mb-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="w-4 h-4 inline mr-2" />
                  Favoritos
                </Link>
                <Link
                  href="/listen-list"
                  className="block text-theme-primary hover:bg-theme-card-hover px-4 py-3 rounded-xl transition-all duration-300 mb-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <PlayCircle className="w-4 h-4 inline mr-2" />
                  Mi Lista de Escucha
                </Link>
                <Link
                  href="/lists"
                  className="block text-theme-primary hover:bg-theme-card-hover px-4 py-3 rounded-xl transition-all duration-300 mb-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <List className="w-4 h-4 inline mr-2" />
                  Mis Listas
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left text-theme-primary hover:bg-theme-card-hover px-4 py-3 rounded-xl transition-all duration-300"
                >
                  <LogOut className="w-4 h-4 inline mr-2" />
                  Cerrar Sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
