import { NextResponse } from 'next/server';
import { auth } from '@/auth/auth';
import { db } from '@/db';
import { patients, bookings, vouchers } from '@/db/schema';
import { eq, desc, or, sql, count } from 'drizzle-orm';
import { z } from 'zod';

const patientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
});

// GET - Obtener pacientes con búsqueda opcional
export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('search');

    let allPatients;

    if (searchTerm) {
      allPatients = await db
        .select({
          id: patients.id,
          name: patients.name,
          email: patients.email,
          phone: patients.phone,
          createdAt: patients.createdAt,
        })
        .from(patients)
        .where(
          or(
            sql`${patients.name} ILIKE ${`%${searchTerm}%`}`,
            sql`${patients.email} ILIKE ${`%${searchTerm}%`}`,
            sql`${patients.phone} ILIKE ${`%${searchTerm}%`}`
          )
        )
        .orderBy(desc(patients.createdAt));
    } else {
      allPatients = await db
        .select({
          id: patients.id,
          name: patients.name,
          email: patients.email,
          phone: patients.phone,
          createdAt: patients.createdAt,
        })
        .from(patients)
        .orderBy(desc(patients.createdAt));
    }

    // Para cada paciente, obtener estadísticas
    const patientsWithStats = await Promise.all(
      allPatients.map(async (patient) => {
        const [bookingsCount] = await db
          .select({ count: count() })
          .from(bookings)
          .where(eq(bookings.patientId, patient.id));

        const [activeVouchers] = await db
          .select({
            count: count(),
            total: sql<number>`coalesce(sum(${vouchers.sessionsRemaining}), 0)`
          })
          .from(vouchers)
          .where(eq(vouchers.patientId, patient.id));

        const [lastBooking] = await db
          .select({ start: bookings.start })
          .from(bookings)
          .where(eq(bookings.patientId, patient.id))
          .orderBy(desc(bookings.start))
          .limit(1);

        return {
          ...patient,
          bookingsCount: bookingsCount.count || 0,
          activeVouchers: activeVouchers.count || 0,
          remainingSessions: activeVouchers.total || 0,
          lastVisit: lastBooking?.start || null,
        };
      })
    );

    return NextResponse.json(patientsWithStats);
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    return NextResponse.json({ error: 'Error al obtener pacientes' }, { status: 500 });
  }
}

// POST - Crear nuevo paciente
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const validated = patientSchema.parse(body);

    const [newPatient] = await db
      .insert(patients)
      .values({
        name: validated.name,
        email: validated.email,
        phone: validated.phone || '',
        generalNotes: null,
        demo: true,
      })
      .returning();

    return NextResponse.json(newPatient, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Datos inválidos', details: error.issues }, { status: 400 });
    }
    console.error('Error al crear paciente:', error);
    return NextResponse.json({ error: 'Error al crear paciente' }, { status: 500 });
  }
}
