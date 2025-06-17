// Test script para verificar el funcionamiento del toggle de tema
console.log('=== Test de Toggle de Tema ===');

// Función para verificar el tema actual
function checkCurrentTheme() {
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    console.log('Tema actual:', currentTheme);
    
    // Verificar variables CSS
    const computedStyle = getComputedStyle(html);
    console.log('--card-bg:', computedStyle.getPropertyValue('--card-bg'));
    console.log('--text-primary:', computedStyle.getPropertyValue('--text-primary'));
    console.log('--border-color:', computedStyle.getPropertyValue('--border-color'));
    
    return currentTheme;
}

// Función para forzar un cambio de tema
function forceThemeChange(newTheme) {
    const html = document.documentElement;
    html.setAttribute('data-theme', newTheme);
    console.log('Tema forzado a:', newTheme);
    
    // Verificar después del cambio
    setTimeout(() => {
        checkCurrentTheme();
    }, 100);
}

// Función para encontrar el botón de toggle de tema
function findThemeToggle() {
    const buttons = document.querySelectorAll('button');
    console.log('Botones encontrados:', buttons.length);
    
    buttons.forEach((button, index) => {
        console.log(`Botón ${index}:`, button.textContent, button.className);
        if (button.querySelector('svg') && button.title && button.title.includes('modo')) {
            console.log('Botón de tema encontrado:', button);
            return button;
        }
    });
}

// Ejecutar tests
console.log('Ejecutando tests...');
checkCurrentTheme();
findThemeToggle();

// Test de cambio de tema
console.log('\n=== Test de Cambio de Tema ===');
console.log('Cambiando a modo claro...');
forceThemeChange('light');

setTimeout(() => {
    console.log('\nCambiando a modo oscuro...');
    forceThemeChange('dark');
}, 2000);

setTimeout(() => {
    console.log('\nVolviendo a modo claro...');
    forceThemeChange('light');
}, 4000);
