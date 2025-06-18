// FORCE REBUILD - Timestamp: 2025-06-18T12:54:00Z
// This file forces Vercel to rebuild and redeploy the application

export default function forceRebuild() {
  return {
    timestamp: new Date().toISOString(),
    message: 'Forced rebuild to fix API routes deployment',
    apis: [
      '/api/notifications',
      '/api/albums/[albumId]', 
      '/api/listen-list'
    ]
  };
}
