// Script para verificar datos en la base de datos
import dotenv from 'dotenv';
import { query } from '../src/lib/database-adapter.js';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

async function debugDatabase() {
  try {
    console.log('🔍 Verificando datos en la base de datos...\n');
    
    // Ver todos los usuarios
    const users = await query('SELECT id, username, email FROM users ORDER BY id');
    console.log('👥 Usuarios en la base de datos:');
    users.forEach(user => {
      console.log(`  • ID: ${user.id}, Username: ${user.username}, Email: ${user.email}`);
    });
    
    // Ver todos los seguimientos de artistas
    console.log('\n🎵 Seguimientos de artistas:');
    const follows = await query('SELECT * FROM artist_follows ORDER BY created_at DESC');
    follows.forEach(follow => {
      console.log(`  • User ID: ${follow.user_id}, Artist: ${follow.artist_name} (${follow.artist_id}), Fecha: ${follow.created_at}`);
    });
    
    // Verificar si el usuario ImSaitam tiene seguimientos
    console.log('\n🔍 Seguimientos específicos del usuario ImSaitam:');
    const saitamUser = users.find(u => u.username === 'ImSaitam');
    if (saitamUser) {
      console.log(`ImSaitam tiene ID: ${saitamUser.id}`);
      const saitamFollows = await query(
        'SELECT * FROM artist_follows WHERE user_id = ?', 
        [saitamUser.id]
      );
      console.log(`Seguimientos encontrados: ${saitamFollows.length}`);
      saitamFollows.forEach(follow => {
        console.log(`  • ${follow.artist_name} (${follow.artist_id}) - ${follow.created_at}`);
      });
    } else {
      console.log('Usuario ImSaitam no encontrado');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugDatabase();
