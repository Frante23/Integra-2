import { NextResponse } from "next/server";
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import Reserva from "@/models/reserva";
import { run } from "@/libs/mongodb";


export async function POST(){
    try {
        run();

        const secret = process.env.JWT_SECRET!;
        const usuario = "6746685bcf5e388ca2c8b19d"
        
        const reserva = await Reserva.findOneAndUpdate({
            id_usuario : usuario,
            status: "active"
        },{status : "cancelled"}, {new: true} )
        console.log(reserva)
        return NextResponse.json('ula')

    }
    catch(error){
        console.error("Error en reservar", error)
    } 
}
