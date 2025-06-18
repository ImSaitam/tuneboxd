// Test endpoint para verificar que las API routes funcionan
export async function GET() {
  return Response.json({
    success: true,
    message: 'API routes funcionando correctamente',
    timestamp: new Date().toISOString(),
    endpoints: {
      notifications: '/api/notifications',
      albums: '/api/albums/[albumId]',
      listenList: '/api/listen-list'
    }
  });
}
