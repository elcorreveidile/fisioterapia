import { NextResponse } from 'next/server';
import { db } from '@/db';
import { services } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const serviceSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  duration: z.number().min(15),
  price: z.number().min(0),
});

// PUT - Actualizar servicio
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);
    const body = await request.json();
    const validated = serviceSchema.parse(body);

    // Generar nuevo slug si el nombre cambió
    const slug = validated.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const [updatedService] = await db
      .update(services)
      .set(validated)
      .where(eq(services.id, parsedId))
      .returning();

    if (!updatedService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error('Error updating service:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error updating service' }, { status: 500 });
  }
}

// DELETE - Eliminar servicio
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const parsedId = parseInt(id);

    const [deletedService] = await db
      .delete(services)
      .where(eq(services.id, parsedId))
      .returning();

    if (!deletedService) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Service deleted successfully' });
  } catch (error) {
    console.error('Error deleting service:', error);
    return NextResponse.json({ error: 'Error deleting service' }, { status: 500 });
  }
}
