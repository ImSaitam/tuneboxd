// Verificar estructura actual de tablas en producción
import { query } from './src/lib/database-adapter.js';

async function checkTableStructures() {
  try {
    console.log('🔍 Verificando estructura de tablas...\n');

    // Verificar tabla notifications
    console.log('📋 Estructura de tabla notifications:');
    try {
      const notificationsCols = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'notifications' 
        ORDER BY ordinal_position
      `);

      if (notificationsCols.length === 0) {
        console.log('❌ Tabla notifications no existe');
      } else {
        notificationsCols.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });
      }
    } catch (error) {
      console.log('❌ Error consultando tabla notifications:', error.message);
    }

    // Verificar tabla reviews
    console.log('\n📋 Estructura de tabla reviews:');
    try {
      const reviewsCols = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'reviews' 
        ORDER BY ordinal_position
      `);

      if (reviewsCols.length === 0) {
        console.log('❌ Tabla reviews no existe');
      } else {
        reviewsCols.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });
      }
    } catch (error) {
      console.log('❌ Error consultando tabla reviews:', error.message);
    }

    // Verificar tabla albums
    console.log('\n📋 Estructura de tabla albums:');
    try {
      const albumsCols = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'albums' 
        ORDER BY ordinal_position
      `);

      if (albumsCols.length === 0) {
        console.log('❌ Tabla albums no existe');
      } else {
        albumsCols.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
        });
      }
    } catch (error) {
      console.log('❌ Error consultando tabla albums:', error.message);
    }

    // Listar todas las tablas disponibles
    console.log('\n📋 Todas las tablas disponibles:');
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    tables.forEach(table => {
      console.log(`  - ${table.table_name}`);
    });

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

checkTableStructures();
