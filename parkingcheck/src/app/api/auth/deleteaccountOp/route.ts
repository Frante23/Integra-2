import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { run } from '@/libs/mongodb';
import Operario from '@/models/operarios';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {

    const { OperatorPass } = await req.json();


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


    await run();


    const operario = await Operario.findById(operarioId);
    if (!operario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(OperatorPass, operario.OperatorPass);
    if (!isMatch) {
      return NextResponse.json({ error: 'La contraseña actual es incorrecta' }, { status: 401 });
    }

    await Operario.deleteOne({ _id: operarioId });

    return NextResponse.json(
        {
          message: 'Cuenta eliminada correctamente',
          redirectUrl: '/',
        },
        { status: 200 }
      );
  } catch (error) {
    console.error('Error al eliminar la cuenta:', error); 
    console.log(error)
    return NextResponse.json({ message: 'Error interno del servidor' }, { status: 500 });
  }
}
