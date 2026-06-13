import { NextResponse } from 'next/server';
import { db } from '@/db';
import { leads } from '@/db/schema';
import { z } from 'zod';
import { sendContactEmails } from '@/lib/email';

const contactSchema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  message: z.string().min(1).max(2000),
});

// POST - Formulario de contacto público
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = contactSchema.parse(body);

    // Guardamos el lead (queda en /admin/leads aunque el email falle).
    await db.insert(leads).values({
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      message: data.message,
      status: 'new',
      source: 'web',
    });

    // Emails (aviso a la clínica + confirmación al usuario). Best-effort.
    await sendContactEmails({
      name: data.name,
      email: data.email,
      phone: data.phone,
      message: data.message,
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Revisa los datos del formulario', details: error.issues },
        { status: 400 }
      );
    }
    console.error('Error en el formulario de contacto:', error);
    return NextResponse.json({ error: 'No se pudo enviar el mensaje' }, { status: 500 });
  }
}
