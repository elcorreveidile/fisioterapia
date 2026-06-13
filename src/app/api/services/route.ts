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
  category: z.string().min(1),
  whatYouGet: z.string().optional(),
});

// GET - Obtener todos los servicios
export async function GET() {
  try {
    const allServices = await db.select().from(services).orderBy(services.name);
    return NextResponse.json(allServices);
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Error fetching services' }, { status: 500 });
  }
}

// POST - Crear nuevo servicio
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validated = serviceSchema.parse(body);

    // Generar slug desde el nombre
    const slug = validated.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const [newService] = await db
      .insert(services)
      .values(validated)
      .returning();

    return NextResponse.json(newService, { status: 201 });
  } catch (error) {
    console.error('Error creating service:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error creating service' }, { status: 500 });
  }
}
