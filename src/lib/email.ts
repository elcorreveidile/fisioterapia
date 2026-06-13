import { Resend } from 'resend';
import { db } from '@/db';
import { scheduledEmails, bookings, patients, services, professionals } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Remitente verificado en Resend. Configúralo en Vercel (EMAIL_FROM).
const FROM = process.env.EMAIL_FROM || 'Eje Fisioterapia <onboarding@resend.dev>';

// Envía un email a través de Resend. Lanza error si falta la configuración
// o si el proveedor devuelve error (lo recoge el llamador para marcarlo).
export async function sendEmail(to: string, subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      'RESEND_API_KEY no configurada: añade tu API key de Resend en Vercel.'
    );
  }
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({ from: FROM, to, subject, text });
  if (error) {
    throw new Error(error.message || 'Error de Resend al enviar el email');
  }
}

type EmailData = {
  type: string;
  patientName: string;
  serviceName: string;
  professionalName: string;
  bookingStart: Date;
};

export function getEmailSubject(type: string, bookingStart: Date): string {
  const dateStr = format(bookingStart, 'd MMMM', { locale: es });
  const timeStr = format(bookingStart, 'HH:mm');

  switch (type) {
    case 'reminder_24h':
      return `🔔 Recordatorio: cita el ${dateStr} a las ${timeStr}`;
    case 'follow_up':
      return '✅ ¿Cómo te ha parecido tu sesión de fisioterapia?';
    case 're_booking':
      return '📅 ¿Quieres reservar tu próxima cita?';
    default:
      return 'Eje Fisioterapia';
  }
}

export function getEmailBody(email: EmailData): string {
  const dateStr = format(email.bookingStart, "d 'de' MMMM 'a las' HH:mm", {
    locale: es,
  });

  switch (email.type) {
    case 'reminder_24h':
      return `Hola ${email.patientName},

Este es un recordatorio de tu próxima cita de fisioterapia:

📅 Fecha: ${dateStr}
🧘 Servicio: ${email.serviceName}
👨‍⚕️ Profesional: ${email.professionalName}

📍 Ubicación: Eje Fisioterapia
⏰ Por favor, llega 5 minutos antes.

Si no puedes asistir, responde a este email o llámanos.

¡Te esperamos!`;

    case 'follow_up':
      return `Hola ${email.patientName},

Esperamos que tu sesión de ${email.serviceName} haya sido de tu agrado.

¿Cómo te sientes después del tratamiento? ¿Tienes alguna duda o necesitas que te recomendemos algún ejercicio?

Si tienes cualquier pregunta, no dudes en contactarnos.

Saludos,
El equipo de Eje Fisioterapia`;

    case 're_booking':
      return `Hola ${email.patientName},

Esperamos que estés muy bien.

Pasamos a recordarte que puede ser buen momento para reservar tu próxima sesión de fisioterapia. El mantenimiento regular es clave para prevenir lesiones y cuidar tu bienestar.

📅 Puedes reservar fácilmente desde nuestra web:
https://fisioterapia-henna.vercel.app/reserva

Si tienes alguna pregunta, estamos aquí para ayudarte.

Saludos,
El equipo de Eje Fisioterapia`;

    default:
      return '';
  }
}

// Carga el email programado con sus datos, lo envía y actualiza su estado.
// Se usa tanto desde el cron como desde el botón "Enviar" del panel.
export async function sendScheduledEmail(
  emailId: number
): Promise<{ ok: boolean; error?: string }> {
  const [email] = await db
    .select({
      id: scheduledEmails.id,
      type: scheduledEmails.type,
      patientEmail: patients.email,
      patientName: patients.name,
      serviceName: services.name,
      professionalName: professionals.name,
      bookingStart: bookings.start,
    })
    .from(scheduledEmails)
    .innerJoin(bookings, eq(scheduledEmails.bookingId, bookings.id))
    .innerJoin(patients, eq(bookings.patientId, patients.id))
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .innerJoin(professionals, eq(bookings.professionalId, professionals.id))
    .where(eq(scheduledEmails.id, emailId));

  if (!email) {
    return { ok: false, error: 'Email no encontrado' };
  }

  try {
    const subject = getEmailSubject(email.type, email.bookingStart);
    const text = getEmailBody(email);
    await sendEmail(email.patientEmail, subject, text);

    await db
      .update(scheduledEmails)
      .set({ sent: true, sentAt: new Date(), error: null })
      .where(eq(scheduledEmails.id, emailId));

    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al enviar el email';
    await db
      .update(scheduledEmails)
      .set({ error: msg })
      .where(eq(scheduledEmails.id, emailId));
    return { ok: false, error: msg };
  }
}
