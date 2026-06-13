import Link from 'next/link';
import { db } from '@/db';
import {
  verificationTokens,
  patients,
  bookings,
  vouchers,
  patientExercises,
  exercises,
  services,
  professionals,
} from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import PatientSession from './PatientSession';
import CancelBookingButton from './CancelBookingButton';

const statusLabels: Record<string, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  no_show: 'No asististe',
};

function InvalidLink() {
  return (
    <div className="min-h-screen hero-surface flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg text-center">
        <p className="text-3xl mb-2">🔒</p>
        <h1 className="font-serif text-xl text-petrol mb-2">Enlace no válido o caducado</h1>
        <p className="text-ink-light text-sm mb-6">
          Pide un enlace nuevo para acceder a tu área de paciente.
        </p>
        <Link
          href="/mi-cuenta"
          className="inline-block bg-petrol text-sand px-6 py-3 rounded hover:bg-petrol-dark transition-colors font-medium"
        >
          Pedir un nuevo enlace
        </Link>
      </div>
    </div>
  );
}

export default async function MiCuentaTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const [vt] = await db
    .select()
    .from(verificationTokens)
    .where(eq(verificationTokens.token, token));

  if (!vt || vt.expires < new Date()) {
    return <InvalidLink />;
  }

  const [patient] = await db
    .select()
    .from(patients)
    .where(eq(patients.email, vt.identifier));

  if (!patient) {
    return <InvalidLink />;
  }

  const [patientBookings, patientVouchers, pautaRows] = await Promise.all([
    db
      .select({
        id: bookings.id,
        start: bookings.start,
        end: bookings.end,
        status: bookings.status,
        cancellationToken: bookings.cancellationToken,
        serviceName: services.name,
        professionalName: professionals.name,
      })
      .from(bookings)
      .innerJoin(services, eq(bookings.serviceId, services.id))
      .innerJoin(professionals, eq(bookings.professionalId, professionals.id))
      .where(eq(bookings.patientId, patient.id))
      .orderBy(desc(bookings.start)),
    db
      .select({
        id: vouchers.id,
        type: vouchers.type,
        sessionsRemaining: vouchers.sessionsRemaining,
      })
      .from(vouchers)
      .where(eq(vouchers.patientId, patient.id))
      .orderBy(desc(vouchers.createdAt)),
    db
      .select({
        token: patientExercises.token,
        title: exercises.title,
        createdAt: patientExercises.createdAt,
      })
      .from(patientExercises)
      .innerJoin(exercises, eq(patientExercises.exerciseId, exercises.id))
      .where(eq(patientExercises.patientId, patient.id))
      .orderBy(desc(patientExercises.createdAt)),
  ]);

  const now = new Date();
  const upcoming = patientBookings.filter((b) => b.start >= now);
  const past = patientBookings.filter((b) => b.start < now);

  // Agrupar pautas por token (cada token = un enlace /pauta/[token]).
  const pautasMap = new Map<string, { token: string; date: Date; exercises: string[] }>();
  for (const r of pautaRows) {
    const entry = pautasMap.get(r.token) ?? { token: r.token, date: r.createdAt, exercises: [] };
    entry.exercises.push(r.title);
    pautasMap.set(r.token, entry);
  }
  const pautas = [...pautasMap.values()];

  // Reserva prerrellenada con los datos del paciente (para que quede vinculada).
  const reservaUrl =
    `/reserva?email=${encodeURIComponent(patient.email)}` +
    `&name=${encodeURIComponent(patient.name)}` +
    (patient.phone ? `&phone=${encodeURIComponent(patient.phone)}` : '');

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-petrol surface-texture-light text-sand py-6 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">│</span>
            <span className="font-serif text-xl">Eje Fisioterapia</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm opacity-80 hidden sm:inline">Tu área de paciente</span>
            <PatientSession token={token} />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-serif text-petrol mb-1">Hola, {patient.name}</h1>
          <p className="text-ink-light">Aquí tienes tus citas, bonos y pautas de ejercicios.</p>
        </div>

        {/* Próximas citas */}
        <section className="bg-white p-6 rounded-lg border border-petrol/15">
          <h2 className="text-xl font-serif text-petrol mb-4">Próximas citas</h2>
          {upcoming.length === 0 ? (
            <p className="text-ink-light text-sm">
              No tienes citas próximas.{' '}
              <Link href={reservaUrl} className="text-petrol underline hover:text-amber">
                Reservar una cita
              </Link>
            </p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((b) => (
                <div key={b.id} className="p-3 bg-sand rounded">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="font-medium text-petrol">
                        {format(b.start, "EEEE d 'de' MMMM, HH:mm", { locale: es })}
                      </div>
                      <div className="text-sm text-ink-light">
                        {b.serviceName} · con {b.professionalName}
                      </div>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800">
                      {statusLabels[b.status] ?? b.status}
                    </span>
                  </div>
                  {(b.status === 'pending' || b.status === 'confirmed') && (
                    <div className="flex gap-2 mt-3">
                      <Link
                        href={reservaUrl}
                        className="text-xs px-3 py-1 rounded border border-petrol/30 text-petrol hover:bg-white transition-colors"
                      >
                        Reprogramar
                      </Link>
                      <CancelBookingButton token={b.cancellationToken} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Bonos */}
        {patientVouchers.length > 0 && (
          <section className="bg-white p-6 rounded-lg border border-petrol/15">
            <h2 className="text-xl font-serif text-petrol mb-4">Tus bonos</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {patientVouchers.map((v) => {
                const total = v.type === '5' ? 5 : 10;
                return (
                  <div key={v.id} className="p-4 bg-sand rounded">
                    <div className="font-medium text-petrol">Bono de {total} sesiones</div>
                    <div className="text-sm text-ink-light">
                      Te quedan <span className="font-semibold text-amber">{v.sessionsRemaining}</span> de {total}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Pautas */}
        <section className="bg-white p-6 rounded-lg border border-petrol/15">
          <h2 className="text-xl font-serif text-petrol mb-4">Tus pautas de ejercicios</h2>
          {pautas.length === 0 ? (
            <p className="text-ink-light text-sm">Todavía no tienes pautas asignadas.</p>
          ) : (
            <div className="space-y-3">
              {pautas.map((p) => (
                <Link
                  key={p.token}
                  href={`/pauta/${p.token}`}
                  className="block p-4 bg-sand rounded hover:bg-sand-dark transition-colors"
                >
                  <div className="font-medium text-petrol">
                    Pauta del {format(p.date, "d 'de' MMMM yyyy", { locale: es })}
                  </div>
                  <div className="text-sm text-ink-light">
                    {p.exercises.length} ejercicio{p.exercises.length !== 1 ? 's' : ''}: {p.exercises.join(', ')}
                  </div>
                  <span className="text-sm text-petrol underline">Ver pauta →</span>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Historial */}
        {past.length > 0 && (
          <section className="bg-white p-6 rounded-lg border border-petrol/15">
            <h2 className="text-xl font-serif text-petrol mb-4">Historial de citas</h2>
            <div className="space-y-2">
              {past.map((b) => (
                <div key={b.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                  <span className="text-ink-light">
                    {format(b.start, "d MMM yyyy, HH:mm", { locale: es })} · {b.serviceName}
                  </span>
                  <span className="text-xs text-ink-light">{statusLabels[b.status] ?? b.status}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="text-center">
          <Link href={reservaUrl} className="inline-block bg-petrol text-sand px-6 py-3 rounded hover:bg-petrol-dark transition-colors font-medium">
            Reservar nueva cita
          </Link>
        </div>
      </main>

      <footer className="bg-petrol surface-texture-light text-sand py-8 px-6 mt-8">
        <div className="max-w-4xl mx-auto text-center text-sm opacity-70">
          <p>Eje Fisioterapia · Entiende tu dolor</p>
        </div>
      </footer>
    </div>
  );
}
