#!/usr/bin/env node

// Script para crear usuario verificado y probar endpoint
import { query, run } from './src/lib/database-adapter.js';
import bcrypt from 'bcryptjs';

async function createVerifiedUser() {
  try {
    const hashedPassword = await bcrypt.hash('testpass123', 10);
    const testEmail = 'listsTest' + Date.now() + '@test.com';
    const testUsername = 'listsTest' + Date.now();
    
    console.log('🆕 Creating verified test user...');
    console.log(`   Email: ${testEmail}`);
    console.log(`   Username: ${testUsername}`);
    console.log(`   Password: testpass123`);
    
    const result = await run(`
      INSERT INTO users (username, email, password_hash, email_verified, created_at, updated_at) 
      VALUES (?, ?, ?, ?, NOW(), NOW())
    `, [testUsername, testEmail, hashedPassword, true]);

    console.log('✅ User created successfully!');
    
    // Verificar que se creó
    const createdUser = await query('SELECT id, username, email, email_verified FROM users WHERE email = ?', [testEmail]);
    console.log('📋 Created user:', createdUser[0]);
    
    return {
      email: testEmail,
      password: 'testpass123',
      username: testUsername
    };

  } catch (error) {
    console.error('💥 Error:', error);
    return null;
  }
}

createVerifiedUser();
