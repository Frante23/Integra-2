import { NextRequest, NextResponse } from "next/server"; 
import { verify } from "jsonwebtoken";
import { cookies } from "next/headers";
import { run } from '@/libs/mongodb';
import Parking from '@/models/parking';

export async function POST(req: NextRequest) {
    try {

        const galleta = cookies();
        const token = galleta.get("token")?.value;

        if (!token) {
            return NextResponse.json({ message: "Token missing or invalid" }, { status: 401 });
        }

        const secret = process.env.JWT_SECRET;
        const user = verify(token, secret) as { userId: string };
        const id = user.userId;


        const data = await req.json();
        const park = data.Park;

        if (!park) {
            return NextResponse.json({ message: "Park data is missing" }, { status: 400 });
        }

        const [Section, numero] = park.split("-");
        if (!Section || !numero) {
            return NextResponse.json({ message: "Invalid park format" }, { status: 400 });
        }


        await run();

        const est = await Parking.findOne({
            section: Section,
            number: numero,
        });

        if (!est) {
            return NextResponse.json({ message: "Parking spot not found" }, { status: 404 });
        }

        // Verificar si ya está ocupado
        if (est.status === 'enabled' && est.occupiedBy !== id) {
            return NextResponse.json({ message: "Parking spot is already occupied", status: "occupied" }, { status: 400 });
        }

        // Establecer el estado de ocupación
        const ocupado = {
            status: 'enabled',
            occupiedBy: id,
        };

        const id_park = est._id;
        const new_park = await Parking.findByIdAndUpdate(id_park, ocupado, { new: true });
        
        console.log(new_park);

        if (!new_park) {
            return NextResponse.json({ message: "Parking spot not updated", status: "error" }, { status: 400 });
        }

        return NextResponse.json({ message: "Estacionamiento reservado", park: new_park, userId: id });
    } catch (error) {
        console.error("Error reserving parking spot:", error);
        return NextResponse.json({ message: "An error occurred" }, { status: 500 });
    }
}
