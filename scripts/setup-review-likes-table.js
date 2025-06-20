import 'dotenv/config';
import { query } from '../src/lib/database-adapter.js';

async function setupReviewLikesTable() {
  try {
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
    
    console.log('✅ Tabla review_likes creada exitosamente');
    
    // Crear índices para optimizar consultas
    await query(`
      CREATE INDEX IF NOT EXISTS idx_review_likes_review_id ON review_likes(review_id)
    `);
    
    await query(`
      CREATE INDEX IF NOT EXISTS idx_review_likes_user_id ON review_likes(user_id)
    `);
    
    console.log('✅ Índices creados exitosamente');
    
    // Verificar la estructura
    const tableInfo = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'review_likes'
      ORDER BY ordinal_position
    `);
    
    console.log('📋 Estructura de la tabla review_likes:');
    tableInfo.forEach(col => {
      console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''} ${col.column_default || ''}`);
    });
    
  } catch (error) {
    console.error('❌ Error creando tabla review_likes:', error);
    process.exit(1);
  }
}

setupReviewLikesTable();
