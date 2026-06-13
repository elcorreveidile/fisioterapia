import { auth } from '@/auth/auth';
import { db } from '@/db';
import { patients, exercises, professionals } from '@/db/schema';
import { eq } from 'drizzle-orm';
import AsignarForm from './AsignarForm';

export default async function AsignarPautaPage() {
  const session = await auth();
  if (!session) return null;

  const [allPatients, allExercises, allProfessionals] = await Promise.all([
    db.select({ id: patients.id, name: patients.name }).from(patients).orderBy(patients.name),
    db
      .select({ id: exercises.id, title: exercises.title, category: exercises.category })
      .from(exercises)
      .where(eq(exercises.active, true))
      .orderBy(exercises.title),
    db
      .select({ id: professionals.id, name: professionals.name, surname: professionals.surname })
      .from(professionals)
      .where(eq(professionals.active, true)),
  ]);

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-petrol text-sand py-4 px-6">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-2xl">│</span>
            <span className="font-serif text-xl">Eje Fisioterapia</span>
            <span className="text-sm opacity-70">· Asignar pauta</span>
          </div>
          <a href="/admin/ejercicios" className="text-sm hover:text-amber transition-colors">
            ← Volver a ejercicios
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-8">
        <h1 className="text-3xl font-serif text-petrol mb-2">Asignar pauta de ejercicios</h1>
        <p className="text-ink-light mb-8">
          Selecciona un paciente y añade los ejercicios de su pauta. Se generará un único
          enlace <code className="text-sm bg-sand px-1 rounded">/pauta/…</code> con todos ellos.
        </p>

        {allPatients.length === 0 || allExercises.length === 0 ? (
          <div className="bg-white p-8 rounded border-2 border-amber text-center">
            <p className="text-petrol font-medium mb-1">Faltan datos para asignar</p>
            <p className="text-sm text-ink-light">
              Necesitas al menos un paciente y un ejercicio. Crea ejercicios en la
              biblioteca y pacientes en su sección (o ejecuta el seed de demo).
            </p>
          </div>
        ) : (
          <AsignarForm
            patients={allPatients}
            exercises={allExercises}
            professionals={allProfessionals}
          />
        )}
      </main>
    </div>
  );
}
