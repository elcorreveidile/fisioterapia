'use server';

import { db } from '@/db';
import {
  professionals,
  services,
  availabilityRules,
  bookings,
  patients,
  vouchers,
  scheduledEmails,
} from '@/db/schema';
import { and, eq, gte, lte, or, inArray, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { addMinutes, startOfDay, endOfDay } from 'date-fns';
import { z } from 'zod';
import { sendBookingConfirmation } from '@/lib/email';

// ===== CACHÉ SIMPLE EN MEMORIA =====
interface CacheEntry {
  data: AvailableSlot[];
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

function getCacheKey(serviceId: number, date: Date, professionalId?: number): string {
  return `${serviceId}-${date.toISOString()}-${professionalId || 'all'}`;
}

function getFromCache(key: string): AvailableSlot[] | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCache(key: string, data: AvailableSlot[]): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  });
}

function invalidateCacheForDate(date: Date): void {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  for (const key of cache.keys()) {
    if (key.includes(dateStr)) {
      cache.delete(key);
    }
  }
}

// ===== ERROR HANDLING CONSISTENTE =====
export class BookingError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'VALIDATION' | 'CONFLICT' | 'INTERNAL'
  ) {
    super(message);
    this.name = 'BookingError';
  }
}

// ===== VALIDATION SCHEMAS =====
const GetAvailableSlotsSchema = z.object({
  serviceId: z.number().int().positive(),
  date: z.date(),
  professionalId: z.number().int().positive().optional(),
});

const CreateBookingSchema = z.object({
  serviceId: z.number().int().positive(),
  professionalId: z.number().int().positive(),
  start: z.date(),
  patientName: z.string().min(1).max(200),
  patientEmail: z.string().email(),
  patientPhone: z.string().min(9).max(20),
  voucherId: z.number().int().positive().optional(),
});

const CancelBookingSchema = z.object({
  cancellationToken: z.string().uuid(),
});

// ===== INTERFACES =====
export interface Slot {
  start: Date;
  end: Date;
  professionalId: number;
}

export interface AvailableSlot extends Slot {
  professional: {
    name: string;
    surname: string;
  };
}

// ===== OPTIMIZACIÓN: Query única en lugar de N+1 =====
// Obtener huecos disponibles para un servicio en una fecha
export async function getAvailableSlots(
  serviceId: number,
  date: Date,
  professionalId?: number
): Promise<AvailableSlot[]> {
  // Validar inputs
  const validated = GetAvailableSlotsSchema.parse({ serviceId, date, professionalId });

  // Verificar caché primero
  const cacheKey = getCacheKey(validated.serviceId, validated.date, validated.professionalId);
  const cached = getFromCache(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    // Obtener el servicio para conocer la duración
    const [service] = await db
      .select({ duration: services.duration })
      .from(services)
      .where(eq(services.id, validated.serviceId))
      .limit(1);

    if (!service) {
      throw new BookingError('Servicio no encontrado', 'NOT_FOUND');
    }

    const duration = service.duration;
    const slotDuration = duration + 10; // +10 minutos de margen entre pacientes

    // OPTIMIZACIÓN: Obtener profesionales, reglas Y reservas en una sola query
    const dayOfWeek = date.getDay();
    const normalizedDay = dayOfWeek === 0 ? 7 : dayOfWeek;
    const dayStart = startOfDay(validated.date);
    const dayEnd = endOfDay(validated.date);

    // Query única para obtener profesionales activos
    const pros = await db.query.professionals.findMany({
      where: validated.professionalId
        ? and(eq(professionals.id, validated.professionalId), eq(professionals.active, true))
        : eq(professionals.active, true),
      columns: { id: true, name: true, surname: true },
    });

    if (pros.length === 0) {
      return [];
    }

    // OPTIMIZACIÓN: Obtener todas las reglas de disponibilidad en una query
    const allRules = await db.query.availabilityRules.findMany({
      where: and(
        inArray(availabilityRules.professionalId, pros.map((p) => p.id)),
        eq(availabilityRules.dayOfWeek, normalizedDay),
        eq(availabilityRules.active, true)
      ),
    });

    // OPTIMIZACIÓN: Obtener todas las reservas del día en una query
    const allBookings = await db.query.bookings.findMany({
      where: and(
        inArray(bookings.professionalId, pros.map((p) => p.id)),
        gte(bookings.start, dayStart),
        lte(bookings.start, dayEnd),
        or(eq(bookings.status, 'confirmed'), eq(bookings.status, 'pending'))
      ),
      columns: { start: true, end: true, professionalId: true },
    }) as Array<{ start: Date; end: Date; professionalId: number }>;

    // Agrupar datos por profesional para evitar iteraciones repetidas
    const rulesByProfessional = new Map<number, typeof allRules>();
    const bookingsByProfessional = new Map<number, typeof allBookings>();

    for (const pro of pros) {
      rulesByProfessional.set(pro.id, []);
      bookingsByProfessional.set(pro.id, []);
    }

    for (const rule of allRules) {
      const existing = rulesByProfessional.get(rule.professionalId) || [];
      existing.push(rule);
      rulesByProfessional.set(rule.professionalId, existing);
    }

    for (const booking of allBookings) {
      const existing = bookingsByProfessional.get(booking.professionalId) || [];
      existing.push(booking);
      bookingsByProfessional.set(booking.professionalId, existing);
    }

    // Generar huecos para cada profesional
    const allSlots: AvailableSlot[] = [];

    for (const pro of pros) {
      const proRules = rulesByProfessional.get(pro.id) || [];
      const proBookings = bookingsByProfessional.get(pro.id) || [];
      const proSlots = await generateSlotsForProfessional(
        pro.id,
        validated.date,
        proRules,
        proBookings,
        slotDuration
      );

      for (const slot of proSlots) {
        allSlots.push({
          ...slot,
          professional: {
            name: pro.name,
            surname: pro.surname,
          },
        });
      }
    }

    // Ordenar por hora
    const sortedSlots = allSlots.sort((a, b) => a.start.getTime() - b.start.getTime());

    // Guardar en caché
    setCache(cacheKey, sortedSlots);

    return sortedSlots;

  } catch (error) {
    if (error instanceof BookingError) {
      throw error;
    }
    throw new BookingError('Error al obtener huecos disponibles', 'INTERNAL');
  }
}

async function generateSlotsForProfessional(
  professionalId: number,
  date: Date,
  rules: typeof availabilityRules.$inferSelect[],
  existingBookings: Array<{ start: Date; end: Date | null; professionalId: number }>,
  slotDuration: number
): Promise<Slot[]> {
  const slots: Slot[] = [];

  // Para cada regla de disponibilidad (mañana y tarde)
  for (const rule of rules) {
    const [startHour, startMin] = rule.startTime.split(':').map(Number);
    const [endHour, endMin] = rule.endTime.split(':').map(Number);

    const ruleStart = new Date(date);
    ruleStart.setHours(startHour, startMin, 0, 0);

    const ruleEnd = new Date(date);
    ruleEnd.setHours(endHour, endMin, 0, 0);

    // Generar huecos desde ruleStart hasta ruleEnd
    let currentStart = ruleStart;

    while (currentStart.getTime() + slotDuration * 60000 <= ruleEnd.getTime()) {
      const currentEnd = addMinutes(currentStart, slotDuration);

      // Verificar si este hueco está libre
      const isFree = !existingBookings.some((booking) => {
        return (
          (currentStart >= booking.start && currentStart < booking.end!) ||
          (currentEnd > booking.start! && currentEnd <= booking.end!) ||
          (currentStart <= booking.start! && currentEnd >= booking.end!)
        );
      });

      if (isFree) {
        slots.push({
          start: currentStart,
          end: currentEnd,
          professionalId,
        });
      }

      // Avanzar al siguiente hueco (redondear al siguiente cuarto de hora)
      const nextSlotStart = addMinutes(currentStart, slotDuration);
      const minutes = nextSlotStart.getMinutes();
      const roundedMinutes = Math.ceil(minutes / 15) * 15;
      nextSlotStart.setMinutes(roundedMinutes, 0, 0);
      currentStart = nextSlotStart;
    }
  }

  return slots;
}

// Crear una reserva
export async function createBooking(data: {
  serviceId: number;
  professionalId: number;
  start: Date;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  voucherId?: number;
}) {
  // Validar inputs
  const validated = CreateBookingSchema.parse(data);

  try {
    // Obtener el servicio
    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, validated.serviceId))
      .limit(1);

    if (!service) {
      throw new BookingError('Servicio no encontrado', 'NOT_FOUND');
    }

    // Calcular fecha de fin
    const end = addMinutes(validated.start, service.duration);

    // Email normalizado para vincular siempre con el mismo paciente
    const patientEmail = validated.patientEmail.trim().toLowerCase();

    // Verificar si el paciente ya existe (insensible a mayúsculas para no duplicar)
    let [patient] = await db
      .select()
      .from(patients)
      .where(sql`lower(${patients.email}) = ${patientEmail}`)
      .limit(1);

    if (!patient) {
      [patient] = await db
        .insert(patients)
        .values({
          name: validated.patientName,
          email: patientEmail,
          phone: validated.patientPhone,
          demo: true,
        })
        .returning();
    }

    // Verificar y bloquear bono si se proporciona (dentro de transacción para evitar race condition)
    if (validated.voucherId) {
      // Primero verificamos sin bloquear para validación básica
      const [voucherCheck] = await db
        .select()
        .from(vouchers)
        .where(eq(vouchers.id, validated.voucherId))
        .limit(1);

      if (!voucherCheck) {
        throw new BookingError('Bono no encontrado', 'NOT_FOUND');
      }

      if (voucherCheck.patientId !== patient.id) {
        throw new BookingError('El bono no pertenece a este paciente', 'VALIDATION');
      }
    }

    // Crear la reserva y descontar bono en transacción atómica
    const booking = await db.transaction(async (tx) => {
      // Si se usa bono, verificar y bloquear dentro de la transacción
      if (validated.voucherId) {
        const [voucher] = await tx
          .select()
          .from(vouchers)
          .where(eq(vouchers.id, validated.voucherId))
          .for('update') // Bloquea la fila para esta transacción
          .limit(1);

        if (!voucher || voucher.patientId !== patient.id) {
          tx.rollback();
          throw new BookingError('El bono no existe o no pertenece a este paciente', 'NOT_FOUND');
        }

        if (voucher.sessionsRemaining <= 0) {
          tx.rollback();
          throw new BookingError('El bono no tiene sesiones restantes', 'CONFLICT');
        }

        // Descontar sesión (usando SQL parametrizado para evitar inyección)
        await tx
          .update(vouchers)
          .set({
            sessionsRemaining: sql`${vouchers.sessionsRemaining} - ${1}`,
          })
          .where(eq(vouchers.id, validated.voucherId));
      }

      // Crear la reserva
      const [newBooking] = await tx
        .insert(bookings)
        .values({
          patientId: patient.id,
          professionalId: validated.professionalId,
          serviceId: validated.serviceId,
          start: validated.start,
          end,
          status: 'pending',
          cancellationToken: randomUUID(),
          voucherId: validated.voucherId || null,
          demo: true,
        })
        .returning();

      return newBooking;
    });

    // Invalidar caché para la fecha de la reserva
    invalidateCacheForDate(validated.start);

    // Emails programados (recordatorio, seguimiento, re-reserva) — best-effort
    try {
      await db.insert(scheduledEmails).values([
        { bookingId: booking.id, type: 'reminder_24h', scheduledFor: addMinutes(validated.start, -24 * 60), sent: false },
        { bookingId: booking.id, type: 'follow_up', scheduledFor: addMinutes(end, 24 * 60), sent: false },
        { bookingId: booking.id, type: 're_booking', scheduledFor: addMinutes(validated.start, 7 * 24 * 60), sent: false },
      ]);
    } catch (e) {
      console.error('Error al crear emails programados:', e);
    }

    // Confirmación al paciente — best-effort (no rompe la reserva si falla)
    try {
      const [prof] = await db
        .select({ name: professionals.name, surname: professionals.surname })
        .from(professionals)
        .where(eq(professionals.id, validated.professionalId))
        .limit(1);
      await sendBookingConfirmation({
        to: patient.email,
        patientName: patient.name,
        serviceName: service.name,
        professionalName: prof ? `${prof.name} ${prof.surname}` : '',
        start: validated.start,
      });
    } catch (e) {
      console.error('Error al enviar la confirmación de reserva:', e);
    }

    return booking;

  } catch (error) {
    if (error instanceof BookingError) {
      throw error;
    }
    throw new BookingError('Error al crear la reserva', 'INTERNAL');
  }
}

// Cancelar una reserva
export async function cancelBooking(cancellationToken: string) {
  // Validar input
  const validated = CancelBookingSchema.parse({ cancellationToken });

  try {
    const [booking] = await db
      .select()
      .from(bookings)
      .where(eq(bookings.cancellationToken, validated.cancellationToken))
      .limit(1);

    if (!booking) {
      throw new BookingError('Reserva no encontrada', 'NOT_FOUND');
    }

    if (booking.status === 'cancelled') {
      throw new BookingError('La reserva ya está cancelada', 'CONFLICT');
    }

    // Si se usó bono, devolver la sesión (usando SQL parametrizado)
    if (booking.voucherId) {
      await db
        .update(vouchers)
        .set({
          sessionsRemaining: sql`${vouchers.sessionsRemaining} + ${1}`,
        })
        .where(eq(vouchers.id, booking.voucherId));
    }

    // Cancelar la reserva
    await db
      .update(bookings)
      .set({
        status: 'cancelled',
        updatedAt: new Date(),
      })
      .where(eq(bookings.cancellationToken, validated.cancellationToken));

    // Invalidar caché para la fecha de la reserva
    if (booking.start) {
      invalidateCacheForDate(booking.start);
    }

    return true;

  } catch (error) {
    if (error instanceof BookingError) {
      throw error;
    }
    throw new BookingError('Error al cancelar la reserva', 'INTERNAL');
  }
}

// Obtener servicios disponibles
export async function getServices() {
  try {
    return await db.query.services.findMany({
      where: eq(services.active, true),
      orderBy: [services.name],
    });
  } catch (error) {
    throw new BookingError('Error al obtener servicios', 'INTERNAL');
  }
}

// Obtener profesionales disponibles
export async function getProfessionals() {
  try {
    return await db.query.professionals.findMany({
      where: eq(professionals.active, true),
      columns: {
        id: true,
        name: true,
        surname: true,
        bio: true,
      },
      orderBy: [professionals.name],
    });
  } catch (error) {
    throw new BookingError('Error al obtener profesionales', 'INTERNAL');
  }
}
