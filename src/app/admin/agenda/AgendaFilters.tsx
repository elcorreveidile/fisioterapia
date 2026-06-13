'use client';

import { useRouter } from 'next/navigation';

type Prof = { id: number; name: string; surname: string };

// Controles interactivos de la agenda (fecha y profesional).
// Se extraen a un Client Component porque el Server Component no puede
// llevar manejadores de eventos (onChange).
export default function AgendaFilters({
  date,
  view,
  professional,
  professionals,
}: {
  date: string;
  view: string;
  professional?: number;
  professionals: Prof[];
}) {
  const router = useRouter();

  const go = (next: Partial<{ date: string; professional: string }>) => {
    const params = new URLSearchParams();
    params.set('view', view);
    params.set('date', next.date ?? date);
    const prof = next.professional ?? (professional ? String(professional) : '');
    if (prof && prof !== 'all') params.set('professional', prof);
    router.push(`/admin/agenda?${params.toString()}`);
  };

  return (
    <>
      {/* Selector de fecha */}
      <div>
        <label className="block text-sm font-medium text-petrol mb-2">Fecha</label>
        <input
          type="date"
          defaultValue={date}
          onChange={(e) => go({ date: e.target.value })}
          className="w-full px-4 py-2 rounded border border-petrol/20"
        />
      </div>

      {/* Selector de profesional */}
      <div>
        <label className="block text-sm font-medium text-petrol mb-2">Profesional</label>
        <select
          defaultValue={professional ?? 'all'}
          onChange={(e) => go({ professional: e.target.value })}
          className="w-full px-4 py-2 rounded border border-petrol/20"
        >
          <option value="all">Todos los profesionales</option>
          {professionals.map((prof) => (
            <option key={prof.id} value={prof.id}>
              {prof.name} {prof.surname}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
