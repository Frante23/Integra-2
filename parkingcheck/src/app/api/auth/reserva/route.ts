import { NextApiRequest, NextApiResponse } from 'next';
import Reserva from '@/models/reserva';
import Parking from '@/models/parking';
import User from '@/models/users';
import Operario from '@/models/operarios';
import Notificacion from '@/models/notificaciones';
import transporter from '@/utils/GmailRes';
import { run } from '@/libs/mongodb';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  // Conectar a la base de datos
  await run();

  const { parkingId, userId, fechaReserva } = req.body;

  // Validar parámetros
  if (!parkingId || !userId || !fechaReserva) {
    return res.status(400).json({ success: false, message: 'Parámetros faltantes' });
  }

  try {
    // Buscar al usuario
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Usuario no encontrado' });
    }

    // Verificar penalización del usuario
    if (user.penalizadoHasta && user.penalizadoHasta > new Date()) {
      return res.status(403).json({
        success: false,
        message: `Usuario penalizado hasta ${user.penalizadoHasta.toLocaleString()}`,
      });
    }

    // Buscar el estacionamiento
    const parkingSpot = await Parking.findById(parkingId);
    if (!parkingSpot || parkingSpot.status !== 'enabled') {
      return res.status(400).json({ success: false, message: 'El estacionamiento no está disponible' });
    }

    // Detalles del estacionamiento
    const { section: seccion, number: numero } = parkingSpot;

    // Calcular fechas
    const fechaReservaUsuario = new Date(fechaReserva);
    const fechaVencimiento = new Date(fechaReservaUsuario.getTime() + 60 * 60 * 1000); // 1 hora después

    // Crear la reserva
    const nuevaReserva = new Reserva({
      seccion,
      numero,
      id_usuario: userId,
      fechaReserva: fechaReservaUsuario,
      fechaExpiracion: fechaVencimiento,
      status: 'active',
    });

    await nuevaReserva.save();

    // Actualizar estado del estacionamiento
    parkingSpot.status = 'disabled';
    await parkingSpot.save();

    // Enviar correo al usuario
    const subjectUser = 'Confirmación de Reserva de Estacionamiento';
    const messageUser = `Estimado usuario ${user.UserName},\n\nTu reserva para el estacionamiento en la sección ${seccion}, número ${numero}, ha sido confirmada para la fecha ${fechaReservaUsuario}.\n\nLa reserva vencerá a las ${fechaVencimiento.toLocaleString()} si no llegas al lugar.\n\nSaludos,\nEquipo de Estacionamientos.`;

    try {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: user.UserEmail,
        subject: subjectUser,
        text: messageUser,
      });
    } catch (error) {
      console.error('Error al enviar el correo al usuario:', error);
    }

    // Guardar notificación para el usuario
    const notificacionUsuario = new Notificacion({
      user: userId,
      tipo: 'Reserva',
      mensaje: `Reserva para el estacionamiento en la sección ${seccion}, número ${numero}.`,
      fechaEnvio: new Date(),
      nombreUsuario: user.UserName,
      horaReserva: fechaReservaUsuario,
      estadoReserva: nuevaReserva.status,
      detallesReserva: {
        seccion,
        numero,
      },
      fechaExpiracion: fechaVencimiento,
    });

    await notificacionUsuario.save();

    // Notificar a los operarios
    const operarios = await Operario.find();
    if (operarios && operarios.length > 0) {
      const subjectOperario = 'Nueva Reserva Creada';
      const messageOperario = `Estimado Operario,\n\nEl usuario ${user.UserName} ha creado una reserva en la sección ${seccion}, número ${numero}, a la hora ${fechaReservaUsuario}.\n\nSaludos,\nSistema de Estacionamientos.`;

      for (const operario of operarios) {
        try {
          await transporter.sendMail({
            from: process.env.GMAIL_USER,
            to: operario.OperatorEmail,
            subject: subjectOperario,
            text: messageOperario,
          });
        } catch (error) {
          console.error(`Error al enviar el correo al operario ${operario.OperatorName}:`, error);
        }
      }
    }

    // Respuesta exitosa
    return res.status(201).json({
      success: true,
      message: 'Reserva creada, correos y notificaciones enviadas correctamente',
      reserva: nuevaReserva,
      parkingSpot,
    });
  } catch (error) {
    console.error('Error al crear la reserva:', error);
    return res.status(500).json({ success: false, message: 'Error al crear la reserva' });
  }
}
