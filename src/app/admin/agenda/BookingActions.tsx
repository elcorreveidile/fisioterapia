'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type Booking = {
  id: number;
  status: string;
  dateLabel: string;
  timeLabel: string;
  patientName: string;
  patientPhone: string | null;
  patientEmail: string;
  serviceName: string;
  serviceDuration: number;
  professionalName: string;
};

const STATUSES: { value: string; label: string }[] = [
  { value: 'pending', label: 'Pendiente' },
  { value: 'confirmed', label: 'Confirmada' },
  { value: 'completed', label: 'Completada' },
  { value: 'cancelled', label: 'Cancelada' },
  { value: 'no_show', label: 'No show' },
];

export default function BookingActions({ booking }: { booking: Booking }) {
  const router = useRouter();
  const [view, setView] = useState(false);
  const [edit, setEdit] = useState(false);
  const [status, setStatus] = useState(booking.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/bookings/${booking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo actualizar');
      }
      setEdit(false);
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
        onClick={() => setView(true)}
        className="px-3 py-1 bg-white/50 rounded hover:bg-white transition-colors text-sm"
        title="Ver detalles"
      >
        👁️
      </button>
      <button
        onClick={() => {
          setStatus(booking.status);
          setEdit(true);
        }}
        className="px-3 py-1 bg-white/50 rounded hover:bg-white transition-colors text-sm"
        title="Editar estado"
      >
        ✏️
      </button>

      {view && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
          onClick={() => setView(false)}
        >
          <div
            className="bg-white rounded-lg w-full max-w-md p-6 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-serif text-petrol mb-4">Detalle de la cita</h2>
            <dl className="space-y-2 text-sm text-ink-light">
              <div><dt className="font-medium text-petrol inline">Paciente:</dt> {booking.patientName}</div>
              <div><dt className="font-medium text-petrol inline">Contacto:</dt> {booking.patientEmail}{booking.patientPhone ? ` · ${booking.patientPhone}` : ''}</div>
              <div><dt className="font-medium text-petrol inline">Servicio:</dt> {booking.serviceName} ({booking.serviceDuration} min)</div>
              <div><dt className="font-medium text-petrol inline">Profesional:</dt> {booking.professionalName}</div>
              <div><dt className="font-medium text-petrol inline">Fecha:</dt> {booking.dateLabel}</div>
              <div><dt className="font-medium text-petrol inline">Horario:</dt> {booking.timeLabel}</div>
            </dl>
            <div className="flex justify-end mt-6">
              <button
                onClick={() => setView(false)}
                className="px-4 py-2 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {edit && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
          onClick={() => !saving && setEdit(false)}
        >
          <div
            className="bg-white rounded-lg w-full max-w-sm p-6 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-serif text-petrol mb-1">Cambiar estado</h2>
            <p className="text-sm text-ink-light mb-4">{booking.patientName} · {booking.timeLabel}</p>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-2 rounded border border-petrol/20"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setEdit(false)}
                disabled={saving}
                className="px-4 py-2 rounded border border-petrol/20 text-petrol hover:bg-sand transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={saving}
                className="px-4 py-2 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors disabled:opacity-50"
              >
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
