// API de debug para estadísticas sin compresión
export async function GET() {
  // Datos estáticos para evitar problemas de base de datos y compresión
  const stats = {
    totalUsers: 9,
    totalAlbums: 31,
    totalReviews: 15,
    totalWatchlistItems: 3
  };

  // Respuesta manual sin usar Response.json para evitar compresión automática
  return new Response(
    `{"success":true,"stats":${JSON.stringify(stats)}}`,
    {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    }
  );
}
