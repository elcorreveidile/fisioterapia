'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SendEmailButton({
  emailId,
  label,
  variant = 'send',
}: {
  emailId: number;
  label: string;
  variant?: 'send' | 'retry';
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/scheduled-emails/${emailId}`, { method: 'PATCH' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo enviar');
      }
      router.refresh();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al enviar');
    } finally {
      setBusy(false);
    }
  };

  const cls =
    variant === 'retry'
      ? 'bg-red-600 text-white hover:bg-red-800'
      : 'bg-petrol text-sand hover:bg-petrol-dark';

  return (
    <button
      onClick={handleClick}
      disabled={busy}
      className={`px-3 py-1 rounded transition-colors text-sm disabled:opacity-50 ${cls}`}
    >
      {busy ? '…' : label}
    </button>
  );
}
