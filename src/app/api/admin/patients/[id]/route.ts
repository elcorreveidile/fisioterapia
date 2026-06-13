import { NextResponse } from 'next/server';
import { auth } from '@/auth/auth';
import { db } from '@/db';
import {
  patients,
  bookings,
  vouchers,
  treatmentNotes,
  patientExercises,
  scheduledEmails,
} from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';

const updateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  generalNotes: z.string().optional(),
});

// PATCH - Actualizar datos de un paciente
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const patientId = parseInt(id);
    if (isNaN(patientId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const data = updateSchema.parse(body);

    const [updated] = await db
      .update(patients)
      .set({
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        generalNotes: data.generalNotes || null,
      })
      .where(eq(patients.id, patientId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error al actualizar paciente:', error);
    return NextResponse.json({ error: 'Error al actualizar paciente' }, { status: 500 });
  }
}

// DELETE - Eliminar un paciente y sus datos asociados
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const patientId = parseInt(id);
    if (isNaN(patientId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Borrado en orden para respetar las claves foráneas.
    const patientBookings = await db
      .select({ id: bookings.id })
      .from(bookings)
      .where(eq(bookings.patientId, patientId));
    const bookingIds = patientBookings.map((b) => b.id);

    if (bookingIds.length > 0) {
      await db.delete(scheduledEmails).where(inArray(scheduledEmails.bookingId, bookingIds));
    }
    await db.delete(treatmentNotes).where(eq(treatmentNotes.patientId, patientId));
    await db.delete(patientExercises).where(eq(patientExercises.patientId, patientId));
    await db.delete(bookings).where(eq(bookings.patientId, patientId));
    await db.delete(vouchers).where(eq(vouchers.patientId, patientId));

    const [deleted] = await db
      .delete(patients)
      .where(eq(patients.id, patientId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Paciente eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    return NextResponse.json({ error: 'Error al eliminar paciente' }, { status: 500 });
  }
}
