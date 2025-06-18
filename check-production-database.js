// Verificar si la tabla listening_history existe en producción
async function checkProductionDatabase() {
  try {
    console.log('🔍 Verificando tabla listening_history en producción...');
    
    // Hacer una consulta simple al endpoint para ver si funciona
    const response = await fetch('https://tuneboxd.xyz/api/listening-history', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log('📥 Status:', response.status, response.statusText);
    
    const responseData = await response.json();
    console.log('📋 Respuesta:', JSON.stringify(responseData, null, 2));

    if (response.status === 401) {
      console.log('✅ El endpoint existe pero requiere autenticación (esperado)');
    } else if (response.status === 500) {
      console.log('❌ Error 500: Probablemente la tabla no existe en producción');
    } else {
      console.log('✅ El endpoint responde correctamente');
    }

  } catch (error) {
    console.error('❌ Error verificando producción:', error);
  }
}

checkProductionDatabase();
