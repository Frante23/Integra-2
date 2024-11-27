import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import User from '@/models/users';
import Operario from '@/models/operarios';
import Notificacion from '@/models/SolicitudVip';
import transporter from '@/utils/GmailRes';
import { run } from '@/libs/mongodb';

export async function POST(req: Request) {
  await run();

  try {
    // Obtener cookies
    const galleta = cookies();
    const token = galleta.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'Token faltante o inválido' },
        { status: 401 }
      );
    }

    // Verificar y decodificar el token
    const secret = process.env.JWT_SECRET!;
    const decoded = verify(token, secret) as { userId: string };

    const userId = decoded.userId;
    const { servicio } = await req.json();

    if (!servicio) {
      return NextResponse.json(
        { success: false, message: 'Falta el servicio solicitado' },
        { status: 400 }
      );
    }

    // Buscar al usuario en la base de datos
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el usuario es VIP
    if (!user.vip) {
      return NextResponse.json(
        { success: false, message: 'El usuario no tiene acceso a este servicio' },
        { status: 403 }
      );
    }

    // Crear una notificación para el servicio solicitado
    const nuevaNotificacion = new Notificacion({
      user: userId,
      tipo: 'solicitud',
      servicio,
      mensaje: `El usuario VIP ${user.UserName} ha solicitado el servicio: ${servicio}`,
      fechaEnvio: new Date(),
      nombreUsuario: user.UserName,
    });

    await nuevaNotificacion.save();

    // Buscar todos los operarios
    const operarios = await Operario.find({});
    if (operarios.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No hay operarios disponibles' },
        { status: 404 }
      );
    }

    // Enviar un correo a todos los operarios
    const subject = 'Solicitud de servicio VIP';
    const message = nuevaNotificacion.mensaje;

    try {
      for (const operario of operarios) {
        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: operario.OperatorEmail,
          subject,
          text: message,
        });
      }

      return NextResponse.json(
        {
          success: true,
          message: 'Solicitud enviada y notificación creada correctamente',
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error al enviar el correo:', error);
      return NextResponse.json(
        { success: false, message: 'Error al enviar el correo a los operarios' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    return NextResponse.json(
      { success: false, message: 'Error en el servidor' },
      { status: 500 }
    );
  }
}
