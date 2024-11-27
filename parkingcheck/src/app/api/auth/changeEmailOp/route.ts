import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import Operario from "@/models/operarios";
import { run } from '@/libs/mongodb';
import { cookies } from "next/headers";
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        const galleta = cookies();
        const token = galleta.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Token no encontrado' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        if (typeof decoded === 'string' || !('operarioId' in decoded)) {
            return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
        }

        const { operarioId } = decoded as { operarioId: string };
        const { NewEmail, OperatorPass } = await req.json();

        await run();

        const user = await Operario.findById(operarioId);
        if (!user) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        // Verifica la contraseña utilizando bcrypt
        const isPasswordValid = await bcrypt.compare(OperatorPass, user.OperatorPass);
        if (!isPasswordValid) {
            return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
        }

        user.OperatorEmail = NewEmail;
        await user.save();

        return NextResponse.json({ message: 'Email actualizado con éxito' });
    } catch (error) {
        console.error('Error en la actualización del email:', error); // Para depuración
        return NextResponse.json({ error: 'Algo salió mal' }, { status: 500 });
    }
}
