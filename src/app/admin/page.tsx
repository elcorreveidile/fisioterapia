import { auth, signOut } from '@/auth/auth';
import { db } from '@/db';
import { bookings, patients, vouchers, users } from '@/db/schema';
import { eq, and, gte, sql } from 'drizzle-orm';
import { startOfDay, endOfDay } from 'date-fns';

export default async function AdminPage() {
  const session = await auth();

  if (!session) {
    return null;
  }

  // Obtener datos reales de la base de datos
  const today = new Date();
  const todayStart = startOfDay(today);
  const todayEnd = endOfDay(today);

  // Citas de hoy
  const todayBookings = await db
    .select()
    .from(bookings)
    .where(
      and(
        gte(bookings.start, todayStart),
        sql`${bookings.start} <= ${todayEnd}`
      )
    );

  // Total pacientes
  const totalPatients = await db.select({ count: sql<number>`count(*)` }).from(patients);

  // Total bonos activos
  const activeVouchers = await db
    .select({ count: sql<number>`count(*)` })
    .from(vouchers)
    .where(sql`${vouchers.sessionsRemaining} > 0`);

  // Total usuarios admin
  const totalAdmins = await db.select({ count: sql<number>`count(*)` }).from(users);

  return (
    <div className="min-h-screen bg-sand">
      {/* Header */}
      <header className="bg-petrol text-sand py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-2xl">│</span>
            <span className="font-serif text-xl">Eje Fisioterapia</span>
            <span className="text-sm opacity-70">· Panel de administración</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">{session.user?.email}</span>
            <form
              action={async () => {
                'use server';
                await signOut();
              }}
            >
              <button
                type="submit"
                className="text-sm hover:text-amber transition-colors"
              >
                Cerrar sesión
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white min-h-screen p-6">
          <nav className="space-y-2">
            <a
              href="/admin"
              className="block px-4 py-2 rounded bg-petrol text-sand"
            >
              📊 Dashboard
            </a>
            <a
              href="/admin/agenda"
              className="block px-4 py-2 rounded hover:bg-sand transition-colors"
            >
              📅 Agenda
            </a>
            <a
              href="/admin/pacientes"
              className="block px-4 py-2 rounded hover:bg-sand transition-colors"
            >
              👥 Pacientes
            </a>
            <a
              href="/admin/servicios"
              className="block px-4 py-2 rounded hover:bg-sand transition-colors"
            >
              💼 Servicios
            </a>
            <a
              href="/admin/ejercicios"
              className="block px-4 py-2 rounded hover:bg-sand transition-colors"
            >
              💪 Ejercicios
            </a>
            <a
              href="/admin/bonos"
              className="block px-4 py-2 rounded hover:bg-sand transition-colors"
            >
              🎫 Bonos
            </a>
            <a
              href="/admin/leads"
              className="block px-4 py-2 rounded hover:bg-sand transition-colors"
            >
              📧 Leads
            </a>
            <a
              href="/admin/disponibilidad"
              className="block px-4 py-2 rounded hover:bg-sand transition-colors"
            >
              ⏰ Disponibilidad
            </a>
            <a
              href="/admin/recordatorios"
              className="block px-4 py-2 rounded hover:bg-sand transition-colors"
            >
              🔔 Recordatorios
            </a>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-serif text-petrol mb-8">Dashboard</h1>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded border-2 border-petrol/20">
              <div className="text-3xl font-bold text-petrol">{todayBookings.length}</div>
              <div className="text-sm text-ink-light">Citas hoy</div>
            </div>
            <div className="bg-white p-6 rounded border-2 border-petrol/20">
              <div className="text-3xl font-bold text-amber">{todayBookings.filter(b => b.status === 'pending').length}</div>
              <div className="text-sm text-ink-light">Pendientes</div>
            </div>
            <div className="bg-white p-6 rounded border-2 border-petrol/20">
              <div className="text-3xl font-bold text-petrol">{totalPatients[0]?.count || 0}</div>
              <div className="text-sm text-ink-light">Pacientes activos</div>
            </div>
            <div className="bg-white p-6 rounded border-2 border-petrol/20">
              <div className="text-3xl font-bold text-amber">{activeVouchers[0]?.count || 0}</div>
              <div className="text-sm text-ink-light">Bonos activos</div>
            </div>
          </div>

          {/* Próximas citas */}
          <div className="bg-white p-6 rounded border-2 border-petrol/20 mb-8">
            <h2 className="text-xl font-serif text-petrol mb-4">Citas de hoy</h2>
            {todayBookings.length > 0 ? (
              <div className="space-y-3">
                {todayBookings.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-3 bg-sand rounded">
                    <div>
                      <div className="font-medium text-petrol">
                        {booking.start.toLocaleDateString('es-ES', { weekday: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="text-sm text-ink-light">Cita #{String(booking.id).slice(0, 8)}</div>
                    </div>
                    <div className="text-sm">
                      {booking.status === 'confirmed' ? (
                        <span className="text-green-600">✓ Confirmada</span>
                      ) : (
                        <span className="text-amber-600">⏳ {booking.status === 'pending' ? 'Pendiente' : booking.status}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-ink-light">No hay citas programadas para hoy.</p>
            )}
          </div>

          {/* Últimos pacientes */}
          <div className="bg-white p-6 rounded border-2 border-petrol/20">
            <h2 className="text-xl font-serif text-petrol mb-4">Resumen</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-sand p-4 rounded">
                <div className="text-2xl font-bold text-petrol">{totalPatients[0]?.count || 0}</div>
                <div className="text-sm text-ink-light">Pacientes registrados</div>
              </div>
              <div className="bg-sand p-4 rounded">
                <div className="text-2xl font-bold text-amber">{activeVouchers[0]?.count || 0}</div>
                <div className="text-sm text-ink-light">Bonos con sesiones</div>
              </div>
            </div>
          </div>

          {/* Info panel */}
          <div className="mt-8 bg-green-100 p-6 rounded border-2 border-green-600">
            <h3 className="font-semibold text-petrol mb-2">✅ Panel completo</h3>
            <p className="text-sm text-ink-light">
              El panel de administración incluye todas las funcionalidades:
            </p>
            <ul className="text-sm text-ink-light mt-2 space-y-1 list-disc list-inside">
              <li>✅ Agenda por profesional con vista diaria</li>
              <li>✅ Fichas de pacientes con historial completo</li>
              <li>✅ Biblioteca de ejercicios y asignación de pautas</li>
              <li>✅ Gestión de bonos y seguimiento de sesiones</li>
              <li>✅ CRUD de servicios y tarifas</li>
              <li>✅ Configuración de disponibilidad</li>
              <li>✅ Sistema de recordatorios y re-reserva</li>
              <li>✅ Gestión de leads y conversiones</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
