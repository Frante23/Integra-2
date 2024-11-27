import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import Reserva from "@/models/reserva";
import { run } from "@/libs/mongodb";


export async function POST(){
    try {
        await run()
        const galleta = cookies();
        const token = galleta?.get("token")?.value;
    
        if (!token) {
          return NextResponse.json({ message: "Token faltante o inválido" }, { status: 401 });
        }
    
        const secret = process.env.JWT_SECRET!;
        const usuario = verify(token, secret) as { userId: string };
        
        const reserva = await Reserva.findOneAndUpdate({
            id_usuario : usuario.userId,
            status: "active"
        },{status : "cancelled"}, {new: true} )
        console.log(reserva)
        return NextResponse.json('ula')

    }
    catch(error){
        console.error("Error en cancelar", error)
    } 
}
