import { NextResponse } from 'next/server';
import { auth } from '@/auth/auth';
import { db } from '@/db';
import { availabilityRules } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const availabilitySchema = z.object({
  professionalId: z.number().int().positive(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/,
    { message: 'Formato debe ser HH:MM' }
  ),
  endTime: z.string().regex(/^\d{2}:\d{2}$/,
    { message: 'Formato debe ser HH:MM' }
  ),
});

// GET - Obtener todas las reglas de disponibilidad
export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const allRules = await db.select().from(availabilityRules).orderBy(availabilityRules.dayOfWeek);
    return NextResponse.json(allRules);
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error);
    return NextResponse.json({ error: 'Error al obtener disponibilidad' }, { status: 500 });
  }
}

// POST - Crear nueva regla de disponibilidad
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validated = availabilitySchema.parse(body);

    // Validar que endTime > startTime
    const [startHour, startMin] = validated.startTime.split(':').map(Number);
    const [endHour, endMin] = validated.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      return NextResponse.json(
        { error: 'La hora de fin debe ser posterior a la hora de inicio' },
        { status: 400 }
      );
    }

    const [newRule] = await db
      .insert(availabilityRules)
      .values({
        professionalId: validated.professionalId,
        dayOfWeek: validated.dayOfWeek,
        startTime: validated.startTime,
        endTime: validated.endTime,
        active: true,
      })
      .returning();

    return NextResponse.json(newRule, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    console.error('Error al crear disponibilidad:', error);
    return NextResponse.json({ error: 'Error al crear disponibilidad' }, { status: 500 });
  }
}

// PUT - Actualizar regla de disponibilidad
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;
    const validated = availabilitySchema.parse(updateData);

    const [startHour, startMin] = validated.startTime.split(':').map(Number);
    const [endHour, endMin] = validated.endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    if (endMinutes <= startMinutes) {
      return NextResponse.json(
        { error: 'La hora de fin debe ser posterior a la hora de inicio' },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(availabilityRules)
      .set({
        professionalId: validated.professionalId,
        dayOfWeek: validated.dayOfWeek,
        startTime: validated.startTime,
        endTime: validated.endTime,
      })
      .where(eq(availabilityRules.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Regla no encontrada' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    console.error('Error al actualizar disponibilidad:', error);
    return NextResponse.json({ error: 'Error al actualizar disponibilidad' }, { status: 500 });
  }
}
