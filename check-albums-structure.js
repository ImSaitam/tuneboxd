// Script para verificar estructura de tabla albums en producción
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Cargar variables de entorno de producción
dotenv.config({ path: '.env.production' });

async function checkAlbumsTableStructure() {
  const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL, 
    ssl: { rejectUnauthorized: false } 
  });

  try {
    console.log('🔍 Verificando estructura tabla albums en producción...\n');
    
    // Verificar estructura de la tabla albums
    const structure = await pool.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'albums' 
      ORDER BY ordinal_position
    `);
    
    console.log('📊 Columnas disponibles en tabla albums:');
    structure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Verificar algunos registros para ver datos reales
    const sampleData = await pool.query('SELECT * FROM albums LIMIT 3');
    
    console.log('\n📋 Datos de ejemplo:');
    sampleData.rows.forEach((row, index) => {
      console.log(`\nÁlbum ${index + 1}:`);
      Object.keys(row).forEach(key => {
        console.log(`  ${key}: ${row[key]}`);
      });
    });
    
  } catch (error) {
    console.error('\n💥 Error verificando estructura:', error);
  } finally {
    await pool.end();
  }
}

checkAlbumsTableStructure();
