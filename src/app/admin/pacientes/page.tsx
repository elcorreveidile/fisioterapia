'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  createdAt: Date;
  bookingsCount?: number;
  activeVouchers?: number;
  remainingSessions?: number;
  lastVisit?: Date | null;
}

function PacientesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParam = searchParams.get('search') || '';

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParam);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchPatients();
  }, [searchParam]);

  const fetchPatients = async () => {
    try {
      const url = searchParam
        ? `/api/admin/patients?search=${encodeURIComponent(searchParam)}`
        : '/api/admin/patients';

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, name: string) => {
    if (
      !confirm(
        `¿Eliminar a ${name}? Se borrarán también sus citas, bonos, notas y pautas. Esta acción no se puede deshacer.`
      )
    ) {
      return;
    }
    try {
      const response = await fetch(`/api/admin/patients/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchPatients();
      } else {
        const error = await response.json().catch(() => ({}));
        alert('Error al eliminar: ' + (error.error || 'Error desconocido'));
      }
    } catch {
      alert('Error al eliminar el paciente');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) {
      params.set('search', searchTerm);
    }
    router.push(`/admin/pacientes?${params.toString()}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/admin/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchPatients();
        setShowModal(false);
        setFormData({ name: '', email: '', phone: '' });
      } else {
        const error = await response.json();
        alert('Error al crear paciente: ' + (error.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error('Error creating patient:', error);
      alert('Error al crear paciente');
    }
  };

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-petrol text-sand py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-2xl">│</span>
            <span className="font-serif text-xl">Eje Fisioterapia</span>
            <span className="text-sm opacity-70">· Pacientes</span>
          </div>
          <a href="/admin" className="text-sm hover:text-amber transition-colors">
            ← Volver al dashboard
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif text-petrol">Pacientes</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors font-medium"
          >
            + Nuevo paciente
          </button>
        </div>

        {/* Búsqueda */}
        <div className="bg-white p-6 rounded border-2 border-petrol/20 mb-6">
          <form onSubmit={handleSearch}>
            <div className="flex gap-2">
              <input
                type="search"
                placeholder="Buscar por nombre, email o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-3 rounded border border-petrol/20"
              />
              <button type="submit" className="px-6 py-3 bg-petrol text-sand rounded">
                Buscar
              </button>
            </div>
          </form>
        </div>

        {/* Lista de pacientes */}
        <div className="bg-white rounded border-2 border-petrol/20 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-ink-light">Cargando...</div>
          ) : patients.length === 0 ? (
            <div className="p-8 text-center text-ink-light">
              <p className="mb-2">👥 No hay pacientes registrados</p>
              <p className="text-sm">
                {searchParam ? 'No se encontraron resultados para tu búsqueda' : 'El primer paciente se registrará al hacer una reserva'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sand">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-petrol">Paciente</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-petrol">Contacto</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-petrol">Citas</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-petrol">Bonos</th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-petrol">Última visita</th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-petrol">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-petrol/10">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-sand/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-petrol">{patient.name}</div>
                        <div className="text-sm text-ink-light">
                          Desde {format(new Date(patient.createdAt), 'MMM yyyy', { locale: es })}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="flex items-center gap-2">
                            📧 {patient.email}
                          </div>
                          {patient.phone && (
                            <div className="flex items-center gap-2">
                              📞 {patient.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-lg font-semibold text-petrol">{patient.bookingsCount || 0}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-lg font-semibold text-amber">{patient.activeVouchers || 0}</div>
                        {(patient.activeVouchers ?? 0) > 0 && (
                          <div className="text-xs text-ink-light">
                            {patient.remainingSessions} sesiones restantes
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {patient.lastVisit ? (
                          <div className="text-sm">
                            {format(new Date(patient.lastVisit), "d MMM 'yy", { locale: es })}
                          </div>
                        ) : (
                          <div className="text-sm text-ink-light">Sin visitas</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <a
                            href={`/admin/pacientes/${patient.id}`}
                            className="px-3 py-1 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors text-sm"
                          >
                            Ver ficha
                          </a>
                          <button
                            onClick={() => handleDelete(patient.id, patient.name)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded border-2 border-petrol/20">
            <div className="text-2xl font-bold text-petrol">{patients.length}</div>
            <div className="text-sm text-ink-light">Pacientes totales</div>
          </div>
          <div className="bg-white p-4 rounded border-2 border-petrol/20">
            <div className="text-2xl font-bold text-petrol">
              {patients.filter((p) => (p.bookingsCount || 0) > 0).length}
            </div>
            <div className="text-sm text-ink-light">Con visitas</div>
          </div>
          <div className="bg-white p-4 rounded border-2 border-petrol/20">
            <div className="text-2xl font-bold text-amber">
              {patients.filter((p) => (p.activeVouchers || 0) > 0).length}
            </div>
            <div className="text-sm text-ink-light">Con bonos activos</div>
          </div>
        </div>

        {/* Modal para nuevo paciente */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h2 className="text-2xl font-serif text-petrol mb-4">Nuevo Paciente</h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-petrol mb-2">
                    Nombre completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 rounded border border-petrol/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-petrol mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 rounded border border-petrol/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-petrol mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-2 rounded border border-petrol/20"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors"
                  >
                    Crear
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setFormData({ name: '', email: '', phone: '' });
                    }}
                    className="px-4 py-2 bg-sand text-petrol rounded hover:bg-sand-warm transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function PacientesPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-ink-light">Cargando…</div>}>
      <PacientesContent />
    </Suspense>
  );
}
