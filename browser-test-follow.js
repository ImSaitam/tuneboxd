// Test simple para verificar el fix de recarga de página
// Ejecutar este script en la consola del navegador después de navegar a un perfil

console.log('🧪 Iniciando test manual del fix de recarga de página...');

// Función para verificar el estado del botón
function checkFollowButtonState() {
  const button = document.querySelector('[data-testid="follow-button"]');
  if (button) {
    console.log('✅ Botón encontrado:', button.textContent.trim());
    console.log('🎨 Clases:', button.className);
    console.log('🔒 Deshabilitado:', button.disabled);
    return button.textContent.trim();
  } else {
    console.log('❌ Botón no encontrado');
    return null;
  }
}

// Función para simular el test completo
function runFollowTest() {
  console.log('\n📋 PASO 1: Verificando estado inicial...');
  const initialState = checkFollowButtonState();
  
  console.log('\n📋 PASO 2: Información sobre navegación...');
  const navigation = performance.getEntriesByType('navigation')[0];
  console.log('🔍 Tipo de navegación:', navigation?.type);
  console.log('🔄 Es recarga de página:', navigation?.type === 'reload');
  
  console.log('\n📋 PASO 3: Verificando logs de seguimiento...');
  console.log('👀 Busca en la consola mensajes que contengan "seguimiento" o "Verificando"');
  
  return {
    buttonState: initialState,
    navigationType: navigation?.type,
    isReload: navigation?.type === 'reload'
  };
}

// Función para monitorear cambios en el botón
function monitorFollowButton() {
  const button = document.querySelector('[data-testid="follow-button"]');
  if (button) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' || mutation.type === 'characterData') {
          console.log('🔄 Cambio en el botón detectado:', button.textContent.trim());
        }
      });
    });
    
    observer.observe(button, {
      childList: true,
      subtree: true,
      characterData: true
    });
    
    console.log('👀 Monitoreando cambios en el botón...');
    return observer;
  }
  return null;
}

// Ejecutar el test
const testResult = runFollowTest();
console.log('\n📊 RESULTADO DEL TEST:', testResult);

// Iniciar monitoreo
const observer = monitorFollowButton();

console.log(`
🎯 INSTRUCCIONES PARA COMPLETAR EL TEST:

1. Asegúrate de estar en un perfil de otro usuario (no el tuyo)
2. Debes estar logueado
3. Observa el estado actual del botón: "${testResult.buttonState}"
4. Si no estás siguiendo, haz clic en "Seguir" y espera a que cambie a "Siguiendo"
5. Una vez que el botón muestre "Siguiendo", presiona F5 para recargar
6. Después de la recarga, verifica si el botón sigue mostrando "Siguiendo"

🔍 BUSCA ESTOS LOGS EN LA CONSOLA:
- "Verificando estado de seguimiento..."
- "Estado de seguimiento obtenido: true/false"
- "Recarga de página detectada - verificando estado de seguimiento..."

${testResult.isReload ? '✅ Esta es una recarga de página - el fix debería activarse' : 'ℹ️ Esta es navegación normal - el fix no es necesario'}
`);

// Función para limpiar el monitoreo
window.stopMonitoring = function() {
  if (observer) {
    observer.disconnect();
    console.log('🛑 Monitoreo detenido');
  }
};

// Función para ejecutar el test nuevamente
window.runTest = runFollowTest;
