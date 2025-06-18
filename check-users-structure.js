#!/usr/bin/env node

// Script para verificar la estructura de la tabla users
import { query } from './src/lib/database-adapter.js';

async function checkUsersStructure() {
  try {
    console.log('🔍 Checking users table structure...');
    
    const structure = await query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    
    console.log('\n📋 Users table structure:');
    structure.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : '(NULL)'}`);
    });

    // Obtener algunos usuarios de ejemplo
    const users = await query('SELECT id, username, email FROM users LIMIT 3');
    console.log('\n👥 Sample users:');
    users.forEach(user => {
      console.log(`  ${user.id}: ${user.username} (${user.email})`);
    });

  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUsersStructure();
