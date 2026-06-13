import { NextResponse } from 'next/server';
import { auth } from '@/auth/auth';
import { db } from '@/db';
import { bookings, services } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const createSchema = z.object({
  patientId: z.number().int().positive(),
  professionalId: z.number().int().positive(),
  serviceId: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^\d{2}:\d{2}$/),
});

// POST - Crear una cita manualmente desde el panel
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const data = createSchema.parse(body);

    const [service] = await db
      .select({ duration: services.duration })
      .from(services)
      .where(eq(services.id, data.serviceId));
    if (!service) {
      return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 400 });
    }

    const start = new Date(`${data.date}T${data.time}:00`);
    if (isNaN(start.getTime())) {
      return NextResponse.json({ error: 'Fecha u hora inválida' }, { status: 400 });
    }
    const end = new Date(start.getTime() + service.duration * 60 * 1000);

    const [created] = await db
      .insert(bookings)
      .values({
        patientId: data.patientId,
        professionalId: data.professionalId,
        serviceId: data.serviceId,
        start,
        end,
        status: 'confirmed',
        cancellationToken: randomUUID(),
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
    console.error('Error al crear cita:', error);
    return NextResponse.json({ error: 'Error al crear cita' }, { status: 500 });
  }
}
