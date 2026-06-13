import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/db';
import { patientExercises, exercises, patients, professionals } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface Props {
  params: Promise<{ token: string }>;
}

export default async function PautaPage({ params }: Props) {
  const { token } = await params;

  // Obtener las asignaciones de ejercicios para este token
  const patientExercisesList = await db.query.patientExercises.findMany({
    where: eq(patientExercises.token, token),
    with: {
      exercise: true,
      patient: {
        columns: { name: true },
      },
      professional: {
        columns: { name: true, surname: true },
      },
    },
  });

  if (patientExercisesList.length === 0) {
    notFound();
  }

  const patientName = patientExercisesList[0].patient.name;
  const professionalName = `${patientExercisesList[0].professional.name} ${patientExercisesList[0].professional.surname}`;

  return (
    <div className="min-h-screen bg-sand">
      {/* Header */}
      <header className="bg-petrol text-sand py-6 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">│</span>
              <span className="font-serif text-xl">Eje Fisioterapia</span>
            </div>
            <p className="text-sm opacity-80">Tu pauta de ejercicios</p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-serif text-petrol mb-2">
            Hola, {patientName}
          </h1>
          <p className="text-ink-light">
 Estos son los ejercicios que te ha asignado {professionalName}. Síguelos en casa y podrás ver cómo mejora tu dolor.
          </p>
        </div>

        {/* Ejercicios */}
        <div className="space-y-6">
          {patientExercisesList.map((item, index) => (
            <div key={item.id} className="bg-white p-6 rounded border-2 border-petrol/20">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-amber rounded-full flex items-center justify-center text-petrol font-bold text-lg">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-serif text-petrol mb-2">
                    {item.exercise.title}
                  </h2>
                  <p className="text-ink-light mb-4">
                    {item.exercise.description}
                  </p>

                  <div className="grid md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-ink-light">Series</p>
                      <p className="font-medium text-petrol">{item.series}</p>
                    </div>
                    <div>
                      <p className="text-sm text-ink-light">Repeticiones</p>
                      <p className="font-medium text-petrol">{item.repetitions}</p>
                    </div>
                    <div>
                      <p className="text-sm text-ink-light">Frecuencia</p>
                      <p className="font-medium text-petrol">{item.frequency}</p>
                    </div>
                  </div>

                  {item.observations && (
                    <div className="bg-sand p-4 rounded">
                      <p className="text-sm font-medium text-petrol mb-1">Observaciones</p>
                      <p className="text-sm text-ink-light">{item.observations}</p>
                    </div>
                  )}

                  {item.exercise.videoUrl && (
                    <a
                      href={item.exercise.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block mt-4 text-petrol hover:text-amber transition-colors text-sm font-medium"
                    >
                      Ver video explicativo →
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Consejos */}
        <div className="mt-12 bg-white p-6 rounded border-2 border-amber">
          <h3 className="font-semibold text-petrol mb-4">Consejos para hacer los ejercicios</h3>
          <ul className="space-y-2 text-sm text-ink-light">
            <li>✓ Respira de forma normal mientras haces los ejercicios</li>
            <li>✓ No fuerces si sientes dolor agudo; molestia leve es normal</li>
            <li>✓ Sé constante: es mejor hacer pocos ejercicios cada día que muchos una vez</li>
            <li>✓ Si tienes dudas, contacta con tu fisioterapeuta</li>
          </ul>
        </div>

        {/* Contacto */}
        <div className="mt-8 text-center">
          <p className="text-ink-light mb-4">
            ¿Tienes dudas sobre tu pauta?
          </p>
          <a
            href="tel:+34600123456"
            className="inline-block bg-petrol text-sand px-6 py-3 rounded hover:bg-petrol-dark transition-colors font-medium"
          >
            Llamar a la clínica
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-petrol surface-texture-light text-sand py-8 px-6 mt-12">
        <div className="max-w-4xl mx-auto text-center text-sm opacity-70">
          <p className="mb-2">Eje Fisioterapia · Entiende tu dolor</p>
          <p>Esta es una página personalizada con tus ejercicios. Guárdala en favoritos para consultarla cuando necesites.</p>
        </div>
      </footer>
    </div>
  );
}
