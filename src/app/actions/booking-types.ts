// Tipos y errores del módulo de reservas. Se mantienen fuera del archivo
// 'use server' (que solo puede exportar funciones async).

export class BookingError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'VALIDATION' | 'CONFLICT' | 'INTERNAL'
  ) {
    super(message);
    this.name = 'BookingError';
  }
}

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
