// Script para debuggear la carga de artistas en el perfil
import fetch from 'node-fetch';

async function debugProfileArtists() {
  console.log('🔍 Debugging profile artists loading...\n');
  
  try {
    // 1. Probar endpoint público
    console.log('1️⃣ Testing public endpoint...');
    const publicResponse = await fetch('https://tuneboxd.xyz/api/artists/following/14');
    const publicData = await publicResponse.json();
    
    console.log(`   Status: ${publicResponse.status}`);
    console.log(`   Success: ${publicData.success}`);
    console.log(`   Artists count: ${publicData.artists?.length || 0}`);
    
    if (publicData.artists && publicData.artists.length > 0) {
      console.log('   Artists:');
      publicData.artists.forEach((artist, index) => {
        console.log(`     ${index + 1}. ${artist.artist_name} (${artist.artist_id})`);
      });
    }
    
    // 2. Simular el flujo del frontend
    console.log('\n2️⃣ Simulating frontend flow...');
    console.log('   User ID: 14 (ImSaitam)');
    console.log('   Endpoint: /api/artists/following/14');
    console.log('   Expected: 2 artists (Ado, Dillom)');
    
    // 3. Verificar estructura de datos
    console.log('\n3️⃣ Data structure verification...');
    if (publicData.artists) {
      publicData.artists.forEach(artist => {
        console.log(`   Artist: ${artist.artist_name}`);
        console.log(`     - ID: ${artist.artist_id}`);
        console.log(`     - Image: ${artist.artist_image ? 'Yes' : 'No'}`);
        console.log(`     - Followed at: ${artist.followed_at}`);
      });
    }
    
    // 4. Verificar que el endpoint funciona sin headers
    console.log('\n4️⃣ Testing without auth headers...');
    const noAuthResponse = await fetch('https://tuneboxd.xyz/api/artists/following/14', {
      method: 'GET'
    });
    const noAuthData = await noAuthResponse.json();
    
    console.log(`   Status without auth: ${noAuthResponse.status}`);
    console.log(`   Success without auth: ${noAuthData.success}`);
    console.log(`   Artists without auth: ${noAuthData.artists?.length || 0}`);
    
    // 5. Conclusión
    console.log('\n📊 Summary:');
    console.log(`   ✅ Public endpoint works: ${publicData.success}`);
    console.log(`   ✅ Returns data: ${publicData.artists?.length > 0}`);
    console.log(`   ✅ No auth required: ${noAuthData.success}`);
    console.log(`   🎯 Expected frontend behavior: Should show ${publicData.artists?.length || 0} artists`);
    
    if (publicData.success && publicData.artists?.length > 0) {
      console.log('\n   🔍 Issue might be in:');
      console.log('      - State management (followedArtists state)');
      console.log('      - Component rendering');
      console.log('      - Tab switching logic');
      console.log('      - CSS/styling hiding elements');
    }
    
  } catch (error) {
    console.error('❌ Error in debugging:', error);
  }
}

debugProfileArtists();
