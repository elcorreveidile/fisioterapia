'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError('');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'No se pudo enviar el mensaje');
      }
      setStatus('sent');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Error al enviar');
    }
  };

  if (status === 'sent') {
    return (
      <div className="bg-white p-8 rounded border-2 border-green-600 text-center">
        <p className="text-2xl mb-2">✅</p>
        <h3 className="font-serif text-xl text-petrol mb-2">¡Mensaje enviado!</h3>
        <p className="text-ink-light text-sm mb-4">
          Gracias por escribirnos. Te responderemos lo antes posible.
        </p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="text-petrol hover:text-amber transition-colors text-sm font-medium"
        >
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  const sending = status === 'sending';

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded border border-petrol/15 space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-petrol mb-1">Nombre</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full px-4 py-2 rounded border border-petrol/20 focus:border-petrol focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-petrol mb-1">Teléfono (opcional)</label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-4 py-2 rounded border border-petrol/20 focus:border-petrol focus:outline-none"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-petrol mb-1">Email</label>
        <input
          type="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          className="w-full px-4 py-2 rounded border border-petrol/20 focus:border-petrol focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-petrol mb-1">Mensaje</label>
        <textarea
          required
          rows={5}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="w-full px-4 py-2 rounded border border-petrol/20 focus:border-petrol focus:outline-none"
        />
      </div>

      {status === 'error' && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={sending}
        className="bg-petrol text-sand px-6 py-3 rounded hover:bg-petrol-dark transition-colors font-medium disabled:opacity-50"
      >
        {sending ? 'Enviando…' : 'Enviar mensaje'}
      </button>
    </form>
  );
}
