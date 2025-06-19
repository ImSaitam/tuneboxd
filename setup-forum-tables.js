/**
 * Script para verificar y crear la estructura de tablas del foro
 */

import { query, run } from './src/lib/database-adapter.js';

async function checkForumTables() {
  console.log('🔍 Verificando estructura de tablas del foro...\n');

  try {
    // Verificar qué tablas existen
    console.log('📋 Verificando tablas existentes...');
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%forum%'
      ORDER BY table_name
    `);

    console.log(`✅ Tablas de foro encontradas: ${tables.length}`);
    tables.forEach((table, index) => {
      console.log(`   ${index + 1}. ${table.table_name}`);
    });

    if (tables.length === 0) {
      console.log('\n⚠️  No se encontraron tablas de foro. Necesitamos crearlas.');
      await createForumTables();
    } else {
      console.log('\n✅ Tablas de foro encontradas. Verificando estructura...');
      await verifyForumStructure();
    }

  } catch (error) {
    console.error('💥 Error verificando tablas:', error);
  }
}

async function createForumTables() {
  console.log('\n🏗️  Creando tablas del foro...');

  try {
    // Crear tabla de hilos del foro
    console.log('📝 Creando tabla forum_threads...');
    await run(`
      CREATE TABLE IF NOT EXISTS forum_threads (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(50) DEFAULT 'General',
        language VARCHAR(10) DEFAULT 'es',
        is_pinned BOOLEAN DEFAULT FALSE,
        is_locked BOOLEAN DEFAULT FALSE,
        views_count INTEGER DEFAULT 0,
        replies_count INTEGER DEFAULT 0,
        likes_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de respuestas del foro
    console.log('📝 Creando tabla forum_replies...');
    await run(`
      CREATE TABLE IF NOT EXISTS forum_replies (
        id SERIAL PRIMARY KEY,
        thread_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        likes_count INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Crear tabla de likes de hilos
    console.log('📝 Creando tabla forum_thread_likes...');
    await run(`
      CREATE TABLE IF NOT EXISTS forum_thread_likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        thread_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, thread_id)
      )
    `);

    // Crear tabla de likes de respuestas
    console.log('📝 Creando tabla forum_reply_likes...');
    await run(`
      CREATE TABLE IF NOT EXISTS forum_reply_likes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        reply_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, reply_id)
      )
    `);

    // Crear índices para mejor rendimiento
    console.log('📊 Creando índices...');
    await run('CREATE INDEX IF NOT EXISTS idx_forum_threads_user_id ON forum_threads(user_id)');
    await run('CREATE INDEX IF NOT EXISTS idx_forum_threads_category ON forum_threads(category)');
    await run('CREATE INDEX IF NOT EXISTS idx_forum_threads_language ON forum_threads(language)');
    await run('CREATE INDEX IF NOT EXISTS idx_forum_threads_last_activity ON forum_threads(last_activity DESC)');
    await run('CREATE INDEX IF NOT EXISTS idx_forum_replies_thread_id ON forum_replies(thread_id)');
    await run('CREATE INDEX IF NOT EXISTS idx_forum_replies_user_id ON forum_replies(user_id)');

    console.log('\n✅ Tablas del foro creadas exitosamente!');

  } catch (error) {
    console.error('💥 Error creando tablas:', error);
    throw error;
  }
}

async function verifyForumStructure() {
  try {
    const requiredTables = [
      'forum_threads', 
      'forum_replies', 
      'forum_thread_likes', 
      'forum_reply_likes'
    ];

    for (const tableName of requiredTables) {
      console.log(`\n🔍 Verificando tabla ${tableName}...`);
      
      const columns = await query(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = ? 
        ORDER BY ordinal_position
      `, [tableName]);

      if (columns.length === 0) {
        console.log(`❌ Tabla ${tableName} no existe.`);
      } else {
        console.log(`✅ Tabla ${tableName} existe con ${columns.length} columnas:`);
        columns.forEach(col => {
          console.log(`   - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
        });
      }
    }

  } catch (error) {
    console.error('💥 Error verificando estructura:', error);
  }
}

async function showForumStats() {
  try {
    console.log('\n📊 Estadísticas del foro:');
    
    const threadCount = await query('SELECT COUNT(*) as count FROM forum_threads');
    console.log(`   Hilos totales: ${threadCount[0]?.count || 0}`);

    const replyCount = await query('SELECT COUNT(*) as count FROM forum_replies');
    console.log(`   Respuestas totales: ${replyCount[0]?.count || 0}`);

    const categories = await query(`
      SELECT category, COUNT(*) as count 
      FROM forum_threads 
      GROUP BY category 
      ORDER BY count DESC
    `);
    
    if (categories.length > 0) {
      console.log('   Por categoría:');
      categories.forEach(cat => {
        console.log(`     - ${cat.category}: ${cat.count} hilos`);
      });
    }

  } catch (error) {
    console.log('⚠️  No se pudieron obtener estadísticas (normal si las tablas no existen)');
  }
}

// Ejecutar verificación
console.log('🚀 Iniciando verificación de estructura del foro...\n');

checkForumTables()
  .then(() => showForumStats())
  .then(() => {
    console.log('\n✨ Verificación completada. Ahora puedes crear el hilo de bienvenida.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Error fatal:', error);
    process.exit(1);
  });
