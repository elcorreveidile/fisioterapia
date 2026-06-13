import { auth } from '@/auth/auth';
import { db } from '@/db';
import { professionals, bookings, services, patients } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { startOfDay, endOfDay, addDays, format } from 'date-fns';
import { es } from 'date-fns/locale';

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: { date?: string; professional?: string; view?: 'day' | 'week' };
}) {
  const session = await auth();
  if (!session) return null;

  // Obtener parámetros con valores por defecto
  const selectedDate = searchParams.date ? new Date(searchParams.date) : new Date();
  const selectedProfessional = searchParams.professional ? parseInt(searchParams.professional) : undefined;
  const selectedView = searchParams.view || 'day';

  // Obtener profesionales
  const allProfessionals = await db.select().from(professionals);

  // Obtener servicios
  const allServices = await db.select().from(services);

  // Obtener citas del rango de fechas
  const startDate = startOfDay(selectedDate);
  const endDate = selectedView === 'day'
    ? endOfDay(selectedDate)
    : endOfDay(addDays(selectedDate, 6));

  const agendaBookings = await db
    .select({
      id: bookings.id,
      start: bookings.start,
      end: bookings.end,
      status: bookings.status,
      patientId: bookings.patientId,
      professionalId: bookings.professionalId,
      serviceId: bookings.serviceId,
      patientName: patients.name,
      patientEmail: patients.email,
      patientPhone: patients.phone,
      serviceName: services.name,
      serviceDuration: services.duration,
      professionalName: professionals.name,
    })
    .from(bookings)
    .innerJoin(patients, eq(bookings.patientId, patients.id))
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .innerJoin(professionals, eq(bookings.professionalId, professionals.id))
    .where(
      and(
        gte(bookings.start, startDate),
        lte(bookings.start, endDate),
        selectedProfessional ? eq(bookings.professionalId, selectedProfessional) : undefined
      )
    )
    .orderBy(bookings.start);

  // Generar días para la vista
  const days = selectedView === 'day'
    ? [selectedDate]
    : Array.from({ length: 7 }, (_, i) => addDays(selectedDate, i));

  // Colores por estado
  const statusColors = {
    pending: 'bg-amber-100 text-amber-800 border-amber-300',
    confirmed: 'bg-green-100 text-green-800 border-green-300',
    cancelled: 'bg-red-100 text-red-800 border-red-300',
    completed: 'bg-blue-100 text-blue-800 border-blue-300',
    no_show: 'bg-gray-100 text-gray-800 border-gray-300',
  };

  const statusLabels = {
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    completed: 'Completada',
    no_show: 'No show',
  };

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-petrol text-sand py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-2xl">│</span>
            <span className="font-serif text-xl">Eje Fisioterapia</span>
            <span className="text-sm opacity-70">· Agenda</span>
          </div>
          <a href="/admin" className="text-sm hover:text-amber transition-colors">
            ← Volver al dashboard
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif text-petrol">Agenda</h1>
          <a
            href={`/reserva?date=${format(selectedDate, 'yyyy-MM-dd')}`}
            className="px-6 py-3 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors font-medium"
          >
            + Nueva cita
          </a>
        </div>

        {/* Controles */}
        <div className="bg-white p-6 rounded border-2 border-petrol/20 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Selector de vista */}
            <div>
              <label className="block text-sm font-medium text-petrol mb-2">Vista</label>
              <div className="flex gap-2">
                <a
                  href={`?view=day&date=${format(selectedDate, 'yyyy-MM-dd')}${selectedProfessional ? `&professional=${selectedProfessional}` : ''}`}
                  className={`px-4 py-2 rounded transition-colors ${
                    selectedView === 'day'
                      ? 'bg-petrol text-sand'
                      : 'bg-sand text-petrol hover:bg-sand-warm'
                  }`}
                >
                  Día
                </a>
                <a
                  href={`?view=week&date=${format(selectedDate, 'yyyy-MM-dd')}${selectedProfessional ? `&professional=${selectedProfessional}` : ''}`}
                  className={`px-4 py-2 rounded transition-colors ${
                    selectedView === 'week'
                      ? 'bg-petrol text-sand'
                      : 'bg-sand text-petrol hover:bg-sand-warm'
                  }`}
                >
                  Semana
                </a>
              </div>
            </div>

            {/* Selector de fecha */}
            <div>
              <label className="block text-sm font-medium text-petrol mb-2">Fecha</label>
              <input
                type="date"
                value={format(selectedDate, 'yyyy-MM-dd')}
                onChange={(e) => {
                  const newDate = e.target.value;
                  window.location.href = `?date=${newDate}&view=${selectedView}${selectedProfessional ? `&professional=${selectedProfessional}` : ''}`;
                }}
                className="w-full px-4 py-2 rounded border border-petrol/20"
              />
            </div>

            {/* Selector de profesional */}
            <div>
              <label className="block text-sm font-medium text-petrol mb-2">Profesional</label>
              <select
                value={selectedProfessional || 'all'}
                onChange={(e) => {
                  const prof = e.target.value === 'all' ? '' : `&professional=${e.target.value}`;
                  window.location.href = `?date=${format(selectedDate, 'yyyy-MM-dd')}&view=${selectedView}${prof}`;
                }}
                className="w-full px-4 py-2 rounded border border-petrol/20"
              >
                <option value="all">Todos los profesionales</option>
                {allProfessionals.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.name} {prof.surname}
                  </option>
                ))}
              </select>
            </div>

            {/* Navegación */}
            <div>
              <label className="block text-sm font-medium text-petrol mb-2">Navegación</label>
              <div className="flex gap-2">
                <a
                  href={`?date=${format(addDays(selectedDate, selectedView === 'day' ? -1 : -7), 'yyyy-MM-dd')}&view=${selectedView}${selectedProfessional ? `&professional=${selectedProfessional}` : ''}`}
                  className="px-4 py-2 bg-sand text-petrol rounded hover:bg-sand-warm transition-colors"
                >
                  ← Anterior
                </a>
                <a
                  href={`?date=${format(addDays(selectedDate, selectedView === 'day' ? 1 : 7), 'yyyy-MM-dd')}&view=${selectedView}${selectedProfessional ? `&professional=${selectedProfessional}` : ''}`}
                  className="px-4 py-2 bg-sand text-petrol rounded hover:bg-sand-warm transition-colors"
                >
                  Siguiente →
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Vista de agenda */}
        <div className="grid grid-cols-1 gap-6">
          {days.map((day) => {
            const dayBookings = agendaBookings.filter((b) =>
              format(b.start, 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
            );

            return (
              <div key={day.toISOString()} className="bg-white p-6 rounded border-2 border-petrol/20">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-serif text-petrol">
                    {format(day, 'EEEE, d MMMM', { locale: es })}
                  </h2>
                  <span className="text-sm text-ink-light">
                    {dayBookings.length} cita{dayBookings.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {dayBookings.length === 0 ? (
                  <div className="bg-sand p-8 rounded text-center text-ink-light">
                    <p>No hay citas programadas para este día</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {dayBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={`p-4 rounded border-2 ${statusColors[booking.status as keyof typeof statusColors]}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-4 mb-2">
                              <div className="text-lg font-semibold">
                                {format(booking.start, 'HH:mm')} - {format(booking.end, 'HH:mm')}
                              </div>
                              <div className="px-3 py-1 rounded-full bg-white/50 text-sm font-medium">
                                {statusLabels[booking.status as keyof typeof statusLabels]}
                              </div>
                            </div>

                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">Paciente:</span>
                                <span>{booking.patientName}</span>
                                {booking.patientPhone && (
                                  <span className="text-ink-light">· {booking.patientPhone}</span>
                                )}
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="font-medium">Servicio:</span>
                                <span>{booking.serviceName}</span>
                                <span className="text-ink-light">· {booking.serviceDuration} min</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="font-medium">Profesional:</span>
                                <span>{booking.professionalName}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 ml-4">
                            <button
                              className="px-3 py-1 bg-white/50 rounded hover:bg-white transition-colors text-sm"
                              title="Ver detalles"
                            >
                              👁️
                            </button>
                            <button
                              className="px-3 py-1 bg-white/50 rounded hover:bg-white transition-colors text-sm"
                              title="Editar"
                            >
                              ✏️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
