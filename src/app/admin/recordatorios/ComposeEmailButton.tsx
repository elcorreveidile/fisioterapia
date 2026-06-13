'use client';

import { useState } from 'react';

type Patient = { id: number; name: string; email: string };

export default function ComposeEmailButton({ patients }: { patients: Patient[] }) {
  const [open, setOpen] = useState(false);
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const reset = () => {
    setTo('');
    setSubject('');
    setMessage('');
    setStatus('idle');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/admin/emails', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject, message }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo enviar');
      }
      setStatus('sent');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Error al enviar');
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => {
          reset();
          setOpen(true);
        }}
        className="px-6 py-3 bg-amber text-petrol rounded hover:bg-amber-dark transition-colors font-medium"
      >
        ✉️ Enviar email
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4"
          onClick={() => status !== 'sending' && setOpen(false)}
        >
          <div
            className="bg-white rounded-lg w-full max-w-lg p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {status === 'sent' ? (
              <div className="text-center">
                <p className="text-2xl mb-2">✅</p>
                <h2 className="font-serif text-xl text-petrol mb-2">Email enviado</h2>
                <div className="flex justify-center gap-2 mt-4">
                  <button
                    type="button"
                    onClick={reset}
                    className="px-4 py-2 rounded border border-petrol/20 text-petrol hover:bg-sand transition-colors"
                  >
                    Enviar otro
                  </button>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="px-4 py-2 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="font-serif text-xl text-petrol">Enviar email</h2>

                <div>
                  <label className="block text-sm font-medium text-petrol mb-1">
                    Paciente (opcional)
                  </label>
                  <select
                    onChange={(e) => {
                      const p = patients.find((x) => String(x.id) === e.target.value);
                      if (p) setTo(p.email);
                    }}
                    defaultValue=""
                    className="w-full px-4 py-2 rounded border border-petrol/20"
                  >
                    <option value="">Elegir un paciente para autocompletar…</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} · {p.email}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-petrol mb-1">Para (email)</label>
                  <input
                    type="email"
                    required
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full px-4 py-2 rounded border border-petrol/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-petrol mb-1">Asunto</label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-4 py-2 rounded border border-petrol/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-petrol mb-1">Mensaje</label>
                  <textarea
                    required
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-4 py-2 rounded border border-petrol/20"
                  />
                </div>

                {status === 'error' && <p className="text-sm text-red-600">{error}</p>}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    disabled={status === 'sending'}
                    className="px-4 py-2 rounded border border-petrol/20 text-petrol hover:bg-sand transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={status === 'sending'}
                    className="px-4 py-2 bg-petrol text-sand rounded hover:bg-petrol-dark transition-colors disabled:opacity-50"
                  >
                    {status === 'sending' ? 'Enviando…' : 'Enviar'}
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
