// Test final para verificar el fix de recarga de página
const puppeteer = require('puppeteer');

async function testReloadFix() {
  console.log('🧪 Iniciando test del fix de recarga de página...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Habilitar console logs
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('seguimiento')) {
        console.log('🔍 Browser Log:', msg.text());
      }
    });
    
    console.log('1. Navegando a la página de login...');
    await page.goto('http://localhost:3001/login');
    await page.waitForSelector('input[type="email"]', { timeout: 10000 });
    
    console.log('2. Iniciando sesión...');
    await page.type('input[type="email"]', 'test@test.com');
    await page.type('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Esperar a que termine el login
    await page.waitForNavigation({ timeout: 10000 });
    
    console.log('3. Navegando al perfil de otro usuario...');
    await page.goto('http://localhost:3001/profile/admin');
    
    // Esperar a que cargue la página
    await page.waitForSelector('[data-testid="follow-button"]', { timeout: 10000 });
    
    console.log('4. Verificando estado inicial del botón...');
    let buttonText = await page.$eval('[data-testid="follow-button"]', el => el.textContent);
    console.log(`Estado inicial del botón: ${buttonText}`);
    
    // Si no está siguiendo, hacer clic para seguir
    if (buttonText.includes('Seguir') && !buttonText.includes('Siguiendo')) {
      console.log('5. Haciendo clic en seguir...');
      await page.click('[data-testid="follow-button"]');
      await page.waitForTimeout(2000); // Esperar a que se procese
      
      buttonText = await page.$eval('[data-testid="follow-button"]', el => el.textContent);
      console.log(`Estado después de seguir: ${buttonText}`);
    }
    
    console.log('6. 🔄 RECARGANDO LA PÁGINA (F5)...');
    await page.reload({ waitUntil: 'networkidle0' });
    
    console.log('7. Esperando a que cargue después de la recarga...');
    await page.waitForSelector('[data-testid="follow-button"]', { timeout: 10000 });
    
    // Esperar un poco más para asegurar que se complete la verificación
    await page.waitForTimeout(3000);
    
    console.log('8. Verificando estado del botón después de la recarga...');
    buttonText = await page.$eval('[data-testid="follow-button"]', el => el.textContent);
    console.log(`Estado después de la recarga: ${buttonText}`);
    
    if (buttonText.includes('Siguiendo')) {
      console.log('✅ ÉXITO: El botón mantiene correctamente el estado "Siguiendo" después de la recarga');
      return true;
    } else {
      console.log('❌ FALLO: El botón no mantiene el estado después de la recarga');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error durante el test:', error);
    return false;
  } finally {
    await browser.close();
  }
}

// Ejecutar el test
testReloadFix().then(success => {
  if (success) {
    console.log('\n🎉 Test completado exitosamente - El problema de persistencia está resuelto');
  } else {
    console.log('\n⚠️ Test falló - El problema persiste');
  }
  process.exit(success ? 0 : 1);
}).catch(error => {
  console.error('Error ejecutando el test:', error);
  process.exit(1);
});
