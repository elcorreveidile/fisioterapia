import { auth } from '@/auth/auth';
import { db } from '@/db';
import { professionals, availabilityRules, blockedSlots } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default async function DisponibilidadPage() {
  const session = await auth();
  if (!session) return null;

  // Obtener todos los profesionales
  const allProfessionals = await db
    .select()
    .from(professionals)
    .where(eq(professionals.active, true))
    .orderBy(professionals.name);

  // Obtener todas las reglas de disponibilidad
  const allRules = await db
    .select()
    .from(availabilityRules)
    .where(eq(availabilityRules.active, true))
    .orderBy(availabilityRules.dayOfWeek);

  // Agrupar reglas por profesional
  const rulesByProfessional = allRules.reduce((acc, rule) => {
    if (!acc[rule.professionalId]) {
      acc[rule.professionalId] = [];
    }
    acc[rule.professionalId].push(rule);
    return acc;
  }, {} as Record<number, typeof allRules>);

  // Obtener slots bloqueados (futuros)
  const now = new Date();
  const allBlockedSlots = await db
    .select()
    .from(blockedSlots)
    .where(eq(blockedSlots.professionalId, allProfessionals[0]?.id || 0))
    .orderBy(blockedSlots.start);

  const dayNames = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-petrol text-sand py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-2xl">│</span>
            <span className="font-serif text-xl">Eje Fisioterapia</span>
            <span className="text-sm opacity-70">· Disponibilidad</span>
          </div>
          <a href="/admin" className="text-sm hover:text-amber transition-colors">
            ← Volver al dashboard
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif text-petrol">Configuración de Disponibilidad</h1>
          <button className="px-6 py-3 bg-amber text-petrol rounded hover:bg-amber-dark transition-colors font-medium">
            + Bloquear hueco
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Reglas de disponibilidad por profesional */}
          <div className="space-y-6">
            <h2 className="text-xl font-serif text-petrol">Horarios semanales</h2>

            {allProfessionals.map((professional) => {
              const professionalRules = rulesByProfessional[professional.id] || [];

              return (
                <div key={professional.id} className="bg-white p-6 rounded border-2 border-petrol/20">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium text-petrol">{professional.name} {professional.surname}</h3>
                    <button className="text-sm text-amber hover:text-amber-dark">
                      + Añadir horario
                    </button>
                  </div>

                  {professionalRules.length === 0 ? (
                    <p className="text-sm text-ink-light">Sin horarios configurados</p>
                  ) : (
                    <div className="space-y-2">
                      {professionalRules.map((rule) => (
                        <div key={rule.id} className="flex items-center justify-between p-2 bg-sand rounded">
                          <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-petrol w-24">
                              {dayNames[rule.dayOfWeek]}
                            </span>
                            <span className="text-sm text-ink-light">
                              {rule.startTime} - {rule.endTime}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <button className="text-xs text-petrol hover:text-amber">
                              Editar
                            </button>
                            <button className="text-xs text-red-600 hover:text-red-800">
                              Eliminar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Huecos bloqueados */}
          <div className="space-y-6">
            <h2 className="text-xl font-serif text-petrol">Huecos bloqueados</h2>

            <div className="bg-white p-6 rounded border-2 border-petrol/20">
              <div className="mb-4">
                <label className="block text-sm font-medium text-petrol mb-2">
                  Filtrar por profesional
                </label>
                <select className="w-full px-3 py-2 border border-petrol/20 rounded">
                  {allProfessionals.map((prof) => (
                    <option key={prof.id} value={prof.id}>
                      {prof.name} {prof.surname}
                    </option>
                  ))}
                </select>
              </div>

              {allBlockedSlots.length === 0 ? (
                <p className="text-sm text-ink-light">No hay huecos bloqueados</p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {allBlockedSlots.map((slot) => (
                    <div key={slot.id} className="p-3 bg-sand rounded">
                      <div className="flex items-center justify-between mb-1">
                        <div className="font-medium text-petrol">
                          {format(slot.start, 'd MMM', { locale: es })}
                        </div>
                        <div className="text-sm text-ink-light">
                          {format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}
                        </div>
                      </div>
                      {slot.reason && (
                        <div className="text-sm text-ink-light mt-1">
                          Motivo: {slot.reason}
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button className="text-xs text-petrol hover:text-amber">
                          Editar
                        </button>
                        <button className="text-xs text-red-600 hover:text-red-800">
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información */}
        <div className="mt-6 bg-amber/10 p-6 rounded border-2 border-amber">
          <h3 className="font-semibold text-petrol mb-2">💡 Información sobre disponibilidad</h3>
          <div className="text-sm text-ink-light space-y-1">
            <p>• Los horarios semanales definen cuándo está disponible cada profesional</p>
            <p>• Los huecos bloqueados tienen prioridad sobre los horarios semanales</p>
            <p>• Los pacientes solo pueden reservar en horarios disponibles y no bloqueados</p>
            <p>• Los bloques se usan para vacaciones, días concretos, o ausencias temporales</p>
          </div>
        </div>
      </main>
    </div>
  );
}
