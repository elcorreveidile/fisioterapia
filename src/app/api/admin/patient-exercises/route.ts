import { NextResponse } from 'next/server';
import { auth } from '@/auth/auth';
import { db } from '@/db';
import { patientExercises } from '@/db/schema';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const assignSchema = z.object({
  patientId: z.number().int().positive(),
  professionalId: z.number().int().positive(),
  items: z
    .array(
      z.object({
        exerciseId: z.number().int().positive(),
        series: z.number().int().positive(),
        repetitions: z.string().min(1),
        frequency: z.string().min(1),
        observations: z.string().optional(),
      })
    )
    .min(1),
});

// POST - Asignar una pauta (varios ejercicios bajo un token compartido)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const data = assignSchema.parse(body);

    // Un único token para toda la pauta: la página /pauta/[token] mostrará
    // todos los ejercicios que lo comparten.
    const token = randomUUID();

    await db.insert(patientExercises).values(
      data.items.map((item) => ({
        patientId: data.patientId,
        professionalId: data.professionalId,
        exerciseId: item.exerciseId,
        series: item.series,
        repetitions: item.repetitions,
        frequency: item.frequency,
        observations: item.observations || null,
        token,
        active: true,
      }))
    );

    return NextResponse.json(
      { token, url: `/pauta/${token}`, count: data.items.length },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error al asignar pauta:', error);
    return NextResponse.json({ error: 'Error al asignar pauta' }, { status: 500 });
  }
}
