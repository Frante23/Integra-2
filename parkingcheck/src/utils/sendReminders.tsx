import { run } from '@/libs/mongodb';
import Reserva from '@/models/reserva'; 
import Parking from '@/models/parking'; 
import User from '@/models/users'; 
import transporter from '@/utils/GmailRes'; 

const RECORDATORIO_MINUTOS = 30;

const enviarRecordatorios = async () => {
  try {
    await run();

    const ahora = new Date();
    const tiempoRecordatorio = new Date(ahora.getTime() + RECORDATORIO_MINUTOS * 60 * 1000);

    const reservas = await Reserva.find({
      status: 'active',
      fechaReserva: { $gte: ahora, $lte: tiempoRecordatorio },
    });

    for (const reserva of reservas) {

      const usuario = await User.findById(reserva.id_usuario);
      if (!usuario) {
        console.error(`Usuario con ID ${reserva.id_usuario} no encontrado.`);
        continue;
      }

      const estacionamiento = await Parking.findOne({
        section: reserva.seccion,
        number: reserva.numero,
      });

      if (!estacionamiento || estacionamiento.status !== 'reservado') {
        console.error(
          `Estacionamiento no encontrado o no reservado: Sección ${reserva.seccion}, Número ${reserva.numero}`
        );
        continue;
      }

      const subject = 'Recordatorio de tu Reserva de Estacionamiento';
      const message = `
        Estimado/a ${usuario.UserName},

        Este es un recordatorio de tu reserva en el estacionamiento:
        - Sección: ${reserva.seccion}
        - Número: ${reserva.numero}
        - Fecha y hora de la reserva: ${reserva.fechaReserva.toLocaleString()}

        Recuerda que la reserva vence a las ${reserva.fechaExpiracion.toLocaleString()}.

        Saludos,
        Equipo de Estacionamientos.
      `;

      try {
        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: usuario.UserEmail,
          subject: subject,
          text: message,
        });

        console.log(`Correo recordatorio enviado a ${usuario.UserEmail}.`);
      } catch (error) {
        console.error(`Error al enviar correo a ${usuario.UserEmail}:`, error);
      }
    }

    console.log('Proceso de recordatorios completado.');
  } catch (error) {
    console.error('Error en el proceso de recordatorios:', error);
  }
};

enviarRecordatorios();
