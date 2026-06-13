'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddSessionsButton({ voucherId }: { voucherId: number }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    const input = prompt('¿Cuántas sesiones quieres añadir a este bono?', '1');
    if (input === null) return;
    const add = parseInt(input, 10);
    if (isNaN(add) || add <= 0) {
      alert('Introduce un número válido.');
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/vouchers/${voucherId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ add }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo actualizar');
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al añadir sesiones');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className="px-3 py-1 bg-amber text-petrol rounded hover:bg-amber-dark transition-colors text-sm disabled:opacity-50"
      title="Añadir sesiones"
    >
      +
    </button>
  );
}
