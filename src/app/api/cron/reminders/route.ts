import { NextResponse } from 'next/server';
import { db } from '@/db';
import { scheduledEmails, bookings, patients, services, professionals } from '@/db/schema';
import { eq, and, gte } from 'drizzle-orm';
import { addHours } from 'date-fns';
import { Resend } from 'resend';

// Verificar que el request viene de Vercel Cron
export async function GET(request: Request) {
  // Verificar el header de autorización de Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const now = new Date();

    // Obtener emails programados para las próximas 24h
    const emailsToSend = await db
      .select({
        id: scheduledEmails.id,
        scheduledFor: scheduledEmails.scheduledFor,
        bookingId: bookings.id,
        bookingStart: bookings.start,
        patientName: patients.name,
        patientEmail: patients.email,
        serviceName: services.name,
        professionalName: professionals.name,
        professionalSurname: professionals.surname,
      })
      .from(scheduledEmails)
      .innerJoin(bookings, eq(scheduledEmails.bookingId, bookings.id))
      .innerJoin(patients, eq(bookings.patientId, patients.id))
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .innerJoin(professionals, eq(bookings.professionalId, professionals.id))
      .where(and(
        eq(scheduledEmails.sent, false),
        gte(scheduledEmails.scheduledFor, now),
        // TODO: añadir filtro para scheduledFor < now + 24h
      ));

    const results = [];

    for (const emailRecord of emailsToSend) {
      try {
        const {
          bookingStart,
          patientName,
          patientEmail,
          serviceName,
          professionalName,
          professionalSurname,
        } = emailRecord;

        // Enviar email con Resend
        await resend.emails.send({
          from: 'Eje Fisioterapia <noreply@ejefisioterapia-demo.com>',
          to: patientEmail,
          subject: `Recordatorio: Cita mañana a las ${bookingStart.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`,
          html: `
            <h1>Recordatorio de cita</h1>
            <p>Hola ${patientName},</p>
            <p>Te recordamos que tienes cita mañana a las ${bookingStart.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}.</p>
            <p><strong>Servicio:</strong> ${serviceName}</p>
            <p><strong>Fisioterapeuta:</strong> ${professionalName} ${professionalSurname}</p>
            <p>Si no puedes asistir, por favor contacta con nosotros.</p>
            <p>¡Nos vemos pronto!</p>
            <hr>
            <p><small>Eje Fisioterapia · Entiende tu dolor</small></p>
          `,
        });

        // Marcar como enviado
        await db
          .update(scheduledEmails)
          .set({
            sent: true,
            sentAt: new Date(),
          })
          .where(eq(scheduledEmails.id, emailRecord.id));

        results.push({
          id: emailRecord.id,
          status: 'sent',
          email: patientEmail,
        });
      } catch (error) {
        // Guardar error
        await db
          .update(scheduledEmails)
          .set({
            error: error instanceof Error ? error.message : 'Unknown error',
          })
          .where(eq(scheduledEmails.id, emailRecord.id));

        results.push({
          id: emailRecord.id,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return NextResponse.json({
      success: true,
      processed: emailsToSend.length,
      results,
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
