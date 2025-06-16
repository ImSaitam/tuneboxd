/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Dominios externos permitidos para las imágenes
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      }
    ],
    // Desactivar optimización para GIFs para preservar la animación
    unoptimized: false,
    // Formatos soportados incluyendo GIF
    formats: ['image/webp', 'image/avif'],
    // Para GIFs animados, usar el loader sin optimización
    loader: 'default',
  },
  
  // Configuración de compresión deshabilitada para evitar errores de decodificación
  compress: false,
  
  // Configuración experimental para mejorar rendimiento
  experimental: {
    optimizeCss: true, // Optimizar CSS
    serverActions: {
      bodySizeLimit: '2mb' // Límite de tamaño del cuerpo de las acciones del servidor
    }
  },
  
  // Headers personalizados unificados
  async headers() {
    return [
      {
        source: '/api/auth/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Content-Encoding',
            value: 'identity',
          },
        ],
      },
      {
        source: '/api/stats/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60',
          },
          {
            key: 'Content-Encoding',
            value: 'identity',
          },
        ],
      },
      {
        source: '/api/forum/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600'
          },
          {
            key: 'Content-Encoding',
            value: 'identity',
          },
        ]
      }
    ];
  },
};

export default nextConfig;
