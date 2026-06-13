import { db } from '@/db';
import { scheduledEmails } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { addHours, addDays } from 'date-fns';

/**
 * Crea los emails programados automáticamente para una nueva reserva
 */
export async function createScheduledEmails(bookingId: number, bookingStart: Date) {
  const emails = [];

  // 1. Recordatorio 24h antes de la cita
  const reminder24hDate = addHours(bookingStart, -24);
  if (reminder24hDate > new Date()) {
    const [reminderEmail] = await db
      .insert(scheduledEmails)
      .values({
        bookingId,
        type: 'reminder_24h',
        scheduledFor: reminder24hDate,
        sent: false,
      })
      .returning();
    emails.push(reminderEmail);
  }

  // 2. Email de seguimiento 24h después de la cita (solo si ya pasó)
  const followUpDate = addHours(bookingStart, 24);
  const [followUpEmail] = await db
    .insert(scheduledEmails)
    .values({
      bookingId,
      type: 'follow_up',
      scheduledFor: followUpDate,
      sent: false,
    })
    .returning();
  emails.push(followUpEmail);

  // 3. Email de re-reserva 7 días después de la cita
  const reBookingDate = addDays(bookingStart, 7);
  const [reBookingEmail] = await db
    .insert(scheduledEmails)
    .values({
      bookingId,
      type: 're_booking',
      scheduledFor: reBookingDate,
      sent: false,
    })
    .returning();
  emails.push(reBookingEmail);

  return emails;
}

/**
 * Cancela todos los emails programados para una reserva
 */
export async function cancelScheduledEmails(bookingId: number) {
  await db
    .delete(scheduledEmails)
    .where(eq(scheduledEmails.bookingId, bookingId));
}

/**
 * Reprograma emails cuando se cambia la fecha de una reserva
 */
export async function rescheduleEmails(bookingId: number, newStart: Date) {
  // Primero eliminar los existentes
  await cancelScheduledEmails(bookingId);

  // Luego crear nuevos con las fechas actualizadas
  await createScheduledEmails(bookingId, newStart);
}