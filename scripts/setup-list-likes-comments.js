#!/usr/bin/env node

/**
 * Script para crear las tablas list_likes y list_comments si no existen
 */

import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '../.env.local') });

async function setupListLikesCommentsTabels() {
  console.log('💖💬 Configurando tablas de likes y comentarios para listas...\n');

  try {
    const { run, query } = await import('../src/lib/database-adapter.js');

    // ===== TABLA LIST_LIKES =====
    console.log('💖 Configurando tabla list_likes...');
    
    try {
      await query('SELECT 1 FROM list_likes LIMIT 1');
      console.log('✅ La tabla list_likes ya existe');
    } catch (error) {
      console.log('⚠️  La tabla list_likes no existe. Creándola...');
      
      await run(`
        CREATE TABLE IF NOT EXISTS list_likes (
          id SERIAL PRIMARY KEY,
          list_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(list_id, user_id),
          FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      console.log('✅ Tabla list_likes creada exitosamente');
      
      // Crear índices
      await run(`CREATE INDEX IF NOT EXISTS idx_list_likes_list_id ON list_likes(list_id)`);
      await run(`CREATE INDEX IF NOT EXISTS idx_list_likes_user_id ON list_likes(user_id)`);
      
      console.log('✅ Índices para list_likes creados');
    }

    // ===== TABLA LIST_COMMENTS =====
    console.log('\n💬 Configurando tabla list_comments...');
    
    try {
      await query('SELECT 1 FROM list_comments LIMIT 1');
      console.log('✅ La tabla list_comments ya existe');
    } catch (error) {
      console.log('⚠️  La tabla list_comments no existe. Creándola...');
      
      await run(`
        CREATE TABLE IF NOT EXISTS list_comments (
          id SERIAL PRIMARY KEY,
          list_id INTEGER NOT NULL,
          user_id INTEGER NOT NULL,
          content TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      console.log('✅ Tabla list_comments creada exitosamente');
      
      // Crear índices
      await run(`CREATE INDEX IF NOT EXISTS idx_list_comments_list_id ON list_comments(list_id)`);
      await run(`CREATE INDEX IF NOT EXISTS idx_list_comments_user_id ON list_comments(user_id)`);
      
      console.log('✅ Índices para list_comments creados');
    }

    // ===== VERIFICAR ESTRUCTURA =====
    console.log('\n📊 Verificando estructura de las tablas...');
    
    const likes = await query('SELECT COUNT(*) as count FROM list_likes');
    const comments = await query('SELECT COUNT(*) as count FROM list_comments');
    
    console.log(`📈 Total de likes en listas: ${likes[0]?.count || 0}`);
    console.log(`📈 Total de comentarios en listas: ${comments[0]?.count || 0}`);

    console.log('\n✅ Configuración de tablas list_likes y list_comments completada!');
    
  } catch (error) {
    console.error('❌ Error configurando tablas:', error);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  setupListLikesCommentsTabels();
}

export { setupListLikesCommentsTabels };
