// Script para diagnosticar el problema del borde de la navbar
console.log('=== Diagnóstico de Borde de Navbar ===');

// Función para obtener todos los estilos de la navbar
function diagnoseNavbar() {
    const navbar = document.querySelector('nav');
    if (!navbar) {
        console.log('❌ No se encontró la navbar');
        return;
    }
    
    console.log('✅ Navbar encontrada');
    
    // Obtener estilos computados
    const styles = window.getComputedStyle(navbar);
    
    console.log('📊 Estilos actuales de la navbar:');
    console.log('- Background:', styles.backgroundColor);
    console.log('- Border bottom:', styles.borderBottomColor, styles.borderBottomWidth, styles.borderBottomStyle);
    console.log('- Box shadow:', styles.boxShadow);
    console.log('- Border color:', styles.borderColor);
    
    // Verificar tema actual
    const theme = document.documentElement.getAttribute('data-theme');
    console.log('🎨 Tema actual:', theme);
    
    // Verificar variables CSS
    const rootStyles = window.getComputedStyle(document.documentElement);
    console.log('🔧 Variables CSS:');
    console.log('- --border-color:', rootStyles.getPropertyValue('--border-color'));
    console.log('- --card-bg:', rootStyles.getPropertyValue('--card-bg'));
    
    // Verificar clases aplicadas
    console.log('📝 Clases de la navbar:', navbar.className);
    
    // Buscar elementos con bordes problemáticos
    const elementsWithBorders = document.querySelectorAll('[class*="border-black"], [class*="border-gray-900"], [style*="border"]');
    console.log('🔍 Elementos con posibles bordes problemáticos:', elementsWithBorders.length);
    elementsWithBorders.forEach((el, i) => {
        console.log(`  ${i + 1}:`, el.tagName, el.className, el.style.border);
    });
}

// Función para forzar la corrección del borde
function fixNavbarBorder() {
    const navbar = document.querySelector('nav');
    if (!navbar) return;
    
    console.log('🔧 Aplicando corrección manual...');
    
    // Aplicar estilos directamente
    navbar.style.borderBottom = '1px solid rgba(229, 231, 235, 0.4)';
    navbar.style.borderColor = 'rgba(229, 231, 235, 0.4)';
    navbar.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.05)';
    
    console.log('✅ Corrección aplicada');
}

// Ejecutar diagnóstico
diagnoseNavbar();

// Función para cambiar tema y verificar
function testThemeChange() {
    console.log('\n🔄 Probando cambio de tema...');
    
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    console.log(`Cambiado de ${currentTheme} a ${newTheme}`);
    
    setTimeout(() => {
        diagnoseNavbar();
        if (newTheme === 'light') {
            fixNavbarBorder();
        }
    }, 500);
}

// Exportar funciones para uso manual
window.diagnoseNavbar = diagnoseNavbar;
window.fixNavbarBorder = fixNavbarBorder;
window.testThemeChange = testThemeChange;

console.log('\n📋 Funciones disponibles:');
console.log('- diagnoseNavbar() - Diagnosticar la navbar');
console.log('- fixNavbarBorder() - Aplicar corrección manual');
console.log('- testThemeChange() - Cambiar tema y verificar');
