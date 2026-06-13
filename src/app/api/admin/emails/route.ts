import { NextResponse } from 'next/server';
import { auth } from '@/auth/auth';
import { sendEmail, simpleEmailHtml } from '@/lib/email';
import { z } from 'zod';

const schema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(1).max(5000),
});

// POST - Enviar un email manual desde el panel (plantilla de marca)
export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const data = schema.parse(body);

    await sendEmail(data.to, data.subject, simpleEmailHtml(data.message));

    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Revisa los datos del email', details: error.issues },
        { status: 400 }
      );
    }
    const msg = error instanceof Error ? error.message : 'No se pudo enviar el email';
    console.error('Error al enviar email manual:', error);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
