import { migrateListAlbumsTable } from '../../../../../scripts/migrate-list-albums-table.js';

// GET: Ejecutar migración de tabla list_albums
export async function GET(request) {
  try {
    // Verificar que sea un entorno de producción/desarrollo autorizado
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.MIGRATION_SECRET || 'migration-2024'}`) {
      return Response.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log('🔧 Ejecutando migración de tabla list_albums...');
    await migrateListAlbumsTable();
    
    return Response.json({
      success: true,
      message: 'Migración de tabla list_albums completada exitosamente'
    });

  } catch (error) {
    console.error('❌ Error ejecutando migración:', error);
    return Response.json(
      { success: false, message: 'Error ejecutando migración: ' + error.message },
      { status: 500 }
    );
  }
}
