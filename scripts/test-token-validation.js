// Script para probar el endpoint de validación de token
async function testTokenValidation() {
  try {
    console.log('🔍 Probando validación de token...\n');
    
    // Token actual del localStorage (expirado)
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjE0LCJ1c2VybmFtZSI6IkltU2FpdGFtIiwiZW1haWwiOiJtYXR1dGVkZXNhbnRvQGdtYWlsLmNvbSIsImlhdCI6MTczNDczMzQ3NSwiZXhwIjoxNzM0ODE5ODc1fQ.mhqG4i3iYfGP-mJ3CZJPkIj5mj0eB9DNFQ-kv-HFN_o';
    
    const response = await fetch('https://tuneboxd.xyz/api/auth/validate', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Status Text: ${response.statusText}`);
    
    const data = await response.json();
    console.log('\n📋 Respuesta:');
    console.log(JSON.stringify(data, null, 2));
    
    if (response.status === 401) {
      console.log('\n❌ Token inválido o expirado - Usuario necesita reautenticarse');
    } else if (data.success) {
      console.log('\n✅ Token válido - Usuario autenticado correctamente');
      console.log(`👤 Usuario: ${data.user.username} (${data.user.email})`);
    }
    
  } catch (error) {
    console.error('❌ Error probando validación:', error);
  }
}

testTokenValidation();
