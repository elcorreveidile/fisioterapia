import { NextResponse } from 'next/server';
import { auth } from '@/auth/auth';
import { db } from '@/db';
import { availabilityRules } from '@/db/schema';
import { eq } from 'drizzle-orm';

// DELETE - Eliminar regla de disponibilidad
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
    const ruleId = parseInt(id);

    if (isNaN(ruleId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const [deleted] = await db
      .delete(availabilityRules)
      .where(eq(availabilityRules.id, ruleId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Regla no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Regla eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar disponibilidad:', error);
    return NextResponse.json({ error: 'Error al eliminar disponibilidad' }, { status: 500 });
  }
}
