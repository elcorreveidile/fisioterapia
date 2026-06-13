'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Patient = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  generalNotes: string | null;
};

export default function EditPatientButton({ patient }: { patient: Patient }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: patient.name,
    email: patient.email,
    phone: patient.phone ?? '',
    generalNotes: patient.generalNotes ?? '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/patients/${patient.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo guardar');
      }
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="px-4 py-2 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors"
      >
        Editar
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
          onClick={() => !saving && setOpen(false)}
        >
          <div
            className="bg-white rounded-lg w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-serif text-petrol mb-4">Editar paciente</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-petrol mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-2 rounded border border-petrol/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-petrol mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-4 py-2 rounded border border-petrol/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-petrol mb-1">Teléfono</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-4 py-2 rounded border border-petrol/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-petrol mb-1">
                  Notas generales
                </label>
                <textarea
                  rows={3}
                  value={form.generalNotes}
                  onChange={(e) => setForm({ ...form, generalNotes: e.target.value })}
                  className="w-full px-4 py-2 rounded border border-petrol/20"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded border border-petrol/20 text-petrol hover:bg-sand transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors disabled:opacity-50"
                >
                  {saving ? 'Guardando…' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
