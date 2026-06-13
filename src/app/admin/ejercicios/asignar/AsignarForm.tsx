'use client';

import { useState } from 'react';

type Patient = { id: number; name: string };
type Exercise = { id: number; title: string; category: string | null };
type Professional = { id: number; name: string; surname: string };

type Item = {
  exerciseId: string;
  series: string;
  repetitions: string;
  frequency: string;
  observations: string;
};

const emptyItem: Item = {
  exerciseId: '',
  series: '3',
  repetitions: '10-12',
  frequency: '2x al día',
  observations: '',
};

export default function AsignarForm({
  patients,
  exercises,
  professionals,
}: {
  patients: Patient[];
  exercises: Exercise[];
  professionals: Professional[];
}) {
  const [patientId, setPatientId] = useState('');
  const [professionalId, setProfessionalId] = useState(
    professionals[0] ? String(professionals[0].id) : ''
  );
  const [items, setItems] = useState<Item[]>([{ ...emptyItem }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; count: number } | null>(null);
  const [copied, setCopied] = useState(false);

  const updateItem = (i: number, patch: Partial<Item>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }]);
  const removeItem = (i: number) =>
    setItems((prev) => (prev.length > 1 ? prev.filter((_, idx) => idx !== i) : prev));

  const canSubmit =
    patientId &&
    professionalId &&
    items.length > 0 &&
    items.every((it) => it.exerciseId && it.series && it.repetitions && it.frequency);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!canSubmit) {
      setError('Completa paciente, profesional y al menos un ejercicio con todos sus campos.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/patient-exercises', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: Number(patientId),
          professionalId: Number(professionalId),
          items: items.map((it) => ({
            exerciseId: Number(it.exerciseId),
            series: Number(it.series),
            repetitions: it.repetitions.trim(),
            frequency: it.frequency.trim(),
            observations: it.observations.trim() || undefined,
          })),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo asignar la pauta');
      }
      const data = await res.json();
      setResult({ url: data.url, count: data.count });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
    setPatientId('');
    setItems([{ ...emptyItem }]);
    setCopied(false);
  };

  if (result) {
    const fullUrl =
      typeof window !== 'undefined' ? `${window.location.origin}${result.url}` : result.url;
    return (
      <div className="bg-white p-8 rounded border-2 border-green-600">
        <h2 className="text-xl font-serif text-petrol mb-2">✅ Pauta asignada</h2>
        <p className="text-sm text-ink-light mb-4">
          {result.count} ejercicio{result.count !== 1 ? 's' : ''} en un enlace para el paciente:
        </p>
        <div className="flex gap-2 mb-6">
          <input
            readOnly
            value={fullUrl}
            className="flex-1 px-4 py-2 rounded border border-petrol/20 bg-sand text-sm"
          />
          <button
            type="button"
            onClick={() => {
              navigator.clipboard?.writeText(fullUrl);
              setCopied(true);
            }}
            className="px-4 py-2 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors text-sm"
          >
            {copied ? 'Copiado ✓' : 'Copiar'}
          </button>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-amber text-petrol rounded hover:bg-amber-dark transition-colors text-sm"
          >
            Abrir
          </a>
        </div>
        <button
          type="button"
          onClick={reset}
          className="text-sm text-petrol hover:text-amber transition-colors"
        >
          ← Asignar otra pauta
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded border-2 border-petrol/20 grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-petrol mb-2">Paciente</label>
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
          <label className="block text-sm font-medium text-petrol mb-2">Profesional</label>
          <select
            value={professionalId}
            onChange={(e) => setProfessionalId(e.target.value)}
            className="w-full px-4 py-2 rounded border border-petrol/20"
          >
            {professionals.map((pr) => (
              <option key={pr.id} value={pr.id}>
                {pr.name} {pr.surname}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="bg-white p-6 rounded border-2 border-petrol/20">
            <div className="flex items-center justify-between mb-4">
              <span className="font-medium text-petrol">Ejercicio {i + 1}</span>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Quitar
                </button>
              )}
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-petrol mb-1">Ejercicio</label>
                <select
                  value={item.exerciseId}
                  onChange={(e) => updateItem(i, { exerciseId: e.target.value })}
                  className="w-full px-4 py-2 rounded border border-petrol/20"
                >
                  <option value="">Selecciona un ejercicio…</option>
                  {exercises.map((ex) => (
                    <option key={ex.id} value={ex.id}>
                      {ex.title}
                      {ex.category ? ` · ${ex.category}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-petrol mb-1">Series</label>
                <input
                  type="number"
                  min={1}
                  value={item.series}
                  onChange={(e) => updateItem(i, { series: e.target.value })}
                  className="w-full px-4 py-2 rounded border border-petrol/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-petrol mb-1">Repeticiones</label>
                <input
                  type="text"
                  placeholder="10-12 o 30 segundos"
                  value={item.repetitions}
                  onChange={(e) => updateItem(i, { repetitions: e.target.value })}
                  className="w-full px-4 py-2 rounded border border-petrol/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-petrol mb-1">Frecuencia</label>
                <input
                  type="text"
                  placeholder="2x al día"
                  value={item.frequency}
                  onChange={(e) => updateItem(i, { frequency: e.target.value })}
                  className="w-full px-4 py-2 rounded border border-petrol/20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-petrol mb-1">
                  Observaciones (opcional)
                </label>
                <input
                  type="text"
                  value={item.observations}
                  onChange={(e) => updateItem(i, { observations: e.target.value })}
                  className="w-full px-4 py-2 rounded border border-petrol/20"
                />
              </div>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="px-4 py-2 bg-sand text-petrol rounded border border-petrol/20 hover:bg-sand-dark transition-colors text-sm"
        >
          + Añadir otro ejercicio
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-3 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors font-medium disabled:opacity-50"
        >
          {submitting ? 'Asignando…' : 'Asignar pauta'}
        </button>
      </div>
    </form>
  );
}
