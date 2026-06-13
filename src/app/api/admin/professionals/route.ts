import { NextResponse } from 'next/server';
import { auth } from '@/auth/auth';
import { db } from '@/db';
import { professionals } from '@/db/schema';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const allProfessionals = await db.select().from(professionals).orderBy(professionals.name);
    return NextResponse.json(allProfessionals);
  } catch (error) {
    console.error('Error al obtener profesionales:', error);
    return NextResponse.json({ error: 'Error al obtener profesionales' }, { status: 500 });
  }
}
