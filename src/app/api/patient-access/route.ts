import { NextResponse } from 'next/server';
import { db } from '@/db';
import { patients, verificationTokens } from '@/db/schema';
import { sql } from 'drizzle-orm';
import { z } from 'zod';
import { randomUUID } from 'crypto';
import { sendPatientAccessEmail } from '@/lib/email';

const schema = z.object({ email: z.string().email() });

// POST - Solicitar acceso al área de paciente (envía un enlace mágico).
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = schema.parse(body);
    const normalized = email.trim().toLowerCase();

    // Búsqueda insensible a mayúsculas; usamos el email REAL del paciente
    // como identificador del token (para que case con el área de paciente).
    const [patient] = await db
      .select({ id: patients.id, email: patients.email })
      .from(patients)
      .where(sql`lower(${patients.email}) = ${normalized}`);

    // Solo enviamos si el email corresponde a un paciente; pero respondemos
    // siempre igual para no revelar qué emails están registrados.
    if (patient) {
      const token = randomUUID();
      const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 días
      await db.insert(verificationTokens).values({ identifier: patient.email, token, expires });

      const origin = new URL(request.url).origin;
      try {
        await sendPatientAccessEmail(patient.email, `${origin}/mi-cuenta/${token}`);
      } catch (e) {
        console.error('Error al enviar el enlace de acceso:', e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Email no válido' }, { status: 400 });
    }
    console.error('Error en patient-access:', error);
    return NextResponse.json({ error: 'No se pudo procesar la solicitud' }, { status: 500 });
  }
}
