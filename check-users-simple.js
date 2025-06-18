#!/usr/bin/env node

// Script simple para verificar usuarios
import { query } from './src/lib/database-adapter.js';

async function checkUsers() {
  try {
    const users = await query('SELECT id, username, email, verified FROM users ORDER BY id DESC LIMIT 10');
    console.log('📋 Users in database:');
    users.forEach(user => {
      console.log(`  ${user.id}: ${user.username} (${user.email}) - Verified: ${user.verified}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkUsers();
