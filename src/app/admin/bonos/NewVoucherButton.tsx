'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Patient = { id: number; name: string };

export default function NewVoucherButton({ patients }: { patients: Patient[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patientId, setPatientId] = useState('');
  const [type, setType] = useState<'5' | '10'>('5');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!patientId) {
      setError('Selecciona un paciente.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/vouchers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ patientId: Number(patientId), type }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo crear el bono');
      }
      setOpen(false);
      setPatientId('');
      setType('5');
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
        className="px-6 py-3 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors font-medium"
      >
        + Nuevo bono
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
          onClick={() => !saving && setOpen(false)}
        >
          <div
            className="bg-white rounded-lg w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-serif text-petrol mb-4">Nuevo bono</h2>
            {patients.length === 0 ? (
              <p className="text-sm text-ink-light">
                No hay pacientes. Crea un paciente antes de asignar un bono.
              </p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-petrol mb-1">Paciente</label>
                  <select
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    className="w-full px-4 py-2 rounded border border-petrol/20"
                  >
                    <option value="">Selecciona un paciente…</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-petrol mb-1">Tipo de bono</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as '5' | '10')}
                    className="w-full px-4 py-2 rounded border border-petrol/20"
                  >
                    <option value="5">Bono de 5 sesiones</option>
                    <option value="10">Bono de 10 sesiones</option>
                  </select>
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
                    {saving ? 'Creando…' : 'Crear bono'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
