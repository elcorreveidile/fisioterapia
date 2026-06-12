'use server';

import { db } from '@/db';
import {
  professionals,
  services,
  availabilityRules,
  bookings,
  patients,
  vouchers,
} from '@/db/schema';
import { and, eq, gte, lte, or, inArray, sql } from 'drizzle-orm';
import { randomUUID } from 'crypto';
import { differenceInMinutes, addMinutes, startOfDay, endOfDay } from 'date-fns';

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

// Obtener huecos disponibles para un servicio en una fecha
export async function getAvailableSlots(
  serviceId: number,
  date: Date,
  professionalId?: number
): Promise<AvailableSlot[]> {
  // Obtener el servicio para conocer la duración
  const [service] = await db
    .select({ duration: services.duration })
    .from(services)
    .where(eq(services.id, serviceId))
    .limit(1);

  if (!service) {
    throw new Error('Servicio no encontrado');
  }

  const duration = service.duration;
  const slotDuration = duration + 10; // +10 minutos de margen entre pacientes

  // Obtener profesionales (filtrado si se especifica)
  const pros = await db.query.professionals.findMany({
    where: professionalId
      ? and(eq(professionals.id, professionalId), eq(professionals.active, true))
      : eq(professionals.active, true),
    columns: { id: true, name: true, surname: true },
  });

  if (pros.length === 0) {
    return [];
  }

  // Obtener reglas de disponibilidad para el día de la semana
  const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const rules = await db.query.availabilityRules.findMany({
    where: and(
      inArray(
        availabilityRules.professionalId,
        pros.map((p) => p.id)
      ),
      eq(availabilityRules.dayOfWeek, dayOfWeek === 0 ? 7 : dayOfWeek), // Convert Sunday 0 to 7
      eq(availabilityRules.active, true)
    ),
  });

  // Agrupar reglas por profesional
  const rulesByProfessional = new Map<number, typeof rules>();
  for (const pro of pros) {
    rulesByProfessional.set(pro.id, []);
  }
  for (const rule of rules) {
    const existing = rulesByProfessional.get(rule.professionalId) || [];
    existing.push(rule);
    rulesByProfessional.set(rule.professionalId, existing);
  }

  // Generar huecos para cada profesional
  const allSlots: AvailableSlot[] = [];

  for (const pro of pros) {
    const proRules = rulesByProfessional.get(pro.id) || [];
    const proSlots = await generateSlotsForProfessional(
      pro.id,
      date,
      proRules,
      slotDuration,
      serviceId
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
  return allSlots.sort((a, b) => a.start.getTime() - b.start.getTime());
}

async function generateSlotsForProfessional(
  professionalId: number,
  date: Date,
  rules: typeof availabilityRules.$inferSelect[],
  slotDuration: number,
  serviceId: number
): Promise<Slot[]> {
  const slots: Slot[] = [];

  // Obtener reservas existentes para este profesional en esta fecha
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);

  const existingBookings = await db.query.bookings.findMany({
    where: and(
      eq(bookings.professionalId, professionalId),
      gte(bookings.start, dayStart),
      lte(bookings.start, dayEnd),
      or(
        eq(bookings.status, 'confirmed'),
        eq(bookings.status, 'pending')
      )
    ),
    columns: { start: true, end: true },
  });

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
        // Si hay overlapping, no está libre
        return (
          (currentStart >= booking.start && currentStart < booking.end) ||
          (currentEnd > booking.start && currentEnd <= booking.end) ||
          (currentStart <= booking.start && currentEnd >= booking.end)
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
  const { serviceId, professionalId, start, patientName, patientEmail, patientPhone, voucherId } = data;

  // Obtener el servicio
  const [service] = await db
    .select()
    .from(services)
    .where(eq(services.id, serviceId))
    .limit(1);

  if (!service) {
    throw new Error('Servicio no encontrado');
  }

  // Calcular fecha de fin
  const end = addMinutes(start, service.duration);

  // Verificar si el paciente ya existe
  let [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.email, patientEmail))
    .limit(1);

  if (!patient) {
    [patient] = await db
      .insert(patients)
      .values({
        name: patientName,
        email: patientEmail,
        phone: patientPhone,
        demo: true,
      })
      .returning();
  }

  // Verificar y bloquear bono si se proporciona (dentro de transacción para evitar race condition)
  if (voucherId) {
    // Primero verificamos sin bloquear para validación básica
    const [voucherCheck] = await db
      .select()
      .from(vouchers)
      .where(eq(vouchers.id, voucherId))
      .limit(1);

    if (!voucherCheck) {
      throw new Error('Bono no encontrado');
    }

    if (voucherCheck.patientId !== patient.id) {
      throw new Error('El bono no pertenece a este paciente');
    }
  }

  // Crear la reserva y descontar bono en transacción atómica
  return await db.transaction(async (tx) => {
    // Si se usa bono, verificar y bloquear dentro de la transacción
    if (voucherId) {
      const [voucher] = await tx
        .select()
        .from(vouchers)
        .where(eq(vouchers.id, voucherId))
        .for('update') // Bloquea la fila para esta transacción
        .limit(1);

      if (!voucher || voucher.patientId !== patient.id) {
        tx.rollback();
        throw new Error('El bono no existe o no pertenece a este paciente');
      }

      if (voucher.sessionsRemaining <= 0) {
        tx.rollback();
        throw new Error('El bono no tiene sesiones restantes');
      }

      // Descontar sesión (usando SQL parametrizado para evitar inyección)
      await tx
        .update(vouchers)
        .set({
          sessionsRemaining: sql`${vouchers.sessionsRemaining} - ${1}`,
        })
        .where(eq(vouchers.id, voucherId));
    }

    // Crear la reserva
    const [booking] = await tx
      .insert(bookings)
      .values({
        patientId: patient.id,
        professionalId,
        serviceId,
        start,
        end,
        status: 'pending',
        cancellationToken: randomUUID(),
        voucherId: voucherId || null,
        demo: true,
      })
      .returning();

    return booking;
  });
}

// Cancelar una reserva
export async function cancelBooking(cancellationToken: string) {
  const [booking] = await db
    .select()
    .from(bookings)
    .where(eq(bookings.cancellationToken, cancellationToken))
    .limit(1);

  if (!booking) {
    throw new Error('Reserva no encontrada');
  }

  if (booking.status === 'cancelled') {
    throw new Error('La reserva ya está cancelada');
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
    .where(eq(bookings.cancellationToken, cancellationToken));

  return true;
}

// Obtener servicios disponibles
export async function getServices() {
  return await db.query.services.findMany({
    where: eq(services.active, true),
    orderBy: [services.name],
  });
}

// Obtener profesionales disponibles
export async function getProfessionals() {
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
}
