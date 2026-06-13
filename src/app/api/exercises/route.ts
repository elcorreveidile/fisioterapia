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

// GET - Obtener todos los ejercicios
export async function GET() {
  try {
    const allExercises = await db.select().from(exercises).orderBy(exercises.title);
    return NextResponse.json(allExercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json({ error: 'Error fetching exercises' }, { status: 500 });
  }
}

// POST - Crear nuevo ejercicio
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = exerciseSchema.parse(body);

    const [newExercise] = await db
      .insert(exercises)
      .values(validated)
      .returning();

    return NextResponse.json(newExercise, { status: 201 });
  } catch (error) {
    console.error('Error creating exercise:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error creating exercise' }, { status: 500 });
  }
}
