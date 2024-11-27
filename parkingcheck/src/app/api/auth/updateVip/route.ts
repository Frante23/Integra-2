import { NextResponse } from "next/server";
import { run } from "@/libs/mongodb";
import SolicitudVip from "@/models/SolicitudVip";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { id, action } = body;

        // Validación de parámetros
        if (!id || !action || !["solucionado", "rechazado"].includes(action)) {
            return NextResponse.json({ error: "Parámetros inválidos o incompletos" }, { status: 400 });
        }

        await run();

        // Buscar y eliminar la solicitud
        const deletedRequest = await SolicitudVip.findByIdAndDelete(id);

        if (!deletedRequest) {
            return NextResponse.json({ error: "Solicitud no encontrada" }, { status: 404 });
        }

        // Respuesta adecuada según la acción
        const message =
            action === "solucionado"
                ? "Solicitud aprobada y eliminada con éxito."
                : "Solicitud rechazada y eliminada con éxito.";

        return NextResponse.json({ message }, { status: 200 });
    } catch (error: any) {
        console.error("Error en el servidor:", error.message);
        return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
    }
}
