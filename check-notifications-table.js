// Verificar estructura de la tabla notifications
import { query } from './src/lib/database-adapter.js';

async function checkNotificationsTable() {
  try {
    console.log('🔍 Verificando tabla notifications...');
    
    // Intentar consultar la tabla
    try {
      const result = await query('SELECT COUNT(*) as count FROM notifications');
      console.log('✅ Tabla notifications existe y tiene', result[0]?.count || 0, 'registros');
    } catch (error) {
      if (error.message.includes('does not exist')) {
        console.log('❌ Tabla notifications no existe, creándola...');
        await createNotificationsTable();
      } else {
        throw error;
      }
    }

    // Verificar estructura de la tabla
    const tableInfo = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'notifications' 
      ORDER BY ordinal_position
    `);

    console.log('📋 Estructura de la tabla notifications:');
    tableInfo.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
    });

  } catch (error) {
    console.error('❌ Error verificando tabla notifications:', error);
  }
}

async function createNotificationsTable() {
  try {
    await query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        from_user_id INTEGER,
        list_id INTEGER,
        thread_id INTEGER,
        comment_id INTEGER,
        is_read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW(),
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (from_user_id) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    await query('CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at)');
    await query('CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read)');

    console.log('✅ Tabla notifications creada exitosamente');
  } catch (error) {
    console.error('❌ Error creando tabla notifications:', error);
  }
}

checkNotificationsTable();
