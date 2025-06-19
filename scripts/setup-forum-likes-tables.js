// Crear tablas de likes para el foro
import dotenv from 'dotenv';
import { query } from '../src/lib/database-adapter.js';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

async function setupForumLikesTables() {
  try {
    console.log('🔄 Configurando tablas de likes para el foro...\n');
    
    // Crear tabla forum_thread_likes
    console.log('📝 Creando tabla forum_thread_likes...');
    await query(`
      CREATE TABLE IF NOT EXISTS forum_thread_likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        thread_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (thread_id) REFERENCES forum_threads(id) ON DELETE CASCADE,
        UNIQUE(user_id, thread_id)
      )
    `);
    console.log('✅ Tabla forum_thread_likes creada');

    // Crear tabla forum_reply_likes
    console.log('\n📝 Creando tabla forum_reply_likes...');
    await query(`
      CREATE TABLE IF NOT EXISTS forum_reply_likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        reply_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (reply_id) REFERENCES forum_replies(id) ON DELETE CASCADE,
        UNIQUE(user_id, reply_id)
      )
    `);
    console.log('✅ Tabla forum_reply_likes creada');

    // Crear índices para optimizar consultas
    console.log('\n🔍 Creando índices...');
    
    await query('CREATE INDEX IF NOT EXISTS idx_forum_thread_likes_user_id ON forum_thread_likes(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_forum_thread_likes_thread_id ON forum_thread_likes(thread_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_forum_reply_likes_user_id ON forum_reply_likes(user_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_forum_reply_likes_reply_id ON forum_reply_likes(reply_id)');
    
    console.log('✅ Índices creados exitosamente');

    // Verificar que las tablas fueron creadas
    console.log('\n🔍 Verificando tablas creadas...');
    
    const threadLikesTable = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'forum_thread_likes'
    `);
    
    const replyLikesTable = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'forum_reply_likes'
    `);

    if (threadLikesTable.length > 0 && replyLikesTable.length > 0) {
      console.log('✅ Ambas tablas de likes verificadas exitosamente');
      
      // Mostrar estructura de las tablas
      console.log('\n📊 Estructura de forum_thread_likes:');
      const threadStructure = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'forum_thread_likes'
        ORDER BY ordinal_position
      `);
      threadStructure.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
      });

      console.log('\n📊 Estructura de forum_reply_likes:');
      const replyStructure = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'forum_reply_likes'
        ORDER BY ordinal_position
      `);
      replyStructure.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
      });

      console.log('\n🎉 Sistema de likes del foro configurado exitosamente!');
      console.log('\n📋 Funcionalidades habilitadas:');
      console.log('  ✅ Likes en hilos del foro');
      console.log('  ✅ Likes en respuestas del foro');
      console.log('  ✅ Prevención de likes duplicados');
      console.log('  ✅ Eliminación automática al eliminar hilos/respuestas');
      console.log('  ✅ Índices optimizados para consultas rápidas');
      
    } else {
      console.log('❌ Error: No se pudieron crear todas las tablas');
    }

  } catch (error) {
    console.error('❌ Error configurando tablas de likes:', error);
  }
  
  process.exit(0);
}

setupForumLikesTables();
