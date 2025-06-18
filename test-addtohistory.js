// Test para verificar listeningHistoryService.addToHistory
import { listeningHistoryService } from './src/lib/database-adapter.js';

async function testAddToHistory() {
  try {
    console.log('🧪 Testing listeningHistoryService...');
    
    // Verificar que el servicio existe
    console.log('listeningHistoryService existe:', !!listeningHistoryService);
    console.log('addToHistory existe:', !!listeningHistoryService.addToHistory);
    console.log('Tipo de addToHistory:', typeof listeningHistoryService.addToHistory);
    
    // Listar todos los métodos disponibles
    console.log('\n📋 Métodos disponibles en listeningHistoryService:');
    Object.getOwnPropertyNames(listeningHistoryService).forEach(method => {
      console.log(`  - ${method}: ${typeof listeningHistoryService[method]}`);
    });
    
    // Probar la llamada (sin ejecutar realmente)
    if (typeof listeningHistoryService.addToHistory === 'function') {
      console.log('\n✅ addToHistory es una función válida');
      console.log('Función:', listeningHistoryService.addToHistory.toString().substring(0, 100) + '...');
    } else {
      console.log('\n❌ addToHistory NO es una función');
    }
    
  } catch (error) {
    console.error('❌ Error en test:', error);
  }
}

testAddToHistory();
