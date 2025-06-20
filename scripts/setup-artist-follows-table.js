// Script para crear la tabla artist_follows si no existe
import dotenv from 'dotenv';
import { query, run } from '../src/lib/database-adapter.js';

// Cargar variables de entorno
dotenv.config({ path: '.env.local' });

async function setupArtistFollowsTable() {
  console.log('🎵 Configurando tabla de artistas seguidos...\n');

  try {
    // Verificar si la tabla existe
    console.log('📋 Verificando si la tabla artist_follows existe...');
    
    try {
      const tableExists = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'artist_follows'
      `);
      
      if (tableExists.length > 0) {
        console.log('✅ La tabla artist_follows ya existe');
        
        // Verificar estructura
        const columns = await query(`
          SELECT column_name, data_type, is_nullable, column_default
          FROM information_schema.columns 
          WHERE table_name = 'artist_follows'
          ORDER BY ordinal_position
        `);
        
        console.log('\n📊 Estructura actual de la tabla:');
        columns.forEach(col => {
          console.log(`  • ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
        });
        
      } else {
        console.log('⚠️  La tabla artist_follows no existe. Creándola...');
        
        await run(`
          CREATE TABLE IF NOT EXISTS artist_follows (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL,
            artist_id VARCHAR(255) NOT NULL,
            artist_name VARCHAR(255) NOT NULL,
            artist_image TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, artist_id),
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
          )
        `);
        
        console.log('✅ Tabla artist_follows creada exitosamente');
        
        // Crear índices para mejor rendimiento
        console.log('📊 Creando índices...');
        
        await run(`CREATE INDEX IF NOT EXISTS idx_artist_follows_user_id ON artist_follows(user_id)`);
        await run(`CREATE INDEX IF NOT EXISTS idx_artist_follows_artist_id ON artist_follows(artist_id)`);
        
        console.log('✅ Índices creados exitosamente');
      }
      
      // Verificar datos existentes
      console.log('\n🔍 Verificando datos existentes...');
      const followsCount = await query('SELECT COUNT(*) as count FROM artist_follows');
      console.log(`📈 Total de seguimientos de artistas: ${followsCount[0]?.count || 0}`);
      
      // Mostrar algunos ejemplos si existen
      if (parseInt(followsCount[0]?.count || 0) > 0) {
        const examples = await query(`
          SELECT af.artist_name, u.username, af.created_at
          FROM artist_follows af
          JOIN users u ON af.user_id = u.id
          ORDER BY af.created_at DESC
          LIMIT 5
        `);
        
        console.log('\n📋 Últimos seguimientos:');
        examples.forEach(ex => {
          console.log(`  • ${ex.username} siguió a ${ex.artist_name} (${new Date(ex.created_at).toLocaleDateString()})`);
        });
      }
      
      console.log('\n✅ Configuración de tabla artist_follows completada!');
      
    } catch (error) {
      console.error('❌ Error verificando/creando tabla artist_follows:', error);
      throw error;
    }
    
  } catch (error) {
    console.error('❌ Error en configuración de tabla artist_follows:', error);
    process.exit(1);
  }
}

setupArtistFollowsTable();
