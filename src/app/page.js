"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search, Music, Edit3, Users, Target, BarChart3, Eye, Loader2 } from 'lucide-react';
import { useSpotify } from '@/hooks/useSpotify';
import { useAuth } from '@/hooks/useAuth';

const TuneboxdApp = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleStats, setVisibleStats] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [searchType, setSearchType] = useState('album');
  const [globalStats, setGlobalStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
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
      icon: <div className="text-6xl">?</div>,
      title: "Descubrimiento Inteligente",
      description: "Algoritmos que aprenden de tus gustos para sugerirte álbumes que realmente vas a amar.",
      comingSoon: true
    }
  ];

  /* const albumsData = [
    { title: "Indie Rock Vibes", rating: 4, gradient: "from-red-400 to-orange-500" },
    { title: "Electronic Dreams", rating: 5, gradient: "from-teal-400 to-green-500" },
    { title: "Jazz Fusion", rating: 4, gradient: "from-blue-400 to-green-400" },
    { title: "Pop Anthems", rating: 3, gradient: "from-pink-400 to-red-400" },
    { title: "Alternative Rock", rating: 5, gradient: "from-blue-400 to-cyan-400" },
    { title: "Ambient Sounds", rating: 4, gradient: "from-teal-200 to-pink-200" }
  ]; 
  */

  // Función para formatear números grandes
  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M+`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K+`;
    } else if (num > 0) {
      return `${num}`;
    }
    return "0";
  };

  // Generar estadísticas basadas en datos reales o valores por defecto
  const getStatsData = () => {
    if (globalStats) {
      return [
        { number: formatNumber(globalStats.totalUsers), label: "Usuarios Activos" },
        { number: formatNumber(globalStats.totalAlbums), label: "Álbumes Calificados" },
        { number: formatNumber(globalStats.totalReviews), label: "Reseñas Escritas" },
      ];
    }
    // Valores por defecto mientras cargan los datos reales
    return [
      { number: "Cargando...", label: "Usuarios Activos" },
      { number: "Cargando...", label: "Álbumes Calificados" },
      { number: "Cargando...", label: "Reseñas Escritas" },
    ];
  };

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
    // Marcar que estamos en el cliente para evitar problemas de hidratación
    setIsClient(true);

    // Cargar estadísticas globales
    const loadGlobalStats = async () => {
      try {
        setStatsLoading(true);
        
        const response = await fetch('/api/stats/global', {
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
          }
        });
        
        
        if (response.ok) {
          let data;
          // Usar clone para poder reintentar si falla
          const responseClone = response.clone();
          
          try {
            data = await response.json();
          } catch (jsonError) {
            console.warn('⚠️ Error parseando JSON, intentando con response clonado:', jsonError.message);
            try {
              const text = await responseClone.text();
              data = JSON.parse(text);
            } catch (fallbackError) {
              console.error('❌ Error en fallback de parsing:', fallbackError.message);
              throw new Error('No se pudo parsear la respuesta JSON');
            }
          }
          
          if (data && data.success) {
            setGlobalStats(data.stats);
          } else {
            console.warn('⚠️ API respondió pero sin éxito:', data);
            // Usar datos por defecto si la API no devuelve éxito
            setGlobalStats({
              totalUsers: 9,
              totalAlbums: 31,
              totalReviews: 15,
              totalWatchlistItems: 3
            });
          }
        } else {
          console.error('❌ Error en respuesta:', response.status, response.statusText);
          // Usar datos por defecto en caso de error HTTP
          setGlobalStats({
            totalUsers: 9,
            totalAlbums: 31,
            totalReviews: 15,
            totalWatchlistItems: 3
          });
        }
      } catch (error) {
        console.error('💥 Error cargando estadísticas globales:', error);
        console.error('🔍 Detalles del error:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        });
        
        // Estadísticas por defecto para que la app no se rompa
        setGlobalStats({
          totalUsers: 9,
          totalAlbums: 31,
          totalReviews: 15,
          totalWatchlistItems: 3
        });
      } finally {
        setStatsLoading(false);
      }
    };

    loadGlobalStats();

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
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      observer.disconnect();
    };
  }, []);

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
    
    // Navegar según el tipo de búsqueda
    if (searchType === 'album') {
      window.location.href = `/album/${item.id}`;
    } else if (searchType === 'artist') {
      window.location.href = `/artist/${item.id}`;
    } else if (searchType === 'track') {
      window.location.href = `/track/${item.id}`;
    } else {
      // Para otros tipos, mostrar en consola
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
    <div className="min-h-screen bg-theme-primary text-theme-primary overflow-x-hidden">
      {/* Floating Music Notes */}
      {isClient && (
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {musicNotesPositions.map((position, i) => (
            <div
              key={i}
              className="absolute text-theme-muted text-2xl animate-pulse"
              style={{
                left: position.left,
                top: position.top,
                animationDelay: position.delay,
                animationDuration: position.duration,
              }}
            >
              ♪
            </div>
          ))}
        </div>
      )}

      {/* Hero Section */}
      <section
        ref={heroRef}
        id="home"
        className="min-h-screen flex items-center justify-center text-center relative"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-theme-accent animate-pulse">
            Tuneboxd
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-theme-secondary max-w-3xl mx-auto">
            Descubre, califica y comparte tu pasión por la música. Tu diario
            musical personal donde cada canción cuenta una historia.
          </p>

          {/* Search Bar */}
          <div ref={searchRef} className="max-w-lg mx-auto mb-8 relative">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-theme-muted w-5 h-5" />
              {spotifyLoading && (
                <Loader2 className="absolute right-4 top-1/2 transform -translate-y-1/2 text-theme-muted w-5 h-5 animate-spin" />
              )}
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchResults.length > 0 && setShowResults(true)}
                placeholder="Buscar álbumes, artistas, canciones..."
                className="w-full pl-12 pr-12 py-4 bg-theme-card border border-theme rounded-full text-theme-primary placeholder-theme-muted backdrop-blur-md focus:outline-none focus:bg-theme-card-hover focus:border-theme transition-all duration-300"
              />
            </div>

            {/* Search Type Selector */}
            <div className="flex justify-center mt-3 space-x-2">
              {[
                { key: "album", label: "Álbumes" },
                { key: "artist", label: "Artistas" },
                { key: "track", label: "Canciones" },
              ].map((type) => (                  <button
                    key={type.key}
                    onClick={() => setSearchType(type.key)}
                    className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                      searchType === type.key
                        ? "bg-theme-accent text-theme-button font-semibold"
                        : "bg-theme-card text-theme-secondary hover:bg-theme-card-hover"
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
                          style={{
                            backgroundImage: `url(${item.images[0].url})`,
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <Music className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white font-medium truncate">
                        {item.name}
                      </div>
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
                  onClick={() => scrollToSection("#features")}
                  className="relative bg-theme-accent text-theme-button px-8 py-4 rounded-full text-lg font-semibold hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                >
                  <span className="relative z-10">Explorar música</span>
                  <div className="absolute inset-0 bg-theme-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:left-full transition-all duration-500"></div>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => scrollToSection("#features")}
                  className="relative bg-gradient-to-r from-red-400 to-teal-400 text-white px-8 py-4 rounded-full text-lg font-semibold hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 overflow-hidden group"
                >
                  <span className="relative z-10">
                    Comenzar mi viaje musical
                  </span>
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
      <section id="features" className="py-20 bg-theme-secondary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 text-theme-accent">
            Todo lo que necesitas para tu música
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuresData.map((feature, index) => (
              <div
                key={index}
                className={`bg-theme-card p-8 rounded-3xl text-center border border-theme transition-all duration-300 group relative ${
                  feature.comingSoon 
                    ? 'blur-sm hover:blur-none cursor-not-allowed opacity-75 hover:opacity-100' 
                    : 'hover:-translate-y-4 hover:bg-theme-card-hover hover:shadow-2xl'
                }`}
              >
                {feature.comingSoon && (
                  <div className="absolute top-4 right-4 bg-theme-accent text-theme-button px-3 py-1 rounded-full text-xs font-bold">
                    Próximamente
                  </div>
                )}
                <div className="text-theme-accent mb-6 flex justify-center transition-colors duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-4 text-theme-primary">
                  {feature.title}
                </h3>
                <p className="text-theme-secondary leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/*
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
      */}

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-theme-secondary">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {getStatsData().map((stat, index) => (
              <div
                key={index}
                className="bg-theme-card p-8 rounded-3xl border border-theme hover:-translate-y-2 hover:bg-theme-card-hover transition-all duration-300"
              >
                <div className="text-3xl md:text-4xl font-bold mb-2 text-theme-accent">
                  {statsLoading ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-8 h-8 animate-spin text-theme-accent" />
                    </div>
                  ) : (
                    <AnimatedCounter
                      value={stat.number}
                      isVisible={visibleStats}
                    />
                  )}
                </div>
                <div className="text-theme-secondary font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-theme-secondary py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center space-x-6 mb-8">
            {["♪", "♫", "♬", "♭"].map((symbol, index) => (
              <button
                key={index}
                className="w-12 h-12 bg-theme-card rounded-full flex items-center justify-center text-2xl hover:bg-theme-accent hover:-translate-y-2 transition-all duration-300"
              >
                {symbol}
              </button>
            ))}
          </div>
          
          {/* Enlaces legales */}
          <div className="flex justify-center space-x-6 mb-6">
            <Link 
              href="/terms"
              className="text-theme-secondary hover:text-theme-primary transition-colors text-sm"
            >
              Términos y Condiciones
            </Link>
            <span className="text-theme-muted">•</span>
            <Link 
              href="/privacy"
              className="text-theme-secondary hover:text-theme-primary transition-colors text-sm"
            >
              Política de Privacidad
            </Link>
          </div>
          
          <p className="text-theme-secondary">
            © 2025 Tuneboxd. Donde la música encuentra su voz.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TuneboxdApp;
