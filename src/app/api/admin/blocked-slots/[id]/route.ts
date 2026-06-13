import { NextResponse } from 'next/server';
import { auth } from '@/auth/auth';
import { db } from '@/db';
import { blockedSlots } from '@/db/schema';
import { eq } from 'drizzle-orm';

// DELETE - Eliminar hueco bloqueado
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
    const slotId = parseInt(id);

    if (isNaN(slotId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const [deleted] = await db
      .delete(blockedSlots)
      .where(eq(blockedSlots.id, slotId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Hueco no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Hueco eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar hueco bloqueado:', error);
    return NextResponse.json({ error: 'Error al eliminar hueco bloqueado' }, { status: 500 });
  }
}
