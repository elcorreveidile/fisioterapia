'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Exercise {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
}

export default function EjerciciosPage() {
  const router = useRouter();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    imageUrl: '',
    videoUrl: '',
  });

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    try {
      const response = await fetch('/api/exercises');
      if (response.ok) {
        const data = await response.json();
        setExercises(data);
      }
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingExercise
        ? `/api/exercises/${editingExercise.id}`
        : '/api/exercises';
      const method = editingExercise ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchExercises();
        setShowModal(false);
        setEditingExercise(null);
        setFormData({ title: '', description: '', category: '', imageUrl: '', videoUrl: '' });
      }
    } catch (error) {
      console.error('Error saving exercise:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({
      title: exercise.title,
      description: exercise.description || '',
      category: exercise.category || '',
      imageUrl: exercise.imageUrl || '',
      videoUrl: exercise.videoUrl || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar este ejercicio?')) return;

    try {
      const response = await fetch(`/api/exercises/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchExercises();
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingExercise(null);
    setFormData({ title: '', description: '', category: '', imageUrl: '', videoUrl: '' });
  };

  return (
    <div className="min-h-screen bg-sand">
      <header className="bg-petrol text-sand py-4 px-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="text-2xl">│</span>
            <span className="font-serif text-xl">Eje Fisioterapia</span>
            <span className="text-sm opacity-70">· Ejercicios</span>
          </div>
          <div className="flex gap-4">
            <a
              href="/admin/ejercicios/asignar"
              className="text-sm hover:text-amber transition-colors"
            >
              Asignar pautas
            </a>
            <a href="/admin" className="text-sm hover:text-amber transition-colors">
              ← Volver al dashboard
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-serif text-petrol">Biblioteca de Ejercicios</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors font-medium"
          >
            + Nuevo ejercicio
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center text-ink-light py-8">
              Cargando...
            </div>
          ) : exercises.length === 0 ? (
            <div className="col-span-full text-center text-ink-light py-8">
              <p className="mb-2">💪 No hay ejercicios registrados</p>
              <p className="text-sm">Crea el primer ejercicio para empezar a asignar pautas</p>
            </div>
          ) : (
            exercises.map((exercise) => (
              <div key={exercise.id} className="bg-white p-6 rounded border-2 border-petrol/20">
                <div className="mb-4">
                  {exercise.imageUrl ? (
                    <img
                      src={exercise.imageUrl}
                      alt={exercise.title}
                      className="w-full h-32 object-cover rounded"
                    />
                  ) : (
                    <div className="w-full h-32 bg-sand rounded flex items-center justify-center">
                      <span className="text-4xl">💪</span>
                    </div>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-petrol mb-2">{exercise.title}</h3>

                {exercise.category && (
                  <div className="text-sm text-ink-light mb-2">
                    <span className="px-2 py-1 bg-sand rounded">{exercise.category}</span>
                  </div>
                )}

                {exercise.description && (
                  <p className="text-sm text-ink-light mb-4 line-clamp-3">
                    {exercise.description}
                  </p>
                )}

                <div className="flex gap-2">
                  {exercise.videoUrl && (
                    <a
                      href={exercise.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 px-3 py-2 bg-amber text-petrol rounded hover:bg-amber-dark transition-colors text-sm text-center"
                    >
                      ▶ Ver video
                    </a>
                  )}
                  <button
                    onClick={() => handleEdit(exercise)}
                    className="px-3 py-2 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors text-sm"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(exercise.id)}
                    className="px-3 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-serif text-petrol mb-4">
              {editingExercise ? 'Editar ejercicio' : 'Nuevo ejercicio'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-petrol mb-2">
                  Título
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded border border-petrol/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-petrol mb-2">
                  Categoría
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 rounded border border-petrol/20"
                >
                  <option value="">Sin categoría</option>
                  <option value="Movilidad">Movilidad</option>
                  <option value="Fortalecimiento">Fortalecimiento</option>
                  <option value="Estiramientos">Estiramientos</option>
                  <option value="Equilibrio">Equilibrio</option>
                  <option value="Respiración">Respiración</option>
                  <option value="Postura">Postura</option>
                </select>
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

              <div>
                <label className="block text-sm font-medium text-petrol mb-2">
                  URL de imagen (opcional)
                </label>
                <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded border border-petrol/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-petrol mb-2">
                  URL de video (opcional)
                </label>
                <input
                  type="url"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full px-4 py-2 rounded border border-petrol/20"
                />
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : editingExercise ? 'Actualizar' : 'Crear'}
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
