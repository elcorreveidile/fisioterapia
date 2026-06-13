'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Patient = { id: number; name: string };
type Professional = { id: number; name: string; surname: string };
type Service = { id: number; name: string; duration: number };

function today() {
  return new Date().toISOString().slice(0, 10);
}

export default function NuevaCitaForm({
  patients,
  professionals,
  services,
  defaultDate,
}: {
  patients: Patient[];
  professionals: Professional[];
  services: Service[];
  defaultDate?: string;
}) {
  const router = useRouter();
  const [patientId, setPatientId] = useState('');
  const [professionalId, setProfessionalId] = useState(String(professionals[0]?.id ?? ''));
  const [serviceId, setServiceId] = useState(String(services[0]?.id ?? ''));
  const [date, setDate] = useState(defaultDate || today());
  const [time, setTime] = useState('09:00');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!patientId || !professionalId || !serviceId || !date || !time) {
      setError('Completa todos los campos.');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: Number(patientId),
          professionalId: Number(professionalId),
          serviceId: Number(serviceId),
          date,
          time,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo crear la cita');
      }
      router.push(`/admin/agenda?date=${date}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado');
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded border-2 border-petrol/20 space-y-4">
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

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-petrol mb-1">Profesional</label>
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
        <div>
          <label className="block text-sm font-medium text-petrol mb-1">Servicio</label>
          <select
            value={serviceId}
            onChange={(e) => setServiceId(e.target.value)}
            className="w-full px-4 py-2 rounded border border-petrol/20"
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.duration} min)
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-petrol mb-1">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2 rounded border border-petrol/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-petrol mb-1">Hora de inicio</label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-2 rounded border border-petrol/20"
          />
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <a
          href="/admin/agenda"
          className="px-4 py-2 rounded border border-petrol/20 text-petrol hover:bg-sand transition-colors"
        >
          Cancelar
        </a>
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors font-medium disabled:opacity-50"
        >
          {saving ? 'Creando…' : 'Crear cita'}
        </button>
      </div>
    </form>
  );
}
