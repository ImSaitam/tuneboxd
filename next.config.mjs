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
};

export default nextConfig;
