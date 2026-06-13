'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Service {
  id: number;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  slug: string;
}

export default function ServiciosPage() {
  const router = useRouter();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 45,
    price: 40,
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services');
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingService
        ? `/api/services/${editingService.id}`
        : '/api/services';
      const method = editingService ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchServices();
        setShowModal(false);
        setEditingService(null);
        setFormData({ name: '', description: '', duration: 45, price: 40 });
      }
    } catch (error) {
      console.error('Error saving service:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      duration: service.duration,
      price: service.price,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return;

    try {
      const response = await fetch(`/api/services/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchServices();
      }
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingService(null);
    setFormData({ name: '', description: '', duration: 45, price: 40 });
  };

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-petrol text-sand py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-2xl">│</span>
            <span className="font-serif text-xl">Eje Fisioterapia</span>
            <span className="text-sm opacity-70">· Servicios</span>
          </div>
          <a href="/admin" className="text-sm hover:text-amber transition-colors">
            ← Volver al dashboard
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif text-petrol">Servicios y Tarifas</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors font-medium"
          >
            + Nuevo servicio
          </button>
        </div>

        <div className="bg-white rounded border-2 border-petrol/20 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-ink-light">Cargando...</div>
          ) : services.length === 0 ? (
            <div className="p-8 text-center text-ink-light">
              <p>No hay servicios registrados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-sand">
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-medium text-petrol">
                      Servicio
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-medium text-petrol">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-petrol">
                      Duración
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-petrol">
                      Precio
                    </th>
                    <th className="px-6 py-3 text-center text-sm font-medium text-petrol">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-petrol/10">
                  {services.map((service) => (
                    <tr key={service.id} className="hover:bg-sand/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-petrol">{service.name}</div>
                        <div className="text-sm text-ink-light">/{service.slug}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-ink-light max-w-md">
                          {service.description || 'Sin descripción'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm">{service.duration} min</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-lg font-semibold text-amber">
                          {service.price.toFixed(2)}€
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(service)}
                            className="px-3 py-1 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors text-sm"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(service.id)}
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
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-serif text-petrol mb-4">
              {editingService ? 'Editar servicio' : 'Nuevo servicio'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-petrol mb-2">
                  Nombre
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
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 rounded border border-petrol/20"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-petrol mb-2">
                    Duración (min)
                  </label>
                  <input
                    type="number"
                    required
                    min="15"
                    step="15"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 rounded border border-petrol/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-petrol mb-2">
                    Precio (€)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="5"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 rounded border border-petrol/20"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : editingService ? 'Actualizar' : 'Crear'}
                </button>
                <button
                  type="button"
                  onClick={handleModalClose}
                  className="px-4 py-2 bg-sand text-petrol rounded hover:bg-sand-warm transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
