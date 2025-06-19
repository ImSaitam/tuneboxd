#!/usr/bin/env node

import path from 'path';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.join(__dirname, '../.env.local') });

async function diagnoseLista5() {
  console.log('🔍 Diagnosticando errores de lista ID 5...\n');

  try {
    const { query, get } = await import('../src/lib/database-adapter.js');

    // 1. Verificar si existe la lista ID 5
    console.log('📋 Verificando si existe la lista ID 5...');
    const lista5 = await get('SELECT * FROM lists WHERE id = 5');
    
    if (lista5) {
      console.log('✅ Lista ID 5 encontrada:');
      console.log('   - Nombre:', lista5.name);
      console.log('   - Usuario ID:', lista5.user_id);
      console.log('   - Privada:', lista5.is_private);
      console.log('   - Creada:', lista5.created_at);
    } else {
      console.log('❌ Lista ID 5 NO existe');
      return;
    }

    // 2. Verificar tabla de likes de listas
    console.log('\n💖 Verificando tabla de likes de listas...');
    try {
      const likesSchema = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'list_likes'");
      if (likesSchema.length > 0) {
        console.log('✅ Tabla list_likes existe con columnas:', likesSchema.map(c => c.column_name).join(', '));
        
        // Verificar likes para lista 5
        const likes5 = await query('SELECT COUNT(*) as count FROM list_likes WHERE list_id = 5');
        console.log('   - Likes para lista 5:', likes5[0]?.count || 0);
      } else {
        console.log('❌ Tabla list_likes NO existe');
      }
    } catch (error) {
      console.log('❌ Error con tabla list_likes:', error.message);
    }

    // 3. Verificar tabla de comentarios de listas
    console.log('\n💬 Verificando tabla de comentarios de listas...');
    try {
      const commentsSchema = await query("SELECT column_name FROM information_schema.columns WHERE table_name = 'list_comments'");
      if (commentsSchema.length > 0) {
        console.log('✅ Tabla list_comments existe con columnas:', commentsSchema.map(c => c.column_name).join(', '));
        
        // Verificar comentarios para lista 5
        const comments5 = await query('SELECT COUNT(*) as count FROM list_comments WHERE list_id = 5');
        console.log('   - Comentarios para lista 5:', comments5[0]?.count || 0);
      } else {
        console.log('❌ Tabla list_comments NO existe');
      }
    } catch (error) {
      console.log('❌ Error con tabla list_comments:', error.message);
    }

    // 4. Verificar todas las listas existentes
    console.log('\n📊 Todas las listas existentes:');
    const todasListas = await query('SELECT id, name, user_id, is_private FROM lists ORDER BY id');
    todasListas.forEach(lista => {
      console.log(`   - ID ${lista.id}: "${lista.name}" (Usuario: ${lista.user_id}, Privada: ${lista.is_private})`);
    });

    console.log('\n✅ Diagnóstico completado!');
    
  } catch (error) {
    console.error('❌ Error en diagnóstico:', error);
    process.exit(1);
  }
}

// Ejecutar
diagnoseLista5();
