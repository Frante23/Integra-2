import Reserva from '@/models/reserva';
import Parking from '@/models/parking';
import User from '@/models/users';
import { run } from '@/libs/mongodb';
import transporter from '@/utils/GmailRes';

const DURACION_PENALIZACION_DIAS = 7;

// Función para penalizar a un usuario
const penalizarUsuario = async (usuario: any, reserva: any, ahora: Date) => {
  try {
    // agrega +1 al las penalizaciones
    usuario.incumplimientos += 1;

    if (usuario.incumplimientos >= 3) {
      usuario.penalizadoHasta = new Date(
        ahora.getTime() + DURACION_PENALIZACION_DIAS * 24 * 60 * 60 * 1000
      );

      console.log(
        `Usuario ${usuario.UserName} ha sido penalizado hasta ${usuario.penalizadoHasta}`
      );

      // Enviar correo de notificación al usuario
      const subject = 'Has sido penalizado por incumplimiento de reservas';
      const message = `
        <p>Estimado/a <strong>${usuario.UserName}</strong>,</p>
        <p>Debido a múltiples incumplimientos de reservas, hemos restringido tu capacidad de realizar nuevas reservas hasta el <strong>${usuario.penalizadoHasta.toLocaleString()}</strong>.</p>
        <p>Por favor, evita realizar reservas innecesarias en el futuro.</p>
        <p>Saludos,<br>Equipo de Estacionamientos</p>
      `;

      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: usuario.UserEmail,
        subject,
        html: message, 
      });
    }

    await usuario.save();
    console.log(`Usuario ${usuario.UserName} actualizado con penalización.`);

    reserva.penalizado = true;
    await reserva.save();
    console.log(`Reserva con ID ${reserva._id} marcada como penalizada.`);

    // Habilitar el espacio de estacionamiento asociado
    const parkingSpot = await Parking.findById(reserva.parkingSpot);
    if (parkingSpot) {
      parkingSpot.status = 'enabled';
      await parkingSpot.save();
      console.log(
        `Estacionamiento con ID ${parkingSpot._id} habilitado nuevamente.`
      );
    } else {
      console.warn(
        `Estacionamiento asociado a la reserva con ID ${reserva._id} no encontrado.`
      );
    }
  } catch (error) {
    console.error(
      `Error al penalizar al usuario ${usuario.UserName}:`,
      error
    );
  }
};


const penalizarUsuarios = async () => {
  try {
    // llama funcion para conexión con base de datos :)
    await run();

    const ahora = new Date();

    // Buscar reservas expiradas que no hayan sido penalizadas :)
    const reservasExpiradas = await Reserva.find({
      status: 'expired',
      penalizado: { $ne: true },
    });

    console.log(
      `Encontradas ${reservasExpiradas.length} reservas expiradas para penalizar.`
    );

    // Procesar cada reserva expirada :)
    for (const reserva of reservasExpiradas) {
      console.log(`Procesando reserva con ID ${reserva._id}...`);

      const usuario = await User.findById(reserva.id_usuario);
      if (!usuario) {
        console.error(
          `Usuario con ID ${reserva.id_usuario} no encontrado.`
        );
        continue;
      }

      // Aqui se llama la funcion para penalizar al usuario y habilitar el estacionamiento :)
      await penalizarUsuario(usuario, reserva, ahora);
    }

    console.log('Proceso de penalización completado.');
  } catch (error) {
    console.error('Error en el proceso de penalización:', error);
  }
};

export default penalizarUsuarios;
