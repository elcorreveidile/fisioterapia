'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cancelBooking } from '@/app/actions/bookings';

export default function CancelBookingButton({ token }: { token: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const onClick = async () => {
    if (!confirm('¿Seguro que quieres cancelar esta cita?')) return;
    setBusy(true);
    try {
      await cancelBooking(token);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'No se pudo cancelar la cita');
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="text-xs px-3 py-1 rounded border border-red-300 text-red-700 hover:bg-red-50 transition-colors disabled:opacity-50"
    >
      {busy ? 'Cancelando…' : 'Cancelar'}
    </button>
  );
}
