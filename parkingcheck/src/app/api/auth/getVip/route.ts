import { NextRequest, NextResponse } from "next/server"; 
import { run } from '@/libs/mongodb';
import SolicitudVip from '@/models/SolicitudVip'; // Modelo correcto para SolicitudVip

export async function GET(req: NextRequest) {
    try {
        const vipRequests = await getVipRequests();
        console.log("VIP Requests fetched from database: ", vipRequests);
        
        return NextResponse.json({ vipRequests });
    } catch (error) {
        console.error("Error fetching VIP requests: ", error);
        return new NextResponse("Error fetching VIP requests", { status: 500 });
    }
}

export async function getVipRequests() {
  try {
      await run(); // Asegúrate de que `run` establece la conexión con la base de datos
      
      // Filtra las solicitudes que tienen el campo 'servicio' definido y no vacío
      const vipRequests = await SolicitudVip.find({ servicio: { $exists: true, $ne: "" } }); 
      
      return vipRequests;
  } catch (error) {
      console.error("Error al obtener solicitudes VIP:", error);
      throw new Error("Error al obtener solicitudes VIP");
  }
}

