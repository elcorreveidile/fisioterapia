import { auth } from '@/auth/auth';
import { db } from '@/db';
import { leads } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default async function LeadsPage() {
  const session = await auth();
  if (!session) return null;

  // Obtener todos los leads ordenados por fecha
  const allLeads = await db
    .select()
    .from(leads)
    .orderBy(desc(leads.createdAt));

  // Calcular estadísticas
  const newLeads = allLeads.filter((l) => l.status === 'new');
  const contactedLeads = allLeads.filter((l) => l.status === 'contacted');
  const convertedLeads = allLeads.filter((l) => l.status === 'converted');

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-petrol text-sand py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-2xl">│</span>
            <span className="font-serif text-xl">Eje Fisioterapia</span>
            <span className="text-sm opacity-70">· Leads</span>
          </div>
          <a href="/admin" className="text-sm hover:text-amber transition-colors">
            ← Volver al dashboard
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-serif text-petrol mb-8">Leads y Contactos</h1>

        {/* Estadísticas */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded border-2 border-petrol/20">
            <div className="text-3xl font-bold text-petrol">{allLeads.length}</div>
            <div className="text-sm text-ink-light">Total leads</div>
          </div>
          <div className="bg-white p-6 rounded border-2 border-petrol/20">
            <div className="text-3xl font-bold text-amber">{newLeads.length}</div>
            <div className="text-sm text-ink-light">Nuevos</div>
          </div>
          <div className="bg-white p-6 rounded border-2 border-petrol/20">
            <div className="text-3xl font-bold text-petrol">{contactedLeads.length}</div>
            <div className="text-sm text-ink-light">Contactados</div>
          </div>
          <div className="bg-white p-6 rounded border-2 border-petrol/20">
            <div className="text-3xl font-bold text-green-600">{convertedLeads.length}</div>
            <div className="text-sm text-ink-light">Convertidos</div>
          </div>
        </div>

        {/* Lista de leads */}
        <div className="bg-white rounded border-2 border-petrol/20 overflow-hidden">
          {allLeads.length === 0 ? (
            <div className="p-8 text-center text-ink-light">
              <p className="mb-2">📧 No hay contactos registrados</p>
              <p className="text-sm">
                Los leads se crean automáticamente desde el formulario de contacto
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sand">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-petrol">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-petrol">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-petrol">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-petrol">
                      Teléfono
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-petrol">
                      Mensaje
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-petrol">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-petrol">
                      Origen
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-petrol">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-petrol/10">
                  {allLeads.map((lead) => {
                    const statusColors = {
                      new: 'bg-amber-100 text-amber-800',
                      contacted: 'bg-blue-100 text-blue-800',
                      converted: 'bg-green-100 text-green-800',
                      lost: 'bg-gray-100 text-gray-800',
                    };

                    const statusLabels = {
                      new: 'Nuevo',
                      contacted: 'Contactado',
                      converted: 'Convertido',
                      lost: 'Perdido',
                    };

                    return (
                      <tr key={lead.id} className="hover:bg-sand/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-ink-light">
                          {format(lead.createdAt, "d MMM 'yy'", { locale: es })}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-petrol">{lead.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <a
                            href={`mailto:${lead.email}`}
                            className="text-petrol hover:text-amber transition-colors"
                          >
                            {lead.email}
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          {lead.phone ? (
                            <a
                              href={`tel:${lead.phone}`}
                              className="text-petrol hover:text-amber transition-colors"
                            >
                              {lead.phone}
                            </a>
                          ) : (
                            <span className="text-ink-light text-sm">No proporcionado</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="max-w-md text-sm text-ink-light line-clamp-2">
                            {lead.message}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              statusColors[lead.status as keyof typeof statusColors]
                            }`}
                          >
                            {statusLabels[lead.status as keyof typeof statusLabels]}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center text-sm">
                          {lead.source || 'Web'}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              className="px-3 py-1 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors text-sm"
                              title="Contactar"
                            >
                              📞
                            </button>
                            <button
                              className="px-3 py-1 bg-sand text-petrol rounded hover:bg-sand-warm transition-colors text-sm"
                              title="Ver detalles"
                            >
                              👁️
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Información */}
        <div className="mt-6 grid grid-cols-2 gap-6">
          <div className="bg-blue/10 p-6 rounded border-2 border-blue">
            <h3 className="font-semibold text-petrol mb-2">📊 Flujo de conversión</h3>
            <div className="text-sm text-ink-light space-y-1">
              <p>• Nuevo → Primer contacto con el lead</p>
              <p>• Contactado → Seguimiento realizado</p>
              <p>• Convertido → Paciente registrado</p>
              <p>• Perdido → No interesado</p>
            </div>
          </div>

          <div className="bg-green/10 p-6 rounded border-2 border-green">
            <h3 className="font-semibold text-petrol mb-2">📈 Tasa de conversión</h3>
            <div className="text-sm text-ink-light">
              {allLeads.length > 0 ? (
                <p>
                  {((convertedLeads.length / allLeads.length) * 100).toFixed(1)}% de los leads se convierten en pacientes
                </p>
              ) : (
                <p>No hay datos suficientes</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
