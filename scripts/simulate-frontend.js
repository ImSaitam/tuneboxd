// Test directo para simular exactamente el comportamiento del frontend
import fetch from 'node-fetch';

async function simulateFrontendBehavior() {
  console.log('🔍 Simulating exact frontend behavior...\n');
  
  try {
    // Simular lo que hace el frontend exactamente
    const username = 'ImSaitam';
    const userId = 14;
    
    console.log(`1️⃣ Simulating profile load for user: ${username} (ID: ${userId})`);
    
    // Simular la carga del perfil de usuario
    console.log('2️⃣ Loading user profile...');
    const profileResponse = await fetch(`https://tuneboxd.xyz/api/user/profile/${username}`);
    const profileData = await profileResponse.json();
    
    console.log(`   Profile loaded: ${profileData.success}`);
    console.log(`   User ID from profile: ${profileData.user?.id}`);
    
    if (profileData.success && profileData.user) {
      // Simular la carga de artistas seguidos
      console.log('\n3️⃣ Loading followed artists...');
      console.log(`   Fetching: /api/artists/following/${profileData.user.id}`);
      
      const artistsResponse = await fetch(`https://tuneboxd.xyz/api/artists/following/${profileData.user.id}`);
      const artistsData = await artistsResponse.json();
      
      console.log(`   Artists response status: ${artistsResponse.status}`);
      console.log(`   Artists response success: ${artistsData.success}`);
      console.log(`   Artists count: ${artistsData.artists?.length || 0}`);
      
      if (artistsData.success && artistsData.artists) {
        console.log('\n4️⃣ Artists data:');
        artistsData.artists.forEach((artist, index) => {
          console.log(`   ${index + 1}. ${artist.artist_name}`);
          console.log(`      - ID: ${artist.artist_id}`);
          console.log(`      - Image: ${artist.artist_image ? 'Present' : 'Missing'}`);
          console.log(`      - Followed at: ${artist.followed_at}`);
        });
        
        // Simular estado de React
        console.log('\n5️⃣ React state simulation:');
        const followedArtists = artistsData.artists;
        console.log(`   followedArtists.length: ${followedArtists.length}`);
        console.log(`   followedArtists.length > 0: ${followedArtists.length > 0}`);
        
        if (followedArtists.length > 0) {
          console.log('   ✅ Should render artists grid');
          console.log('   ✅ Should NOT show empty state');
        } else {
          console.log('   ❌ Would show empty state');
        }
        
        // Verificar estructura de datos para el renderizado
        console.log('\n6️⃣ Data structure for rendering:');
        followedArtists.forEach((artist, index) => {
          console.log(`   Artist ${index + 1}:`);
          console.log(`     - artist.artist_id: ${artist.artist_id} (${typeof artist.artist_id})`);
          console.log(`     - artist.artist_name: ${artist.artist_name} (${typeof artist.artist_name})`);
          console.log(`     - artist.artist_image: ${artist.artist_image ? 'valid' : 'null/undefined'}`);
          console.log(`     - artist.followed_at: ${artist.followed_at} (${typeof artist.followed_at})`);
          
          // Simular new Date() para la fecha
          try {
            const date = new Date(artist.followed_at);
            const formattedDate = date.toLocaleDateString('es');
            console.log(`     - Formatted date: ${formattedDate}`);
          } catch (error) {
            console.log(`     - Date formatting error: ${error.message}`);
          }
        });
        
        console.log('\n✅ CONCLUSION: Frontend should work correctly');
        console.log('   - Endpoint returns valid data');
        console.log('   - Data structure is correct');
        console.log('   - followedArtists.length > 0 should be true');
        console.log('   - Should render the artists grid');
        
      } else {
        console.log('\n❌ PROBLEM: Artists endpoint failed');
        console.log(`   Response: ${JSON.stringify(artistsData)}`);
      }
      
    } else {
      console.log('\n❌ PROBLEM: Profile loading failed');
      console.log(`   Response: ${JSON.stringify(profileData)}`);
    }
    
  } catch (error) {
    console.error('❌ Error in simulation:', error);
  }
}

simulateFrontendBehavior();
