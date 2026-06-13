import { NextResponse } from 'next/server';
import { db } from '@/db';
import { scheduledEmails, bookings, patients, services, professionals } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { format } from 'date-fns';

// This route should be protected with a secret token in production
const CRON_SECRET = process.env.CRON_SECRET || 'dev-secret';

export async function GET(request: Request) {
  // Verify this is a cron job
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    let processed = 0;
    let errors = 0;

    // Get pending emails that should be sent
    const pendingEmails = await db
      .select({
        id: scheduledEmails.id,
        type: scheduledEmails.type,
        bookingId: scheduledEmails.bookingId,
        scheduledFor: scheduledEmails.scheduledFor,
        patientEmail: patients.email,
        patientName: patients.name,
        serviceName: services.name,
        bookingStart: bookings.start,
        bookingEnd: bookings.end,
        professionalName: professionals.name,
      })
      .from(scheduledEmails)
      .innerJoin(bookings, eq(scheduledEmails.bookingId, bookings.id))
      .innerJoin(patients, eq(bookings.patientId, patients.id))
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .innerJoin(professionals, eq(bookings.professionalId, professionals.id))
      .where(eq(scheduledEmails.sent, false));

    // Filter emails that should be sent now
    const emailsToSend = pendingEmails.filter(
      (email) => new Date(email.scheduledFor) <= now
    );

    for (const email of emailsToSend) {
      try {
        // Generate email content based on type
        const subject = getEmailSubject(email.type, email.bookingStart);
        const body = getEmailBody(email);

        // TODO: Implement actual email sending
        // For now, we'll just mark as sent
        // await sendEmail(email.patientEmail, subject, body);

        // Mark as sent
        await db
          .update(scheduledEmails)
          .set({
            sent: true,
            sentAt: now,
          })
          .where(eq(scheduledEmails.id, email.id));

        processed++;
      } catch (error) {
        // Mark error
        await db
          .update(scheduledEmails)
          .set({
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          .where(eq(scheduledEmails.id, email.id));

        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      processed,
      errors,
      message: `Processed ${processed} emails, ${errors} errors`,
    });
  } catch (error) {
    console.error('Error processing emails:', error);
    return NextResponse.json(
      { error: 'Error processing emails' },
      { status: 500 }
    );
  }
}

function getEmailSubject(type: string, bookingStart: Date): string {
  const dateStr = format(bookingStart, 'd MMMM', { locale: require('date-fns/locale/es') });
  const timeStr = format(bookingStart, 'HH:mm');

  switch (type) {
    case 'reminder_24h':
      return `🔔 Recordatorio: Cita mañana ${dateStr} a las ${timeStr}`;
    case 'follow_up':
      return '✅ ¿Cómo te ha parecido tu sesión de fisioterapia?';
    case 're_booking':
      return '📅 ¿Quieres reservar tu próxima cita?';
    default:
      return 'Eje Fisioterapia';
  }
}

function getEmailBody(email: any): string {
  const dateStr = format(email.bookingStart, "d 'de' MMMM 'a las' HH:mm", {
    locale: require('date-fns/locale/es'),
  });

  switch (email.type) {
    case 'reminder_24h':
      return `
Hola ${email.patientName},

Este es un recordatorio de tu cita de fisioterapia mañana:

📅 Fecha: ${dateStr}
🧘 Servicio: ${email.serviceName}
👨‍⚕️ Profesional: ${email.professionalName}

📍 Ubicación: Eje Fisioterapia
⏰ Por favor, llega 5 minutos antes

Si no puedes asistir, responde a este email o llámanos.

¡Te esperamos!
      `.trim();

    case 'follow_up':
      return `
Hola ${email.patientName},

Esperamos que tu sesión de ${email.serviceName} haya sido de tu agrado.

¿Cómo te sientes después del tratamiento?
¿Tienes alguna duda o necesitas recomendarte algún ejercicio?

Si tienes cualquier pregunta, no dudes en contactarnos.

Saludos,
El equipo de Eje Fisioterapia
      `.trim();

    case 're_booking':
      return `
Hola ${email.patientName},

Espero que estés muy bien.

Pasamos a recordarte que puede ser buen momento para reservar tu próxima sesión de fisioterapia.

El mantenimiento regular es clave para prevenir lesiones y mantener tu bienestar.

📅 Puedes reservar fácilmente desde nuestra web:
[fisioterapia-henna.vercel.app/reserva](https://fisioterapia-henna.vercel.app/reserva)

Si tienes alguna pregunta, estamos aquí para ayudarte.

Saludos,
El equipo de Eje Fisioterapia
      `.trim();

    default:
      return '';
  }
}
