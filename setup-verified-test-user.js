#!/usr/bin/env node

// Script para verificar usuarios existentes y crear uno verificado para pruebas
import { query, run } from './src/lib/database-adapter.js';

async function setupTestUser() {
  try {
    console.log('🔍 Checking existing users...');

    // Verificar usuarios existentes
    const existingUsers = await query('SELECT id, username, email, verified FROM users LIMIT 5');
    console.log('\n📋 Existing users:');
    existingUsers.forEach(user => {
      console.log(`  - ${user.username} (${user.email}) - Verified: ${user.verified}`);
    });

    // Verificar si ya existe un usuario de prueba verificado
    const testUser = await query('SELECT * FROM users WHERE email LIKE ? AND verified = true LIMIT 1', ['test%@example.com']);
    
    if (testUser.length > 0) {
      console.log('\n✅ Found existing verified test user:');
      console.log(`   Username: ${testUser[0].username}`);
      console.log(`   Email: ${testUser[0].email}`);
      console.log(`   Password: testpass123 (if it was created by our tests)`);
      return testUser[0];
    }

    // Crear un usuario verificado para pruebas
    console.log('\n🆕 Creating verified test user...');
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    
    const testEmail = 'testverified' + Date.now() + '@example.com';
    const testUsername = 'testverified' + Date.now();
    
    const result = await run(`
      INSERT INTO users (username, email, password_hash, verified, created_at, updated_at) 
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `, [testUsername, testEmail, hashedPassword, true]);

    console.log('✅ Verified test user created successfully!');
    console.log(`   Username: ${testUsername}`);
    console.log(`   Email: ${testEmail}`);
    console.log(`   Password: testpass123`);

    return {
      username: testUsername,
      email: testEmail,
      password: 'testpass123'
    };

  } catch (error) {
    console.error('💥 Error:', error);
    return null;
  }
}

setupTestUser();
