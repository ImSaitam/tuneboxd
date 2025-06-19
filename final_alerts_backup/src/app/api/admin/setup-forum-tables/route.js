import { NextResponse } from 'next/server';
import { query, run } from "../../../../lib/database-adapter.js";

export async function POST(request) {
  try {
    console.log('🏗️ Iniciando configuración de tablas del foro...');

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

    // Verificar que las tablas se crearon correctamente
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%forum%'
      ORDER BY table_name
    `);

    return NextResponse.json({
      success: true,
      message: 'Tablas del foro configuradas exitosamente',
      tablesCreated: tables.map(t => t.table_name),
      summary: {
        totalTables: tables.length,
        tables: tables.map(t => t.table_name)
      }
    });

  } catch (error) {
    console.error('💥 Error configurando tablas del foro:', error);
    return NextResponse.json({
      success: false,
      message: 'Error configurando tablas del foro',
      error: error.message
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    // Verificar qué tablas del foro existen
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%forum%'
      ORDER BY table_name
    `);

    const requiredTables = [
      'forum_threads', 
      'forum_replies', 
      'forum_thread_likes', 
      'forum_reply_likes'
    ];

    const existingTables = tables.map(t => t.table_name);
    const missingTables = requiredTables.filter(table => !existingTables.includes(table));

    let stats = {};
    if (existingTables.includes('forum_threads')) {
      try {
        const threadCount = await query('SELECT COUNT(*) as count FROM forum_threads');
        const replyCount = await query('SELECT COUNT(*) as count FROM forum_replies');
        stats = {
          threads: threadCount[0]?.count || 0,
          replies: replyCount[0]?.count || 0
        };
      } catch (error) {
        console.log('No se pudieron obtener estadísticas');
      }
    }

    return NextResponse.json({
      success: true,
      tablesConfigured: missingTables.length === 0,
      existingTables,
      missingTables,
      requiredTables,
      stats
    });

  } catch (error) {
    console.error('Error verificando tablas del foro:', error);
    return NextResponse.json({
      success: false,
      message: 'Error verificando tablas del foro',
      error: error.message
    }, { status: 500 });
  }
}
