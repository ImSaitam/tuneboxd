// Script de verificación final para el tema de la navbar
console.log('🔧 === VERIFICACIÓN FINAL DEL TEMA DE NAVBAR ===');

// Función para verificar el estado actual
function verifyNavbarTheme() {
    console.log('\n📊 Estado actual de la aplicación:');
    
    // 1. Verificar que la navbar existe
    const navbar = document.querySelector('nav');
    if (!navbar) {
        console.log('❌ ERROR: No se encontró la navbar');
        return false;
    }
    console.log('✅ Navbar encontrada');
    
    // 2. Verificar el tema actual
    const currentTheme = document.documentElement.getAttribute('data-theme');
    console.log(`🎨 Tema actual: ${currentTheme || 'no definido'}`);
    
    // 3. Obtener estilos computados de la navbar
    const navStyles = window.getComputedStyle(navbar);
    console.log('\n🎯 Estilos de la navbar:');
    console.log(`- Background: ${navStyles.backgroundColor}`);
    console.log(`- Border bottom: ${navStyles.borderBottomColor} ${navStyles.borderBottomWidth} ${navStyles.borderBottomStyle}`);
    console.log(`- Box shadow: ${navStyles.boxShadow}`);
    
    // 4. Verificar variables CSS
    const rootStyles = window.getComputedStyle(document.documentElement);
    console.log('\n🔧 Variables CSS:');
    console.log(`- --border-color: ${rootStyles.getPropertyValue('--border-color')}`);
    console.log(`- --card-bg: ${rootStyles.getPropertyValue('--card-bg')}`);
    console.log(`- --text-primary: ${rootStyles.getPropertyValue('--text-primary')}`);
    
    // 5. Verificar elementos problemáticos
    const darkBorders = document.querySelectorAll('[class*="border-black"], [class*="border-gray-900"], [style*="border: 1px solid black"], [style*="border: 1px solid #000"]');
    if (darkBorders.length > 0) {
        console.log(`⚠️  Se encontraron ${darkBorders.length} elementos con posibles bordes oscuros`);
        darkBorders.forEach((el, i) => {
            console.log(`  ${i + 1}: ${el.tagName} - ${el.className}`);
        });
    } else {
        console.log('✅ No se encontraron elementos con bordes problemáticos');
    }
    
    return true;
}

// Función para cambiar tema y verificar
function testThemeSwitch() {
    console.log('\n🔄 === TEST DE CAMBIO DE TEMA ===');
    
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    console.log(`Cambiando de ${currentTheme} a ${newTheme}...`);
    document.documentElement.setAttribute('data-theme', newTheme);
    
    // Esperar a que se apliquen los estilos
    setTimeout(() => {
        console.log('\n📊 Estado después del cambio:');
        verifyNavbarTheme();
        
        // Verificar específicamente el modo claro
        if (newTheme === 'light') {
            const navbar = document.querySelector('nav');
            const navStyles = window.getComputedStyle(navbar);
            const bgColor = navStyles.backgroundColor;
            
            if (bgColor.includes('255') || bgColor.includes('white')) {
                console.log('✅ ÉXITO: La navbar tiene fondo claro en modo claro');
            } else {
                console.log(`❌ PROBLEMA: La navbar tiene fondo oscuro (${bgColor}) en modo claro`);
            }
            
            const borderColor = navStyles.borderBottomColor;
            if (!borderColor.includes('0, 0, 0') && !borderColor.includes('black')) {
                console.log('✅ ÉXITO: La navbar no tiene borde negro en modo claro');
            } else {
                console.log(`❌ PROBLEMA: La navbar tiene borde oscuro (${borderColor}) en modo claro`);
            }
        }
    }, 500);
}

// Función para encontrar y hacer clic en el toggle de tema
function findAndClickThemeToggle() {
    console.log('\n🔍 Buscando botón de toggle de tema...');
    
    // Buscar por diferentes selectores posibles
    const selectors = [
        'button[title*="modo"]',
        'button[aria-label*="modo"]',
        'button:has(svg)',
        '[class*="theme"]'
    ];
    
    let themeButton = null;
    
    for (const selector of selectors) {
        try {
            const buttons = document.querySelectorAll(selector);
            for (const button of buttons) {
                if (button.textContent.includes('🌓') || 
                    button.title?.includes('modo') || 
                    button.querySelector('[class*="sun"]') ||
                    button.querySelector('[class*="moon"]')) {
                    themeButton = button;
                    break;
                }
            }
            if (themeButton) break;
        } catch (e) {
            // Continuar con el siguiente selector
        }
    }
    
    if (themeButton) {
        console.log('✅ Botón de tema encontrado, haciendo clic...');
        themeButton.click();
        setTimeout(() => {
            console.log('🔄 Verificando cambio automático...');
            verifyNavbarTheme();
        }, 1000);
    } else {
        console.log('⚠️  No se encontró el botón de toggle de tema');
        console.log('💡 Usa testThemeSwitch() para cambiar manualmente');
    }
}

// Ejecutar verificación inicial
console.log('🚀 Iniciando verificación...');
verifyNavbarTheme();

// Exportar funciones para uso manual
window.verifyNavbarTheme = verifyNavbarTheme;
window.testThemeSwitch = testThemeSwitch;
window.findAndClickThemeToggle = findAndClickThemeToggle;

console.log('\n📋 Funciones disponibles:');
console.log('- verifyNavbarTheme() - Verificar estado actual');
console.log('- testThemeSwitch() - Cambiar tema manualmente');
console.log('- findAndClickThemeToggle() - Buscar y hacer clic en el toggle');

console.log('\n🎯 Para probar completamente:');
console.log('1. Ejecuta findAndClickThemeToggle() para cambiar al modo claro');
console.log('2. Verifica visualmente que la navbar no tenga bordes negros');
console.log('3. Ejecuta nuevamente para volver al modo oscuro');

// Auto-test después de 3 segundos
setTimeout(() => {
    console.log('\n⏰ Iniciando auto-test en 3 segundos...');
    findAndClickThemeToggle();
}, 3000);
