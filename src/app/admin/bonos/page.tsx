import { auth } from '@/auth/auth';
import { db } from '@/db';
import { vouchers, patients } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default async function BonosPage() {
  const session = await auth();
  if (!session) return null;

  // Obtener todos los bonos con información de pacientes
  const allVouchers = await db
    .select({
      id: vouchers.id,
      type: vouchers.type,
      sessionsRemaining: vouchers.sessionsRemaining,
      createdAt: vouchers.createdAt,
      patientId: vouchers.patientId,
      patientName: patients.name,
      patientEmail: patients.email,
    })
    .from(vouchers)
    .innerJoin(patients, eq(vouchers.patientId, patients.id))
    .orderBy(vouchers.createdAt);

  // Calcular sessionsTotal a partir del tipo
  const vouchersWithTotal = allVouchers.map((v) => ({
    ...v,
    sessionsTotal: v.type === '5' ? 5 : 10,
    serviceName: 'Bono de sesiones', // Generic service name
  }));

  // Calcular estadísticas
  const activeVouchers = vouchersWithTotal.filter((v) => v.sessionsRemaining > 0);
  const expiredVouchers = vouchersWithTotal.filter((v) => v.sessionsRemaining === 0);

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-petrol text-sand py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-2xl">│</span>
            <span className="font-serif text-xl">Eje Fisioterapia</span>
            <span className="text-sm opacity-70">· Bonos</span>
          </div>
          <a href="/admin" className="text-sm hover:text-amber transition-colors">
            ← Volver al dashboard
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif text-petrol">Gestión de Bonos</h1>
          <button className="px-6 py-3 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors font-medium">
            + Nuevo bono
          </button>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded border-2 border-petrol/20">
            <div className="text-3xl font-bold text-petrol">{vouchersWithTotal.length}</div>
            <div className="text-sm text-ink-light">Total bonos</div>
          </div>
          <div className="bg-white p-6 rounded border-2 border-petrol/20">
            <div className="text-3xl font-bold text-amber">{activeVouchers.length}</div>
            <div className="text-sm text-ink-light">Bonos activos</div>
          </div>
          <div className="bg-white p-6 rounded border-2 border-petrol/20">
            <div className="text-3xl font-bold text-petrol">{expiredVouchers.length}</div>
            <div className="text-sm text-ink-light">Bonos agotados</div>
          </div>
        </div>

        {/* Lista de bonos */}
        <div className="bg-white rounded border-2 border-petrol/20 overflow-hidden">
          {vouchersWithTotal.length === 0 ? (
            <div className="p-8 text-center text-ink-light">
              <p className="mb-2">🎫 No hay bonos registrados</p>
              <p className="text-sm">Los bonos se crean automáticamente al reservar</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sand">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-petrol">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-petrol">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-petrol">
                      Servicio
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-petrol">
                      Progreso
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-petrol">
                      Sesiones
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-petrol">
                      Fecha creación
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-petrol">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-petrol">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-petrol/10">
                  {vouchersWithTotal.map((voucher) => {
                    const progress = ((voucher.sessionsTotal - voucher.sessionsRemaining) / voucher.sessionsTotal) * 100;
                    const isActive = voucher.sessionsRemaining > 0;

                    return (
                      <tr key={voucher.id} className="hover:bg-sand/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-petrol">{voucher.patientName}</div>
                          <div className="text-sm text-ink-light">{voucher.patientEmail}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            voucher.type === '5'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {voucher.type === '5' ? 'Bono 5 sesiones' : 'Bono 10 sesiones'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-ink-light">
                          {voucher.serviceName}
                        </td>
                        <td className="px-6 py-4">
                          <div className="w-full max-w-xs">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-ink-light">Progreso</span>
                              <span className="text-xs font-medium text-petrol">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full transition-colors ${
                                  isActive ? 'bg-amber' : 'bg-gray-400'
                                }`}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="text-lg font-semibold text-petrol">
                            {voucher.sessionsRemaining}
                          </div>
                          <div className="text-xs text-ink-light">de {voucher.sessionsTotal}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-ink-light">
                          {format(voucher.createdAt, 'd MMM yyyy', { locale: es })}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {isActive ? (
                            <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium">
                              Activo
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-800 text-sm font-medium">
                              Agotado
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <a
                              href={`/admin/pacientes/${voucher.patientId}`}
                              className="px-3 py-1 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors text-sm"
                            >
                              Ver paciente
                            </a>
                            {isActive && (
                              <button
                                className="px-3 py-1 bg-amber text-petrol rounded hover:bg-amber-dark transition-colors text-sm"
                                title="Añadir sesiones"
                              >
                                +
                              </button>
                            )}
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
        <div className="mt-6 bg-amber/10 p-6 rounded border-2 border-amber">
          <h3 className="font-semibold text-petrol mb-2">💡 Información sobre bonos</h3>
          <div className="text-sm text-ink-light space-y-1">
            <p>• Los bonos se crean automáticamente cuando un paciente reserva con bono</p>
            <p>• Bono de 5 sesiones: 20% de descuento sobre el precio individual</p>
            <p>• Bono de 10 sesiones: 25% de descuento sobre el precio individual</p>
            <p>• Las sesiones se descontan automáticamente tras cada cita completada</p>
          </div>
        </div>
      </main>
    </div>
  );
}
