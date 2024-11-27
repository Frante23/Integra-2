import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { run } from '@/libs/mongodb';
import Operario from '@/models/operarios';
import jwt from 'jsonwebtoken';
import { cookies } from "next/headers";

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

    const { NewPass } = await req.json();


    if (!NewPass) {
      return NextResponse.json({ message: 'La nueva contraseña es requerida' }, { status: 400 });
    }

    await run();

    const user = await Operario.findById(operarioId);
    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const hashedPassword = await bcrypt.hash(NewPass, 10);
    user.OperatorPass = hashedPassword;
    await user.save();

    return NextResponse.json({ message: 'Contraseña actualizada correctamente' }, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error);
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
