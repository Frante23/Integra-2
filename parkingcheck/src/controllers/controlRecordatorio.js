import cron from 'node-cron';
import enviarRecordatorios from '@/tasks/enviarRecordatorios'; // Importa la función de envío de recordatorios

// Configura un cron job para ejecutar cada 5 minutos
cron.schedule('*/5 * * * *', async () => {
  console.log('Ejecutando tarea programada: Enviar recordatorios de reservas...');
  
  try {
    await enviarRecordatorios();
    console.log('Tarea programada completada.');
  } catch (error) {
    console.error('Error al ejecutar la tarea programada:', error);
  }
});

console.log('Tarea programada configurada con node-cron.');
