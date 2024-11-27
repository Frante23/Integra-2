import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import Reserva from "@/models/reserva";
import Parking from "@/models/parking";
import User from "@/models/users";
import Operario from "@/models/operarios";
import Notificacion from "@/models/notificaciones";
import transporter from "@/utils/GmailRes";
import { run } from "@/libs/mongodb";



export async function POST(req: Request) {
  try {
    run();
    const  galleta  = cookies();
    const token = galleta?.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Token faltante o inválido" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET!;
    const decoded = verify(token, secret) as { userId: string };

    const data = await req.json();
    const parkingId = data.Park;
    const [Section, number] = parkingId.split("-");
    
    console.log(parkingId)



    // Validar datos de entrada
    if (!parkingId ) {
      return NextResponse.json({ success: false, message: "Parámetros faltantes parking" }, { status: 400 });
    }

    // Buscar usuario
    const user = await User.findById(decoded.userId);
    if (!user) {
      return NextResponse.json({ success: false, message: "Usuario no encontrado" }, { status: 404 });
    }

    if (user.penalizadoHasta && new Date(user.penalizadoHasta) > new Date()) {
      return NextResponse.json({
        success: false,
        message: `Usuario penalizado hasta ${new Date(user.penalizadoHasta).toLocaleString()}`,
      }, { status: 403 });
    }

    // Buscar el estacionamiento
    const parkingSpot = await Parking.findOne({
      section: Section,
      number: number,
    });
    if (!parkingSpot || parkingSpot.status !== "disabled") {
      return NextResponse.json({ success: false, message: "El estacionamiento no está disponible" }, { status: 400 });
    }

    const { section: seccion, number: numero } = parkingSpot;
    const fechaReserva = "2024-10-22T18:30:00Z";
    // Crear reserva
    const fechaReservaUsuario = new Date(fechaReserva);
    const fechaVencimiento = new Date(fechaReservaUsuario.getTime() + 60 * 60 * 1000);

    const nuevaReserva = new Reserva({
      seccion,
      numero,
      id_usuario: user._id,
      fechaReserva: fechaReservaUsuario,
      fechaExpiracion: fechaVencimiento,
      status: "active",
    });

    await nuevaReserva.save();

    // Actualizar estado del estacionamiento
    parkingSpot.status = "enabled";
    await parkingSpot.save();

    // Enviar correo al usuario
    try {
      await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: user.UserEmail,
        subject: "Confirmación de Reserva de Estacionamiento",
        text: `Estimado ${user.UserName},\n\nTu reserva para el estacionamiento en la sección ${seccion}, número ${numero}, ha sido confirmada.\n\nLa reserva vence el ${fechaVencimiento.toLocaleString()}.\n\nGracias por preferirnos.`,
      });
    } catch (error) {
      console.error("Error al enviar correo al usuario:", error);
    }

    // Crear notificación
    const notificacionUsuario = new Notificacion({
      user: user._id,
      tipo: "Reserva",
      mensaje: `Reserva creada en sección ${seccion}, número ${numero}.`,
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
    for (const operario of operarios) {
      try {
        await transporter.sendMail({
          from: process.env.GMAIL_USER,
          to: operario.OperatorEmail,
          subject: "Nueva Reserva Creada",
          text: `El usuario ${user.UserName} ha creado una reserva en la sección ${seccion}, número ${numero}.`,
        });
      } catch (error) {
        console.error(`Error al notificar a ${operario.OperatorName}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Reserva creada, correos y notificaciones enviadas correctamente",
      reserva: nuevaReserva,
      parkingSpot,
    }, { status: 201 });

  } catch (error) {
    console.error("Error en el servidor:", error);
    return NextResponse.json({ success: false, message: "Error interno del servidor" }, { status: 500 });
  }
}
