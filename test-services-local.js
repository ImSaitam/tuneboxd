// Test de API endpoints en desarrollo local
import { notificationService, albumService, reviewService } from './src/lib/database-adapter.js';

async function testServicesLocally() {
  console.log('🧪 Testeando servicios localmente...\n');

  // Test 1: notificationService
  console.log('1. Testing notificationService...');
  try {
    // Crear una notificación de prueba
    const testNotification = {
      user_id: 1,
      type: 'test',
      title: 'Test Notification',
      message: 'This is a test notification'
    };
    
    const result = await notificationService.createNotification(testNotification);
    console.log('✅ notificationService.createNotification works:', result);

    // Obtener notificaciones
    const notifications = await notificationService.getUserNotifications(1, 5);
    console.log('✅ notificationService.getUserNotifications works:', notifications.length, 'notifications');

    // Obtener conteo de no leídas
    const unreadCount = await notificationService.getUnreadCount(1);
    console.log('✅ notificationService.getUnreadCount works:', unreadCount);

  } catch (error) {
    console.error('❌ notificationService error:', error.message);
  }

  console.log('\n2. Testing albumService...');
  try {
    // Buscar un álbum por ID
    const album = await albumService.findById(1);
    console.log('✅ albumService.findById works:', album ? 'Found album' : 'No album found');
  } catch (error) {
    console.error('❌ albumService error:', error.message);
  }

  console.log('\n3. Testing reviewService...');
  try {
    // Obtener estadísticas de un álbum
    const stats = await reviewService.getAlbumStats(1);
    console.log('✅ reviewService.getAlbumStats works:', stats);

    // Obtener reseñas de un álbum
    const reviews = await reviewService.getAlbumReviews(1, 5);
    console.log('✅ reviewService.getAlbumReviews works:', reviews.length, 'reviews');
  } catch (error) {
    console.error('❌ reviewService error:', error.message);
  }
}

testServicesLocally();
