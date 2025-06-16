// Test manual para verificar detección de recarga de página
// Ejecutar este código en la consola del navegador después de cargar un perfil

console.log('🧪 Test de detección de recarga de página');

// Verificar que la API de Performance está disponible
if (performance.getEntriesByType) {
  const navigation = performance.getEntriesByType('navigation')[0];
  console.log('📊 Información de navegación:', navigation);
  console.log('🔍 Tipo de navegación:', navigation?.type);
  console.log('🔄 Es recarga?', navigation?.type === 'reload');
  
  // Simular detección de recarga
  const isPageReload = navigation?.type === 'reload';
  
  if (isPageReload) {
    console.log('✅ Recarga de página detectada correctamente');
  } else {
    console.log('ℹ️ No es una recarga de página - navegación normal');
  }
} else {
  console.log('❌ API de Performance no disponible');
}

// Instrucciones para el usuario
console.log(`
📋 INSTRUCCIONES PARA PROBAR:

1. Asegúrate de estar en un perfil de otro usuario (no el tuyo)
2. Verifica que estés logueado
3. Observa el estado del botón de seguir
4. Si no estás siguiendo al usuario, haz clic en "Seguir"
5. Confirma que el botón cambió a "Siguiendo"
6. Presiona F5 o Ctrl+R para recargar la página
7. Observa si el botón mantiene el estado "Siguiendo"

🔍 MONITOREO:
- Abre la consola del navegador (F12)
- Busca mensajes que contengan "seguimiento"
- Deberías ver logs sobre la verificación del estado
`);

// Función para probar manualmente
window.testFollowState = function() {
  console.log('🧪 Ejecutando test manual del estado de seguimiento...');
  
  const followButton = document.querySelector('[data-testid="follow-button"]');
  if (followButton) {
    console.log('✅ Botón de seguir encontrado');
    console.log('📝 Texto actual del botón:', followButton.textContent);
    console.log('🎨 Clases CSS:', followButton.className);
  } else {
    console.log('❌ Botón de seguir no encontrado');
    console.log('🔍 Buscando botones alternativos...');
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn, i) => {
      if (btn.textContent.includes('Seguir') || btn.textContent.includes('Siguiendo')) {
        console.log(`🔍 Botón ${i}:`, btn.textContent, btn.className);
      }
    });
  }
};

console.log('💡 Ejecuta window.testFollowState() para probar el estado del botón');
