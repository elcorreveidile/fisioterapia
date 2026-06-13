import { NextResponse } from 'next/server';
import { auth } from '@/auth/auth';
import { db } from '@/db';
import { vouchers } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { z } from 'zod';

const patchSchema = z.object({
  add: z.number().int().positive(),
});

// PATCH - Añadir sesiones a un bono
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
    const voucherId = parseInt(id);
    if (isNaN(voucherId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const body = await request.json();
    const { add } = patchSchema.parse(body);

    const [updated] = await db
      .update(vouchers)
      .set({ sessionsRemaining: sql`${vouchers.sessionsRemaining} + ${add}` })
      .where(eq(vouchers.id, voucherId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Bono no encontrado' }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error al actualizar bono:', error);
    return NextResponse.json({ error: 'Error al actualizar bono' }, { status: 500 });
  }
}
