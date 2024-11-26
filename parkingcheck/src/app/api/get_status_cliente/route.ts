import { NextRequest, NextResponse } from "next/server";
import { run } from "@/libs/mongodb";
import Reserva from "@/models/reserva";

export async function GET(req: NextRequest) {
  try {

    await run();

    const reservas = await Reserva.find();

    return NextResponse.json(reservas, { status: 200 });
  } catch (error) {
    console.error("Error al obtener las reservas:", error);
    return NextResponse.json({ message: "Error al obtener las reservas" }, { status: 500 });
  }
}
