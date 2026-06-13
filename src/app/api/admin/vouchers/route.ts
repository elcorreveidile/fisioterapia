import { NextResponse } from 'next/server';
import { auth } from '@/auth/auth';
import { db } from '@/db';
import { vouchers } from '@/db/schema';
import { z } from 'zod';

const createSchema = z.object({
  patientId: z.number().int().positive(),
  type: z.enum(['5', '10']),
  sessionsRemaining: z.number().int().positive().optional(),
  notes: z.string().optional(),
});

// POST - Crear un bono
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const data = createSchema.parse(body);

    const total = data.type === '5' ? 5 : 10;
    // Caducidad por defecto: 1 año desde hoy
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);

    const [created] = await db
      .insert(vouchers)
      .values({
        patientId: data.patientId,
        type: data.type,
        sessionsRemaining: data.sessionsRemaining ?? total,
        expirationDate,
        notes: data.notes || null,
        demo: true,
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error al crear bono:', error);
    return NextResponse.json({ error: 'Error al crear bono' }, { status: 500 });
  }
}
