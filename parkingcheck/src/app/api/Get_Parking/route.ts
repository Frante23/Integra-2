import Parking from "@/models/parking";
import User from "@/models/users"; 
import { run } from "@/libs/mongodb";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  await run();

  // Obtenemos todos los estacionamientos con estado "enabled"
  const All_park = await Parking.find({ status: "enabled" });
  console.log("Estacionamientos encontrados:", All_park); // Log de todos los estacionamientos

  // Recorremos cada estacionamiento y buscamos el usuario asociado
  const estacionamientos = await Promise.all(
    All_park.map(async (park) => {
      console.log(`Consultando estacionamiento ${park.section}-${park.number}, occupiedBy: ${park.occupiedBy}`);

      let user = null;

      if (park.occupiedBy) {
        if (!mongoose.isValidObjectId(park.occupiedBy)) {
          console.error(`El valor de occupiedBy no es un ObjectId válido: ${park.occupiedBy}`);
        } else {
          try {
            const objectId = mongoose.Types.ObjectId(park.occupiedBy);
            user = await User.findById(objectId).lean();
            console.log(`Usuario encontrado para ${park.section}-${park.number}:`, user);
          } catch (error) {
            console.error(`Error buscando usuario para ${park.section}-${park.number}:`, error);
          }
        }
      } else {
        console.log(`No hay usuario asociado a ${park.section}-${park.number}`);
      }

      return {
        section: park.section,
        number: park.number,
        status: park.status,
        userName: user ? user.UserName : "Libre",
        isVip: user ? user.vip : false,
      };
    })
  );

  console.log("Estacionamientos procesados:", estacionamientos);

  return NextResponse.json({ estacionamientos });
}
