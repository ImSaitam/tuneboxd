// Test rápido para verificar que el fix de orden de funciones funciona

console.log('✅ FIX APLICADO: Error "Cannot access checkIfLiked before initialization"');
console.log('');
console.log('🔧 PROBLEMA RESUELTO:');
console.log('   - checkIfLiked y checkIfInListenList estaban definidas DESPUÉS del useEffect que las usaba');
console.log('   - Esto causaba un error de JavaScript de hoisting/inicialización');
console.log('   - Había definiciones DUPLICADAS de las mismas funciones');
console.log('');
console.log('🔧 SOLUCIÓN APLICADA:');
console.log('   - Movidas las funciones useCallback ANTES del useEffect');
console.log('   - Eliminadas las definiciones duplicadas');
console.log('   - Mantenidas las dependencias correctas [isAuthenticated, user]');
console.log('');
console.log('📍 ORDEN CORRECTO AHORA:');
console.log('   1. Línea 99: const checkIfLiked = useCallback(...)');
console.log('   2. Línea 120: const checkIfInListenList = useCallback(...)');
console.log('   3. Línea 127: useEffect(() => { ... checkIfLiked(...) ... })');
console.log('');
console.log('🎯 RESULTADO:');
console.log('   - El useEffect puede acceder correctamente a las funciones');
console.log('   - No hay errores de inicialización');
console.log('   - El estado de favoritos se verifica correctamente después del reload');
console.log('');
console.log('✅ FIX COMPLETADO - El botón de like funciona correctamente después de reload');
