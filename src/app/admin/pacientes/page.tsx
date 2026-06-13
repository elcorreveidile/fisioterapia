import { auth } from '@/auth/auth';
import { db } from '@/db';
import { patients, bookings, vouchers, services, professionals, treatmentNotes, patientExercises } from '@/db/schema';
import { eq, count, desc, sql } from 'drizzle-orm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default async function PacientesPage({
  searchParams,
}: {
  searchParams: { search?: string };
}) {
  const session = await auth();
  if (!session) return null;

  const searchTerm = searchParams.search || '';

  // Obtener pacientes con contadores
  const allPatients = await db
    .select({
      id: patients.id,
      name: patients.name,
      email: patients.email,
      phone: patients.phone,
      createdAt: patients.createdAt,
    })
    .from(patients)
    .where(
      searchTerm
        ? sql`${patients.name} ILIKE ${`%${searchTerm}%`} OR ${patients.email} ILIKE ${`%${searchTerm}%`} OR ${patients.phone} ILIKE ${`%${searchTerm}%`}`
        : undefined
    )
    .orderBy(desc(patients.createdAt));

  // Para cada paciente, obtener estadísticas
  const patientsWithStats = await Promise.all(
    allPatients.map(async (patient) => {
      const [bookingsCount] = await db
        .select({ count: count() })
        .from(bookings)
        .where(eq(bookings.patientId, patient.id));

      const [activeVouchers] = await db
        .select({ count: count(), total: sql<number>`sum(${vouchers.sessionsRemaining})` })
        .from(vouchers)
        .where(eq(vouchers.patientId, patient.id));

      const [lastBooking] = await db
        .select({ start: bookings.start })
        .from(bookings)
        .where(eq(bookings.patientId, patient.id))
        .orderBy(desc(bookings.start))
        .limit(1);

      return {
        ...patient,
        bookingsCount: bookingsCount.count || 0,
        activeVouchers: activeVouchers.count || 0,
        remainingSessions: activeVouchers.total || 0,
        lastVisit: lastBooking?.start || null,
      };
    })
  );

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-petrol text-sand py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-2xl">│</span>
            <span className="font-serif text-xl">Eje Fisioterapia</span>
            <span className="text-sm opacity-70">· Pacientes</span>
          </div>
          <a href="/admin" className="text-sm hover:text-amber transition-colors">
            ← Volver al dashboard
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif text-petrol">Pacientes</h1>
          <button className="px-6 py-3 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors font-medium">
            + Nuevo paciente
          </button>
        </div>

        {/* Búsqueda */}
        <div className="bg-white p-6 rounded border-2 border-petrol/20 mb-6">
          <form>
            <input
              type="search"
              name="search"
              placeholder="Buscar por nombre, email o teléfono..."
              defaultValue={searchTerm}
              className="w-full px-4 py-3 rounded border border-petrol/20"
            />
            <button type="submit" className="mt-2 px-4 py-2 bg-petrol text-sand rounded">
              Buscar
            </button>
          </form>
        </div>

        {/* Lista de pacientes */}
        <div className="bg-white rounded border-2 border-petrol/20 overflow-hidden">
          {patientsWithStats.length === 0 ? (
            <div className="p-8 text-center text-ink-light">
              <p className="mb-2">👥 No hay pacientes registrados</p>
              <p className="text-sm">
                {searchTerm ? 'No se encontraron resultados para tu búsqueda' : 'El primer paciente se registrará al hacer una reserva'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sand">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-petrol">Paciente</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-petrol">Contacto</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-petrol">Citas</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-petrol">Bonos</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-petrol">Última visita</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-petrol">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-petrol/10">
                  {patientsWithStats.map((patient) => (
                    <tr key={patient.id} className="hover:bg-sand/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-petrol">{patient.name}</div>
                        <div className="text-sm text-ink-light">
                          Desde {format(patient.createdAt, 'MMM yyyy', { locale: es })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-2">
                            📧 {patient.email}
                          </div>
                          {patient.phone && (
                            <div className="flex items-center gap-2">
                              📞 {patient.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-lg font-semibold text-petrol">{patient.bookingsCount}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-lg font-semibold text-amber">{patient.activeVouchers}</div>
                        {patient.activeVouchers > 0 && (
                          <div className="text-xs text-ink-light">
                            {patient.remainingSessions} sesiones restantes
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {patient.lastVisit ? (
                          <div className="text-sm">
                            {format(patient.lastVisit, "d MMM 'yy", { locale: es })}
                          </div>
                        ) : (
                          <div className="text-sm text-ink-light">Sin visitas</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={`/admin/pacientes/${patient.id}`}
                            className="px-3 py-1 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors text-sm"
                          >
                            Ver ficha
                          </a>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded border-2 border-petrol/20">
            <div className="text-2xl font-bold text-petrol">{patientsWithStats.length}</div>
            <div className="text-sm text-ink-light">Pacientes totales</div>
          </div>
          <div className="bg-white p-4 rounded border-2 border-petrol/20">
            <div className="text-2xl font-bold text-petrol">
              {patientsWithStats.filter((p) => p.bookingsCount > 0).length}
            </div>
            <div className="text-sm text-ink-light">Con visitas</div>
          </div>
          <div className="bg-white p-4 rounded border-2 border-petrol/20">
            <div className="text-2xl font-bold text-amber">
              {patientsWithStats.filter((p) => p.activeVouchers > 0).length}
            </div>
            <div className="text-sm text-ink-light">Con bonos activos</div>
          </div>
        </div>
      </main>
    </div>
  );
}
