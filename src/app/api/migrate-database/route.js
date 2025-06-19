import { run, query } from "../../../lib/database-adapter.js";

// POST: Ejecutar migración de base de datos para list_albums
export async function POST(request) {
  try {
    console.log('🔧 Iniciando migración de base de datos...');

    // Verificar si las columnas notes y updated_at existen
    try {
      await query('SELECT notes, updated_at FROM list_albums LIMIT 1');
      console.log('✅ Las columnas ya existen');
      
      return Response.json({
        success: true,
        message: 'Las columnas notes y updated_at ya existen en la tabla list_albums'
      });
    } catch (error) {
      console.log('⚠️ Las columnas no existen, agregándolas...');
      
      // Agregar la columna notes si no existe
      try {
        await run('ALTER TABLE list_albums ADD COLUMN IF NOT EXISTS notes TEXT');
        console.log('✅ Columna notes agregada');
      } catch (error) {
        console.log('⚠️ Error agregando columna notes:', error.message);
      }

      // Agregar la columna updated_at si no existe
      try {
        await run('ALTER TABLE list_albums ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
        console.log('✅ Columna updated_at agregada');
      } catch (error) {
        console.log('⚠️ Error agregando columna updated_at:', error.message);
      }

      // Agregar la columna order_index si no existe
      try {
        await run('ALTER TABLE list_albums ADD COLUMN IF NOT EXISTS order_index INTEGER DEFAULT 0');
        console.log('✅ Columna order_index agregada');
      } catch (error) {
        console.log('⚠️ Error agregando columna order_index:', error.message);
      }

      // Verificar que las columnas se agregaron correctamente
      const testQuery = await query('SELECT notes, updated_at, order_index FROM list_albums LIMIT 1');
      console.log('✅ Migración completada exitosamente');

      return Response.json({
        success: true,
        message: 'Migración de base de datos completada. Columnas notes, updated_at y order_index agregadas a list_albums.',
        details: {
          columns_added: ['notes', 'updated_at', 'order_index'],
          test_result: testQuery.length >= 0
        }
      });
    }

  } catch (error) {
    console.error('❌ Error en migración:', error);
    return Response.json(
      { 
        success: false, 
        message: 'Error durante la migración de base de datos',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// GET: Solo para verificar que el endpoint existe
export async function GET() {
  return Response.json({
    message: 'Endpoint de migración disponible. Usa POST para ejecutar la migración.'
  });
}
