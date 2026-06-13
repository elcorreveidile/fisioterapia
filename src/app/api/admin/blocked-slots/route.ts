import { NextResponse } from 'next/server';
import { auth } from '@/auth/auth';
import { db } from '@/db';
import { blockedSlots } from '@/db/schema';
import { eq, gte } from 'drizzle-orm';
import { z } from 'zod';

const blockedSlotSchema = z.object({
  professionalId: z.number().int().positive(),
  start: z.string().datetime(),
  end: z.string().datetime(),
  reason: z.string().optional(),
});

// GET - Obtener huecos bloqueados
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const professionalId = searchParams.get('professionalId');

    let slots;
    if (professionalId) {
      // Solo huecos futuros de este profesional
      const now = new Date();
      slots = await db
        .select()
        .from(blockedSlots)
        .where(eq(blockedSlots.professionalId, parseInt(professionalId)))
        .orderBy(blockedSlots.start);

      // Filtrar solo futuros manualmente
      slots = slots.filter(slot => new Date(slot.start) >= now);
    } else {
      // Todos los huecos futuros
      const now = new Date();
      slots = await db
        .select()
        .from(blockedSlots)
        .orderBy(blockedSlots.start);
      slots = slots.filter(slot => new Date(slot.start) >= now);
    }

    return NextResponse.json(slots);
  } catch (error) {
    console.error('Error al obtener huecos bloqueados:', error);
    return NextResponse.json({ error: 'Error al obtener huecos bloqueados' }, { status: 500 });
  }
}

// POST - Crear nuevo hueco bloqueado
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validated = blockedSlotSchema.parse(body);

    const startDate = new Date(validated.start);
    const endDate = new Date(validated.end);

    // Validar fechas
    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'La fecha de fin debe ser posterior a la fecha de inicio' },
        { status: 400 }
      );
    }

    // Validar que sea en el futuro
    if (startDate < new Date()) {
      return NextResponse.json(
        { error: 'No se pueden bloquear huecos en el pasado' },
        { status: 400 }
      );
    }

    const [newSlot] = await db
      .insert(blockedSlots)
      .values({
        professionalId: validated.professionalId,
        start: startDate,
        end: endDate,
        reason: validated.reason || null,
      })
      .returning();

    return NextResponse.json(newSlot, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    console.error('Error al crear hueco bloqueado:', error);
    return NextResponse.json({ error: 'Error al crear hueco bloqueado' }, { status: 500 });
  }
}

// PUT - Actualizar hueco bloqueado
export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, ...updateData } = body;
    const validated = blockedSlotSchema.parse(updateData);

    const startDate = new Date(validated.start);
    const endDate = new Date(validated.end);

    if (endDate <= startDate) {
      return NextResponse.json(
        { error: 'La fecha de fin debe ser posterior a la fecha de inicio' },
        { status: 400 }
      );
    }

    const [updated] = await db
      .update(blockedSlots)
      .set({
        professionalId: validated.professionalId,
        start: startDate,
        end: endDate,
        reason: validated.reason || null,
      })
      .where(eq(blockedSlots.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Hueco no encontrado' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    console.error('Error al actualizar hueco bloqueado:', error);
    return NextResponse.json({ error: 'Error al actualizar hueco bloqueado' }, { status: 500 });
  }
}
