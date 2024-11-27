import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import Reserva from "@/models/reserva";
import Parking from "@/models/parking";
import Operario from "@/models/operarios";
import { run } from "@/libs/mongodb";

export async function POST(req: Request) {
  try {
    run();
    const galleta = cookies();
    const token = galleta?.get("token")?.value;

    if (!token) {
      return NextResponse.json({ message: "Token faltante o inválido" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET!;
    const decoded = verify(token, secret) as { operarioId: string };

    // Verificar si el token pertenece a un operario
    const operario = await Operario.findById(decoded.operarioId);
    if (!operario) {
      return NextResponse.json({ message: "No autorizado" }, { status: 403 });
    }

    const data = await req.json();
    const { parkingId } = data; // Ejemplo: "A-1"

    if (!parkingId) {
      return NextResponse.json({ message: "ID del estacionamiento faltante" }, { status: 400 });
    }

    // Actualizar el estado del estacionamiento
    const estacionamiento = await Parking.findOne({
      section: parkingId.split("-")[0],
      number: parkingId.split("-")[1],
    });

    if (estacionamiento) {
      estacionamiento.status = "enabled";
      await estacionamiento.save();
    }

    return NextResponse.json({ message: "Reserva marcada como ocupada con éxito", success: true }, { status: 200 });
  } catch (error) {
    console.error("Error en el servidor:", error);
    return NextResponse.json({ message: "Error interno del servidor", success: false }, { status: 500 });
  }
}
