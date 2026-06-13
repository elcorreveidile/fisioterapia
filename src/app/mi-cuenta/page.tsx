'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MiCuentaPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await fetch('/api/patient-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
    } catch {
      // Da igual el resultado: mostramos siempre el mismo mensaje.
    } finally {
      setStatus('sent');
    }
  };

  return (
    <div className="min-h-screen hero-surface flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2">
            <span className="text-2xl text-petrol">│</span>
            <span className="font-serif text-xl font-semibold text-petrol">Eje Fisioterapia</span>
          </Link>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg">
          {status === 'sent' ? (
            <div className="text-center">
              <p className="text-3xl mb-2">📧</p>
              <h1 className="font-serif text-xl text-petrol mb-2">Revisa tu correo</h1>
              <p className="text-ink-light text-sm">
                Si <strong>{email}</strong> corresponde a un paciente, te hemos enviado un
                enlace para acceder a tu área. Revisa también la carpeta de spam.
              </p>
              <button
                type="button"
                onClick={() => setStatus('idle')}
                className="mt-6 text-sm text-petrol hover:text-amber transition-colors font-medium"
              >
                Usar otro email
              </button>
            </div>
          ) : (
            <>
              <h1 className="font-serif text-xl text-petrol mb-1 text-center">Área de paciente</h1>
              <p className="text-ink-light text-sm mb-6 text-center">
                Introduce tu email y te enviamos un enlace para ver tus citas, bonos y pautas.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-petrol mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="w-full px-4 py-3 rounded border border-petrol/20 focus:border-petrol focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full bg-petrol text-sand px-6 py-3 rounded hover:bg-petrol-dark transition-colors font-medium disabled:opacity-50"
                >
                  {status === 'sending' ? 'Enviando…' : 'Enviarme el enlace'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center mt-4 text-sm text-ink-light">
          <Link href="/" className="text-petrol hover:text-amber transition-colors">
            ← Volver a la web
          </Link>
        </p>
      </div>
    </div>
  );
}
