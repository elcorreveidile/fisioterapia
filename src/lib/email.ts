import { Resend } from 'resend';
import { db } from '@/db';
import { scheduledEmails, bookings, patients, services, professionals } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const SITE = 'https://fisioterapia-henna.vercel.app';
const FROM = process.env.EMAIL_FROM || 'Eje Fisioterapia <onboarding@resend.dev>';

// Paleta de marca
const C = {
  petrol: '#16524E',
  sand: '#F4EDE3',
  amber: '#E8A33D',
  ink: '#1F2A2A',
  inkLight: '#2d3a3a',
  white: '#ffffff',
};

// Escapa contenido que venga del usuario para evitar inyección de HTML.
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Envuelve el contenido en la plantilla de marca (logo, colores, pie).
export function wrapEmail(bodyHtml: string): string {
  return `<!DOCTYPE html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background:${C.sand};font-family:Arial,Helvetica,sans-serif;color:${C.ink};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.sand};padding:24px 12px;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:${C.white};border-radius:10px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">
        <tr><td style="padding:28px 32px;border-bottom:3px solid ${C.amber};text-align:center;">
          <img src="${SITE}/images/logo.png" alt="Eje Fisioterapia" width="200" style="display:inline-block;max-width:200px;height:auto;">
        </td></tr>
        <tr><td style="padding:32px;font-size:16px;line-height:1.6;color:${C.inkLight};">
          ${bodyHtml}
        </td></tr>
        <tr><td style="background:${C.petrol};color:${C.sand};padding:22px 32px;text-align:center;font-size:13px;">
          <p style="margin:0 0 6px;font-weight:bold;">Eje Fisioterapia · Entiende tu dolor</p>
          <p style="margin:0;opacity:0.85;">Granada · <a href="${SITE}" style="color:${C.amber};text-decoration:none;">visita nuestra web</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

// Email libre (mensaje escrito a mano desde el panel) con la plantilla de marca.
export function simpleEmailHtml(message: string): string {
  const safe = esc(message).replace(/\n/g, '<br>');
  return wrapEmail(
    `<div style="font-size:16px;line-height:1.6;color:${C.inkLight};">${safe}</div>`
  );
}

function heading(text: string): string {
  return `<h1 style="color:${C.petrol};font-size:22px;margin:0 0 16px;font-weight:bold;">${text}</h1>`;
}

function button(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="border-radius:6px;background:${C.petrol};">
    <a href="${href}" style="display:inline-block;padding:12px 24px;color:${C.sand};text-decoration:none;font-weight:bold;">${label}</a>
  </td></tr></table>`;
}

// Envía un email HTML a través de Resend.
export async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error(
      'RESEND_API_KEY no configurada: añade tu API key de Resend en Vercel.'
    );
  }
  const resend = new Resend(apiKey);
  const { error } = await resend.emails.send({ from: FROM, to, subject, html });
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

export function getEmailHtml(email: EmailData): string {
  const name = esc(email.patientName);
  const service = esc(email.serviceName);
  const professional = esc(email.professionalName);
  const dateStr = format(email.bookingStart, "d 'de' MMMM 'a las' HH:mm", { locale: es });

  let body = '';
  switch (email.type) {
    case 'reminder_24h':
      body = `${heading(`Hola ${name}`)}
        <p>Este es un recordatorio de tu próxima cita de fisioterapia:</p>
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${C.sand};border-radius:8px;margin:16px 0;">
          <tr><td style="padding:18px 20px;">
            <p style="margin:0 0 8px;"><strong style="color:${C.petrol};">📅 Fecha:</strong> ${dateStr}</p>
            <p style="margin:0 0 8px;"><strong style="color:${C.petrol};">🧘 Servicio:</strong> ${service}</p>
            <p style="margin:0;"><strong style="color:${C.petrol};">👨‍⚕️ Profesional:</strong> ${professional}</p>
          </td></tr>
        </table>
        <p>📍 Te esperamos en Eje Fisioterapia. Por favor, llega 5 minutos antes.</p>
        <p style="color:${C.inkLight};font-size:14px;">Si no puedes asistir, responde a este email o llámanos.</p>`;
      break;
    case 'follow_up':
      body = `${heading(`Hola ${name}`)}
        <p>Esperamos que tu sesión de <strong>${service}</strong> haya sido de tu agrado.</p>
        <p>¿Cómo te sientes después del tratamiento? ¿Tienes alguna duda o necesitas que te recomendemos algún ejercicio?</p>
        <p>Estamos aquí para ayudarte. Responde a este email con cualquier pregunta.</p>
        <p style="color:${C.inkLight};">Un saludo,<br>El equipo de Eje Fisioterapia</p>`;
      break;
    case 're_booking':
      body = `${heading(`Hola ${name}`)}
        <p>Puede ser un buen momento para reservar tu próxima sesión de fisioterapia. El mantenimiento regular es clave para prevenir lesiones y cuidar tu bienestar.</p>
        ${button(`${SITE}/reserva`, 'Reservar mi próxima cita')}
        <p style="color:${C.inkLight};font-size:14px;">Si tienes alguna pregunta, estamos aquí para ayudarte.</p>`;
      break;
    default:
      body = `${heading(`Hola ${name}`)}<p>Eje Fisioterapia</p>`;
  }
  return wrapEmail(body);
}

// Carga el email programado, lo envía y actualiza su estado.
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
    const html = getEmailHtml(email);
    await sendEmail(email.patientEmail, subject, html);

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

// Emails del formulario de contacto: aviso a la clínica + confirmación al usuario.
// Best-effort: no lanza (el lead ya se ha guardado).
export async function sendContactEmails(lead: {
  name: string;
  email: string;
  phone?: string | null;
  message: string;
}) {
  const name = esc(lead.name);
  const email = esc(lead.email);
  const phone = lead.phone ? esc(lead.phone) : '—';
  const message = esc(lead.message).replace(/\n/g, '<br>');

  // Aviso a la clínica (si hay buzón configurado)
  const clinicInbox = process.env.CONTACT_EMAIL;
  if (clinicInbox) {
    try {
      const body = `${heading('Nuevo mensaje de contacto')}
        <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:${C.sand};border-radius:8px;margin:8px 0;">
          <tr><td style="padding:18px 20px;">
            <p style="margin:0 0 8px;"><strong style="color:${C.petrol};">Nombre:</strong> ${name}</p>
            <p style="margin:0 0 8px;"><strong style="color:${C.petrol};">Email:</strong> ${email}</p>
            <p style="margin:0 0 8px;"><strong style="color:${C.petrol};">Teléfono:</strong> ${phone}</p>
            <p style="margin:0;"><strong style="color:${C.petrol};">Mensaje:</strong><br>${message}</p>
          </td></tr>
        </table>
        ${button(`${SITE}/admin/leads`, 'Ver en el panel')}`;
      await sendEmail(clinicInbox, `📨 Nuevo contacto: ${name}`, wrapEmail(body));
    } catch (e) {
      console.error('Error al avisar a la clínica:', e);
    }
  }

  // Confirmación al usuario
  try {
    const body = `${heading(`Gracias por escribirnos, ${name}`)}
      <p>Hemos recibido tu mensaje y te responderemos lo antes posible.</p>
      <p style="background:${C.sand};border-radius:8px;padding:16px 20px;color:${C.inkLight};">${message}</p>
      <p>Si tu consulta es urgente, puedes llamarnos o reservar directamente:</p>
      ${button(`${SITE}/reserva`, 'Ver disponibilidad y reservar')}
      <p style="color:${C.inkLight};">Un saludo,<br>El equipo de Eje Fisioterapia</p>`;
    await sendEmail(lead.email, 'Hemos recibido tu mensaje · Eje Fisioterapia', wrapEmail(body));
  } catch (e) {
    console.error('Error al enviar confirmación al usuario:', e);
  }
}
