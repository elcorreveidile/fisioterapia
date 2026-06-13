import { NextResponse } from 'next/server';
import { auth } from '@/auth/auth';
import { db } from '@/db';
import { scheduledEmails } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST - Reintentar envío de email
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const emailId = parseInt(id);

    if (isNaN(emailId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    // Reset error and sent status for retry
    const [updated] = await db
      .update(scheduledEmails)
      .set({
        sent: false,
        sentAt: null,
        error: null,
      })
      .where(eq(scheduledEmails.id, emailId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Email no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Email reprogramado para envío' });
  } catch (error) {
    console.error('Error al reintentar email:', error);
    return NextResponse.json({ error: 'Error al reintentar email' }, { status: 500 });
  }
}

// PATCH - Marcar como enviado (envío simulado: no hay proveedor de email)
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
    const emailId = parseInt(id);
    if (isNaN(emailId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const [updated] = await db
      .update(scheduledEmails)
      .set({ sent: true, sentAt: new Date(), error: null })
      .where(eq(scheduledEmails.id, emailId))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Email no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Email marcado como enviado' });
  } catch (error) {
    console.error('Error al marcar email:', error);
    return NextResponse.json({ error: 'Error al marcar email' }, { status: 500 });
  }
}

// DELETE - Eliminar email programado
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
    const emailId = parseInt(id);

    if (isNaN(emailId)) {
      return NextResponse.json({ error: 'ID inválido' }, { status: 400 });
    }

    const [deleted] = await db
      .delete(scheduledEmails)
      .where(eq(scheduledEmails.id, emailId))
      .returning();

    if (!deleted) {
      return NextResponse.json({ error: 'Email no encontrado' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Email eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar email:', error);
    return NextResponse.json({ error: 'Error al eliminar email' }, { status: 500 });
  }
}
