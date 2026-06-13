import { auth } from '@/auth/auth';
import { db } from '@/db';
import { patients, professionals, services } from '@/db/schema';
import { eq } from 'drizzle-orm';
import NuevaCitaForm from './NuevaCitaForm';

export default async function NuevaCitaPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const session = await auth();
  if (!session) return null;

  const { date } = await searchParams;

  const [allPatients, allProfessionals, allServices] = await Promise.all([
    db.select({ id: patients.id, name: patients.name }).from(patients).orderBy(patients.name),
    db
      .select({ id: professionals.id, name: professionals.name, surname: professionals.surname })
      .from(professionals)
      .where(eq(professionals.active, true)),
    db
      .select({ id: services.id, name: services.name, duration: services.duration })
      .from(services)
      .where(eq(services.active, true))
      .orderBy(services.name),
  ]);

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-petrol text-sand py-4 px-6">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-2xl">│</span>
            <span className="font-serif text-xl">Eje Fisioterapia</span>
            <span className="text-sm opacity-70">· Nueva cita</span>
          </div>
          <a href="/admin/agenda" className="text-sm hover:text-amber transition-colors">
            ← Volver a la agenda
          </a>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-8">
        <h1 className="text-3xl font-serif text-petrol mb-2">Nueva cita</h1>
        <p className="text-ink-light mb-8">Da de alta una cita manualmente en la agenda.</p>

        {allPatients.length === 0 || allServices.length === 0 || allProfessionals.length === 0 ? (
          <div className="bg-white p-8 rounded border-2 border-amber text-center">
            <p className="text-petrol font-medium mb-1">Faltan datos</p>
            <p className="text-sm text-ink-light">
              Necesitas al menos un paciente, un profesional y un servicio para crear una cita.
            </p>
          </div>
        ) : (
          <NuevaCitaForm
            patients={allPatients}
            professionals={allProfessionals}
            services={allServices}
            defaultDate={date}
          />
        )}
      </main>
    </div>
  );
}
