// Actualizar esquema de tabla notifications
import { query } from './src/lib/database-adapter.js';

async function updateNotificationsTable() {
  try {
    console.log('🔧 Actualizando tabla notifications...');

    // Agregar columnas faltantes
    const alterQueries = [
      'ALTER TABLE notifications ADD COLUMN IF NOT EXISTS from_user_id INTEGER',
      'ALTER TABLE notifications ADD COLUMN IF NOT EXISTS list_id INTEGER',
      'ALTER TABLE notifications ADD COLUMN IF NOT EXISTS thread_id INTEGER', 
      'ALTER TABLE notifications ADD COLUMN IF NOT EXISTS comment_id INTEGER',
      'ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_read BOOLEAN DEFAULT FALSE'
    ];

    for (const alterQuery of alterQueries) {
      try {
        await query(alterQuery);
        console.log('✅', alterQuery);
      } catch (error) {
        console.log('⚠️ ', alterQuery, '- Error:', error.message);
      }
    }

    // Copiar datos de 'read' a 'is_read' si existe
    try {
      await query('UPDATE notifications SET is_read = read WHERE is_read IS NULL AND read IS NOT NULL');
      console.log('✅ Copiados datos de "read" a "is_read"');
    } catch (error) {
      console.log('⚠️  Error copiando datos read->is_read:', error.message);
    }

    // Agregar índices
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_notifications_from_user ON notifications(from_user_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_list ON notifications(list_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_thread ON notifications(thread_id)',
      'CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read)'
    ];

    for (const indexQuery of indexQueries) {
      try {
        await query(indexQuery);
        console.log('✅', indexQuery);
      } catch (error) {
        console.log('⚠️ ', indexQuery, '- Error:', error.message);
      }
    }

    console.log('✅ Tabla notifications actualizada exitosamente');

  } catch (error) {
    console.error('❌ Error actualizando tabla notifications:', error);
  }
}

updateNotificationsTable();
