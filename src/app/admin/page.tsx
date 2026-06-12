import { auth, signOut } from '@/auth/auth';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/admin/login');
  }

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
            <span className="text-sm">{session.user.email}</span>
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
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8">
          <h1 className="text-3xl font-serif text-petrol mb-8">Dashboard</h1>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded border-2 border-petrol/20">
              <div className="text-3xl font-bold text-petrol">0</div>
              <div className="text-sm text-ink-light">Citas hoy</div>
            </div>
            <div className="bg-white p-6 rounded border-2 border-petrol/20">
              <div className="text-3xl font-bold text-amber">0</div>
              <div className="text-sm text-ink-light">Pendientes</div>
            </div>
            <div className="bg-white p-6 rounded border-2 border-petrol/20">
              <div className="text-3xl font-bold text-petrol">0</div>
              <div className="text-sm text-ink-light">Pacientes activos</div>
            </div>
            <div className="bg-white p-6 rounded border-2 border-petrol/20">
              <div className="text-3xl font-bold text-amber">0</div>
              <div className="text-sm text-ink-light">Bonos activos</div>
            </div>
          </div>

          {/* Próximas citas */}
          <div className="bg-white p-6 rounded border-2 border-petrol/20 mb-8">
            <h2 className="text-xl font-serif text-petrol mb-4">Próximas citas</h2>
            <p className="text-ink-light">No hay próximas citas pendientes.</p>
          </div>

          {/* Últimos pacientes */}
          <div className="bg-white p-6 rounded border-2 border-petrol/20">
            <h2 className="text-xl font-serif text-petrol mb-4">Últimos pacientes</h2>
            <p className="text-ink-light">No hay pacientes registrados aún.</p>
          </div>

          {/* Info demo */}
          <div className="mt-8 bg-amber/10 p-6 rounded border-2 border-amber">
            <h3 className="font-semibold text-petrol mb-2">Panel en desarrollo</h3>
            <p className="text-sm text-ink-light">
              Este panel está siendo construido. Pronto incluirá:
            </p>
            <ul className="text-sm text-ink-light mt-2 space-y-1 list-disc list-inside">
              <li>Agenda por profesional con vista día/semana</li>
              <li>Fichas de pacientes con historial completo</li>
              <li>Biblioteca de ejercicios y asignación de pautas</li>
              <li>Gestión de bonos y seguimiento de sesiones</li>
              <li>CRUD de servicios y tarifas</li>
              <li>Configuración de disponibilidad</li>
              <li>Sistema de recordatorios y re-reserva</li>
            </ul>
          </div>
        </main>
      </div>
    </div>
  );
}
