import { NextResponse } from 'next/server';
import { db } from '@/db';
import { exercises } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const exerciseSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable(),
  category: z.string().nullable(),
  imageUrl: z.string().nullable(),
  videoUrl: z.string().nullable(),
});

// PUT - Actualizar ejercicio
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    const body = await request.json();
    const validated = exerciseSchema.parse(body);

    const [updatedExercise] = await db
      .update(exercises)
      .set(validated)
      .where(eq(exercises.id, parsedId))
      .returning();

    if (!updatedExercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    return NextResponse.json(updatedExercise);
  } catch (error) {
    console.error('Error updating exercise:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error updating exercise' }, { status: 500 });
  }
}

// DELETE - Eliminar ejercicio
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);

    const [deletedExercise] = await db
      .delete(exercises)
      .where(eq(exercises.id, parsedId))
      .returning();

    if (!deletedExercise) {
      return NextResponse.json({ error: 'Exercise not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    return NextResponse.json({ error: 'Error deleting exercise' }, { status: 500 });
  }
}
