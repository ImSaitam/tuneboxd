#!/bin/bash

# Script para verificar la estructura real de la tabla users
echo "🔍 Verificando estructura de tabla users en PostgreSQL..."

# Crear un script temporal para verificar la estructura
cat > check_table_structure.js << 'EOF'
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.production' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkTableStructure() {
  try {
    console.log('🔗 Conectando a la base de datos...');
    
    // Verificar estructura de la tabla users
    const result = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position;
    `);
    
    console.log('\n📋 Estructura de la tabla users:');
    console.log('================================');
    
    if (result.rows.length === 0) {
      console.log('❌ Tabla users no encontrada!');
    } else {
      result.rows.forEach(col => {
        console.log(`📌 ${col.column_name} | ${col.data_type} | nullable: ${col.is_nullable} | default: ${col.column_default || 'none'}`);
      });
    }
    
    // Verificar si existen registros
    const countResult = await pool.query('SELECT COUNT(*) FROM users');
    console.log(`\n👥 Total usuarios: ${countResult.rows[0].count}`);
    
    // Verificar campos relacionados con verificación
    console.log('\n🔍 Buscando campos de verificación...');
    const verificationFields = result.rows.filter(col => 
      col.column_name.includes('verif') || 
      col.column_name.includes('confirm') ||
      col.column_name.includes('activ')
    );
    
    if (verificationFields.length > 0) {
      console.log('✅ Campos de verificación encontrados:');
      verificationFields.forEach(field => {
        console.log(`   - ${field.column_name} (${field.data_type})`);
      });
    } else {
      console.log('❌ No se encontraron campos de verificación específicos');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTableStructure();
EOF

echo "🚀 Ejecutando verificación..."
node check_table_structure.js

echo ""
echo "🎯 Resultado: Se mostrará la estructura real de la tabla users"
echo "📝 Basándose en esto, corregiremos los nombres de columnas en el código"

# Limpiar
rm check_table_structure.js
