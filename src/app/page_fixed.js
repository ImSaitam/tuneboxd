"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Music, Edit3, Users, Target, BarChart3, Eye, Loader2, Menu, X, User, LogOut } from 'lucide-react';
import { useSpotify } from '@/hooks/useSpotify';
import { useAuth } from '@/hooks/useAuth';

const MusicboxdApp = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [visibleStats, setVisibleStats] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchType, setSearchType] = useState('album');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const statsRef = useRef(null);
  const heroRef = useRef(null);
  const searchRef = useRef(null);

  // Hooks
  const { loading: spotifyLoading, error: spotifyError, searchMusic } = useSpotify();
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();

  // Array de posiciones fijas para las notas musicales para evitar Math.random() en hydration
  const musicNotesPositions = [
    { left: '10%', top: '15%', delay: '0s', duration: '4s' },
    { left: '85%', top: '25%', delay: '1s', duration: '5s' },
    { left: '20%', top: '40%', delay: '2s', duration: '3s' },
    { left: '70%', top: '60%', delay: '0.5s', duration: '6s' },
    { left: '45%', top: '30%', delay: '3s', duration: '4s' },
    { left: '90%', top: '80%', delay: '1.5s', duration: '5s' },
    { left: '5%', top: '70%', delay: '2.5s', duration: '3.5s' },
    { left: '60%', top: '10%', delay: '4s', duration: '4.5s' },
    { left: '30%', top: '85%', delay: '0.8s', duration: '6s' },
    { left: '75%', top: '45%', delay: '3.2s', duration: '3.8s' },
    { left: '15%', top: '55%', delay: '1.8s', duration: '5.2s' },
    { left: '95%', top: '35%', delay: '2.8s', duration: '4.2s' },
    { left: '40%', top: '75%', delay: '4.5s', duration: '3.5s' },
    { left: '80%', top: '20%', delay: '0.3s', duration: '5.8s' },
    { left: '25%', top: '65%', delay: '3.8s', duration: '4.8s' },
    { left: '65%', top: '90%', delay: '1.3s', duration: '3.3s' },
    { left: '50%', top: '50%', delay: '2.3s', duration: '5.5s' },
    { left: '35%', top: '20%', delay: '4.3s', duration: '4.3s' },
    { left: '85%', top: '70%', delay: '0.7s', duration: '6.2s' },
    { left: '55%', top: '35%', delay: '3.7s', duration: '3.7s' }
  ];

  const featuresData = [
    {
      icon: <Music className="w-12 h-12" />,
      title: "Califica y Reseña",
      description: "Califica tus álbumes favoritos y escribe reseñas detalladas para compartir tu experiencia musical con la comunidad."
    },
    {
      icon: <Edit3 className="w-12 h-12" />,
      title: "Diario Musical",
      description: "Lleva un registro de toda la música que escuchas, cuándo la descubriste y cómo te hizo sentir en ese momento."
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "Comunidad Activa",
      description: "Conecta con otros melómanos, sigue a tus críticos favoritos y descubre nueva música a través de recomendaciones."
    },
    {
      icon: <Target className="w-12 h-12" />,
      title: "Listas Personalizadas",
      description: "Crea listas temáticas, de estados de ánimo o por géneros. Organiza tu música de la manera que más te guste."
    },
    {
      icon: <BarChart3 className="w-12 h-12" />,
      title: "Estadísticas Detalladas",
      description: "Analiza tus hábitos musicales con estadísticas completas sobre géneros, años, artistas y mucho más."
    },
    {
      icon: <Eye className="w-12 h-12" />,
      title: "Descubrimiento Inteligente",
      description: "Algoritmos que aprenden de tus gustos para sugerirte álbumes que realmente vas a amar."
    }
  ];

  const albumsData = [
    { title: "Indie Rock Vibes", rating: 4, gradient: "from-red-400 to-orange-500" },
    { title: "Electronic Dreams", rating: 5, gradient: "from-teal-400 to-green-500" },
    { title: "Jazz Fusion", rating: 4, gradient: "from-blue-400 to-green-400" },
    { title: "Pop Anthems", rating: 3, gradient: "from-pink-400 to-red-400" },
    { title: "Alternative Rock", rating: 5, gradient: "from-blue-400 to-cyan-400" },
    { title: "Ambient Sounds", rating: 4, gradient: "from-teal-200 to-pink-200" }
  ];

  const statsData = [
    { number: "50K+", label: "Usuarios Activos" },
    { number: "2M+", label: "Álbumes Calificados" },
    { number: "500K+", label: "Reseñas Escritas" },
    { number: "100K+", label: "Listas Creadas" }
  ];

  // Links de navegación dinámicos basados en autenticación
  const getNavLinks = () => {
    const baseLinks = [
      { href: "#home", label: "Inicio" },
      { href: "#features", label: "Características" },
      { href: "/reviews", label: "Reseñas", isLink: true },
      { href: "#community", label: "Comunidad" }
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
    // Marcar que estamos en el cliente para evitar problemas de hidratación
    setIsClient(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleStats(true);
        }
      },
      { threshold: 0.5, rootMargin: '0px 0px -100px 0px' }
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    // Cerrar resultados de búsqueda al hacer clic fuera
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      if (userMenuOpen && !event.target.closest('.user-menu')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
      observer.disconnect();
    };
  }, [userMenuOpen]);

  // Efecto para buscar en Spotify cuando cambia la query
  useEffect(() => {
    const searchSpotify = async () => {
      if (searchQuery.trim().length > 2) {
        try {
          const results = await searchMusic(searchQuery, searchType, 10);
          setSearchResults(results.items || []);
          setShowResults(true);
        } catch (error) {
          console.error('Error buscando música:', error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    };

    const debounceTimer = setTimeout(searchSpotify, 500);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, searchType, searchMusic]);

  const scrollToSection = (href) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSearchResultClick = (item) => {
    setSearchQuery(item.name);
    setShowResults(false);
    
    // Si es un álbum, navegar a la página de detalles del álbum
    if (searchType === 'album') {
      window.location.href = `/album/${item.id}`;
    } else {
      // Para otros tipos (artistas, canciones), solo mostrar en consola por ahora
      console.log('Item seleccionado:', item);
    }
  };

  const formatSearchResultSubtitle = (item, type) => {
    switch (type) {
      case 'album':
        return `${item.artists?.[0]?.name || 'Artista desconocido'} • ${item.release_date?.substring(0, 4) || ''}`;
      case 'artist':
        return `${item.followers?.total ? `${(item.followers.total / 1000000).toFixed(1)}M seguidores` : 'Artista'}`;
      case 'track':
        return `${item.artists?.[0]?.name || 'Artista desconocido'} • ${item.album?.name || ''}`;
      default:
        return '';
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      // Opcional: mostrar un mensaje de éxito
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <span key={index} className={index < rating ? "text-yellow-400" : "text-gray-400"}>
        ★
      </span>
    ));
  };

  const AnimatedCounter = ({ value, isVisible }) => {
    const [count, setCount] = useState('0');

    useEffect(() => {
      if (!isVisible) return;

      const numericValue = parseInt(value.replace(/\D/g, ''));
      let currentNumber = 0;
      const increment = numericValue / 50;

      const timer = setInterval(() => {
        currentNumber += increment;
        if (currentNumber >= numericValue) {
          setCount(value);
          clearInterval(timer);
        } else {
          if (value.includes('K')) {
            setCount(Math.floor(currentNumber / 1000) + 'K+');
          } else if (value.includes('M')) {
            setCount((currentNumber / 1000000).toFixed(1) + 'M+');
          } else {
            setCount(Math.floor(currentNumber) + '+');
          }
        }
      }, 50);

      return () => clearInterval(timer);
    }, [isVisible, value]);

    return <span>{count}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-purple-800 text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-black/95' : 'bg-black/90'
      } backdrop-blur-md`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="text-2xl font-bold bg-gradient-to-r from-red-400 to-teal-400 bg-clip-text text-transparent">
              Musicboxd
            </div>
            <div className="hidden md:flex space-x-8 items-center">
              {getNavLinks().map((link) => (
                link.isLink ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-white hover:bg-white/10 px-4 py-2 rounded-full transition-all duration-300 hover:-translate-y-1"
                  >
                    {link.label}
                  </Link>
                ) : (
                  <button
                    key={link.href}
                    onClick={() => scrollToSection(link.href)}
                    className="text-white hover:bg-white/10 px-4 py-2 rounded-full transition-all duration-300 hover:-translate-y-1"
                  >
                    {link.label}
                  </button>
                )
              ))}
              
              {/* User Menu */}
              {isAuthenticated && (
                <div className="relative user-menu">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 text-white hover:bg-white/10 px-4 py-2 rounded-full transition-all duration-300 hover:-translate-y-1"
                  >
                    <User className="w-4 h-4" />
                    <span className="hidden sm:inline">{user?.username}</span>
                  </button>
                  
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-black/95 backdrop-blur-md rounded-xl border border-white/20 shadow-lg py-2">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-white hover:bg-white/10 transition-colors"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <User className="w-4 h-4 inline mr-2" />
                        Mi Perfil
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setUserMenuOpen(false);
                        }}
                        className="block w-full text-left px-4 py-2 text-white hover:bg-white/10 transition-colors"
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
              className="md:hidden text-white p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
          
          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-black/90 backdrop-blur-md rounded-2xl mt-4 p-4 border border-white/20">
              {getNavLinks().map((link) => (
                link.isLink ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block text-white hover:bg-white/10 px-4 py-3 rounded-xl transition-all duration-300 mb-2"
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
                    className="block w-full text-left text-white hover:bg-white/10 px-4 py-3 rounded-xl transition-all duration-300 mb-2"
                  >
                    {link.label}
                  </button>
                )
              ))}
              
              {/* User section in mobile menu */}
              {isAuthenticated && (
                <div className="border-t border-white/20 mt-4 pt-4">
                  <div className="text-white/80 px-4 py-2 mb-2">
                    Hola, <span className="font-semibold text-white">{user?.username}</span>
                  </div>
                  <Link
                    href="/profile"
                    className="block text-white hover:bg-white/10 px-4 py-3 rounded-xl transition-all duration-300 mb-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <User className="w-4 h-4 inline mr-2" />
                    Mi Perfil
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full text-left text-white hover:bg-white/10 px-4 py-3 rounded-xl transition-all duration-300"
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

      {/* Floating Music Notes */}
      {isClient && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {musicNotesPositions.map((position, i) => (
            <div
              key={i}
              className="absolute text-white/10 text-2xl animate-pulse"
              style={{
                left: position.left,
                top: position.top,
                animationDelay: position.delay,
                animationDuration: position.duration
              }}
            >
              ♪
            </div>
          ))}
        </div>
      )}

      {/* Hero Section */}
      <section ref={heroRef} id="home" className="min-h-screen flex items-center justify-center text-center relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-red-400 via-teal-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
            Musicboxd
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto">
            Descubre, califica y comparte tu pasión por la música. Tu diario musical personal donde cada canción cuenta una historia.
          </p>
          
          {/* Search Bar */}
          <div ref={searchRef} className="max-w-lg mx-auto mb-8 relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5" />
              {spotifyLoading && (
                <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/70 w-5 h-5 animate-spin" />
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                placeholder="Buscar álbumes, artistas, canciones..."
                className="w-full pl-12 pr-12 py-4 bg-white/10 border border-white/20 rounded-full text-white placeholder-white/70 backdrop-blur-md focus:outline-none focus:bg-white/20 focus:border-teal-400 focus:shadow-lg focus:shadow-teal-400/30 transition-all duration-300"
              />
            </div>
            
            {/* Search Type Selector */}
            <div className="flex justify-center mt-3 space-x-2">
              {[
                { key: 'album', label: 'Álbumes' },
                { key: 'artist', label: 'Artistas' },
                { key: 'track', label: 'Canciones' }
              ].map((type) => (
                <button
                  key={type.key}
                  onClick={() => setSearchType(type.key)}
                  className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                    searchType === type.key
                      ? 'bg-teal-400 text-black font-semibold'
                      : 'bg-white/10 text-white/80 hover:bg-white/20'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            {/* Search Results Dropdown */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-md border border-white/20 rounded-2xl max-h-80 overflow-y-auto z-50">
                {searchResults.map((item, index) => (
                  <div
                    key={item.id || index}
                    onClick={() => handleSearchResultClick(item)}
                    className="flex items-center p-4 hover:bg-white/10 cursor-pointer transition-all duration-200 border-b border-white/10 last:border-b-0"
                  >
                    <div className="w-12 h-12 rounded-lg overflow-hidden mr-4 bg-gradient-to-br from-red-400 to-teal-400">
                      {item.images?.[0]?.url ? (
                        <div 
                          className="w-full h-full bg-cover bg-center"
                          style={{ backgroundImage: `url(${item.images[0].url})` }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <Music className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">{item.name}</div>
                      <div className="text-white/60 text-sm truncate">
                        {formatSearchResultSubtitle(item, searchType)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Error Message */}
            {spotifyError && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-red-500/90 backdrop-blur-md border border-red-400/20 rounded-2xl p-4 text-white text-center">
                Error: {spotifyError}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => scrollToSection('#features')}
                  className="relative bg-gradient-to-r from-red-400 to-teal-400 text-white px-8 py-4 rounded-full text-lg font-semibold hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                >
                  <span className="relative z-10">Explorar música</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-full transition-all duration-500"></div>
                </button>
                <button
                  onClick={() => scrollToSection('#albums')}
                  className="relative bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 text-center"
                >
                  Ver álbumes populares
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => scrollToSection('#features')}
                  className="relative bg-gradient-to-r from-red-400 to-teal-400 text-white px-8 py-4 rounded-full text-lg font-semibold hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                >
                  <span className="relative z-10">Comenzar mi viaje musical</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-full transition-all duration-500"></div>
                </button>
                <Link
                  href="/register"
                  className="relative bg-white/10 backdrop-blur-md border border-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/20 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 text-center"
                >
                  Crear cuenta gratis
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-black/20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-red-400 to-teal-400 bg-clip-text text-transparent">
            Todo lo que necesitas para tu música
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md p-8 rounded-3xl text-center border border-white/10 hover:-translate-y-4 hover:bg-white/15 hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="text-red-400 group-hover:text-teal-400 mb-6 flex justify-center transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                <p className="text-white/80 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Albums Showcase */}
      <section id="albums" className="py-20 bg-gradient-to-br from-blue-900/50 to-purple-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-red-400 to-teal-400 bg-clip-text text-transparent">
            Álbumes Populares Esta Semana
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {albumsData.map((album, index) => (
              <div
                key={index}
                className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer hover:scale-105 hover:rotate-2 transition-all duration-300 group"
              >
                <div className={`w-full h-full bg-gradient-to-br ${album.gradient} flex items-center justify-center relative`}>
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-all duration-300"></div>
                  <div className="relative z-10 text-center p-4">
                    <div className="text-6xl mb-2 opacity-30 animate-pulse">♪</div>
                    <div className="font-bold text-sm text-white text-shadow-lg">{album.title}</div>
                  </div>
                  <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 bg-black/70 px-3 py-1 rounded-full backdrop-blur-sm">
                    <div className="flex space-x-1 text-xs">
                      {renderStars(album.rating)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-black/30 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {statsData.map((stat, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-md p-8 rounded-3xl border border-white/10 hover:-translate-y-2 hover:bg-white/15 transition-all duration-300"
              >
                <div className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-red-400 to-teal-400 bg-clip-text text-transparent">
                  <AnimatedCounter value={stat.number} isVisible={visibleStats} />
                </div>
                <div className="text-white/80 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/90 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center space-x-6 mb-8">
            {['♪', '♫', '♬', '♭'].map((symbol, index) => (
              <button
                key={index}
                className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-2xl hover:bg-gradient-to-r hover:from-red-400 hover:to-teal-400 hover:-translate-y-2 transition-all duration-300"
              >
                {symbol}
              </button>
            ))}
          </div>
          <p className="text-white/80">
            © 2025 Musicboxd. Donde la música encuentra su voz.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MusicboxdApp;
