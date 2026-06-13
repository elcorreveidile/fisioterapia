import { pgTable, serial, text, timestamp, integer, boolean, uuid, pgEnum, varchar } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Enums
export const bookingStatusEnum = pgEnum('booking_status', ['pending', 'confirmed', 'cancelled', 'completed', 'no_show']);
export const voucherTypeEnum = pgEnum('voucher_type', ['5', '10']);

// Professionals (fisioterapeutas)
export const professionals = pgTable('professionals', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  surname: text('surname').notNull(),
  colegiadoNumber: text('colegiado_number').notNull().default('XXXX'), // Placeholder
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  bio: text('bio'),
  imageUrl: text('image_url'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Services (servicios)
export const services = pgTable('services', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  duration: integer('duration').notNull(), // en minutos
  price: integer('price').notNull(), // en céntimos
  category: text('category').notNull(), // 'general', 'deportiva', 'suelo_pelvico', 'atm', 'respiratoria', 'masaje', 'valoracion'
  whatYouGet: text('what_you_get'), // "Qué te llevas a casa"
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Patients (pacientes)
export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  generalNotes: text('general_notes'),
  demo: boolean('demo').notNull().default(true), // Marca de demo
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Availability rules (reglas de disponibilidad)
export const availabilityRules = pgTable('availability_rules', {
  id: serial('id').primaryKey(),
  professionalId: integer('professional_id').notNull().references(() => professionals.id),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Monday, 6 = Sunday
  startTime: text('start_time').notNull(), // '09:00'
  endTime: text('end_time').notNull(), // '14:00'
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Blocked slots (huecos bloqueados)
export const blockedSlots = pgTable('blocked_slots', {
  id: serial('id').primaryKey(),
  professionalId: integer('professional_id').notNull().references(() => professionals.id),
  start: timestamp('start').notNull(),
  end: timestamp('end').notNull(),
  reason: text('reason'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Bookings (reservas)
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').notNull().references(() => patients.id),
  professionalId: integer('professional_id').notNull().references(() => professionals.id),
  serviceId: integer('service_id').notNull().references(() => services.id),
  start: timestamp('start').notNull(),
  end: timestamp('end').notNull(),
  status: text('status').notNull().$type<'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'>().default('pending'),
  cancellationToken: text('cancellation_token').notNull(),
  voucherId: integer('voucher_id').references(() => vouchers.id),
  demo: boolean('demo').notNull().default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Vouchers (bonos)
export const vouchers = pgTable('vouchers', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').notNull().references(() => patients.id),
  type: text('type').notNull().$type<'5' | '10'>(), // 5 o 10 sesiones
  sessionsRemaining: integer('sessions_remaining').notNull(),
  expirationDate: timestamp('expiration_date').notNull(),
  purchaseDate: timestamp('purchase_date').notNull().defaultNow(),
  notes: text('notes'),
  demo: boolean('demo').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Treatment notes (notas de tratamiento)
export const treatmentNotes = pgTable('treatment_notes', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').notNull().references(() => patients.id),
  bookingId: integer('booking_id').notNull().references(() => bookings.id),
  professionalId: integer('professional_id').notNull().references(() => professionals.id),
  notes: text('notes').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Exercises (biblioteca de ejercicios)
export const exercises = pgTable('exercises', {
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category'),
  imageUrl: text('image_url'),
  videoUrl: text('video_url'),
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Patient exercises (asignación de ejercicios a pacientes)
export const patientExercises = pgTable('patient_exercises', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').notNull().references(() => patients.id),
  exerciseId: integer('exercise_id').notNull().references(() => exercises.id),
  professionalId: integer('professional_id').notNull().references(() => professionals.id),
  series: integer('series').notNull(),
  repetitions: text('repetitions').notNull(), // Puede ser "10-12" o "30 segundos"
  frequency: text('frequency').notNull(), // '2x al día', '3x por semana'
  observations: text('observations'),
  token: text('token').notNull().unique(), // Token para acceso a /pauta/[token]
  active: boolean('active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Scheduled emails (emails programados)
export const scheduledEmails = pgTable('scheduled_emails', {
  id: serial('id').primaryKey(),
  bookingId: integer('booking_id').notNull().references(() => bookings.id),
  type: text('type').notNull(), // 'reminder_24h', 'follow_up', 're_booking'
  scheduledFor: timestamp('scheduled_for').notNull(),
  sent: boolean('sent').notNull().default(false),
  sentAt: timestamp('sent_at'),
  error: text('error'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// Relations
export const professionalsRelations = relations(professionals, ({ many }) => ({
  availabilityRules: many(availabilityRules),
  blockedSlots: many(blockedSlots),
  bookings: many(bookings),
  treatmentNotes: many(treatmentNotes),
  patientExercises: many(patientExercises),
}));

export const patientsRelations = relations(patients, ({ many }) => ({
  bookings: many(bookings),
  vouchers: many(vouchers),
  treatmentNotes: many(treatmentNotes),
  patientExercises: many(patientExercises),
}));

export const servicesRelations = relations(services, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  patient: one(patients, {
    fields: [bookings.patientId],
    references: [patients.id],
  }),
  professional: one(professionals, {
    fields: [bookings.professionalId],
    references: [professionals.id],
  }),
  service: one(services, {
    fields: [bookings.serviceId],
    references: [services.id],
  }),
  voucher: one(vouchers, {
    fields: [bookings.voucherId],
    references: [vouchers.id],
  }),
  treatmentNotes: many(treatmentNotes),
  scheduledEmails: many(scheduledEmails),
}));

export const vouchersRelations = relations(vouchers, ({ many }) => ({
  bookings: many(bookings),
}));

export const exercisesRelations = relations(exercises, ({ many }) => ({
  patientExercises: many(patientExercises),
}));

export const patientExercisesRelations = relations(patientExercises, ({ one }) => ({
  patient: one(patients, {
    fields: [patientExercises.patientId],
    references: [patients.id],
  }),
  exercise: one(exercises, {
    fields: [patientExercises.exerciseId],
    references: [exercises.id],
  }),
  professional: one(professionals, {
    fields: [patientExercises.professionalId],
    references: [professionals.id],
  }),
}));

// Leads (contactos del formulario)
export const leads = pgTable('leads', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone'),
  message: text('message').notNull(),
  status: text('status').notNull().default('new'), // 'new', 'contacted', 'converted', 'lost'
  source: text('source'), // 'web', 'referral', 'social'
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Auth.js tables
export const users = pgTable('users', {
  id: text('id').notNull().primaryKey(),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('email_verified'),
  image: text('image'),
  password: text('password').notNull(),
  role: text('role').notNull().default('admin'), // 'admin' por ahora, extensible a 'staff' en el futuro
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const accounts = pgTable(
  'accounts',
  {
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: { name: 'compound_key', columns: [account.provider, account.providerAccountId] },
  })
);

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').notNull().primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires').notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires').notNull(),
  },
  (vt) => ({
    compoundKey: { name: 'compound_key', columns: [vt.identifier, vt.token] },
  })
);

export const authenticators = pgTable(
  'authenticators',
  {
    credentialID: text('credentialID').notNull().unique(),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId: text('provider_account_id').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: boolean('credentialBackedUp').notNull(),
    transports: text('transports'),
  },
  (authenticator) => ({
    compositePK: { name: 'compositePK', columns: [authenticator.userId, authenticator.credentialID] },
  })
);

// Relations for Auth.js
export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  authenticators: many(authenticators),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));
