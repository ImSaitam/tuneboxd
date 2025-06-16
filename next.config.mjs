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
  
  // Configuración de compresión y rendimiento
  compress: true, // Habilitar compresión gzip
  
  // Configuración experimental para mejorar rendimiento
  experimental: {
    optimizeCss: true, // Optimizar CSS
    serverActions: {
      bodySizeLimit: '2mb' // Límite de tamaño del cuerpo de las acciones del servidor
    }
  },
  
  // Configuración de headers para cache y seguridad
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=300, stale-while-revalidate=600'
          },
          {
            key: 'Content-Encoding',
            value: 'gzip'
          }
        ]
      }
    ];
  },
};

export default nextConfig;
