// Verificar y crear tabla listening_history
import { query } from './src/lib/database-adapter.js';

async function createListeningHistoryTable() {
  try {
    console.log('🔍 Verificando tabla listening_history...\n');
    
    // Verificar si la tabla existe
    const tableExists = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'listening_history'
    `);
    
    if (tableExists.length === 0) {
      console.log('❌ Tabla listening_history no existe. Creando...');
      
      // Crear la tabla
      await query(`
        CREATE TABLE listening_history (
          id SERIAL PRIMARY KEY,
          user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
          album_id INTEGER REFERENCES albums(id) ON DELETE CASCADE,
          track_id TEXT,
          listened_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      // Crear índices para optimizar consultas
      await query(`
        CREATE INDEX IF NOT EXISTS idx_listening_history_user_id ON listening_history(user_id);
      `);
      
      await query(`
        CREATE INDEX IF NOT EXISTS idx_listening_history_album_id ON listening_history(album_id);
      `);
      
      await query(`
        CREATE INDEX IF NOT EXISTS idx_listening_history_listened_at ON listening_history(listened_at);
      `);
      
      console.log('✅ Tabla listening_history creada exitosamente');
    } else {
      console.log('✅ Tabla listening_history ya existe');
    }
    
    // Verificar la estructura de la tabla
    const structure = await query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'listening_history' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📊 Estructura tabla listening_history:');
    structure.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
    });
    
    // Test del listeningHistoryService
    console.log('\n🧪 Probando listeningHistoryService...');
    const { listeningHistoryService } = await import('./src/lib/database-adapter.js');
    
    // Asumiendo que el usuario con ID 1 existe
    const testUserId = 1;
    const testAlbumId = 1; // Asumiendo que ya tenemos álbumes
    
    try {
      // Probar addToHistory
      await listeningHistoryService.addToHistory(testUserId, testAlbumId);
      console.log('✅ addToHistory funciona correctamente');
      
      // Verificar que se agregó
      const history = await listeningHistoryService.findByUserId(testUserId);
      console.log(`✅ Historial obtenido: ${history.length} entradas`);
      
      // Limpiar test (opcional)
      await query('DELETE FROM listening_history WHERE user_id = ? AND album_id = ?', [testUserId, testAlbumId]);
      console.log('🧹 Test entry eliminada');
      
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('ℹ️ Nota: Es posible que necesites crear usuarios y álbumes primero para probar completamente');
      } else {
        console.error('Error en test:', error);
      }
    }
    
    console.log('\n🎉 Verificación completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error verificando/creando tabla listening_history:', error);
  }
  
  process.exit(0);
}

createListeningHistoryTable();
