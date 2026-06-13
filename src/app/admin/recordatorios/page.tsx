import { auth } from '@/auth/auth';
import { db } from '@/db';
import { scheduledEmails, bookings, patients, services } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import SendEmailButton from './SendEmailButton';

export default async function RecordatoriosPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string }>;
}) {
  const session = await auth();
  if (!session) return null;

  const { filter = 'all' } = await searchParams;

  // Obtener emails programados con información de reservas
  const allEmails = await db
    .select({
      id: scheduledEmails.id,
      type: scheduledEmails.type,
      scheduledFor: scheduledEmails.scheduledFor,
      sent: scheduledEmails.sent,
      sentAt: scheduledEmails.sentAt,
      error: scheduledEmails.error,
      bookingId: scheduledEmails.bookingId,
      bookingStart: bookings.start,
      patientName: patients.name,
      patientEmail: patients.email,
      serviceName: services.name,
    })
    .from(scheduledEmails)
    .innerJoin(bookings, eq(scheduledEmails.bookingId, bookings.id))
    .innerJoin(patients, eq(bookings.patientId, patients.id))
    .innerJoin(services, eq(bookings.serviceId, services.id))
    .orderBy(scheduledEmails.scheduledFor)
    .limit(50);

  // Clasificar emails
  const pendingEmails = allEmails.filter((e) => !e.sent);
  const sentEmails = allEmails.filter((e) => e.sent);
  const errorEmails = allEmails.filter((e) => e.error);

  const displayedEmails =
    filter === 'pending'
      ? pendingEmails
      : filter === 'sent'
        ? sentEmails
        : filter === 'errors'
          ? errorEmails
          : allEmails;

  // Calcular estadísticas
  const reminder24h = pendingEmails.filter((e) => e.type === 'reminder_24h').length;
  const followUps = pendingEmails.filter((e) => e.type === 'follow_up').length;
  const reBookings = pendingEmails.filter((e) => e.type === 're_booking').length;

  const emailTypes = {
    reminder_24h: 'Recordatorio 24h',
    follow_up: 'Seguimiento post-cita',
    re_booking: 'Sugerencia re-reserva',
  };

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-petrol text-sand py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-2xl">│</span>
            <span className="font-serif text-xl">Eje Fisioterapia</span>
            <span className="text-sm opacity-70">· Recordatorios</span>
          </div>
          <a href="/admin" className="text-sm hover:text-amber transition-colors">
            ← Volver al dashboard
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif text-petrol">Sistema de Recordatorios</h1>
          <button className="px-6 py-3 bg-amber text-petrol rounded hover:bg-amber-dark transition-colors font-medium">
            Configurar email service
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded border-2 border-petrol/20">
            <div className="text-3xl font-bold text-petrol">{pendingEmails.length}</div>
            <div className="text-sm text-ink-light">Pendientes</div>
          </div>
          <div className="bg-white p-6 rounded border-2 border-petrol/20">
            <div className="text-3xl font-bold text-green-600">{sentEmails.length}</div>
            <div className="text-sm text-ink-light">Enviados</div>
          </div>
          <div className="bg-white p-6 rounded border-2 border-petrol/20">
            <div className="text-3xl font-bold text-amber">{reminder24h}</div>
            <div className="text-sm text-ink-light">Recordatorios 24h</div>
          </div>
          <div className="bg-white p-6 rounded border-2 border-petrol/20">
            <div className="text-3xl font-bold text-red-600">{errorEmails.length}</div>
            <div className="text-sm text-ink-light">Con errores</div>
          </div>
        </div>

        {/* Tabs para diferentes tipos */}
        <div className="mb-6">
          <div className="flex gap-4 border-b border-petrol/20">
            {[
              { key: 'all', label: 'Todos', count: allEmails.length },
              { key: 'pending', label: 'Pendientes', count: pendingEmails.length },
              { key: 'sent', label: 'Enviados', count: sentEmails.length },
              { key: 'errors', label: 'Con errores', count: errorEmails.length },
            ].map((tab) => (
              <a
                key={tab.key}
                href={`?filter=${tab.key}`}
                className={`px-4 py-2 ${
                  filter === tab.key
                    ? 'border-b-2 border-petrol text-petrol font-medium'
                    : 'text-ink-light hover:text-petrol'
                }`}
              >
                {tab.label} ({tab.count})
              </a>
            ))}
          </div>
        </div>

        {/* Lista de emails programados */}
        <div className="bg-white rounded border-2 border-petrol/20 overflow-hidden">
          {displayedEmails.length === 0 ? (
            <div className="p-8 text-center text-ink-light">
              <p className="mb-2">📧 No hay emails en esta vista</p>
              <p className="text-sm">Los emails se crean automáticamente al confirmar citas</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sand">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-petrol">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-petrol">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-petrol">
                      Cita
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-petrol">
                      Programado para
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-petrol">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-petrol">
                      Enviado
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-petrol">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-petrol/10">
                  {displayedEmails.map((email) => (
                    <tr key={email.id} className="hover:bg-sand/50 transition-colors">
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          email.type === 'reminder_24h'
                            ? 'bg-blue-100 text-blue-800'
                            : email.type === 'follow_up'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {emailTypes[email.type as keyof typeof emailTypes]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-petrol">{email.patientName}</div>
                        <div className="text-sm text-ink-light">{email.patientEmail}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-light">
                        <div>{email.serviceName}</div>
                        <div>{format(email.bookingStart, 'd MMM yy, HH:mm', { locale: es })}</div>
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-light">
                        {format(email.scheduledFor, 'd MMM yy, HH:mm', { locale: es })}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {email.error ? (
                          <span className="px-3 py-1 rounded-full bg-red-100 text-red-800 text-sm font-medium">
                            Error
                          </span>
                        ) : email.sent ? (
                          <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                            Enviado
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium">
                            Pendiente
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-ink-light">
                        {email.sentAt ? format(email.sentAt, 'HH:mm', { locale: es }) : '-'}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {email.error ? (
                            <SendEmailButton emailId={email.id} label="Reintentar" variant="retry" />
                          ) : !email.sent ? (
                            <SendEmailButton emailId={email.id} label="Enviar" />
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Información */}
        <div className="mt-6 bg-amber/10 p-6 rounded border-2 border-amber">
          <h3 className="font-semibold text-petrol mb-2">💡 Información sobre recordatorios</h3>
          <div className="text-sm text-ink-light space-y-1">
            <p>• <strong>Recordatorio 24h:</strong> Se envía 24 horas antes de la cita</p>
            <p>• <strong>Seguimiento post-cita:</strong> Se envía 24 horas después de una cita completada</p>
            <p>• <strong>Re-reserva:</strong> Se envía 7 días después de una cita completada, suger nueva cita</p>
            <p>• Los emails se procesan automáticamente mediante cron jobs cada hora</p>
            <p>• Requiere configuración de servicio de email (Resend, SendGrid, etc.)</p>
          </div>
        </div>
      </main>
    </div>
  );
}
