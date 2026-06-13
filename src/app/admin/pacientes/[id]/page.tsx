import { auth } from '@/auth/auth';
import { db } from '@/db';
import { patients, bookings, vouchers, services, professionals, treatmentNotes, patientExercises, exercises } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { notFound } from 'next/navigation';
import EditPatientButton from './EditPatientButton';

export default async function PatientPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) return null;

  const { id } = await params;
  const patientId = parseInt(id);
  if (isNaN(patientId)) {
    notFound();
  }

  // Obtener paciente
  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.id, patientId));

  if (!patient) {
    notFound();
  }

  // Obtener citas del paciente
  const patientBookings = await db
    .select({
      id: bookings.id,
      start: bookings.start,
      end: bookings.end,
      status: bookings.status,
      serviceName: services.name,
      professionalName: professionals.name,
    })
    .from(bookings)
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .innerJoin(professionals, eq(bookings.professionalId, professionals.id))
    .where(eq(bookings.patientId, patientId))
    .orderBy(desc(bookings.start));

  // Obtener bonos del paciente
  const patientVouchers = await db
    .select({
      id: vouchers.id,
      type: vouchers.type,
      sessionsRemaining: vouchers.sessionsRemaining,
      createdAt: vouchers.createdAt,
    })
    .from(vouchers)
    .where(eq(vouchers.patientId, patientId))
    .orderBy(desc(vouchers.createdAt));

  // Obtener treatment notes
  const notes = await db
    .select({
      id: treatmentNotes.id,
      date: treatmentNotes.createdAt,
      notes: treatmentNotes.notes,
      bookingId: treatmentNotes.bookingId,
    })
    .from(treatmentNotes)
    .where(eq(treatmentNotes.patientId, patientId))
    .orderBy(desc(treatmentNotes.createdAt));

  // Obtener pautas de ejercicios
  const pautas = await db
    .select({
      id: patientExercises.id,
      assignedAt: patientExercises.createdAt,
      notes: patientExercises.observations,
      exerciseTitle: exercises.title,
    })
    .from(patientExercises)
    .innerJoin(exercises, eq(patientExercises.exerciseId, exercises.id))
    .where(eq(patientExercises.patientId, patientId))
    .orderBy(desc(patientExercises.createdAt));

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-petrol text-sand py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-2xl">│</span>
            <span className="font-serif text-xl">Eje Fisioterapia</span>
            <span className="text-sm opacity-70">· Paciente</span>
          </div>
          <a href="/admin/pacientes" className="text-sm hover:text-amber transition-colors">
            ← Volver a pacientes
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        {/* Header del paciente */}
        <div className="bg-white p-6 rounded border-2 border-petrol/20 mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-serif text-petrol mb-2">{patient.name}</h1>
              <div className="space-y-1 text-sm text-ink-light">
                <div className="flex items-center gap-2">
                  📧 {patient.email}
                </div>
                {patient.phone && (
                  <div className="flex items-center gap-2">
                    📞 {patient.phone}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  📅 Paciente desde {format(patient.createdAt, 'MMMM yyyy', { locale: es })}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <EditPatientButton
                patient={{
                  id: patient.id,
                  name: patient.name,
                  email: patient.email,
                  phone: patient.phone,
                  generalNotes: patient.generalNotes,
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Historial de citas */}
          <div className="bg-white p-6 rounded border-2 border-petrol/20">
            <h2 className="text-xl font-serif text-petrol mb-4">Historial de citas ({patientBookings.length})</h2>
            {patientBookings.length === 0 ? (
              <p className="text-ink-light text-sm">No hay citas registradas</p>
            ) : (
              <div className="space-y-3">
                {patientBookings.map((booking) => (
                  <div key={booking.id} className="p-3 bg-sand rounded">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-petrol">
                        {format(booking.start, 'd MMM yy', { locale: es })}
                      </div>
                      <div className="text-sm">
                        {format(booking.start, 'HH:mm')} - {format(booking.end, 'HH:mm')}
                      </div>
                    </div>
                    <div className="text-sm text-ink-light">
                      <div>{booking.serviceName}</div>
                      <div>Con {booking.professionalName}</div>
                      <div className="mt-1">
                        <span className={`px-2 py-1 rounded text-xs ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {booking.status === 'confirmed' ? 'Confirmada' :
                           booking.status === 'completed' ? 'Completada' :
                           booking.status === 'pending' ? 'Pendiente' : booking.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bonos activos */}
          <div className="bg-white p-6 rounded border-2 border-petrol/20">
            <h2 className="text-xl font-serif text-petrol mb-4">Bonos ({patientVouchers.length})</h2>
            {patientVouchers.length === 0 ? (
              <p className="text-ink-light text-sm">No hay bonos activos</p>
            ) : (
              <div className="space-y-3">
                {patientVouchers.map((voucher) => (
                  <div key={voucher.id} className="p-3 bg-sand rounded">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium text-petrol">
                        Bono de {voucher.type === '5' ? 5 : 10} sesiones
                      </div>
                      <div className="text-sm text-ink-light">
                        {format(voucher.createdAt, 'MMM yyyy', { locale: es })}
                      </div>
                    </div>
                    <div className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-ink-light">Sesiones restantes:</span>
                        <span className="font-semibold text-amber">{voucher.sessionsRemaining}</span>
                        <span className="text-ink-light">/ {voucher.type === '5' ? 5 : 10}</span>
                      </div>
                      <div className="mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-amber h-2 rounded-full"
                            style={{
                              width: `${(( (voucher.type === '5' ? 5 : 10) - voucher.sessionsRemaining) / (voucher.type === '5' ? 5 : 10)) * 100}%`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Treatment notes */}
          <div className="bg-white p-6 rounded border-2 border-petrol/20">
            <h2 className="text-xl font-serif text-petrol mb-4">Notas de tratamiento ({notes.length})</h2>
            {notes.length === 0 ? (
              <p className="text-ink-light text-sm">No hay notas registradas</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {notes.map((note) => (
                  <div key={note.id} className="p-3 bg-sand rounded">
                    <div className="text-sm text-ink-light mb-2">
                      {format(note.date, 'd MMM yy', { locale: es })}
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.notes}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Pautas de ejercicios */}
          <div className="bg-white p-6 rounded border-2 border-petrol/20">
            <h2 className="text-xl font-serif text-petrol mb-4">Pautas de ejercicios ({pautas.length})</h2>
            {pautas.length === 0 ? (
              <p className="text-ink-light text-sm">No hay pautas asignadas</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {pautas.map((pauta) => (
                  <div key={pauta.id} className="p-3 bg-sand rounded">
                    <div className="font-medium text-petrol mb-1">{pauta.exerciseTitle}</div>
                    <div className="text-sm text-ink-light mb-2">
                      Asignado: {format(pauta.assignedAt, 'd MMM yyyy', { locale: es })}
                    </div>
                    {pauta.notes && (
                      <p className="text-sm whitespace-pre-wrap">{pauta.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
