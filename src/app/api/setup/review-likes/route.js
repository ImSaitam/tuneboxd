import { query } from '../../../../lib/database-adapter.js';

export async function POST(request) {
  try {
    // Solo permitir en desarrollo o con una clave secreta
    const { secret } = await request.json();
    
    if (secret !== process.env.SETUP_SECRET) {
      return Response.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log('🚀 Creando tabla review_likes...');
    
    // Crear tabla review_likes
    await query(`
      CREATE TABLE IF NOT EXISTS review_likes (
        id SERIAL PRIMARY KEY,
        review_id INTEGER NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(review_id, user_id)
      )
    `);
    
    console.log('✅ Tabla review_likes creada');
    
    // Crear índices
    await query(`
      CREATE INDEX IF NOT EXISTS idx_review_likes_review_id ON review_likes(review_id)
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_review_likes_user_id ON review_likes(user_id)
    `);
    
    console.log('✅ Índices creados');
    
    // Verificar la estructura
    const tableInfo = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'review_likes'
      ORDER BY ordinal_position
    `);
    
    return Response.json({
      success: true,
      message: 'Tabla review_likes creada exitosamente',
      tableStructure: tableInfo
    });
    
  } catch (error) {
    console.error('❌ Error creando tabla review_likes:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
